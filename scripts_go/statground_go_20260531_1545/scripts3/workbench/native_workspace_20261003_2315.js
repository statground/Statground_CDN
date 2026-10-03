(function (global) {
  'use strict';
  const LIMITS = Object.freeze({ bytes: 2097152, rows: 5000, columns: 50, horizon: 12 });
  const TTL = 30 * 60 * 1000;
  const PREFIX = 'statground.native-workspace.v1.';
  const numericPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const fail = code => { const error = new Error(code); error.code = code; throw error; };
  const bytes = text => new TextEncoder().encode(text).length;
  const numeric = value => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value !== 'string' || !numericPattern.test(value.trim())) return null;
    const result = Number(value.trim());
    return Number.isFinite(result) ? result : null;
  };
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
  function safeURL(value) {
    try { const url = new URL(String(value)); return url.protocol === 'https:' ? url.href : ''; }
    catch (_) { return ''; }
  }
  function boundedText(text) {
    if (typeof text !== 'string' || bytes(text) > LIMITS.bytes) fail('invalidData');
    return text.replace(/^\uFEFF/, '');
  }
  function normalizeDataset(input, numericTokens) {
    if (!input || !Array.isArray(input.columns) || !Array.isArray(input.rows)) fail('invalidData');
    const columns = input.columns.map(value => String(value).trim());
    if (!columns.length || columns.length > LIMITS.columns || new Set(columns).size !== columns.length ||
        columns.some(value => !value || value.length > 256) || input.rows.length > LIMITS.rows) fail('invalidData');
    const rawRows = [];
    const rows = input.rows.map((row, index) => {
      if (!Array.isArray(row) || row.length !== columns.length) fail('invalidData');
      const raw = [];
      const result = row.map((value, column) => {
        if (numericTokens && typeof value === 'string' && numericTokens.has(value)) {
          const token = numericTokens.get(value), number = Number(token);
          if (!Number.isFinite(number)) fail('invalidData');
          raw.push(token); return number;
        }
        if (value !== null && !['string', 'number', 'boolean'].includes(typeof value)) fail('invalidData');
        if (typeof value === 'number' && !Number.isFinite(value)) fail('invalidData');
        const previous = input.rawRows?.[index]?.[column];
        raw.push(previous === null || typeof previous === 'string' ? previous : value === null ? null : String(value));
        return value;
      });
      rawRows.push(raw); return result;
    });
    const source = Object.create(null);
    for (const key of ['provider', 'url', 'retrievedAt', 'updatedAt', 'indicator', 'unit', 'definition', 'filename']) {
      const value = input.source?.[key];
      if (value !== undefined && value !== null) source[key] = String(value).slice(0, 8192);
    }
    if (typeof input.source?.dataProviders === 'string') source.dataProviders = input.source.dataProviders.slice(0, 8192);
    else if (Array.isArray(input.source?.dataProviders) && input.source.dataProviders.length <= 20) source.dataProviders = JSON.parse(JSON.stringify(input.source.dataProviders));
    if (typeof input.source?.captured === 'boolean') source.captured = input.source.captured;
    return { schema: 'statground.workspace.dataset.v1', revision: typeof input.revision === 'string' && /^[a-f0-9-]{36}$/.test(input.revision) ? input.revision : global.crypto.randomUUID(),
      title: String(input.title || '').slice(0, 256), columns, rows, rawRows, source };
  }
  function parseDelimited(text, delimiter) {
    text = boundedText(text);
    if (delimiter === undefined) {
      let quoted = false, commas = 0, tabs = 0;
      for (let index = 0; index < text.length; index++) {
        const character = text[index];
        if (character === '"') {
          if (quoted && text[index + 1] === '"') index++;
          else quoted = !quoted;
        } else if (!quoted) {
          if (character === '\n' || character === '\r') break;
          if (character === ',') commas++;
          if (character === '\t') tabs++;
        }
      }
      delimiter = tabs > commas ? '\t' : ',';
    }
    if (delimiter !== ',' && delimiter !== '\t') fail('invalidData');
    const records = [];
    let row = [], cell = '', quoted = false, closed = false;
    const pushCell = () => { row.push(cell); cell = ''; closed = false; if (row.length > LIMITS.columns) fail('invalidData'); };
    const pushRow = () => {
      pushCell();
      if (row.some(value => value !== '')) records.push(row);
      row = [];
      if (records.length > LIMITS.rows + 1) fail('invalidData');
    };
    for (let index = 0; index < text.length; index++) {
      const character = text[index];
      if (quoted) {
        if (character === '"') {
          if (text[index + 1] === '"') { cell += '"'; index++; }
          else { quoted = false; closed = true; }
        } else cell += character;
      } else if (character === delimiter) pushCell();
      else if (character === '\n' || character === '\r') {
        if (character === '\r' && text[index + 1] === '\n') index++;
        pushRow();
      } else if (character === '"') {
        if (cell.length || closed) fail('invalidData');
        quoted = true;
      } else {
        if (closed) fail('invalidData');
        cell += character;
      }
    }
    if (quoted) fail('invalidData');
    if (cell.length || row.length || closed) pushRow();
    if (!records.length) fail('invalidData');
    const columns = records.shift().map((value, index) => value.trim() || 'Column ' + (index + 1));
    const rawRows = records.map(record => record.map(value => value));
    const rows = records.map(record => {
      if (record.length !== columns.length) fail('invalidData');
      // CSV cells are lexical text, including blanks and leading-zero IDs.
      // Numeric coercion occurs only inside an explicitly selected analysis.
      return record.slice();
    });
    return normalizeDataset({ columns, rows, rawRows });
  }
  function parseJSON(text) {
    text = boundedText(text);
    let parsed;
    try { parsed = JSON.parse(text); } catch (_) { fail('invalidData'); }
    // Preserve numeric lexical precision independently of IEEE754 values used
    // for computation. JSON downloads write these validated original tokens.
    let prefix = '__sg_number_';
    while (text.includes(prefix)) prefix += '_';
    const tokens = new Map();
    let protectedText = '', inString = false, escaped = false;
    for (let index = 0; index < text.length; index++) {
      const character = text[index];
      if (inString) {
        protectedText += character;
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === '"') inString = false;
      } else if (character === '"') { inString = true; protectedText += character; }
      else if (character === '-' || /\d/.test(character)) {
        const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(text.slice(index));
        if (!match) fail('invalidData');
        const key = prefix + tokens.size;
        tokens.set(key, match[0]); protectedText += JSON.stringify(key); index += match[0].length - 1;
      } else protectedText += character;
    }
    const lexical = JSON.parse(protectedText);
    if (Array.isArray(parsed)) {
      if (parsed.length > LIMITS.rows || parsed.some(row => !row || typeof row !== 'object' || Array.isArray(row))) fail('invalidData');
      const columns = [...new Set(parsed.flatMap(row => Object.keys(row)))];
      if (columns.length > LIMITS.columns) fail('invalidData');
      return normalizeDataset({ columns, rows: lexical.map(row => columns.map(column => own(row, column) ? row[column] : null)) }, tokens);
    }
    if (parsed?.dataset && lexical?.dataset) return normalizeDataset({ ...parsed.dataset, rows: lexical.dataset.rows }, tokens);
    if (!parsed || !Array.isArray(parsed.columns) || !Array.isArray(parsed.rows)) fail('invalidData');
    return normalizeDataset({ ...parsed, rows: lexical.rows }, tokens);
  }
  function parseInput(text, filename) {
    const trimmed = boundedText(text).trimStart();
    return /\.json$/i.test(filename || '') || /^[\[{]/.test(trimmed) ? parseJSON(text) : parseDelimited(text, /\.tsv$/i.test(filename || '') ? '\t' : undefined);
  }
  function finiteResult(result) {
    for (const value of Object.values(result)) {
      if (typeof value === 'number' && !Number.isFinite(value)) fail('invalidData');
      if (value && typeof value === 'object') finiteResult(value);
    }
    return result;
  }
  function summary(values) {
    const available = values.map(numeric).filter(value => value !== null);
    const sorted = available.slice().sort((left, right) => left - right);
    let mean = 0, m2 = 0;
    available.forEach((value, index) => { const difference = value - mean; mean += difference / (index + 1); m2 += difference * (value - mean); });
    const count = available.length;
    finiteResult({ mean, m2 });
    return finiteResult({ count, missing: values.length - count, mean: count ? mean : null,
      median: count ? count % 2 ? sorted[(count - 1) / 2] : sorted[count / 2 - 1] / 2 + sorted[count / 2] / 2 : null,
      sd: count > 1 ? Math.sqrt(Math.max(0, m2 / (count - 1))) : null,
      min: count ? sorted[0] : null, max: count ? sorted[count - 1] : null });
  }
  function ols(pairs) {
    const available = pairs.map(pair => [numeric(pair[0]), numeric(pair[1])]).filter(pair => pair[0] !== null && pair[1] !== null);
    const count = available.length;
    if (count < 2) return { valid: false, reason: 'insufficientData', pairs: count, missing: pairs.length - count };
    const meanX = summary(available.map(pair => pair[0])).mean, meanY = summary(available.map(pair => pair[1])).mean;
    let xx = 0, xy = 0, yy = 0;
    available.forEach(([x, y]) => { xx += (x - meanX) ** 2; xy += (x - meanX) * (y - meanY); yy += (y - meanY) ** 2; });
    finiteResult({ xx, xy, yy });
    if (!(xx > 0)) return { valid: false, reason: 'constantX', pairs: count, missing: pairs.length - count };
    const slope = xy / xx, intercept = meanY - slope * meanX;
    const sse = available.reduce((sum, [x, y]) => sum + (y - (meanY + slope * (x - meanX))) ** 2, 0);
    finiteResult({ sse });
    return finiteResult({ valid: true, pairs: count, missing: pairs.length - count, slope, intercept,
      rSquared: yy > 0 ? Math.max(0, Math.min(1, 1 - sse / yy)) : null, meanX, meanY });
  }
  function forecast(values, options) {
    const series = values.map(numeric);
    if (series.some(value => value === null) || series.length < 3) fail('insufficientData');
    const method = options?.method || 'naive';
    const horizon = Number(options?.horizon ?? 3), holdout = Number(options?.holdout ?? 1), season = Number(options?.season ?? 12);
    if (!Number.isInteger(horizon) || horizon < 1 || horizon > LIMITS.horizon ||
        !Number.isInteger(holdout) || holdout < 1 || holdout > series.length - 2 ||
        !['naive', 'drift', 'linear-trend', 'seasonal-naive'].includes(method)) fail('invalidData');
    if (method === 'seasonal-naive' && (!Number.isInteger(season) || season < 1 || season > series.length - holdout)) fail('insufficientData');
    const predict = (training, steps) => {
      const last = training[training.length - 1];
      if (method === 'naive') return Array(steps).fill(last);
      if (method === 'seasonal-naive') return Array.from({ length: steps }, (_, index) => training[training.length - season + index % season]);
      if (method === 'drift') {
        const drift = (last - training[0]) / (training.length - 1);
        return Array.from({ length: steps }, (_, index) => last + drift * (index + 1));
      }
      const fit = ols(training.map((value, index) => [index, value]));
      if (!fit.valid) fail(fit.reason);
      return Array.from({ length: steps }, (_, index) => fit.meanY + fit.slope * (training.length + index - fit.meanX));
    };
    const training = series.slice(0, -holdout), actual = series.slice(-holdout);
    const validation = predict(training, holdout);
    return finiteResult({ method, horizon, holdout, season: method === 'seasonal-naive' ? season : null,
      trainingCount: training.length, mae: actual.reduce((sum, value, index) => sum + Math.abs(value - validation[index]), 0) / holdout,
      validation: actual.map((value, index) => ({ index: training.length + index, observed: value, predicted: validation[index] })),
      predictions: predict(series, horizon) });
  }
  function csvCell(value, isNumber) {
    let text = String(value ?? '');
    if (!isNumber && /^[\s]*[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }
  function datasetCSV(input) {
    const dataset = normalizeDataset(input);
    const provenance = ['source_provider', 'source_url', 'retrieved_at', 'updated_at', 'indicator', 'unit', 'definition', 'data_providers', 'captured'];
    const keys = ['provider', 'url', 'retrievedAt', 'updatedAt', 'indicator', 'unit', 'definition', 'dataProviders', 'captured'];
    const rows = [dataset.columns.concat(provenance).map(value => csvCell(value, false)).join(',')];
    dataset.rows.forEach((row, index) => rows.push(row.map((value, column) => csvCell(dataset.rawRows[index][column], typeof value === 'number' ||
      (typeof value === 'string' && numeric(value) !== null && !/^[+-]?0\d/.test(value.trim()))))
      .concat(keys.map(key => csvCell(key === 'dataProviders' && Array.isArray(dataset.source[key]) ? JSON.stringify(dataset.source[key]) : dataset.source[key], false))).join(',')));
    return '\uFEFF' + rows.join('\r\n') + '\r\n';
  }
  function datasetJSON(input) {
    const dataset = normalizeDataset(input);
    const rows = dataset.rows.map((row, index) => '[' + row.map((value, column) => {
      const raw = dataset.rawRows[index][column];
      return typeof value === 'number' && typeof raw === 'string' && /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(raw.trim())
        ? raw.trim() : JSON.stringify(value);
    }).join(',') + ']');
    return '{"schema":' + JSON.stringify(dataset.schema) + ',"title":' + JSON.stringify(dataset.title) +
      ',"columns":' + JSON.stringify(dataset.columns) + ',"rows":[' + rows.join(',') + '],"source":' + JSON.stringify(dataset.source) + '}\n';
  }
  const risText = value => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
  function referenceRIS(references) {
    return references.map(item => {
      const fields = ['TY  - ' + (item.type === 'article' ? 'JOUR' : 'GEN'), 'TI  - ' + risText(item.title)];
      (item.authors || []).forEach(author => fields.push('AU  - ' + risText(author)));
      if (item.year) fields.push('PY  - ' + risText(item.year));
      if (item.journal) fields.push('JO  - ' + risText(item.journal));
      if (item.doi) fields.push('DO  - ' + risText(item.doi));
      if (safeURL(item.url)) fields.push('UR  - ' + safeURL(item.url));
      fields.push('ID  - ' + risText(item.id), 'ER  - ');
      return fields.join('\r\n');
    }).join('\r\n\r\n') + '\r\n';
  }
  function referenceBibTeX(references) {
    const escape = value => risText(value).replace(/[\\{}%&#_$^~]/g, character => ({
      '\\': '\\textbackslash{}', '{': '\\{', '}': '\\}', '%': '\\%', '&': '\\&', '#': '\\#',
      '_': '\\_', '$': '\\$', '^': '\\textasciicircum{}', '~': '\\textasciitilde{}',
    })[character]);
    return references.map((item, index) => {
      const key = String(item.id || 'reference' + (index + 1)).replace(/[^A-Za-z0-9_-]/g, '') || 'reference' + (index + 1);
      const fields = [['title', item.title], ['author', (item.authors || []).join(' and ')], ['year', Number(item.year) > 0 ? item.year : null], ['journal', item.journal], ['doi', item.doi], ['url', safeURL(item.url)]];
      return '@' + (item.type === 'article' ? 'article' : 'misc') + '{' + key + ',\n' + fields.filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([name, value]) => '  ' + name + ' = {' + escape(value) + '}').join(',\n') + '\n}';
    }).join('\n\n') + '\n';
  }
  global.StatgroundWorkspaceCore = Object.freeze({ LIMITS, numeric, normalizeDataset, parseDelimited, parseJSON, parseInput, summary, ols, forecast, csvCell, datasetCSV, datasetJSON, referenceRIS, referenceBibTeX, escapeHTML });
  if (!global.document) return;

  function init() {
    const root = document.querySelector('[data-native-workspace]'), configNode = document.getElementById('native-workspace-config');
    if (!root || !configNode || root.dataset.initialized) return;
    root.dataset.initialized = 'true';
    let config;
    try { config = JSON.parse(configNode.textContent); } catch (_) { return; }
    const copy = config.copy || {}, mode = config.mode || root.dataset.mode;
    const label = key => copy[key] || key;
    const methodLabel = method => label(({ 'linear-trend': 'linearTrend', 'seasonal-naive': 'seasonalNaive' })[method] || method);
    const find = name => root.querySelector('[data-' + name + ']');
    const all = name => Array.from(root.querySelectorAll('[data-' + name + ']'));
    const status = (key, detail) => { const node = find('native-status'); if (node) node.textContent = label(key) + (detail ? ' · ' + detail : ''); };
    const state = { dataset: null, analysis: null, references: null, charts: [], chartEpoch: 0, pendingDraft: null, editor: null };
    const runtimePromises = new Map();
    function store(key, value) {
      if (key === 'dataset') {
        const lexical = [];
        value.rows.forEach((row, index) => row.forEach((cell, column) => {
          const raw = value.rawRows?.[index]?.[column];
          if (typeof cell === 'number' && typeof raw === 'string' && raw !== String(cell)) lexical.push([index, column, raw]);
        }));
        value = { ...value, rawRows: undefined, numericLexemes: lexical };
      }
      const encoded = JSON.stringify({ version: 1, expiresAt: Date.now() + TTL, value });
      if (bytes(encoded) > LIMITS.bytes * 2) fail('invalidData');
      try { sessionStorage.setItem(PREFIX + key, encoded); } catch (_) { fail('error'); }
    }
    function restore(key) {
      try {
        const encoded = sessionStorage.getItem(PREFIX + key);
        if (!encoded || bytes(encoded) > LIMITS.bytes * 2) return null;
        const stored = JSON.parse(encoded);
        if (stored.version !== 1 || !(stored.expiresAt > Date.now())) { sessionStorage.removeItem(PREFIX + key); return null; }
        if (key === 'dataset') {
          const dataset = normalizeDataset(stored.value);
          for (const entry of stored.value.numericLexemes || []) {
            if (!Array.isArray(entry) || entry.length !== 3 || !Number.isInteger(entry[0]) || !Number.isInteger(entry[1]) ||
                typeof entry[2] !== 'string' || numeric(entry[2]) === null || !dataset.rawRows[entry[0]] || entry[1] < 0 || entry[1] >= dataset.columns.length) return null;
            dataset.rawRows[entry[0]][entry[1]] = entry[2];
          }
          return dataset;
        }
        return stored.value;
      } catch (_) { return null; }
    }
    function download(text, mime, filename) {
      const url = URL.createObjectURL(new Blob([text], { type: mime })), link = document.createElement('a');
      link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    const numberFormat = new Intl.NumberFormat(config.lang || 'en', { maximumSignificantDigits: 12 });
    const display = value => value === null || value === undefined ? label('missing') : typeof value === 'number' ? numberFormat.format(value) : String(value);
    function renderTable(mount, columns, rows, limit = 100) {
      if (!mount) return;
      const table = document.createElement('table'), head = document.createElement('thead'), body = document.createElement('tbody'), header = document.createElement('tr');
      columns.forEach(column => { const cell = document.createElement('th'); cell.scope = 'col'; cell.textContent = column; header.append(cell); });
      head.append(header); table.append(head, body);
      rows.slice(0, limit).forEach(row => {
        const line = document.createElement('tr');
        row.forEach(value => { const cell = document.createElement('td'); cell.textContent = display(value); line.append(cell); });
        body.append(line);
      });
      const wrapper = document.createElement('div'); wrapper.className = 'sg-native-table-scroll'; wrapper.append(table);
      const count = document.createElement('p'); count.textContent = label('rows') + ': ' + rows.length + (rows.length > limit ? ' · ' + label('preview') + ': ' + limit : '');
      mount.replaceChildren(count, wrapper);
    }
    function renderSource(source) {
      const mount = find('native-source'); if (!mount) return;
      const list = document.createElement('dl');
      const fields = [['source', source.provider], ['source', source.filename], ['source', Array.isArray(source.dataProviders) ? source.dataProviders.join('; ') : source.dataProviders], ['source', source.captured ? label('sample') : ''], ['unit', source.unit], ['indicator', source.indicator], ['retrieved', source.retrievedAt], ['updated', source.updatedAt], ['definition', source.definition]];
      fields.filter(([, value]) => value).forEach(([key, value]) => { const term = document.createElement('dt'), body = document.createElement('dd'); term.textContent = label(key); body.textContent = value; list.append(term, body); });
      if (safeURL(source.url)) { const link = document.createElement('a'); link.href = safeURL(source.url); link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = source.url; list.append(link); }
      mount.replaceChildren(list);
    }
    function populateAnalysis() {
      if (!state.dataset) return;
      const columns = state.dataset.columns;
      for (const [key, fallback] of [['analysis-x', Math.max(0, columns.indexOf('year'))], ['analysis-y', columns.indexOf('value') >= 0 ? columns.indexOf('value') : Math.min(1, columns.length - 1)], ['analysis-group', columns.indexOf('country')]]) {
        const select = find(key); if (!select) continue;
        select.replaceChildren();
        if (key === 'analysis-group') { const option = document.createElement('option'); option.value = ''; option.textContent = '—'; select.append(option); }
        columns.forEach((column, index) => { const option = document.createElement('option'); option.value = String(index); option.textContent = column; select.append(option); });
        select.value = fallback >= 0 ? String(fallback) : '';
      }
    }
    function setDataset(input, restoring = false) {
      const next = normalizeDataset(input);
      if (!next.rows.length) fail('empty');
      clearCharts();
      state.dataset = next; state.analysis = null;
      find('analysis-results')?.replaceChildren();
      all('analysis-csv').concat(all('analysis-json')).forEach(button => { button.disabled = true; });
      if (!restoring) { try { sessionStorage.removeItem(PREFIX + 'analysis'); } catch (_) {} }
      renderTable(find('native-table'), next.columns, next.rawRows);
      renderTable(find('import-preview-table'), next.columns, next.rawRows);
      renderSource(next.source); populateAnalysis();
      const empty = find('native-empty'); if (empty) empty.hidden = true;
      const results = find('native-results'); if (results) results.hidden = false;
      all('native-csv').concat(all('native-json'), all('native-analysis'), all('native-writing'), all('native-chart')).forEach(button => { button.disabled = false; });
      status('ready', label('rows') + ': ' + next.rows.length);
    }
    function bind(name, callback) {
      all(name).forEach(button => button.addEventListener('click', async event => {
        event.preventDefault();
        try { await callback(event); } catch (error) { status(copy[error.code] ? error.code : 'error'); }
      }));
    }
    async function post(path, payload) {
      const url = new URL(path, location.origin);
      if (url.origin !== location.origin || !['/data/economics/query/', '/data/literature/query/'].some(suffix => url.pathname.endsWith(suffix))) fail('error');
      const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 25000);
      try {
        const response = await fetch(url.href, { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
        const text = await response.text(); if (bytes(text) > LIMITS.bytes) fail('error');
        let data; try { data = JSON.parse(text); } catch (_) { fail('error'); }
        if (!response.ok || data.ok !== true) fail(response.status === 400 ? 'invalidData' : 'error');
        if (data.dataset) data.dataset = parseJSON(text);
        return data;
      } finally { clearTimeout(timeout); }
    }
    async function loadRuntime(kind) {
      const existing = kind === 'chart' ? global.Graflume : global.mountContentEditor;
      if (kind === 'chart' ? typeof existing?.line === 'function' : typeof existing === 'function') return existing;
      if (runtimePromises.has(kind)) return runtimePromises.get(kind);
      const promise = new Promise((resolve, reject) => {
        const url = kind === 'chart' ? config.chartRuntimeURL : config.editorRuntimeURL;
        const integrity = kind === 'chart' ? config.chartRuntimeSRI : config.editorRuntimeSRI;
        let parsed; try { parsed = new URL(url); } catch (_) { reject(new Error('error')); return; }
        if (parsed.protocol !== 'https:' || parsed.hostname !== 'cdn.jsdelivr.net' || !/@[a-f0-9]{40}\//.test(parsed.pathname) || !/^sha(?:256|384|512)-[A-Za-z0-9+/]+={0,2}$/.test(integrity || '')) { reject(new Error('error')); return; }
        if (kind === 'editor') { global.CONTENT_EDITOR_AUTOSTART = false; global.CONTENT_EDITOR_AUTOINIT = false; }
        const script = document.createElement('script'); script.src = parsed.href; script.integrity = integrity; script.crossOrigin = 'anonymous'; script.nonce = configNode.nonce;
        const timeout = setTimeout(() => { script.remove(); reject(new Error('error')); }, 15000);
        script.onload = () => {
          clearTimeout(timeout);
          const runtime = kind === 'chart' ? global.Graflume : global.mountContentEditor;
          if (kind === 'chart' ? typeof runtime?.line !== 'function' : typeof runtime !== 'function') { script.remove(); reject(new Error('error')); return; }
          resolve(runtime);
        };
        script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error('error')); };
        document.head.append(script);
      }).catch(error => { runtimePromises.delete(kind); throw error; });
      runtimePromises.set(kind, promise); return promise;
    }
    bind('economics-sample', () => setDataset(config.sampleDataset));
    const economicForm = find('economics-form');
    if (economicForm) economicForm.addEventListener('submit', async event => {
      event.preventDefault(); const button = find('economics-query'); if (button?.disabled) return;
      try {
        const countries = Array.from(find('economics-countries').selectedOptions, option => option.value);
        const start = Number(find('economics-start').value), end = Number(find('economics-end').value);
        if (!countries.length || countries.length > 5 || !Number.isInteger(start) || !Number.isInteger(end) || start < 1960 || end < start || end - start >= 60 || end > new Date().getUTCFullYear()) fail('invalidData');
        if (button) button.disabled = true; status('loading');
        const response = await post(config.dataAPI, { countries, indicator: find('economics-indicator').value, start, end });
        setDataset(response.dataset);
      } catch (error) { status(copy[error.code] ? error.code : 'error'); }
      finally { if (button) button.disabled = false; }
    });
    async function importInput() {
      const file = find('import-file')?.files?.[0];
      let text, name;
      if (file) { if (file.size > LIMITS.bytes) fail('invalidData'); text = await file.text(); name = file.name; }
      else { text = find('import-paste')?.value || ''; name = ''; }
      const dataset = parseInput(text, name);
      dataset.title = name || label('paste'); dataset.source = { provider: label(file ? 'file' : 'paste'), filename: name, retrievedAt: new Date().toISOString() };
      setDataset(dataset);
    }
    bind('import-preview', importInput);
    const importFile = find('import-file');
    if (importFile) importFile.addEventListener('change', () => { if (importFile.files?.length) status('preview'); });
    bind('native-csv', () => { if (!state.dataset) fail('dataEmpty'); download(datasetCSV(state.dataset), 'text/csv;charset=utf-8', 'statground-data.csv'); });
    bind('native-json', () => { if (!state.dataset) fail('dataEmpty'); download(datasetJSON(state.dataset), 'application/json;charset=utf-8', 'statground-data.json'); });
    function selectedReferences() {
      const selected = new Set(all('literature-select').filter(input => input.checked).map(input => input.value));
      return (state.references?.items || []).filter(item => selected.has(item.id));
    }
    function saveReferences() {
      if (!state.references) return null;
      const selected = { ...state.references, items: selectedReferences() };
      store('references', selected); return selected;
    }
    bind('native-analysis', () => {
      if (!state.dataset) fail('dataEmpty'); store('dataset', state.dataset); location.assign(config.paths.analysis);
    });
    bind('native-writing', () => {
      if (mode === 'literature') { const selected = saveReferences(); if (!selected?.items.length) fail('empty'); }
      if (state.dataset) store('dataset', state.dataset);
      if (state.analysis) store('analysis', reportAnalysis(state.analysis));
      if (!state.dataset && !state.analysis && mode !== 'literature') fail('dataEmpty');
      location.assign(config.paths.writing);
    });
    bind('native-clear', () => {
      ['dataset', 'analysis', 'references', 'draft'].forEach(key => sessionStorage.removeItem(PREFIX + key));
      state.dataset = null; state.analysis = null; state.references = null; state.pendingDraft = null;
      ['native-table', 'native-source', 'import-preview-table', 'analysis-results', 'writing-context', 'literature-results', 'native-chart-area', 'analysis-chart'].forEach(key => find(key)?.replaceChildren());
      clearCharts();
      all('analysis-csv').concat(all('analysis-json'), all('native-csv'), all('native-json'), all('native-analysis'), all('native-chart'), all('literature-ris'), all('literature-bib'), all('literature-json')).forEach(button => { button.disabled = true; });
      const empty = find('native-empty'); if (empty) empty.hidden = false;
      status('ready');
    });
    const literatureForm = find('literature-form');
    if (literatureForm) literatureForm.addEventListener('submit', async event => {
      event.preventDefault(); const button = find('literature-search'); if (button?.disabled) return;
      try {
        const query = (find('literature-query')?.value || '').trim(); if (!query || query.length > 300) fail('invalidData');
        if (button) button.disabled = true; status('loading');
        const response = await post(config.literatureAPI, /^https:\/\/doi\.org\//i.test(query) || /^10\.\d{4,9}\//.test(query) ? { doi: query, limit: 10 } : { query, limit: 10 });
        if (!Array.isArray(response.results) || response.results.length > 20) fail('error');
        state.references = { provider: response.provider, retrievedAt: response.retrievedAt, sourceURL: response.sourceURL, items: response.results };
        const mount = find('literature-results'), fragment = document.createDocumentFragment();
        response.results.forEach((item, index) => {
          const article = document.createElement('article'), heading = document.createElement('h3'), check = document.createElement('input'), title = document.createElement('label');
          check.type = 'checkbox'; check.dataset.literatureSelect = ''; check.value = item.id; check.id = 'native-reference-' + index;
          check.addEventListener('change', () => { try { saveReferences(); } catch (_) { status('error'); } });
          title.htmlFor = check.id; title.textContent = item.title; heading.append(check, title);
          const details = document.createElement('p'); details.textContent = [item.authors?.join('; '), item.year, item.journal].filter(Boolean).join(' · ');
          article.append(heading, details);
          if (item.doi) { const doi = document.createElement('p'); doi.textContent = 'DOI: ' + item.doi; article.append(doi); }
          for (const url of [...new Set([item.url, item.openAccessURL].map(safeURL).filter(Boolean))]) {
            const link = document.createElement('a'); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = url; article.append(link);
          }
          fragment.append(article);
        });
        mount?.replaceChildren(fragment);
        renderSource({ provider: response.provider, url: response.sourceURL, retrievedAt: response.retrievedAt });
        const empty = find('native-empty'); if (empty) empty.hidden = response.results.length > 0;
        all('native-writing').concat(all('literature-ris'), all('literature-bib'), all('literature-json')).forEach(button => { button.disabled = false; });
        status(response.results.length ? 'ready' : 'empty');
      } catch (error) { status(copy[error.code] ? error.code : 'error'); }
      finally { if (button) button.disabled = false; }
    });
    bind('literature-ris', () => { const selected = selectedReferences(); if (!selected.length) fail('empty'); download(referenceRIS(selected), 'application/x-research-info-systems;charset=utf-8', 'statground-references.ris'); });
    bind('literature-bib', () => { const selected = selectedReferences(); if (!selected.length) fail('empty'); download(referenceBibTeX(selected), 'application/x-bibtex;charset=utf-8', 'statground-references.bib'); });
    bind('literature-json', () => { const selected = selectedReferences(); if (!selected.length) fail('empty'); download(JSON.stringify({ schema: 'statground.workspace.references.v1', ...state.references, items: selected }, null, 2) + '\n', 'application/json;charset=utf-8', 'statground-references.json'); });
    function periodValue(value) {
      const number = numeric(value); if (number !== null) return { x: number, kind: 'number', display: value };
      if (typeof value !== 'string') return null;
      const month = /^(\d{4})-(\d{2})$/.exec(value);
      if (month && Number(month[2]) >= 1 && Number(month[2]) <= 12) return { x: Number(month[1]) * 12 + Number(month[2]) - 1, kind: 'month', display: value };
      const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
      if (date) {
        const time = Date.UTC(Number(date[1]), Number(date[2]) - 1, Number(date[3])), parsed = new Date(time);
        if (parsed.toISOString().slice(0, 10) === value) return { x: time / 86400000, kind: 'date', display: value };
      }
      return null;
    }
    function futurePeriod(series, step, index) {
      const last = series[series.length - 1], x = last.x + step * index;
      if (!Number.isFinite(x)) fail('invalidData');
      if (last.kind === 'month') return String(Math.floor(x / 12)).padStart(4, '0') + '-' + String(x % 12 + 1).padStart(2, '0');
      if (last.kind === 'date') return new Date(x * 86400000).toISOString().slice(0, 10);
      return x;
    }
    function runAnalysis() {
      if (!state.dataset) fail('dataEmpty');
      const xColumn = Number(find('analysis-x').value), yColumn = Number(find('analysis-y').value), groupValue = find('analysis-group').value;
      const groupColumn = groupValue === '' ? null : Number(groupValue), method = find('analysis-method').value;
      if (![xColumn, yColumn].every(index => Number.isInteger(index) && index >= 0 && index < state.dataset.columns.length)) fail('invalidData');
      const grouped = new Map();
      state.dataset.rows.forEach(row => { const key = groupColumn === null ? state.dataset.title || label('data') : String(row[groupColumn] ?? label('missing')); if (!grouped.has(key)) grouped.set(key, []); grouped.get(key).push(row); });
      if (grouped.size > 20) fail('invalidData');
      const groups = [];
      const parameters = { xColumn: state.dataset.columns[xColumn], yColumn: state.dataset.columns[yColumn], groupColumn: groupColumn === null ? null : state.dataset.columns[groupColumn],
        horizon: Number(find('analysis-horizon')?.value || 3), holdout: Number(find('analysis-holdout')?.value || 1), season: Number(find('analysis-season')?.value || 12) };
      grouped.forEach((rows, group) => {
        const result = { group, summary: summary(rows.map(row => row[yColumn])) };
        if (method === 'summary') { result.series = rows.map((row, index) => ({ period: row[xColumn] ?? index, value: numeric(row[yColumn]) })); }
        else if (method === 'regression') {
          result.fit = ols(rows.map(row => [row[xColumn], row[yColumn]]));
          result.series = rows.map(row => ({ period: numeric(row[xColumn]), value: numeric(row[yColumn]) })).filter(row => row.period !== null && row.value !== null).sort((left, right) => left.period - right.period);
        } else {
          const series = rows.map(row => { const period = periodValue(row[xColumn]), value = numeric(row[yColumn]); return period && value !== null ? { ...period, period: period.display, value } : null; }).filter(Boolean).sort((left, right) => left.x - right.x);
          if (series.length < 3) fail('insufficientData');
          const step = series[1].x - series[0].x;
          if (!Number.isFinite(step) || !(step > 0) || series.some((point, index) => point.kind !== series[0].kind || (index && Math.abs(point.x - series[index - 1].x - step) > Math.max(1e-8, Math.abs(step) * 1e-8)))) fail('irregularSeries');
          const fit = forecast(series.map(point => point.value), { method, ...parameters });
          result.forecast = { ...fit, validation: fit.validation.map(point => ({ ...point, period: series[point.index].period })),
            predictions: fit.predictions.map((value, index) => ({ period: futurePeriod(series, step, index + 1), value })) };
          result.series = series;
        }
        groups.push(result);
      });
      const next = { schema: 'statground.workspace.analysis.v1', datasetRevision: state.dataset.revision, method, parameters, source: state.dataset.source, datasetTitle: state.dataset.title, groups };
      store('analysis', reportAnalysis(next)); clearCharts(); renderAnalysis(next); state.analysis = next; status('ready');
      return next;
    }
    function reportAnalysis(analysis) { return { ...analysis, groups: analysis.groups.map(({ series, ...rest }) => rest) }; }
    function renderAnalysis(analysis) {
      const mount = find('analysis-results'); if (!mount) return;
      const fragment = document.createDocumentFragment();
      for (const group of analysis.groups) {
        const section = document.createElement('section'), heading = document.createElement('h3'); heading.textContent = group.group; section.append(heading);
        const summaryMount = document.createElement('div'); section.append(summaryMount);
        renderTable(summaryMount, ['count', 'missing', 'mean', 'median', 'sd', 'min', 'max'].map(label), [Object.values(group.summary)]);
        if (group.fit) {
          const fitMount = document.createElement('div'); section.append(fitMount);
          if (group.fit.valid) renderTable(fitMount, ['pairs', 'missing', 'slope', 'intercept', 'rSquared'].map(label), [[group.fit.pairs, group.fit.missing, group.fit.slope, group.fit.intercept, group.fit.rSquared]]);
          else fitMount.textContent = label(group.fit.reason);
        }
        if (group.forecast) {
          const validation = document.createElement('div'), predictions = document.createElement('div'), metric = document.createElement('p');
          metric.textContent = label('mae') + ': ' + display(group.forecast.mae) + ' · ' + label('holdout') + ': ' + group.forecast.holdout;
          section.append(metric, validation, predictions);
          renderTable(validation, ['period', 'observed', 'predicted'].map(label), group.forecast.validation.map(point => [point.period, point.observed, point.predicted]));
          renderTable(predictions, ['period', 'forecast'].map(label), group.forecast.predictions.map(point => [point.period, point.value]));
        }
        fragment.append(section);
      }
      if (analysis.method !== 'summary') {
        const assumptions = document.createElement('p'); assumptions.textContent = label(analysis.method === 'regression' ? 'association' : 'forecastAssumption'); fragment.append(assumptions);
      }
      mount.replaceChildren(fragment);
      all('analysis-csv').concat(all('analysis-json')).forEach(button => { button.disabled = false; });
    }
    function analysisCSV() {
      if (!state.analysis) fail('dataEmpty');
      const analysis = state.analysis;
      const columns = ['group', 'method', 'period', 'observed', 'predicted', 'mae', 'count', 'missing', 'mean', 'median', 'sd', 'min', 'max', 'pairs', 'slope', 'intercept', 'r_squared', 'source_url', 'retrieved_at'];
      const rows = [columns];
      analysis.groups.forEach(group => {
        const tail = [group.summary.count, group.summary.missing, group.summary.mean, group.summary.median, group.summary.sd, group.summary.min, group.summary.max,
          group.fit?.pairs, group.fit?.slope, group.fit?.intercept, group.fit?.rSquared, analysis.source.url, analysis.source.retrievedAt];
        if (group.forecast) group.forecast.predictions.forEach(point => rows.push([group.group, analysis.method, point.period, null, point.value, group.forecast.mae, ...tail]));
        else rows.push([group.group, analysis.method, null, null, null, null, ...tail]);
      });
      download('\uFEFF' + rows.map(row => row.map(value => csvCell(value, typeof value === 'number')).join(',')).join('\r\n') + '\r\n', 'text/csv;charset=utf-8', 'statground-analysis.csv');
    }
    bind('analysis-csv', analysisCSV);
    bind('analysis-json', () => { if (!state.analysis) fail('dataEmpty'); download(JSON.stringify(reportAnalysis(state.analysis), null, 2) + '\n', 'application/json;charset=utf-8', 'statground-analysis.json'); });
    bind('analysis-run', async event => {
      const button = event.currentTarget; if (button.disabled) return;
      button.disabled = true;
      try { runAnalysis(); await drawCharts(); } finally { button.disabled = false; }
    });
    function dispose(charts) { charts.forEach(({ chart }) => { try { chart.destroy?.(); } catch (_) {} }); }
    function clearCharts() {
      state.chartEpoch++; dispose(state.charts); state.charts = [];
      ['native-chart-area', 'analysis-chart'].forEach(key => find(key)?.replaceChildren());
    }
    async function drawCharts() {
      if (!state.dataset) fail('dataEmpty');
      const mount = find('analysis-chart') || find('native-chart-area'); if (!mount) return;
      const dataset = state.dataset, analysis = state.analysis, epoch = ++state.chartEpoch;
      status('loading');
      const runtime = await loadRuntime('chart');
      if (epoch !== state.chartEpoch || dataset !== state.dataset || analysis !== state.analysis) return;
      const staging = document.createElement('div'); staging.className = 'sg-native-charts'; staging.style.cssText = 'visibility:hidden;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:16px'; mount.append(staging);
      const next = [];
      try {
        const xColumn = analysis ? dataset.columns.indexOf(analysis.parameters.xColumn) : Math.max(0, dataset.columns.indexOf('year'));
        const yColumn = analysis ? dataset.columns.indexOf(analysis.parameters.yColumn) : dataset.columns.indexOf('value') >= 0 ? dataset.columns.indexOf('value') : Math.min(1, dataset.columns.length - 1);
        const groupColumn = analysis ? analysis.parameters.groupColumn === null ? -1 : dataset.columns.indexOf(analysis.parameters.groupColumn) : dataset.columns.indexOf('country');
        const grouped = new Map();
        dataset.rows.forEach(row => {
          const key = groupColumn < 0 ? dataset.title || label('data') : String(row[groupColumn] ?? label('missing'));
          if (!grouped.has(key)) grouped.set(key, []); grouped.get(key).push(row);
        });
        if (grouped.size > 20) fail('invalidData');
        const seriesFor = key => {
          const rows = grouped.get(key) || [];
          if (analysis?.method === 'regression') return rows.map(row => ({ period: numeric(row[xColumn]), value: numeric(row[yColumn]) })).filter(point => point.period !== null && point.value !== null).sort((left, right) => left.period - right.period);
          return rows.map((row, index) => ({ period: row[xColumn] ?? index, value: numeric(row[yColumn]) })).sort((left, right) => {
            const x = periodValue(left.period), y = periodValue(right.period);
            return x && y && x.kind === y.kind ? x.x - y.x : 0;
          });
        };
        const groups = analysis?.groups || Array.from(grouped.keys(), group => ({ group, series: seriesFor(group) }));
        const plans = groups.map(group => {
          const series = group.series || seriesFor(group.group), scatter = analysis?.method === 'regression';
          const rows = series.map(point => ({ period: scatter ? point.period : String(point.period), value: point.value }));
          const card = document.createElement('section'), chartMount = document.createElement('div');
          card.style.minWidth = '0'; chartMount.dataset.nativeChartMount = ''; chartMount.style.cssText = 'height:360px;min-width:0;width:100%'; card.append(chartMount); staging.append(card);
          if (group.forecast) {
            const caption = document.createElement('p'); caption.dataset.nativeChartCaption = '';
            caption.textContent = label('observed') + ': ' + series[0]?.period + '–' + series.at(-1)?.period + ' · ' + label('forecast') + ': ' + group.forecast.predictions[0]?.period + '–' + group.forecast.predictions.at(-1)?.period;
            card.append(caption);
          }
          if (rows.length > 500) {
            const caption = document.createElement('p'); caption.textContent = label('preview') + ': ≤501 / ' + rows.length; card.append(caption);
          }
          return { group, scatter, rows: rows.length > 500 ? rows.filter((_, index) => index % Math.ceil(rows.length / 500) === 0 || index === rows.length - 1) : rows, chartMount };
        });
        for (const plan of plans) {
          const options = { width: 'container', height: 'container', title: plan.group.group + (plan.group.forecast ? ' · ' + label('forecast') : ''),
            x: { field: 'period', type: plan.scatter ? 'quantitative' : 'ordinal', title: analysis?.parameters.xColumn || label('period') },
            y: { field: 'value', type: 'quantitative', title: dataset.source.unit || analysis?.parameters.yColumn || label('data') },
            locale: config.lang, mark: { point: true, options: { missing: 'gap' } },
            accessibility: { label: plan.group.group, navigation: true }, interaction: { tooltip: { trigger: 'axis', axis: 'x', fields: [{ field: 'period', label: label('period') }, { field: 'value', label: label('data'), format: 'number' }] } } };
          let chart;
          if (plan.scatter) chart = await runtime.scatter(plan.chartMount, plan.rows, { ...options, mark: { radius: 4 } });
          else if (plan.group.forecast) {
            const { mark, ...common } = options;
            const predicted = [plan.rows.at(-1), ...plan.group.forecast.predictions.map(point => ({ period: String(point.period), value: point.value }))].filter(Boolean);
            chart = await runtime.create(plan.chartMount, { ...common, legend: { visible: true, position: 'bottom' }, layers: [
              { id: 'observed', name: label('observed'), data: plan.rows, mark: { type: 'line', stroke: '#2563eb', point: true, options: { missing: 'gap' } }, x: options.x, y: options.y },
              { id: 'forecast', name: label('forecast'), data: predicted, mark: { type: 'line', stroke: '#d97706', point: true }, x: options.x, y: options.y },
            ] });
          } else chart = await runtime.line(plan.chartMount, plan.rows, options);
          next.push({ chart, mount: plan.chartMount });
        }
        if (epoch !== state.chartEpoch || dataset !== state.dataset || analysis !== state.analysis) { dispose(next); staging.remove(); return; }
        dispose(state.charts); state.charts = next;
        Array.from(mount.children).forEach(child => { if (child !== staging) child.remove(); }); staging.style.visibility = ''; status('ready');
      } catch (error) { dispose(next); staging.remove(); throw error; }
    }
    bind('native-chart', drawCharts);
    function reportHTML() {
      const question = find('writing-question')?.value || label('question'), notes = find('writing-notes')?.value || '';
      const table = (columns, rows) => '<table><thead><tr>' + columns.map(value => '<th>' + escapeHTML(value) + '</th>').join('') + '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map(value => '<td>' + escapeHTML(value === null || value === undefined ? label('missing') : value) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
      const parts = ['<h1>' + escapeHTML(question) + '</h1>', '<h2>' + escapeHTML(label('notes')) + '</h2><p>' + escapeHTML(notes).replace(/\n/g, '<br>') + '</p>'];
      if (state.dataset) {
        parts.push('<h2>' + escapeHTML(label('data')) + '</h2><p>' + escapeHTML(state.dataset.title) + ' · ' + escapeHTML(label('rows')) + ': ' + state.dataset.rows.length + '</p>');
        parts.push(table(state.dataset.columns, state.dataset.rawRows.slice(0, 30)));
        const source = state.dataset.source;
        parts.push('<h2>' + escapeHTML(label('source')) + '</h2><p>' + escapeHTML([source.provider, Array.isArray(source.dataProviders) ? source.dataProviders.join('; ') : source.dataProviders, source.captured ? label('sample') : '', source.indicator, source.unit, source.retrievedAt, source.updatedAt, source.definition].filter(Boolean).join(' · ')) + '</p>');
        if (safeURL(source.url)) parts.push('<p><a href="' + escapeHTML(safeURL(source.url)) + '">' + escapeHTML(source.url) + '</a></p>');
      }
      if (state.analysis) {
        parts.push('<h2>' + escapeHTML(label('analysis')) + '</h2><p>' + escapeHTML(methodLabel(state.analysis.method)) + '</p>');
        state.analysis.groups.forEach(group => {
          parts.push('<h3>' + escapeHTML(group.group) + '</h3>', table(['count', 'missing', 'mean', 'median', 'sd', 'min', 'max'].map(label), [Object.values(group.summary)]));
          if (group.fit?.valid) parts.push(table(['pairs', 'slope', 'intercept', 'rSquared'].map(label), [[group.fit.pairs, group.fit.slope, group.fit.intercept, group.fit.rSquared]]));
          if (group.forecast) parts.push('<p>' + escapeHTML(label('mae')) + ': ' + group.forecast.mae + ' · ' + escapeHTML(label('holdout')) + ': ' + group.forecast.holdout + '</p>', table(['period', 'forecast'].map(label), group.forecast.predictions.map(point => [point.period, point.value])));
        });
        if (state.analysis.method !== 'summary') parts.push('<h2>' + escapeHTML(label('assumptions')) + '</h2><p>' + escapeHTML(label(state.analysis.method === 'regression' ? 'association' : 'forecastAssumption')) + '</p>');
      }
      if (state.references?.items?.length) {
        parts.push('<h2>' + escapeHTML(label('references')) + '</h2><ol>' + state.references.items.map(item => '<li>' + escapeHTML([item.authors?.join('; '), item.year, item.title, item.journal, item.doi].filter(Boolean).join(' · ')) +
          (safeURL(item.url) ? ' <a href="' + escapeHTML(safeURL(item.url)) + '">' + escapeHTML(item.url) + '</a>' : '') + '</li>').join('') + '</ol>');
        parts.push('<p>' + escapeHTML([state.references.provider, state.references.retrievedAt, state.references.sourceURL].filter(Boolean).join(' · ')) + '</p>');
      }
      return parts.join('\n');
    }
    const editorSource = document.getElementById('native-writing-editor');
    function draftHTML() { return state.editor ? state.editor.getHTML() : editorSource?.value || ''; }
    function plainMarkdown(html) {
      const document = new DOMParser().parseFromString(html, 'text/html');
      document.querySelectorAll('script,style').forEach(node => node.remove());
      document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(node => { node.prepend('#'.repeat(Number(node.tagName[1])) + ' '); node.append('\n\n'); });
      document.querySelectorAll('p,li,tr,blockquote,pre').forEach(node => node.append('\n'));
      document.querySelectorAll('td,th').forEach(node => node.append(' | '));
      document.querySelectorAll('a[href]').forEach(node => { if (safeURL(node.getAttribute('href'))) node.append(' (' + node.getAttribute('href') + ')'); });
      document.querySelectorAll('br').forEach(node => node.replaceWith('\n'));
      return document.body.textContent.trim() + '\n';
    }
    async function mountEditor() {
      if (state.editor) return state.editor;
      if (!editorSource) fail('error');
      await loadRuntime('editor');
      // The textarea adapter installs cross-tab localStorage autosave. Use the
      // real SDK's public persist:false mount; this host saves only tab drafts.
      if (typeof global.mountLocalRichEditor !== 'function') fail('error');
      const mount = document.createElement('div'); editorSource.insertAdjacentElement('afterend', mount);
      try { state.editor = global.mountLocalRichEditor({ target: mount, replace: true, persist: false, lang: config.lang, toolbarSize: 'full', html: editorSource.value, placeholder: label('notes') }); }
      catch (error) { mount.remove(); throw error; }
      if (!state.editor || typeof state.editor.getHTML !== 'function' || typeof state.editor.setHTML !== 'function') fail('error');
      editorSource.hidden = true;
      return state.editor;
    }
    bind('writing-draft', async () => {
      const html = reportHTML();
      state.pendingDraft = html;
      if (draftHTML().trim()) {
        const preview = find('writing-context'); if (preview) preview.innerHTML = html;
        status('replaceWarning'); return;
      }
      if (editorSource) editorSource.value = html;
      status('loading'); const editor = await mountEditor(); editor.setHTML(html); state.pendingDraft = null; status('ready');
    });
    bind('writing-edit', async () => { status('loading'); await mountEditor(); status('ready'); });
    bind('writing-append', async () => {
      if (!state.pendingDraft) state.pendingDraft = reportHTML();
      const previous = draftHTML(), next = previous + (previous ? '<hr>' : '') + state.pendingDraft;
      const editor = await mountEditor(); editor.setHTML(next); state.pendingDraft = null; status('ready');
    });
    bind('writing-save', () => { store('draft', { html: draftHTML(), question: find('writing-question')?.value || '', notes: find('writing-notes')?.value || '' }); status('localDraft'); });
    bind('writing-html', () => { download('<!doctype html><html lang="' + escapeHTML(config.lang) + '"><meta charset="utf-8"><title>' + escapeHTML(label('writing')) + '</title><body>' + draftHTML() + '</body></html>', 'text/html;charset=utf-8', 'statground-research.html'); });
    bind('writing-markdown', () => download(state.editor?.getMarkdown ? state.editor.getMarkdown() : plainMarkdown(draftHTML()), 'text/markdown;charset=utf-8', 'statground-research.md'));
    bind('writing-json', () => download('{"schema":"statground.workspace.report.v1","html":' + JSON.stringify(draftHTML()) +
      ',"dataset":' + (state.dataset ? datasetJSON(state.dataset).trim() : 'null') + ',"analysis":' + JSON.stringify(state.analysis && reportAnalysis(state.analysis)) +
      ',"references":' + JSON.stringify(state.references) + '}\n', 'application/json;charset=utf-8', 'statground-research.json'));
    if (mode === 'analysis' || mode === 'writing') {
      try { const dataset = restore('dataset'); if (dataset) setDataset(dataset, true); } catch (_) { status('invalidData'); }
      const analysis = restore('analysis'); if (analysis?.schema === 'statground.workspace.analysis.v1' && analysis.datasetRevision === state.dataset?.revision) { state.analysis = analysis; if (mode === 'analysis') renderAnalysis(analysis); }
      const references = restore('references'); if (Array.isArray(references?.items)) state.references = references;
      if (mode === 'writing') {
        const saved = restore('draft');
        if (saved && editorSource) {
          editorSource.value = String(saved.html || '');
          if (find('writing-question')) find('writing-question').value = String(saved.question || '');
          if (find('writing-notes')) find('writing-notes').value = String(saved.notes || '');
        }
        const context = find('writing-context');
        if (context) {
          const lines = [state.dataset && state.dataset.title + ' · ' + label('rows') + ': ' + state.dataset.rows.length,
            state.analysis && label('analysis') + ': ' + methodLabel(state.analysis.method),
            state.references && label('references') + ': ' + state.references.items.length].filter(Boolean);
          context.textContent = lines.join(' · ');
        }
      }
    }
    let resizeFrame = null;
    const resize = () => {
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => { resizeFrame = null; state.charts.forEach(({ chart, mount }) => { try { chart.resize?.(mount.clientWidth, mount.clientHeight); } catch (_) {} }); });
    };
    global.addEventListener('resize', resize);
    global.addEventListener('pageshow', event => { if (event.persisted) resize(); });
    global.addEventListener('pagehide', event => {
      if (event.persisted) return;
      global.removeEventListener('resize', resize); if (resizeFrame !== null) cancelAnimationFrame(resizeFrame); dispose(state.charts);
      if (state.editor) { try { global.destroyLocalRichEditor?.(state.editor); } catch (_) {} }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(typeof window === 'undefined' ? globalThis : window);
