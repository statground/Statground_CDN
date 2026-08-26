/*! Graflume v0.1.0-alpha.0 | https://github.com/statground/graflume */
var GraflumeSpatial = (function (exports) {
    'use strict';

    class EventEmitter {
        #listeners = new Map();
        on(type, listener) {
            let listeners = this.#listeners.get(type);
            if (listeners === undefined) {
                listeners = new Set();
                this.#listeners.set(type, listeners);
            }
            listeners.add(listener);
            return () => this.off(type, listener);
        }
        off(type, listener) {
            const listeners = this.#listeners.get(type);
            listeners?.delete(listener);
            if (listeners?.size === 0)
                this.#listeners.delete(type);
        }
        emit(type, event) {
            for (const listener of this.#listeners.get(type) ?? []) {
                listener(event);
            }
        }
        clear() {
            this.#listeners.clear();
        }
    }

    const adaptiveContractVersion = '0.1';
    const capability = (id, category, signals, behavior) => Object.freeze({
        id,
        category,
        signals: Object.freeze([...signals]),
        behavior: Object.freeze([...behavior]),
    });
    /** Stable source of truth shared by Canvas, Spatial and host-side device examples. */
    const adaptiveCapabilityCatalog = Object.freeze([
        capability('zoom-reflow', 'layout', ['small CSS viewport', 'page zoom'], ['compact gutters', 'wrapped legend rail', 'inspection zoom']),
        capability('foldable-dual', 'layout', ['multiple viewport segments'], ['segment-safe reflow', 'avoid hinge/cutout insets']),
        capability('tv-remote', 'input', ['large viewport', 'no pointer hover', 'remote navigation'], ['large focus targets', 'keyboard-equivalent navigation']),
        capability('print-paged', 'display', ['print media', 'paged block overflow'], ['static frame', 'visible semantic table recommendation']),
        capability('forced-colors', 'display', ['forced-colors', 'increased contrast preference'], ['high-contrast theme override', 'visible focus and outlines']),
        capability('reduced-effects', 'motion', ['reduced motion/transparency', 'slow or static update'], ['no autoplay', 'no interpolation', 'opaque chrome']),
        capability('coarse-touch', 'input', ['coarse pointer'], ['44 CSS pixel targets', 'pinch and vertical-scroll-safe gestures']),
        capability('keyboard-switch', 'input', ['keyboard-only', 'switch control'], ['roving focus', 'zoom/reset keyboard parity']),
        capability('low-resource', 'resource', ['save-data', 'small memory/CPU budget', 'grid/static display'], ['bounded pixel ratio', 'bounded effects', 'semantic fallback']),
        capability('rtl', 'layout', ['right-to-left direction'], ['logical chrome and text direction']),
        capability('vertical-writing', 'layout', ['vertical writing mode'], ['vertical-safe axis labels', 'logical layout metadata']),
        capability('ultrawide-projection', 'layout', ['ultrawide aspect ratio', 'projection surface'], ['bounded content measure', 'readable typography and controls']),
        capability('screenreader-braille', 'accessibility', ['explicit assistive-technology host signal'], ['visible semantic table', 'complete keyboard navigation']),
        capability('no-script', 'runtime', ['scripting unavailable or initial-only'], ['static image and semantic table fallback required']),
        capability('spatial-xr', 'input', ['explicit immersive/XR host signal'], ['programmatic camera parity', 'non-immersive semantic fallback']),
        capability('cutout-round', 'layout', ['round display', 'non-zero safe-area inset'], ['safe inset padding', 'scrollable compact controls']),
        capability('virtual-keyboard', 'layout', ['virtual keyboard inset', 'visual viewport contraction'], ['height reflow', 'focused controls remain reachable']),
    ]);
    function capabilityEnvironment(id) {
        switch (id) {
            case 'zoom-reflow':
                return { width: 320, height: 480, zoom: 2 };
            case 'foldable-dual':
                return { width: 720, height: 640, viewportSegments: 2 };
            case 'tv-remote':
                return { width: 1_920, height: 1_080, pointer: 'none', hover: false, remoteControl: true };
            case 'print-paged':
                return { width: 794, height: 1_123, media: 'print', paged: true, update: 'none' };
            case 'forced-colors':
                return { forcedColors: true, contrast: 'more' };
            case 'reduced-effects':
                return { reducedMotion: true, reducedTransparency: true };
            case 'coarse-touch':
                return { width: 390, height: 844, pointer: 'coarse', hover: false };
            case 'keyboard-switch':
                return { pointer: 'none', keyboard: true, switchControl: true };
            case 'low-resource':
                return { deviceMemoryGB: 1, hardwareConcurrency: 2, saveData: true };
            case 'rtl':
                return { direction: 'rtl' };
            case 'vertical-writing':
                return { writingMode: 'vertical-rl' };
            case 'ultrawide-projection':
                return { width: 1_920, height: 720, projection: true };
            case 'screenreader-braille':
                return { pointer: 'none', keyboard: true, screenReader: true, braille: true };
            case 'no-script':
                return { scripting: 'none', update: 'none' };
            case 'spatial-xr':
                return { spatialXR: true, pointer: 'none', keyboard: false };
            case 'cutout-round':
                return {
                    width: 184,
                    height: 224,
                    roundDisplay: true,
                    safeArea: { top: 18, right: 18, bottom: 18, left: 18 },
                };
            case 'virtual-keyboard':
                return { width: 390, height: 560, virtualKeyboardInset: 280 };
        }
    }
    function profile(entry) {
        Object.freeze(entry.capabilities);
        if (entry.environment.safeArea !== undefined)
            Object.freeze(entry.environment.safeArea);
        Object.freeze(entry.environment);
        Object.freeze(entry.presentation);
        return Object.freeze(entry);
    }
    /**
     * Ordered adaptive registry consumed by generated catalog assets and hosts.
     * The first six entries reproduce the explicitly requested device examples;
     * the remaining entries expose orthogonal capability cases. Consumers discover
     * entries from this registry instead of copying an ID allowlist.
     */
    const adaptiveProfileCatalog = Object.freeze([
        profile({
            id: 'responsive-fluid',
            order: 0,
            kind: 'scenario',
            category: 'scenario',
            label: 'Responsive fluid viewport',
            compactLabel: 'Responsive',
            summary: 'A fluid container that continuously reflows axes, legends, controls, and plots.',
            capabilities: ['zoom-reflow'],
            environment: { width: 960, height: 540 },
            presentation: {
                width: 960,
                height: 540,
                shape: 'rectangle',
                display: 'color',
                input: 'fine',
                motion: 'full',
                renderer: 'canvas-spatial',
            },
        }),
        profile({
            id: 'mobile-touch',
            order: 1,
            kind: 'scenario',
            category: 'scenario',
            label: 'Mobile touch viewport',
            compactLabel: 'Mobile',
            summary: 'A narrow coarse-pointer viewport with scroll-safe gestures and 44px controls.',
            capabilities: ['zoom-reflow', 'coarse-touch', 'virtual-keyboard'],
            environment: {
                width: 390,
                height: 844,
                pointer: 'coarse',
                hover: false,
                virtualKeyboardInset: 280,
            },
            presentation: {
                width: 390,
                height: 844,
                shape: 'rectangle',
                display: 'color',
                input: 'coarse',
                motion: 'full',
                renderer: 'canvas-spatial',
            },
        }),
        profile({
            id: 'smartwatch',
            order: 2,
            kind: 'scenario',
            category: 'scenario',
            label: 'Smartwatch viewport',
            compactLabel: 'Watch',
            summary: 'A round micro viewport with safe insets, touch targets, and inspection zoom.',
            capabilities: [
                'zoom-reflow',
                'reduced-effects',
                'coarse-touch',
                'low-resource',
                'cutout-round',
            ],
            environment: {
                width: 184,
                height: 224,
                pointer: 'coarse',
                hover: false,
                roundDisplay: true,
                reducedMotion: true,
                safeArea: { top: 18, right: 18, bottom: 18, left: 18 },
                deviceMemoryGB: 1,
            },
            presentation: {
                width: 184,
                height: 224,
                shape: 'round',
                display: 'color',
                input: 'coarse',
                motion: 'reduced',
                renderer: 'canvas-spatial',
            },
        }),
        profile({
            id: 'ebook-paper',
            order: 3,
            kind: 'scenario',
            category: 'scenario',
            label: 'Electronic paper reader',
            compactLabel: 'E-paper',
            summary: 'A paged monochrome display with slow refresh and static semantic output.',
            capabilities: ['print-paged', 'reduced-effects', 'low-resource'],
            environment: {
                width: 758,
                height: 1_024,
                update: 'slow',
                monochromeBits: 4,
                paged: true,
                pointer: 'none',
                keyboard: true,
                reducedMotion: true,
            },
            presentation: {
                width: 758,
                height: 1_024,
                shape: 'paged',
                display: 'e-ink',
                input: 'keyboard',
                motion: 'static',
                renderer: 'canvas-spatial',
            },
        }),
        profile({
            id: 'monochrome',
            order: 4,
            kind: 'scenario',
            category: 'scenario',
            label: 'Monochrome display',
            compactLabel: 'Monochrome',
            summary: 'A colorless display using contrast, outlines, and ordered gray ramps.',
            capabilities: ['reduced-effects'],
            environment: { width: 640, height: 400, monochromeBits: 8 },
            presentation: {
                width: 640,
                height: 400,
                shape: 'rectangle',
                display: 'monochrome',
                input: 'fine',
                motion: 'reduced',
                renderer: 'canvas-spatial',
            },
        }),
        profile({
            id: 'dot-matrix',
            order: 5,
            kind: 'scenario',
            category: 'scenario',
            label: 'Dot matrix or grid display',
            compactLabel: 'Dot matrix',
            summary: 'A low-resolution grid display with pixelated, static, high-contrast output.',
            capabilities: ['zoom-reflow', 'reduced-effects', 'keyboard-switch', 'low-resource'],
            environment: {
                width: 320,
                height: 240,
                pointer: 'none',
                keyboard: true,
                grid: true,
                update: 'none',
                monochromeBits: 1,
            },
            presentation: {
                width: 320,
                height: 240,
                shape: 'rectangle',
                display: 'grid',
                input: 'keyboard',
                motion: 'static',
                renderer: 'canvas-spatial',
            },
        }),
        ...adaptiveCapabilityCatalog.map((entry, index) => {
            const environment = capabilityEnvironment(entry.id);
            return profile({
                id: entry.id,
                order: index + 6,
                kind: 'capability',
                category: entry.category,
                label: entry.id
                    .split('-')
                    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
                    .join(' '),
                compactLabel: entry.id,
                summary: entry.behavior.join('; '),
                capabilities: [entry.id],
                environment,
                presentation: {
                    width: environment.width ?? 640,
                    height: environment.height ?? 400,
                    shape: entry.id === 'cutout-round'
                        ? 'round'
                        : entry.id === 'foldable-dual'
                            ? 'dual'
                            : entry.id === 'print-paged'
                                ? 'paged'
                                : entry.id === 'screenreader-braille' || entry.id === 'no-script'
                                    ? 'nonvisual'
                                    : 'rectangle',
                    display: entry.id === 'forced-colors' ? 'high-contrast' : 'color',
                    input: entry.id === 'coarse-touch'
                        ? 'coarse'
                        : entry.id === 'tv-remote'
                            ? 'remote'
                            : entry.id === 'screenreader-braille'
                                ? 'nonvisual'
                                : entry.id === 'keyboard-switch'
                                    ? 'keyboard'
                                    : 'fine',
                    motion: entry.id === 'reduced-effects'
                        ? 'reduced'
                        : entry.id === 'print-paged' || entry.id === 'no-script'
                            ? 'static'
                            : 'full',
                    renderer: entry.id === 'no-script' ? 'static-fallback' : 'canvas-spatial',
                },
            });
        }),
    ]);
    const adaptiveMediaQueries = Object.freeze([
        '(forced-colors: active)',
        '(prefers-contrast: more)',
        '(prefers-reduced-motion: reduce)',
        '(prefers-reduced-transparency: reduce)',
        '(prefers-reduced-data: reduce)',
        '(pointer: coarse)',
        '(pointer: none)',
        '(hover: hover)',
        '(update: slow)',
        '(update: none)',
        '(monochrome)',
        '(grid: 1)',
        '(overflow-block: paged)',
        '(scripting: none)',
        '(scripting: initial-only)',
        '(shape: round)',
        '(horizontal-viewport-segments: 2)',
        '(vertical-viewport-segments: 2)',
        'print',
    ]);
    const zeroSafeArea = Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 });
    function finiteAtLeast(value, minimum, fallback) {
        return value !== undefined && Number.isFinite(value) ? Math.max(minimum, value) : fallback;
    }
    function createAdaptiveEnvironment(input) {
        const safeArea = input.safeArea ?? zeroSafeArea;
        return Object.freeze({
            width: finiteAtLeast(input.width, 1, 640),
            height: finiteAtLeast(input.height, 1, 400),
            rowCount: Math.round(finiteAtLeast(input.rowCount, 0, 0)),
            pixelRatio: finiteAtLeast(input.pixelRatio, 0.25, 1),
            zoom: finiteAtLeast(input.zoom, 0.25, 1),
            pointer: input.pointer ?? 'fine',
            hover: input.hover ?? true,
            keyboard: input.keyboard ?? true,
            switchControl: input.switchControl ?? false,
            remoteControl: input.remoteControl ?? false,
            update: input.update ?? 'fast',
            monochromeBits: Math.round(finiteAtLeast(input.monochromeBits, 0, 0)),
            grid: input.grid ?? false,
            viewportSegments: Math.round(finiteAtLeast(input.viewportSegments, 1, 1)),
            forcedColors: input.forcedColors ?? false,
            contrast: input.contrast ?? 'normal',
            reducedMotion: input.reducedMotion ?? false,
            reducedTransparency: input.reducedTransparency ?? false,
            reducedData: input.reducedData ?? false,
            scripting: input.scripting ?? 'enabled',
            media: input.media ?? 'screen',
            paged: input.paged ?? false,
            direction: input.direction ?? 'ltr',
            writingMode: input.writingMode ?? 'horizontal-tb',
            ...(input.deviceMemoryGB === undefined
                ? {}
                : { deviceMemoryGB: finiteAtLeast(input.deviceMemoryGB, 0, 0) }),
            ...(input.hardwareConcurrency === undefined
                ? {}
                : { hardwareConcurrency: Math.round(finiteAtLeast(input.hardwareConcurrency, 0, 0)) }),
            saveData: input.saveData ?? false,
            screenReader: input.screenReader ?? false,
            braille: input.braille ?? false,
            spatialXR: input.spatialXR ?? false,
            roundDisplay: input.roundDisplay ?? false,
            safeArea: Object.freeze({
                top: finiteAtLeast(safeArea.top, 0, 0),
                right: finiteAtLeast(safeArea.right, 0, 0),
                bottom: finiteAtLeast(safeArea.bottom, 0, 0),
                left: finiteAtLeast(safeArea.left, 0, 0),
            }),
            virtualKeyboardInset: finiteAtLeast(input.virtualKeyboardInset, 0, 0),
            projection: input.projection ?? false,
        });
    }
    function normalizedMedia(value) {
        return value.toLowerCase().replace(/\s+/g, '');
    }
    function mediaMatches(query) {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
            return false;
        try {
            const result = window.matchMedia(query);
            // Deterministic DOM test doubles often return one MediaQueryList for every
            // query. Ignore such a result when it explicitly names a different query.
            return (result.matches &&
                (result.media === '' || normalizedMedia(result.media) === normalizedMedia(query)));
        }
        catch {
            return false;
        }
    }
    function detectBrowserAdaptiveEnvironment(input, overrides = {}) {
        const runtimeNavigator = typeof navigator === 'undefined' ? undefined : navigator;
        const update = mediaMatches('(update: none)')
            ? 'none'
            : mediaMatches('(update: slow)')
                ? 'slow'
                : 'fast';
        const pointer = mediaMatches('(pointer: none)')
            ? 'none'
            : mediaMatches('(pointer: coarse)')
                ? 'coarse'
                : 'fine';
        const visualViewportHeight = typeof window === 'undefined' ? undefined : window.visualViewport?.height;
        const virtualKeyboardInset = Math.max(0, runtimeNavigator?.virtualKeyboard?.boundingRect?.height ?? 0, typeof window === 'undefined' || visualViewportHeight === undefined
            ? 0
            : window.innerHeight - visualViewportHeight);
        return createAdaptiveEnvironment({
            ...input,
            pixelRatio: typeof window === 'undefined' ? 1 : (window.devicePixelRatio ?? 1),
            pointer,
            hover: mediaMatches('(hover: hover)'),
            update,
            monochromeBits: mediaMatches('(monochrome)') ? 1 : 0,
            grid: mediaMatches('(grid: 1)'),
            viewportSegments: mediaMatches('(horizontal-viewport-segments: 2)') ||
                mediaMatches('(vertical-viewport-segments: 2)')
                ? 2
                : 1,
            forcedColors: mediaMatches('(forced-colors: active)'),
            contrast: mediaMatches('(prefers-contrast: more)') ? 'more' : 'normal',
            reducedMotion: mediaMatches('(prefers-reduced-motion: reduce)'),
            reducedTransparency: mediaMatches('(prefers-reduced-transparency: reduce)'),
            reducedData: mediaMatches('(prefers-reduced-data: reduce)'),
            scripting: mediaMatches('(scripting: none)')
                ? 'none'
                : mediaMatches('(scripting: initial-only)')
                    ? 'initial-only'
                    : 'enabled',
            media: mediaMatches('print') ? 'print' : 'screen',
            paged: mediaMatches('(overflow-block: paged)'),
            ...(runtimeNavigator?.deviceMemory === undefined
                ? {}
                : { deviceMemoryGB: runtimeNavigator.deviceMemory }),
            ...(runtimeNavigator?.hardwareConcurrency === undefined
                ? {}
                : { hardwareConcurrency: runtimeNavigator.hardwareConcurrency }),
            saveData: runtimeNavigator?.connection?.saveData ?? false,
            roundDisplay: mediaMatches('(shape: round)'),
            virtualKeyboardInset,
            ...overrides,
        });
    }
    function normalizeProfiles(input) {
        if (input === undefined || input === 'auto')
            return 'auto';
        const values = typeof input === 'string' ? [input] : [...input];
        const known = new Set(adaptiveProfileCatalog.map(({ id }) => id));
        for (const id of values) {
            if (!known.has(id))
                throw new RangeError(`Unknown adaptive capability "${id}".`);
        }
        return Object.freeze(adaptiveProfileCatalog.flatMap(({ id }) => new Set(values).has(id) ? [id] : []));
    }
    function normalizeAdaptiveOptions(input) {
        const options = typeof input === 'object' ? input : {};
        const threshold = options.largeDataThreshold ?? 50_000;
        if (!Number.isInteger(threshold) || threshold < 1 || threshold > 10_000_000) {
            throw new RangeError('Adaptive largeDataThreshold must be an integer from 1 to 10,000,000.');
        }
        const environment = options.environment ?? {};
        return Object.freeze({
            enabled: input !== false && options.enabled !== false,
            profiles: normalizeProfiles(options.profiles),
            largeDataNavigation: options.largeDataNavigation ?? true,
            largeDataThreshold: threshold,
            layout: options.layout ?? true,
            colorAdaptation: options.colorAdaptation ?? true,
            environment: Object.freeze({
                ...environment,
                ...(environment.safeArea === undefined
                    ? {}
                    : { safeArea: Object.freeze({ ...environment.safeArea }) }),
            }),
        });
    }
    function detectedCapabilities(environment) {
        const result = new Set();
        const aspectRatio = environment.width / Math.max(1, environment.height);
        const safeArea = Object.values(environment.safeArea).some((value) => value > 0);
        if (environment.width <= 560 || environment.zoom >= 2 || environment.grid)
            result.add('zoom-reflow');
        if (environment.viewportSegments > 1)
            result.add('foldable-dual');
        if (environment.remoteControl ||
            (environment.width >= 1_280 && environment.pointer === 'none' && !environment.hover))
            result.add('tv-remote');
        if (environment.media === 'print' || environment.paged)
            result.add('print-paged');
        if (environment.forcedColors || environment.contrast === 'more')
            result.add('forced-colors');
        if (environment.reducedMotion ||
            environment.reducedTransparency ||
            environment.update !== 'fast' ||
            environment.monochromeBits > 0)
            result.add('reduced-effects');
        if (environment.pointer === 'coarse')
            result.add('coarse-touch');
        if (environment.switchControl || (environment.keyboard && environment.pointer === 'none'))
            result.add('keyboard-switch');
        if (environment.saveData ||
            environment.reducedData ||
            environment.grid ||
            environment.update === 'none' ||
            (environment.deviceMemoryGB !== undefined && environment.deviceMemoryGB <= 2) ||
            (environment.hardwareConcurrency !== undefined && environment.hardwareConcurrency <= 2))
            result.add('low-resource');
        if (environment.direction === 'rtl')
            result.add('rtl');
        if (environment.writingMode !== 'horizontal-tb')
            result.add('vertical-writing');
        if (environment.projection || aspectRatio >= 2.3)
            result.add('ultrawide-projection');
        if (environment.screenReader || environment.braille)
            result.add('screenreader-braille');
        if (environment.scripting !== 'enabled')
            result.add('no-script');
        if (environment.spatialXR)
            result.add('spatial-xr');
        if (environment.roundDisplay || safeArea)
            result.add('cutout-round');
        if (environment.virtualKeyboardInset > 0)
            result.add('virtual-keyboard');
        return result;
    }
    function viewportClass(width) {
        if (width <= 220)
            return 'micro';
        if (width <= 360)
            return 'narrow';
        if (width <= 720)
            return 'compact';
        return 'wide';
    }
    function displayClass(environment) {
        if (environment.forcedColors || environment.contrast === 'more')
            return 'high-contrast';
        if (environment.grid)
            return 'grid';
        if (environment.monochromeBits > 0 && environment.update !== 'fast')
            return 'e-ink';
        if (environment.monochromeBits > 0)
            return 'monochrome';
        return 'color';
    }
    function inputClass(environment) {
        if (environment.screenReader || environment.braille)
            return 'nonvisual';
        if (environment.remoteControl)
            return 'remote';
        if (environment.pointer === 'coarse')
            return 'coarse';
        if (environment.pointer === 'none' && environment.keyboard)
            return 'keyboard';
        return 'fine';
    }
    function resolveAdaptiveProfile(input, optionsInput = undefined) {
        const options = typeof optionsInput === 'object' &&
            'largeDataThreshold' in optionsInput &&
            'profiles' in optionsInput &&
            'environment' in optionsInput &&
            'enabled' in optionsInput
            ? optionsInput
            : normalizeAdaptiveOptions(optionsInput);
        const selectedDefinitions = options.profiles === 'auto'
            ? []
            : adaptiveProfileCatalog.filter(({ id }) => options.profiles.includes(id));
        const profileEnvironment = Object.assign({}, ...selectedDefinitions.map(({ environment }) => environment));
        const environment = createAdaptiveEnvironment({
            ...input,
            ...profileEnvironment,
            width: input.width,
            height: input.height,
            ...(input.rowCount === undefined ? {} : { rowCount: input.rowCount }),
            ...options.environment,
        });
        const capabilities = options.enabled
            ? options.profiles === 'auto'
                ? detectedCapabilities(environment)
                : new Set(selectedDefinitions.flatMap(({ capabilities: values }) => values))
            : new Set();
        const orderedCapabilities = adaptiveCapabilityCatalog.flatMap(({ id }) => capabilities.has(id) ? [id] : []);
        const profiles = options.enabled
            ? options.profiles === 'auto'
                ? adaptiveProfileCatalog.flatMap(({ id, kind, capabilities: values }) => kind === 'capability' && values.every((id) => capabilities.has(id)) ? [id] : [])
                : [...options.profiles]
            : [];
        const viewport = viewportClass(environment.width);
        const display = displayClass(environment);
        const inputClassValue = inputClass(environment);
        const motion = !options.enabled
            ? 'full'
            : environment.update === 'none' || capabilities.has('print-paged')
                ? 'static'
                : capabilities.has('reduced-effects')
                    ? 'reduced'
                    : 'full';
        const resources = capabilities.has('low-resource')
            ? 'constrained'
            : 'standard';
        const largeData = environment.rowCount >= options.largeDataThreshold;
        const reflow = options.enabled &&
            options.layout &&
            (capabilities.has('zoom-reflow') ||
                capabilities.has('foldable-dual') ||
                capabilities.has('cutout-round') ||
                capabilities.has('virtual-keyboard'));
        const axisTickSpacing = viewport === 'micro' ? 56 : viewport === 'narrow' ? 44 : viewport === 'compact' ? 32 : 24;
        const axisLabelMaxLength = viewport === 'micro' ? 6 : viewport === 'narrow' ? 10 : viewport === 'compact' ? 16 : 24;
        const controlTarget = inputClassValue === 'coarse' || inputClassValue === 'remote' || inputClassValue === 'keyboard'
            ? 44
            : viewport === 'micro'
                ? 36
                : 28;
        const pixelRatioCap = !options.enabled
            ? 3
            : display === 'grid' || display === 'e-ink' || resources === 'constrained'
                ? 1
                : viewport === 'micro'
                    ? 2
                    : 3;
        const filter = !options.enabled || !options.colorAdaptation
            ? ''
            : display === 'grid'
                ? 'grayscale(1) contrast(2)'
                : display === 'e-ink'
                    ? 'grayscale(1) contrast(1.35)'
                    : display === 'monochrome'
                        ? 'grayscale(1) contrast(1.2)'
                        : display === 'high-contrast'
                            ? 'contrast(1.35)'
                            : '';
        const inspectionZoom = options.enabled &&
            ((options.largeDataNavigation && largeData) ||
                capabilities.has('zoom-reflow') ||
                capabilities.has('cutout-round'));
        const tableRecommended = capabilities.has('screenreader-braille') ||
            capabilities.has('print-paged') ||
            capabilities.has('no-script');
        return Object.freeze({
            version: adaptiveContractVersion,
            enabled: options.enabled,
            profiles: Object.freeze(profiles),
            capabilities: Object.freeze(orderedCapabilities),
            viewport,
            display,
            input: inputClassValue,
            motion,
            resources,
            rowCount: environment.rowCount,
            largeData,
            layout: Object.freeze({
                reflow,
                axisTickSpacing,
                axisLabelMaxLength,
                legend: reflow && viewport !== 'wide' ? 'bottom-flow' : 'preserve',
                controlTarget,
                safeArea: Object.freeze({ ...environment.safeArea }),
            }),
            rendering: Object.freeze({
                colorAdaptation: options.enabled && options.colorAdaptation,
                pixelRatioCap,
                imageRendering: options.enabled && display === 'grid' ? 'pixelated' : 'auto',
                filter,
            }),
            interaction: Object.freeze({
                inspectionZoom,
                maxZoom: 6,
                wheel: 'modifier',
                drag: true,
                pinch: true,
                keyboard: true,
            }),
            accessibility: Object.freeze({
                tableRecommended,
                staticFallbackRequired: capabilities.has('no-script'),
            }),
        });
    }
    function adaptiveStateSignature(state) {
        return JSON.stringify([
            state.enabled,
            state.profiles,
            state.capabilities,
            state.viewport,
            state.display,
            state.input,
            state.motion,
            state.resources,
            state.largeData,
            state.layout,
            state.rendering,
            state.interaction,
            state.accessibility,
        ]);
    }
    /** Synchronize observable host metadata and non-semantic output-device hints. */
    function applyAdaptiveSurface(host, surface, state) {
        host.dataset.graflumeAdaptive = state.enabled ? adaptiveContractVersion : 'off';
        host.dataset.graflumeAdaptiveProfiles = state.profiles.join(' ');
        host.dataset.graflumeAdaptiveCapabilities = state.capabilities.join(' ');
        host.dataset.graflumeAdaptiveViewport = state.enabled ? state.viewport : 'off';
        host.dataset.graflumeAdaptiveDisplay = state.enabled ? state.display : 'off';
        host.dataset.graflumeAdaptiveInput = state.enabled ? state.input : 'off';
        host.dataset.graflumeAdaptiveMotion = state.enabled ? state.motion : 'off';
        host.dataset.graflumeAdaptiveResources = state.enabled ? state.resources : 'off';
        host.dataset.graflumeAdaptiveLargeData = String(state.enabled && state.largeData);
        host.style.setProperty?.('--graflume-control-target', `${state.layout.controlTarget}px`);
        if (surface !== null) {
            surface.style.filter = state.rendering.filter;
            surface.style.imageRendering = state.rendering.imageRendering;
        }
    }

    class GraflumeError extends Error {
        code;
        path;
        details;
        constructor(code, message, options = {}) {
            super(message, options.cause === undefined ? undefined : { cause: options.cause });
            this.name = 'GraflumeError';
            this.code = code;
            if (options.path !== undefined)
                this.path = options.path;
            if (options.details !== undefined)
                this.details = options.details;
        }
    }

    const UNSAFE_KEYS$1 = new Set(['__proto__', 'prototype', 'constructor']);
    function assertSafeKey(key, path = key) {
        if (UNSAFE_KEYS$1.has(key)) {
            throw new GraflumeError('UNSAFE_KEY', `Unsafe key "${key}" is not allowed.`, { path });
        }
    }
    function isPlainObject(value) {
        if (value === null || typeof value !== 'object')
            return false;
        const prototype = Object.getPrototypeOf(value);
        return prototype === Object.prototype || prototype === null;
    }
    function deepMerge(base, override) {
        const output = { ...base };
        for (const [key, overrideValue] of Object.entries(override)) {
            assertSafeKey(key);
            if (overrideValue === undefined)
                continue;
            const baseValue = output[key];
            if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
                output[key] = deepMerge(baseValue, overrideValue);
            }
            else if (Array.isArray(overrideValue)) {
                output[key] = [...overrideValue];
            }
            else {
                output[key] = overrideValue;
            }
        }
        return output;
    }
    function ownValue(record, key) {
        assertSafeKey(key, `data.${key}`);
        return Object.prototype.hasOwnProperty.call(record, key) ? record[key] : null;
    }

    const groupPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,95}$/;
    function boundedInteger$1(value, fallback, maximum, path) {
        const resolved = value ?? fallback;
        if (!Number.isInteger(resolved) || resolved < 1 || resolved > maximum) {
            throw new GraflumeError('INVALID_SPEC', `${path} must be an integer from 1 to ${maximum}.`, {
                path,
            });
        }
        return resolved;
    }
    function safeIdentity(value, path) {
        if (!groupPattern.test(value)) {
            throw new GraflumeError('INVALID_SPEC', `${path} must contain 1 to 96 portable identity characters.`, { path });
        }
        return value;
    }
    function focusKey(value, path) {
        if (value instanceof Date && Number.isFinite(value.getTime()))
            return `date:${value.toISOString()}`;
        if (typeof value === 'string' && value !== '')
            return `string:${value}`;
        if (typeof value === 'number' && Number.isFinite(value))
            return `number:${value}`;
        if (typeof value === 'boolean')
            return `boolean:${value}`;
        throw new GraflumeError('INVALID_DATA', 'Linked focus keys must be non-empty strings, finite numbers, booleans, or valid Dates.', { path });
    }
    function cloneTarget(target) {
        return { ...target };
    }
    /**
     * Bounded shared focus state for linked Canvas and GPU views.
     *
     * Specs and emitted state contain data only. Runtime listeners are registered
     * separately, so chart specifications remain JSON-serializable.
     */
    class SemanticFocusStore {
        #maxViews;
        #maxRowsPerView;
        #maxListeners;
        #views = new Map();
        #listeners = new Set();
        #focused = null;
        #matches = [];
        #revision = 0;
        constructor(options = {}) {
            this.#maxViews = boundedInteger$1(options.maxViews, 64, 1_024, '$.focus.maxViews');
            this.#maxRowsPerView = boundedInteger$1(options.maxRowsPerView, 5_000, 100_000, '$.focus.maxRowsPerView');
            this.#maxListeners = boundedInteger$1(options.maxListeners, 128, 4_096, '$.focus.maxListeners');
        }
        registerView(viewId, spec, index) {
            safeIdentity(viewId, '$.focus.viewId');
            safeIdentity(spec.group, '$.accessibility.linkedFocus.group');
            if (typeof spec.key !== 'string' || spec.key.trim() === '') {
                throw new GraflumeError('INVALID_SPEC', '$.accessibility.linkedFocus.key must be a non-empty field.', { path: '$.accessibility.linkedFocus.key' });
            }
            assertSafeKey(spec.key, '$.accessibility.linkedFocus.key');
            if (!this.#views.has(viewId) && this.#views.size >= this.#maxViews) {
                throw new GraflumeError('INVALID_DATA', 'Linked focus view limit reached.');
            }
            if (index.length > this.#maxRowsPerView) {
                throw new GraflumeError('INVALID_DATA', `Linked focus index has ${index.length} rows; the deterministic limit is ${this.#maxRowsPerView}.`);
            }
            const marksByKey = new Map();
            index.forEach((mark, rowIndex) => {
                const value = ownValue(mark.datum, spec.key);
                const key = focusKey(value, `$.semanticIndex[${rowIndex}].datum.${spec.key}`);
                // A single deterministic target per view prevents an ambiguous focus ring.
                if (!marksByKey.has(key) || (!marksByKey.get(key).visible && mark.visible)) {
                    marksByKey.set(key, mark);
                }
            });
            this.#views.set(viewId, { viewId, spec: { ...spec }, marksByKey });
            this.#reconcile('index');
            return () => {
                if (!this.#views.delete(viewId))
                    return;
                this.#reconcile('index');
            };
        }
        focus(viewId, mark) {
            const view = this.#views.get(viewId);
            if (view === undefined) {
                throw new GraflumeError('INVALID_DATA', `Linked focus view "${viewId}" is not registered.`);
            }
            const key = focusKey(ownValue(mark.datum, view.spec.key), `$.semanticIndex.datum.${view.spec.key}`);
            this.#focused = {
                group: view.spec.group,
                key,
                sourceViewId: viewId,
                semanticId: mark.id,
            };
            this.#reconcile('focus');
        }
        focusTarget(target) {
            safeIdentity(target.group, '$.focus.group');
            safeIdentity(target.sourceViewId, '$.focus.sourceViewId');
            if (target.key.length === 0 || target.key.length > 512) {
                throw new GraflumeError('INVALID_DATA', 'Linked focus key is empty or exceeds 512 characters.');
            }
            if (target.semanticId.length === 0 || target.semanticId.length > 512) {
                throw new GraflumeError('INVALID_DATA', 'Linked focus semantic identity is empty or exceeds 512 characters.');
            }
            this.#focused = cloneTarget(target);
            this.#reconcile('focus');
        }
        clear() {
            if (this.#focused === null && this.#matches.length === 0)
                return;
            this.#focused = null;
            this.#matches = [];
            this.#revision += 1;
            this.#emit('clear');
        }
        state() {
            return {
                version: 1,
                revision: this.#revision,
                focused: this.#focused === null ? null : cloneTarget(this.#focused),
                matches: this.#matches.map((match) => ({ ...match })),
                registeredViews: this.#views.size,
            };
        }
        subscribe(listener) {
            if (this.#listeners.size >= this.#maxListeners) {
                throw new GraflumeError('INVALID_DATA', 'Linked focus listener limit reached.');
            }
            this.#listeners.add(listener);
            return () => this.#listeners.delete(listener);
        }
        #reconcile(reason) {
            const focused = this.#focused;
            this.#matches =
                focused === null
                    ? []
                    : [...this.#views.values()]
                        .filter(({ spec }) => spec.group === focused.group)
                        .flatMap(({ viewId, marksByKey }) => {
                        const mark = marksByKey.get(focused.key);
                        return mark === undefined
                            ? []
                            : [
                                {
                                    viewId,
                                    semanticId: mark.id,
                                    layerId: mark.layerId,
                                    rowIndex: mark.rowIndex,
                                },
                            ];
                    })
                        .sort((left, right) => left.viewId.localeCompare(right.viewId, 'en'));
            this.#revision += 1;
            this.#emit(reason);
        }
        #emit(reason) {
            const change = { state: this.state(), reason };
            for (const listener of [...this.#listeners])
                listener(change);
        }
    }
    /** Shared-by-default store used when linkedFocus is authored without an injected store. */
    const defaultSemanticFocusStore = new SemanticFocusStore();

    function normalizedHex(color) {
        const value = color.trim().replace(/^#/, '');
        if (/^[0-9a-f]{3}$/i.test(value)) {
            return value
                .split('')
                .map((channel) => `${channel}${channel}`)
                .join('');
        }
        return /^[0-9a-f]{6}$/i.test(value) ? value : null;
    }
    function hexColor(channels, uppercase = false) {
        const value = `#${channels
        .map((channelValue) => Math.round(Math.max(0, Math.min(255, channelValue)))
        .toString(16)
        .padStart(2, '0'))
        .join('')}`;
        return uppercase ? value.toUpperCase() : value;
    }
    function linearToSrgb(value) {
        return value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
    }
    function srgbToLinear(value) {
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    }
    /** Convert the polar CIELUV scale used by grDevices::hcl() into clipped sRGB. */
    function hclColor(hue, chroma, luminance) {
        const radians = (hue * Math.PI) / 180;
        const u = Math.cos(radians) * chroma;
        const v = Math.sin(radians) * chroma;
        const referenceU = 0.19783000664283;
        const referenceV = 0.46831999493879;
        const y = ((luminance + 16) / 116) ** 3 ;
        const uPrime = u / (13 * luminance) + referenceU;
        const vPrime = v / (13 * luminance) + referenceV;
        const x = (9 * y * uPrime) / (4 * vPrime);
        const z = (y * (12 - 3 * uPrime - 20 * vPrime)) / (4 * vPrime);
        const red = linearToSrgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);
        const green = linearToSrgb(-0.969266 * x + 1.8760108 * y + 0.041556 * z);
        const blue = linearToSrgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);
        return hexColor([red * 255, green * 255, blue * 255], true);
    }
    /** Resolve a category colour while preserving fixed-palette behaviour for existing themes. */
    function categoricalColor(theme, index, count) {
        const paletteSize = Number.isFinite(count) ? Math.max(1, Math.floor(count)) : 1;
        const paletteIndex = Number.isFinite(index) ? Math.floor(index) : 0;
        const normalizedIndex = ((paletteIndex % paletteSize) + paletteSize) % paletteSize;
        if (theme.colors.paletteMode === 'ggplot2-hue') {
            return hclColor(15 + (360 * normalizedIndex) / paletteSize, 100, 65);
        }
        const palette = theme.colors.palette;
        if (palette.length === 0)
            return theme.colors.focus;
        const fixedIndex = ((paletteIndex % palette.length) + palette.length) % palette.length;
        return palette[fixedIndex] ?? theme.colors.focus;
    }
    function labFunction(value) {
        const delta = 6 / 29;
        return value > delta ** 3 ? Math.cbrt(value) : value / (3 * delta ** 2) + 4 / 29;
    }
    function inverseLabFunction(value) {
        const delta = 6 / 29;
        return value > delta ? value ** 3 : 3 * delta ** 2 * (value - 4 / 29);
    }
    function hexToLab(color) {
        const hex = normalizedHex(color);
        if (hex === null)
            return null;
        const red = srgbToLinear(channel(hex, 0) / 255);
        const green = srgbToLinear(channel(hex, 1) / 255);
        const blue = srgbToLinear(channel(hex, 2) / 255);
        const x = (0.4124564 * red + 0.3575761 * green + 0.1804375 * blue) / 0.95047;
        const y = 0.2126729 * red + 0.7151522 * green + 0.072175 * blue;
        const z = (0.0193339 * red + 0.119192 * green + 0.9503041 * blue) / 1.08883;
        const fx = labFunction(x);
        const fy = labFunction(y);
        const fz = labFunction(z);
        return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
    }
    function labToHex(color) {
        const fy = (color.l + 16) / 116;
        const fx = fy + color.a / 500;
        const fz = fy - color.b / 200;
        const x = 0.95047 * inverseLabFunction(fx);
        const y = inverseLabFunction(fy);
        const z = 1.08883 * inverseLabFunction(fz);
        const red = linearToSrgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);
        const green = linearToSrgb(-0.969266 * x + 1.8760108 * y + 0.041556 * z);
        const blue = linearToSrgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);
        return hexColor([red * 255, green * 255, blue * 255], true);
    }
    function mixLabColor(start, end, ratio) {
        const startLab = hexToLab(start);
        const endLab = hexToLab(end);
        if (startLab === null || endLab === null)
            return mixColor$1(start, end, ratio);
        const bounded = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
        return labToHex({
            l: startLab.l + (endLab.l - startLab.l) * bounded,
            a: startLab.a + (endLab.a - startLab.a) * bounded,
            b: startLab.b + (endLab.b - startLab.b) * bounded,
        });
    }
    /** Resolve a continuous colour; an explicit interpolation token wins over palette defaults. */
    function continuousColor(theme, ratio) {
        const palette = theme.colors.sequential;
        if (palette.length === 0)
            return theme.colors.focus;
        if (palette.length === 1)
            return palette[0] ?? theme.colors.focus;
        const bounded = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
        if (theme.colors.paletteMode === 'ggplot2-hue' &&
            theme.colors.continuousInterpolation === undefined) {
            return mixLabColor(palette[0] ?? theme.colors.focus, palette[palette.length - 1] ?? theme.colors.focus, bounded);
        }
        if (theme.colors.continuousInterpolation === 'rgb' ||
            theme.colors.continuousInterpolation === 'lab') {
            const scaled = bounded * (palette.length - 1);
            const startIndex = Math.min(palette.length - 2, Math.floor(scaled));
            const start = palette[startIndex] ?? theme.colors.focus;
            const end = palette[startIndex + 1] ?? start;
            const localRatio = scaled - startIndex;
            return theme.colors.continuousInterpolation === 'lab'
                ? mixLabColor(start, end, localRatio)
                : mixColor$1(start, end, localRatio);
        }
        if (theme.colors.continuousInterpolation === 'step') {
            const index = Math.min(palette.length - 1, Math.floor(bounded * palette.length));
            return palette[index] ?? theme.colors.focus;
        }
        return palette[Math.round(bounded * (palette.length - 1))] ?? theme.colors.focus;
    }
    function channel(color, index) {
        return Number.parseInt(color.slice(index * 2, index * 2 + 2), 16);
    }
    function mixColor$1(start, end, ratio) {
        const startHex = normalizedHex(start);
        const endHex = normalizedHex(end);
        if (startHex === null || endHex === null)
            return ratio < 0.5 ? start : end;
        const bounded = Math.max(0, Math.min(1, ratio));
        const channels = [0, 1, 2].map((index) => Math.round(channel(startHex, index) + (channel(endHex, index) - channel(startHex, index)) * bounded));
        return `#${channels.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
    }
    function colorWithOpacity(color, opacity) {
        const hex = normalizedHex(color);
        if (hex === null)
            return color;
        const alpha = Math.round(Math.max(0, Math.min(1, opacity)) * 255)
            .toString(16)
            .padStart(2, '0');
        return `#${hex}${alpha}`;
    }

    function spatialAccessibleDescription(description, instructions) {
        const custom = description?.trim();
        const guidance = instructions.trim();
        if (custom === undefined || custom === '')
            return guidance;
        if (guidance === '' || guidance === custom)
            return custom;
        return `${custom} ${guidance}`;
    }
    function collectAccessibleSpatialPicks(geometries, maximumRows) {
        const limit = Math.max(1, Math.min(1_000, Math.trunc(maximumRows)));
        const prioritized = [
            ...geometries.filter(({ id }) => id.endsWith(':points') || id.endsWith(':routes')),
            ...geometries.filter(({ id }) => !id.endsWith(':points') && !id.endsWith(':routes')),
        ];
        const output = [];
        outer: for (const geometry of prioritized) {
            for (const pick of geometry.picks) {
                output.push(pick);
                if (output.length >= limit)
                    break outer;
            }
        }
        return output;
    }

    /* This file is generated by scripts/generate-natural-earth-world.mjs. */
    /* Natural Earth vector tag v5.1.2, Admin-0 Countries 1:110m, public domain. */
    const serializedCountries = [
        '[["FJI","FJ","FJI","242","Fiji",178,-17.8,["FJI","FJ","242","Fiji"],[[[[180,-16.1],[180,-16.6],[179.4,-16.8],[178.7,-17]',
        ',[178.6,-16.6],[179.1,-16.4],[179.4,-16.4]]],[[[178.1,-17.5],[178.4,-17.3],[178.7,-17.6],[178.6,-18.2],[177.9,-18.3],[17',
        '7.4,-18.2],[177.3,-17.7],[177.7,-17.4]]],[[[-179.8,-16],[-179.9,-16.5],[-180,-16.6],[-180,-16.1]]]]],["TZA","TZ","TZA","',
        '834","Tanzania",35,-6.1,["TZA","TZ","834","Tanzania","United Republic of Tanzania"],[[[[33.9,-0.9],[34.1,-1.1],[37.7,-3.',
        '1],[37.8,-3.7],[39.2,-4.7],[38.7,-5.9],[38.8,-6.5],[39.4,-6.8],[39.5,-7.1],[39.2,-7.7],[39.3,-8],[39.2,-8.5],[39.5,-9.1]',
        ',[39.9,-10.1],[40.3,-10.3],[39.5,-10.9],[38.4,-11.3],[37.8,-11.3],[37.5,-11.6],[36.8,-11.6],[36.5,-11.7],[35.3,-11.4],[3',
        '4.6,-11.5],[34.3,-10.2],[33.9,-9.7],[33.7,-9.4],[32.8,-9.2],[32.2,-8.9],[31.6,-8.8],[31.2,-8.6],[30.7,-8.3],[30.2,-7.1],',
        '[29.6,-6.5],[29.4,-5.9],[29.5,-5.4],[29.3,-4.5],[29.8,-4.5],[30.1,-4.1],[30.5,-3.6],[30.8,-3.4],[30.7,-3],[30.5,-2.8],[3',
        '0.5,-2.4],[30.8,-2.3],[30.8,-1.7],[30.4,-1.1],[30.8,-1],[31.9,-1]]]]],["SAH","EH","ESH","732","Western Sahara",-12.6,24,',
        '["SAH","EH","ESH","732","WS","W. Sahara","Western Sahara","B28"],[[[[-8.7,27.7],[-8.7,27.6],[-8.7,27.4],[-8.7,25.9],[-12',
        ',25.9],[-11.9,23.4],[-12.9,23.3],[-13.1,22.8],[-12.9,21.3],[-16.8,21.3],[-17.1,21],[-17,21.4],[-14.8,21.5],[-14.6,21.9],',
        '[-14.2,22.3],[-13.9,23.7],[-12.5,24.8],[-12,26],[-11.7,26.1],[-11.4,26.9],[-10.6,27],[-10.2,26.9],[-9.7,26.9],[-9.4,27.1',
        '],[-8.8,27.1],[-8.8,27.7]]]]],["CAN","CA","CAN","124","Canada",-101.9,60.3,["CAN","CA","124","Canada"],[[[[-122.8,49],[-',
        '123,49],[-124.9,50],[-125.6,50.4],[-127.4,50.8],[-128,51.7],[-127.9,52.3],[-129.1,52.8],[-129.3,53.6],[-130.5,54.3],[-13',
        '0.5,54.8],[-130,55.3],[-130,55.9],[-131.7,56.6],[-132.7,57.7],[-133.4,58.4],[-134.3,58.9],[-134.9,59.3],[-135.5,59.8],[-',
        '136.5,59.5],[-137.5,58.9],[-138.3,59.6],[-139,60],[-140,60.3],[-141,60.3],[-141,66],[-141,69.7],[-139.1,69.5],[-137.5,69',
        '],[-136.5,68.9],[-135.6,69.3],[-134.4,69.6],[-132.9,69.5],[-131.4,69.9],[-129.8,70.2],[-129.1,69.8],[-128.4,70],[-128.1,',
        '70.5],[-127.4,70.4],[-125.8,69.5],[-124.4,70.2],[-124.3,69.4],[-123.1,69.6],[-122.7,69.9],[-121.5,69.8],[-119.9,69.4],[-',
        '117.6,69],[-116.2,68.8],[-115.2,68.9],[-113.9,68.4],[-115.3,67.9],[-113.5,67.7],[-110.8,67.8],[-109.9,68],[-108.9,67.4],',
        '[-107.8,67.9],[-108.8,68.3],[-108.2,68.7],[-106.9,68.7],[-106.1,68.8],[-105.3,68.6],[-104.3,68],[-103.2,68.1],[-101.5,67',
        '.6],[-99.9,67.8],[-98.4,67.8],[-98.6,68.4],[-97.7,68.6],[-96.1,68.2],[-96.1,67.3],[-95.5,68.1],[-94.7,68.1],[-94.2,69.1]',
        ',[-95.3,69.7],[-96.5,70.1],[-96.4,71.2],[-95.2,71.9],[-93.9,71.8],[-92.9,71.3],[-91.5,70.2],[-92.4,69.7],[-90.5,69.5],[-',
        '90.6,68.5],[-89.2,69.3],[-88,68.6],[-88.3,67.9],[-87.4,67.2],[-86.3,67.9],[-85.6,68.8],[-85.5,69.9],[-84.1,69.8],[-82.6,',
        '69.7],[-81.3,69.2],[-81.2,68.7],[-82,68.1],[-81.3,67.6],[-81.4,67.1],[-83.3,66.4],[-84.7,66.3],[-85.8,66.6],[-86.1,66.1]',
        ',[-87,65.2],[-87.3,64.8],[-88.5,64.1],[-89.9,64],[-90.7,63.6],[-90.8,63],[-91.9,62.8],[-93.2,62],[-94.2,60.9],[-94.6,60.',
        '1],[-94.7,58.9],[-93.2,58.8],[-92.8,57.8],[-92.3,57.1],[-90.9,57.3],[-89,56.9],[-88,56.5],[-87.3,56],[-86.1,55.7],[-85,5',
        '5.3],[-83.4,55.2],[-82.3,55.1],[-82.4,54.3],[-82.1,53.3],[-81.4,52.2],[-79.9,51.2],[-79.1,51.5],[-78.6,52.6],[-79.1,54.1',
        '],[-79.8,54.7],[-78.2,55.1],[-77.1,55.8],[-76.5,56.5],[-76.6,57.2],[-77.3,58.1],[-78.5,58.8],[-77.3,59.9],[-77.8,60.8],[',
        '-78.1,62.3],[-77.4,62.6],[-75.7,62.3],[-74.7,62.2],[-73.8,62.4],[-72.9,62.1],[-71.7,61.5],[-71.4,61.1],[-69.6,61.1],[-69',
        '.6,60.2],[-69.3,59],[-68.4,58.8],[-67.6,58.2],[-66.2,58.8],[-65.2,59.9],[-64.6,60.3],[-63.8,59.4],[-62.5,58.2],[-61.4,57',
        '],[-61.8,56.3],[-60.5,55.8],[-59.6,55.2],[-58,54.9],[-57.3,54.6],[-56.9,53.8],[-56.2,53.6],[-55.8,53.3],[-55.7,52.1],[-5',
        '6.4,51.8],[-57.1,51.4],[-58.8,51.1],[-60,50.2],[-61.7,50.1],[-63.9,50.3],[-65.4,50.3],[-66.4,50.2],[-67.2,49.5],[-68.5,4',
        '9.1],[-70,47.7],[-71.1,46.8],[-70.3,47],[-68.6,48.3],[-66.6,49.1],[-65.1,49.2],[-64.2,48.7],[-65.1,48.1],[-64.8,47],[-64',
        '.5,46.2],[-63.2,45.7],[-61.5,45.9],[-60.5,47],[-60.4,46.3],[-59.8,45.9],[-61,45.3],[-63.3,44.7],[-64.2,44.3],[-65.4,43.5',
        '],[-66.1,43.6],[-66.2,44.5],[-64.4,45.3],[-66,45.3],[-67.1,45.1],[-67.8,45.7],[-67.8,47.1],[-68.2,47.4],[-68.9,47.2],[-6',
        '9.2,47.4],[-70,46.7],[-70.3,45.9],[-70.7,45.5],[-71.1,45.3],[-71.4,45.3],[-71.5,45],[-73.3,45],[-74.9,45],[-75.3,44.8],[',
        '-76.4,44.1],[-76.5,44],[-76.8,43.6],[-77.7,43.6],[-78.7,43.6],[-79.2,43.5],[-79,43.3],[-78.9,43],[-78.9,42.9],[-80.2,42.',
        '4],[-81.3,42.2],[-82.4,41.7],[-82.7,41.7],[-83,41.8],[-83.1,42],[-83.1,42.1],[-82.9,42.4],[-82.4,43],[-82.1,43.6],[-82.3',
        ',44.4],[-82.6,45.3],[-83.6,45.8],[-83.5,46],[-83.6,46.1],[-83.9,46.1],[-84.1,46.3],[-84.1,46.5],[-84.3,46.4],[-84.6,46.4',
        '],[-84.5,46.5],[-84.8,46.6],[-84.9,46.9],[-85.7,47.2],[-86.5,47.6],[-87.4,47.9],[-88.4,48.3],[-89.3,48],[-89.6,48],[-90.',
        '8,48.3],[-91.6,48.1],[-92.6,48.5],[-93.6,48.6],[-94.3,48.7],[-94.6,48.8],[-94.8,49.4],[-95.2,49.4],[-95.2,49],[-97.2,49]',
        ',[-100.6,49],[-104,49],[-107,49],[-110,49],[-113,49],[-116,49],[-117,49],[-120,49]]],[[[-84,62.5],[-83.3,62.9],[-81.9,62',
        '.9],[-81.9,62.7],[-83.1,62.2],[-83.8,62.2]]],[[[-79.8,72.8],[-80.9,73.3],[-80.8,73.7],[-80.4,73.8],[-78.1,73.7],[-76.3,7',
        '3.1],[-76.3,72.8],[-77.3,72.9],[-78.4,72.9],[-79.5,72.7]]],[[[-80.3,62.1],[-79.9,62.4],[-79.5,62.4],[-79.3,62.2],[-79.7,',
        '61.6],[-80.1,61.7],[-80.4,62]]],[[[-93.6,75],[-94.2,74.6],[-95.6,74.7],[-96.8,74.9],[-96.3,75.4],[-94.9,75.6],[-94,75.3]',
        ']],[[[-93.8,77.5],[-94.3,77.5],[-96.2,77.6],[-96.4,77.8],[-94.4,77.8],[-93.7,77.6]]],[[[-96.8,78.8],[-95.6,78.4],[-95.8,',
        '78.1],[-97.3,77.9],[-98.1,78.1],[-98.6,78.5],[-98.6,78.9],[-97.3,78.8]]],[[[-88.2,74.4],[-89.8,74.5],[-92.4,74.8],[-92.8',
        ',75.4],[-92.9,75.9],[-93.9,76.3],[-96,76.4],[-97.1,76.8],[-96.7,77.2],[-94.7,77.1],[-93.6,76.8],[-91.6,76.8],[-90.7,76.4',
        '],[-91,76.1],[-89.8,75.8],[-89.2,75.6],[-87.8,75.6],[-86.4,75.5],[-84.8,75.7],[-82.8,75.8],[-81.1,75.7],[-80.1,75.3],[-7',
        '9.8,74.9],[-80.5,74.7],[-81.9,74.4],[-83.2,74.6],[-86.1,74.4]]],[[[-111.3,78.2],[-109.9,78],[-110.2,77.7],[-112.1,77.4],',
        '[-113.5,77.7],[-112.7,78.1]]],[[[-111,78.8],[-109.7,78.6],[-110.9,78.4],[-112.5,78.4],[-112.5,78.6],[-111.5,78.8]]],[[[-',
        '55.6,51.3],[-56.1,50.7],[-56.8,49.8],[-56.1,50.2],[-55.5,49.9],[-55.8,49.6],[-54.9,49.3],[-54.5,49.6],[-53.5,49.2],[-53.',
        '8,48.5],[-53.1,48.7],[-53,48.2],[-52.6,47.5],[-53.1,46.7],[-53.5,46.6],[-54.2,46.8],[-54,47.6],[-54.2,47.8],[-55.4,46.9]',
        ',[-56,46.9],[-55.3,47.4],[-56.3,47.6],[-57.3,47.6],[-59.3,47.6],[-59.4,47.9],[-58.8,48.3],[-59.2,48.5],[-58.4,49.1],[-57',
        '.4,50.7],[-56.7,51.3],[-55.9,51.6],[-55.4,51.6]]],[[[-83.9,65.1],[-82.8,64.8],[-81.6,64.5],[-81.6,64],[-80.8,64.1],[-80.',
        '1,63.7],[-81,63.4],[-82.5,63.7],[-83.1,64.1],[-84.1,63.6],[-85.5,63.1],[-85.9,63.6],[-87.2,63.5],[-86.4,64],[-86.2,64.8]',
        ',[-85.9,65.7],[-85.2,65.7],[-85,65.2],[-84.5,65.4]]],[[[-78.8,72.4],[-77.8,72.7],[-75.6,72.2],[-74.2,71.8],[-74.1,71.3],',
        '[-72.2,71.6],[-71.2,70.9],[-68.8,70.5],[-67.9,70.1],[-67,69.2],[-68.8,68.7],[-66.4,68.1],[-64.9,67.8],[-63.4,66.9],[-61.',
        '9,66.9],[-62.2,66.2],[-63.9,65],[-65.1,65.4],[-66.7,66.4],[-68,66.3],[-68.1,65.7],[-67.1,65.1],[-65.7,64.6],[-65.3,64.4]',
        ',[-64.7,63.4],[-65,62.7],[-66.3,62.9],[-68.8,63.7],[-67.4,62.9],[-66.3,62.3],[-66.2,61.9],[-68.9,62.3],[-71,62.9],[-72.2',
        ',63.4],[-71.9,63.7],[-73.4,64.2],[-74.8,64.7],[-74.8,64.4],[-77.7,64.2],[-78.6,64.6],[-77.9,65.3],[-76,65.3],[-74,65.5],',
        '[-74.3,65.8],[-73.9,66.3],[-72.7,67.3],[-72.9,67.7],[-73.3,68.1],[-74.8,68.6],[-76.9,68.9],[-76.2,69.1],[-77.3,69.8],[-7',
        '8.2,69.8],[-79,70.2],[-79.5,69.9],[-81.3,69.7],[-84.9,70],[-87.1,70.3],[-88.7,70.4],[-89.5,70.8],[-88.5,71.2],[-89.9,71.',
        '2],[-90.2,72.2],[-89.4,73.1],[-88.4,73.5],[-85.8,73.8],[-86.6,73.2],[-85.8,72.5],[-84.9,73.3],[-82.3,73.8],[-80.6,72.7],',
        '[-80.7,72.1]]],[[[-94.5,74.1],[-92.4,74.1],[-90.5,73.9],[-92,73],[-93.2,72.8],[-94.3,72],[-95.4,72.1],[-96,72.9],[-96,73',
        '.4],[-95.5,73.9]]],[[[-122.9,76.1],[-121.2,76.9],[-119.1,77.5],[-117.6,77.5],[-116.2,77.6],[-116.3,76.9],[-117.1,76.5],[',
        '-118,76.5],[-119.9,76.1],[-121.5,75.9]]],[[[-132.7,54],[-131.7,54.1],[-132,53],[-131.2,52.2],[-131.6,52.2],[-132.2,52.6]',
        ',[-132.5,53.1],[-133.1,53.4],[-133.2,53.9],[-133.2,54.2]]],[[[-105.5,79.3],[-103.5,79.2],[-100.8,78.8],[-100.1,78.3],[-9',
        '9.7,77.9],[-101.3,78],[-102.9,78.3],[-105.2,78.4],[-104.2,78.7],[-105.4,78.9]]],[[[-123.5,48.5],[-124,48.4],[-125.7,48.8',
        '],[-126,49.2],[-126.9,49.5],[-127,49.8],[-128.1,50],[-128.4,50.5],[-128.4,50.8],[-127.3,50.6],[-126.7,50.4],[-125.8,50.3',
        '],[-125.4,50],[-124.9,49.5],[-123.9,49.1]]],[[[-121.5,74.4],[-120.1,74.2],[-117.6,74.2],[-116.6,73.9],[-115.5,73.5],[-11',
        '6.8,73.2],[-119.2,72.5],[-120.5,71.8],[-120.5,71.4],[-123.1,70.9],[-123.6,71.3],[-125.9,71.9],[-125.5,72.3],[-124.8,73],',
        '[-123.9,73.7],[-124.9,74.3]]],[[[-107.8,75.8],[-106.9,76],[-105.9,76],[-105.7,75.5],[-106.3,75],[-109.7,74.9],[-112.2,74',
        '.4],[-113.7,74.4],[-113.9,74.7],[-111.8,75.2],[-116.3,75],[-117.7,75.2],[-116.3,76.2],[-115.4,76.5],[-112.6,76.1],[-110.',
        '8,75.5],[-109.1,75.5],[-110.5,76.4],[-109.6,76.8],[-108.5,76.7],[-108.2,76.2]]],[[[-106.5,73.1],[-105.4,72.7],[-104.8,71',
        '.7],[-104.5,71],[-102.8,70.5],[-101,70],[-101.1,69.6],[-102.7,69.5],[-102.1,69.1],[-102.4,68.8],[-104.2,68.9],[-106,69.2',
        '],[-107.1,69.1],[-109,68.8],[-111.5,68.6],[-113.3,68.5],[-113.9,69],[-115.2,69.3],[-116.1,69.2],[-117.3,70],[-116.7,70.1',
        '],[-115.1,70.2],[-113.7,70.2],[-112.4,70.4],[-114.3,70.6],[-116.5,70.5],[-117.9,70.5],[-118.4,70.9],[-116.1,71.3],[-117.',
        '7,71.3],[-119.4,71.6],[-118.6,72.3],[-117.9,72.7],[-115.2,73.3],[-114.2,73.1],[-114.7,72.7],[-112.4,73],[-111.1,72.5],[-',
        '109.9,73],[-109,72.6],[-108.2,71.7],[-107.7,72.1],[-108.4,73.1],[-107.5,73.2]]],[[[-100.4,72.7],[-101.5,73.4],[-100.4,73',
        '.8],[-99.2,73.6],[-97.4,73.8],[-97.1,73.5],[-98.1,73],[-96.5,72.6],[-96.7,71.7],[-98.4,71.3],[-99.3,71.4],[-100,71.7],[-',
        '102.5,72.5],[-102.5,72.8]]],[[[-106.6,73.6],[-105.3,73.6],[-104.5,73.4],[-105.4,72.8],[-106.9,73.5]]],[[[-98.5,76.7],[-9',
        '7.7,76.3],[-97.7,75.7],[-98.2,75],[-99.8,74.9],[-100.9,75.1],[-100.9,75.6],[-102.5,75.6],[-102.6,76.3],[-101.5,76.3],[-1',
        '00,76.6],[-98.6,76.6]]],[[[-96,80.6],[-95.3,80.9],[-94.3,81],[-94.7,81.2],[-92.4,81.3],[-91.1,80.7],[-89.4,80.5],[-87.8,',
        '80.3],[-87,79.7],[-85.8,79.3],[-87.2,79],[-89,78.3],[-90.8,78.2],[-92.9,78.3],[-94,78.8],[-93.9,79.1],[-93.1,79.4],[-95,',
        '79.4],[-96.1,79.7],[-96.7,80.2]]],[[[-91.6,81.9],[-90.1,82.1],[-88.9,82.1],[-87,82.3],[-85.5,82.7],[-84.3,82.6],[-83.2,8',
        '2.3],[-82.4,82.9],[-81.1,83],[-79.3,83.1],[-76.2,83.2],[-75.7,83.1],[-72.8,83.2],[-70.7,83.2],[-68.5,83.1],[-65.8,83],[-',
        '63.7,82.9],[-61.8,82.6],[-61.9,82.4],[-64.3,81.9],[-66.8,81.7],[-67.7,81.5],[-65.5,81.5],[-67.8,80.9],[-69.5,80.6],[-71.',
        '2,79.8],[-73.2,79.6],[-73.9,79.4],[-76.9,79.3],[-75.5,79.2],[-76.2,79],[-75.4,78.5],[-76.3,78.2],[-77.9,77.9],[-78.4,77.',
        '5],[-79.8,77.2],[-79.6,77],[-77.9,77],[-77.9,76.8],[-80.6,76.2],[-83.2,76.5],[-86.1,76.3],[-87.6,76.4],[-89.5,76.5],[-89',
        '.6,77],[-87.8,77.2],[-88.3,77.9],[-87.6,78],[-85,77.5],[-86.3,78.2],[-88,78.4],[-87.2,78.8],[-85.4,79],[-85.1,79.3],[-86',
        '.5,79.7],[-86.9,80.3],[-84.2,80.2],[-83.4,80.1],[-81.8,80.5],[-84.1,80.6],[-87.6,80.5],[-89.4,80.9],[-90.2,81.3],[-91.4,',
        '81.6]]],[[[-75.2,67.4],[-75.9,67.1],[-77,67.1],[-77.2,67.6],[-76.8,68.1],[-75.9,68.3],[-75.1,68],[-75.1,67.6]]],[[[-96.3',
        ',69.5],[-95.6,69.1],[-96.3,68.8],[-97.6,69.1],[-98.4,69],[-99.8,69.4],[-98.9,69.7],[-98.2,70.1],[-97.2,69.9],[-96.6,69.7',
        ']]],[[[-64.5,49.9],[-64.2,50],[-62.9,49.7],[-61.8,49.3],[-61.8,49.1],[-62.3,49.1],[-63.6,49.4]]],[[[-64,47],[-63.7,46.6]',
        ',[-62.9,46.4],[-62,46.4],[-62.5,46],[-62.9,46],[-64.1,46.4],[-64.4,46.7]]]]],["USA","US","USA","840","United States of A',
        'merica",-97.5,39.5,["USA","US","840","US1","United States of America","United States"],[[[[-122.8,49],[-120,49],[-117,49',
        '],[-116,49],[-113,49],[-110,49],[-107,49],[-104,49],[-100.6,49],[-97.2,49],[-95.2,49],[-95.2,49.4],[-94.8,49.4],[-94.6,4',
        '8.8],[-94.3,48.7],[-93.6,48.6],[-92.6,48.5],[-91.6,48.1],[-90.8,48.3],[-89.6,48],[-89.3,48],[-88.4,48.3],[-87.4,47.9],[-',
        '86.5,47.6],[-85.7,47.2],[-84.9,46.9],[-84.8,46.6],[-84.5,46.5],[-84.6,46.4],[-84.3,46.4],[-84.1,46.5],[-84.1,46.3],[-83.',
        '9,46.1],[-83.6,46.1],[-83.5,46],[-83.6,45.8],[-82.6,45.3],[-82.3,44.4],[-82.1,43.6],[-82.4,43],[-82.9,42.4],[-83.1,42.1]',
        ',[-83.1,42],[-83,41.8],[-82.7,41.7],[-82.4,41.7],[-81.3,42.2],[-80.2,42.4],[-78.9,42.9],[-78.9,43],[-79,43.3],[-79.2,43.',
        '5],[-78.7,43.6],[-77.7,43.6],[-76.8,43.6],[-76.5,44],[-76.4,44.1],[-75.3,44.8],[-74.9,45],[-73.3,45],[-71.5,45],[-71.4,4',
        '5.3],[-71.1,45.3],[-70.7,45.5],[-70.3,45.9],[-70,46.7],[-69.2,47.4],[-68.9,47.2],[-68.2,47.4],[-67.8,47.1],[-67.8,45.7],',
        '[-67.1,45.1],[-67,44.8],[-68,44.3],[-69.1,44],[-70.1,43.7],[-70.6,43.1],[-70.8,42.9],[-70.8,42.3],[-70.5,41.8],[-70.1,41',
        '.8],[-70.2,42.1],[-69.9,41.9],[-70,41.6],[-70.6,41.5],[-71.1,41.5],[-71.9,41.3],[-72.3,41.3],[-72.9,41.2],[-73.7,40.9],[',
        '-72.2,41.1],[-71.9,40.9],[-73.3,40.6],[-74,40.6],[-74,40.8],[-74.3,40.5],[-74,40.4],[-74.2,39.7],[-74.9,38.9],[-75,39.2]',
        ',[-75.2,39.2],[-75.5,39.5],[-75.3,39],[-75.1,38.8],[-75.1,38.4],[-75.4,38],[-75.9,37.2],[-76,37.3],[-75.7,37.9],[-76.2,3',
        '8.3],[-76.3,39.2],[-76.5,38.7],[-76.3,38.1],[-77,38.2],[-76.3,37.9],[-76.3,37],[-76,36.9],[-75.9,36.6],[-75.7,35.6],[-76',
        '.4,34.8],[-77.4,34.5],[-78.1,33.9],[-78.6,33.9],[-79.1,33.5],[-79.2,33.2],[-80.3,32.5],[-80.9,32],[-81.3,31.4],[-81.5,30',
        '.7],[-81.3,30],[-81,29.2],[-80.5,28.5],[-80.5,28],[-80.1,26.9],[-80.1,26.2],[-80.1,25.8],[-80.4,25.2],[-80.7,25.1],[-81.',
        '2,25.2],[-81.3,25.6],[-81.7,25.9],[-82.2,26.7],[-82.7,27.5],[-82.9,27.9],[-82.6,28.6],[-82.9,29.1],[-83.7,29.9],[-84.1,3',
        '0.1],[-85.1,29.6],[-85.3,29.7],[-85.8,30.2],[-86.4,30.4],[-87.5,30.3],[-88.4,30.4],[-89.2,30.3],[-89.6,30.2],[-89.4,29.9',
        '],[-89.4,29.5],[-89.2,29.3],[-89.4,29.2],[-89.8,29.3],[-90.2,29.1],[-90.9,29.1],[-91.6,29.7],[-92.5,29.6],[-93.2,29.8],[',
        '-93.8,29.7],[-94.7,29.5],[-95.6,28.7],[-96.6,28.3],[-97.1,27.8],[-97.4,27.4],[-97.4,26.7],[-97.3,26.2],[-97.1,25.9],[-97',
        '.5,25.8],[-98.2,26.1],[-99,26.4],[-99.3,26.8],[-99.5,27.5],[-100.1,28.1],[-100.5,28.7],[-101,29.4],[-101.7,29.8],[-102.5',
        ',29.8],[-103.1,29],[-103.9,29.3],[-104.5,29.6],[-104.7,30.1],[-105,30.6],[-105.6,31.1],[-106.1,31.4],[-106.5,31.8],[-108',
        '.2,31.8],[-108.2,31.3],[-109,31.3],[-111,31.3],[-113.3,32],[-114.8,32.5],[-114.7,32.7],[-116,32.6],[-117.1,32.5],[-117.3',
        ',33],[-117.9,33.6],[-118.4,33.7],[-118.5,34],[-119.1,34.1],[-119.4,34.3],[-120.4,34.4],[-120.6,34.6],[-120.7,35.2],[-121',
        '.7,36.2],[-122.5,37.6],[-122.5,37.8],[-123,38.1],[-123.7,39],[-123.9,39.8],[-124.4,40.3],[-124.2,41.1],[-124.2,42],[-124',
        '.5,42.8],[-124.1,43.7],[-124,44.6],[-123.9,45.5],[-124.1,46.9],[-124.4,47.7],[-124.7,48.2],[-124.6,48.4],[-123.1,48],[-1',
        '22.6,47.1],[-122.3,47.4],[-122.5,48.2]]],[[[-155.4,20.1],[-155.2,20],[-155.1,19.9],[-154.8,19.5],[-155.2,19.2],[-155.5,1',
        '9.1],[-155.7,18.9],[-155.9,19.1],[-155.9,19.3],[-156.1,19.7],[-156,19.8],[-155.9,20],[-155.9,20.2],[-155.9,20.3],[-155.8',
        ',20.2]]],[[[-156,20.8],[-156.1,20.6],[-156.4,20.6],[-156.6,20.8],[-156.7,20.9],[-156.6,21],[-156.3,20.9]]],[[[-156.8,21.',
        '2],[-156.8,21.1],[-157.3,21.1],[-157.3,21.2]]],[[[-158,21.7],[-157.9,21.7],[-157.7,21.3],[-157.8,21.3],[-158.1,21.3],[-1',
        '58.3,21.5],[-158.3,21.6]]],[[[-159.4,22.2],[-159.3,22],[-159.5,21.9],[-159.8,22.1],[-159.7,22.1],[-159.6,22.2]]],[[[-166',
        '.5,60.4],[-165.7,60.3],[-165.6,59.9],[-166.2,59.8],[-166.8,59.9],[-167.5,60.2]]],[[[-153.2,58],[-152.6,57.9],[-152.1,57.',
        '6],[-153,57.1],[-154,56.7],[-154.5,57],[-154.7,57.5],[-153.8,57.8]]],[[[-141,69.7],[-141,66],[-141,60.3],[-140,60.3],[-1',
        '39,60],[-138.3,59.6],[-137.5,58.9],[-136.5,59.5],[-135.5,59.8],[-134.9,59.3],[-134.3,58.9],[-133.4,58.4],[-132.7,57.7],[',
        '-131.7,56.6],[-130,55.9],[-130,55.3],[-130.5,54.8],[-131.1,55.2],[-132,55.5],[-132.3,56.4],[-133.5,57.2],[-134.1,58.1],[',
        '-135,58.2],[-136.6,58.2],[-137.8,58.5],[-139.9,59.5],[-140.8,59.7],[-142.6,60.1],[-144,60],[-145.9,60.5],[-147.1,60.9],[',
        '-148.2,60.7],[-148,60],[-148.6,59.9],[-149.7,59.7],[-150.6,59.4],[-151.7,59.2],[-151.9,59.7],[-151.4,60.7],[-150.3,61],[',
        '-150.6,61.3],[-151.9,60.7],[-152.6,60.1],[-154,59.4],[-153.3,58.9],[-154.2,58.1],[-155.3,57.7],[-156.3,57.4],[-156.6,57]',
        ',[-158.1,56.5],[-158.4,56],[-159.6,55.6],[-160.3,55.6],[-161.2,55.4],[-162.2,55],[-163.1,54.7],[-164.8,54.4],[-164.9,54.',
        '6],[-163.8,55],[-162.9,55.3],[-161.8,55.9],[-160.6,56],[-160.1,56.4],[-158.7,57],[-158.5,57.2],[-157.7,57.6],[-157.6,58.',
        '3],[-157,58.9],[-158.2,58.6],[-158.5,58.8],[-159.1,58.4],[-159.7,58.9],[-160,58.6],[-160.4,59.1],[-161.4,58.7],[-162,58.',
        '7],[-162.1,59.3],[-161.9,59.6],[-162.5,60],[-163.8,59.8],[-164.7,60.3],[-165.3,60.5],[-165.4,61.1],[-166.1,61.5],[-165.7',
        ',62.1],[-164.9,62.6],[-164.6,63.1],[-163.8,63.2],[-163.1,63.1],[-162.3,63.5],[-161.5,63.5],[-160.8,63.8],[-161,64.2],[-1',
        '61.5,64.4],[-160.8,64.8],[-161.4,64.8],[-162.5,64.6],[-162.8,64.3],[-163.5,64.6],[-165,64.4],[-166.4,64.7],[-166.8,65.1]',
        ',[-168.1,65.7],[-166.7,66.1],[-164.5,66.6],[-163.7,66.6],[-163.8,66.1],[-161.7,66.1],[-162.5,66.7],[-163.7,67.1],[-164.4',
        ',67.6],[-165.4,68],[-166.8,68.4],[-166.2,68.9],[-164.4,68.9],[-163.2,69.4],[-162.9,69.9],[-161.9,70.3],[-160.9,70.4],[-1',
        '59,70.9],[-158.1,70.8],[-156.6,71.4],[-155.1,71.1],[-154.3,70.7],[-153.9,70.9],[-152.2,70.8],[-152.3,70.6],[-150.7,70.4]',
        ',[-149.7,70.5],[-147.6,70.2],[-145.7,70.1],[-144.9,70],[-143.6,70.2],[-142.1,69.9]]],[[[-171.7,63.8],[-171.1,63.6],[-170',
        '.5,63.7],[-169.7,63.4],[-168.7,63.3],[-168.8,63.2],[-169.5,63],[-170.3,63.2],[-170.7,63.4],[-171.6,63.3],[-171.8,63.4]]]',
        ']],["KAZ","KZ","KAZ","398","Kazakhstan",68.7,49.1,["KAZ","KZ","398","KA1","Kazakhstan"],[[[[87.4,49.2],[86.6,48.5],[85.8',
        ',48.5],[85.7,47.5],[85.2,47],[83.2,47.3],[82.5,45.5],[81.9,45.3],[80,44.9],[80.9,43.2],[80.2,42.9],[80.3,42.3],[79.6,42.',
        '5],[79.1,42.9],[77.7,43],[76,43],[75.6,42.9],[74.2,43.3],[73.6,43.1],[73.5,42.5],[71.8,42.8],[71.2,42.7],[71,42.3],[70.4',
        ',42.1],[69.1,41.4],[68.6,40.7],[68.3,40.7],[68,41.1],[66.7,41.2],[66.5,42],[66,42],[66.1,43],[64.9,43.7],[63.2,43.7],[62',
        ',43.5],[61.1,44.4],[60.2,44.8],[58.7,45.5],[58.5,45.6],[55.9,45],[56,41.3],[55.5,41.3],[54.8,42],[54.1,42.3],[52.9,42.1]',
        ',[52.5,41.8],[52.4,42],[52.7,42.4],[52.5,42.8],[51.3,43.1],[50.9,44],[50.3,44.3],[50.3,44.6],[51.3,44.5],[51.3,45.2],[52',
        '.2,45.4],[53,45.3],[53.2,46.2],[53,46.9],[52,46.8],[51.2,47],[50,46.6],[49.1,46.4],[48.6,46.6],[48.7,47.1],[48.1,47.7],[',
        '47.3,47.7],[46.5,48.4],[47,49.2],[46.8,49.4],[47.5,50.5],[48.6,49.9],[48.7,50.6],[50.8,51.7],[52.3,51.7],[54.5,51],[55.7',
        ',50.6],[56.8,51],[58.4,51.1],[59.6,50.5],[59.9,50.8],[61.3,50.8],[61.6,51.3],[60,52],[60.9,52.4],[60.7,52.7],[61.7,53],[',
        '61,53.7],[61.4,54],[65.2,54.4],[65.7,54.6],[68.2,55],[69.1,55.4],[70.9,55.2],[71.2,54.1],[72.2,54.4],[73.5,54],[73.4,53.',
        '5],[74.4,53.5],[76.9,54.5],[76.5,54.2],[77.8,53.4],[80,50.9],[80.6,51.4],[81.9,50.8],[83.4,51.1],[83.9,50.9],[84.4,50.3]',
        ',[85.1,50.1],[85.5,49.7],[86.8,49.8]]]]],["UZB","UZ","UZB","860","Uzbekistan",64,41.7,["UZB","UZ","860","Uzbekistan"],[[',
        '[[56,41.3],[55.9,45],[58.5,45.6],[58.7,45.5],[60.2,44.8],[61.1,44.4],[62,43.5],[63.2,43.7],[64.9,43.7],[66.1,43],[66,42]',
        ',[66.5,42],[66.7,41.2],[68,41.1],[68.3,40.7],[68.6,40.7],[69.1,41.4],[70.4,42.1],[71,42.3],[71.3,42.2],[70.4,41.5],[71.2',
        ',41.1],[71.9,41.4],[73.1,40.9],[71.8,40.1],[71,40.2],[70.6,40.2],[70.5,40.5],[70.7,41],[69.3,40.7],[69,40.1],[68.5,39.5]',
        ',[67.7,39.6],[67.4,39.1],[68.2,38.9],[68.4,38.2],[67.8,37.1],[67.1,37.4],[66.5,37.4],[66.5,38],[65.2,38.4],[64.2,38.9],[',
        '63.5,39.4],[62.4,40.1],[61.9,41.1],[61.5,41.3],[60.5,41.2],[60.1,41.4],[60,42.2],[58.6,42.8],[57.8,42.2],[56.9,41.8],[57',
        '.1,41.3]]]]],["PNG","PG","PNG","598","Papua New Guinea",143.9,-5.7,["PNG","PG","598","Papua New Guinea","PN1"],[[[[141,-',
        '2.6],[142.7,-3.3],[144.6,-3.9],[145.3,-4.4],[145.8,-4.9],[146,-5.5],[147.6,-6.1],[147.9,-6.6],[147,-6.7],[147.2,-7.4],[1',
        '48.1,-8],[148.7,-9.1],[149.3,-9.1],[149.3,-9.5],[150,-9.7],[149.7,-9.9],[150.8,-10.3],[150.7,-10.6],[150,-10.7],[149.8,-',
        '10.4],[148.9,-10.3],[147.9,-10.1],[147.1,-9.5],[146.6,-8.9],[146,-8.1],[144.7,-7.6],[143.9,-7.9],[143.3,-8.2],[143.4,-9]',
        ',[142.6,-9.3],[142.1,-9.2],[141,-9.1],[141,-5.9]]],[[[152.6,-3.7],[153,-4],[153.1,-4.5],[152.8,-4.8],[152.6,-4.2],[152.4',
        ',-3.8],[152,-3.5],[151.4,-3],[150.7,-2.7],[150.9,-2.5],[151.5,-2.8],[151.8,-3],[152.2,-3.2]]],[[[151.3,-5.8],[150.8,-6.1',
        '],[150.2,-6.3],[149.7,-6.3],[148.9,-6],[148.3,-5.7],[148.4,-5.4],[149.3,-5.6],[149.8,-5.5],[150,-5],[150.1,-5],[150.2,-5',
        '.5],[150.8,-5.5],[151.1,-5.1],[151.6,-4.8],[151.5,-4.2],[152.1,-4.1],[152.3,-4.3],[152.3,-4.9],[152,-5.5],[151.5,-5.6]]]',
        ',[[[154.8,-5.3],[155.1,-5.6],[155.5,-6.2],[156,-6.5],[155.9,-6.8],[155.6,-6.9],[155.2,-6.5],[154.7,-5.9],[154.5,-5.1],[1',
        '54.7,-5]]]]],["IDN","ID","IDN","360","Indonesia",101.9,-1,["IDN","ID","360","INDO","Indonesia"],[[[[141,-2.6],[141,-5.9]',
        ',[141,-9.1],[140.1,-8.3],[139.1,-8.1],[138.9,-8.4],[137.6,-8.4],[138,-7.6],[138.7,-7.3],[138.4,-6.2],[137.9,-5.4],[136,-',
        '4.5],[135.2,-4.5],[133.7,-3.5],[133.4,-4],[133,-4.1],[132.8,-3.7],[132.8,-3.3],[132,-2.8],[133.1,-2.5],[133.8,-2.5],[133',
        '.7,-2.2],[132.2,-2.2],[131.8,-1.6],[130.9,-1.4],[130.5,-0.9],[131.9,-0.7],[132.4,-0.4],[134,-0.8],[134.1,-1.2],[134.4,-2',
        '.8],[135.5,-3.4],[136.3,-2.3],[137.4,-1.7],[138.3,-1.7],[139.2,-2.1],[139.9,-2.4]]],[[[125,-8.9],[125.1,-9.1],[125.1,-9.',
        '4],[124.4,-10.1],[123.6,-10.4],[123.5,-10.2],[123.6,-9.9],[124,-9.3]]],[[[134.2,-6.9],[134.1,-6.1],[134.3,-5.8],[134.5,-',
        '5.4],[134.7,-5.7],[134.7,-6.2]]],[[[117.9,4.1],[117.3,3.2],[118,2.3],[117.9,1.8],[119,0.9],[117.8,0.8],[117.5,0.1],[117.',
        '5,-0.8],[116.6,-1.5],[116.5,-2.5],[116.1,-4],[116,-3.7],[114.9,-4.1],[114.5,-3.5],[113.8,-3.4],[113.3,-3.1],[112.1,-3.5]',
        ',[111.7,-3],[111,-3],[110.2,-2.9],[110.1,-1.6],[109.6,-1.3],[109.1,-0.5],[109,0.4],[109.1,1.3],[109.7,2],[109.8,1.3],[11',
        '0.5,0.8],[111.2,1],[111.8,0.9],[112.4,1.4],[112.9,1.5],[113.8,1.2],[114.6,1.4],[115.1,2.8],[115.5,3.2],[115.9,4.3],[117,',
        '4.3]]],[[[129.4,-2.8],[130.5,-3.1],[130.8,-3.9],[130,-3.4],[129.2,-3.4],[128.6,-3.4],[127.9,-3.4],[128.1,-2.8]]],[[[126.',
        '9,-3.8],[126.2,-3.6],[126,-3.2],[127,-3.1],[127.2,-3.5]]],[[[127.9,2.2],[128,1.6],[128.6,1.5],[128.7,1.1],[128.6,0.3],[1',
        '28.1,0.4],[128,-0.3],[128.4,-0.8],[128.1,-0.9],[127.7,-0.3],[127.4,1],[127.6,1.8]]],[[[122.9,0.9],[124.1,0.9],[125.1,1.6',
        '],[125.2,1.4],[124.4,0.4],[123.7,0.2],[122.7,0.4],[121.1,0.4],[120.2,0.2],[120,-0.5],[120.9,-1.4],[121.5,-1],[123.3,-0.6',
        '],[123.3,-1.1],[122.8,-0.9],[122.4,-1.5],[121.5,-1.9],[122.5,-3.2],[122.3,-3.5],[123.2,-4.7],[123.2,-5.3],[122.6,-5.6],[',
        '122.2,-5.3],[122.7,-4.5],[121.7,-4.9],[121.5,-4.6],[121.6,-4.2],[120.9,-3.6],[121,-2.6],[120.3,-2.9],[120.4,-4.1],[120.4',
        ',-5.5],[119.8,-5.7],[119.4,-5.4],[119.7,-4.5],[119.5,-3.5],[119.1,-3.5],[118.8,-2.8],[119.2,-2.1],[119.3,-1.4],[119.8,0.',
        '2],[120,0.6],[120.9,1.3],[121.7,1]]],[[[120.3,-10.3],[119,-9.6],[119.9,-9.4],[120.4,-9.7],[120.8,-10],[120.7,-10.2]]],[[',
        '[121.3,-8.5],[122,-8.5],[122.9,-8.1],[122.8,-8.6],[121.3,-8.9],[119.9,-8.8],[119.9,-8.4],[120.7,-8.2]]],[[[118.3,-8.4],[',
        '118.9,-8.3],[119.1,-8.7],[118,-8.9],[117.3,-9],[116.7,-9],[117.1,-8.5],[117.6,-8.4],[117.9,-8.1]]],[[[108.5,-6.4],[108.6',
        ',-6.8],[110.5,-6.9],[110.8,-6.5],[112.6,-6.9],[113,-7.6],[114.5,-7.8],[115.7,-8.4],[114.6,-8.8],[113.5,-8.3],[112.6,-8.4',
        '],[111.5,-8.3],[110.6,-8.1],[109.4,-7.7],[108.7,-7.6],[108.3,-7.8],[106.5,-7.4],[106.3,-6.9],[105.4,-6.9],[106.1,-5.9],[',
        '107.3,-6],[108.1,-6.3]]],[[[104.4,-1.1],[104.5,-1.8],[104.9,-2.3],[105.6,-2.4],[106.1,-3.1],[105.9,-4.3],[105.8,-5.9],[1',
        '04.7,-5.9],[103.9,-5],[102.6,-4.2],[102.2,-3.6],[101.4,-2.8],[100.9,-2.1],[100.1,-0.7],[99.3,0.2],[99,1],[98.6,1.8],[97.',
        '7,2.5],[97.2,3.3],[96.4,3.9],[95.4,5],[95.3,5.5],[95.9,5.4],[97.5,5.2],[98.4,4.3],[99.1,3.6],[99.7,3.2],[100.6,2.1],[101',
        '.7,2.1],[102.5,1.4],[103.1,0.6],[103.8,0.1],[103.4,-0.7],[104,-1.1]]]]],["ARG","AR","ARG","032","Argentina",-64.2,-33.5,',
        '["ARG","AR","032","Argentina"],[[[[-68.6,-52.6],[-68.2,-53.1],[-67.7,-53.8],[-66.4,-54.4],[-65,-54.7],[-65.5,-55.2],[-66',
        '.4,-55.2],[-67,-54.9],[-67.6,-54.9],[-68.6,-54.9]]],[[[-57.6,-30.2],[-57.9,-31],[-58.1,-32],[-58.1,-33],[-58.3,-33.3],[-',
        '58.4,-33.9],[-58.5,-34.4],[-57.2,-35.3],[-57.4,-36],[-56.7,-36.4],[-56.8,-36.9],[-57.7,-38.2],[-59.2,-38.7],[-61.2,-38.9',
        '],[-62.3,-38.8],[-62.1,-39.4],[-62.3,-40.2],[-62.1,-40.7],[-62.7,-41],[-63.8,-41.2],[-64.7,-40.8],[-65.1,-41.1],[-65,-42',
        '.1],[-64.3,-42.4],[-63.8,-42],[-63.5,-42.6],[-64.4,-42.9],[-65.2,-43.5],[-65.3,-44.5],[-65.6,-45],[-66.5,-45],[-67.3,-45',
        '.6],[-67.6,-46.3],[-66.6,-47],[-65.6,-47.2],[-66,-48.1],[-67.2,-48.7],[-67.8,-49.9],[-68.7,-50.3],[-69.1,-50.7],[-68.8,-',
        '51.8],[-68.1,-52.3],[-68.6,-52.3],[-69.5,-52.1],[-71.9,-52],[-72.3,-51.4],[-72.3,-50.7],[-73,-50.7],[-73.3,-50.4],[-73.4',
        ',-49.3],[-72.6,-48.9],[-72.3,-48.2],[-72.4,-47.7],[-71.9,-46.9],[-71.6,-45.6],[-71.7,-45],[-71.2,-44.8],[-71.3,-44.4],[-',
        '71.8,-44.2],[-71.5,-43.8],[-71.9,-43.4],[-72.1,-42.3],[-71.7,-42.1],[-71.9,-40.8],[-71.7,-39.8],[-71.4,-38.9],[-70.8,-38',
        '.6],[-71.1,-37.6],[-71.1,-36.7],[-70.4,-36],[-70.4,-35.2],[-69.8,-34.2],[-69.8,-33.3],[-70.1,-33.1],[-70.5,-31.4],[-69.9',
        ',-30.3],[-70,-29.4],[-69.7,-28.5],[-69,-27.5],[-68.3,-26.9],[-68.6,-26.5],[-68.4,-26.2],[-68.4,-24.5],[-67.3,-24],[-67,-',
        '23],[-67.1,-22.7],[-66.3,-21.8],[-65,-22.1],[-64.4,-22.8],[-64,-22],[-62.8,-22],[-62.7,-22.2],[-60.8,-23.9],[-60,-24],[-',
        '58.8,-24.8],[-57.8,-25.2],[-57.6,-25.6],[-58.6,-27.1],[-57.6,-27.4],[-56.5,-27.5],[-55.7,-27.4],[-54.8,-26.6],[-54.6,-25',
        '.7],[-54.1,-25.5],[-53.6,-26.1],[-53.6,-26.9],[-54.5,-27.5],[-55.2,-27.9],[-56.3,-28.9]]]]],["CHL","CL","CHL","152","Chi',
        'le",-72.3,-38.2,["CHL","CL","152","Chile"],[[[[-68.6,-52.6],[-68.6,-54.9],[-67.6,-54.9],[-67,-54.9],[-67.3,-55.3],[-68.1',
        ',-55.6],[-68.6,-55.6],[-69.2,-55.5],[-70,-55.2],[-71,-55.1],[-72.3,-54.5],[-73.3,-54],[-74.7,-52.8],[-73.8,-53],[-72.4,-',
        '53.7],[-71.1,-54.1],[-70.6,-53.6],[-70.3,-52.9],[-69.3,-52.5]]],[[[-69.6,-17.6],[-69.1,-18.3],[-69,-19],[-68.4,-19.4],[-',
        '68.8,-20.4],[-68.2,-21.5],[-67.8,-22.9],[-67.1,-22.7],[-67,-23],[-67.3,-24],[-68.4,-24.5],[-68.4,-26.2],[-68.6,-26.5],[-',
        '68.3,-26.9],[-69,-27.5],[-69.7,-28.5],[-70,-29.4],[-69.9,-30.3],[-70.5,-31.4],[-70.1,-33.1],[-69.8,-33.3],[-69.8,-34.2],',
        '[-70.4,-35.2],[-70.4,-36],[-71.1,-36.7],[-71.1,-37.6],[-70.8,-38.6],[-71.4,-38.9],[-71.7,-39.8],[-71.9,-40.8],[-71.7,-42',
        '.1],[-72.1,-42.3],[-71.9,-43.4],[-71.5,-43.8],[-71.8,-44.2],[-71.3,-44.4],[-71.2,-44.8],[-71.7,-45],[-71.6,-45.6],[-71.9',
        ',-46.9],[-72.4,-47.7],[-72.3,-48.2],[-72.6,-48.9],[-73.4,-49.3],[-73.3,-50.4],[-73,-50.7],[-72.3,-50.7],[-72.3,-51.4],[-',
        '71.9,-52],[-69.5,-52.1],[-68.6,-52.3],[-69.5,-52.3],[-69.9,-52.5],[-70.8,-52.9],[-71,-53.8],[-71.4,-53.9],[-72.6,-53.5],',
        '[-73.7,-52.8],[-74.9,-52.3],[-75.3,-51.6],[-75,-51],[-75.5,-50.4],[-75.6,-48.7],[-75.2,-47.7],[-74.1,-46.9],[-75.6,-46.6',
        '],[-74.7,-45.8],[-74.4,-44.1],[-73.2,-44.5],[-72.7,-42.4],[-73.4,-42.1],[-73.7,-43.4],[-74.3,-43.2],[-74,-41.8],[-73.7,-',
        '39.9],[-73.2,-39.3],[-73.5,-38.3],[-73.6,-37.2],[-73.2,-37.1],[-72.6,-35.5],[-71.9,-33.9],[-71.4,-32.4],[-71.7,-30.9],[-',
        '71.4,-30.1],[-71.5,-28.9],[-70.9,-27.6],[-70.7,-25.7],[-70.4,-23.6],[-70.1,-21.4],[-70.2,-19.8],[-70.4,-18.3],[-69.9,-18',
        '.1]]]]],["COD","CD","COD","180","Democratic Republic of the Congo",23.5,-1.9,["COD","CD","180","DRC","ZR","ZAR","Dem. Re',
        'p. Congo","Democratic Republic of the Congo"],[[[[29.3,-4.5],[29.5,-5.4],[29.4,-5.9],[29.6,-6.5],[30.2,-7.1],[30.7,-8.3]',
        ',[30.3,-8.2],[29,-8.4],[28.7,-8.5],[28.4,-9.2],[28.7,-9.6],[28.5,-10.8],[28.4,-11.8],[28.6,-12],[29.3,-12.4],[29.6,-12.2',
        '],[29.7,-13.3],[28.9,-13.2],[28.5,-12.7],[28.2,-12.3],[27.4,-12.1],[27.2,-11.6],[26.6,-11.9],[25.8,-11.8],[25.4,-11.3],[',
        '24.8,-11.2],[24.3,-11.3],[24.3,-11],[23.9,-10.9],[23.5,-10.9],[22.8,-11],[22.4,-11],[22.2,-11.1],[22.2,-9.9],[21.9,-9.5]',
        ',[21.8,-8.9],[21.9,-8.3],[21.7,-7.9],[21.7,-7.3],[20.5,-7.3],[20.6,-6.9],[20.1,-6.9],[20,-7.1],[19.4,-7.2],[19.2,-7.7],[',
        '19,-8],[18.5,-7.8],[18.1,-8],[17.5,-8.1],[17.1,-7.5],[16.9,-7.2],[16.6,-6.6],[16.3,-5.9],[13.4,-5.9],[13,-6],[12.7,-6],[',
        '12.3,-6.1],[12.2,-5.8],[12.4,-5.7],[12.5,-5.2],[12.6,-5],[13,-4.8],[13.3,-4.9],[13.6,-4.5],[14.1,-4.5],[14.2,-4.8],[14.6',
        ',-5],[15.2,-4.3],[15.8,-3.9],[16,-3.5],[16,-2.7],[16.4,-1.7],[16.9,-1.2],[17.5,-0.7],[17.6,-0.4],[17.7,-0.1],[17.8,0.3],',
        '[17.8,0.9],[17.9,1.7],[18.1,2.4],[18.4,2.9],[18.5,3.5],[18.5,4.2],[18.9,4.7],[19.5,5],[20.3,4.7],[20.9,4.3],[21.7,4.2],[',
        '22.4,4],[22.7,4.6],[22.8,4.7],[23.3,4.6],[24.4,5.1],[24.8,4.9],[25.1,4.9],[25.3,5.2],[25.7,5.3],[26.4,5.2],[27,5.1],[27.',
        '4,5.2],[28,4.4],[28.4,4.3],[28.7,4.5],[29.2,4.4],[29.7,4.6],[30,4.2],[30.8,3.5],[30.8,2.3],[31.2,2.2],[30.9,1.8],[30.5,1',
        '.6],[30.1,1.1],[29.9,0.6],[29.8,-0.2],[29.6,-0.6],[29.6,-1.3],[29.3,-1.6],[29.3,-2.2],[29.1,-2.3],[29,-2.8],[29.3,-3.3]]',
        ']]],["SOM","SO","SOM","706","Somalia",45.2,3.6,["SOM","SO","706","Somalia"],[[[[41.6,-1.7],[41,-0.9],[41,2.8],[41.9,3.9]',
        ',[42.1,4.2],[42.8,4.3],[43.7,5],[45,5],[47.8,8],[48.5,8.8],[48.9,9.5],[48.9,10],[48.9,11],[48.9,11.4],[49.3,11.4],[49.7,',
        '11.6],[50.3,11.7],[50.7,12],[51.1,12],[51.1,11.7],[51,11.2],[51,10.6],[50.8,10.3],[50.6,9.2],[50.1,8.1],[49.5,6.8],[48.6',
        ',5.3],[47.7,4.2],[46.6,2.9],[45.6,2],[44.1,1.1],[43.1,0.3],[42,-0.9],[41.8,-1.4]]]]],["KEN","KE","KEN","404","Kenya",37.',
        '9,0.5,["KEN","KE","404","Kenya"],[[[[39.2,-4.7],[37.8,-3.7],[37.7,-3.1],[34.1,-1.1],[33.9,-0.9],[33.9,0.1],[34.2,0.5],[3',
        '4.7,1.2],[35,1.9],[34.6,3.1],[34.5,3.6],[34,4.2],[34.6,4.8],[35.3,5.5],[35.8,5.3],[35.8,4.8],[36.2,4.4],[36.9,4.4],[38.1',
        ',3.6],[38.4,3.6],[38.7,3.6],[38.9,3.5],[39.6,3.4],[39.9,3.8],[40.8,4.3],[41.2,3.9],[41.9,3.9],[41,2.8],[41,-0.9],[41.6,-',
        '1.7],[40.9,-2.1],[40.6,-2.5],[40.3,-2.6],[40.1,-3.3],[39.8,-3.7],[39.6,-4.3]]]]],["SDN","SD","SDN","729","Sudan",29.3,16',
        '.3,["SDN","SD","729","Sudan"],[[[[24.6,8.2],[23.8,8.7],[23.5,9],[23.4,9.3],[23.6,9.7],[23.6,10.1],[23,10.7],[22.9,11.1],',
        '[22.9,11.4],[22.5,11.7],[22.5,12.3],[22.3,12.6],[21.9,12.6],[22,13],[22.3,13.4],[22.2,13.8],[22.5,14.1],[22.3,14.3],[22.',
        '6,14.9],[23,15.7],[23.9,15.6],[23.8,19.6],[23.9,20],[25,20],[25,22],[29,22],[32.9,22],[36.9,22],[37.2,21],[37,20.8],[37.',
        '1,19.8],[37.5,18.6],[37.9,18.4],[38.4,18],[37.9,17.4],[37.2,17.3],[36.9,17],[36.8,16.3],[36.3,14.8],[36.4,14.4],[36.3,13',
        '.6],[35.9,12.6],[35.3,12.1],[34.8,11.3],[34.7,10.9],[34.3,10.6],[34,9.6],[34,8.7],[34,9.5],[33.8,9.5],[33.8,10],[33.7,10',
        '.3],[33.2,10.7],[33.1,11.4],[33.2,12.2],[32.7,12.2],[32.7,12],[32.1,12],[32.3,11.7],[32.4,11.1],[31.9,10.5],[31.4,9.8],[',
        '30.8,9.7],[30,10.3],[29.6,10.1],[29.5,9.8],[29,9.6],[29,9.4],[28,9.4],[27.8,9.6],[27.1,9.6],[26.8,9.5],[26.5,9.6],[26,10',
        '.1],[25.8,10.4],[25.1,10.3],[24.8,9.8],[24.5,8.9],[24.2,8.7],[23.9,8.6]]]]],["TCD","TD","TCD","148","Chad",18.6,15.1,["T',
        'CD","TD","148","Chad"],[[[[23.8,19.6],[23.9,15.6],[23,15.7],[22.6,14.9],[22.3,14.3],[22.5,14.1],[22.2,13.8],[22.3,13.4],',
        '[22,13],[21.9,12.6],[22.3,12.6],[22.5,12.3],[22.5,11.7],[22.9,11.4],[22.9,11.1],[22.2,11],[21.7,10.6],[21,9.5],[20.1,9],',
        '[19.1,9.1],[18.8,9],[18.9,8.6],[18.4,8.3],[18,7.9],[16.7,7.5],[16.5,7.7],[16.3,7.8],[16.1,7.5],[15.3,7.4],[15.4,7.7],[15',
        '.1,8.4],[15,8.8],[14.5,9],[14,9.5],[14.2,10],[14.6,9.9],[14.9,10],[15.5,10],[14.9,10.9],[15,11.6],[14.9,12.2],[14.5,12.9',
        '],[14.6,13.3],[14,13.4],[14,14],[13.5,14.4],[14,15.7],[15.2,16.6],[15.3,17.9],[15.7,20],[15.9,20.4],[15.5,20.7],[15.5,21',
        '],[15.1,21.3],[14.9,22.9],[15.9,23.4],[19.8,21.5]]]]],["HTI","HT","HTI","332","Haiti",-72.2,19.3,["HTI","HT","332","Hait',
        'i"],[[[[-71.7,19.7],[-71.6,19.2],[-71.7,18.8],[-71.9,18.6],[-71.7,18.3],[-71.7,18],[-72.4,18.2],[-72.8,18.1],[-73.5,18.2',
        '],[-73.9,18],[-74.5,18.3],[-74.4,18.7],[-73.4,18.5],[-72.7,18.4],[-72.3,18.7],[-72.8,19.1],[-72.8,19.5],[-73.4,19.6],[-7',
        '3.2,19.9],[-72.6,19.9]]]]],["DOM","DO","DOM","214","Dominican Republic",-70.7,19.1,["DOM","DO","214","Dominican Rep.","D',
        'ominican Republic"],[[[[-71.7,18],[-71.7,18.3],[-71.9,18.6],[-71.7,18.8],[-71.6,19.2],[-71.7,19.7],[-71.6,19.9],[-70.8,1',
        '9.9],[-70.2,19.6],[-70,19.6],[-69.8,19.3],[-69.2,19.3],[-69.3,19],[-68.8,19],[-68.3,18.6],[-68.7,18.2],[-69.2,18.4],[-69',
        '.6,18.4],[-70,18.4],[-70.1,18.2],[-70.5,18.2],[-70.7,18.4],[-71,18.3],[-71.4,17.6],[-71.7,17.8]]]]],["RUS","RU","RUS","6',
        '43","Russia",44.7,58.2,["RUS","RU","643","Russia","Russian Federation"],[[[[178.7,71.1],[180,71.5],[180,70.8],[178.9,70.',
        '8]]],[[[49.1,46.4],[48.6,45.8],[47.7,45.6],[46.7,44.6],[47.6,43.7],[47.5,43],[48.6,41.8],[48,41.4],[47.8,41.2],[47.4,41.',
        '2],[46.7,41.8],[46.4,41.9],[45.8,42.1],[45.5,42.5],[44.5,42.7],[43.9,42.6],[43.8,42.7],[42.4,43.2],[40.9,43.4],[40.1,43.',
        '6],[40,43.4],[38.7,44.3],[37.5,44.7],[36.7,45.2],[37.4,45.4],[38.2,46.2],[37.7,46.6],[39.1,47],[39.1,47.3],[38.2,47.1],[',
        '38.3,47.5],[38.8,47.8],[39.7,47.9],[39.9,48.2],[39.7,48.8],[40.1,49.3],[40.1,49.6],[38.6,49.9],[38,49.9],[37.4,50.4],[36',
        '.6,50.2],[35.4,50.6],[35.4,50.8],[35,51.2],[34.2,51.3],[34.1,51.6],[34.4,51.8],[33.8,52.3],[32.7,52.2],[32.4,52.3],[32.2',
        ',52.1],[31.8,52.1],[31.5,52.7],[31.3,53.1],[31.5,53.2],[32.3,53.1],[32.7,53.4],[32.4,53.6],[31.7,53.8],[31.8,54],[31.4,5',
        '4.2],[30.8,54.8],[31,55.1],[30.9,55.6],[29.9,55.8],[29.4,55.7],[29.2,55.9],[28.2,56.2],[27.9,56.8],[27.8,57.2],[27.3,57.',
        '5],[27.7,57.8],[27.4,58.7],[28.1,59.3],[28,59.5],[29.1,60],[28.1,60.5],[30.2,61.8],[31.1,62.4],[31.5,62.9],[30,63.6],[30',
        '.4,64.2],[29.5,64.9],[30.2,65.8],[29.1,66.9],[30,67.7],[28.4,68.4],[28.6,69.1],[29.4,69.2],[31.1,69.6],[32.1,69.9],[33.8',
        ',69.3],[36.5,69.1],[40.3,67.9],[41.1,67.5],[41.1,66.8],[40,66.3],[38.4,66],[33.9,66.8],[33.2,66.6],[34.8,65.9],[34.9,65.',
        '4],[34.9,64.4],[36.2,64.1],[37,63.8],[37.1,64.3],[36.5,64.8],[37.2,65.1],[39.6,64.5],[40.4,64.8],[39.8,65.5],[42.1,66.5]',
        ',[43,66.4],[43.9,66.1],[44.5,66.8],[43.7,67.4],[44.2,68],[43.5,68.6],[46.3,68.3],[46.8,67.7],[45.6,67.6],[45.6,67],[46.3',
        ',66.7],[47.9,66.9],[48.1,67.5],[50.2,68],[53.7,68.9],[54.5,68.8],[53.5,68.2],[54.7,68.1],[55.4,68.4],[57.3,68.5],[58.8,6',
        '8.9],[59.9,68.3],[61.1,68.9],[60,69.5],[60.6,69.9],[63.5,69.5],[64.9,69.2],[68.5,68.1],[69.2,68.6],[68.2,69.1],[68.1,69.',
        '4],[66.9,69.5],[67.3,69.9],[66.7,70.7],[66.7,71],[68.5,71.9],[69.2,72.8],[69.9,73],[72.6,72.8],[72.8,72.2],[71.8,71.4],[',
        '72.5,71.1],[72.8,70.4],[72.6,69],[73.7,68.4],[73.2,67.7],[71.3,66.3],[72.4,66.2],[72.8,66.5],[73.9,66.8],[74.2,67.3],[75',
        '.1,67.8],[74.5,68.3],[74.9,69],[73.8,69.1],[73.6,69.6],[74.4,70.6],[73.1,71.4],[74.9,72.1],[74.7,72.8],[75.2,72.9],[75.7',
        ',72.3],[75.3,71.3],[76.4,71.2],[75.9,71.9],[77.6,72.3],[79.7,72.3],[81.5,71.8],[80.6,72.6],[80.5,73.6],[82.3,73.9],[84.7',
        ',73.8],[86.8,73.9],[86,74.5],[87.2,75.1],[88.3,75.1],[90.3,75.6],[92.9,75.8],[93.2,76],[95.9,76.1],[96.7,75.9],[98.9,76.',
        '4],[100.8,76.4],[101,76.9],[102,77.3],[104.4,77.7],[106.1,77.4],[104.7,77.1],[107,77],[107.2,76.5],[108.2,76.7],[111.1,7',
        '6.7],[113.3,76.2],[114.1,75.8],[113.9,75.3],[112.8,75],[110.2,74.5],[109.4,74.2],[110.6,74],[112.1,73.8],[113,74],[113.5',
        ',73.3],[114,73.6],[115.6,73.8],[118.8,73.6],[119,73.1],[123.2,73],[123.3,73.7],[125.4,73.6],[127,73.6],[128.6,73],[129.1',
        ',72.4],[128.5,72],[129.7,71.2],[131.3,70.8],[132.3,71.8],[133.9,71.4],[135.6,71.7],[137.5,71.3],[138.2,71.6],[139.9,71.5',
        '],[139.1,72.4],[140.5,72.8],[149.5,72.2],[150.4,71.6],[153,70.8],[157,71],[159,70.9],[159.8,70.5],[159.7,69.7],[160.9,69',
        '.4],[162.3,69.6],[164.1,69.7],[165.9,69.5],[167.8,69.6],[169.6,68.7],[170.8,69],[170,69.7],[170.5,70.1],[173.6,69.8],[17',
        '5.7,69.9],[178.6,69.4],[180,69],[180,65],[178.7,64.5],[177.4,64.6],[178.3,64.1],[178.9,63.3],[179.4,63],[179.5,62.6],[17',
        '9.2,62.3],[177.4,62.5],[174.6,61.8],[173.7,61.7],[172.2,61],[170.7,60.3],[170.3,59.9],[168.9,60.6],[166.3,59.8],[165.8,6',
        '0.2],[164.9,59.7],[163.5,59.9],[163.2,59.2],[162,58.2],[162.1,57.8],[163.2,57.6],[163.1,56.2],[162.1,56.1],[161.7,55.3],',
        '[162.1,54.9],[160.4,54.3],[160,53.2],[158.5,53],[158.2,51.9],[156.8,51],[156.4,51.7],[156,53.2],[155.4,55.4],[155.9,56.8',
        '],[156.8,57.4],[156.8,57.8],[158.4,58.1],[160.2,59.3],[161.9,60.3],[163.7,61.1],[164.5,62.6],[163.3,62.5],[162.7,61.6],[',
        '160.1,60.5],[159.3,61.8],[156.7,61.4],[154.2,59.8],[155,59.1],[152.8,58.9],[151.3,58.8],[151.3,59.5],[149.8,59.7],[148.5',
        ',59.2],[145.5,59.3],[142.2,59],[139,57.1],[135.1,54.7],[136.7,54.6],[137.2,54],[138.2,53.8],[138.8,54.3],[139.9,54.2],[1',
        '41.3,53.1],[141.4,52.2],[140.6,51.2],[140.5,50],[140.1,48.4],[138.6,47],[138.2,46.3],[136.9,45.1],[135.5,44],[134.9,43.4',
        '],[133.5,42.8],[132.9,42.8],[132.3,43.3],[130.9,42.6],[130.8,42.2],[130.6,42.4],[130.6,42.9],[131.1,42.9],[131.3,44.1],[',
        '131,45],[131.9,45.3],[133.1,45.1],[133.8,46.1],[134.1,47.2],[134.5,47.6],[135,48.5],[133.4,48.2],[132.5,47.8],[131,47.8]',
        ',[130.6,48.7],[129.4,49.4],[127.7,49.8],[127.3,50.7],[126.9,51.4],[126.6,51.8],[125.9,52.8],[125.1,53.2],[123.6,53.5],[1',
        '22.2,53.4],[121,53.3],[120.2,52.8],[120.7,52.5],[120.7,52],[120.2,51.6],[119.3,50.6],[119.3,50.1],[117.9,49.5],[116.7,49',
        '.9],[115.5,49.8],[115,50.1],[114.4,50.2],[112.9,49.5],[111.6,49.4],[110.7,49.1],[109.4,49.3],[108.5,49.3],[107.9,49.8],[',
        '106.9,50.3],[105.9,50.4],[104.6,50.3],[103.7,50.1],[102.3,50.5],[102.1,51.3],[100.9,51.5],[100,51.6],[98.9,52],[97.8,51]',
        ',[98.2,50.4],[97.3,49.7],[95.8,50],[94.8,50],[94.1,50.5],[93.1,50.5],[92.2,50.8],[90.7,50.3],[88.8,49.5],[87.8,49.3],[87',
        '.4,49.2],[86.8,49.8],[85.5,49.7],[85.1,50.1],[84.4,50.3],[83.9,50.9],[83.4,51.1],[81.9,50.8],[80.6,51.4],[80,50.9],[77.8',
        ',53.4],[76.5,54.2],[76.9,54.5],[74.4,53.5],[73.4,53.5],[73.5,54],[72.2,54.4],[71.2,54.1],[70.9,55.2],[69.1,55.4],[68.2,5',
        '5],[65.7,54.6],[65.2,54.4],[61.4,54],[61,53.7],[61.7,53],[60.7,52.7],[60.9,52.4],[60,52],[61.6,51.3],[61.3,50.8],[59.9,5',
        '0.8],[59.6,50.5],[58.4,51.1],[56.8,51],[55.7,50.6],[54.5,51],[52.3,51.7],[50.8,51.7],[48.7,50.6],[48.6,49.9],[47.5,50.5]',
        ',[46.8,49.4],[47,49.2],[46.5,48.4],[47.3,47.7],[48.1,47.7],[48.7,47.1],[48.6,46.6]]],[[[93.8,81],[95.9,81.3],[97.9,80.7]',
        ',[100.2,79.8],[99.9,78.9],[97.8,78.8],[95,79],[93.3,79.4],[92.5,80.1],[91.2,80.3]]],[[[102.8,79.3],[105.4,78.7],[105.1,7',
        '8.3],[99.4,77.9],[101.3,79.2],[102.1,79.3]]],[[[138.8,76.1],[141.5,76.1],[145.1,75.6],[144.3,74.8],[140.6,74.8],[139,74.',
        '6],[137,75.3],[137.5,75.9]]],[[[148.2,75.3],[150.7,75.1],[149.6,74.7],[148,74.8],[146.1,75.2],[146.4,75.5]]],[[[139.9,73',
        '.4],[140.8,73.8],[142.1,73.9],[143.5,73.5],[143.6,73.2],[142.1,73.2],[140,73.3]]],[[[44.8,80.6],[46.8,80.8],[48.3,80.8],',
        '[48.5,80.5],[49.1,80.8],[50,80.9],[51.5,80.7],[51.1,80.5],[49.8,80.4],[48.9,80.3],[48.8,80.2],[47.6,80],[46.5,80.2],[47.',
        '1,80.6]]],[[[22.7,54.3],[20.9,54.3],[19.7,54.4],[19.9,54.9],[21.3,55.2],[22.3,55],[22.8,54.9],[22.7,54.6]]],[[[53.5,73.7',
        '],[55.9,74.6],[55.6,75.1],[57.9,75.6],[61.2,76.3],[64.5,76.4],[66.2,76.8],[68.2,76.9],[68.9,76.5],[68.2,76.2],[64.6,75.7',
        '],[61.6,75.3],[58.5,74.3],[57,73.3],[55.4,72.4],[55.6,71.5],[57.5,70.7],[56.9,70.6],[53.7,70.8],[53.4,71.2],[51.6,71.5],',
        '[51.5,72],[52.5,72.2],[52.4,72.8],[54.4,73.6]]],[[[142.9,53.7],[143.3,52.7],[143.2,51.8],[143.6,50.7],[144.7,49],[143.2,',
        '49.3],[142.6,47.9],[143.5,46.8],[143.5,46.1],[142.7,46.7],[142.1,46],[141.9,46.8],[142,47.8],[141.9,48.9],[142.1,49.6],[',
        '142.2,51],[141.6,51.9],[141.7,53.3],[142.6,53.8],[142.2,54.2],[142.7,54.4]]],[[[-174.9,67.2],[-175,66.6],[-174.3,66.3],[',
        '-174.6,67.1],[-171.9,66.9],[-169.9,66],[-170.9,65.5],[-172.5,65.4],[-172.6,64.5],[-173,64.3],[-173.9,64.3],[-174.7,64.6]',
        ',[-176,64.9],[-176.2,65.4],[-177.2,65.5],[-178.4,65.4],[-178.9,65.7],[-178.7,66.1],[-179.9,65.9],[-179.4,65.4],[-180,65]',
        ',[-180,69],[-177.5,68.2]]],[[[-178.7,70.9],[-180,70.8],[-180,71.5],[-179.9,71.6],[-179,71.6],[-177.6,71.3],[-177.7,71.1]',
        ']],[[[33.4,46],[33.7,46.2],[34.4,46],[34.7,46],[34.9,45.8],[35,45.7],[35.5,45.4],[36.5,45.5],[36.3,45.1],[35.2,44.9],[33',
        '.9,44.4],[33.3,44.6],[33.5,45],[32.5,45.3],[32.6,45.5],[33.6,45.9]]]]],["BHS","BS","BHS","044","The Bahamas",-77.1,26.4,',
        '["BHS","BS","044","Bahamas","The Bahamas"],[[[[-79,26.8],[-78.5,26.9],[-77.8,26.8],[-77.8,26.6],[-78.9,26.4]]],[[[-77.8,',
        '27],[-77,26.6],[-77.2,25.9],[-77.4,26],[-77.3,26.5],[-77.8,26.9]]],[[[-78.2,25.2],[-77.9,25.2],[-77.5,24.3],[-77.5,23.8]',
        ',[-77.8,23.7],[-78,24.3],[-78.4,24.6]]]]],["FLK","FK","FLK","238","Falkland Islands",-58.7,-51.6,["FLK","FK","238","GB1"',
        ',"Falkland Is.","Falkland Islands","Falkland Islands / Malvinas","United Kingdom","B12"],[[[[-61.2,-51.8],[-60,-51.2],[-',
        '59.1,-51.5],[-58.5,-51.1],[-57.7,-51.5],[-58,-51.9],[-59.4,-52.2],[-59.8,-51.8],[-60.7,-52.3]]]]],["NOR","","","","Norwa',
        'y",9.7,61.4,["NOR","N","Norway"],[[[[15.1,79.7],[15.5,80],[17,80.1],[18.3,79.7],[21.5,79],[19,78.6],[18.5,77.8],[17.6,77',
        '.6],[17.1,76.8],[15.9,76.8],[13.8,77.4],[14.7,77.7],[13.2,78],[11.2,78.9],[10.4,79.7],[13.2,80],[13.7,79.7]]],[[[31.1,69',
        '.6],[29.4,69.2],[28.6,69.1],[29,69.8],[27.7,70.2],[26.2,69.8],[25.7,69.1],[24.7,68.6],[23.7,68.9],[22.4,68.8],[21.2,69.4',
        '],[20.6,69.1],[20,69.1],[19.9,68.4],[18,68.6],[17.7,68],[16.8,68],[16.1,67.3],[15.1,66.2],[13.6,64.8],[13.9,64.4],[13.6,',
        '64],[12.6,64.1],[11.9,63.1],[12,61.8],[12.6,61.3],[12.3,60.1],[11.5,59.4],[11,58.9],[10.4,59.5],[8.4,58.3],[7,58.1],[5.7',
        ',58.6],[5.3,59.7],[5,62],[5.9,62.6],[8.6,63.5],[10.5,64.5],[12.4,65.9],[14.8,67.8],[16.4,68.6],[19.2,69.8],[21.4,70.3],[',
        '23,70.2],[24.5,71],[26.4,71],[28.2,71.2],[31.3,70.5],[30,70.2]]],[[[27.4,80.1],[25.9,79.5],[23,79.4],[20.1,79.6],[19.9,7',
        '9.8],[18.5,79.9],[17.4,80.3],[20.5,80.6],[21.9,80.4],[22.9,80.7],[25.4,80.4]]],[[[24.7,77.9],[22.5,77.4],[20.7,77.7],[21',
        '.4,77.9],[20.8,78.3],[22.9,78.5],[23.3,78.1]]]]],["GRL","GL","GRL","304","Greenland",-39.3,74.3,["GRL","GL","304","DN1",',
        '"Greenland","Denmark"],[[[[-46.8,82.6],[-43.4,83.2],[-39.9,83.2],[-38.6,83.5],[-35.1,83.6],[-27.1,83.5],[-20.8,82.7],[-2',
        '2.7,82.3],[-26.5,82.3],[-31.9,82.2],[-31.4,82],[-27.9,82.1],[-24.8,81.8],[-22.9,82.1],[-22.1,81.7],[-23.2,81.2],[-20.6,8',
        '1.5],[-15.8,81.9],[-12.8,81.7],[-12.2,81.3],[-16.3,80.6],[-16.8,80.4],[-20,80.2],[-17.7,80.1],[-18.9,79.4],[-19.7,78.8],',
        '[-19.7,77.6],[-18.5,77],[-20,76.9],[-21.7,76.6],[-19.8,76.1],[-19.6,75.2],[-20.7,75.2],[-19.4,74.3],[-21.6,74.2],[-20.4,',
        '73.8],[-20.8,73.5],[-22.2,73.3],[-23.6,73.3],[-22.3,72.6],[-22.3,72.2],[-24.3,72.6],[-24.8,72.3],[-23.4,72.1],[-22.1,71.',
        '5],[-21.8,70.7],[-23.5,70.5],[-24.3,70.9],[-25.5,71.4],[-25.2,70.8],[-26.4,70.2],[-23.7,70.2],[-22.3,70.1],[-25,69.3],[-',
        '27.7,68.5],[-30.7,68.1],[-31.8,68.1],[-32.8,67.7],[-34.2,66.7],[-36.4,66],[-37,65.9],[-38.4,65.7],[-39.8,65.5],[-40.7,64',
        '.8],[-40.7,64.1],[-41.2,63.5],[-42.8,62.7],[-42.4,61.9],[-42.9,61.1],[-43.4,60.1],[-44.8,60],[-46.3,60.9],[-48.3,60.9],[',
        '-49.2,61.4],[-49.9,62.4],[-51.6,63.6],[-52.1,64.3],[-52.3,65.2],[-53.7,66.1],[-53.3,66.8],[-54,67.2],[-53,68.4],[-51.5,6',
        '8.7],[-51.1,69.1],[-50.9,69.9],[-52,69.6],[-52.6,69.4],[-53.5,69.3],[-54.7,69.6],[-54.8,70.3],[-54.4,70.8],[-53.4,70.8],',
        '[-51.4,70.6],[-53.1,71.2],[-54,71.5],[-55,71.4],[-55.8,71.7],[-54.7,72.6],[-55.3,73],[-56.1,73.6],[-57.3,74.7],[-58.6,75',
        '.1],[-58.6,75.5],[-61.3,76.1],[-63.4,76.2],[-66.1,76.1],[-68.5,76.1],[-69.7,76.4],[-71.4,77],[-68.8,77.3],[-66.8,77.4],[',
        '-71,77.6],[-73.3,78],[-73.2,78.4],[-69.4,78.9],[-65.7,79.4],[-65.3,79.8],[-68,80.1],[-67.2,80.5],[-63.7,81.2],[-62.2,81.',
        '3],[-62.7,81.8],[-60.3,82],[-57.2,82.2],[-54.1,82.2],[-53,81.9],[-50.4,82.4],[-48,82.1],[-46.6,82],[-44.5,81.7],[-46.9,8',
        '2.2]]]]],["ATF","TF","ATF","260","French Southern and Antarctic Lands",69.1,-49.3,["ATF","TF","260","FR1","Fr. S. Antarc',
        'tic Lands","French Southern and Antarctic Lands","France","Fr. S. and Antarctic Lands"],[[[[68.9,-48.6],[69.6,-48.9],[70',
        '.5,-49.1],[70.6,-49.3],[70.3,-49.7],[68.7,-49.8],[68.7,-49.2],[68.9,-48.8]]]]],["TLS","TL","TLS","626","East Timor",125.',
        '9,-8.8,["TLS","TL","626","TP","TMP","Timor-Leste","East Timor"],[[[[125,-8.9],[125.1,-8.7],[125.9,-8.4],[126.6,-8.4],[12',
        '7,-8.3],[127.3,-8.4],[127,-8.7],[125.9,-9.1],[125.1,-9.4],[125.1,-9.1]]]]],["ZAF","ZA","ZAF","710","South Africa",23.7,-',
        '29.7,["ZAF","ZA","710","South Africa"],[[[[16.3,-28.6],[16.8,-28.1],[17.2,-28.4],[17.4,-28.8],[17.8,-28.9],[18.5,-29],[1',
        '9,-29],[19.9,-28.5],[19.9,-24.8],[20.2,-24.9],[20.8,-25.9],[20.7,-26.5],[20.9,-26.8],[21.6,-26.7],[22.1,-26.3],[22.6,-26',
        '],[22.8,-25.5],[23.3,-25.3],[23.7,-25.4],[24.2,-25.7],[25,-25.7],[25.7,-25.5],[25.8,-25.2],[25.9,-24.7],[26.5,-24.6],[26',
        '.8,-24.2],[27.1,-23.6],[28,-22.8],[29.4,-22.1],[29.8,-22.1],[30.3,-22.3],[30.7,-22.2],[31.2,-22.3],[31.7,-23.7],[31.9,-2',
        '4.4],[31.8,-25.5],[31.8,-25.8],[31.3,-25.7],[31,-25.7],[30.9,-26],[30.7,-26.4],[30.7,-26.7],[31.3,-27.3],[31.9,-27.2],[3',
        '2.1,-26.7],[32.8,-26.7],[32.6,-27.5],[32.5,-28.3],[32.2,-28.8],[31.5,-29.3],[31.3,-29.4],[30.9,-29.9],[30.6,-30.4],[30.1',
        ',-31.1],[28.9,-32.2],[28.2,-32.8],[27.5,-33.2],[26.4,-33.6],[25.9,-33.7],[25.8,-33.9],[25.2,-33.8],[24.7,-34],[23.6,-33.',
        '8],[23,-33.9],[22.6,-33.9],[21.5,-34.3],[20.7,-34.4],[20.1,-34.8],[19.6,-34.8],[19.2,-34.5],[18.9,-34.4],[18.4,-34],[18.',
        '4,-34.1],[18.2,-33.9],[18.3,-33.3],[17.9,-32.6],[18.2,-32.4],[18.2,-31.7],[17.6,-30.7],[17.1,-29.9]],[[29,-29],[28.5,-28',
        '.6],[28.1,-28.9],[27.5,-29.2],[27,-29.9],[27.7,-30.6],[28.1,-30.5],[28.3,-30.2],[28.8,-30.1],[29,-29.7],[29.3,-29.3]]]]]',
        ',["LSO","LS","LSO","426","Lesotho",28.2,-29.5,["LSO","LS","426","Lesotho"],[[[[29,-29],[29.3,-29.3],[29,-29.7],[28.8,-30',
        '.1],[28.3,-30.2],[28.1,-30.5],[27.7,-30.6],[27,-29.9],[27.5,-29.2],[28.1,-28.9],[28.5,-28.6]]]]],["MEX","MX","MEX","484"',
        ',"Mexico",-102.3,23.9,["MEX","MX","484","Mexico"],[[[[-117.1,32.5],[-116,32.6],[-114.7,32.7],[-114.8,32.5],[-113.3,32],[',
        '-111,31.3],[-109,31.3],[-108.2,31.3],[-108.2,31.8],[-106.5,31.8],[-106.1,31.4],[-105.6,31.1],[-105,30.6],[-104.7,30.1],[',
        '-104.5,29.6],[-103.9,29.3],[-103.1,29],[-102.5,29.8],[-101.7,29.8],[-101,29.4],[-100.5,28.7],[-100.1,28.1],[-99.5,27.5],',
        '[-99.3,26.8],[-99,26.4],[-98.2,26.1],[-97.5,25.8],[-97.1,25.9],[-97.5,25],[-97.7,24.3],[-97.8,22.9],[-97.9,22.4],[-97.7,',
        '21.9],[-97.4,21.4],[-97.2,20.6],[-96.5,19.9],[-96.3,19.3],[-95.9,18.8],[-94.8,18.6],[-94.4,18.1],[-93.5,18.4],[-92.8,18.',
        '5],[-92,18.7],[-91.4,18.9],[-90.8,19.3],[-90.5,19.9],[-90.5,20.7],[-90.3,21],[-89.6,21.3],[-88.5,21.5],[-87.7,21.5],[-87',
        '.1,21.5],[-86.8,21.3],[-86.8,20.8],[-87.4,20.3],[-87.6,19.6],[-87.4,19.5],[-87.6,19],[-87.8,18.3],[-88.1,18.5],[-88.3,18',
        '.5],[-88.5,18.5],[-88.8,17.9],[-89,18],[-89.2,18],[-89.1,17.8],[-90.1,17.8],[-91,17.8],[-91,17.3],[-91.5,17.3],[-91.1,16',
        '.9],[-90.7,16.7],[-90.6,16.5],[-90.4,16.4],[-90.5,16.1],[-91.7,16.1],[-92.2,15.3],[-92.1,15.1],[-92.2,14.8],[-92.2,14.5]',
        ',[-93.4,15.6],[-93.9,15.9],[-94.7,16.2],[-95.3,16.1],[-96.1,15.8],[-96.6,15.7],[-97.3,15.9],[-98,16.1],[-98.9,16.6],[-99',
        '.7,16.7],[-100.8,17.2],[-101.7,17.6],[-101.9,17.9],[-102.5,18],[-103.5,18.3],[-103.9,18.7],[-105,19.3],[-105.5,19.9],[-1',
        '05.7,20.4],[-105.4,20.5],[-105.5,20.8],[-105.3,21.1],[-105.3,21.4],[-105.6,21.9],[-105.7,22.3],[-106,22.8],[-106.9,23.8]',
        ',[-107.9,24.5],[-108.4,25.2],[-109.3,25.6],[-109.4,25.8],[-109.3,26.4],[-109.8,26.7],[-110.4,27.2],[-110.6,27.9],[-111.2',
        ',27.9],[-111.8,28.5],[-112.2,29],[-112.3,29.3],[-112.8,30],[-113.2,30.8],[-113.1,31.2],[-113.9,31.6],[-114.2,31.5],[-114',
        '.8,31.8],[-114.9,31.4],[-114.8,30.9],[-114.7,30.2],[-114.3,29.8],[-113.6,29.1],[-113.4,28.8],[-113.3,28.8],[-113.1,28.4]',
        ',[-113,28.4],[-112.8,27.8],[-112.5,27.5],[-112.2,27.2],[-111.6,26.7],[-111.3,25.7],[-111,25.3],[-110.7,24.8],[-110.7,24.',
        '3],[-110.2,24.3],[-109.8,23.8],[-109.4,23.4],[-109.4,23.2],[-109.9,22.8],[-110,22.8],[-110.3,23.4],[-110.9,24],[-111.7,2',
        '4.5],[-112.2,24.7],[-112.1,25.5],[-112.3,26],[-112.8,26.3],[-113.5,26.8],[-113.6,26.6],[-113.8,26.9],[-114.5,27.1],[-115',
        '.1,27.7],[-115,27.8],[-114.6,27.7],[-114.2,28.1],[-114.2,28.6],[-114.9,29.3],[-115.5,29.6],[-115.9,30.2],[-116.3,30.8],[',
        '-116.7,31.6]]]]],["URY","UY","URY","858","Uruguay",-56,-33,["URY","UY","858","Uruguay"],[[[[-57.6,-30.2],[-57,-30.1],[-5',
        '6,-30.9],[-55.6,-30.9],[-54.6,-31.5],[-53.8,-32],[-53.2,-32.7],[-53.7,-33.2],[-53.4,-33.8],[-53.8,-34.4],[-54.9,-35],[-5',
        '5.7,-34.8],[-56.2,-34.9],[-57.1,-34.4],[-57.8,-34.5],[-58.4,-33.9],[-58.3,-33.3],[-58.1,-33],[-58.1,-32],[-57.9,-31]]]]]',
        ',["BRA","BR","BRA","076","Brazil",-49.6,-12.1,["BRA","BR","076","Brazil"],[[[[-53.4,-33.8],[-53.7,-33.2],[-53.2,-32.7],[',
        '-53.8,-32],[-54.6,-31.5],[-55.6,-30.9],[-56,-30.9],[-57,-30.1],[-57.6,-30.2],[-56.3,-28.9],[-55.2,-27.9],[-54.5,-27.5],[',
        '-53.6,-26.9],[-53.6,-26.1],[-54.1,-25.5],[-54.6,-25.7],[-54.4,-25.2],[-54.3,-24.6],[-54.3,-24],[-54.7,-23.8],[-55,-24],[',
        '-55.4,-24],[-55.5,-23.6],[-55.6,-22.7],[-55.8,-22.4],[-56.5,-22.1],[-56.9,-22.3],[-57.9,-22.1],[-57.9,-20.7],[-58.2,-20.',
        '2],[-57.9,-20],[-57.9,-19.4],[-57.7,-19],[-57.5,-18.2],[-57.7,-17.6],[-58.3,-17.3],[-58.4,-16.9],[-58.2,-16.3],[-60.2,-1',
        '6.3],[-60.5,-15.1],[-60.3,-15.1],[-60.3,-14.6],[-60.5,-14.4],[-60.5,-13.8],[-61.1,-13.5],[-61.7,-13.5],[-62.1,-13.2],[-6',
        '2.8,-13],[-63.2,-12.6],[-64.3,-12.5],[-65.4,-11.6],[-65.3,-10.9],[-65.4,-10.5],[-65.3,-9.8],[-66.6,-9.9],[-67.2,-10.3],[',
        '-68,-10.7],[-68.3,-11],[-68.8,-11],[-69.5,-11],[-70.1,-11.1],[-70.5,-11],[-70.5,-9.5],[-71.3,-10.1],[-72.2,-10.1],[-72.6',
        ',-9.5],[-73.2,-9.5],[-73,-9],[-73.6,-8.4],[-74,-7.5],[-73.7,-7.3],[-73.7,-6.9],[-73.1,-6.6],[-73.2,-6.1],[-73,-5.7],[-72',
        '.9,-5.3],[-71.7,-4.6],[-70.9,-4.4],[-70.8,-4.3],[-69.9,-4.3],[-69.4,-1.6],[-69.4,-1.1],[-69.6,-0.5],[-70,-0.2],[-70,0.5]',
        ',[-69.5,0.7],[-69.3,0.6],[-69.2,1],[-69.8,1.1],[-69.8,1.7],[-67.9,1.7],[-67.5,2],[-67.3,1.7],[-67.1,1.1],[-66.9,1.3],[-6',
        '6.3,0.7],[-65.5,0.8],[-65.4,1.1],[-64.6,1.3],[-64.2,1.5],[-64.1,1.9],[-63.4,2.2],[-63.4,2.4],[-64.3,2.5],[-64.4,3.1],[-6',
        '4.4,3.8],[-64.8,4.1],[-64.6,4.1],[-63.9,4],[-63.1,3.8],[-62.8,4],[-62.1,4.2],[-61,4.5],[-60.6,4.9],[-60.7,5.2],[-60.2,5.',
        '2],[-60,5],[-60.1,4.6],[-59.8,4.4],[-59.5,4],[-59.8,3.6],[-60,2.8],[-59.7,2.2],[-59.6,1.8],[-59,1.3],[-58.5,1.3],[-58.4,',
        '1.5],[-58.1,1.5],[-57.7,1.7],[-57.3,1.9],[-56.8,1.9],[-56.5,1.9],[-56,1.8],[-55.9,2],[-56.1,2.2],[-56,2.5],[-55.6,2.4],[',
        '-55.1,2.5],[-54.5,2.3],[-54.1,2.1],[-53.8,2.4],[-53.6,2.3],[-53.4,2.1],[-52.9,2.1],[-52.6,2.5],[-52.2,3.2],[-51.7,4.2],[',
        '-51.3,4.2],[-51.1,3.7],[-50.5,1.9],[-50,1.7],[-49.9,1],[-50.7,0.2],[-50.4,-0.1],[-48.6,-0.2],[-48.6,-1.2],[-47.8,-0.6],[',
        '-46.6,-0.9],[-44.9,-1.6],[-44.4,-2.1],[-44.6,-2.7],[-43.4,-2.4],[-41.5,-2.9],[-40,-2.9],[-38.5,-3.7],[-37.2,-4.8],[-36.5',
        ',-5.1],[-35.6,-5.1],[-35.2,-5.5],[-34.9,-6.7],[-34.7,-7.3],[-35.1,-9],[-35.6,-9.6],[-37,-11],[-37.7,-12.2],[-38.4,-13],[',
        '-38.7,-13.1],[-39,-13.8],[-38.9,-15.7],[-39.2,-17.2],[-39.3,-17.9],[-39.6,-18.3],[-39.8,-19.6],[-40.8,-20.9],[-40.9,-21.',
        '9],[-41.8,-22.4],[-42,-23],[-43.1,-23],[-44.6,-23.4],[-45.4,-23.8],[-46.5,-24.1],[-47.6,-24.9],[-48.5,-25.9],[-48.6,-26.',
        '6],[-48.5,-27.2],[-48.7,-28.2],[-48.9,-28.7],[-49.6,-29.2],[-50.7,-31],[-51.6,-31.8],[-52.3,-32.2],[-52.7,-33.2]]]]],["B',
        'OL","BO","BOL","068","Bolivia",-64.6,-16.7,["BOL","BO","068","Bolivia"],[[[[-69.5,-11],[-68.8,-11],[-68.3,-11],[-68,-10.',
        '7],[-67.2,-10.3],[-66.6,-9.9],[-65.3,-9.8],[-65.4,-10.5],[-65.3,-10.9],[-65.4,-11.6],[-64.3,-12.5],[-63.2,-12.6],[-62.8,',
        '-13],[-62.1,-13.2],[-61.7,-13.5],[-61.1,-13.5],[-60.5,-13.8],[-60.5,-14.4],[-60.3,-14.6],[-60.3,-15.1],[-60.5,-15.1],[-6',
        '0.2,-16.3],[-58.2,-16.3],[-58.4,-16.9],[-58.3,-17.3],[-57.7,-17.6],[-57.5,-18.2],[-57.7,-19],[-57.9,-19.4],[-57.9,-20],[',
        '-58.2,-20.2],[-58.2,-19.9],[-59.1,-19.4],[-60,-19.3],[-61.8,-19.6],[-62.3,-20.5],[-62.3,-21.1],[-62.7,-22.2],[-62.8,-22]',
        ',[-64,-22],[-64.4,-22.8],[-65,-22.1],[-66.3,-21.8],[-67.1,-22.7],[-67.8,-22.9],[-68.2,-21.5],[-68.8,-20.4],[-68.4,-19.4]',
        ',[-69,-19],[-69.1,-18.3],[-69.6,-17.6],[-69,-16.5],[-69.4,-15.7],[-69.2,-15.3],[-69.3,-15],[-68.9,-14.5],[-68.9,-13.6],[',
        '-68.9,-12.9],[-68.7,-12.6]]]]],["PER","PE","PER","604","Peru",-72.9,-13,["PER","PE","604","Peru"],[[[[-69.9,-4.3],[-70.8',
        ',-4.3],[-70.9,-4.4],[-71.7,-4.6],[-72.9,-5.3],[-73,-5.7],[-73.2,-6.1],[-73.1,-6.6],[-73.7,-6.9],[-73.7,-7.3],[-74,-7.5],',
        '[-73.6,-8.4],[-73,-9],[-73.2,-9.5],[-72.6,-9.5],[-72.2,-10.1],[-71.3,-10.1],[-70.5,-9.5],[-70.5,-11],[-70.1,-11.1],[-69.',
        '5,-11],[-68.7,-12.6],[-68.9,-12.9],[-68.9,-13.6],[-68.9,-14.5],[-69.3,-15],[-69.2,-15.3],[-69.4,-15.7],[-69,-16.5],[-69.',
        '6,-17.6],[-69.9,-18.1],[-70.4,-18.3],[-71.4,-17.8],[-71.5,-17.4],[-73.4,-16.4],[-75.2,-15.3],[-76,-14.6],[-76.4,-13.8],[',
        '-76.3,-13.5],[-77.1,-12.2],[-78.1,-10.4],[-79,-8.4],[-79.4,-7.9],[-79.8,-7.2],[-80.5,-6.5],[-81.2,-6.1],[-80.9,-5.7],[-8',
        '1.4,-4.7],[-81.1,-4],[-80.3,-3.4],[-80.2,-3.8],[-80.5,-4.1],[-80.4,-4.4],[-80,-4.3],[-79.6,-4.5],[-79.2,-5],[-78.6,-4.5]',
        ',[-78.5,-3.9],[-77.8,-3],[-76.6,-2.6],[-75.5,-1.6],[-75.2,-0.9],[-75.4,-0.2],[-75.1,-0.1],[-74.4,-0.5],[-74.1,-1],[-73.7',
        ',-1.3],[-73.1,-2.3],[-72.3,-2.4],[-71.8,-2.2],[-71.4,-2.3],[-70.8,-2.3],[-70,-2.7],[-70.7,-3.7],[-70.4,-3.8]]]]],["COL",',
        '"CO","COL","170","Colombia",-73.2,3.4,["COL","CO","170","Colombia"],[[[[-66.9,1.3],[-67.1,1.1],[-67.3,1.7],[-67.5,2],[-6',
        '7.9,1.7],[-69.8,1.7],[-69.8,1.1],[-69.2,1],[-69.3,0.6],[-69.5,0.7],[-70,0.5],[-70,-0.2],[-69.6,-0.5],[-69.4,-1.1],[-69.4',
        ',-1.6],[-69.9,-4.3],[-70.4,-3.8],[-70.7,-3.7],[-70,-2.7],[-70.8,-2.3],[-71.4,-2.3],[-71.8,-2.2],[-72.3,-2.4],[-73.1,-2.3',
        '],[-73.7,-1.3],[-74.1,-1],[-74.4,-0.5],[-75.1,-0.1],[-75.4,-0.2],[-75.8,0.1],[-76.3,0.4],[-76.6,0.3],[-77.4,0.4],[-77.7,',
        '0.8],[-77.9,0.8],[-78.9,1.4],[-79,1.7],[-78.6,1.8],[-78.7,2.3],[-78.4,2.6],[-77.9,2.7],[-77.5,3.3],[-77.1,3.8],[-77.5,4.',
        '1],[-77.3,4.7],[-77.5,5.6],[-77.3,5.8],[-77.5,6.7],[-77.9,7.2],[-77.8,7.7],[-77.4,7.6],[-77.2,7.9],[-77.5,8.5],[-77.4,8.',
        '7],[-76.8,8.6],[-76.1,9.3],[-75.7,9.4],[-75.7,9.8],[-75.5,10.6],[-74.9,11.1],[-74.3,11.1],[-74.2,11.3],[-73.4,11.2],[-72',
        '.6,11.7],[-72.2,12],[-71.8,12.4],[-71.4,12.4],[-71.1,12.1],[-71.3,11.8],[-72,11.6],[-72.2,11.1],[-72.6,10.8],[-72.9,10.5',
        '],[-73,9.7],[-73.3,9.2],[-72.8,9.1],[-72.7,8.6],[-72.4,8.4],[-72.4,8],[-72.5,7.6],[-72.4,7.4],[-72.2,7.3],[-72,7],[-70.7',
        ',7.1],[-70.1,7],[-69.4,6.1],[-69,6.2],[-68.3,6.2],[-67.7,6.3],[-67.3,6.1],[-67.5,5.6],[-67.7,5.2],[-67.8,4.5],[-67.6,3.8',
        '],[-67.3,3.5],[-67.3,3.3],[-67.8,2.8],[-67.4,2.6],[-67.2,2.3]]]]],["PAN","PA","PAN","591","Panama",-80.4,8.7,["PAN","PA"',
        ',"591","Panama"],[[[[-77.4,8.7],[-77.5,8.5],[-77.2,7.9],[-77.4,7.6],[-77.8,7.7],[-77.9,7.2],[-78.2,7.5],[-78.4,8.1],[-78',
        '.2,8.3],[-78.4,8.4],[-78.6,8.7],[-79.1,9],[-79.6,8.9],[-79.8,8.6],[-80.2,8.3],[-80.4,8.3],[-80.5,8.1],[-80,7.5],[-80.3,7',
        '.4],[-80.4,7.3],[-80.9,7.2],[-81.1,7.8],[-81.2,7.6],[-81.5,7.7],[-81.7,8.1],[-82.1,8.2],[-82.4,8.3],[-82.8,8.3],[-82.9,8',
        '.1],[-83,8.2],[-82.9,8.4],[-82.8,8.6],[-82.9,8.8],[-82.7,8.9],[-82.9,9.1],[-82.9,9.5],[-82.5,9.6],[-82.2,9.2],[-82.2,9],',
        '[-81.8,9],[-81.7,9],[-81.4,8.8],[-80.9,8.9],[-80.5,9.1],[-79.9,9.3],[-79.6,9.6],[-79,9.6],[-79.1,9.5],[-78.5,9.4],[-78.1',
        ',9.2],[-77.7,8.9]]]]],["CRI","CR","CRI","188","Costa Rica",-84.1,10.1,["CRI","CR","188","Costa Rica"],[[[[-82.5,9.6],[-8',
        '2.9,9.5],[-82.9,9.1],[-82.7,8.9],[-82.9,8.8],[-82.8,8.6],[-82.9,8.4],[-83,8.2],[-83.5,8.4],[-83.7,8.7],[-83.6,8.8],[-83.',
        '6,9.1],[-83.9,9.3],[-84.3,9.5],[-84.6,9.6],[-84.7,9.9],[-85,10.1],[-84.9,9.8],[-85.1,9.6],[-85.3,9.8],[-85.7,9.9],[-85.8',
        ',10.1],[-85.8,10.4],[-85.7,10.8],[-85.9,10.9],[-85.7,11.1],[-85.6,11.2],[-84.9,11],[-84.7,11.1],[-84.4,11],[-84.2,10.8],',
        '[-83.9,10.7],[-83.7,10.9],[-83.4,10.4],[-83,10]]]]],["NIC","NI","NIC","558","Nicaragua",-85.1,12.7,["NIC","NI","558","Ni',
        'caragua"],[[[[-83.7,10.9],[-83.9,10.7],[-84.2,10.8],[-84.4,11],[-84.7,11.1],[-84.9,11],[-85.6,11.2],[-85.7,11.1],[-86.1,',
        '11.4],[-86.5,11.8],[-86.7,12.1],[-87.2,12.5],[-87.7,12.9],[-87.6,13.1],[-87.4,12.9],[-87.3,13],[-87,13],[-86.9,13.3],[-8',
        '6.7,13.3],[-86.8,13.8],[-86.5,13.8],[-86.3,13.8],[-86.1,14],[-85.8,13.8],[-85.7,14],[-85.5,14.1],[-85.2,14.4],[-85.1,14.',
        '6],[-84.9,14.8],[-84.8,14.8],[-84.6,14.7],[-84.4,14.6],[-84.2,14.7],[-84,14.7],[-83.6,14.9],[-83.5,15],[-83.1,15],[-83.2',
        ',14.9],[-83.3,14.7],[-83.2,14.3],[-83.4,14],[-83.5,13.6],[-83.6,13.1],[-83.5,12.9],[-83.5,12.4],[-83.6,12.3],[-83.7,11.9',
        '],[-83.7,11.6],[-83.9,11.4],[-83.8,11.1]]]]],["HND","HN","HND","340","Honduras",-86.9,14.8,["HND","HN","340","Honduras"]',
        ',[[[[-83.1,15],[-83.5,15],[-83.6,14.9],[-84,14.7],[-84.2,14.7],[-84.4,14.6],[-84.6,14.7],[-84.8,14.8],[-84.9,14.8],[-85.',
        '1,14.6],[-85.2,14.4],[-85.5,14.1],[-85.7,14],[-85.8,13.8],[-86.1,14],[-86.3,13.8],[-86.5,13.8],[-86.8,13.8],[-86.7,13.3]',
        ',[-86.9,13.3],[-87,13],[-87.3,13],[-87.5,13.3],[-87.8,13.4],[-87.7,13.8],[-87.9,13.9],[-88.1,14],[-88.5,13.8],[-88.5,14]',
        ',[-88.8,14.1],[-89.1,14.3],[-89.4,14.4],[-89.1,14.7],[-89.2,14.9],[-89.2,15.1],[-88.7,15.3],[-88.2,15.7],[-88.1,15.7],[-',
        '87.9,15.9],[-87.6,15.9],[-87.5,15.8],[-87.4,15.8],[-86.9,15.8],[-86.4,15.8],[-86.1,15.9],[-86,16],[-85.7,16],[-85.4,15.9',
        '],[-85.2,15.9],[-85,16],[-84.5,15.9],[-84.4,15.8],[-84.1,15.6],[-83.8,15.4],[-83.4,15.3]]]]],["SLV","SV","SLV","222","El',
        ' Salvador",-88.9,13.7,["SLV","SV","222","El Salvador"],[[[[-89.4,14.4],[-89.1,14.3],[-88.8,14.1],[-88.5,14],[-88.5,13.8]',
        ',[-88.1,14],[-87.9,13.9],[-87.7,13.8],[-87.8,13.4],[-87.9,13.1],[-88.5,13.2],[-88.8,13.3],[-89.3,13.5],[-89.8,13.5],[-90',
        '.1,13.7],[-90.1,13.9],[-89.7,14.1],[-89.5,14.2],[-89.6,14.4]]]]],["GTM","GT","GTM","320","Guatemala",-90.5,15,["GTM","GT',
        '","320","Guatemala"],[[[[-92.2,14.5],[-92.2,14.8],[-92.1,15.1],[-92.2,15.3],[-91.7,16.1],[-90.5,16.1],[-90.4,16.4],[-90.',
        '6,16.5],[-90.7,16.7],[-91.1,16.9],[-91.5,17.3],[-91,17.3],[-91,17.8],[-90.1,17.8],[-89.1,17.8],[-89.2,17],[-89.2,15.9],[',
        '-88.9,15.9],[-88.6,15.7],[-88.5,15.9],[-88.2,15.7],[-88.7,15.3],[-89.2,15.1],[-89.2,14.9],[-89.1,14.7],[-89.4,14.4],[-89',
        '.6,14.4],[-89.5,14.2],[-89.7,14.1],[-90.1,13.9],[-90.1,13.7],[-90.6,13.9],[-91.2,13.9],[-91.7,14.1]]]]],["BLZ","BZ","BLZ',
        '","084","Belize",-88.7,17.2,["BLZ","BZ","084","Belize"],[[[[-89.1,17.8],[-89.2,18],[-89,18],[-88.8,17.9],[-88.5,18.5],[-',
        '88.3,18.5],[-88.3,18.4],[-88.1,18.3],[-88.1,18.1],[-88.3,17.6],[-88.2,17.5],[-88.3,17.1],[-88.2,17],[-88.4,16.5],[-88.6,',
        '16.3],[-88.7,16.2],[-88.9,15.9],[-89.2,15.9],[-89.2,17]]]]],["VEN","VE","VEN","862","Venezuela",-64.6,7.2,["VEN","VE","8',
        '62","Venezuela"],[[[[-60.7,5.2],[-60.6,4.9],[-61,4.5],[-62.1,4.2],[-62.8,4],[-63.1,3.8],[-63.9,4],[-64.6,4.1],[-64.8,4.1',
        '],[-64.4,3.8],[-64.4,3.1],[-64.3,2.5],[-63.4,2.4],[-63.4,2.2],[-64.1,1.9],[-64.2,1.5],[-64.6,1.3],[-65.4,1.1],[-65.5,0.8',
        '],[-66.3,0.7],[-66.9,1.3],[-67.2,2.3],[-67.4,2.6],[-67.8,2.8],[-67.3,3.3],[-67.3,3.5],[-67.6,3.8],[-67.8,4.5],[-67.7,5.2',
        '],[-67.5,5.6],[-67.3,6.1],[-67.7,6.3],[-68.3,6.2],[-69,6.2],[-69.4,6.1],[-70.1,7],[-70.7,7.1],[-72,7],[-72.2,7.3],[-72.4',
        ',7.4],[-72.5,7.6],[-72.4,8],[-72.4,8.4],[-72.7,8.6],[-72.8,9.1],[-73.3,9.2],[-73,9.7],[-72.9,10.5],[-72.6,10.8],[-72.2,1',
        '1.1],[-72,11.6],[-71.3,11.8],[-71.4,11.5],[-71.9,11.4],[-71.6,11],[-71.6,10.4],[-72.1,9.9],[-71.7,9.1],[-71.3,9.1],[-71,',
        '9.9],[-71.4,10.2],[-71.4,11],[-70.2,11.4],[-70.3,11.8],[-69.9,12.2],[-69.6,11.5],[-68.9,11.4],[-68.2,10.9],[-68.2,10.6],',
        '[-67.3,10.5],[-66.2,10.6],[-65.7,10.2],[-64.9,10.1],[-64.3,10.4],[-64.3,10.6],[-63.1,10.7],[-61.9,10.7],[-62.7,10.4],[-6',
        '2.4,9.9],[-61.6,9.9],[-60.8,9.4],[-60.7,8.6],[-60.2,8.6],[-59.8,8.4],[-60.6,7.8],[-60.6,7.4],[-60.3,7],[-60.5,6.9],[-61.',
        '2,6.7],[-61.1,6.2],[-61.4,6]]]]],["GUY","GY","GUY","328","Guyana",-58.9,5.1,["GUY","GY","328","Guyana"],[[[[-56.5,1.9],[',
        '-56.8,1.9],[-57.3,1.9],[-57.7,1.7],[-58.1,1.5],[-58.4,1.5],[-58.5,1.3],[-59,1.3],[-59.6,1.8],[-59.7,2.2],[-60,2.8],[-59.',
        '8,3.6],[-59.5,4],[-59.8,4.4],[-60.1,4.6],[-60,5],[-60.2,5.2],[-60.7,5.2],[-61.4,6],[-61.1,6.2],[-61.2,6.7],[-60.5,6.9],[',
        '-60.3,7],[-60.6,7.4],[-60.6,7.8],[-59.8,8.4],[-59.1,8],[-58.5,7.3],[-58.5,6.8],[-58.1,6.8],[-57.5,6.3],[-57.1,6],[-57.3,',
        '5.1],[-57.9,4.8],[-57.9,4.6],[-58,4.1],[-57.6,3.3],[-57.3,3.3],[-57.2,2.8]]]]],["SUR","SR","SUR","740","Suriname",-55.9,',
        '4.1,["SUR","SR","740","Suriname"],[[[[-54.5,2.3],[-55.1,2.5],[-55.6,2.4],[-56,2.5],[-56.1,2.2],[-55.9,2],[-56,1.8],[-56.',
        '5,1.9],[-57.2,2.8],[-57.3,3.3],[-57.6,3.3],[-58,4.1],[-57.9,4.6],[-57.9,4.8],[-57.3,5.1],[-57.1,6],[-55.9,5.8],[-55.8,6]',
        ',[-55,6],[-54,5.8],[-54.5,4.9],[-54.4,4.2],[-54,3.6],[-54.2,3.2],[-54.3,2.7]]]]],["FRA","","","","France",2.6,46.7,["FRA',
        '","FR1","F","FR","France"],[[[[-51.7,4.2],[-52.2,3.2],[-52.6,2.5],[-52.9,2.1],[-53.4,2.1],[-53.6,2.3],[-53.8,2.4],[-54.1',
        ',2.1],[-54.5,2.3],[-54.3,2.7],[-54.2,3.2],[-54,3.6],[-54.4,4.2],[-54.5,4.9],[-54,5.8],[-53.6,5.6],[-52.9,5.4],[-51.8,4.6',
        ']]],[[[6.2,49.5],[6.7,49.2],[8.1,49],[7.6,48.3],[7.5,47.6],[7.2,47.4],[6.7,47.5],[6.8,47.3],[6,46.7],[6,46.3],[6.5,46.4]',
        ',[6.8,46],[6.8,45.7],[7.1,45.3],[6.7,45],[7,44.3],[7.5,44.1],[7.4,43.7],[6.5,43.1],[4.6,43.4],[3.1,43.1],[3,42.5],[1.8,4',
        '2.3],[0.7,42.8],[0.3,42.6],[-1.5,43],[-1.9,43.4],[-1.4,44],[-1.2,46],[-2.2,47.1],[-3,47.6],[-4.5,48],[-4.6,48.7],[-3.3,4',
        '8.9],[-1.6,48.6],[-1.9,49.8],[-1,49.3],[1.3,50.1],[1.6,50.9],[2.5,51.1],[2.7,50.8],[3.1,50.8],[3.6,50.4],[4.3,49.9],[4.8',
        ',50],[5.7,49.5],[5.9,49.4]]],[[[8.7,42.6],[9.4,43],[9.6,42.2],[9.2,41.4],[8.8,41.6],[8.5,42.3]]]]],["ECU","EC","ECU","21',
        '8","Ecuador",-78.2,-1.3,["ECU","EC","218","Ecuador"],[[[[-75.4,-0.2],[-75.2,-0.9],[-75.5,-1.6],[-76.6,-2.6],[-77.8,-3],[',
        '-78.5,-3.9],[-78.6,-4.5],[-79.2,-5],[-79.6,-4.5],[-80,-4.3],[-80.4,-4.4],[-80.5,-4.1],[-80.2,-3.8],[-80.3,-3.4],[-79.8,-',
        '2.7],[-80,-2.2],[-80.4,-2.7],[-81,-2.2],[-80.8,-2],[-80.9,-1.1],[-80.6,-0.9],[-80.4,-0.3],[-80,0.4],[-80.1,0.8],[-79.5,1',
        '],[-78.9,1.4],[-77.9,0.8],[-77.7,0.8],[-77.4,0.4],[-76.6,0.3],[-76.3,0.4],[-75.8,0.1]]]]],["PRI","PR","PRI","630","Puert',
        'o Rico",-66.5,18.2,["PRI","PR","630","US1","Puerto Rico","United States of America"],[[[[-66.3,18.5],[-65.8,18.4],[-65.6',
        ',18.2],[-65.8,18],[-66.6,18],[-67.2,17.9],[-67.2,18.4],[-67.1,18.5]]]]],["JAM","JM","JAM","388","Jamaica",-77.3,18.1,["J',
        'AM","JM","388","J","Jamaica"],[[[[-77.6,18.5],[-76.9,18.4],[-76.4,18.2],[-76.2,17.9],[-76.9,17.9],[-77.2,17.7],[-77.8,17',
        '.9],[-78.3,18.2],[-78.2,18.5],[-77.8,18.5]]]]],["CUB","CU","CUB","192","Cuba",-78,21.3,["CUB","CU","192","CU1","Cuba"],[',
        '[[[-82.3,23.2],[-81.4,23.1],[-80.6,23.1],[-79.7,22.8],[-79.3,22.4],[-78.3,22.5],[-78,22.3],[-77.1,21.7],[-76.5,21.2],[-7',
        '6.2,21.2],[-75.6,21],[-75.7,20.7],[-74.9,20.7],[-74.2,20.3],[-74.3,20.1],[-75,19.9],[-75.6,19.9],[-76.3,20],[-77.8,19.9]',
        ',[-77.1,20.4],[-77.5,20.7],[-78.1,20.7],[-78.5,21],[-78.7,21.6],[-79.3,21.6],[-80.2,21.8],[-80.5,22],[-81.8,22.2],[-82.2',
        ',22.4],[-81.8,22.6],[-82.8,22.7],[-83.5,22.2],[-83.9,22.2],[-84.1,21.9],[-84.5,21.8],[-85,21.9],[-84.4,22.2],[-84.2,22.6',
        '],[-83.8,22.8],[-83.3,23],[-82.5,23.1]]]]],["ZWE","ZW","ZWE","716","Zimbabwe",29.9,-18.9,["ZWE","ZW","716","Zimbabwe"],[',
        '[[[31.2,-22.3],[30.7,-22.2],[30.3,-22.3],[29.8,-22.1],[29.4,-22.1],[28.8,-21.6],[28,-21.5],[27.7,-20.9],[27.7,-20.5],[27',
        '.3,-20.4],[26.2,-19.3],[25.9,-18.7],[25.6,-18.5],[25.3,-17.7],[26.4,-17.8],[26.7,-18],[27,-17.9],[27.6,-17.3],[28.5,-16.',
        '5],[28.8,-16.4],[28.9,-16],[29.5,-15.6],[30.3,-15.5],[30.3,-15.9],[31.2,-15.9],[31.6,-16.1],[31.9,-16.3],[32.3,-16.4],[3',
        '2.8,-16.7],[32.8,-18],[32.7,-18.7],[32.6,-19.4],[32.8,-19.7],[32.7,-20.3],[32.5,-20.4],[32.2,-21.1]]]]],["BWA","BW","BWA',
        '","072","Botswana",24.2,-22.1,["BWA","BW","072","Botswana"],[[[[29.4,-22.1],[28,-22.8],[27.1,-23.6],[26.8,-24.2],[26.5,-',
        '24.6],[25.9,-24.7],[25.8,-25.2],[25.7,-25.5],[25,-25.7],[24.2,-25.7],[23.7,-25.4],[23.3,-25.3],[22.8,-25.5],[22.6,-26],[',
        '22.1,-26.3],[21.6,-26.7],[20.9,-26.8],[20.7,-26.5],[20.8,-25.9],[20.2,-24.9],[19.9,-24.8],[19.9,-21.8],[20.9,-21.8],[20.',
        '9,-18.3],[21.7,-18.2],[23.2,-17.9],[23.6,-18.3],[24.2,-17.9],[24.5,-17.9],[25.1,-17.7],[25.3,-17.7],[25.6,-18.5],[25.9,-',
        '18.7],[26.2,-19.3],[27.3,-20.4],[27.7,-20.5],[27.7,-20.9],[28,-21.5],[28.8,-21.6]]]]],["NAM","NA","NAM","516","Namibia",',
        '17.1,-20.6,["NAM","NA","516","Namibia"],[[[[19.9,-24.8],[19.9,-28.5],[19,-29],[18.5,-29],[17.8,-28.9],[17.4,-28.8],[17.2',
        ',-28.4],[16.8,-28.1],[16.3,-28.6],[15.6,-27.8],[15.2,-27.1],[15,-26.1],[14.7,-25.4],[14.4,-23.9],[14.4,-22.7],[14.3,-22.',
        '1],[13.9,-21.7],[13.4,-20.9],[12.8,-19.7],[12.6,-19],[11.8,-18.1],[11.7,-17.3],[12.2,-17.1],[12.8,-16.9],[13.5,-17],[14.',
        '1,-17.4],[14.2,-17.4],[18.3,-17.3],[19,-17.8],[21.4,-17.9],[23.2,-17.5],[24,-17.3],[24.7,-17.4],[25.1,-17.6],[25.1,-17.7',
        '],[24.5,-17.9],[24.2,-17.9],[23.6,-18.3],[23.2,-17.9],[21.7,-18.2],[20.9,-18.3],[20.9,-21.8],[19.9,-21.8]]]]],["SEN","SN',
        '","SEN","686","Senegal",-14.8,15.1,["SEN","SN","686","Senegal"],[[[[-16.7,13.6],[-17.1,14.4],[-17.6,14.7],[-17.2,14.9],[',
        '-16.7,15.6],[-16.5,16.1],[-16.1,16.5],[-15.6,16.4],[-15.1,16.6],[-14.6,16.6],[-14.1,16.3],[-13.4,16],[-12.8,15.3],[-12.2',
        ',14.6],[-12.1,14],[-11.9,13.4],[-11.6,13.1],[-11.5,12.8],[-11.5,12.4],[-11.7,12.4],[-12.2,12.5],[-12.3,12.4],[-12.5,12.3',
        '],[-13.2,12.6],[-13.7,12.6],[-15.5,12.6],[-15.8,12.5],[-16.1,12.5],[-16.7,12.4],[-16.8,13.2],[-15.9,13.1],[-15.7,13.3],[',
        '-15.5,13.3],[-15.1,13.5],[-14.7,13.3],[-14.3,13.3],[-13.8,13.5],[-14,13.8],[-14.4,13.6],[-14.7,13.6],[-15.1,13.9],[-15.4',
        ',13.9],[-15.6,13.6]]]]],["MLI","ML","MLI","466","Mali",-2,18.7,["MLI","ML","466","Mali"],[[[[-11.5,12.4],[-11.5,12.8],[-',
        '11.6,13.1],[-11.9,13.4],[-12.1,14],[-12.2,14.6],[-11.8,14.8],[-11.7,15.4],[-11.3,15.4],[-10.7,15.1],[-10.1,15.3],[-9.7,1',
        '5.3],[-9.6,15.5],[-5.5,15.5],[-5.3,16.2],[-5.5,16.3],[-6,20.6],[-6.5,25],[-4.9,25],[-1.6,22.8],[1.8,20.6],[2.1,20.1],[2.',
        '7,19.9],[3.1,19.7],[3.2,19.1],[4.3,19.2],[4.3,16.9],[3.7,16.2],[3.6,15.6],[2.7,15.4],[1.4,15.3],[1,15],[0.4,14.9],[-0.3,',
        '14.9],[-0.5,15.1],[-1.1,15],[-2,14.6],[-2.2,14.2],[-3,13.8],[-3.1,13.5],[-3.5,13.3],[-4,13.5],[-4.3,13.2],[-4.4,12.5],[-',
        '5.2,11.7],[-5.2,11.4],[-5.5,11],[-5.4,10.4],[-5.8,10.2],[-6.1,10.1],[-6.2,10.5],[-6.5,10.4],[-6.7,10.4],[-6.9,10.1],[-7.',
        '6,10.1],[-7.9,10.3],[-8,10.2],[-8.3,10.5],[-8.3,10.8],[-8.4,10.9],[-8.6,10.8],[-8.6,11.1],[-8.4,11.4],[-8.8,11.8],[-8.9,',
        '12.1],[-9.1,12.3],[-9.3,12.3],[-9.6,12.2],[-9.9,12.1],[-10.2,11.8],[-10.6,11.9],[-10.9,12.2],[-11,12.2],[-11.3,12.1],[-1',
        '1.5,12.1]]]]],["MRT","MR","MRT","478","Mauritania",-9.7,19.6,["MRT","MR","478","Mauritania"],[[[[-17.1,21],[-16.8,21.3],',
        '[-12.9,21.3],[-13.1,22.8],[-12.9,23.3],[-11.9,23.4],[-12,25.9],[-8.7,25.9],[-8.7,27.4],[-4.9,25],[-6.5,25],[-6,20.6],[-5',
        '.5,16.3],[-5.3,16.2],[-5.5,15.5],[-9.6,15.5],[-9.7,15.3],[-10.1,15.3],[-10.7,15.1],[-11.3,15.4],[-11.7,15.4],[-11.8,14.8',
        '],[-12.2,14.6],[-12.8,15.3],[-13.4,16],[-14.1,16.3],[-14.6,16.6],[-15.1,16.6],[-15.6,16.4],[-16.1,16.5],[-16.5,16.1],[-1',
        '6.5,16.7],[-16.3,17.2],[-16.1,18.1],[-16.3,19.1],[-16.4,19.6],[-16.3,20.1],[-16.5,20.6]]]]],["BEN","BJ","BEN","204","Ben',
        'in",2.4,10.3,["BEN","BJ","204","Benin"],[[[[2.7,6.3],[1.9,6.1],[1.6,6.8],[1.7,9.1],[1.5,9.3],[1.4,9.8],[1.1,10.2],[0.8,1',
        '0.5],[0.9,11],[1.2,11.1],[1.4,11.5],[1.9,11.6],[2.2,11.9],[2.5,12.2],[2.8,12.2],[3.6,11.7],[3.6,11.3],[3.8,10.7],[3.6,10',
        '.3],[3.7,10.1],[3.2,9.4],[2.9,9.1],[2.7,8.5],[2.7,7.9]]]]],["NER","NE","NER","562","Niger",9.5,17.4,["NER","NE","562","N',
        'iger"],[[[[14.9,22.9],[15.1,21.3],[15.5,21],[15.5,20.7],[15.9,20.4],[15.7,20],[15.3,17.9],[15.2,16.6],[14,15.7],[13.5,14',
        '.4],[14,14],[14,13.4],[14.6,13.3],[14.5,12.9],[14.2,12.8],[14.2,12.5],[14,12.5],[13.3,13.6],[13.1,13.6],[12.3,13],[11.5,',
        '13.3],[11,13.4],[10.7,13.2],[10.1,13.3],[9.5,12.9],[9,12.8],[7.8,13.3],[7.3,13.1],[6.8,13.1],[6.4,13.5],[5.4,13.9],[4.4,',
        '13.7],[4.1,13.5],[4,13],[3.7,12.6],[3.6,11.7],[2.8,12.2],[2.5,12.2],[2.2,11.9],[2.2,12.6],[1,12.9],[1,13.3],[0.4,14],[0.',
        '3,14.4],[0.4,14.9],[1,15],[1.4,15.3],[2.7,15.4],[3.6,15.6],[3.7,16.2],[4.3,16.9],[4.3,19.2],[5.7,19.6],[8.6,21.6],[12,23',
        '.5],[13.6,23],[14.1,22.5]]]]],["NGA","NG","NGA","566","Nigeria",7.5,9.4,["NGA","NG","566","Nigeria"],[[[[2.7,6.3],[2.7,7',
        '.9],[2.7,8.5],[2.9,9.1],[3.2,9.4],[3.7,10.1],[3.6,10.3],[3.8,10.7],[3.6,11.3],[3.6,11.7],[3.7,12.6],[4,13],[4.1,13.5],[4',
        '.4,13.7],[5.4,13.9],[6.4,13.5],[6.8,13.1],[7.3,13.1],[7.8,13.3],[9,12.8],[9.5,12.9],[10.1,13.3],[10.7,13.2],[11,13.4],[1',
        '1.5,13.3],[12.3,13],[13.1,13.6],[13.3,13.6],[14,12.5],[14.2,12.5],[14.6,12.1],[14.5,11.9],[14.4,11.6],[13.6,10.8],[13.3,',
        '10.2],[13.2,9.6],[13,9.4],[12.8,8.7],[12.2,8.3],[12.1,7.8],[11.8,7.4],[11.7,7],[11.1,6.6],[10.5,7.1],[10.1,7],[9.5,6.5],',
        '[9.2,6.4],[8.8,5.5],[8.5,4.8],[7.5,4.4],[7.1,4.5],[6.7,4.2],[5.9,4.3],[5.4,4.9],[5,5.6],[4.3,6.3],[3.6,6.3]]]]],["CMR","',
        'CM","CMR","120","Cameroon",12.5,4.6,["CMR","CM","120","Cameroon"],[[[[14.5,12.9],[14.9,12.2],[15,11.6],[14.9,10.9],[15.5',
        ',10],[14.9,10],[14.6,9.9],[14.2,10],[14,9.5],[14.5,9],[15,8.8],[15.1,8.4],[15.4,7.7],[15.3,7.4],[14.8,6.4],[14.5,6.2],[1',
        '4.5,5.5],[14.6,5],[14.5,4.7],[15,4.2],[15,3.9],[15.4,3.3],[15.9,3],[15.9,2.6],[16,2.3],[15.9,1.7],[15.1,2],[14.3,2.2],[1',
        '3.1,2.3],[13,2.3],[12.4,2.2],[11.8,2.3],[11.3,2.3],[9.6,2.3],[9.8,3.1],[9.4,3.7],[8.9,3.9],[8.7,4.4],[8.5,4.5],[8.5,4.8]',
        ',[8.8,5.5],[9.2,6.4],[9.5,6.5],[10.1,7],[10.5,7.1],[11.1,6.6],[11.7,7],[11.8,7.4],[12.1,7.8],[12.2,8.3],[12.8,8.7],[13,9',
        '.4],[13.2,9.6],[13.3,10.2],[13.6,10.8],[14.4,11.6],[14.5,11.9],[14.6,12.1],[14.2,12.5],[14.2,12.8]]]]],["TGO","TG","TGO"',
        ',"768","Togo",1.1,8.8,["TGO","TG","768","Togo"],[[[[0.9,11],[0.8,10.5],[1.1,10.2],[1.4,9.8],[1.5,9.3],[1.7,9.1],[1.6,6.8',
        '],[1.9,6.1],[1.1,5.9],[0.8,6.3],[0.6,6.9],[0.5,7.4],[0.7,8.3],[0.5,8.7],[0.4,9.5],[0.4,10.2],[0,10.7],[0,11]]]]],["GHA",',
        '"GH","GHA","288","Ghana",-1,7.7,["GHA","GH","288","Ghana"],[[[[0,11],[0,10.7],[0.4,10.2],[0.4,9.5],[0.5,8.7],[0.7,8.3],[',
        '0.5,7.4],[0.6,6.9],[0.8,6.3],[1.1,5.9],[-0.5,5.3],[-1.1,5],[-2,4.7],[-2.9,5],[-2.8,5.4],[-3.2,6.3],[-3,7.4],[-2.6,8.2],[',
        '-2.8,9.6],[-3,10.4],[-2.9,11],[-1.2,11],[-0.8,10.9],[-0.4,11.1]]]]],["CIV","CI","CIV","384","Ivory Coast",-5.6,7.5,["CIV',
        '","CI","384","Côte d\'Ivoire","Ivory Coast"],[[[[-8,10.2],[-7.9,10.3],[-7.6,10.1],[-6.9,10.1],[-6.7,10.4],[-6.5,10.4],[-6',
        '.2,10.5],[-6.1,10.1],[-5.8,10.2],[-5.4,10.4],[-5,10.2],[-4.8,9.8],[-4.3,9.6],[-4,9.9],[-3.5,9.9],[-2.8,9.6],[-2.6,8.2],[',
        '-3,7.4],[-3.2,6.3],[-2.8,5.4],[-2.9,5],[-3.3,5],[-4,5.2],[-4.6,5.2],[-5.8,5],[-6.5,4.7],[-7.5,4.3],[-7.7,4.4],[-7.6,5.2]',
        ',[-7.5,5.3],[-7.6,5.7],[-8,6.1],[-8.3,6.2],[-8.6,6.5],[-8.4,6.9],[-8.5,7.4],[-8.4,7.7],[-8.3,7.7],[-8.2,8.1],[-8.3,8.3],',
        '[-8.2,8.5],[-7.8,8.6],[-8.1,9.4],[-8.3,9.8],[-8.2,10.1]]]]],["GIN","GN","GIN","324","Guinea",-10,10.6,["GIN","GN","324",',
        '"Guinea"],[[[[-13.7,12.6],[-13.2,12.6],[-12.5,12.3],[-12.3,12.4],[-12.2,12.5],[-11.7,12.4],[-11.5,12.4],[-11.5,12.1],[-1',
        '1.3,12.1],[-11,12.2],[-10.9,12.2],[-10.6,11.9],[-10.2,11.8],[-9.9,12.1],[-9.6,12.2],[-9.3,12.3],[-9.1,12.3],[-8.9,12.1],',
        '[-8.8,11.8],[-8.4,11.4],[-8.6,11.1],[-8.6,10.8],[-8.4,10.9],[-8.3,10.8],[-8.3,10.5],[-8,10.2],[-8.2,10.1],[-8.3,9.8],[-8',
        '.1,9.4],[-7.8,8.6],[-8.2,8.5],[-8.3,8.3],[-8.2,8.1],[-8.3,7.7],[-8.4,7.7],[-8.7,7.7],[-8.9,7.3],[-9.2,7.3],[-9.4,7.5],[-',
        '9.3,7.9],[-9.8,8.5],[-10,8.4],[-10.2,8.4],[-10.5,8.3],[-10.5,8.7],[-10.7,9],[-10.6,9.3],[-10.8,9.7],[-11.1,10],[-11.9,10',
        '],[-12.2,9.9],[-12.4,9.8],[-12.6,9.6],[-12.7,9.3],[-13.2,8.9],[-13.7,9.5],[-14.1,9.9],[-14.3,10],[-14.6,10.2],[-14.7,10.',
        '7],[-14.8,10.9],[-15.1,11],[-14.7,11.5],[-14.4,11.5],[-14.1,11.7],[-13.9,11.7],[-13.7,11.8],[-13.8,12.1],[-13.7,12.2]]]]',
        '],["GNB","GW","GNB","624","Guinea-Bissau",-14.5,12.2,["GNB","GW","624","Guinea-Bissau"],[[[[-16.7,12.4],[-16.1,12.5],[-1',
        '5.8,12.5],[-15.5,12.6],[-13.7,12.6],[-13.7,12.2],[-13.8,12.1],[-13.7,11.8],[-13.9,11.7],[-14.1,11.7],[-14.4,11.5],[-14.7',
        ',11.5],[-15.1,11],[-15.7,11.5],[-16.1,11.5],[-16.3,11.8],[-16.3,12],[-16.6,12.2]]]]],["LBR","LR","LBR","430","Liberia",-',
        '9.5,6.4,["LBR","LR","430","Liberia"],[[[[-8.4,7.7],[-8.5,7.4],[-8.4,6.9],[-8.6,6.5],[-8.3,6.2],[-8,6.1],[-7.6,5.7],[-7.5',
        ',5.3],[-7.6,5.2],[-7.7,4.4],[-8,4.4],[-9,4.8],[-9.9,5.6],[-10.8,6.1],[-11.4,6.8],[-11.2,7.1],[-11.1,7.4],[-10.7,7.9],[-1',
        '0.2,8.4],[-10,8.4],[-9.8,8.5],[-9.3,7.9],[-9.4,7.5],[-9.2,7.3],[-8.9,7.3],[-8.7,7.7]]]]],["SLE","SL","SLE","694","Sierra',
        ' Leone",-11.8,8.6,["SLE","SL","694","Sierra Leone"],[[[[-13.2,8.9],[-12.7,9.3],[-12.6,9.6],[-12.4,9.8],[-12.2,9.9],[-11.',
        '9,10],[-11.1,10],[-10.8,9.7],[-10.6,9.3],[-10.7,9],[-10.5,8.7],[-10.5,8.3],[-10.2,8.4],[-10.7,7.9],[-11.1,7.4],[-11.2,7.',
        '1],[-11.4,6.8],[-11.7,6.9],[-12.4,7.3],[-12.9,7.8],[-13.1,8.2]]]]],["BFA","BF","BFA","854","Burkina Faso",-1.4,12.7,["BF',
        'A","BF","854","Burkina Faso"],[[[[-5.4,10.4],[-5.5,11],[-5.2,11.4],[-5.2,11.7],[-4.4,12.5],[-4.3,13.2],[-4,13.5],[-3.5,1',
        '3.3],[-3.1,13.5],[-3,13.8],[-2.2,14.2],[-2,14.6],[-1.1,15],[-0.5,15.1],[-0.3,14.9],[0.4,14.9],[0.3,14.4],[0.4,14],[1,13.',
        '3],[1,12.9],[2.2,12.6],[2.2,11.9],[1.9,11.6],[1.4,11.5],[1.2,11.1],[0.9,11],[0,11],[-0.4,11.1],[-0.8,10.9],[-1.2,11],[-2',
        '.9,11],[-3,10.4],[-2.8,9.6],[-3.5,9.9],[-4,9.9],[-4.3,9.6],[-4.8,9.8],[-5,10.2]]]]],["CAF","CF","CAF","140","Central Afr',
        'ican Republic",20.9,7,["CAF","CF","140","Central African Rep.","Central African Republic"],[[[[27.4,5.2],[27,5.1],[26.4,',
        '5.2],[25.7,5.3],[25.3,5.2],[25.1,4.9],[24.8,4.9],[24.4,5.1],[23.3,4.6],[22.8,4.7],[22.7,4.6],[22.4,4],[21.7,4.2],[20.9,4',
        '.3],[20.3,4.7],[19.5,5],[18.9,4.7],[18.5,4.2],[18.5,3.5],[17.8,3.6],[17.1,3.7],[16.5,3.2],[16,2.3],[15.9,2.6],[15.9,3],[',
        '15.4,3.3],[15,3.9],[15,4.2],[14.5,4.7],[14.6,5],[14.5,5.5],[14.5,6.2],[14.8,6.4],[15.3,7.4],[16.1,7.5],[16.3,7.8],[16.5,',
        '7.7],[16.7,7.5],[18,7.9],[18.4,8.3],[18.9,8.6],[18.8,9],[19.1,9.1],[20.1,9],[21,9.5],[21.7,10.6],[22.2,11],[22.9,11.1],[',
        '23,10.7],[23.6,10.1],[23.6,9.7],[23.4,9.3],[23.5,9],[23.8,8.7],[24.6,8.2],[25.1,7.8],[25.1,7.5],[25.8,7],[26.2,6.5],[26.',
        '5,5.9],[27.2,5.6]]]]],["COG","CG","COG","178","Republic of the Congo",15.9,0.1,["COG","CG","178","Congo","Republic of th',
        'e Congo"],[[[[18.5,3.5],[18.4,2.9],[18.1,2.4],[17.9,1.7],[17.8,0.9],[17.8,0.3],[17.7,-0.1],[17.6,-0.4],[17.5,-0.7],[16.9',
        ',-1.2],[16.4,-1.7],[16,-2.7],[16,-3.5],[15.8,-3.9],[15.2,-4.3],[14.6,-5],[14.2,-4.8],[14.1,-4.5],[13.6,-4.5],[13.3,-4.9]',
        ',[13,-4.8],[12.6,-4.4],[12.3,-4.6],[11.9,-5],[11.1,-4],[11.9,-3.4],[11.5,-2.8],[11.8,-2.5],[12.5,-2.4],[12.6,-1.9],[13.1',
        ',-2.4],[14,-2.5],[14.3,-2],[14.4,-1.3],[14.3,-0.6],[13.8,0],[14.3,1.2],[14,1.4],[13.3,1.3],[13,1.8],[13.1,2.3],[14.3,2.2',
        '],[15.1,2],[15.9,1.7],[16,2.3],[16.5,3.2],[17.1,3.7],[17.8,3.6]]]]],["GAB","GA","GAB","266","Gabon",11.8,-0.4,["GAB","GA',
        '","266","Gabon"],[[[[11.3,2.3],[11.8,2.3],[12.4,2.2],[13,2.3],[13.1,2.3],[13,1.8],[13.3,1.3],[14,1.4],[14.3,1.2],[13.8,0',
        '],[14.3,-0.6],[14.4,-1.3],[14.3,-2],[14,-2.5],[13.1,-2.4],[12.6,-1.9],[12.5,-2.4],[11.8,-2.5],[11.5,-2.8],[11.9,-3.4],[1',
        '1.1,-4],[10.1,-3],[9.4,-2.1],[8.8,-1.1],[8.8,-0.8],[9,-0.5],[9.3,0.3],[9.5,1],[9.8,1.1],[11.3,1.1]]]]],["GNQ","GQ","GNQ"',
        ',"226","Equatorial Guinea",9,2.3,["GNQ","GQ","226","Eq. Guinea","Equatorial Guinea"],[[[[9.6,2.3],[11.3,2.3],[11.3,1.1],',
        '[9.8,1.1],[9.5,1],[9.3,1.2]]]]],["ZMB","ZM","ZMB","894","Zambia",26.4,-14.7,["ZMB","ZM","894","Zambia"],[[[[30.7,-8.3],[',
        '31.2,-8.6],[31.6,-8.8],[32.2,-8.9],[32.8,-9.2],[33.2,-9.7],[33.5,-10.5],[33.3,-10.8],[33.1,-11.6],[33.3,-12.4],[33,-12.8',
        '],[32.7,-13.7],[33.2,-14],[30.2,-14.8],[30.3,-15.5],[29.5,-15.6],[28.9,-16],[28.8,-16.4],[28.5,-16.5],[27.6,-17.3],[27,-',
        '17.9],[26.7,-18],[26.4,-17.8],[25.3,-17.7],[25.1,-17.7],[25.1,-17.6],[24.7,-17.4],[24,-17.3],[23.2,-17.5],[22.6,-16.9],[',
        '21.9,-16.1],[21.9,-12.9],[24,-12.9],[23.9,-12.6],[24.1,-12.2],[23.9,-11.7],[24,-11.2],[23.9,-10.9],[24.3,-11],[24.3,-11.',
        '3],[24.8,-11.2],[25.4,-11.3],[25.8,-11.8],[26.6,-11.9],[27.2,-11.6],[27.4,-12.1],[28.2,-12.3],[28.5,-12.7],[28.9,-13.2],',
        '[29.7,-13.3],[29.6,-12.2],[29.3,-12.4],[28.6,-12],[28.4,-11.8],[28.5,-10.8],[28.7,-9.6],[28.4,-9.2],[28.7,-8.5],[29,-8.4',
        '],[30.3,-8.2]]]]],["MWI","MW","MWI","454","Malawi",33.6,-13.4,["MWI","MW","454","Malawi"],[[[[32.8,-9.2],[33.7,-9.4],[33',
        '.9,-9.7],[34.3,-10.2],[34.6,-11.5],[34.3,-12.3],[34.6,-13.6],[34.9,-13.6],[35.3,-13.9],[35.7,-14.6],[35.8,-15.9],[35.3,-',
        '16.1],[35,-16.8],[34.4,-16.2],[34.3,-15.5],[34.5,-15],[34.5,-14.6],[34.1,-14.4],[33.8,-14.5],[33.2,-14],[32.7,-13.7],[33',
        ',-12.8],[33.3,-12.4],[33.1,-11.6],[33.3,-10.8],[33.5,-10.5],[33.2,-9.7]]]]],["MOZ","MZ","MOZ","508","Mozambique",37.8,-1',
        '3.9,["MOZ","MZ","508","Mozambique"],[[[[34.6,-11.5],[35.3,-11.4],[36.5,-11.7],[36.8,-11.6],[37.5,-11.6],[37.8,-11.3],[38',
        '.4,-11.3],[39.5,-10.9],[40.3,-10.3],[40.5,-10.8],[40.4,-11.8],[40.6,-12.6],[40.6,-14.2],[40.8,-14.7],[40.5,-15.4],[40.1,',
        '-16.1],[39.5,-16.7],[38.5,-17.1],[37.4,-17.6],[36.3,-18.7],[35.9,-18.8],[35.2,-19.6],[34.8,-19.8],[34.7,-20.5],[35.2,-21',
        '.3],[35.4,-21.8],[35.4,-22.1],[35.6,-22.1],[35.5,-23.1],[35.4,-23.5],[35.6,-23.7],[35.5,-24.1],[35,-24.5],[34.2,-24.8],[',
        '33,-25.4],[32.6,-25.7],[32.7,-26.1],[32.9,-26.2],[32.8,-26.7],[32.1,-26.7],[32,-26.3],[31.8,-25.8],[31.8,-25.5],[31.9,-2',
        '4.4],[31.7,-23.7],[31.2,-22.3],[32.2,-21.1],[32.5,-20.4],[32.7,-20.3],[32.8,-19.7],[32.6,-19.4],[32.7,-18.7],[32.8,-18],',
        '[32.8,-16.7],[32.3,-16.4],[31.9,-16.3],[31.6,-16.1],[31.2,-15.9],[30.3,-15.9],[30.3,-15.5],[30.2,-14.8],[33.2,-14],[33.8',
        ',-14.5],[34.1,-14.4],[34.5,-14.6],[34.5,-15],[34.3,-15.5],[34.4,-16.2],[35,-16.8],[35.3,-16.1],[35.8,-15.9],[35.7,-14.6]',
        ',[35.3,-13.9],[34.9,-13.6],[34.6,-13.6],[34.3,-12.3]]]]],["SWZ","SZ","SWZ","748","Eswatini",31.5,-26.5,["SWZ","SZ","748"',
        ',"ES","eSwatini","Eswatini","Kingdom of eSwatini"],[[[[32.1,-26.7],[31.9,-27.2],[31.3,-27.3],[30.7,-26.7],[30.7,-26.4],[',
        '30.9,-26],[31,-25.7],[31.3,-25.7],[31.8,-25.8],[32,-26.3]]]]],["AGO","AO","AGO","024","Angola",18,-12.2,["AGO","AO","024',
        '","Angola"],[[[[13,-4.8],[12.6,-5],[12.5,-5.2],[12.4,-5.7],[12.2,-5.8],[11.9,-5],[12.3,-4.6],[12.6,-4.4]]],[[[12.3,-6.1]',
        ',[12.7,-6],[13,-6],[13.4,-5.9],[16.3,-5.9],[16.6,-6.6],[16.9,-7.2],[17.1,-7.5],[17.5,-8.1],[18.1,-8],[18.5,-7.8],[19,-8]',
        ',[19.2,-7.7],[19.4,-7.2],[20,-7.1],[20.1,-6.9],[20.6,-6.9],[20.5,-7.3],[21.7,-7.3],[21.7,-7.9],[21.9,-8.3],[21.8,-8.9],[',
        '21.9,-9.5],[22.2,-9.9],[22.2,-11.1],[22.4,-11],[22.8,-11],[23.5,-10.9],[23.9,-10.9],[24,-11.2],[23.9,-11.7],[24.1,-12.2]',
        ',[23.9,-12.6],[24,-12.9],[21.9,-12.9],[21.9,-16.1],[22.6,-16.9],[23.2,-17.5],[21.4,-17.9],[19,-17.8],[18.3,-17.3],[14.2,',
        '-17.4],[14.1,-17.4],[13.5,-17],[12.8,-16.9],[12.2,-17.1],[11.7,-17.3],[11.6,-16.7],[11.8,-15.8],[12.1,-14.9],[12.2,-14.4',
        '],[12.5,-13.5],[12.7,-13.1],[13.3,-12.5],[13.6,-12],[13.7,-11.3],[13.7,-10.7],[13.4,-10.4],[13.1,-9.8],[12.9,-9.2],[12.9',
        ',-9],[13.2,-8.6],[12.9,-7.6],[12.7,-6.9],[12.2,-6.3]]]]],["BDI","BI","BDI","108","Burundi",29.9,-3.3,["BDI","BI","108","',
        'Burundi"],[[[[30.5,-2.4],[30.5,-2.8],[30.7,-3],[30.8,-3.4],[30.5,-3.6],[30.1,-4.1],[29.8,-4.5],[29.3,-4.5],[29.3,-3.3],[',
        '29,-2.8],[29.6,-2.9],[29.9,-2.3]]]]],["ISR","IL","ISR","376","Israel",34.8,30.9,["ISR","IL","376","IS1","IS","Israel"],[',
        '[[[35.7,32.7],[35.5,32.4],[35.2,32.5],[35,31.9],[35.2,31.8],[35,31.6],[34.9,31.4],[35.4,31.5],[35.4,31.1],[34.9,29.5],[3',
        '4.8,29.8],[34.3,31.2],[34.6,31.5],[34.5,31.6],[34.8,32.1],[35,32.8],[35.1,33.1],[35.5,33.1],[35.6,33.3],[35.8,33.3],[35.',
        '8,32.9]]]]],["LBN","LB","LBN","422","Lebanon",36,34.1,["LBN","LB","422","Lebanon"],[[[[35.8,33.3],[35.6,33.3],[35.5,33.1',
        '],[35.1,33.1],[35.5,33.9],[36,34.6],[36.4,34.6],[36.6,34.2],[36.1,33.8]]]]],["MDG","MG","MDG","450","Madagascar",46.7,-1',
        '8.6,["MDG","MG","450","Madagascar"],[[[[49.5,-12.5],[49.8,-12.9],[50.1,-13.6],[50.2,-14.8],[50.5,-15.2],[50.4,-15.7],[50',
        '.2,-16],[49.9,-15.4],[49.7,-15.7],[49.9,-16.5],[49.8,-16.9],[49.5,-17.1],[49.4,-18],[49,-19.1],[48.5,-20.5],[47.9,-22.4]',
        ',[47.5,-23.8],[47.1,-24.9],[46.3,-25.2],[45.4,-25.6],[44.8,-25.3],[44,-25],[43.8,-24.5],[43.7,-23.6],[43.3,-22.8],[43.3,',
        '-22.1],[43.4,-21.3],[43.9,-21.2],[43.9,-20.8],[44.4,-20.1],[44.5,-19.4],[44.2,-19],[44,-18.3],[44,-17.4],[44.3,-16.9],[4',
        '4.4,-16.2],[44.9,-16.2],[45.5,-16],[45.9,-15.8],[46.3,-15.8],[46.9,-15.2],[47.7,-14.6],[48,-14.1],[47.9,-13.7],[48.3,-13',
        '.8],[48.8,-13.1],[48.9,-12.5],[49.2,-12]]]]],["PSX","PS","PSE","275","Palestine",35.3,32,["PSX","PS","PSE","275","IS1","',
        'PAL","GZ","WBG","Palestine","Israel"],[[[[35.4,31.5],[34.9,31.4],[35,31.6],[35.2,31.8],[35,31.9],[35.2,32.5],[35.5,32.4]',
        ',[35.5,31.8]]]]],["GMB","GM","GMB","270","The Gambia",-15,13.6,["GMB","GM","270","Gambia","The Gambia"],[[[[-16.7,13.6],',
        '[-15.6,13.6],[-15.4,13.9],[-15.1,13.9],[-14.7,13.6],[-14.4,13.6],[-14,13.8],[-13.8,13.5],[-14.3,13.3],[-14.7,13.3],[-15.',
        '1,13.5],[-15.5,13.3],[-15.7,13.3],[-15.9,13.1],[-16.8,13.2]]]]],["TUN","TN","TUN","788","Tunisia",9,33.7,["TUN","TN","78',
        '8","Tunisia"],[[[[9.5,30.3],[9.1,32.1],[8.4,32.5],[8.4,32.7],[7.6,33.3],[7.5,34.1],[8.1,34.7],[8.4,35.5],[8.2,36.4],[8.4',
        ',36.9],[9.5,37.3],[10.2,37.2],[10.2,36.7],[11,37.1],[11.1,36.9],[10.6,36.4],[10.6,35.9],[10.9,35.7],[10.8,34.8],[10.1,34',
        '.3],[10.3,33.8],[10.9,33.8],[11.1,33.3],[11.5,33.1],[11.4,32.4],[10.9,32.1],[10.6,31.8],[10,31.4],[10.1,31],[10,30.5]]]]',
        '],["DZA","DZ","DZA","012","Algeria",2.8,27.4,["DZA","DZ","012","Algeria"],[[[[-8.7,27.4],[-8.7,27.6],[-8.7,27.7],[-8.7,2',
        '8.8],[-7.1,29.6],[-6.1,29.7],[-5.2,30],[-4.9,30.5],[-3.7,30.9],[-3.6,31.6],[-3.1,31.7],[-2.6,32.1],[-1.3,32.3],[-1.1,32.',
        '7],[-1.4,32.9],[-1.7,33.9],[-1.8,34.5],[-2.2,35.2],[-1.2,35.7],[-0.1,35.9],[0.5,36.3],[1.5,36.6],[3.2,36.8],[4.8,36.9],[',
        '5.3,36.7],[6.3,37.1],[7.3,37.1],[7.7,36.9],[8.4,36.9],[8.2,36.4],[8.4,35.5],[8.1,34.7],[7.5,34.1],[7.6,33.3],[8.4,32.7],',
        '[8.4,32.5],[9.1,32.1],[9.5,30.3],[9.8,29.4],[9.9,29],[9.7,28.1],[9.8,27.7],[9.6,27.1],[9.7,26.5],[9.3,26.1],[9.9,25.4],[',
        '9.9,24.9],[10.3,24.4],[10.8,24.6],[11.6,24.1],[12,23.5],[8.6,21.6],[5.7,19.6],[4.3,19.2],[3.2,19.1],[3.1,19.7],[2.7,19.9',
        '],[2.1,20.1],[1.8,20.6],[-1.6,22.8],[-4.9,25]]]]],["JOR","JO","JOR","400","Jordan",36.4,30.8,["JOR","JO","400","J","Jord',
        'an"],[[[[35.5,32.4],[35.7,32.7],[36.8,32.3],[38.8,33.4],[39.2,32.2],[39,32],[37,31.5],[38,30.5],[37.7,30.3],[37.5,30],[3',
        '6.7,29.9],[36.5,29.5],[36.1,29.2],[35,29.4],[34.9,29.5],[35.4,31.1],[35.4,31.5],[35.5,31.8]]]]],["ARE","AE","ARE","784",',
        '"United Arab Emirates",54.5,23.5,["ARE","AE","784","United Arab Emirates"],[[[[51.6,24.2],[51.8,24.3],[51.8,24],[52.6,24',
        '.2],[53.4,24.2],[54,24.1],[54.7,24.8],[55.4,25.4],[56.1,26.1],[56.3,25.7],[56.4,24.9],[55.9,24.9],[55.8,24.3],[56,24.1],',
        '[55.5,23.9],[55.5,23.5],[55.2,23.1],[55.2,22.7],[55,22.5],[52,23],[51.6,24]]]]],["QAT","QA","QAT","634","Qatar",51.1,25.',
        '2,["QAT","QA","634","Qatar"],[[[[50.8,24.8],[50.7,25.5],[51,26],[51.3,26.1],[51.6,25.8],[51.6,25.2],[51.4,24.6],[51.1,24',
        '.6]]]]],["KWT","KW","KWT","414","Kuwait",47.3,29.4,["KWT","KW","414","Kuwait"],[[[[48,30],[48.2,29.5],[48.1,29.3],[48.4,',
        '28.6],[47.7,28.5],[47.5,29],[46.6,29.1],[47.3,30.1]]]]],["IRQ","IQ","IRQ","368","Iraq",43.3,33.1,["IRQ","IQ","368","Iraq',
        '"],[[[[39.2,32.2],[38.8,33.4],[41,34.4],[41.4,35.6],[41.3,36.4],[41.8,36.6],[42.3,37.2],[42.8,37.4],[43.9,37.3],[44.3,37',
        '],[44.8,37.2],[45.4,36],[46.1,35.7],[46.2,35.1],[45.6,34.7],[45.4,34],[46.1,33],[47.3,32.5],[47.8,31.7],[47.7,31],[48,31',
        '],[48,30.5],[48.6,29.9],[48,30],[47.3,30.1],[46.6,29.1],[44.7,29.2],[41.9,31.2],[40.4,31.9]]]]],["OMN","OM","OMN","512",',
        '"Oman",57.3,22.1,["OMN","OM","512","Oman"],[[[[55.2,22.7],[55.2,23.1],[55.5,23.5],[55.5,23.9],[56,24.1],[55.8,24.3],[55.',
        '9,24.9],[56.4,24.9],[56.8,24.2],[57.4,23.9],[58.1,23.7],[58.7,23.6],[59.2,23],[59.5,22.7],[59.8,22.5],[59.8,22.3],[59.4,',
        '21.7],[59.3,21.4],[58.9,21.1],[58.5,20.4],[58,20.5],[57.8,20.2],[57.7,19.7],[57.8,19.1],[57.7,18.9],[57.2,18.9],[56.6,18',
        '.6],[56.5,18.1],[56.3,17.9],[55.7,17.9],[55.3,17.6],[55.3,17.2],[54.8,17],[54.2,17],[53.6,16.7],[53.1,16.7],[52.8,17.3],',
        '[52,19],[55,20],[55.7,22]]],[[[56.3,25.7],[56.1,26.1],[56.4,26.4],[56.5,26.3],[56.4,25.9]]]]],["VUT","VU","VUT","548","V',
        'anuatu",166.9,-15.4,["VUT","VU","548","Vanuatu"],[[[[167.2,-15.9],[167.8,-16.5],[167.5,-16.6],[167.2,-16.2]]],[[[166.8,-',
        '15.7],[166.6,-15.4],[166.6,-14.6],[167.1,-14.9],[167.3,-15.7],[167,-15.6]]]]],["KHM","KH","KHM","116","Cambodia",104.5,1',
        '2.6,["KHM","KH","116","Cambodia"],[[[[102.6,12.2],[102.3,13.4],[103,14.2],[104.3,14.4],[105.2,14.3],[106,13.9],[106.5,14',
        '.6],[107.4,14.2],[107.6,13.5],[107.5,12.3],[105.8,11.6],[106.2,11],[105.2,10.9],[104.3,10.5],[103.5,10.6],[103.1,11.2]]]',
        ']],["THA","TH","THA","764","Thailand",101.1,15.5,["THA","TH","764","Thailand"],[[[[105.2,14.3],[104.3,14.4],[103,14.2],[',
        '102.3,13.4],[102.6,12.2],[101.7,12.6],[100.8,12.6],[101,13.4],[100.1,13.4],[100,12.3],[99.5,10.8],[99.2,10],[99.2,9.2],[',
        '99.9,9.2],[100.3,8.3],[100.5,7.4],[101,6.9],[101.6,6.7],[102.1,6.2],[101.8,5.8],[101.2,5.7],[101.1,6.2],[100.3,6.6],[100',
        '.1,6.5],[99.7,6.8],[99.5,7.3],[99,7.9],[98.5,8.4],[98.3,7.8],[98.2,8.4],[98.3,9],[98.6,9.9],[99,11],[99.6,11.9],[99.2,12',
        '.8],[99.2,13.3],[99.1,13.8],[98.4,14.6],[98.2,15.1],[98.5,15.3],[98.9,16.2],[98.5,16.8],[97.9,17.6],[97.4,18.4],[97.8,18',
        '.6],[98.3,19.7],[99,19.8],[99.5,20.2],[100.1,20.4],[100.5,20.1],[100.6,19.5],[101.3,19.5],[101,18.4],[101.1,17.5],[102.1',
        ',18.1],[102.4,17.9],[103,18],[103.2,18.3],[104,18.2],[104.7,17.4],[104.8,16.4],[105.6,15.6],[105.5,14.7]]]]],["LAO","LA"',
        ',"LAO","418","Laos",102.5,19.4,["LAO","LA","418","Laos","Lao PDR"],[[[[107.4,14.2],[106.5,14.6],[106,13.9],[105.2,14.3],',
        '[105.5,14.7],[105.6,15.6],[104.8,16.4],[104.7,17.4],[104,18.2],[103.2,18.3],[103,18],[102.4,17.9],[102.1,18.1],[101.1,17',
        '.5],[101,18.4],[101.3,19.5],[100.6,19.5],[100.5,20.1],[100.1,20.4],[100.3,20.8],[101.2,21.4],[101.3,21.2],[101.8,21.2],[',
        '101.7,22.3],[102.2,22.5],[102.8,21.7],[103.2,20.8],[104.4,20.8],[104.8,19.9],[104.2,19.6],[103.9,19.3],[105.1,18.7],[105',
        '.9,17.5],[106.6,16.6],[107.3,15.9],[107.6,15.2]]]]],["MMR","MM","MMR","104","Myanmar",95.8,21.6,["MMR","MM","104","Myanm',
        'ar"],[[[[100.1,20.4],[99.5,20.2],[99,19.8],[98.3,19.7],[97.8,18.6],[97.4,18.4],[97.9,17.6],[98.5,16.8],[98.9,16.2],[98.5',
        ',15.3],[98.2,15.1],[98.4,14.6],[99.1,13.8],[99.2,13.3],[99.2,12.8],[99.6,11.9],[99,11],[98.6,9.9],[98.5,10.7],[98.8,11.4',
        '],[98.4,12],[98.5,13.1],[98.1,13.6],[97.8,14.8],[97.6,16.1],[97.2,16.9],[96.5,16.4],[95.4,15.7],[94.8,15.8],[94.2,16],[9',
        '4.5,17.3],[94.3,18.2],[93.5,19.4],[93.7,19.7],[93.1,19.9],[92.4,20.7],[92.3,21.5],[92.7,21.3],[92.7,22],[93.2,22.3],[93.',
        '1,22.7],[93.3,23],[93.3,24.1],[94.1,23.9],[94.6,24.7],[94.6,25.2],[95.2,26],[95.1,26.6],[96.4,27.3],[97.1,27.1],[97.1,27',
        '.7],[97.4,27.9],[97.3,28.3],[97.9,28.3],[98.2,27.7],[98.7,27.5],[98.7,26.7],[98.7,25.9],[97.7,25.1],[97.6,23.9],[98.7,24',
        '.1],[98.9,23.1],[99.5,22.9],[99.2,22.1],[100,21.7],[100.4,21.6],[101.2,21.8],[101.2,21.4],[100.3,20.8]]]]],["VNM","VN","',
        'VNM","704","Vietnam",105.4,21.7,["VNM","VN","704","Vietnam"],[[[[104.3,10.5],[105.2,10.9],[106.2,11],[105.8,11.6],[107.5',
        ',12.3],[107.6,13.5],[107.4,14.2],[107.6,15.2],[107.3,15.9],[106.6,16.6],[105.9,17.5],[105.1,18.7],[103.9,19.3],[104.2,19',
        '.6],[104.8,19.9],[104.4,20.8],[103.2,20.8],[102.8,21.7],[102.2,22.5],[102.7,22.7],[103.5,22.7],[104.5,22.8],[105.3,23.4]',
        ',[105.8,23],[106.7,22.8],[106.6,22.2],[107,21.8],[108.1,21.6],[106.7,20.7],[105.9,19.8],[105.7,19.1],[106.4,18],[107.4,1',
        '6.7],[108.3,16.1],[108.9,15.3],[109.3,13.4],[109.2,11.7],[108.4,11],[107.2,10.4],[106.4,9.5],[105.2,8.6],[104.8,9.2],[10',
        '5.1,9.9]]]]],["PRK","KP","PRK","408","North Korea",126.4,39.9,["PRK","KP","408","North Korea","Dem. Rep. Korea"],[[[[130',
        '.6,42.4],[130.8,42.2],[130.4,42.3],[130,41.9],[129.7,41.6],[129.7,40.9],[129.2,40.7],[129,40.5],[128.6,40.2],[128,40],[1',
        '27.5,39.8],[127.5,39.3],[127.4,39.2],[127.8,39.1],[128.3,38.6],[128.2,38.4],[127.8,38.3],[127.1,38.3],[126.7,37.8],[126.',
        '2,37.8],[126.2,37.7],[125.7,37.9],[125.6,37.8],[125.3,37.7],[125.2,37.9],[125,37.9],[124.7,38.1],[125,38.5],[125.2,38.7]',
        ',[125.1,38.8],[125.4,39.4],[125.3,39.6],[124.7,39.7],[124.3,39.9],[125.1,40.6],[126.2,41.1],[126.9,41.8],[127.3,41.5],[1',
        '28.2,41.5],[128.1,42],[129.6,42.4],[130,43]]]]],["KOR","KR","KOR","410","South Korea",128.1,36.4,["KOR","KR","410","Sout',
        'h Korea","Republic of Korea"],[[[[126.2,37.7],[126.2,37.8],[126.7,37.8],[127.1,38.3],[127.8,38.3],[128.2,38.4],[128.3,38',
        '.6],[129.2,37.4],[129.5,36.8],[129.5,35.6],[129.1,35.1],[128.2,34.9],[127.4,34.5],[126.5,34.4],[126.4,34.9],[126.6,35.7]',
        ',[126.1,36.7],[126.9,36.9]]]]],["MNG","MN","MNG","496","Mongolia",104.2,46,["MNG","MN","496","Mongolia"],[[[[87.8,49.3],',
        '[88.8,49.5],[90.7,50.3],[92.2,50.8],[93.1,50.5],[94.1,50.5],[94.8,50],[95.8,50],[97.3,49.7],[98.2,50.4],[97.8,51],[98.9,',
        '52],[100,51.6],[100.9,51.5],[102.1,51.3],[102.3,50.5],[103.7,50.1],[104.6,50.3],[105.9,50.4],[106.9,50.3],[107.9,49.8],[',
        '108.5,49.3],[109.4,49.3],[110.7,49.1],[111.6,49.4],[112.9,49.5],[114.4,50.2],[115,50.1],[115.5,49.8],[116.7,49.9],[116.2',
        ',49.1],[115.5,48.1],[115.7,47.7],[116.3,47.9],[117.3,47.7],[118.1,48.1],[118.9,47.7],[119.8,47],[119.7,46.7],[118.9,46.8',
        '],[117.4,46.7],[116.7,46.4],[116,45.7],[114.5,45.3],[113.5,44.8],[112.4,45],[111.9,45.1],[111.3,44.5],[111.7,44.1],[111.',
        '8,43.7],[111.1,43.4],[110.4,42.9],[109.2,42.5],[107.7,42.5],[106.1,42.1],[105,41.6],[104.5,41.9],[103.3,41.9],[101.8,42.',
        '5],[100.8,42.7],[99.5,42.5],[97.5,42.7],[96.3,42.7],[95.8,43.3],[95.3,44.2],[94.7,44.4],[93.5,45],[92.1,45.1],[90.9,45.3',
        '],[90.6,45.7],[91,46.9],[90.3,47.7],[88.9,48.1],[88,48.6]]]]],["IND","IN","IND","356","India",79.4,22.7,["IND","IN","356',
        '","India"],[[[[97.3,28.3],[97.4,27.9],[97.1,27.7],[97.1,27.1],[96.4,27.3],[95.1,26.6],[95.2,26],[94.6,25.2],[94.6,24.7],',
        '[94.1,23.9],[93.3,24.1],[93.3,23],[93.1,22.7],[93.2,22.3],[92.7,22],[92.1,23.6],[91.9,23.6],[91.7,23],[91.2,23.5],[91.5,',
        '24.1],[91.9,24.1],[92.4,25],[91.8,25.1],[90.9,25.1],[89.9,25.3],[89.8,26],[89.4,26],[88.6,26.4],[88.2,25.8],[88.9,25.2],',
        '[88.3,24.9],[88.1,24.5],[88.7,24.2],[88.5,23.6],[88.9,22.9],[89,22.1],[88.9,21.7],[88.2,21.7],[87,21.5],[87,20.7],[86.5,',
        '20.2],[85.1,19.5],[83.9,18.3],[83.2,17.7],[82.2,17],[82.2,16.6],[81.7,16.3],[80.8,16],[80.3,15.9],[80,15.1],[80.2,13.8],',
        '[80.3,13],[79.9,12.1],[79.9,10.4],[79.3,10.3],[78.9,9.5],[79.2,9.2],[78.3,8.9],[77.9,8.3],[77.5,8],[76.6,8.9],[76.1,10.3',
        '],[75.7,11.3],[75.4,11.8],[74.9,12.7],[74.6,14],[74.4,14.6],[73.5,16],[73.1,17.9],[72.8,19.2],[72.8,20.4],[72.6,21.4],[7',
        '1.2,20.8],[70.5,20.9],[69.2,22.1],[69.6,22.5],[69.3,22.8],[68.2,23.7],[68.8,24.4],[71,24.4],[70.8,25.2],[70.3,25.7],[70.',
        '2,26.5],[69.5,26.9],[70.6,28],[71.8,27.9],[72.8,29],[73.5,30],[74.4,31],[74.4,31.7],[75.3,32.3],[74.5,32.8],[74.1,33.4],',
        '[73.7,34.3],[74.2,34.7],[75.8,34.5],[76.9,34.7],[77.8,35.5],[78.9,34.3],[78.8,33.5],[79.2,33],[79.2,32.5],[78.5,32.6],[7',
        '8.7,31.5],[79.7,30.9],[81.1,30.2],[80.5,29.7],[80.1,28.8],[81.1,28.4],[82,27.9],[83.3,27.4],[84.7,27.2],[85.3,26.7],[86,',
        '26.6],[87.2,26.4],[88.1,26.4],[88.2,26.8],[88,27.4],[88.1,27.9],[88.7,28.1],[88.8,27.3],[88.8,27.1],[89.7,26.7],[90.4,26',
        '.9],[91.2,26.8],[92,26.8],[92.1,27.5],[91.7,27.8],[92.5,27.9],[93.4,28.6],[94.6,29.3],[95.4,29],[96.1,29.5],[96.6,28.8],',
        '[96.2,28.4]]]]],["BGD","BD","BGD","050","Bangladesh",89.7,24.2,["BGD","BD","050","Bangladesh"],[[[[92.7,22],[92.7,21.3],',
        '[92.3,21.5],[92.4,20.7],[92.1,21.2],[92,21.7],[91.8,22.2],[91.4,22.8],[90.5,22.8],[90.6,22.4],[90.3,21.8],[89.8,22],[89.',
        '7,21.9],[89.4,22],[89,22.1],[88.9,22.9],[88.5,23.6],[88.7,24.2],[88.1,24.5],[88.3,24.9],[88.9,25.2],[88.2,25.8],[88.6,26',
        '.4],[89.4,26],[89.8,26],[89.9,25.3],[90.9,25.1],[91.8,25.1],[92.4,25],[91.9,24.1],[91.5,24.1],[91.2,23.5],[91.7,23],[91.',
        '9,23.6],[92.1,23.6]]]]],["BTN","BT","BTN","064","Bhutan",90,27.5,["BTN","BT","064","Bhutan"],[[[[91.7,27.8],[92.1,27.5],',
        '[92,26.8],[91.2,26.8],[90.4,26.9],[89.7,26.7],[88.8,27.1],[88.8,27.3],[89.5,28],[90,28.3],[90.7,28.1],[91.3,28]]]]],["NP',
        'L","NP","NPL","524","Nepal",83.6,28.3,["NPL","NP","524","Nepal"],[[[[88.1,27.9],[88,27.4],[88.2,26.8],[88.1,26.4],[87.2,',
        '26.4],[86,26.6],[85.3,26.7],[84.7,27.2],[83.3,27.4],[82,27.9],[81.1,28.4],[80.1,28.8],[80.5,29.7],[81.1,30.2],[81.5,30.4',
        '],[82.3,30.1],[83.3,29.5],[83.9,29.3],[84.2,28.8],[85,28.6],[85.8,28.2],[87,28]]]]],["PAK","PK","PAK","586","Pakistan",6',
        '8.5,29.3,["PAK","PK","586","Pakistan"],[[[[77.8,35.5],[76.9,34.7],[75.8,34.5],[74.2,34.7],[73.7,34.3],[74.1,33.4],[74.5,',
        '32.8],[75.3,32.3],[74.4,31.7],[74.4,31],[73.5,30],[72.8,29],[71.8,27.9],[70.6,28],[69.5,26.9],[70.2,26.5],[70.3,25.7],[7',
        '0.8,25.2],[71,24.4],[68.8,24.4],[68.2,23.7],[67.4,23.9],[67.1,24.7],[66.4,25.4],[64.5,25.2],[62.9,25.2],[61.5,25.1],[61.',
        '9,26.2],[63.3,26.8],[63.2,27.2],[62.8,27.4],[62.7,28.3],[61.8,28.7],[61.4,29.3],[60.9,29.8],[62.5,29.3],[63.6,29.5],[64.',
        '1,29.3],[64.4,29.6],[65,29.5],[66.3,29.9],[66.4,30.7],[66.9,31.3],[67.7,31.3],[67.8,31.6],[68.6,31.7],[68.9,31.6],[69.3,',
        '31.9],[69.3,32.5],[69.7,33.1],[70.3,33.4],[69.9,34],[70.9,34],[71.2,34.3],[71.1,34.7],[71.6,35.2],[71.5,35.7],[71.3,36.1',
        '],[71.8,36.5],[72.9,36.7],[74.1,36.8],[74.6,37],[75.2,37.1],[75.9,36.7],[76.2,35.9]]]]],["AFG","AF","AFG","004","Afghani',
        'stan",66.5,34.2,["AFG","AF","004","Afghanistan"],[[[[66.5,37.4],[67.1,37.4],[67.8,37.1],[68.1,37],[68.9,37.3],[69.2,37.2',
        '],[69.5,37.6],[70.1,37.6],[70.3,37.7],[70.4,38.1],[70.8,38.5],[71.3,38.3],[71.2,38],[71.5,37.9],[71.4,37.1],[71.8,36.7],',
        '[72.2,36.9],[72.6,37],[73.3,37.5],[73.9,37.4],[75,37.4],[75.2,37.1],[74.6,37],[74.1,36.8],[72.9,36.7],[71.8,36.5],[71.3,',
        '36.1],[71.5,35.7],[71.6,35.2],[71.1,34.7],[71.2,34.3],[70.9,34],[69.9,34],[70.3,33.4],[69.7,33.1],[69.3,32.5],[69.3,31.9',
        '],[68.9,31.6],[68.6,31.7],[67.8,31.6],[67.7,31.3],[66.9,31.3],[66.4,30.7],[66.3,29.9],[65,29.5],[64.4,29.6],[64.1,29.3],',
        '[63.6,29.5],[62.5,29.3],[60.9,29.8],[61.8,30.7],[61.7,31.4],[60.9,31.5],[60.9,32.2],[60.5,33],[61,33.5],[60.5,33.7],[60.',
        '8,34.4],[61.2,35.7],[62.2,35.3],[63,35.4],[63.2,35.9],[64,36],[64.5,36.3],[64.7,37.1],[65.6,37.3],[65.7,37.7],[66.2,37.4',
        ']]]]],["TJK","TJ","TJK","762","Tajikistan",72.6,38.2,["TJK","TJ","762","Tajikistan"],[[[[67.8,37.1],[68.4,38.2],[68.2,38',
        '.9],[67.4,39.1],[67.7,39.6],[68.5,39.5],[69,40.1],[69.3,40.7],[70.7,41],[70.5,40.5],[70.6,40.2],[71,40.2],[70.6,39.9],[6',
        '9.6,40.1],[69.5,39.5],[70.5,39.6],[71.8,39.3],[73.7,39.4],[73.9,38.5],[74.3,38.6],[74.9,38.4],[74.8,38],[75,37.4],[73.9,',
        '37.4],[73.3,37.5],[72.6,37],[72.2,36.9],[71.8,36.7],[71.4,37.1],[71.5,37.9],[71.2,38],[71.3,38.3],[70.8,38.5],[70.4,38.1',
        '],[70.3,37.7],[70.1,37.6],[69.5,37.6],[69.2,37.2],[68.9,37.3],[68.1,37]]]]],["KGZ","KG","KGZ","417","Kyrgyzstan",74.5,41',
        '.7,["KGZ","KG","417","Kyrgyzstan"],[[[[71,42.3],[71.2,42.7],[71.8,42.8],[73.5,42.5],[73.6,43.1],[74.2,43.3],[75.6,42.9],',
        '[76,43],[77.7,43],[79.1,42.9],[79.6,42.5],[80.3,42.3],[80.1,42.1],[78.5,41.6],[78.2,41.2],[76.9,41.1],[76.5,40.4],[75.5,',
        '40.6],[74.8,40.4],[73.8,39.9],[74,39.7],[73.7,39.4],[71.8,39.3],[70.5,39.6],[69.5,39.5],[69.6,40.1],[70.6,39.9],[71,40.2',
        '],[71.8,40.1],[73.1,40.9],[71.9,41.4],[71.2,41.1],[70.4,41.5],[71.3,42.2]]]]],["TKM","TM","TKM","795","Turkmenistan",58.',
        '7,39.9,["TKM","TM","795","Turkmenistan"],[[[[52.5,41.8],[52.9,42.1],[54.1,42.3],[54.8,42],[55.5,41.3],[56,41.3],[57.1,41',
        '.3],[56.9,41.8],[57.8,42.2],[58.6,42.8],[60,42.2],[60.1,41.4],[60.5,41.2],[61.5,41.3],[61.9,41.1],[62.4,40.1],[63.5,39.4',
        '],[64.2,38.9],[65.2,38.4],[66.5,38],[66.5,37.4],[66.2,37.4],[65.7,37.7],[65.6,37.3],[64.7,37.1],[64.5,36.3],[64,36],[63.',
        '2,35.9],[63,35.4],[62.2,35.3],[61.2,35.7],[61.1,36.5],[60.4,36.5],[59.2,37.4],[58.4,37.5],[57.3,38],[56.6,38.1],[56.2,37',
        '.9],[55.5,38],[54.8,37.4],[53.9,37.2],[53.7,37.9],[53.9,39],[53.1,39.3],[53.4,40],[52.7,40],[52.9,40.9],[53.9,40.6],[54.',
        '7,41],[54,41.6],[53.7,42.1],[52.9,41.9],[52.8,41.1]]]]],["IRN","IR","IRN","364","Iran",54.9,32.2,["IRN","IR","364","Iran',
        '"],[[[[48.6,29.9],[48,30.5],[48,31],[47.7,31],[47.8,31.7],[47.3,32.5],[46.1,33],[45.4,34],[45.6,34.7],[46.2,35.1],[46.1,',
        '35.7],[45.4,36],[44.8,37.2],[44.2,38],[44.4,38.3],[44.1,39.4],[44.8,39.7],[45,39.3],[45.5,38.9],[46.1,38.7],[46.5,38.8],',
        '[47.7,39.5],[48.1,39.6],[48.4,39.3],[48,38.8],[48.6,38.3],[48.9,38.3],[49.2,37.6],[50.1,37.4],[50.8,36.9],[52.3,36.7],[5',
        '3.8,37],[53.9,37.2],[54.8,37.4],[55.5,38],[56.2,37.9],[56.6,38.1],[57.3,38],[58.4,37.5],[59.2,37.4],[60.4,36.5],[61.1,36',
        '.5],[61.2,35.7],[60.8,34.4],[60.5,33.7],[61,33.5],[60.5,33],[60.9,32.2],[60.9,31.5],[61.7,31.4],[61.8,30.7],[60.9,29.8],',
        '[61.4,29.3],[61.8,28.7],[62.7,28.3],[62.8,27.4],[63.2,27.2],[63.3,26.8],[61.9,26.2],[61.5,25.1],[59.6,25.4],[58.5,25.6],',
        '[57.4,25.7],[57,27],[56.5,27.1],[55.7,27],[54.7,26.5],[53.5,26.8],[52.5,27.6],[51.5,27.9],[50.9,28.8],[50.1,30.1],[49.6,',
        '30],[48.9,30.3]]]]],["SYR","SY","SYR","760","Syria",38.3,35,["SYR","SY","760","Syria"],[[[[35.7,32.7],[35.8,32.9],[35.8,',
        '33.3],[36.1,33.8],[36.6,34.2],[36.4,34.6],[36,34.6],[35.9,35.4],[36.1,35.8],[36.4,36],[36.7,36.3],[36.7,36.8],[37.1,36.6',
        '],[38.2,36.9],[38.7,36.7],[39.5,36.7],[40.7,37.1],[41.2,37.1],[42.3,37.2],[41.8,36.6],[41.3,36.4],[41.4,35.6],[41,34.4],',
        '[38.8,33.4],[36.8,32.3]]]]],["ARM","AM","ARM","051","Armenia",44.8,40.5,["ARM","AM","051","Armenia"],[[[[46.5,38.8],[46.',
        '1,38.7],[45.7,39.3],[45.7,39.5],[45.3,39.5],[45,39.7],[44.8,39.7],[44.4,40],[43.7,40.3],[43.8,40.7],[43.6,41.1],[45,41.2',
        '],[45.2,41],[45.6,40.8],[45.4,40.6],[45.9,40.2],[45.6,39.9],[46,39.6],[46.5,39.5]]]]],["SWE","SE","SWE","752","Sweden",1',
        '9,65.9,["SWE","SE","752","S","Sweden"],[[[[11,58.9],[11.5,59.4],[12.3,60.1],[12.6,61.3],[12,61.8],[11.9,63.1],[12.6,64.1',
        '],[13.6,64],[13.9,64.4],[13.6,64.8],[15.1,66.2],[16.1,67.3],[16.8,68],[17.7,68],[18,68.6],[19.9,68.4],[20,69.1],[20.6,69',
        '.1],[22,68.6],[23.5,67.9],[23.6,66.4],[23.9,66],[22.2,65.7],[21.2,65],[21.4,64.4],[19.8,63.6],[17.8,62.7],[17.1,61.3],[1',
        '7.8,60.6],[18.8,60.1],[17.9,59],[16.8,58.7],[16.4,57],[15.9,56.1],[14.7,56.2],[14.1,55.4],[12.9,55.4],[12.6,56.3],[11.8,',
        '57.4]]]]],["BLR","BY","BLR","112","Belarus",28.4,53.8,["BLR","BY","112","Belarus"],[[[[28.2,56.2],[29.2,55.9],[29.4,55.7',
        '],[29.9,55.8],[30.9,55.6],[31,55.1],[30.8,54.8],[31.4,54.2],[31.8,54],[31.7,53.8],[32.4,53.6],[32.7,53.4],[32.3,53.1],[3',
        '1.5,53.2],[31.3,53.1],[31.5,52.7],[31.8,52.1],[30.9,52],[30.6,51.8],[30.6,51.3],[30.2,51.4],[29.3,51.4],[29,51.6],[28.6,',
        '51.4],[28.2,51.6],[27.5,51.6],[26.3,51.8],[25.3,51.9],[24.6,51.9],[24,51.6],[23.5,51.6],[23.5,52],[23.2,52.5],[23.8,52.7',
        '],[23.8,53.1],[23.5,53.5],[23.5,53.9],[24.5,53.9],[25.5,54.3],[25.8,54.8],[26.6,55.2],[26.5,55.6],[27.1,55.8]]]]],["UKR"',
        ',"UA","UKR","804","Ukraine",32.1,49.7,["UKR","UA","804","Ukraine"],[[[[31.8,52.1],[32.2,52.1],[32.4,52.3],[32.7,52.2],[3',
        '3.8,52.3],[34.4,51.8],[34.1,51.6],[34.2,51.3],[35,51.2],[35.4,50.8],[35.4,50.6],[36.6,50.2],[37.4,50.4],[38,49.9],[38.6,',
        '49.9],[40.1,49.6],[40.1,49.3],[39.7,48.8],[39.9,48.2],[39.7,47.9],[38.8,47.8],[38.3,47.5],[38.2,47.1],[37.4,47],[36.8,46',
        '.7],[35.8,46.6],[35,46.3],[35,45.7],[34.9,45.8],[34.7,46],[34.4,46],[33.7,46.2],[33.4,46],[33.3,46.1],[31.7,46.3],[31.7,',
        '46.7],[30.7,46.6],[30.4,46],[29.6,45.3],[29.1,45.5],[28.7,45.3],[28.2,45.5],[28.5,45.6],[28.7,45.9],[28.9,46.3],[28.9,46',
        '.4],[29.1,46.5],[29.2,46.4],[29.8,46.3],[30,46.4],[29.8,46.5],[29.9,46.7],[29.6,46.9],[29.4,47.3],[29.1,47.5],[29.1,47.8',
        '],[28.7,48.1],[28.3,48.2],[27.5,48.5],[26.9,48.4],[26.6,48.2],[26.2,48.2],[25.9,48],[25.2,47.9],[24.9,47.7],[24.4,48],[2',
        '3.8,48],[23.1,48.1],[22.7,47.9],[22.6,48.2],[22.1,48.4],[22.3,48.8],[22.6,49.1],[22.8,49],[22.5,49.5],[23.4,50.3],[23.9,',
        '50.4],[24,50.7],[23.5,51.6],[24,51.6],[24.6,51.9],[25.3,51.9],[26.3,51.8],[27.5,51.6],[28.2,51.6],[28.6,51.4],[29,51.6],',
        '[29.3,51.4],[30.2,51.4],[30.6,51.3],[30.6,51.8],[30.9,52]]]]],["POL","PL","POL","616","Poland",19.5,52,["POL","PL","616"',
        ',"Poland"],[[[[23.5,53.9],[23.5,53.5],[23.8,53.1],[23.8,52.7],[23.2,52.5],[23.5,52],[23.5,51.6],[24,50.7],[23.9,50.4],[2',
        '3.4,50.3],[22.5,49.5],[22.8,49],[22.6,49.1],[21.6,49.5],[20.9,49.3],[20.4,49.4],[19.8,49.2],[19.3,49.6],[18.9,49.4],[18.',
        '9,49.5],[18.4,50],[17.6,50],[17.6,50.4],[16.9,50.5],[16.7,50.2],[16.2,50.4],[16.2,50.7],[15.5,50.8],[15,51.1],[14.6,51.7',
        '],[14.7,52.1],[14.4,52.6],[14.1,53],[14.4,53.2],[14.1,53.8],[14.8,54.1],[16.4,54.5],[17.6,54.9],[18.6,54.7],[18.7,54.4],',
        '[19.7,54.4],[20.9,54.3],[22.7,54.3],[23.2,54.2]]]]],["AUT","AT","AUT","040","Austria",14.1,47.5,["AUT","AT","040","A","A',
        'ustria"],[[[[17,48.1],[16.9,47.7],[16.3,47.7],[16.5,47.5],[16.2,46.9],[16,46.7],[15.1,46.7],[14.6,46.4],[13.8,46.5],[12.',
        '4,46.8],[12.2,47.1],[11.2,46.9],[11,46.8],[10.4,46.9],[9.9,46.9],[9.5,47.1],[9.6,47.3],[9.6,47.5],[9.9,47.6],[10.4,47.3]',
        ',[10.5,47.6],[11.4,47.5],[12.1,47.7],[12.6,47.7],[12.9,47.5],[13,47.6],[12.9,48.3],[13.2,48.4],[13.6,48.9],[14.3,48.6],[',
        '14.9,49],[15.3,49],[16,48.7],[16.5,48.8],[17,48.6],[16.9,48.5]]]]],["HUN","HU","HUN","348","Hungary",19.4,47.1,["HUN","H',
        'U","348","Hungary"],[[[[22.1,48.4],[22.6,48.2],[22.7,47.9],[22.1,47.7],[21.6,47],[21,46.3],[20.2,46.1],[19.6,46.2],[18.8',
        ',45.9],[18.5,45.8],[17.6,46],[16.9,46.4],[16.6,46.5],[16.4,46.8],[16.2,46.9],[16.5,47.5],[16.3,47.7],[16.9,47.7],[17,48.',
        '1],[17.5,47.9],[17.9,47.8],[18.7,47.9],[18.8,48.1],[19.2,48.1],[19.7,48.3],[19.8,48.2],[20.2,48.3],[20.5,48.6],[20.8,48.',
        '6],[21.9,48.3]]]]],["MDA","MD","MDA","498","Moldova",28.5,47.4,["MDA","MD","498","Moldova"],[[[[26.6,48.2],[26.9,48.4],[',
        '27.5,48.5],[28.3,48.2],[28.7,48.1],[29.1,47.8],[29.1,47.5],[29.4,47.3],[29.6,46.9],[29.9,46.7],[29.8,46.5],[30,46.4],[29',
        '.8,46.3],[29.2,46.4],[29.1,46.5],[28.9,46.4],[28.9,46.3],[28.7,45.9],[28.5,45.6],[28.2,45.5],[28.1,45.9],[28.2,46.4],[28',
        '.1,46.8],[27.6,47.4],[27.2,47.8],[26.9,48.1]]]]],["ROU","RO","ROU","642","Romania",25,45.7,["ROU","RO","642","ROM","Roma',
        'nia"],[[[[28.2,45.5],[28.7,45.3],[29.1,45.5],[29.6,45.3],[29.6,45],[29.1,44.8],[28.8,44.9],[28.6,43.7],[28,43.8],[27.2,4',
        '4.2],[26.1,43.9],[25.6,43.7],[24.1,43.7],[23.3,43.9],[22.9,43.8],[22.7,44.2],[22.5,44.4],[22.7,44.6],[22.5,44.7],[22.1,4',
        '4.5],[21.6,44.8],[21.5,45.2],[20.9,45.4],[20.8,45.7],[20.2,46.1],[21,46.3],[21.6,47],[22.1,47.7],[22.7,47.9],[23.1,48.1]',
        ',[23.8,48],[24.4,48],[24.9,47.7],[25.2,47.9],[25.9,48],[26.2,48.2],[26.6,48.2],[26.9,48.1],[27.2,47.8],[27.6,47.4],[28.1',
        ',46.8],[28.2,46.4],[28.1,45.9]]]]],["LTU","LT","LTU","440","Lithuania",24.1,55.1,["LTU","LT","440","Lithuania"],[[[[26.5',
        ',55.6],[26.6,55.2],[25.8,54.8],[25.5,54.3],[24.5,53.9],[23.5,53.9],[23.2,54.2],[22.7,54.3],[22.7,54.6],[22.8,54.9],[22.3',
        ',55],[21.3,55.2],[21.1,56],[22.2,56.3],[23.9,56.3],[24.9,56.4],[25,56.2],[25.5,56.1]]]]],["LVA","LV","LVA","428","Latvia',
        '",25.5,57.1,["LVA","LV","428","Latvia"],[[[[27.3,57.5],[27.8,57.2],[27.9,56.8],[28.2,56.2],[27.1,55.8],[26.5,55.6],[25.5',
        ',56.1],[25,56.2],[24.9,56.4],[23.9,56.3],[22.2,56.3],[21.1,56],[21.1,56.8],[21.6,57.4],[22.5,57.8],[23.3,57],[24.1,57],[',
        '24.3,57.8],[25.2,58],[25.6,57.8],[26.5,57.5]]]]],["EST","EE","EST","233","Estonia",25.9,58.7,["EST","EE","233","Estonia"',
        '],[[[[28,59.5],[28.1,59.3],[27.4,58.7],[27.7,57.8],[27.3,57.5],[26.5,57.5],[25.6,57.8],[25.2,58],[24.3,57.8],[24.4,58.4]',
        ',[24.1,58.3],[23.4,58.6],[23.3,59.2],[24.6,59.5],[25.9,59.6],[26.9,59.4]]]]],["DEU","DE","DEU","276","Germany",9.7,51,["',
        'DEU","DE","276","D","Germany"],[[[[14.1,53.8],[14.4,53.2],[14.1,53],[14.4,52.6],[14.7,52.1],[14.6,51.7],[15,51.1],[14.6,',
        '51],[14.3,51.1],[14.1,50.9],[13.3,50.7],[13,50.5],[12.2,50.3],[12.4,50],[12.5,49.5],[13,49.3],[13.6,48.9],[13.2,48.4],[1',
        '2.9,48.3],[13,47.6],[12.9,47.5],[12.6,47.7],[12.1,47.7],[11.4,47.5],[10.5,47.6],[10.4,47.3],[9.9,47.6],[9.6,47.5],[8.5,4',
        '7.8],[8.3,47.6],[7.5,47.6],[7.6,48.3],[8.1,49],[6.7,49.2],[6.2,49.5],[6.2,49.9],[6,50.1],[6.2,50.8],[6,51.9],[6.6,51.9],',
        '[6.8,52.2],[7.1,53.1],[6.9,53.5],[7.1,53.7],[7.9,53.7],[8.1,53.5],[8.8,54],[8.6,54.4],[8.5,55],[9.3,54.8],[9.9,55],[9.9,',
        '54.6],[11,54.4],[10.9,54],[12,54.2],[12.5,54.5],[13.6,54.1]]]]],["BGR","BG","BGR","100","Bulgaria",25.2,42.5,["BGR","BG"',
        ',"100","Bulgaria"],[[[[22.7,44.2],[22.9,43.8],[23.3,43.9],[24.1,43.7],[25.6,43.7],[26.1,43.9],[27.2,44.2],[28,43.8],[28.',
        '6,43.7],[28,43.3],[27.7,42.6],[28,42],[27.1,42.1],[26.1,41.8],[26.1,41.3],[25.2,41.2],[24.5,41.6],[23.7,41.3],[23,41.3],',
        '[22.9,42],[22.4,42.3],[22.5,42.5],[22.4,42.6],[22.6,42.9],[23,43.2],[22.5,43.6],[22.4,44]]]]],["GRC","GR","GRC","300","G',
        'reece",21.7,39.5,["GRC","GR","300","Greece"],[[[[26.3,35.3],[26.2,35],[24.7,34.9],[24.7,35.1],[23.5,35.3],[23.7,35.7],[2',
        '4.2,35.4],[25,35.4],[25.8,35.4],[25.7,35.2]]],[[[23,41.3],[23.7,41.3],[24.5,41.6],[25.2,41.2],[26.1,41.3],[26.1,41.8],[2',
        '6.6,41.6],[26.3,40.9],[26.1,40.8],[25.4,40.9],[24.9,40.9],[23.7,40.7],[24.4,40.1],[23.9,40],[23.3,40],[22.8,40.5],[22.6,',
        '40.3],[22.8,39.7],[23.4,39.2],[23,39],[23.5,38.5],[24,38.2],[24,37.7],[23.1,37.9],[23.4,37.4],[22.8,37.3],[23.2,36.4],[2',
        '2.5,36.4],[21.7,36.8],[21.3,37.6],[21.1,38.3],[20.7,38.8],[20.2,39.3],[20.2,39.6],[20.6,40.1],[20.7,40.4],[21,40.6],[21,',
        '40.8],[21.7,40.9],[22.1,41.1],[22.6,41.1],[22.8,41.3]]]]],["TUR","TR","TUR","792","Turkey",34.5,39.3,["TUR","TR","792","',
        'Turkey"],[[[[44.8,37.2],[44.3,37],[43.9,37.3],[42.8,37.4],[42.3,37.2],[41.2,37.1],[40.7,37.1],[39.5,36.7],[38.7,36.7],[3',
        '8.2,36.9],[37.1,36.6],[36.7,36.8],[36.7,36.3],[36.4,36],[36.1,35.8],[35.8,36.3],[36.2,36.7],[35.6,36.6],[34.7,36.8],[34,',
        '36.2],[32.5,36.1],[31.7,36.6],[30.6,36.7],[30.4,36.3],[29.7,36.1],[28.7,36.7],[27.6,36.7],[27,37.7],[26.3,38.2],[26.8,39',
        '],[26.2,39.5],[27.3,40.4],[28.8,40.5],[29.2,41.2],[31.1,41.1],[32.3,41.7],[33.5,42],[35.2,42],[36.9,41.3],[38.3,40.9],[3',
        '9.5,41.1],[40.4,41],[41.6,41.5],[42.6,41.6],[43.6,41.1],[43.8,40.7],[43.7,40.3],[44.4,40],[44.8,39.7],[44.1,39.4],[44.4,',
        '38.3],[44.2,38]]],[[[26.1,41.8],[27.1,42.1],[28,42],[28.1,41.6],[29,41.3],[28.8,41.1],[27.6,41],[27.2,40.7],[26.4,40.2],',
        '[26,40.6],[26.1,40.8],[26.3,40.9],[26.6,41.6]]]]],["ALB","AL","ALB","008","Albania",20.1,40.7,["ALB","AL","008","Albania',
        '"],[[[[21,40.8],[21,40.6],[20.7,40.4],[20.6,40.1],[20.2,39.6],[20,39.7],[20,39.9],[19.4,40.3],[19.3,40.7],[19.4,41.4],[1',
        '9.5,41.7],[19.4,41.9],[19.3,42.2],[19.7,42.7],[19.8,42.5],[20.1,42.6],[20.3,42.3],[20.5,42.2],[20.6,41.9],[20.5,41.5],[2',
        '0.6,41.1]]]]],["HRV","HR","HRV","191","Croatia",16.4,45.8,["HRV","HR","191","Croatia"],[[[[16.6,46.5],[16.9,46.4],[17.6,',
        '46],[18.5,45.8],[18.8,45.9],[19.1,45.5],[19.4,45.2],[19,44.9],[18.6,45.1],[17.9,45.1],[17,45.2],[16.5,45.2],[16.3,45],[1',
        '6,45.2],[15.8,44.8],[16.2,44.4],[16.5,44],[16.9,43.7],[17.3,43.4],[17.7,43],[18.6,42.7],[18.5,42.5],[17.5,42.8],[16.9,43',
        '.2],[16,43.5],[15.2,44.2],[15.4,44.3],[14.9,44.7],[14.9,45.1],[14.3,45.2],[14,44.8],[13.7,45.1],[13.7,45.5],[14.4,45.5],',
        '[14.6,45.6],[14.9,45.5],[15.3,45.5],[15.3,45.7],[15.7,45.8],[15.8,46.2]]]]],["CHE","CH","CHE","756","Switzerland",7.5,46',
        '.7,["CHE","CH","756","Switzerland"],[[[[9.6,47.5],[9.6,47.3],[9.5,47.1],[9.9,46.9],[10.4,46.9],[10.4,46.5],[9.9,46.3],[9',
        '.2,46.4],[9,46],[8.5,46],[8.3,46.2],[7.8,45.8],[7.3,45.8],[6.8,46],[6.5,46.4],[6,46.3],[6,46.7],[6.8,47.3],[6.7,47.5],[7',
        '.2,47.4],[7.5,47.6],[8.3,47.6],[8.5,47.8]]]]],["LUX","LU","LUX","442","Luxembourg",6.1,49.7,["LUX","LU","442","L","Luxem',
        'bourg"],[[[[6,50.1],[6.2,49.9],[6.2,49.5],[5.9,49.4],[5.7,49.5],[5.8,50.1]]]]],["BEL","BE","BEL","056","Belgium",4.8,50.',
        '8,["BEL","BE","056","B","Belgium"],[[[[6.2,50.8],[6,50.1],[5.8,50.1],[5.7,49.5],[4.8,50],[4.3,49.9],[3.6,50.4],[3.1,50.8',
        '],[2.7,50.8],[2.5,51.1],[3.3,51.3],[4,51.3],[5,51.5],[5.6,51]]]]],["NLD","NL","NLD","528","Netherlands",5.6,52.4,["NLD",',
        '"NL","528","NL1","Netherlands"],[[[[6.9,53.5],[7.1,53.1],[6.8,52.2],[6.6,51.9],[6,51.9],[6.2,50.8],[5.6,51],[5,51.5],[4,',
        '51.3],[3.3,51.3],[3.8,51.6],[4.7,53.1],[6.1,53.5]]]]],["PRT","PT","PRT","620","Portugal",-8.3,39.6,["PRT","PT","620","P"',
        ',"Portugal","PR1"],[[[[-9,41.9],[-8.7,42.1],[-8.3,42.3],[-8,41.8],[-7.4,41.8],[-7.3,41.9],[-6.7,41.9],[-6.4,41.4],[-6.9,',
        '41.1],[-6.9,40.3],[-7,40.2],[-7.1,39.7],[-7.5,39.6],[-7.1,39],[-7.4,38.4],[-7,38.1],[-7.2,37.8],[-7.5,37.4],[-7.5,37.1],',
        '[-7.9,36.8],[-8.4,37],[-8.9,36.9],[-8.7,37.7],[-8.8,38.3],[-9.3,38.4],[-9.5,38.7],[-9.4,39.4],[-9,39.8],[-9,40.2],[-8.8,',
        '40.8],[-8.8,41.2],[-9,41.5]]]]],["ESP","ES","ESP","724","Spain",-3.5,40.1,["ESP","ES","724","E","Spain"],[[[[-7.5,37.1],',
        '[-7.5,37.4],[-7.2,37.8],[-7,38.1],[-7.4,38.4],[-7.1,39],[-7.5,39.6],[-7.1,39.7],[-7,40.2],[-6.9,40.3],[-6.9,41.1],[-6.4,',
        '41.4],[-6.7,41.9],[-7.3,41.9],[-7.4,41.8],[-8,41.8],[-8.3,42.3],[-8.7,42.1],[-9,41.9],[-9,42.6],[-9.4,43],[-8,43.7],[-6.',
        '8,43.6],[-5.4,43.6],[-4.3,43.4],[-3.5,43.5],[-1.9,43.4],[-1.5,43],[0.3,42.6],[0.7,42.8],[1.8,42.3],[3,42.5],[3,41.9],[2.',
        '1,41.2],[0.8,41],[0.7,40.7],[0.1,40.1],[-0.3,39.3],[0.1,38.7],[-0.5,38.3],[-0.7,37.6],[-1.4,37.4],[-2.1,36.7],[-3.4,36.7',
        '],[-4.4,36.7],[-5,36.3],[-5.4,35.9],[-5.9,36],[-6.2,36.4],[-6.5,36.9]]]]],["IRL","IE","IRL","372","Ireland",-7.8,53.1,["',
        'IRL","IE","372","Ireland"],[[[[-6.2,53.9],[-6,53.2],[-6.8,52.3],[-8.6,51.7],[-10,51.8],[-9.2,52.9],[-9.7,53.9],[-8.3,54.',
        '7],[-7.6,55.1],[-7.4,54.6],[-7.6,54.1],[-7,54.1]]]]],["NCL","NC","NCL","540","New Caledonia",165.1,-21.1,["NCL","NC","54',
        '0","FR1","New Caledonia","France"],[[[[165.8,-21.1],[166.6,-21.7],[167.1,-22.2],[166.7,-22.4],[166.2,-22.1],[165.5,-21.7',
        '],[164.8,-21.1],[164.2,-20.4],[164,-20.1],[164.5,-20.1],[165,-20.5],[165.5,-20.8]]]]],["SLB","SB","SLB","090","Solomon I',
        'slands",159.2,-8,["SLB","SB","090","Solomon Is.","Solomon Islands"],[[[[162.1,-10.5],[162.4,-10.8],[161.7,-10.8],[161.3,',
        '-10.2],[161.9,-10.4]]],[[[161.7,-9.6],[161.5,-9.8],[160.8,-8.9],[160.6,-8.3],[160.9,-8.3],[161.3,-9.1]]],[[[160.9,-9.9],',
        '[160.5,-9.9],[159.8,-9.8],[159.6,-9.6],[159.7,-9.2],[160.4,-9.4],[160.7,-9.6]]],[[[159.6,-8],[159.9,-8.3],[159.9,-8.5],[',
        '159.1,-8.1],[158.6,-7.8],[158.2,-7.4],[158.4,-7.3],[158.8,-7.6]]],[[[157.1,-7],[157.5,-7.3],[157.3,-7.4],[156.9,-7.2],[1',
        '56.5,-6.8],[156.5,-6.6]]]]],["NZL","NZ","NZL","554","New Zealand",172.8,-39.8,["NZL","NZ","554","NZ1","New Zealand"],[[[',
        '[176.9,-40.1],[176.5,-40.6],[176,-41.3],[175.2,-41.7],[175.1,-41.4],[174.7,-41.3],[175.2,-40.5],[174.9,-39.9],[173.8,-39',
        '.5],[173.9,-39.1],[174.6,-38.8],[174.7,-38],[174.7,-37.4],[174.3,-36.7],[174.3,-36.5],[173.8,-36.1],[173.1,-35.2],[172.6',
        ',-34.5],[173,-34.5],[173.6,-35],[174.3,-35.3],[174.6,-36.2],[175.3,-37.2],[175.4,-36.5],[175.8,-36.8],[176,-37.6],[176.8',
        ',-37.9],[177.4,-38],[178,-37.6],[178.5,-37.7],[178.3,-38.6],[178,-39.2],[177.2,-39.1],[176.9,-39.4],[177,-39.9]]],[[[169',
        '.7,-43.6],[170.5,-43],[171.1,-42.5],[171.6,-41.8],[171.9,-41.5],[172.1,-41],[172.8,-40.5],[173,-40.9],[173.2,-41.3],[174',
        ',-40.9],[174.2,-41.3],[174.2,-41.8],[173.9,-42.2],[173.2,-43],[172.7,-43.4],[173.1,-43.9],[172.3,-43.9],[171.5,-44.2],[1',
        '71.2,-44.9],[170.6,-45.9],[169.8,-46.4],[169.3,-46.6],[168.4,-46.6],[167.8,-46.3],[166.7,-46.2],[166.5,-45.9],[167,-45.1',
        '],[168.3,-44.1],[168.9,-43.9]]]]],["AUS","AU","AUS","036","Australia",134,-24.1,["AUS","AU","036","AU1","Australia"],[[[',
        '[147.7,-40.8],[148.3,-40.9],[148.4,-42.1],[148,-42.4],[147.9,-43.2],[147.6,-42.9],[146.9,-43.6],[146.7,-43.6],[146,-43.5',
        '],[145.4,-42.7],[145.3,-42],[144.7,-41.2],[144.7,-40.7],[145.4,-40.8],[146.4,-41.1],[146.9,-41]]],[[[126.1,-32.2],[125.1',
        ',-32.7],[124.2,-33],[124,-33.5],[123.7,-33.9],[122.8,-33.9],[122.2,-34],[121.3,-33.8],[120.6,-33.9],[119.9,-34],[119.3,-',
        '34.5],[119,-34.5],[118.5,-34.7],[118,-35.1],[117.3,-35],[116.6,-35],[115.6,-34.4],[115,-34.2],[115,-33.6],[115.5,-33.5],',
        '[115.7,-33.3],[115.7,-32.9],[115.8,-32.2],[115.7,-31.6],[115.2,-30.6],[115,-30],[115,-29.5],[114.6,-28.8],[114.6,-28.5],',
        '[114.2,-28.1],[114,-27.3],[113.5,-26.5],[113.3,-26.1],[113.8,-26.5],[113.4,-25.6],[113.9,-25.9],[114.2,-26.3],[114.2,-25',
        '.8],[113.7,-25],[113.6,-24.7],[113.4,-24.4],[113.5,-23.8],[113.7,-23.6],[113.8,-23.1],[113.7,-22.5],[114.1,-21.8],[114.2',
        ',-22.5],[114.6,-21.8],[115.5,-21.5],[115.9,-21.1],[116.7,-20.7],[117.2,-20.6],[117.4,-20.7],[118.2,-20.4],[118.8,-20.3],',
        '[119,-20],[119.3,-20],[119.8,-20],[120.9,-19.7],[121.4,-19.2],[121.7,-18.7],[122.2,-18.2],[122.3,-17.8],[122.3,-17.3],[1',
        '23,-16.4],[123.4,-17.3],[123.9,-17.1],[123.5,-16.6],[123.8,-16.1],[124.3,-16.3],[124.4,-15.6],[124.9,-15.1],[125.2,-14.7',
        '],[125.7,-14.5],[125.7,-14.2],[126.1,-14.3],[126.1,-14.1],[126.6,-14],[127.1,-13.8],[127.8,-14.3],[128.4,-14.9],[129,-14',
        '.9],[129.6,-15],[129.4,-14.4],[129.9,-13.6],[130.3,-13.4],[130.2,-13.1],[130.6,-12.5],[131.2,-12.2],[131.7,-12.3],[132.6',
        ',-12.1],[132.6,-11.6],[131.8,-11.3],[132.4,-11.1],[133,-11.4],[133.6,-11.8],[134.4,-12],[134.7,-11.9],[135.3,-12.2],[135',
        '.9,-12],[136.3,-12],[136.5,-11.9],[137,-12.4],[136.7,-12.9],[136.3,-13.3],[136,-13.3],[136.1,-13.7],[135.8,-14.2],[135.4',
        ',-14.7],[135.5,-15],[136.3,-15.6],[137.1,-15.9],[137.6,-16.2],[138.3,-16.8],[138.6,-16.8],[139.1,-17.1],[139.3,-17.4],[1',
        '40.2,-17.7],[140.9,-17.4],[141.1,-16.8],[141.3,-16.4],[141.4,-15.8],[141.7,-15],[141.6,-14.6],[141.6,-14.3],[141.5,-13.7',
        '],[141.7,-12.9],[141.8,-12.7],[141.7,-12.4],[141.9,-11.9],[142.1,-11.3],[142.1,-11],[142.5,-10.7],[142.8,-11.2],[142.9,-',
        '11.8],[143.1,-11.9],[143.2,-12.3],[143.5,-12.8],[143.6,-13.4],[143.6,-13.8],[143.9,-14.5],[144.6,-14.2],[144.9,-14.6],[1',
        '45.4,-15],[145.3,-15.4],[145.5,-16.3],[145.6,-16.8],[145.9,-16.9],[146.2,-17.8],[146.1,-18.3],[146.4,-19],[147.5,-19.5],',
        '[148.2,-20],[148.8,-20.4],[148.7,-20.6],[149.3,-21.3],[149.7,-22.3],[150.1,-22.1],[150.5,-22.6],[150.7,-22.4],[150.9,-23',
        '.5],[151.6,-24.1],[152.1,-24.5],[152.9,-25.3],[153.1,-26.1],[153.2,-26.6],[153.1,-27.3],[153.6,-28.1],[153.5,-29],[153.3',
        ',-29.5],[153.1,-30.4],[153.1,-30.9],[152.9,-31.6],[152.5,-32.6],[151.7,-33],[151.3,-33.8],[151,-34.3],[150.7,-35.2],[150',
        '.3,-35.7],[150.1,-36.4],[149.9,-37.1],[150,-37.4],[149.4,-37.8],[148.3,-37.8],[147.4,-38.2],[146.9,-38.6],[146.3,-39],[1',
        '45.5,-38.6],[144.9,-38.4],[145,-37.9],[144.5,-38.1],[143.6,-38.8],[142.7,-38.5],[142.2,-38.4],[141.6,-38.3],[140.6,-38],',
        '[140,-37.4],[139.8,-36.6],[139.6,-36.1],[139.1,-35.7],[138.1,-35.6],[138.4,-35.1],[138.2,-34.4],[137.7,-35.1],[136.8,-35',
        '.3],[137.4,-34.7],[137.5,-34.1],[137.9,-33.6],[137.8,-32.9],[137,-33.8],[136.4,-34.1],[136,-34.9],[135.2,-34.5],[135.2,-',
        '33.9],[134.6,-33.2],[134.1,-32.8],[134.3,-32.6],[133,-32],[132.3,-32],[131.3,-31.5],[129.5,-31.6],[128.2,-31.9],[127.1,-',
        '32.3]]]]],["LKA","LK","LKA","144","Sri Lanka",80.7,7.6,["LKA","LK","144","Sri Lanka"],[[[[81.8,7.5],[81.6,6.5],[81.2,6.2',
        '],[80.3,6],[79.9,6.8],[79.7,8.2],[80.1,9.8],[80.8,9.3],[81.3,8.6]]]]],["CHN","CN","CHN","156","People\'s Republic of Chin',
        'a",106.3,32.5,["CHN","CN","156","CH1","China","People\'s Republic of China"],[[[[109.5,18.2],[108.7,18.5],[108.6,19.4],[1',
        '09.1,19.8],[110.2,20.1],[110.8,20.1],[111,19.7],[110.6,19.3],[110.3,18.7]]],[[[80.3,42.3],[80.2,42.9],[80.9,43.2],[80,44',
        '.9],[81.9,45.3],[82.5,45.5],[83.2,47.3],[85.2,47],[85.7,47.5],[85.8,48.5],[86.6,48.5],[87.4,49.2],[87.8,49.3],[88,48.6],',
        '[88.9,48.1],[90.3,47.7],[91,46.9],[90.6,45.7],[90.9,45.3],[92.1,45.1],[93.5,45],[94.7,44.4],[95.3,44.2],[95.8,43.3],[96.',
        '3,42.7],[97.5,42.7],[99.5,42.5],[100.8,42.7],[101.8,42.5],[103.3,41.9],[104.5,41.9],[105,41.6],[106.1,42.1],[107.7,42.5]',
        ',[109.2,42.5],[110.4,42.9],[111.1,43.4],[111.8,43.7],[111.7,44.1],[111.3,44.5],[111.9,45.1],[112.4,45],[113.5,44.8],[114',
        '.5,45.3],[116,45.7],[116.7,46.4],[117.4,46.7],[118.9,46.8],[119.7,46.7],[119.8,47],[118.9,47.7],[118.1,48.1],[117.3,47.7',
        '],[116.3,47.9],[115.7,47.7],[115.5,48.1],[116.2,49.1],[116.7,49.9],[117.9,49.5],[119.3,50.1],[119.3,50.6],[120.2,51.6],[',
        '120.7,52],[120.7,52.5],[120.2,52.8],[121,53.3],[122.2,53.4],[123.6,53.5],[125.1,53.2],[125.9,52.8],[126.6,51.8],[126.9,5',
        '1.4],[127.3,50.7],[127.7,49.8],[129.4,49.4],[130.6,48.7],[131,47.8],[132.5,47.8],[133.4,48.2],[135,48.5],[134.5,47.6],[1',
        '34.1,47.2],[133.8,46.1],[133.1,45.1],[131.9,45.3],[131,45],[131.3,44.1],[131.1,42.9],[130.6,42.9],[130.6,42.4],[130,43],',
        '[129.6,42.4],[128.1,42],[128.2,41.5],[127.3,41.5],[126.9,41.8],[126.2,41.1],[125.1,40.6],[124.3,39.9],[122.9,39.6],[122.',
        '1,39.2],[121.1,38.9],[121.6,39.4],[121.4,39.8],[122.2,40.4],[121.6,40.9],[120.8,40.6],[119.6,39.9],[119,39.3],[118,39.2]',
        ',[117.5,38.7],[118.1,38.1],[118.9,37.9],[118.9,37.4],[119.7,37.2],[120.8,37.9],[121.7,37.5],[122.4,37.5],[122.5,36.9],[1',
        '21.1,36.7],[120.6,36.1],[119.7,35.6],[119.2,34.9],[120.2,34.4],[120.6,33.4],[121.2,32.5],[121.9,31.7],[121.9,30.9],[121.',
        '3,30.7],[121.5,30.1],[122.1,29.8],[121.9,29],[121.7,28.2],[121.1,28.1],[120.4,27.1],[119.6,25.7],[118.7,24.5],[117.3,23.',
        '6],[115.9,22.8],[114.8,22.7],[114.2,22.2],[113.8,22.5],[113.2,22.1],[111.8,21.6],[110.8,21.4],[110.4,20.3],[109.9,20.3],',
        '[109.6,21],[109.9,21.4],[108.5,21.7],[108.1,21.6],[107,21.8],[106.6,22.2],[106.7,22.8],[105.8,23],[105.3,23.4],[104.5,22',
        '.8],[103.5,22.7],[102.7,22.7],[102.2,22.5],[101.7,22.3],[101.8,21.2],[101.3,21.2],[101.2,21.4],[101.2,21.8],[100.4,21.6]',
        ',[100,21.7],[99.2,22.1],[99.5,22.9],[98.9,23.1],[98.7,24.1],[97.6,23.9],[97.7,25.1],[98.7,25.9],[98.7,26.7],[98.7,27.5],',
        '[98.2,27.7],[97.9,28.3],[97.3,28.3],[96.2,28.4],[96.6,28.8],[96.1,29.5],[95.4,29],[94.6,29.3],[93.4,28.6],[92.5,27.9],[9',
        '1.7,27.8],[91.3,28],[90.7,28.1],[90,28.3],[89.5,28],[88.8,27.3],[88.7,28.1],[88.1,27.9],[87,28],[85.8,28.2],[85,28.6],[8',
        '4.2,28.8],[83.9,29.3],[83.3,29.5],[82.3,30.1],[81.5,30.4],[81.1,30.2],[79.7,30.9],[78.7,31.5],[78.5,32.6],[79.2,32.5],[7',
        '9.2,33],[78.8,33.5],[78.9,34.3],[77.8,35.5],[76.2,35.9],[75.9,36.7],[75.2,37.1],[75,37.4],[74.8,38],[74.9,38.4],[74.3,38',
        '.6],[73.9,38.5],[73.7,39.4],[74,39.7],[73.8,39.9],[74.8,40.4],[75.5,40.6],[76.5,40.4],[76.9,41.1],[78.2,41.2],[78.5,41.6',
        '],[80.1,42.1]]]]],["TWN","CN-TW","TWN","158","Taiwan",120.9,23.7,["TWN","CN-TW","158","TW","Taiwan"],[[[[121.8,24.4],[12',
        '1.2,22.8],[120.7,22],[120.2,22.8],[120.1,23.6],[120.7,24.5],[121.5,25.3],[122,25]]]]],["ITA","IT","ITA","380","Italy",11',
        '.1,44.7,["ITA","IT","380","I","Italy"],[[[[10.4,46.9],[11,46.8],[11.2,46.9],[12.2,47.1],[12.4,46.8],[13.8,46.5],[13.7,46',
        '],[13.9,45.6],[13.1,45.7],[12.3,45.4],[12.4,44.9],[12.3,44.6],[12.6,44.1],[13.5,43.6],[14,42.8],[15.1,42],[15.9,42],[16.',
        '2,41.7],[15.9,41.5],[16.8,41.2],[17.5,40.9],[18.4,40.4],[18.5,40.2],[18.3,39.8],[17.7,40.3],[16.9,40.4],[16.4,39.8],[17.',
        '2,39.4],[17.1,38.9],[16.6,38.8],[16.1,38],[15.7,37.9],[15.7,38.2],[15.9,38.8],[16.1,39],[15.7,39.5],[15.4,40],[15,40.2],',
        '[14.7,40.6],[14.1,40.8],[13.6,41.2],[12.9,41.3],[12.1,41.7],[11.2,42.4],[10.5,42.9],[10.2,43.9],[9.7,44],[8.9,44.4],[8.4',
        ',44.2],[7.9,43.8],[7.4,43.7],[7.5,44.1],[7,44.3],[6.7,45],[7.1,45.3],[6.8,45.7],[6.8,46],[7.3,45.8],[7.8,45.8],[8.3,46.2',
        '],[8.5,46],[9,46],[9.2,46.4],[9.9,46.3],[10.4,46.5]]],[[[14.8,38.1],[15.5,38.2],[15.2,37.4],[15.3,37.1],[15.1,36.6],[14.',
        '3,37],[13.8,37.1],[12.4,37.6],[12.6,38.1],[13.7,38]]],[[[8.7,40.9],[9.2,41.2],[9.8,40.5],[9.7,39.2],[9.2,39.2],[8.8,38.9',
        '],[8.4,39.2],[8.4,40.4],[8.2,41]]]]],["DNK","DK","DNK","208","Denmark",9,56,["DNK","DK","208","DN1","Denmark"],[[[[9.9,5',
        '5],[9.3,54.8],[8.5,55],[8.1,55.5],[8.1,56.5],[8.3,56.8],[8.5,57.1],[9.4,57.2],[9.8,57.4],[10.6,57.7],[10.5,57.2],[10.3,5',
        '6.9],[10.4,56.6],[10.9,56.5],[10.7,56.1],[10.4,56.2],[9.6,55.5]]],[[[12.4,56.1],[12.7,55.6],[12.1,54.8],[11,55.4],[10.9,',
        '55.8]]]]],["GBR","GB","GBR","826","United Kingdom",-2.1,54.4,["GBR","GB","826","GB1","United Kingdom"],[[[[-6.2,53.9],[-',
        '7,54.1],[-7.6,54.1],[-7.4,54.6],[-7.6,55.1],[-6.7,55.2],[-5.7,54.6]]],[[[-3.1,53.4],[-2.9,54],[-3.6,54.6],[-4.8,54.8],[-',
        '5.1,55.1],[-4.7,55.5],[-5,55.8],[-5.6,55.3],[-5.6,56.3],[-6.1,56.8],[-5.8,57.8],[-5,58.6],[-4.2,58.6],[-3,58.6],[-4.1,57',
        '.6],[-3.1,57.7],[-2,57.7],[-2.2,56.9],[-3.1,56],[-2.1,55.9],[-2,55.8],[-1.1,54.6],[-0.4,54.5],[0.2,53.3],[0.5,52.9],[1.7',
        ',52.7],[1.6,52.1],[1.1,51.8],[1.4,51.3],[0.6,50.8],[-0.8,50.8],[-2.5,50.5],[-3,50.7],[-3.6,50.2],[-4.5,50.3],[-5.2,50],[',
        '-5.8,50.2],[-4.3,51.2],[-3.4,51.4],[-5,51.6],[-5.3,52],[-4.2,52.3],[-4.8,52.8],[-4.6,53.5]]]]],["ISL","IS","ISL","352","',
        'Iceland",-18.7,64.8,["ISL","IS","352","Iceland"],[[[[-14.5,66.5],[-14.7,65.8],[-13.6,65.1],[-14.9,64.4],[-17.8,63.7],[-1',
        '8.7,63.5],[-20,63.6],[-22.8,64],[-21.8,64.4],[-24,64.9],[-22.2,65.1],[-22.2,65.4],[-24.3,65.6],[-23.7,66.3],[-22.1,66.4]',
        ',[-20.6,65.7],[-19.1,66.3],[-17.8,66],[-16.2,66.5]]]]],["AZE","AZ","AZE","031","Azerbaijan",47.2,40.4,["AZE","AZ","031",',
        '"Azerbaijan"],[[[[46.4,41.9],[46.7,41.8],[47.4,41.2],[47.8,41.2],[48,41.4],[48.6,41.8],[49.1,41.3],[49.6,40.6],[50.1,40.',
        '5],[50.4,40.3],[49.6,40.2],[49.4,39.4],[49.2,39],[48.9,38.8],[48.9,38.3],[48.6,38.3],[48,38.8],[48.4,39.3],[48.1,39.6],[',
        '47.7,39.5],[46.5,38.8],[46.5,39.5],[46,39.6],[45.6,39.9],[45.9,40.2],[45.4,40.6],[45.6,40.8],[45.2,41],[45,41.2],[45.2,4',
        '1.4],[46,41.1],[46.5,41.1],[46.6,41.2],[46.1,41.7]]],[[[46.1,38.7],[45.5,38.9],[45,39.3],[44.8,39.7],[45,39.7],[45.3,39.',
        '5],[45.7,39.5],[45.7,39.3]]]]],["GEO","GE","GEO","268","Georgia",43.7,41.9,["GEO","GE","268","Georgia"],[[[[40,43.4],[40',
        '.1,43.6],[40.9,43.4],[42.4,43.2],[43.8,42.7],[43.9,42.6],[44.5,42.7],[45.5,42.5],[45.8,42.1],[46.4,41.9],[46.1,41.7],[46',
        '.6,41.2],[46.5,41.1],[46,41.1],[45.2,41.4],[45,41.2],[43.6,41.1],[42.6,41.6],[41.6,41.5],[41.7,42],[41.5,42.6],[40.9,43]',
        ',[40.3,43.1]]]]],["PHL","PH","PHL","608","Philippines",122.5,11.2,["PHL","PH","608","Philippines"],[[[[120.8,12.7],[120.',
        '3,13.5],[121.2,13.4],[121.5,13.1],[121.3,12.2]]],[[[122.6,10],[122.8,10.3],[122.9,10.9],[123.5,10.9],[123.3,10.3],[124.1',
        ',11.2],[124,10.3],[123.6,10],[123.3,9.3],[123,9],[122.4,9.7]]],[[[126.4,8.4],[126.5,7.8],[126.5,7.2],[126.2,6.3],[125.8,',
        '7.3],[125.4,6.8],[125.7,6],[125.4,5.6],[124.2,6.2],[123.9,6.9],[124.2,7.4],[123.6,7.8],[123.3,7.4],[122.8,7.5],[122.1,6.',
        '9],[121.9,7.2],[122.3,8],[122.9,8.3],[123.5,8.7],[123.8,8.2],[124.6,8.5],[124.8,9],[125.5,9],[125.4,9.8],[126.2,9.3],[12',
        '6.3,8.8]]],[[[118.5,9.3],[117.2,8.4],[117.7,9.1],[118.4,9.7],[119,10.4],[119.5,11.4],[119.7,10.6],[119,10]]],[[[122.3,18',
        '.2],[122.2,17.8],[122.5,17.1],[122.3,16.3],[121.7,15.9],[121.5,15.1],[121.7,14.3],[122.3,14.2],[122.7,14.3],[124,13.8],[',
        '123.9,13.2],[124.2,13],[124.1,12.5],[123.3,13],[122.9,13.6],[122.7,13.2],[122,13.8],[121.1,13.6],[120.6,13.9],[120.7,14.',
        '3],[121,14.5],[120.7,14.8],[120.6,14.4],[120.1,15],[119.9,15.4],[119.9,16.4],[120.3,16],[120.4,17.6],[120.7,18.5],[121.3',
        ',18.5],[121.9,18.2],[122.2,18.5]]],[[[122,11.4],[121.9,11.9],[122.5,11.6],[123.1,11.6],[123.1,11.2],[122.6,10.7],[122,10',
        '.4],[122,10.9]]],[[[125.5,12.2],[125.8,11],[125,11.3],[125,11],[125.3,10.4],[124.8,10.1],[124.8,10.8],[124.5,10.9],[124.',
        '3,11.5],[124.9,11.4],[124.9,11.8],[124.3,12.6],[125.2,12.5]]]]],["MYS","MY","MYS","458","Malaysia",113.8,2.5,["MYS","MY"',
        ',"458","Malaysia"],[[[[100.1,6.5],[100.3,6.6],[101.1,6.2],[101.2,5.7],[101.8,5.8],[102.1,6.2],[102.4,6.1],[103,5.5],[103',
        '.4,4.9],[103.4,4.2],[103.3,3.7],[103.4,3.4],[103.5,2.8],[103.9,2.5],[104.2,1.6],[104.2,1.3],[103.5,1.2],[102.6,2],[101.4',
        ',2.8],[101.3,3.3],[100.7,3.9],[100.6,4.8],[100.2,5.3],[100.3,6]]],[[[117.9,4.1],[117,4.3],[115.9,4.3],[115.5,3.2],[115.1',
        ',2.8],[114.6,1.4],[113.8,1.2],[112.9,1.5],[112.4,1.4],[111.8,0.9],[111.2,1],[110.5,0.8],[109.8,1.3],[109.7,2],[110.4,1.7',
        '],[111.2,1.9],[111.4,2.7],[111.8,2.9],[113,3.1],[113.7,3.9],[114.2,4.5],[114.7,4],[114.9,4.3],[115.3,4.3],[115.4,5],[115',
        '.5,5.4],[116.2,6.1],[116.7,6.9],[117.1,6.9],[117.6,6.4],[117.7,6],[118.3,5.7],[119.2,5.4],[119.1,5],[118.4,5],[118.6,4.5',
        ']]]]],["BRN","BN","BRN","096","Brunei",114.6,4.4,["BRN","BN","096","Brunei","Brunei Darussalam"],[[[[115.5,5.4],[115.4,5',
        '],[115.3,4.3],[114.9,4.3],[114.7,4],[114.2,4.5],[114.6,4.9]]]]],["SVN","SI","SVN","705","Slovenia",14.9,46.1,["SVN","SI"',
        ',"705","SLO","Slovenia"],[[[[13.8,46.5],[14.6,46.4],[15.1,46.7],[16,46.7],[16.2,46.9],[16.4,46.8],[16.6,46.5],[15.8,46.2',
        '],[15.7,45.8],[15.3,45.7],[15.3,45.5],[14.9,45.5],[14.6,45.6],[14.4,45.5],[13.7,45.5],[13.9,45.6],[13.7,46]]]]],["FIN","',
        'FI","FIN","246","Finland",27.3,63.3,["FIN","FI","246","FI1","Finland"],[[[[28.6,69.1],[28.4,68.4],[30,67.7],[29.1,66.9],',
        '[30.2,65.8],[29.5,64.9],[30.4,64.2],[30,63.6],[31.5,62.9],[31.1,62.4],[30.2,61.8],[28.1,60.5],[26.3,60.4],[24.5,60.1],[2',
        '2.9,59.8],[22.3,60.4],[21.3,60.7],[21.5,61.7],[21.1,62.6],[21.5,63.2],[22.4,63.8],[24.7,64.9],[25.4,65.1],[25.3,65.5],[2',
        '3.9,66],[23.6,66.4],[23.5,67.9],[22,68.6],[20.6,69.1],[21.2,69.4],[22.4,68.8],[23.7,68.9],[24.7,68.6],[25.7,69.1],[26.2,',
        '69.8],[27.7,70.2],[29,69.8]]]]],["SVK","SK","SVK","703","Slovakia",19,48.7,["SVK","SK","703","Slovakia"],[[[[22.6,49.1],',
        '[22.3,48.8],[22.1,48.4],[21.9,48.3],[20.8,48.6],[20.5,48.6],[20.2,48.3],[19.8,48.2],[19.7,48.3],[19.2,48.1],[18.8,48.1],',
        '[18.7,47.9],[17.9,47.8],[17.5,47.9],[17,48.1],[16.9,48.5],[17,48.6],[17.1,48.8],[17.5,48.8],[17.9,48.9],[17.9,49],[18.1,',
        '49],[18.2,49.3],[18.4,49.3],[18.6,49.5],[18.9,49.5],[18.9,49.4],[19.3,49.6],[19.8,49.2],[20.4,49.4],[20.9,49.3],[21.6,49',
        '.5]]]]],["CZE","CZ","CZE","203","Czech Republic",15.4,49.9,["CZE","CZ","203","Czechia","Czech Republic"],[[[[15,51.1],[1',
        '5.5,50.8],[16.2,50.7],[16.2,50.4],[16.7,50.2],[16.9,50.5],[17.6,50.4],[17.6,50],[18.4,50],[18.9,49.5],[18.6,49.5],[18.4,',
        '49.3],[18.2,49.3],[18.1,49],[17.9,49],[17.9,48.9],[17.5,48.8],[17.1,48.8],[17,48.6],[16.5,48.8],[16,48.7],[15.3,49],[14.',
        '9,49],[14.3,48.6],[13.6,48.9],[13,49.3],[12.5,49.5],[12.4,50],[12.2,50.3],[13,50.5],[13.3,50.7],[14.1,50.9],[14.3,51.1],',
        '[14.6,51]]]]],["ERI","ER","ERI","232","Eritrea",38.3,15.8,["ERI","ER","232","Eritrea"],[[[[36.4,14.4],[36.3,14.8],[36.8,',
        '16.3],[36.9,17],[37.2,17.3],[37.9,17.4],[38.4,18],[39,16.8],[39.3,15.9],[39.8,15.4],[41.2,14.5],[41.7,13.9],[42.3,13.3],',
        '[42.6,13],[43.1,12.7],[42.8,12.5],[42.4,12.5],[42,12.9],[41.6,13.5],[41.2,13.8],[40.9,14.1],[40,14.5],[39.3,14.5],[39.1,',
        '14.7],[38.5,14.5],[37.9,15],[37.6,14.2]]]]],["JPN","JP","JPN","392","Japan",138.4,36.1,["JPN","JP","392","J","Japan"],[[',
        '[[141.9,39.2],[141,38.2],[141,37.1],[140.6,36.3],[140.8,35.8],[140.3,35.1],[139,34.7],[137.2,34.6],[135.8,33.5],[135.1,3',
        '3.8],[135.1,34.6],[133.3,34.4],[132.2,33.9],[131,33.9],[132,33.1],[131.3,31.5],[130.7,31],[130.2,31.4],[130.4,32.3],[129',
        '.8,32.6],[129.4,33.3],[130.4,33.6],[130.9,34.2],[131.9,34.7],[132.6,35.4],[134.6,35.7],[135.7,35.5],[136.7,37.3],[137.4,',
        '36.8],[138.9,37.8],[139.4,38.2],[140.1,39.4],[139.9,40.6],[140.3,41.2],[141.4,41.4],[141.9,40]]],[[[144.6,44],[145.3,44.',
        '4],[145.5,43.3],[144.1,43],[143.2,42],[141.6,42.7],[141.1,41.6],[140,41.6],[139.8,42.6],[140.3,43.3],[141.4,43.4],[141.7',
        ',44.8],[142,45.6],[143.1,44.5],[143.9,44.2]]],[[[132.4,33.5],[132.9,34.1],[133.5,33.9],[133.9,34.4],[134.6,34.1],[134.8,',
        '33.8],[134.2,33.2],[133.8,33.5],[133.3,33.3],[133,32.7],[132.4,33]]]]],["PRY","PY","PRY","600","Paraguay",-60.1,-21.7,["',
        'PRY","PY","600","Paraguay"],[[[[-58.2,-20.2],[-57.9,-20.7],[-57.9,-22.1],[-56.9,-22.3],[-56.5,-22.1],[-55.8,-22.4],[-55.',
        '6,-22.7],[-55.5,-23.6],[-55.4,-24],[-55,-24],[-54.7,-23.8],[-54.3,-24],[-54.3,-24.6],[-54.4,-25.2],[-54.6,-25.7],[-54.8,',
        '-26.6],[-55.7,-27.4],[-56.5,-27.5],[-57.6,-27.4],[-58.6,-27.1],[-57.6,-25.6],[-57.8,-25.2],[-58.8,-24.8],[-60,-24],[-60.',
        '8,-23.9],[-62.7,-22.2],[-62.3,-21.1],[-62.3,-20.5],[-61.8,-19.6],[-60,-19.3],[-59.1,-19.4],[-58.2,-19.9]]]]],["YEM","YE"',
        ',"YEM","887","Yemen",45.9,15.3,["YEM","YE","887","RY","Yemen"],[[[[52,19],[52.8,17.3],[53.1,16.7],[52.4,16.4],[52.2,15.9',
        '],[52.2,15.6],[51.2,15.2],[49.6,14.7],[48.7,14],[48.2,13.9],[47.9,14],[47.4,13.6],[46.7,13.4],[45.9,13.3],[45.6,13.3],[4',
        '5.4,13],[45.1,13],[45,12.7],[44.5,12.7],[44.2,12.6],[43.5,12.6],[43.2,13.2],[43.3,13.8],[43.1,14.1],[42.9,14.8],[42.6,15',
        '.2],[42.8,15.3],[42.7,15.7],[42.8,15.9],[42.8,16.3],[43.2,16.7],[43.1,17.1],[43.4,17.6],[43.8,17.3],[44.1,17.4],[45.2,17',
        '.4],[45.4,17.3],[46.4,17.2],[46.7,17.3],[47,16.9],[47.5,17.1],[48.2,18.2],[49.1,18.6]]]]],["SAU","SA","SAU","682","Saudi',
        ' Arabia",44.7,23.8,["SAU","SA","682","Saudi Arabia"],[[[[35,29.4],[36.1,29.2],[36.5,29.5],[36.7,29.9],[37.5,30],[37.7,30',
        '.3],[38,30.5],[37,31.5],[39,32],[39.2,32.2],[40.4,31.9],[41.9,31.2],[44.7,29.2],[46.6,29.1],[47.5,29],[47.7,28.5],[48.4,',
        '28.6],[48.8,27.7],[49.3,27.5],[49.5,27.1],[50.2,26.7],[50.2,26.3],[50.1,25.9],[50.2,25.6],[50.5,25.3],[50.7,25],[50.8,24',
        '.8],[51.1,24.6],[51.4,24.6],[51.6,24.2],[51.6,24],[52,23],[55,22.5],[55.2,22.7],[55.7,22],[55,20],[52,19],[49.1,18.6],[4',
        '8.2,18.2],[47.5,17.1],[47,16.9],[46.7,17.3],[46.4,17.2],[45.4,17.3],[45.2,17.4],[44.1,17.4],[43.8,17.3],[43.4,17.6],[43.',
        '1,17.1],[43.2,16.7],[42.8,16.3],[42.6,16.8],[42.3,17.1],[42.3,17.5],[41.8,17.8],[41.2,18.7],[40.9,19.5],[40.2,20.2],[39.',
        '8,20.3],[39.1,21.3],[39,22],[39.1,22.6],[38.5,23.7],[38,24.1],[37.5,24.3],[37.2,24.9],[37.2,25.1],[36.9,25.6],[36.6,25.8',
        '],[36.2,26.6],[35.6,27.4],[35.1,28.1],[34.6,28.1],[34.8,28.6],[34.8,29]]]]],["ATA","AQ","ATA","010","Antarctica",35.9,-7',
        '9.8,["ATA","AQ","010","Antarctica"],[[[[-48.7,-78],[-48.2,-78],[-46.7,-77.8],[-45.2,-78],[-43.9,-78.5],[-43.5,-79.1],[-4',
        '3.4,-79.5],[-43.3,-80],[-44.9,-80.3],[-46.5,-80.6],[-48.4,-80.8],[-50.5,-81],[-52.9,-81],[-54.2,-80.6],[-54,-80.2],[-51.',
        '9,-79.9],[-51,-79.6],[-50.4,-79.2],[-49.9,-78.8],[-49.3,-78.5]]],[[[-66.3,-80.3],[-64,-80.3],[-61.9,-80.4],[-61.1,-80],[',
        '-60.6,-79.6],[-59.6,-80],[-59.9,-80.5],[-60.2,-81],[-62.3,-80.9],[-64.5,-80.9],[-65.7,-80.6],[-65.7,-80.5]]],[[[-73.9,-7',
        '1.3],[-73.2,-71.2],[-72.1,-71.2],[-71.8,-70.7],[-71.7,-70.3],[-71.7,-69.5],[-71.2,-69],[-70.3,-68.9],[-69.7,-69.3],[-69.',
        '5,-69.6],[-69.1,-70.1],[-68.7,-70.5],[-68.5,-71],[-68.3,-71.4],[-68.5,-71.8],[-68.8,-72.2],[-70,-72.3],[-71.1,-72.5],[-7',
        '2.4,-72.5],[-71.9,-72.1],[-73.1,-72.2],[-74.2,-72.4],[-75,-72.1],[-75,-71.7]]],[[[-102.3,-71.9],[-101.7,-71.7],[-100.4,-',
        '71.9],[-99,-71.9],[-97.9,-72.1],[-96.8,-72],[-96.2,-72.5],[-97,-72.4],[-98.2,-72.5],[-99.4,-72.4],[-100.8,-72.5],[-101.8',
        ',-72.3]]],[[[-122.6,-73.7],[-122.4,-73.3],[-121.2,-73.5],[-119.9,-73.7],[-118.7,-73.5],[-119.3,-73.8],[-120.2,-74.1],[-1',
        '21.6,-74]]],[[[-127.3,-73.5],[-126.6,-73.2],[-125.6,-73.5],[-124,-73.9],[-124.6,-73.8],[-125.9,-73.7]]],[[[-163.7,-78.6]',
        ',[-163.1,-78.2],[-161.2,-78.4],[-160.2,-78.7],[-159.5,-79],[-159.2,-79.5],[-161.1,-79.6],[-162.4,-79.3],[-163,-78.9],[-1',
        '63.1,-78.9]]],[[[180,-84.7],[180,-90],[-180,-90],[-180,-84.7],[-179.9,-84.7],[-179.1,-84.1],[-177.3,-84.5],[-177.1,-84.4',
        '],[-176.1,-84.1],[-175.9,-84.1],[-175.8,-84.1],[-174.4,-84.5],[-173.1,-84.1],[-172.9,-84.1],[-170,-83.9],[-169,-84.1],[-',
        '168.5,-84.2],[-167,-84.6],[-164.2,-84.8],[-161.9,-85.1],[-158.1,-85.4],[-155.2,-85.1],[-150.9,-85.3],[-148.5,-85.6],[-14',
        '5.9,-85.3],[-143.1,-85],[-142.9,-84.6],[-146.8,-84.5],[-150.1,-84.3],[-150.9,-83.9],[-153.6,-83.7],[-153.4,-83.2],[-153,',
        '-82.8],[-152.7,-82.5],[-152.9,-82],[-154.5,-81.8],[-155.3,-81.4],[-156.8,-81.1],[-154.4,-81.2],[-152.1,-81],[-150.6,-81.',
        '3],[-148.9,-81],[-147.2,-80.7],[-146.4,-80.3],[-146.8,-79.9],[-148.1,-79.7],[-149.5,-79.4],[-151.6,-79.3],[-153.4,-79.2]',
        ',[-155.3,-79.1],[-156,-78.7],[-157.3,-78.4],[-158.1,-78],[-158.4,-76.9],[-157.9,-77],[-157,-77.3],[-155.3,-77.2],[-153.7',
        ',-77.1],[-152.9,-77.5],[-151.3,-77.4],[-150,-77.2],[-148.7,-76.9],[-147.6,-76.6],[-146.1,-76.5],[-146.1,-76.1],[-146.5,-',
        '75.7],[-146.2,-75.4],[-144.9,-75.2],[-144.3,-75.5],[-142.8,-75.3],[-141.6,-75.1],[-140.2,-75.1],[-138.9,-75],[-137.5,-74',
        '.7],[-136.4,-74.5],[-135.2,-74.3],[-134.4,-74.4],[-133.7,-74.4],[-132.3,-74.3],[-130.9,-74.5],[-129.6,-74.5],[-128.2,-74',
        '.3],[-126.9,-74.4],[-125.4,-74.5],[-124,-74.5],[-122.6,-74.5],[-121.1,-74.5],[-119.7,-74.5],[-118.7,-74.2],[-117.5,-74],',
        '[-116.2,-74.2],[-115,-74.1],[-113.9,-73.7],[-113.3,-74],[-112.9,-74.4],[-112.3,-74.7],[-111.3,-74.4],[-110.1,-74.8],[-10',
        '8.7,-74.9],[-107.6,-75.2],[-106.1,-75.1],[-104.9,-74.9],[-103.4,-75],[-102,-75.1],[-100.6,-75.3],[-100.1,-74.9],[-100.8,',
        '-74.5],[-101.3,-74.2],[-102.5,-74.1],[-103.1,-73.7],[-103.3,-73.4],[-103.7,-72.6],[-102.9,-72.8],[-101.6,-72.8],[-100.3,',
        '-72.8],[-99.1,-72.9],[-98.1,-73.2],[-97.7,-73.6],[-96.3,-73.6],[-95,-73.5],[-93.7,-73.3],[-92.4,-73.2],[-91.4,-73.4],[-9',
        '0.1,-73.3],[-89.2,-72.6],[-88.4,-73],[-87.3,-73.2],[-86,-73.1],[-85.2,-73.5],[-83.9,-73.5],[-82.7,-73.6],[-81.5,-73.9],[',
        '-80.7,-73.5],[-80.3,-73.1],[-79.3,-73.5],[-77.9,-73.4],[-76.9,-73.6],[-76.2,-74],[-74.9,-73.9],[-73.9,-73.7],[-72.8,-73.',
        '4],[-71.6,-73.3],[-70.2,-73.1],[-68.9,-73],[-68,-72.8],[-67.4,-72.5],[-67.1,-72],[-67.3,-71.6],[-67.6,-71.2],[-67.9,-70.',
        '9],[-68.2,-70.5],[-68.5,-70.1],[-68.5,-69.7],[-68.4,-69.3],[-68,-69],[-67.6,-68.5],[-67.4,-68.1],[-67.6,-67.7],[-67.7,-6',
        '7.3],[-67.3,-66.9],[-66.7,-66.6],[-66.1,-66.2],[-65.4,-65.9],[-64.6,-65.6],[-64.2,-65.2],[-63.6,-64.9],[-63,-64.6],[-62,',
        '-64.6],[-61.4,-64.3],[-60.7,-64.1],[-59.9,-64],[-59.2,-63.7],[-58.6,-63.4],[-57.8,-63.3],[-57.2,-63.5],[-57.6,-63.9],[-5',
        '8.6,-64.2],[-59,-64.4],[-59.8,-64.2],[-60.6,-64.3],[-61.3,-64.5],[-62,-64.8],[-62.5,-65.1],[-62.6,-65.5],[-62.6,-65.9],[',
        '-62.1,-66.2],[-62.8,-66.4],[-63.7,-66.5],[-64.3,-66.8],[-64.9,-67.2],[-65.5,-67.6],[-65.7,-68],[-65.3,-68.4],[-64.8,-68.',
        '7],[-64,-68.9],[-63.2,-69.2],[-62.8,-69.6],[-62.6,-70],[-62.3,-70.4],[-61.8,-70.7],[-61.5,-71.1],[-61.4,-72],[-61.1,-72.',
        '4],[-61,-72.8],[-60.7,-73.2],[-60.8,-73.7],[-61.4,-74.1],[-62,-74.4],[-63.3,-74.6],[-63.7,-74.9],[-64.4,-75.3],[-65.9,-7',
        '5.6],[-67.2,-75.8],[-68.4,-76],[-69.8,-76.2],[-70.6,-76.6],[-72.2,-76.7],[-74,-76.6],[-75.6,-76.7],[-77.2,-76.7],[-76.9,',
        '-77.1],[-75.4,-77.3],[-74.3,-77.6],[-73.7,-77.9],[-74.8,-78.2],[-76.5,-78.1],[-77.9,-78.4],[-78,-78.8],[-78,-79.2],[-76.',
        '8,-79.5],[-76.6,-79.9],[-75.4,-80.3],[-73.2,-80.4],[-71.4,-80.7],[-70,-81],[-68.2,-81.3],[-65.7,-81.5],[-63.3,-81.7],[-6',
        '1.6,-82],[-59.7,-82.4],[-58.7,-82.8],[-58.2,-83.2],[-57,-82.9],[-55.4,-82.6],[-53.6,-82.3],[-51.5,-82],[-49.8,-81.7],[-4',
        '7.3,-81.7],[-44.8,-81.8],[-42.8,-82.1],[-42.2,-81.7],[-40.8,-81.4],[-38.2,-81.3],[-36.3,-81.1],[-34.4,-80.9],[-32.3,-80.',
        '8],[-30.1,-80.6],[-28.5,-80.3],[-29.3,-80],[-29.7,-79.6],[-29.7,-79.3],[-31.6,-79.3],[-33.7,-79.5],[-35.6,-79.5],[-35.9,',
        '-79.1],[-35.8,-78.3],[-35.3,-78.1],[-33.9,-77.9],[-32.2,-77.7],[-31,-77.4],[-29.8,-77.1],[-28.9,-76.7],[-27.5,-76.5],[-2',
        '6.2,-76.4],[-25.5,-76.3],[-23.9,-76.2],[-22.5,-76.1],[-21.2,-75.9],[-20,-75.7],[-18.9,-75.4],[-17.5,-75.1],[-16.6,-74.8]',
        ',[-15.7,-74.5],[-15.4,-74.1],[-16.5,-73.9],[-16.1,-73.5],[-15.4,-73.1],[-14.4,-73],[-13.3,-72.7],[-12.3,-72.4],[-11.5,-7',
        '2],[-11,-71.5],[-10.3,-71.3],[-9.1,-71.3],[-8.6,-71.7],[-7.4,-71.7],[-7.4,-71.3],[-6.9,-70.9],[-5.8,-71],[-5.5,-71.4],[-',
        '4.3,-71.5],[-3,-71.3],[-1.8,-71.2],[-0.7,-71.2],[-0.2,-71.6],[0.9,-71.3],[1.9,-71.1],[3,-71],[4.1,-70.9],[5.2,-70.6],[6.',
        '3,-70.5],[7.1,-70.2],[7.7,-69.9],[8.5,-70.1],[9.5,-70],[10.2,-70.5],[10.8,-70.8],[12,-70.6],[12.4,-70.2],[13.4,-70],[14.',
        '7,-70],[15.1,-70.4],[15.9,-70],[17,-69.9],[18.2,-69.9],[19.3,-69.9],[20.4,-70],[21.5,-70.1],[21.9,-70.4],[22.6,-70.7],[2',
        '3.7,-70.5],[24.8,-70.5],[26,-70.5],[27.1,-70.5],[28.1,-70.3],[29.2,-70.2],[30,-69.9],[31,-69.8],[32,-69.7],[32.8,-69.4],',
        '[33.3,-68.8],[33.9,-68.5],[34.9,-68.7],[35.3,-69],[36.2,-69.2],[37.2,-69.2],[37.9,-69.5],[38.6,-69.8],[39.7,-69.5],[40,-',
        '69.1],[40.9,-68.9],[42,-68.6],[42.9,-68.5],[44.1,-68.3],[44.9,-68.1],[45.7,-67.8],[46.5,-67.6],[47.4,-67.7],[48.3,-67.4]',
        ',[49,-67.1],[49.9,-67.1],[50.8,-66.9],[50.9,-66.5],[51.8,-66.2],[52.6,-66.1],[53.6,-65.9],[54.5,-65.8],[55.4,-65.9],[56.',
        '4,-66],[57.2,-66.2],[57.3,-66.7],[58.1,-67],[58.7,-67.3],[59.9,-67.4],[60.6,-67.7],[61.4,-68],[62.4,-68],[63.2,-67.8],[6',
        '4.1,-67.4],[65,-67.6],[66,-67.7],[66.9,-67.9],[67.9,-67.9],[68.9,-67.9],[69.7,-69],[69.7,-69.2],[69.6,-69.7],[68.6,-69.9',
        '],[67.8,-70.3],[67.9,-70.7],[69.1,-70.7],[68.9,-71.1],[68.4,-71.4],[67.9,-71.9],[68.7,-72.2],[69.9,-72.3],[71,-72.1],[71',
        '.6,-71.7],[71.9,-71.3],[72.5,-71],[73.1,-70.7],[73.3,-70.4],[73.9,-69.9],[74.5,-69.8],[75.6,-69.7],[76.6,-69.6],[77.6,-6',
        '9.5],[78.1,-69.1],[78.4,-68.7],[79.1,-68.3],[80.1,-68.1],[80.9,-67.9],[81.5,-67.5],[82.1,-67.4],[82.8,-67.2],[83.8,-67.3',
        '],[84.7,-67.2],[85.7,-67.1],[86.8,-67.2],[87.5,-66.9],[88,-66.2],[88.4,-66.5],[88.8,-67],[89.7,-67.2],[90.6,-67.2],[91.6',
        ',-67.1],[92.6,-67.2],[93.5,-67.2],[94.2,-67.1],[95,-67.2],[95.8,-67.4],[96.7,-67.2],[97.8,-67.2],[98.7,-67.1],[99.7,-67.',
        '2],[100.4,-66.9],[100.9,-66.6],[101.6,-66.3],[102.8,-65.6],[103.5,-65.7],[104.2,-66],[104.9,-66.3],[106.2,-66.9],[107.2,',
        '-67],[108.1,-67],[109.2,-66.8],[110.2,-66.7],[111.1,-66.4],[111.7,-66.1],[112.9,-66.1],[113.6,-65.9],[114.4,-66.1],[114.',
        '9,-66.4],[115.6,-66.7],[116.7,-66.7],[117.4,-66.9],[118.6,-67.2],[119.8,-67.3],[120.9,-67.2],[121.7,-66.9],[122.3,-66.6]',
        ',[123.2,-66.5],[124.1,-66.6],[125.2,-66.7],[126.1,-66.6],[127,-66.6],[127.9,-66.7],[128.8,-66.8],[129.7,-66.6],[130.8,-6',
        '6.4],[131.8,-66.4],[132.9,-66.4],[133.9,-66.3],[134.8,-66.2],[135,-65.7],[135.1,-65.3],[135.7,-65.6],[135.9,-66],[136.2,',
        '-66.4],[136.6,-66.8],[137.5,-67],[138.6,-66.9],[139.9,-66.9],[140.8,-66.8],[142.1,-66.8],[143.1,-66.8],[144.4,-66.8],[14',
        '5.5,-66.9],[146.2,-67.2],[146,-67.6],[146.6,-67.9],[147.7,-68.1],[148.8,-68.4],[150.1,-68.6],[151.5,-68.7],[152.5,-68.9]',
        ',[153.6,-68.9],[154.3,-68.6],[155.2,-68.8],[155.9,-69.1],[156.8,-69.4],[158,-69.5],[159.2,-69.6],[159.7,-70],[160.8,-70.',
        '2],[161.6,-70.6],[162.7,-70.7],[163.8,-70.7],[164.9,-70.8],[166.1,-70.8],[167.3,-70.8],[168.4,-71],[169.5,-71.2],[170.5,',
        '-71.4],[171.2,-71.7],[171.1,-72.1],[170.6,-72.4],[170.1,-72.9],[169.8,-73.2],[169.3,-73.7],[168,-73.8],[167.4,-74.2],[16',
        '6.1,-74.4],[165.6,-74.8],[165,-75.1],[164.2,-75.5],[163.8,-75.9],[163.6,-76.2],[163.5,-76.7],[163.5,-77.1],[164.1,-77.5]',
        ',[164.3,-77.8],[164.7,-78.2],[166.6,-78.3],[167,-78.8],[165.2,-78.9],[163.7,-79.1],[161.8,-79.2],[160.9,-79.7],[160.7,-8',
        '0.2],[160.3,-80.6],[159.8,-80.9],[161.1,-81.3],[161.6,-81.7],[162.5,-82.1],[163.7,-82.4],[165.1,-82.7],[166.6,-83],[168.',
        '9,-83.3],[169.4,-83.8],[172.3,-84],[172.5,-84.1],[173.2,-84.4],[176,-84.2],[178.3,-84.5]]]]],["CYN","","","","Turkish Re',
        'public of Northern Cyprus",33.7,35.2,["CYN","CN","N. Cyprus","Turkish Republic of Northern Cyprus","Northern Cyprus"],[[',
        '[[32.7,35.1],[32.8,35.1],[32.9,35.4],[33.7,35.4],[34.6,35.7],[33.9,35.2],[34,35.1],[33.9,35.1],[33.7,35],[33.5,35],[33.5',
        ',35.1],[33.4,35.2],[33.2,35.2],[32.9,35.1]]]]],["CYP","CY","CYP","196","Cyprus",33.1,34.9,["CYP","CY","196","Cyprus"],[[',
        '[[32.7,35.1],[32.9,35.1],[33.2,35.2],[33.4,35.2],[33.5,35.1],[33.5,35],[33.7,35],[33.9,35.1],[34,35.1],[34,35],[33,34.6]',
        ',[32.5,34.7],[32.3,35.1]]]]],["MAR","MA","MAR","504","Morocco",-7.2,31.7,["MAR","MA","504","Morocco"],[[[[-2.2,35.2],[-1',
        '.8,34.5],[-1.7,33.9],[-1.4,32.9],[-1.1,32.7],[-1.3,32.3],[-2.6,32.1],[-3.1,31.7],[-3.6,31.6],[-3.7,30.9],[-4.9,30.5],[-5',
        '.2,30],[-6.1,29.7],[-7.1,29.6],[-8.7,28.8],[-8.7,27.7],[-8.8,27.7],[-8.8,27.1],[-9.4,27.1],[-9.7,26.9],[-10.2,26.9],[-10',
        '.6,27],[-11.4,26.9],[-11.7,26.1],[-12,26],[-12.5,24.8],[-13.9,23.7],[-14.2,22.3],[-14.6,21.9],[-14.8,21.5],[-17,21.4],[-',
        '17,21.9],[-16.6,22.2],[-16.3,22.7],[-16.3,23],[-16,23.7],[-15.4,24.4],[-15.1,24.5],[-14.8,25.1],[-14.8,25.6],[-14.4,26.3',
        '],[-13.8,26.6],[-13.1,27.6],[-13.1,27.7],[-12.6,28],[-11.7,28.1],[-10.9,28.8],[-10.4,29.1],[-9.6,29.9],[-9.8,31.2],[-9.4',
        ',32],[-9.3,32.6],[-8.7,33.2],[-7.7,33.7],[-6.9,34.1],[-6.2,35.1],[-5.9,35.8],[-5.2,35.8],[-4.6,35.3],[-3.6,35.4],[-2.6,3',
        '5.2]]]]],["EGY","EG","EGY","818","Egypt",29.4,26.2,["EGY","EG","818","Egypt"],[[[[36.9,22],[32.9,22],[29,22],[25,22],[25',
        ',25.7],[25,29.2],[24.7,30],[25,30.7],[24.8,31.1],[25.2,31.6],[26.5,31.6],[27.5,31.3],[28.5,31],[28.9,30.9],[29.7,31.2],[',
        '30.1,31.5],[31,31.6],[31.7,31.4],[32,30.9],[32.2,31.3],[33,31],[33.8,31],[34.3,31.2],[34.8,29.8],[34.9,29.5],[34.6,29.1]',
        ',[34.4,28.3],[34.2,27.8],[33.9,27.6],[33.6,28],[33.1,28.4],[32.4,29.9],[32.3,29.8],[32.7,28.7],[33.3,27.7],[34.1,26.1],[',
        '34.5,25.6],[34.8,25],[35.7,23.9],[35.5,23.8],[35.5,23.1],[36.7,22.2]]]]],["LBY","LY","LBY","434","Libya",18,26.6,["LBY",',
        '"LY","434","Libya"],[[[[25,22],[25,20],[23.9,20],[23.8,19.6],[19.8,21.5],[15.9,23.4],[14.9,22.9],[14.1,22.5],[13.6,23],[',
        '12,23.5],[11.6,24.1],[10.8,24.6],[10.3,24.4],[9.9,24.9],[9.9,25.4],[9.3,26.1],[9.7,26.5],[9.6,27.1],[9.8,27.7],[9.7,28.1',
        '],[9.9,29],[9.8,29.4],[9.5,30.3],[10,30.5],[10.1,31],[10,31.4],[10.6,31.8],[10.9,32.1],[11.4,32.4],[11.5,33.1],[12.7,32.',
        '8],[13.1,32.9],[13.9,32.7],[15.2,32.3],[15.7,31.4],[16.6,31.2],[18,30.8],[19.1,30.3],[19.6,30.5],[20.1,31],[19.8,31.8],[',
        '20.1,32.2],[20.9,32.7],[21.5,32.8],[22.9,32.6],[23.2,32.2],[23.6,32.2],[23.9,32],[24.9,31.9],[25.2,31.6],[24.8,31.1],[25',
        ',30.7],[24.7,30],[25,29.2],[25,25.7]]]]],["ETH","ET","ETH","231","Ethiopia",39.1,8,["ETH","ET","231","Ethiopia"],[[[[47.',
        '8,8],[45,5],[43.7,5],[42.8,4.3],[42.1,4.2],[41.9,3.9],[41.2,3.9],[40.8,4.3],[39.9,3.8],[39.6,3.4],[38.9,3.5],[38.7,3.6],',
        '[38.4,3.6],[38.1,3.6],[36.9,4.4],[36.2,4.4],[35.8,4.8],[35.8,5.3],[35.3,5.5],[34.7,6.6],[34.3,6.8],[34.1,7.2],[33.6,7.7]',
        ',[33,7.8],[33.3,8.4],[33.8,8.4],[34,8.7],[34,9.6],[34.3,10.6],[34.7,10.9],[34.8,11.3],[35.3,12.1],[35.9,12.6],[36.3,13.6',
        '],[36.4,14.4],[37.6,14.2],[37.9,15],[38.5,14.5],[39.1,14.7],[39.3,14.5],[40,14.5],[40.9,14.1],[41.2,13.8],[41.6,13.5],[4',
        '2,12.9],[42.4,12.5],[42,12.1],[41.7,11.6],[41.7,11.4],[41.8,11.1],[42.3,11],[42.6,11.1],[42.8,10.9],[42.6,10.6],[42.9,10',
        '],[43.3,9.5],[43.7,9.2],[46.9,8]]]]],["DJI","DJ","DJI","262","Djibouti",42.5,12,["DJI","DJ","262","Djibouti"],[[[[42.4,1',
        '2.5],[42.8,12.5],[43.1,12.7],[43.3,12.4],[43.3,12],[42.7,11.7],[43.1,11.5],[42.8,10.9],[42.6,11.1],[42.3,11],[41.8,11.1]',
        ',[41.7,11.4],[41.7,11.6],[42,12.1]]]]],["SOL","","","","Somaliland",46.7,9.4,["SOL","SL","Somaliland"],[[[[48.9,11.4],[4',
        '8.9,11],[48.9,10],[48.9,9.5],[48.5,8.8],[47.8,8],[46.9,8],[43.7,9.2],[43.3,9.5],[42.9,10],[42.6,10.6],[42.8,10.9],[43.1,',
        '11.5],[43.5,11.3],[43.7,10.9],[44.1,10.4],[44.6,10.4],[45.6,10.7],[46.6,10.8],[47.5,11.1],[48,11.2],[48.4,11.4]]]]],["UG',
        'A","UG","UGA","800","Uganda",32.9,2,["UGA","UG","800","Uganda"],[[[[33.9,-0.9],[31.9,-1],[30.8,-1],[30.4,-1.1],[29.8,-1.',
        '4],[29.6,-1.3],[29.6,-0.6],[29.8,-0.2],[29.9,0.6],[30.1,1.1],[30.5,1.6],[30.9,1.8],[31.2,2.2],[30.8,2.3],[30.8,3.5],[31.',
        '2,3.8],[31.9,3.6],[32.7,3.8],[33.4,3.8],[34,4.2],[34.5,3.6],[34.6,3.1],[35,1.9],[34.7,1.2],[34.2,0.5],[33.9,0.1]]]]],["R',
        'WA","RW","RWA","646","Rwanda",30.1,-1.9,["RWA","RW","646","Rwanda"],[[[[30.4,-1.1],[30.8,-1.7],[30.8,-2.3],[30.5,-2.4],[',
        '29.9,-2.3],[29.6,-2.9],[29,-2.8],[29.1,-2.3],[29.3,-2.2],[29.3,-1.6],[29.6,-1.3],[29.8,-1.4]]]]],["BIH","BA","BIH","070"',
        ',"Bosnia and Herzegovina",18.1,44.1,["BIH","BA","070","BiH","Bosnia and Herz.","Bosnia and Herzegovina"],[[[[18.6,42.7],',
        '[17.7,43],[17.3,43.4],[16.9,43.7],[16.5,44],[16.2,44.4],[15.8,44.8],[16,45.2],[16.3,45],[16.5,45.2],[17,45.2],[17.9,45.1',
        '],[18.6,45.1],[19,44.9],[19.4,44.9],[19.1,44.4],[19.6,44],[19.5,43.6],[19.2,43.5],[19,43.4],[18.7,43.2]]]]],["MKD","MK",',
        '"MKD","807","North Macedonia",21.6,41.6,["MKD","MK","807","NM","North Macedonia"],[[[[22.4,42.3],[22.9,42],[23,41.3],[22',
        '.8,41.3],[22.6,41.1],[22.1,41.1],[21.7,40.9],[21,40.8],[20.6,41.1],[20.5,41.5],[20.6,41.9],[20.7,41.8],[20.8,42.1],[21.4',
        ',42.2],[21.6,42.2],[21.9,42.3]]]]],["SRB","RS","SRB","688","Serbia",20.8,44.2,["SRB","RS","688","YF","Serbia","Republic ',
        'of Serbia"],[[[[18.8,45.9],[19.6,46.2],[20.2,46.1],[20.8,45.7],[20.9,45.4],[21.5,45.2],[21.6,44.8],[22.1,44.5],[22.5,44.',
        '7],[22.7,44.6],[22.5,44.4],[22.7,44.2],[22.4,44],[22.5,43.6],[23,43.2],[22.6,42.9],[22.4,42.6],[22.5,42.5],[22.4,42.3],[',
        '21.9,42.3],[21.6,42.2],[21.5,42.3],[21.7,42.4],[21.8,42.7],[21.6,42.7],[21.4,42.9],[21.3,42.9],[21.1,43.1],[21,43.1],[20',
        '.8,43.3],[20.6,43.2],[20.5,42.9],[20.3,42.8],[20.3,42.9],[20,43.1],[19.6,43.2],[19.5,43.4],[19.2,43.5],[19.5,43.6],[19.6',
        ',44],[19.1,44.4],[19.4,44.9],[19,44.9],[19.4,45.2],[19.1,45.5]]]]],["MNE","ME","MNE","499","Montenegro",19.1,42.8,["MNE"',
        ',"ME","499","Montenegro"],[[[[20.1,42.6],[19.8,42.5],[19.7,42.7],[19.3,42.2],[19.4,41.9],[19.2,42],[18.9,42.3],[18.5,42.',
        '5],[18.6,42.7],[18.7,43.2],[19,43.4],[19.2,43.5],[19.5,43.4],[19.6,43.2],[20,43.1],[20.3,42.9],[20.3,42.8]]]]],["KOS",""',
        ',"","","Kosovo",20.9,42.6,["KOS","KO","KV","KSV","Kosovo"],[[[[20.6,41.9],[20.5,42.2],[20.3,42.3],[20.1,42.6],[20.3,42.8',
        '],[20.5,42.9],[20.6,43.2],[20.8,43.3],[21,43.1],[21.1,43.1],[21.3,42.9],[21.4,42.9],[21.6,42.7],[21.8,42.7],[21.7,42.4],',
        '[21.5,42.3],[21.6,42.2],[21.4,42.2],[20.8,42.1],[20.7,41.8]]]]],["TTO","TT","TTO","780","Trinidad and Tobago",-60.9,11,[',
        '"TTO","TT","780","Trinidad and Tobago"],[[[[-61.7,10.8],[-61.1,10.9],[-60.9,10.9],[-60.9,10.1],[-61.8,10],[-61.9,10.1],[',
        '-61.7,10.4]]]]],["SDS","SS","SSD","728","South Sudan",30.4,7.2,["SDS","SS","SSD","728","S. Sudan","South Sudan"],[[[[30.',
        '8,3.5],[30,4.2],[29.7,4.6],[29.2,4.4],[28.7,4.5],[28.4,4.3],[28,4.4],[27.4,5.2],[27.2,5.6],[26.5,5.9],[26.2,6.5],[25.8,7',
        '],[25.1,7.5],[25.1,7.8],[24.6,8.2],[23.9,8.6],[24.2,8.7],[24.5,8.9],[24.8,9.8],[25.1,10.3],[25.8,10.4],[26,10.1],[26.5,9',
        '.6],[26.8,9.5],[27.1,9.6],[27.8,9.6],[28,9.4],[29,9.4],[29,9.6],[29.5,9.8],[29.6,10.1],[30,10.3],[30.8,9.7],[31.4,9.8],[',
        '31.9,10.5],[32.4,11.1],[32.3,11.7],[32.1,12],[32.7,12],[32.7,12.2],[33.2,12.2],[33.1,11.4],[33.2,10.7],[33.7,10.3],[33.8',
        ',10],[33.8,9.5],[34,9.5],[34,8.7],[33.8,8.4],[33.3,8.4],[33,7.8],[33.6,7.7],[34.1,7.2],[34.3,6.8],[34.7,6.6],[35.3,5.5],',
        '[34.6,4.8],[34,4.2],[33.4,3.8],[32.7,3.8],[31.9,3.6],[31.2,3.8]]]]]]',
    ].join('');
    let countryCache;
    function naturalEarthCountries110m() {
        countryCache ??= JSON.parse(serializedCountries);
        return countryCache;
    }

    /**
     * Returns at most `target` evenly spaced indices, including both endpoints when
     * the budget allows. Unlike the compatibility sampler above, this helper never
     * emits an extra endpoint beyond the requested budget.
     */
    function exactStrideSampleIndices(length, target) {
        const safeLength = Number.isFinite(length) ? Math.max(0, Math.trunc(length)) : 0;
        const safeTarget = Number.isFinite(target) ? Math.max(0, Math.trunc(target)) : 0;
        const count = Math.min(safeLength, safeTarget);
        if (count === 0)
            return [];
        if (count === safeLength)
            return Array.from({ length: safeLength }, (_, index) => index);
        if (count === 1)
            return [Math.floor((safeLength - 1) / 2)];
        return Array.from({ length: count }, (_, index) => Math.round((index * (safeLength - 1)) / (count - 1)));
    }

    const palette$1 = [
        '#4f46e5',
        '#0f9f8a',
        '#f59e0b',
        '#e05260',
        '#7c3aed',
        '#0e7490',
        '#db2777',
        '#65a30d',
        '#475569',
        '#ea580c',
    ];
    const pointToCssPixel = 96 / 72;
    const millimeterToCssPixel = 96 / 25.4;
    const matplotlibPointToCssPixel = 100 / 72;
    const matplotlibPalette = [
        '#1F77B4',
        '#FF7F0E',
        '#2CA02C',
        '#D62728',
        '#9467BD',
        '#8C564B',
        '#E377C2',
        '#7F7F7F',
        '#BCBD22',
        '#17BECF',
    ];
    const graflumeLight = {
        name: 'graflume-light',
        mode: 'light',
        colors: {
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#0f172a',
            mutedText: '#64748b',
            axis: '#cbd5e1',
            grid: '#e8eef6',
            focus: '#4f46e5',
            palette: palette$1,
            sequential: ['#eef2ff', '#c7d2fe', '#818cf8', '#4f46e5', '#312e81'],
            diverging: ['#b42318', '#f79084', '#f8fafc', '#84adff', '#3448c5'],
        },
        typography: {
            fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 12,
            titleSize: 20,
            subtitleSize: 12,
            lineHeight: 1.45,
        },
        spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
        axis: { lineWidth: 1, tickLength: 0, labelPadding: 9, gridLineWidth: 1 },
        mark: { lineWidth: 2.5, pointRadius: 4.5, barRadius: 5, opacity: 1 },
        motion: { duration: 280, easing: 'ease-out' },
    };
    const graflumeDark = {
        ...graflumeLight,
        name: 'graflume-dark',
        mode: 'dark',
        colors: {
            ...graflumeLight.colors,
            background: '#0b1020',
            surface: '#111827',
            text: '#f8fafc',
            mutedText: '#a7b2c5',
            axis: '#475569',
            grid: '#25314a',
            focus: '#818cf8',
            palette: [
                '#818cf8',
                '#2dd4bf',
                '#fbbf24',
                '#fb7185',
                '#a78bfa',
                '#22d3ee',
                '#f472b6',
                '#a3e635',
                '#94a3b8',
                '#fb923c',
            ],
            sequential: ['#1e293b', '#3730a3', '#6366f1', '#a5b4fc', '#eef2ff'],
            diverging: ['#fb7185', '#be123c', '#334155', '#4f46e5', '#a5b4fc'],
        },
    };
    /**
     * ggplot2 v4.0.3 theme_gray() rendered in CSS pixels at the browser reference
     * density of 96 dpi. Data-scale colours follow ggplot2's default hue and
     * two-colour continuous scales rather than a fixed categorical array.
     */
    const graflumeGgplot = {
        name: 'ggplot',
        mode: 'light',
        colors: {
            background: '#FFFFFF',
            surface: '#FFFFFF',
            panel: '#EBEBEB',
            text: '#000000',
            mutedText: '#4D4D4D',
            subtitle: '#000000',
            axisTitle: '#000000',
            axis: '#333333',
            grid: '#FFFFFF',
            minorGrid: '#FFFFFF',
            focus: '#3366FF',
            palette: [
                '#F8766D',
                '#D89000',
                '#A3A500',
                '#39B600',
                '#00BF7D',
                '#00BFC4',
                '#00B0F6',
                '#9590FF',
                '#E76BF3',
                '#FF62BC',
            ],
            paletteMode: 'ggplot2-hue',
            sequential: ['#132B43', '#56B1F7'],
            diverging: ['#832424', '#FFFFFF', '#3A3A98'],
        },
        typography: {
            fontFamily: 'sans-serif',
            fontSize: 11 * pointToCssPixel,
            fontWeight: 400,
            titleSize: 13.2 * pointToCssPixel,
            titleWeight: 400,
            subtitleSize: 11 * pointToCssPixel,
            subtitleWeight: 400,
            axisLabelSize: 8.8 * pointToCssPixel,
            axisLabelWeight: 400,
            axisTitleSize: 11 * pointToCssPixel,
            axisTitleWeight: 400,
            legendLabelSize: 8.8 * pointToCssPixel,
            legendLabelWeight: 400,
            legendTitleSize: 11 * pointToCssPixel,
            legendTitleWeight: 400,
            titlePosition: 'panel',
            lineHeight: 0.9,
        },
        spacing: {
            xs: 5.5 * pointToCssPixel,
            sm: 5.5 * pointToCssPixel,
            md: 11 * pointToCssPixel,
            lg: 5.5 * pointToCssPixel,
            xl: 22 * pointToCssPixel,
            plotMargin: 5.5 * pointToCssPixel,
        },
        axis: {
            lineWidth: 0.5 * millimeterToCssPixel,
            tickLength: 2.75 * pointToCssPixel,
            labelPadding: 2.2 * pointToCssPixel,
            gridLineWidth: 0.5 * millimeterToCssPixel,
            lineVisible: false,
            ticksVisible: true,
            gridX: true,
            gridX2: false,
            gridY: true,
            gridY2: false,
            gridOpacity: 1,
            minorGridVisible: true,
            minorGridLineWidth: 0.25 * millimeterToCssPixel,
            minorGridOpacity: 1,
            emphasizeZero: false,
            lineCap: 'butt',
            titleGap: 2.75 * pointToCssPixel,
        },
        mark: {
            lineWidth: 0.5 * millimeterToCssPixel,
            pointRadius: 0.75 * millimeterToCssPixel,
            barRadius: 0,
            opacity: 1,
            defaultColor: '#000000',
            lineColor: '#000000',
            pointFill: '#000000',
            pointStroke: '#000000',
            pointStrokeWidth: 0.5 * millimeterToCssPixel,
            barFill: '#595959',
            barWidthRatio: 0.9,
            areaFill: '#333333',
            areaStrokeVisible: false,
            lineCap: 'butt',
            lineJoin: 'round',
        },
        legend: {
            surfaceOpacity: 1,
            borderWidth: 0,
            cornerRadius: 0,
            swatchRadius: 0,
            swatchSize: 1.2 * 11 * pointToCssPixel,
            lineWidth: 0.5 * millimeterToCssPixel,
            pointRadius: 0.75 * millimeterToCssPixel,
            pointStrokeWidth: 0.5 * millimeterToCssPixel,
            lineCap: 'butt',
        },
        motion: { duration: 280, easing: 'ease-out' },
    };
    /**
     * R 4.6.1 base graphics defaults mapped to the browser reference density of
     * 96 dpi. Device-specific font discovery and rasterisation remain outside the
     * portable theme contract.
     */
    const graflumeRBase = {
        name: 'r-base',
        mode: 'light',
        colors: {
            background: '#FFFFFF',
            surface: '#FFFFFF',
            panel: '#FFFFFF',
            text: '#000000',
            mutedText: '#000000',
            subtitle: '#000000',
            axisTitle: '#000000',
            axis: '#000000',
            grid: '#D9D9D9',
            focus: '#2297E6',
            palette: [
                '#000000',
                '#DF536B',
                '#61D04F',
                '#2297E6',
                '#28E2E5',
                '#CD0BBC',
                '#F5C710',
                '#9E9E9E',
            ],
            sequential: ['#FFFFCC', '#FED976', '#FD8D3C', '#E31A1C', '#800026'],
            diverging: ['#2166AC', '#67A9CF', '#F7F7F7', '#EF8A62', '#B2182B'],
        },
        typography: {
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontSize: 12 * pointToCssPixel,
            fontWeight: 400,
            titleSize: 14.4 * pointToCssPixel,
            titleWeight: 700,
            subtitleSize: 12 * pointToCssPixel,
            subtitleWeight: 400,
            axisLabelSize: 12 * pointToCssPixel,
            axisLabelWeight: 400,
            axisTitleSize: 12 * pointToCssPixel,
            axisTitleWeight: 400,
            legendLabelSize: 12 * pointToCssPixel,
            legendLabelWeight: 400,
            legendTitleSize: 12 * pointToCssPixel,
            legendTitleWeight: 400,
            titlePosition: 'panel',
            titleAlign: 'center',
            lineHeight: 1.2,
        },
        spacing: {
            xs: 4,
            sm: 8,
            md: 12,
            lg: 16,
            xl: 24,
            plotPadding: { top: 24, right: 30, bottom: 73, left: 59 },
        },
        axis: {
            lineWidth: 1,
            boxVisible: true,
            boxLineWidth: 1,
            boxExcludedMarks: ['bar', 'pie'],
            tickLength: 6,
            labelPadding: 5,
            gridLineWidth: 1,
            lineVisible: true,
            ticksVisible: true,
            gridX: false,
            gridX2: false,
            gridY: false,
            gridY2: false,
            gridOpacity: 1,
            minorGridVisible: false,
            emphasizeZero: false,
            lineCap: 'butt',
            titleGap: 8,
        },
        mark: {
            lineWidth: 1,
            pointRadius: 3.75,
            barRadius: 0,
            opacity: 1,
            defaultColor: '#000000',
            lineColor: '#000000',
            pointFill: 'transparent',
            pointStroke: '#000000',
            pointStrokeWidth: 1,
            barFill: '#BEBEBE',
            barStroke: '#000000',
            barStrokeWidth: 1,
            barWidthRatio: 0.8,
            histogramFill: '#D3D3D3',
            boxplotFill: '#D3D3D3',
            boxplotLineWidth: 1,
            boxplotRadius: 0,
            piePalette: ['#FFFFFF', '#ADD8E6', '#FFE4E1', '#E0FFFF', '#E6E6FA', '#FFF8DC'],
            pieStroke: '#000000',
            pieStrokeWidth: 1,
            areaFill: '#BEBEBE',
            areaStroke: '#000000',
            areaStrokeVisible: true,
            lineCap: 'round',
            lineJoin: 'round',
        },
        legend: {
            surfaceOpacity: 1,
            borderWidth: 1,
            cornerRadius: 0,
            swatchRadius: 0,
            swatchSize: 12 * pointToCssPixel,
            lineWidth: 1,
            pointRadius: 3.75,
            pointStrokeWidth: 1,
            lineCap: 'round',
        },
        motion: { duration: 0, easing: 'linear' },
    };
    /**
     * Matplotlib 3.11.1's default rcParams mapped to a 640 x 480 browser canvas
     * at Matplotlib's default 100 dpi. Graflume retains its own chart semantics
     * while matching the reference typography, axes, marks, colour cycle, and
     * viridis/coolwarm scale surfaces.
     */
    const graflumeMatplotlib = {
        name: 'matplotlib',
        mode: 'light',
        colors: {
            background: '#FFFFFF',
            surface: '#FFFFFF',
            panel: '#FFFFFF',
            text: '#000000',
            mutedText: '#000000',
            subtitle: '#000000',
            axisTitle: '#000000',
            axis: '#000000',
            grid: '#B0B0B0',
            minorGrid: '#B0B0B0',
            focus: '#1F77B4',
            palette: matplotlibPalette,
            continuousInterpolation: 'step',
            sequential: [
                '#440154',
                '#440256',
                '#450457',
                '#450559',
                '#46075A',
                '#46085C',
                '#460A5D',
                '#460B5E',
                '#470D60',
                '#470E61',
                '#471063',
                '#471164',
                '#471365',
                '#481467',
                '#481668',
                '#481769',
                '#48186A',
                '#481A6C',
                '#481B6D',
                '#481C6E',
                '#481D6F',
                '#481F70',
                '#482071',
                '#482173',
                '#482374',
                '#482475',
                '#482576',
                '#482677',
                '#482878',
                '#482979',
                '#472A7A',
                '#472C7A',
                '#472D7B',
                '#472E7C',
                '#472F7D',
                '#46307E',
                '#46327E',
                '#46337F',
                '#463480',
                '#453581',
                '#453781',
                '#453882',
                '#443983',
                '#443A83',
                '#443B84',
                '#433D84',
                '#433E85',
                '#423F85',
                '#424086',
                '#424186',
                '#414287',
                '#414487',
                '#404588',
                '#404688',
                '#3F4788',
                '#3F4889',
                '#3E4989',
                '#3E4A89',
                '#3E4C8A',
                '#3D4D8A',
                '#3D4E8A',
                '#3C4F8A',
                '#3C508B',
                '#3B518B',
                '#3B528B',
                '#3A538B',
                '#3A548C',
                '#39558C',
                '#39568C',
                '#38588C',
                '#38598C',
                '#375A8C',
                '#375B8D',
                '#365C8D',
                '#365D8D',
                '#355E8D',
                '#355F8D',
                '#34608D',
                '#34618D',
                '#33628D',
                '#33638D',
                '#32648E',
                '#32658E',
                '#31668E',
                '#31678E',
                '#31688E',
                '#30698E',
                '#306A8E',
                '#2F6B8E',
                '#2F6C8E',
                '#2E6D8E',
                '#2E6E8E',
                '#2E6F8E',
                '#2D708E',
                '#2D718E',
                '#2C718E',
                '#2C728E',
                '#2C738E',
                '#2B748E',
                '#2B758E',
                '#2A768E',
                '#2A778E',
                '#2A788E',
                '#29798E',
                '#297A8E',
                '#297B8E',
                '#287C8E',
                '#287D8E',
                '#277E8E',
                '#277F8E',
                '#27808E',
                '#26818E',
                '#26828E',
                '#26828E',
                '#25838E',
                '#25848E',
                '#25858E',
                '#24868E',
                '#24878E',
                '#23888E',
                '#23898E',
                '#238A8D',
                '#228B8D',
                '#228C8D',
                '#228D8D',
                '#218E8D',
                '#218F8D',
                '#21908D',
                '#21918C',
                '#20928C',
                '#20928C',
                '#20938C',
                '#1F948C',
                '#1F958B',
                '#1F968B',
                '#1F978B',
                '#1F988B',
                '#1F998A',
                '#1F9A8A',
                '#1E9B8A',
                '#1E9C89',
                '#1E9D89',
                '#1F9E89',
                '#1F9F88',
                '#1FA088',
                '#1FA188',
                '#1FA187',
                '#1FA287',
                '#20A386',
                '#20A486',
                '#21A585',
                '#21A685',
                '#22A785',
                '#22A884',
                '#23A983',
                '#24AA83',
                '#25AB82',
                '#25AC82',
                '#26AD81',
                '#27AD81',
                '#28AE80',
                '#29AF7F',
                '#2AB07F',
                '#2CB17E',
                '#2DB27D',
                '#2EB37C',
                '#2FB47C',
                '#31B57B',
                '#32B67A',
                '#34B679',
                '#35B779',
                '#37B878',
                '#38B977',
                '#3ABA76',
                '#3BBB75',
                '#3DBC74',
                '#3FBC73',
                '#40BD72',
                '#42BE71',
                '#44BF70',
                '#46C06F',
                '#48C16E',
                '#4AC16D',
                '#4CC26C',
                '#4EC36B',
                '#50C46A',
                '#52C569',
                '#54C568',
                '#56C667',
                '#58C765',
                '#5AC864',
                '#5CC863',
                '#5EC962',
                '#60CA60',
                '#63CB5F',
                '#65CB5E',
                '#67CC5C',
                '#69CD5B',
                '#6CCD5A',
                '#6ECE58',
                '#70CF57',
                '#73D056',
                '#75D054',
                '#77D153',
                '#7AD151',
                '#7CD250',
                '#7FD34E',
                '#81D34D',
                '#84D44B',
                '#86D549',
                '#89D548',
                '#8BD646',
                '#8ED645',
                '#90D743',
                '#93D741',
                '#95D840',
                '#98D83E',
                '#9BD93C',
                '#9DD93B',
                '#A0DA39',
                '#A2DA37',
                '#A5DB36',
                '#A8DB34',
                '#AADC32',
                '#ADDC30',
                '#B0DD2F',
                '#B2DD2D',
                '#B5DE2B',
                '#B8DE29',
                '#BADE28',
                '#BDDF26',
                '#C0DF25',
                '#C2DF23',
                '#C5E021',
                '#C8E020',
                '#CAE11F',
                '#CDE11D',
                '#D0E11C',
                '#D2E21B',
                '#D5E21A',
                '#D8E219',
                '#DAE319',
                '#DDE318',
                '#DFE318',
                '#E2E418',
                '#E5E419',
                '#E7E419',
                '#EAE51A',
                '#ECE51B',
                '#EFE51C',
                '#F1E51D',
                '#F4E61E',
                '#F6E620',
                '#F8E621',
                '#FBE723',
                '#FDE725',
            ],
            diverging: [
                '#3B4CC0',
                '#5977E3',
                '#7B9FF9',
                '#9EBEFF',
                '#C0D4F5',
                '#DDDCDC',
                '#F2CBB7',
                '#F7AC8E',
                '#EE8468',
                '#D65244',
                '#B40426',
            ],
        },
        typography: {
            fontFamily: '"DejaVu Sans", "Bitstream Vera Sans", "Computer Modern Sans Serif", Arial, Helvetica, sans-serif',
            fontSize: 10 * matplotlibPointToCssPixel,
            fontWeight: 400,
            titleSize: 12 * matplotlibPointToCssPixel,
            titleWeight: 400,
            subtitleSize: 10 * matplotlibPointToCssPixel,
            subtitleWeight: 400,
            axisLabelSize: 10 * matplotlibPointToCssPixel,
            axisLabelWeight: 400,
            axisTitleSize: 10 * matplotlibPointToCssPixel,
            axisTitleWeight: 400,
            legendLabelSize: 10 * matplotlibPointToCssPixel,
            legendLabelWeight: 400,
            legendTitleSize: 10 * matplotlibPointToCssPixel,
            legendTitleWeight: 400,
            titlePosition: 'panel',
            titleAlign: 'center',
            lineHeight: 1.2,
        },
        spacing: {
            xs: 4 * matplotlibPointToCssPixel,
            sm: 8 * matplotlibPointToCssPixel,
            md: 12 * matplotlibPointToCssPixel,
            lg: 16 * matplotlibPointToCssPixel,
            xl: 24 * matplotlibPointToCssPixel,
            plotPadding: { top: 19, right: 64, bottom: 53, left: 80 },
            minimumTitleBlock: 12 * matplotlibPointToCssPixel + 16 * matplotlibPointToCssPixel,
        },
        axis: {
            lineWidth: 0.8 * matplotlibPointToCssPixel,
            boxVisible: true,
            boxLineWidth: 0.8 * matplotlibPointToCssPixel,
            boxExcludedMarks: ['pie'],
            tickLength: 3.5 * matplotlibPointToCssPixel,
            labelPadding: 3.5 * matplotlibPointToCssPixel,
            gridLineWidth: 0.8 * matplotlibPointToCssPixel,
            lineVisible: true,
            ticksVisible: true,
            gridX: false,
            gridX2: false,
            gridY: false,
            gridY2: false,
            gridOpacity: 1,
            minorGridVisible: false,
            emphasizeZero: false,
            lineCap: 'butt',
            titleGap: 4 * matplotlibPointToCssPixel,
        },
        mark: {
            lineWidth: 1.5 * matplotlibPointToCssPixel,
            pointRadius: 3 * matplotlibPointToCssPixel,
            pointStrokeWidth: 1 * matplotlibPointToCssPixel,
            pointColorMode: 'series',
            barRadius: 0,
            barStroke: 'transparent',
            barStrokeWidth: 0,
            barWidthRatio: 0.8,
            histogramGap: 0,
            boxplotFill: 'transparent',
            boxplotLineWidth: 1 * matplotlibPointToCssPixel,
            boxplotRadius: 0,
            boxplotMedianStroke: '#FF7F0E',
            piePalette: matplotlibPalette,
            pieStroke: 'transparent',
            pieStrokeWidth: 0,
            pieStartAngle: 0,
            pieDirection: 'counterclockwise',
            areaStroke: '#000000',
            areaStrokeVisible: false,
            areaColorMode: 'series',
            opacity: 1,
            lineCap: 'square',
            lineJoin: 'round',
        },
        legend: {
            surfaceOpacity: 0.8,
            borderWidth: 1 * matplotlibPointToCssPixel,
            borderColor: '#CCCCCC',
            cornerRadius: 4,
            swatchRadius: 0,
            swatchSize: 10 * matplotlibPointToCssPixel,
            lineWidth: 1.5 * matplotlibPointToCssPixel,
            pointRadius: 3 * matplotlibPointToCssPixel,
            pointStrokeWidth: 1 * matplotlibPointToCssPixel,
            lineCap: 'square',
            continuousSamples: 256,
        },
        motion: { duration: 0, easing: 'linear' },
    };
    const blueSequential = ['#eff6ff', '#bfdbfe', '#60a5fa', '#2563eb', '#1e3a8a'];
    const viridisSequential = ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725'];
    const warmSequential = ['#fff7ed', '#fed7aa', '#fb923c', '#c2410c', '#7c2d12'];
    const terrainSequential = ['#e0f2fe', '#7dd3fc', '#34d399', '#a3a341', '#7c5c3b'];
    const redBlueDiverging = ['#b91c1c', '#fca5a5', '#f8fafc', '#93c5fd', '#1d4ed8'];
    const darkDiverging = ['#ff5a5f', '#7f1d1d', '#111827', '#14532d', '#00d084'];
    /**
     * Neutral profiles share the portable theme shape without aliasing an existing
     * built-in. The definition contains only visual defaults; it never enables a
     * chart family, renderer, transform, or interaction capability.
     */
    function createNeutralTheme(definition) {
        const axisColor = definition.colors.axis ?? graflumeLight.colors.axis;
        return {
            name: definition.name,
            mode: definition.mode,
            colors: { ...graflumeLight.colors, ...definition.colors },
            typography: { ...graflumeLight.typography, ...definition.typography },
            spacing: { ...graflumeLight.spacing, ...definition.spacing },
            axis: { ...graflumeLight.axis, ...definition.axis },
            mark: { ...graflumeLight.mark, ...definition.mark },
            legend: {
                surfaceOpacity: definition.mode === 'dark' ? 0.94 : 1,
                borderWidth: 1,
                borderColor: axisColor,
                cornerRadius: definition.mark?.barRadius ?? 0,
                swatchRadius: definition.mark?.barRadius ?? 0,
                swatchSize: 12,
                lineWidth: definition.mark?.lineWidth ?? graflumeLight.mark.lineWidth,
                pointRadius: definition.mark?.pointRadius ?? graflumeLight.mark.pointRadius,
                pointStrokeWidth: 1,
                lineCap: definition.axis?.lineCap ?? 'round',
                continuousSamples: 64,
                ...definition.legend,
            },
            motion: { ...graflumeLight.motion, ...definition.motion },
        };
    }
    const neutralThemeDefinitions = [
        {
            name: 'editorial',
            mode: 'light',
            colors: {
                background: '#fbf8f1',
                surface: '#fffdf8',
                panel: '#fffdf8',
                text: '#26231f',
                mutedText: '#756d63',
                axis: '#8f867b',
                grid: '#ded7cb',
                focus: '#1f5a7a',
                palette: ['#1f3b5d', '#9f3a38', '#b07d2c', '#536b4a', '#76527a', '#447c87'],
                sequential: warmSequential,
                diverging: ['#9f3a38', '#df9b8f', '#fffdf8', '#91b2c2', '#1f5a7a'],
            },
            typography: {
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 13,
                titleSize: 23,
                titleWeight: 700,
                subtitleSize: 13,
                titlePosition: 'plot',
                lineHeight: 1.55,
            },
            spacing: { xs: 5, sm: 9, md: 14, lg: 19, xl: 28 },
            axis: {
                lineWidth: 1,
                tickLength: 4,
                labelPadding: 8,
                gridLineWidth: 1,
                gridX: false,
                gridY: true,
                emphasizeZero: true,
            },
            mark: { lineWidth: 2, pointRadius: 4, barRadius: 0, opacity: 0.96 },
            legend: { borderWidth: 0, cornerRadius: 0, swatchRadius: 0 },
            motion: { duration: 180, easing: 'ease-out' },
        },
        {
            name: 'scientific-classic',
            mode: 'light',
            colors: {
                background: '#ffffff',
                surface: '#ffffff',
                panel: '#ffffff',
                text: '#111111',
                mutedText: '#4b5563',
                axis: '#111111',
                grid: '#d1d5db',
                focus: '#005f73',
                palette: ['#005f73', '#bb3e03', '#0a9396', '#9b2226', '#ca6702', '#3a0ca3'],
                sequential: viridisSequential,
                diverging: redBlueDiverging,
            },
            typography: {
                fontFamily: '"STIX Two Text", "Times New Roman", serif',
                fontSize: 12,
                titleSize: 17,
                titleWeight: 600,
                subtitleSize: 12,
                titleAlign: 'center',
                lineHeight: 1.35,
            },
            spacing: { xs: 4, sm: 7, md: 11, lg: 15, xl: 22 },
            axis: {
                lineWidth: 1.2,
                boxVisible: true,
                boxLineWidth: 1.2,
                tickLength: 5,
                labelPadding: 6,
                gridLineWidth: 0.75,
                gridX: false,
                gridY: false,
                emphasizeZero: false,
                lineCap: 'square',
            },
            mark: {
                lineWidth: 1.8,
                pointRadius: 3.5,
                barRadius: 0,
                opacity: 1,
                pointFill: 'transparent',
                pointStrokeWidth: 1.2,
                lineCap: 'square',
                lineJoin: 'miter',
            },
            legend: { cornerRadius: 0, swatchRadius: 0, borderColor: '#111111' },
            motion: { duration: 0, easing: 'linear' },
        },
        {
            name: 'statistical-minimal',
            mode: 'light',
            colors: {
                background: '#ffffff',
                surface: '#ffffff',
                panel: '#ffffff',
                text: '#172033',
                mutedText: '#667085',
                axis: '#98a2b3',
                grid: '#eaecf0',
                focus: '#2563eb',
                palette: ['#2563eb', '#dc2626', '#059669', '#7c3aed', '#d97706', '#0891b2'],
                sequential: blueSequential,
                diverging: redBlueDiverging,
            },
            typography: { fontSize: 12, titleSize: 18, subtitleSize: 12, lineHeight: 1.4 },
            spacing: { xs: 4, sm: 7, md: 11, lg: 15, xl: 21 },
            axis: {
                lineWidth: 1,
                tickLength: 0,
                labelPadding: 8,
                gridLineWidth: 1,
                lineVisible: false,
                ticksVisible: false,
                gridX: false,
                gridY: true,
                emphasizeZero: true,
            },
            mark: { lineWidth: 2.2, pointRadius: 4, barRadius: 1, opacity: 0.94 },
            legend: { borderWidth: 0, cornerRadius: 2, swatchRadius: 1 },
            motion: { duration: 160, easing: 'ease-out' },
        },
        {
            name: 'dashboard-dense',
            mode: 'light',
            colors: {
                background: '#f1f5f9',
                surface: '#ffffff',
                panel: '#ffffff',
                text: '#0f172a',
                mutedText: '#64748b',
                axis: '#94a3b8',
                grid: '#e2e8f0',
                focus: '#2563eb',
                palette: ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
                sequential: blueSequential,
                diverging: ['#dc2626', '#fca5a5', '#ffffff', '#86efac', '#15803d'],
            },
            typography: { fontSize: 11, titleSize: 16, subtitleSize: 11, lineHeight: 1.25 },
            spacing: { xs: 3, sm: 5, md: 8, lg: 11, xl: 16 },
            axis: {
                lineWidth: 1,
                tickLength: 3,
                labelPadding: 5,
                gridLineWidth: 1,
                gridX: true,
                gridY: true,
                emphasizeZero: true,
            },
            mark: { lineWidth: 1.8, pointRadius: 3.5, barRadius: 2, opacity: 1 },
            legend: { cornerRadius: 4, swatchRadius: 2, swatchSize: 10 },
            motion: { duration: 120, easing: 'ease-out' },
        },
        {
            name: 'finance-terminal',
            mode: 'dark',
            colors: {
                background: '#070b0e',
                surface: '#0d1419',
                panel: '#0a1014',
                text: '#e6edf3',
                mutedText: '#8b949e',
                axis: '#3d4d57',
                grid: '#1c2a31',
                focus: '#f2cc60',
                palette: ['#00d084', '#ff5a5f', '#2f81f7', '#f2cc60', '#bc8cff', '#39c5cf'],
                sequential: ['#0d281f', '#075c40', '#00a36c', '#39d98a', '#b7f7d7'],
                diverging: darkDiverging,
            },
            typography: {
                fontFamily: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
                fontSize: 11,
                titleSize: 16,
                titleWeight: 600,
                subtitleSize: 11,
                lineHeight: 1.3,
            },
            spacing: { xs: 3, sm: 6, md: 9, lg: 12, xl: 18 },
            axis: {
                lineWidth: 1,
                tickLength: 4,
                labelPadding: 6,
                gridLineWidth: 1,
                gridX: true,
                gridY: true,
                emphasizeZero: true,
                lineCap: 'square',
            },
            mark: { lineWidth: 1.6, pointRadius: 3, barRadius: 0, opacity: 1, lineCap: 'square' },
            legend: { borderColor: '#3d4d57', cornerRadius: 0, swatchRadius: 0 },
            motion: { duration: 0, easing: 'linear' },
        },
        {
            name: 'observability',
            mode: 'dark',
            colors: {
                background: '#11131a',
                surface: '#191c26',
                panel: '#151822',
                text: '#dce3f0',
                mutedText: '#8f9bb3',
                axis: '#47516a',
                grid: '#293047',
                focus: '#7dcfff',
                palette: ['#7aa2f7', '#9ece6a', '#e0af68', '#f7768e', '#bb9af7', '#7dcfff'],
                sequential: ['#202544', '#344b8e', '#4f7ccf', '#7dcfff', '#c7f0ff'],
                diverging: ['#f7768e', '#9d3c5b', '#191c26', '#527a45', '#9ece6a'],
            },
            typography: { fontSize: 11, titleSize: 17, subtitleSize: 11, lineHeight: 1.35 },
            spacing: { xs: 3, sm: 6, md: 10, lg: 13, xl: 19 },
            axis: {
                lineWidth: 1,
                tickLength: 3,
                labelPadding: 6,
                gridLineWidth: 1,
                lineVisible: false,
                gridX: true,
                gridY: true,
                gridOpacity: 0.8,
                emphasizeZero: true,
            },
            mark: { lineWidth: 2, pointRadius: 3.5, barRadius: 2, opacity: 0.96 },
            legend: { borderColor: '#293047', cornerRadius: 4, swatchRadius: 2 },
            motion: { duration: 140, easing: 'ease-out' },
        },
        {
            name: 'geospatial',
            mode: 'light',
            colors: {
                background: '#eaf6fb',
                surface: '#f8fcfe',
                panel: '#f1f8f4',
                text: '#17324d',
                mutedText: '#5b7183',
                axis: '#7893a6',
                grid: '#d0e5ec',
                focus: '#0077b6',
                palette: ['#0077b6', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#588157'],
                sequential: terrainSequential,
                diverging: ['#9b2226', '#ee9b8f', '#f8fcfe', '#94d2bd', '#005f73'],
            },
            typography: { fontSize: 12, titleSize: 19, subtitleSize: 12, lineHeight: 1.4 },
            spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
            axis: {
                lineWidth: 1,
                tickLength: 3,
                labelPadding: 7,
                gridLineWidth: 0.8,
                gridX: true,
                gridY: true,
                gridOpacity: 0.75,
                emphasizeZero: false,
            },
            mark: { lineWidth: 1.8, pointRadius: 4, barRadius: 2, opacity: 0.92 },
            legend: { borderColor: '#b6d2dc', cornerRadius: 4, swatchRadius: 2 },
            motion: { duration: 220, easing: 'ease-in-out' },
        },
        {
            name: 'spatial-lab',
            mode: 'dark',
            colors: {
                background: '#050816',
                surface: '#0b1026',
                panel: '#080d20',
                text: '#edf4ff',
                mutedText: '#96a6c8',
                axis: '#41527a',
                grid: '#1a2850',
                focus: '#00e5ff',
                palette: ['#00e5ff', '#7c4dff', '#ff4081', '#76ff03', '#ffd740', '#ff6e40'],
                sequential: viridisSequential,
                diverging: ['#ff4081', '#7c4dff', '#101936', '#00b8d4', '#76ff03'],
            },
            typography: {
                fontFamily: '"IBM Plex Sans", Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: 12,
                titleSize: 18,
                subtitleSize: 12,
                lineHeight: 1.35,
            },
            spacing: { xs: 4, sm: 7, md: 11, lg: 15, xl: 22 },
            axis: {
                lineWidth: 1,
                tickLength: 4,
                labelPadding: 7,
                gridLineWidth: 0.8,
                gridX: true,
                gridY: true,
                gridOpacity: 0.8,
                emphasizeZero: false,
            },
            mark: { lineWidth: 1.8, pointRadius: 4, barRadius: 1, opacity: 0.92 },
            legend: { borderColor: '#41527a', cornerRadius: 2, swatchRadius: 1 },
            motion: { duration: 0, easing: 'linear' },
        },
        {
            name: 'presentation',
            mode: 'light',
            colors: {
                background: '#ffffff',
                surface: '#ffffff',
                panel: '#f8fafc',
                text: '#0f172a',
                mutedText: '#475569',
                axis: '#94a3b8',
                grid: '#e2e8f0',
                focus: '#1d4ed8',
                palette: ['#2563eb', '#e11d48', '#059669', '#f59e0b', '#7c3aed', '#0891b2'],
                sequential: blueSequential,
                diverging: redBlueDiverging,
            },
            typography: {
                fontSize: 14,
                titleSize: 26,
                titleWeight: 700,
                subtitleSize: 15,
                axisLabelSize: 13,
                axisTitleSize: 14,
                legendLabelSize: 13,
                legendTitleSize: 14,
                lineHeight: 1.5,
            },
            spacing: { xs: 6, sm: 10, md: 16, lg: 22, xl: 32 },
            axis: {
                lineWidth: 1.2,
                tickLength: 4,
                labelPadding: 10,
                gridLineWidth: 1,
                gridX: false,
                gridY: true,
                emphasizeZero: true,
            },
            mark: { lineWidth: 3, pointRadius: 5.5, barRadius: 6, opacity: 1 },
            legend: { borderWidth: 0, cornerRadius: 6, swatchRadius: 4, swatchSize: 15 },
            motion: { duration: 320, easing: 'ease-in-out' },
        },
        {
            name: 'pictorial',
            mode: 'light',
            colors: {
                background: '#fff9ed',
                surface: '#ffffff',
                panel: '#fffdf7',
                text: '#3b2f2f',
                mutedText: '#7c6860',
                axis: '#b39b8f',
                grid: '#f0dfd2',
                focus: '#e8590c',
                palette: ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#b197fc', '#ffa94d'],
                sequential: warmSequential,
                diverging: ['#f06595', '#ffa8c5', '#fff9ed', '#74c0fc', '#1971c2'],
            },
            typography: {
                fontFamily: '"Trebuchet MS", "Avenir Next", ui-sans-serif, sans-serif',
                fontSize: 13,
                titleSize: 22,
                titleWeight: 700,
                subtitleSize: 13,
                lineHeight: 1.45,
            },
            spacing: { xs: 5, sm: 9, md: 14, lg: 19, xl: 27 },
            axis: {
                lineWidth: 1.2,
                tickLength: 0,
                labelPadding: 9,
                gridLineWidth: 1,
                lineVisible: false,
                ticksVisible: false,
                gridX: false,
                gridY: true,
                emphasizeZero: false,
            },
            mark: { lineWidth: 3, pointRadius: 6, barRadius: 8, opacity: 0.96, lineCap: 'round' },
            legend: { borderColor: '#f0dfd2', cornerRadius: 8, swatchRadius: 6, swatchSize: 15 },
            motion: { duration: 360, easing: 'ease-in-out' },
        },
        {
            name: 'dark-technical',
            mode: 'dark',
            colors: {
                background: '#07111f',
                surface: '#0b1728',
                panel: '#091525',
                text: '#dbeafe',
                mutedText: '#8ba3bf',
                axis: '#35506d',
                grid: '#19324d',
                focus: '#22d3ee',
                palette: ['#22d3ee', '#a78bfa', '#fb7185', '#4ade80', '#facc15', '#60a5fa'],
                sequential: ['#082f49', '#075985', '#0284c7', '#22d3ee', '#cffafe'],
                diverging: ['#fb7185', '#9f1239', '#0b1728', '#0e7490', '#67e8f9'],
            },
            typography: {
                fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                fontSize: 11,
                titleSize: 17,
                titleWeight: 600,
                subtitleSize: 11,
                lineHeight: 1.35,
            },
            spacing: { xs: 3, sm: 6, md: 10, lg: 14, xl: 20 },
            axis: {
                lineWidth: 1,
                tickLength: 4,
                labelPadding: 6,
                gridLineWidth: 1,
                gridX: true,
                gridY: true,
                gridOpacity: 0.9,
                emphasizeZero: true,
                lineCap: 'square',
            },
            mark: { lineWidth: 2, pointRadius: 3.5, barRadius: 0, opacity: 1, lineCap: 'square' },
            legend: { borderColor: '#35506d', cornerRadius: 0, swatchRadius: 0 },
            motion: { duration: 0, easing: 'linear' },
        },
        {
            name: 'high-contrast',
            mode: 'dark',
            colors: {
                background: '#000000',
                surface: '#000000',
                panel: '#000000',
                text: '#ffffff',
                mutedText: '#f5f5f5',
                axis: '#ffffff',
                grid: '#737373',
                focus: '#ffff00',
                palette: ['#ffff00', '#00ffff', '#ff00ff', '#00ff00', '#ff7f00', '#ffffff'],
                sequential: ['#000000', '#003cff', '#00ffff', '#ffff00', '#ffffff'],
                diverging: ['#ff00ff', '#ff7f00', '#000000', '#00ffff', '#ffffff'],
            },
            typography: {
                fontSize: 14,
                fontWeight: 600,
                titleSize: 24,
                titleWeight: 700,
                subtitleSize: 14,
                subtitleWeight: 600,
                axisLabelSize: 13,
                axisLabelWeight: 600,
                axisTitleSize: 14,
                axisTitleWeight: 700,
                legendLabelSize: 13,
                legendLabelWeight: 600,
                legendTitleSize: 14,
                legendTitleWeight: 700,
                lineHeight: 1.5,
            },
            spacing: { xs: 6, sm: 10, md: 15, lg: 20, xl: 28 },
            axis: {
                lineWidth: 2,
                boxVisible: true,
                boxLineWidth: 2,
                tickLength: 7,
                labelPadding: 9,
                gridLineWidth: 1.5,
                gridX: true,
                gridY: true,
                gridOpacity: 1,
                emphasizeZero: true,
                lineCap: 'square',
            },
            mark: {
                lineWidth: 3,
                pointRadius: 6,
                barRadius: 0,
                opacity: 1,
                pointStroke: '#000000',
                pointStrokeWidth: 2,
                lineCap: 'square',
                lineJoin: 'miter',
            },
            legend: {
                surfaceOpacity: 1,
                borderWidth: 2,
                borderColor: '#ffffff',
                cornerRadius: 0,
                swatchRadius: 0,
                swatchSize: 16,
                lineWidth: 3,
                pointRadius: 6,
                pointStrokeWidth: 2,
                lineCap: 'square',
            },
            motion: { duration: 0, easing: 'linear' },
        },
    ];
    const neutralBuiltInThemes = neutralThemeDefinitions.map((definition) => createNeutralTheme(definition));
    const defaultThemeId = graflumeLight.name;
    /** Ordered source of truth for every built-in theme and generated preview. */
    const builtInThemeCatalog = [
        { id: graflumeLight.name, tokens: graflumeLight, snapshot: false },
        { id: graflumeDark.name, tokens: graflumeDark, snapshot: true },
        {
            id: graflumeGgplot.name,
            tokens: graflumeGgplot,
            snapshot: true,
            sourceBaseline: 'ggplot2 4.0.3',
        },
        {
            id: graflumeRBase.name,
            tokens: graflumeRBase,
            snapshot: true,
            sourceBaseline: 'R 4.6.1',
        },
        {
            id: graflumeMatplotlib.name,
            tokens: graflumeMatplotlib,
            snapshot: true,
            sourceBaseline: 'Matplotlib 3.11.1',
        },
        ...neutralBuiltInThemes.map((tokens) => ({ id: tokens.name, tokens, snapshot: true })),
    ];

    class ThemeRegistry {
        #themes = new Map();
        constructor() {
            for (const entry of builtInThemeCatalog)
                this.register(entry.tokens);
        }
        register(theme) {
            if (theme.name.trim() === '') {
                throw new GraflumeError('INVALID_SPEC', 'Theme name must not be empty.', {
                    path: '$.theme.name',
                });
            }
            this.#themes.set(theme.name, theme);
        }
        has(name) {
            return this.#themes.has(name);
        }
        get(name) {
            const theme = this.#themes.get(name);
            if (theme === undefined) {
                throw new GraflumeError('INVALID_SPEC', `Unknown theme "${name}".`, {
                    path: '$.theme',
                    details: { availableThemes: this.names() },
                });
            }
            return theme;
        }
        names() {
            return [...this.#themes.keys()].sort();
        }
        resolve(input) {
            if (typeof input === 'string')
                return this.get(input);
            const baseName = input.extends ?? defaultThemeId;
            const { extends: _extends, ...overrides } = input;
            const merged = deepMerge(this.get(baseName), overrides);
            return {
                ...merged,
                name: merged.name || `custom:${baseName}`,
            };
        }
    }

    const epsilon = 1e-8;
    function clamp(value, minimum, maximum) {
        return Math.min(maximum, Math.max(minimum, value));
    }
    function add3(left, right) {
        return [left[0] + right[0], left[1] + right[1], left[2] + right[2]];
    }
    function subtract3(left, right) {
        return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
    }
    function scale3(value, amount) {
        return [value[0] * amount, value[1] * amount, value[2] * amount];
    }
    function dot3(left, right) {
        return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
    }
    function cross3(left, right) {
        return [
            left[1] * right[2] - left[2] * right[1],
            left[2] * right[0] - left[0] * right[2],
            left[0] * right[1] - left[1] * right[0],
        ];
    }
    function length3(value) {
        return Math.hypot(value[0], value[1], value[2]);
    }
    function normalize3(value, fallback = [0, 1, 0]) {
        const length = length3(value);
        return length <= epsilon ? fallback : scale3(value, 1 / length);
    }
    function multiplyMat4(left, right) {
        const output = new Float32Array(16);
        for (let column = 0; column < 4; column += 1) {
            for (let row = 0; row < 4; row += 1) {
                let value = 0;
                for (let inner = 0; inner < 4; inner += 1) {
                    value += left[inner * 4 + row] * right[column * 4 + inner];
                }
                output[column * 4 + row] = value;
            }
        }
        return output;
    }
    function perspectiveMat4(fovDegrees, aspect, near, far) {
        const f = 1 / Math.tan((fovDegrees * Math.PI) / 360);
        const range = 1 / (near - far);
        return new Float32Array([
            f / Math.max(epsilon, aspect),
            0,
            0,
            0,
            0,
            f,
            0,
            0,
            0,
            0,
            (far + near) * range,
            -1,
            0,
            0,
            2 * far * near * range,
            0,
        ]);
    }
    function orthographicMat4(extent, aspect, near, far) {
        const horizontal = extent * Math.max(1, aspect);
        const vertical = extent * Math.max(1, 1 / Math.max(epsilon, aspect));
        const left = -horizontal;
        const right = horizontal;
        const bottom = -vertical;
        const top = vertical;
        return new Float32Array([
            2 / (right - left),
            0,
            0,
            0,
            0,
            2 / (top - bottom),
            0,
            0,
            0,
            0,
            -2 / (far - near),
            0,
            -(right + left) / (right - left),
            -(top + bottom) / (top - bottom),
            -(far + near) / (far - near),
            1,
        ]);
    }
    function lookAtMat4(eye, target, up) {
        const forward = normalize3(subtract3(eye, target), [0, 0, 1]);
        const right = normalize3(cross3(up, forward), [1, 0, 0]);
        const cameraUp = cross3(forward, right);
        return new Float32Array([
            right[0],
            cameraUp[0],
            forward[0],
            0,
            right[1],
            cameraUp[1],
            forward[1],
            0,
            right[2],
            cameraUp[2],
            forward[2],
            0,
            -dot3(right, eye),
            -dot3(cameraUp, eye),
            -dot3(forward, eye),
            1,
        ]);
    }
    function cameraEye(camera) {
        const cosPitch = Math.cos(camera.pitch);
        return add3(camera.target, [
            camera.distance * cosPitch * Math.sin(camera.yaw),
            camera.distance * Math.sin(camera.pitch),
            camera.distance * cosPitch * Math.cos(camera.yaw),
        ]);
    }
    function cameraBasis(camera) {
        const eye = cameraEye(camera);
        const forward = normalize3(subtract3(camera.target, eye), [0, 0, -1]);
        const right = normalize3(cross3(forward, [0, 1, 0]), [1, 0, 0]);
        return { right, up: normalize3(cross3(right, forward), [0, 1, 0]), forward };
    }
    function viewProjectionMat4(camera, width, height) {
        const aspect = Math.max(epsilon, width / Math.max(1, height));
        const view = lookAtMat4(cameraEye(camera), camera.target, [0, 1, 0]);
        const projection = camera.projection === 'orthographic'
            ? orthographicMat4(camera.distance * 0.55, aspect, camera.near, camera.far)
            : perspectiveMat4(camera.fov, aspect, camera.near, camera.far);
        return multiplyMat4(projection, view);
    }
    function projectPoint(matrix, point, width, height) {
        const x = point[0];
        const y = point[1];
        const z = point[2];
        const clipX = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
        const clipY = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
        const clipZ = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
        const clipW = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
        if (clipW <= epsilon)
            return { x: 0, y: 0, depth: 1, visible: false };
        const ndcX = clipX / clipW;
        const ndcY = clipY / clipW;
        const ndcZ = clipZ / clipW;
        return {
            x: ((ndcX + 1) / 2) * width,
            y: ((1 - ndcY) / 2) * height,
            depth: (ndcZ + 1) / 2,
            visible: ndcX >= -1.08 && ndcX <= 1.08 && ndcY >= -1.08 && ndcY <= 1.08 && ndcZ >= -1 && ndcZ <= 1,
        };
    }
    function boundsFromPositions(positionArrays) {
        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let minZ = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;
        let maxZ = Number.NEGATIVE_INFINITY;
        for (const positions of positionArrays) {
            for (let index = 0; index + 2 < positions.length; index += 3) {
                const x = positions[index];
                const y = positions[index + 1];
                const z = positions[index + 2];
                if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z))
                    continue;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                minZ = Math.min(minZ, z);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
                maxZ = Math.max(maxZ, z);
            }
        }
        if (!Number.isFinite(minX)) {
            return { min: [-1, -1, -1], max: [1, 1, 1], center: [0, 0, 0], radius: 1 };
        }
        const min = [minX, minY, minZ];
        const max = [maxX, maxY, maxZ];
        const center = [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];
        const radius = Math.max(epsilon, length3(subtract3(max, min)) / 2);
        return { min, max, center, radius };
    }
    function normalizedCamera(projection, target, radius, input = {}) {
        const distance = Math.max(0.001, input.distance ?? Math.max(2.5, radius * 3.2));
        const near = Math.max(0.0001, input.near ?? Math.max(0.001, distance / 1000));
        const far = Math.max(near + 1, input.far ?? distance + radius * 12 + 100);
        return {
            projection: input.projection ?? projection,
            target: input.target ?? target,
            yaw: input.yaw ?? Math.PI / 4,
            pitch: clamp(input.pitch ?? Math.PI / 6, -Math.PI * 0.49, Math.PI * 0.49),
            distance,
            fov: clamp(input.fov ?? 45, 10, 120),
            near,
            far,
        };
    }

    const BYTES_PER_DERIVED_VERTEX = 44;
    const BYTES_PER_DERIVED_INDEX = 4;
    const ESTIMATED_BYTES_PER_PICK_TARGET = 192;
    const GLOBE_BASE_VERTICES = 120_000;
    const GLOBE_BASE_INDICES = 13_000;
    const GLOBE_BASE_PICK_TARGETS = 200;
    const spatialOutputLimits = Object.freeze({
        vertices: 2_000_000,
        indices: 6_000_000,
        pickTargets: 500_000,
        estimatedBytes: 256 * 1024 * 1024,
    });
    function inferredSurfaceMode(layer) {
        return layer.mark.mode ?? ('positions' in layer.data ? 'mesh' : 'surface');
    }
    function inferredVectorMode(layer) {
        return layer.mark.mode ?? ('paths' in layer.data ? 'streamtube' : 'cone');
    }
    function boundedSegments(value, fallback) {
        return Math.max(5, Math.min(48, Math.trunc(value ?? fallback)));
    }
    function estimateLayer(layer) {
        if (layer.mark.type === 'surface') {
            const surfaceLayer = layer;
            const contourSegments = surfaceLayer.mark.contours?.maxSegments ?? 100_000;
            const contourMultiplier = surfaceLayer.mark.contours === undefined ? 0 : 1;
            if (inferredSurfaceMode(surfaceLayer) === 'mesh') {
                const data = surfaceLayer.data;
                const triangles = data.triangles.length;
                const flat = surfaceLayer.mark.normalMode === 'flat' && surfaceLayer.mark.wireframe !== true;
                const baseVertices = flat ? triangles * 3 : data.positions.length;
                const baseIndices = surfaceLayer.mark.wireframe ? triangles * 6 : flat ? 0 : triangles * 3;
                const overlay = surfaceLayer.mark.wireOverlay ? data.positions.length : 0;
                const overlayIndices = surfaceLayer.mark.wireOverlay ? triangles * 6 : 0;
                return {
                    vertices: baseVertices + overlay + contourSegments * 2 * contourMultiplier,
                    indices: baseIndices + overlayIndices,
                    pickTargets: data.positions.length + contourSegments * contourMultiplier,
                };
            }
            const data = surfaceLayer.data;
            const vertices = data.rows * data.columns;
            const cells = (data.rows - 1) * (data.columns - 1);
            const flat = surfaceLayer.mark.normalMode === 'flat' && surfaceLayer.mark.wireframe !== true;
            const baseVertices = flat ? cells * 6 : vertices;
            const indices = surfaceLayer.mark.wireframe
                ? cells * 4 + (data.rows - 1) * 2 + (data.columns - 1) * 2
                : flat
                    ? 0
                    : cells * 6;
            const overlayIndices = surfaceLayer.mark.wireOverlay
                ? cells * 4 + (data.rows - 1) * 2 + (data.columns - 1) * 2
                : 0;
            return {
                vertices: baseVertices +
                    (surfaceLayer.mark.wireOverlay ? vertices : 0) +
                    contourSegments * 2 * contourMultiplier,
                indices: indices + overlayIndices,
                pickTargets: vertices + contourSegments * contourMultiplier,
            };
        }
        if (layer.mark.type === 'volume') {
            const volumeLayer = layer;
            const [x, y, z] = volumeLayer.data.dimensions;
            if ((volumeLayer.mark.mode ?? 'volume') === 'isosurface') {
                const cells = (x - 1) * (y - 1) * (z - 1);
                const triangles = cells * 12;
                return { vertices: triangles * 3, indices: 0, pickTargets: triangles };
            }
            const render = volumeLayer.mark.render;
            const slices = volumeLayer.mark.slices ?? [];
            if (render !== undefined || slices.length > 0) {
                const defaultResolution = (axis) => axis === 'x'
                    ? [Math.min(256, z), Math.min(256, y)]
                    : axis === 'y'
                        ? [Math.min(256, x), Math.min(256, z)]
                        : [Math.min(256, x), Math.min(256, y)];
                const plane = (resolution) => ({
                    vertices: resolution[0] * resolution[1],
                    indices: Math.max(0, resolution[0] - 1) * Math.max(0, resolution[1] - 1) * 6,
                    pickTargets: resolution[0] * resolution[1],
                });
                const total = { vertices: 0, indices: 0, pickTargets: 0 };
                const add = (counts) => {
                    total.vertices += counts.vertices;
                    total.indices += counts.indices;
                    total.pickTargets += counts.pickTargets;
                };
                if (render !== undefined) {
                    const resolution = render.resolution ?? defaultResolution(render.axis ?? 'z');
                    add(plane(resolution));
                    const caps = render.caps ?? 'none';
                    if (caps === 'front' || caps === 'back')
                        add(plane(resolution));
                    else if (caps === 'both') {
                        add(plane(resolution));
                        add(plane(resolution));
                    }
                }
                for (const slice of slices) {
                    const resolution = slice.resolution ??
                        (slice.type === 'orthogonal'
                            ? defaultResolution(slice.axis)
                            : [Math.min(128, Math.max(x, z)), Math.min(128, y)]);
                    add(plane(resolution));
                }
                return total;
            }
            const maximumSamples = Math.max(1, Math.trunc(volumeLayer.mark.maxSamples ?? 80_000));
            const vertices = Math.min(x * y * z, maximumSamples);
            return { vertices, indices: 0, pickTargets: vertices };
        }
        if (layer.mark.type === 'vector') {
            const vectorLayer = layer;
            if ('dimensions' in vectorLayer.data) {
                const data = vectorLayer.data;
                const seedCount = (data.seeds?.length ?? 0) +
                    (data.seedGrid === undefined
                        ? data.seeds === undefined || data.seeds.length === 0
                            ? 8
                            : 0
                        : data.seedGrid.dimensions[0] *
                            data.seedGrid.dimensions[1] *
                            data.seedGrid.dimensions[2]);
                const maxSteps = Math.trunc(vectorLayer.mark.integration?.maxSteps ?? 512);
                const directions = vectorLayer.mark.integration?.direction === 'both' ||
                    vectorLayer.mark.integration?.direction === undefined
                    ? 2
                    : 1;
                const points = seedCount * (maxSteps * directions + 1);
                const segments = boundedSegments(vectorLayer.mark.segments, 10);
                return {
                    vertices: points * segments,
                    indices: Math.max(0, points - seedCount) * segments * 6,
                    pickTargets: points,
                };
            }
            if (inferredVectorMode(vectorLayer) === 'streamtube') {
                const data = vectorLayer.data;
                const segments = boundedSegments(vectorLayer.mark.segments, 10);
                const points = data.paths.reduce((total, path) => total + path.length, 0);
                const links = data.paths.reduce((total, path) => total + Math.max(0, path.length - 1), 0);
                return {
                    vertices: points * segments,
                    indices: links * segments * 6,
                    pickTargets: points,
                };
            }
            const count = 'origins' in vectorLayer.data ? vectorLayer.data.origins.length : 0;
            const segments = boundedSegments(vectorLayer.mark.segments, 12);
            return {
                vertices: count * (segments + 2),
                indices: count * segments * 6,
                pickTargets: count,
            };
        }
        if (layer.mark.type === 'scatter') {
            const vertices = layer.data.positions.length;
            return { vertices, indices: 0, pickTargets: vertices };
        }
        const globeLayer = layer;
        const points = globeLayer.data?.points?.length ?? 0;
        const routes = globeLayer.data?.routes?.length ?? 0;
        const routeSegments = Math.max(8, Math.min(128, Math.trunc(globeLayer.mark.routeSegments ?? 32)));
        return {
            vertices: GLOBE_BASE_VERTICES + points + routes * routeSegments * 2,
            indices: GLOBE_BASE_INDICES,
            pickTargets: GLOBE_BASE_PICK_TARGETS + points + routes,
        };
    }
    function withEstimatedBytes(counts) {
        return {
            ...counts,
            estimatedBytes: counts.vertices * BYTES_PER_DERIVED_VERTEX +
                counts.indices * BYTES_PER_DERIVED_INDEX +
                counts.pickTargets * ESTIMATED_BYTES_PER_PICK_TARGET,
        };
    }
    function estimateSpatialOutput(spec) {
        const counts = { vertices: 0, indices: 0, pickTargets: 0 };
        for (const layer of spec.layers) {
            const layerCounts = estimateLayer(layer);
            counts.vertices += layerCounts.vertices;
            counts.indices += layerCounts.indices;
            counts.pickTargets += layerCounts.pickTargets;
        }
        return withEstimatedBytes(counts);
    }
    function measureCompiledSpatialOutput(geometries) {
        const counts = { vertices: 0, indices: 0, pickTargets: 0 };
        let typedArrayBytes = 0;
        for (const geometry of geometries) {
            counts.vertices += geometry.positions.length / 3;
            counts.indices += geometry.indices?.length ?? 0;
            counts.pickTargets += geometry.picks.length;
            typedArrayBytes +=
                geometry.positions.byteLength +
                    geometry.normals.byteLength +
                    geometry.colors.byteLength +
                    geometry.sizes.byteLength +
                    (geometry.indices?.byteLength ?? 0);
        }
        return {
            ...counts,
            estimatedBytes: typedArrayBytes + counts.pickTargets * ESTIMATED_BYTES_PER_PICK_TARGET,
        };
    }
    function spatialOutputBudgetViolations(estimate) {
        return Object.keys(spatialOutputLimits)
            .filter((resource) => estimate[resource] > spatialOutputLimits[resource])
            .map((resource) => ({
            resource,
            actual: estimate[resource],
            maximum: spatialOutputLimits[resource],
        }));
    }
    function assertCompiledSpatialOutputBudget(geometries) {
        const violation = spatialOutputBudgetViolations(measureCompiledSpatialOutput(geometries))[0];
        if (violation === undefined)
            return;
        throw new RangeError(`Compiled spatial output ${violation.resource} (${violation.actual}) exceeds the safe limit (${violation.maximum}).`);
    }

    function positionAt(positions, index) {
        const offset = index * 3;
        return [positions[offset], positions[offset + 1], positions[offset + 2]];
    }
    function smoothNormals(positions, indices) {
        const normals = new Float32Array(positions.length);
        for (let offset = 0; offset + 2 < indices.length; offset += 3) {
            const a = indices[offset];
            const b = indices[offset + 1];
            const c = indices[offset + 2];
            const normal = normalize3(cross3(subtract3(positionAt(positions, b), positionAt(positions, a)), subtract3(positionAt(positions, c), positionAt(positions, a))), [0, 1, 0]);
            for (const vertex of [a, b, c]) {
                normals[vertex * 3] = normals[vertex * 3] + normal[0];
                normals[vertex * 3 + 1] = normals[vertex * 3 + 1] + normal[1];
                normals[vertex * 3 + 2] = normals[vertex * 3 + 2] + normal[2];
            }
        }
        for (let index = 0; index < normals.length; index += 3) {
            normals.set(normalize3([normals[index], normals[index + 1], normals[index + 2]]), index);
        }
        return normals;
    }
    /**
     * Deterministic CPU reference for GPU surface normal input. Flat mode emits a
     * triangle soup so every face owns its exact normal; smooth mode keeps shared
     * topology and averages adjacent unit-face normals.
     */
    function computeSurfaceNormalGeometry(positions, indices, mode = 'smooth') {
        if (positions.length % 3 !== 0 || indices.length % 3 !== 0)
            throw new RangeError('Surface positions and triangle indices must contain complete tuples.');
        const vertexCount = positions.length / 3;
        for (const index of indices)
            if (index >= vertexCount)
                throw new RangeError('Surface triangle index is outside positions.');
        if (mode === 'smooth') {
            return {
                positions,
                normals: smoothNormals(positions, indices),
                indices,
                sourceVertexIndices: Uint32Array.from({ length: vertexCount }, (_, index) => index),
            };
        }
        const expandedPositions = new Float32Array(indices.length * 3);
        const normals = new Float32Array(indices.length * 3);
        const sourceVertexIndices = new Uint32Array(indices.length);
        for (let offset = 0; offset + 2 < indices.length; offset += 3) {
            const a = indices[offset];
            const b = indices[offset + 1];
            const c = indices[offset + 2];
            const pa = positionAt(positions, a);
            const pb = positionAt(positions, b);
            const pc = positionAt(positions, c);
            const normal = normalize3(cross3(subtract3(pb, pa), subtract3(pc, pa)), [0, 1, 0]);
            for (const [local, source] of [a, b, c].entries()) {
                expandedPositions.set(positionAt(positions, source), (offset + local) * 3);
                normals.set(normal, (offset + local) * 3);
                sourceVertexIndices[offset + local] = source;
            }
        }
        return { positions: expandedPositions, normals, sourceVertexIndices };
    }
    function contourIntersection(first, second, firstValue, secondValue, level) {
        const firstSide = firstValue - level;
        const secondSide = secondValue - level;
        if ((firstSide < 0 && secondSide < 0) || (firstSide > 0 && secondSide > 0))
            return null;
        if (firstSide === 0 && secondSide === 0)
            return null;
        const denominator = secondValue - firstValue;
        const amount = Math.abs(denominator) <= 1e-12 ? 0.5 : (level - firstValue) / denominator;
        return [
            first[0] + (second[0] - first[0]) * amount,
            first[1] + (second[1] - first[1]) * amount,
            first[2] + (second[2] - first[2]) * amount,
        ];
    }
    function samePoint$1(left, right) {
        return length3(subtract3(left, right)) <= 1e-9;
    }
    function farthestPair(points) {
        if (points.length < 2)
            return null;
        let pair = [points[0], points[1]];
        let distance = length3(subtract3(pair[0], pair[1]));
        for (let left = 0; left < points.length; left += 1) {
            for (let right = left + 1; right < points.length; right += 1) {
                const candidate = length3(subtract3(points[left], points[right]));
                if (candidate > distance) {
                    distance = candidate;
                    pair = [points[left], points[right]];
                }
            }
        }
        return distance <= 1e-12 ? null : pair;
    }
    /** Extracts bounded isoline segments from any indexed triangle surface. */
    function extractSurfaceContourSegments(positions, indices, values, options) {
        const vertexCount = positions.length / 3;
        if (values.length !== vertexCount)
            throw new RangeError('Surface contour values must match the source vertex count.');
        const maximum = Math.max(0, Math.trunc(options.maxSegments));
        const output = [];
        outer: for (const level of options.levels) {
            for (let offset = 0; offset + 2 < indices.length; offset += 3) {
                if (output.length >= maximum)
                    break outer;
                const vertices = [indices[offset], indices[offset + 1], indices[offset + 2]];
                const points = [];
                for (const [first, second] of [
                    [0, 1],
                    [1, 2],
                    [2, 0],
                ]) {
                    const firstIndex = vertices[first];
                    const secondIndex = vertices[second];
                    const point = contourIntersection(positionAt(positions, firstIndex), positionAt(positions, secondIndex), values[firstIndex], values[secondIndex], level);
                    if (point !== null && !points.some((candidate) => samePoint$1(candidate, point)))
                        points.push(point);
                }
                const pair = farthestPair(points);
                if (pair === null)
                    continue;
                output.push({
                    level,
                    from: pair[0],
                    to: pair[1],
                    triangleIndex: offset / 3,
                });
            }
        }
        return output;
    }

    function dimensions(data) {
        return [
            Math.trunc(data.dimensions[0]),
            Math.trunc(data.dimensions[1]),
            Math.trunc(data.dimensions[2]),
        ];
    }
    function origin(data) {
        return data.origin ?? [0, 0, 0];
    }
    function spacing(data) {
        return data.spacing ?? [1, 1, 1];
    }
    function indexOf(x, y, z, size) {
        return z * size[0] * size[1] + y * size[0] + x;
    }
    function gridCoordinate(data, point) {
        const start = origin(data);
        const step = spacing(data);
        return [
            (point[0] - start[0]) / step[0],
            (point[1] - start[1]) / step[1],
            (point[2] - start[2]) / step[2],
        ];
    }
    function volumeWorldPosition(data, coordinate) {
        const start = origin(data);
        const step = spacing(data);
        return [
            start[0] + coordinate[0] * step[0],
            start[1] + coordinate[1] * step[1],
            start[2] + coordinate[2] * step[2],
        ];
    }
    function volumeValueExtent(values) {
        let minimum = Number.POSITIVE_INFINITY;
        let maximum = Number.NEGATIVE_INFINITY;
        for (const value of values) {
            minimum = Math.min(minimum, value);
            maximum = Math.max(maximum, value);
        }
        return Number.isFinite(minimum) ? [minimum, maximum] : [0, 0];
    }
    /** Samples a scalar volume in world coordinates with a deterministic CPU path. */
    function sampleVolumeValue(data, point, interpolation = 'linear') {
        const size = dimensions(data);
        const coordinate = gridCoordinate(data, point);
        if (coordinate[0] < 0 ||
            coordinate[1] < 0 ||
            coordinate[2] < 0 ||
            coordinate[0] > size[0] - 1 ||
            coordinate[1] > size[1] - 1 ||
            coordinate[2] > size[2] - 1)
            return null;
        if (interpolation === 'nearest') {
            return data.values[indexOf(Math.round(coordinate[0]), Math.round(coordinate[1]), Math.round(coordinate[2]), size)];
        }
        const lowX = Math.floor(coordinate[0]);
        const lowY = Math.floor(coordinate[1]);
        const lowZ = Math.floor(coordinate[2]);
        const highX = Math.min(size[0] - 1, lowX + 1);
        const highY = Math.min(size[1] - 1, lowY + 1);
        const highZ = Math.min(size[2] - 1, lowZ + 1);
        const tx = coordinate[0] - lowX;
        const ty = coordinate[1] - lowY;
        const tz = coordinate[2] - lowZ;
        const at = (x, y, z) => data.values[indexOf(x, y, z, size)];
        const x00 = at(lowX, lowY, lowZ) * (1 - tx) + at(highX, lowY, lowZ) * tx;
        const x10 = at(lowX, highY, lowZ) * (1 - tx) + at(highX, highY, lowZ) * tx;
        const x01 = at(lowX, lowY, highZ) * (1 - tx) + at(highX, lowY, highZ) * tx;
        const x11 = at(lowX, highY, highZ) * (1 - tx) + at(highX, highY, highZ) * tx;
        const y0 = x00 * (1 - ty) + x10 * ty;
        const y1 = x01 * (1 - ty) + x11 * ty;
        return y0 * (1 - tz) + y1 * tz;
    }
    function normalizeVolumeValue(value, minimum, maximum, windowLevel) {
        if (windowLevel !== undefined) {
            const low = windowLevel.level - windowLevel.window / 2;
            return clamp((value - low) / windowLevel.window, 0, 1);
        }
        return maximum === minimum ? 0.5 : clamp((value - minimum) / (maximum - minimum), 0, 1);
    }
    function mixColor(left, right, amount) {
        return [
            left[0] + (right[0] - left[0]) * amount,
            left[1] + (right[1] - left[1]) * amount,
            left[2] + (right[2] - left[2]) * amount,
            left[3] + (right[3] - left[3]) * amount,
        ];
    }
    function evaluateVolumeTransfer(stops, normalizedValue, interpolation = 'linear') {
        if (stops.length === 0)
            return [normalizedValue, normalizedValue, normalizedValue, normalizedValue];
        const amount = clamp(normalizedValue, 0, 1);
        const first = stops[0];
        if (amount <= first.offset)
            return first.color;
        for (let index = 1; index < stops.length; index += 1) {
            const right = stops[index];
            const left = stops[index - 1];
            if (amount > right.offset)
                continue;
            if (interpolation === 'step')
                return amount === right.offset ? right.color : left.color;
            if (right.offset === left.offset)
                return left.color;
            return mixColor(left.color, right.color, (amount - left.offset) / (right.offset - left.offset));
        }
        return stops[stops.length - 1].color;
    }
    function rayOpticalSampling(data, axis, sampleCount) {
        const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
        const size = dimensions(data);
        const step = spacing(data).map(Math.abs);
        const reference = Math.min(...step.filter((value) => value > 1e-12));
        const rayLength = (size[axisIndex] - 1) * step[axisIndex];
        return {
            interval: rayLength / Math.max(1, sampleCount - 1),
            reference: Number.isFinite(reference) ? reference : 1,
        };
    }
    function opacityForDistance(opacity, distance, reference) {
        const bounded = clamp(opacity, 0, 1);
        if (bounded === 0 || distance <= 0)
            return 0;
        if (bounded === 1)
            return 1;
        return -Math.expm1(Math.log1p(-bounded) * (distance / reference));
    }
    function axisCoordinate(axis, u, v, depth) {
        if (axis === 'x')
            return [depth, v, u];
        if (axis === 'y')
            return [u, depth, v];
        return [u, v, depth];
    }
    function rayWorldPosition(data, axis, u, v, depth) {
        const size = dimensions(data);
        return volumeWorldPosition(data, axisCoordinate(axis, u * (axis === 'x' ? size[2] - 1 : size[0] - 1), v * (axis === 'y' ? size[2] - 1 : size[1] - 1), depth * (axis === 'x' ? size[0] - 1 : axis === 'y' ? size[1] - 1 : size[2] - 1)));
    }
    function aggregateRay(context, options, u, v) {
        const count = Math.max(2, Math.trunc(options.samples));
        const opticalSampling = rayOpticalSampling(context.data, options.axis, count);
        const samples = [];
        for (let index = 0; index < count; index += 1) {
            const depth = index / (count - 1);
            const point = rayWorldPosition(context.data, options.axis, u, v, depth);
            const raw = sampleVolumeValue(context.data, point, options.interpolation);
            if (raw === null)
                continue;
            const normalized = normalizeVolumeValue(raw, context.minimum, context.maximum, context.windowLevel);
            samples.push({
                raw,
                normalized,
                color: evaluateVolumeTransfer(context.transfer, normalized, context.transferInterpolation),
                depth,
                opticalDistance: opticalSampling.interval * (index === 0 || index === count - 1 ? 0.5 : 1),
                opticalDepth: index === 0
                    ? 1 / (4 * (count - 1))
                    : index === count - 1
                        ? 1 - 1 / (4 * (count - 1))
                        : depth,
            });
        }
        if (samples.length === 0)
            return {
                position: rayWorldPosition(context.data, options.axis, u, v, 0.5),
                rawValue: 0,
                normalizedValue: 0,
                color: [0, 0, 0, 0],
                sampleCount: 0,
                depth: 0.5,
            };
        if (options.method === 'raycast') {
            let red = 0;
            let green = 0;
            let blue = 0;
            let alpha = 0;
            let weightedDepth = 0;
            let weightedRaw = 0;
            let weightTotal = 0;
            for (const sample of samples) {
                const correctedOpacity = opacityForDistance(sample.color[3], sample.opticalDistance, opticalSampling.reference);
                const weight = (1 - alpha) * correctedOpacity;
                red += sample.color[0] * weight;
                green += sample.color[1] * weight;
                blue += sample.color[2] * weight;
                alpha += weight;
                weightedDepth += sample.opticalDepth * weight;
                weightedRaw += sample.raw * weight;
                weightTotal += weight;
            }
            const depth = weightTotal > 0 ? weightedDepth / weightTotal : 0.5;
            const rawValue = weightTotal > 0 ? weightedRaw / weightTotal : samples[0].raw;
            return {
                position: rayWorldPosition(context.data, options.axis, u, v, depth),
                rawValue,
                normalizedValue: normalizeVolumeValue(rawValue, context.minimum, context.maximum, context.windowLevel),
                color: alpha <= 1e-12 ? [0, 0, 0, 0] : [red / alpha, green / alpha, blue / alpha, alpha],
                sampleCount: samples.length,
                depth,
            };
        }
        let selected = samples[0];
        if (options.method === 'mip') {
            for (const sample of samples)
                if (sample.raw > selected.raw)
                    selected = sample;
        }
        else if (options.method === 'minip') {
            for (const sample of samples)
                if (sample.raw < selected.raw)
                    selected = sample;
        }
        else {
            const rawValue = samples.reduce((total, sample) => total + sample.raw, 0) / samples.length;
            const normalizedValue = normalizeVolumeValue(rawValue, context.minimum, context.maximum, context.windowLevel);
            return {
                position: rayWorldPosition(context.data, options.axis, u, v, 0.5),
                rawValue,
                normalizedValue,
                color: evaluateVolumeTransfer(context.transfer, normalizedValue, context.transferInterpolation),
                sampleCount: samples.length,
                depth: 0.5,
            };
        }
        return {
            position: rayWorldPosition(context.data, options.axis, u, v, selected.depth),
            rawValue: selected.raw,
            normalizedValue: selected.normalized,
            color: selected.color,
            sampleCount: samples.length,
            depth: selected.depth,
        };
    }
    /** CPU reference used to compile a bounded projection mesh rendered by WebGL. */
    function projectVolumeRays(context, options) {
        const [columns, rows] = options.resolution;
        const output = [];
        for (let row = 0; row < rows; row += 1) {
            const v = rows === 1 ? 0.5 : row / (rows - 1);
            for (let column = 0; column < columns; column += 1) {
                const u = columns === 1 ? 0.5 : column / (columns - 1);
                output.push({ row, column, ...aggregateRay(context, options, u, v) });
            }
        }
        return output;
    }
    function orthogonalPlane(data, slice, u, v) {
        return rayWorldPosition(data, slice.axis, u, v, clamp(slice.position, 0, 1));
    }
    function volumeSize(data) {
        const size = dimensions(data);
        const step = spacing(data);
        return [(size[0] - 1) * step[0], (size[1] - 1) * step[1], (size[2] - 1) * step[2]];
    }
    function obliquePlane(data, slice, u, v) {
        const normal = normalize3(slice.normal, [0, 0, 1]);
        const requestedUp = normalize3(slice.up ?? [0, 1, 0], [0, 1, 0]);
        let right = cross3(requestedUp, normal);
        if (length3(right) <= 1e-8) {
            const reference = [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
            ].reduce((leastParallel, candidate) => Math.abs(candidate[0] * normal[0] + candidate[1] * normal[1] + candidate[2] * normal[2]) <
                Math.abs(leastParallel[0] * normal[0] + leastParallel[1] * normal[1] + leastParallel[2] * normal[2])
                ? candidate
                : leastParallel);
            right = cross3(reference, normal);
        }
        right = normalize3(right, [1, 0, 0]);
        const up = normalize3(cross3(normal, right), [0, 1, 0]);
        const extent = volumeSize(data);
        const fallbackSize = Math.max(extent[0], extent[1], extent[2]);
        const width = slice.size?.[0] ?? fallbackSize;
        const height = slice.size?.[1] ?? fallbackSize;
        return add3(slice.origin, add3(scale3(right, (u - 0.5) * width), scale3(up, (v - 0.5) * height)));
    }
    function sampleVolumeSlice(context, slice, options) {
        const [columns, rows] = options.resolution;
        const output = [];
        for (let row = 0; row < rows; row += 1) {
            const v = rows === 1 ? 0.5 : row / (rows - 1);
            for (let column = 0; column < columns; column += 1) {
                const u = columns === 1 ? 0.5 : column / (columns - 1);
                const position = slice.type === 'orthogonal'
                    ? orthogonalPlane(context.data, slice, u, v)
                    : obliquePlane(context.data, slice, u, v);
                const rawValue = sampleVolumeValue(context.data, position, options.interpolation);
                const normalizedValue = rawValue === null
                    ? null
                    : normalizeVolumeValue(rawValue, context.minimum, context.maximum, context.windowLevel);
                const baseColor = normalizedValue === null
                    ? [0, 0, 0, 0]
                    : evaluateVolumeTransfer(context.transfer, normalizedValue, context.transferInterpolation);
                output.push({
                    row,
                    column,
                    position,
                    rawValue,
                    normalizedValue,
                    color: [baseColor[0], baseColor[1], baseColor[2], baseColor[3] * options.opacity],
                });
            }
        }
        return output;
    }
    function volumeWorldBounds(data) {
        const start = origin(data);
        return [start, add3(start, volumeSize(data))];
    }

    function fieldDimensions(data) {
        return [
            Math.trunc(data.dimensions[0]),
            Math.trunc(data.dimensions[1]),
            Math.trunc(data.dimensions[2]),
        ];
    }
    function fieldOrigin(data) {
        return data.origin ?? [0, 0, 0];
    }
    function fieldSpacing(data) {
        return data.spacing ?? [1, 1, 1];
    }
    function fieldIndex(x, y, z, size) {
        return z * size[0] * size[1] + y * size[0] + x;
    }
    function vectorFieldWorldBounds(data) {
        const size = fieldDimensions(data);
        const start = fieldOrigin(data);
        const step = fieldSpacing(data);
        return [
            start,
            [
                start[0] + (size[0] - 1) * step[0],
                start[1] + (size[1] - 1) * step[1],
                start[2] + (size[2] - 1) * step[2],
            ],
        ];
    }
    function insideField(data, point) {
        const [minimum, maximum] = vectorFieldWorldBounds(data);
        return (point[0] >= minimum[0] &&
            point[0] <= maximum[0] &&
            point[1] >= minimum[1] &&
            point[1] <= maximum[1] &&
            point[2] >= minimum[2] &&
            point[2] <= maximum[2]);
    }
    /** Trilinear CPU sampler shared by deterministic integration and tests. */
    function sampleVectorField(data, point) {
        if (!insideField(data, point))
            return null;
        const size = fieldDimensions(data);
        const start = fieldOrigin(data);
        const step = fieldSpacing(data);
        const coordinate = [
            (point[0] - start[0]) / step[0],
            (point[1] - start[1]) / step[1],
            (point[2] - start[2]) / step[2],
        ];
        const low = coordinate.map(Math.floor);
        const high = [
            Math.min(size[0] - 1, low[0] + 1),
            Math.min(size[1] - 1, low[1] + 1),
            Math.min(size[2] - 1, low[2] + 1),
        ];
        const amount = [
            coordinate[0] - low[0],
            coordinate[1] - low[1],
            coordinate[2] - low[2],
        ];
        const at = (x, y, z) => data.vectors[fieldIndex(x, y, z, size)];
        const interpolate = (left, right, value) => [
            left[0] + (right[0] - left[0]) * value,
            left[1] + (right[1] - left[1]) * value,
            left[2] + (right[2] - left[2]) * value,
        ];
        const z0y0 = interpolate(at(low[0], low[1], low[2]), at(high[0], low[1], low[2]), amount[0]);
        const z0y1 = interpolate(at(low[0], high[1], low[2]), at(high[0], high[1], low[2]), amount[0]);
        const z1y0 = interpolate(at(low[0], low[1], high[2]), at(high[0], low[1], high[2]), amount[0]);
        const z1y1 = interpolate(at(low[0], high[1], high[2]), at(high[0], high[1], high[2]), amount[0]);
        const z0 = interpolate(z0y0, z0y1, amount[1]);
        const z1 = interpolate(z1y0, z1y1, amount[1]);
        const vector = interpolate(z0, z1, amount[2]);
        return { vector, magnitude: length3(vector) };
    }
    function random01(state) {
        let value = (state.value += 0x6d2b79f5);
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        state.value = value >>> 0;
        return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
    }
    function seedGrid(data, grid) {
        const count = [
            Math.trunc(grid.dimensions[0]),
            Math.trunc(grid.dimensions[1]),
            Math.trunc(grid.dimensions[2]),
        ];
        const [minimum, maximum] = vectorFieldWorldBounds(data);
        const jitter = clamp(grid.jitter ?? 0, 0, 0.49);
        const randomState = { value: Math.trunc(grid.seed ?? 0x9e3779b9) >>> 0 };
        const output = [];
        for (let z = 0; z < count[2]; z += 1) {
            for (let y = 0; y < count[1]; y += 1) {
                for (let x = 0; x < count[0]; x += 1) {
                    const position = [x, y, z].map((index, axis) => {
                        const axisCount = count[axis];
                        const base = axisCount === 1 ? 0.5 : index / (axisCount - 1);
                        const cell = axisCount <= 1 ? 1 : 1 / (axisCount - 1);
                        const offset = jitter === 0 ? 0 : (random01(randomState) * 2 - 1) * jitter * cell;
                        const normalized = clamp(base + offset, 0, 1);
                        return minimum[axis] + (maximum[axis] - minimum[axis]) * normalized;
                    });
                    output.push(position);
                }
            }
        }
        return output;
    }
    function resolveVectorFieldSeeds(data) {
        const explicit = data.seeds ?? [];
        const generated = data.seedGrid === undefined
            ? explicit.length === 0
                ? seedGrid(data, { dimensions: [2, 2, 2] })
                : []
            : seedGrid(data, data.seedGrid);
        const candidates = [
            ...explicit.map((point, sourceIndex) => ({
                point: [point[0], point[1], point[2]],
                sourceIndex,
                source: 'explicit',
            })),
            ...generated.map((point, index) => ({
                point: [point[0], point[1], point[2]],
                sourceIndex: explicit.length + index,
                source: 'grid',
            })),
        ];
        const output = [];
        for (const candidate of candidates) {
            const { point } = candidate;
            if (!insideField(data, point))
                continue;
            if (output.some((retained) => length3(subtract3(retained.point, point)) <= 1e-9))
                continue;
            output.push(candidate);
        }
        return { records: output, sourceCount: candidates.length };
    }
    /** Produces stable explicit-plus-grid seeds without executable callbacks. */
    function generateVectorFieldSeeds(data) {
        return resolveVectorFieldSeeds(data).records.map(({ point }) => point);
    }
    function resolveIntegration(data, input = {}) {
        const step = fieldSpacing(data);
        const characteristic = Math.min(step[0], step[1], step[2]);
        const [minimum, maximum] = vectorFieldWorldBounds(data);
        const diagonal = length3(subtract3(maximum, minimum));
        const minStep = input.minStep ?? characteristic / 128;
        const maxStep = input.maxStep ?? characteristic;
        return {
            direction: input.direction ?? 'both',
            initialStep: clamp(input.initialStep ?? characteristic * 0.35, minStep, maxStep),
            minStep,
            maxStep,
            tolerance: input.tolerance ?? Math.max(1e-8, characteristic * 1e-3),
            maxSteps: Math.trunc(input.maxSteps ?? 512),
            maxLength: input.maxLength ?? diagonal * 4,
            minMagnitude: input.minMagnitude ?? 1e-9,
        };
    }
    function directionAt(data, point, sign, minimumMagnitude) {
        const sample = sampleVectorField(data, point);
        if (sample === null || sample.magnitude <= minimumMagnitude)
            return null;
        return scale3(normalize3(sample.vector), sign);
    }
    function rk4Step(data, point, step, sign, minimumMagnitude) {
        const k1 = directionAt(data, point, sign, minimumMagnitude);
        if (k1 === null)
            return null;
        const k2 = directionAt(data, add3(point, scale3(k1, step / 2)), sign, minimumMagnitude);
        if (k2 === null)
            return null;
        const k3 = directionAt(data, add3(point, scale3(k2, step / 2)), sign, minimumMagnitude);
        if (k3 === null)
            return null;
        const k4 = directionAt(data, add3(point, scale3(k3, step)), sign, minimumMagnitude);
        if (k4 === null)
            return null;
        return add3(point, scale3(add3(add3(k1, scale3(k2, 2)), add3(scale3(k3, 2), k4)), step / 6));
    }
    function integrateDirection(data, seed, sign, options) {
        const first = sampleVectorField(data, seed);
        if (first === null || first.magnitude <= options.minMagnitude) {
            return {
                points: [seed],
                magnitudes: [first?.magnitude ?? 0],
                acceptedSteps: 0,
                rejectedSteps: 0,
                termination: 'stagnation',
            };
        }
        const points = [seed];
        const magnitudes = [first.magnitude];
        let acceptedSteps = 0;
        let rejectedSteps = 0;
        let pathLength = 0;
        let step = options.initialStep;
        let termination = 'max-steps';
        let attempts = 0;
        while (acceptedSteps < options.maxSteps && attempts < options.maxSteps * 8) {
            attempts += 1;
            const current = points[points.length - 1];
            const full = rk4Step(data, current, step, sign, options.minMagnitude);
            const half = rk4Step(data, current, step / 2, sign, options.minMagnitude);
            const refined = half === null ? null : rk4Step(data, half, step / 2, sign, options.minMagnitude);
            if (full === null || refined === null) {
                termination = insideField(data, current) ? 'stagnation' : 'bounds';
                break;
            }
            const error = length3(subtract3(refined, full));
            if (error > options.tolerance && step > options.minStep * 1.000001) {
                step = Math.max(options.minStep, step * Math.max(0.2, 0.9 * (options.tolerance / error) ** 0.2));
                rejectedSteps += 1;
                continue;
            }
            if (!insideField(data, refined)) {
                termination = 'bounds';
                break;
            }
            const distance = length3(subtract3(refined, current));
            if (distance <= 1e-12) {
                termination = 'stagnation';
                break;
            }
            if (pathLength + distance > options.maxLength) {
                termination = 'max-length';
                break;
            }
            const sample = sampleVectorField(data, refined);
            if (sample === null || sample.magnitude <= options.minMagnitude) {
                termination = 'stagnation';
                break;
            }
            points.push(refined);
            magnitudes.push(sample.magnitude);
            pathLength += distance;
            acceptedSteps += 1;
            const factor = error <= 1e-16 ? 2 : clamp(0.9 * (options.tolerance / error) ** 0.2, 0.5, 2);
            step = clamp(step * factor, options.minStep, options.maxStep);
            if (step <= options.minStep && error > options.tolerance) {
                termination = 'minimum-step';
                break;
            }
        }
        return { points, magnitudes, acceptedSteps, rejectedSteps, termination };
    }
    /** Integrates a bounded raw 3D field with deterministic adaptive RK4 step doubling. */
    function integrateVectorField(data, input = {}) {
        const options = resolveIntegration(data, input);
        const resolvedSeeds = resolveVectorFieldSeeds(data);
        const seeds = resolvedSeeds.records.map(({ point }) => point);
        const paths = [];
        let totalAccepted = 0;
        let totalRejected = 0;
        for (const seedRecord of resolvedSeeds.records) {
            const seed = seedRecord.point;
            const backward = options.direction === 'forward' ? null : integrateDirection(data, seed, -1, options);
            const forward = options.direction === 'backward' ? null : integrateDirection(data, seed, 1, options);
            const points = [
                ...(backward === null ? [] : [...backward.points].reverse().slice(0, -1)),
                ...(forward?.points ?? [seed]),
            ];
            const magnitudes = [
                ...(backward === null ? [] : [...backward.magnitudes].reverse().slice(0, -1)),
                ...(forward?.magnitudes ?? [sampleVectorField(data, seed)?.magnitude ?? 0]),
            ];
            const acceptedSteps = (backward?.acceptedSteps ?? 0) + (forward?.acceptedSteps ?? 0);
            const rejectedSteps = (backward?.rejectedSteps ?? 0) + (forward?.rejectedSteps ?? 0);
            totalAccepted += acceptedSteps;
            totalRejected += rejectedSteps;
            paths.push({
                seedIndex: seedRecord.sourceIndex,
                seedSource: seedRecord.source,
                points,
                magnitudes,
                acceptedSteps,
                rejectedSteps,
                termination: forward?.termination ?? backward?.termination ?? 'stagnation',
            });
        }
        return {
            seeds,
            seedSourceIndices: resolvedSeeds.records.map(({ sourceIndex }) => sourceIndex),
            sourceSeedCount: resolvedSeeds.sourceCount,
            paths,
            method: 'adaptive-rk4-step-doubling',
            acceptedSteps: totalAccepted,
            rejectedSteps: totalRejected,
        };
    }

    const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
    const ROOT_KEYS = new Set([
        'specVersion',
        'title',
        'theme',
        'background',
        'ariaLabel',
        'camera',
        'lighting',
        'interaction',
        'accessibility',
        'legend',
        'highlights',
        'annotations',
        'layers',
    ]);
    const THEME_KEYS = new Set([
        'extends',
        'name',
        'mode',
        'colors',
        'typography',
        'spacing',
        'axis',
        'mark',
        'legend',
        'motion',
    ]);
    const THEME_COLOR_KEYS = new Set([
        'background',
        'surface',
        'panel',
        'text',
        'mutedText',
        'subtitle',
        'axisTitle',
        'axis',
        'grid',
        'minorGrid',
        'focus',
        'palette',
        'paletteMode',
        'continuousInterpolation',
        'sequential',
        'diverging',
    ]);
    const THEME_TYPOGRAPHY_KEYS = new Set([
        'fontFamily',
        'fontSize',
        'fontWeight',
        'titleSize',
        'titleWeight',
        'subtitleSize',
        'subtitleWeight',
        'axisLabelSize',
        'axisLabelWeight',
        'axisTitleSize',
        'axisTitleWeight',
        'legendLabelSize',
        'legendLabelWeight',
        'legendTitleSize',
        'legendTitleWeight',
        'titlePosition',
        'titleAlign',
        'lineHeight',
    ]);
    const THEME_SPACING_KEYS = new Set([
        'xs',
        'sm',
        'md',
        'lg',
        'xl',
        'plotMargin',
        'plotPadding',
        'minimumTitleBlock',
    ]);
    const THEME_PLOT_PADDING_KEYS = new Set(['top', 'right', 'bottom', 'left']);
    const THEME_AXIS_KEYS = new Set([
        'lineWidth',
        'tickLength',
        'labelPadding',
        'gridLineWidth',
        'lineVisible',
        'boxVisible',
        'boxLineWidth',
        'boxExcludedMarks',
        'ticksVisible',
        'gridX',
        'gridX2',
        'gridY',
        'gridY2',
        'gridOpacity',
        'minorGridVisible',
        'minorGridLineWidth',
        'minorGridOpacity',
        'emphasizeZero',
        'lineCap',
        'titleGap',
    ]);
    const THEME_MARK_KEYS = new Set([
        'lineWidth',
        'pointRadius',
        'barRadius',
        'opacity',
        'defaultColor',
        'lineColor',
        'pointFill',
        'pointStroke',
        'pointStrokeWidth',
        'pointColorMode',
        'barFill',
        'barStroke',
        'barStrokeWidth',
        'barWidthRatio',
        'histogramFill',
        'histogramGap',
        'boxplotFill',
        'boxplotLineWidth',
        'boxplotRadius',
        'boxplotMedianStroke',
        'piePalette',
        'pieStroke',
        'pieStrokeWidth',
        'pieStartAngle',
        'pieDirection',
        'areaFill',
        'areaStroke',
        'areaStrokeVisible',
        'areaColorMode',
        'lineCap',
        'lineJoin',
    ]);
    const THEME_LEGEND_KEYS = new Set([
        'surfaceOpacity',
        'borderWidth',
        'borderColor',
        'cornerRadius',
        'swatchRadius',
        'swatchSize',
        'lineWidth',
        'pointRadius',
        'pointStrokeWidth',
        'lineCap',
        'continuousSamples',
    ]);
    const THEME_MOTION_KEYS = new Set(['duration', 'easing']);
    const CAMERA_KEYS = new Set([
        'projection',
        'target',
        'yaw',
        'pitch',
        'distance',
        'fov',
        'near',
        'far',
    ]);
    const LIGHTING_KEYS = new Set(['ambient', 'diffuse', 'direction']);
    const INTERACTION_KEYS = new Set([
        'orbit',
        'pan',
        'zoom',
        'wheel',
        'picking',
        'tooltip',
        'controls',
        'labels',
        'selection',
    ]);
    const TOOLTIP_KEYS = new Set(['title', 'fields']);
    const CONTROL_LABEL_KEYS = new Set([
        'chart',
        'toolbar',
        'orbit',
        'pan',
        'zoomIn',
        'zoomOut',
        'reset',
        'projection',
        'fullscreen',
        'exportPng',
        'showAnnotations',
        'hideAnnotations',
        'instructions',
        'contextLost',
        'unavailable',
    ]);
    const CONTROLS_KEYS = new Set(['annotations']);
    const ACCESSIBILITY_KEYS = new Set([
        'description',
        'table',
        'maxRows',
        'navigation',
        'linkedFocus',
    ]);
    const ACCESSIBILITY_NAVIGATION_KEYS = new Set(['pageRows', 'wrap']);
    const LINKED_FOCUS_KEYS = new Set(['group', 'key']);
    const LAYER_KEYS = new Set(['id', 'name', 'mark', 'data']);
    const SELECTION_KEYS = new Set([
        'mode',
        'toggle',
        'key',
        'clearOnBackground',
        'clearOnEscape',
        'ariaLabel',
        'highlight',
    ]);
    const LEGEND_KEYS = new Set([
        'visible',
        'mode',
        'position',
        'orientation',
        'title',
        'field',
        'layerId',
        'items',
        'maxItems',
        'interactive',
        'labels',
    ]);
    const LEGEND_ITEM_KEYS = new Set(['id', 'label', 'color', 'layerId', 'value', 'symbol']);
    const LEGEND_LABEL_KEYS = new Set(['show', 'hide']);
    const HIGHLIGHT_KEYS = new Set([
        'id',
        'target',
        'fill',
        'stroke',
        'opacity',
        'lineWidth',
        'dash',
        'padding',
        'radius',
    ]);
    const ANNOTATION_KEYS = new Set([
        'id',
        'target',
        'text',
        'detail',
        'placement',
        'offsetX',
        'offsetY',
        'connector',
        'style',
    ]);
    const CONNECTOR_KEYS = new Set(['visible', 'color', 'width', 'dash']);
    const ANNOTATION_STYLE_KEYS = new Set([
        'background',
        'border',
        'color',
        'opacity',
        'fontSize',
        'maxWidth',
        'padding',
        'align',
    ]);
    const SURFACE_MARK_KEYS = new Set([
        'type',
        'mode',
        'color',
        'opacity',
        'normalMode',
        'wireframe',
        'wireOverlay',
        'contours',
    ]);
    const SURFACE_WIRE_OVERLAY_KEYS = new Set(['color', 'opacity']);
    const SURFACE_CONTOUR_KEYS = new Set([
        'levels',
        'count',
        'projection',
        'baseHeight',
        'color',
        'opacity',
        'maxSegments',
    ]);
    const VOLUME_MARK_KEYS = new Set([
        'type',
        'mode',
        'isoValue',
        'opacity',
        'pointSize',
        'maxSamples',
        'colorLow',
        'colorHigh',
        'transferFunction',
        'windowLevel',
        'render',
        'slices',
    ]);
    const VOLUME_TRANSFER_KEYS = new Set(['stops', 'interpolation']);
    const VOLUME_TRANSFER_STOP_KEYS = new Set(['offset', 'color', 'opacity']);
    const VOLUME_WINDOW_LEVEL_KEYS = new Set(['window', 'level']);
    const VOLUME_RENDER_KEYS = new Set([
        'method',
        'axis',
        'resolution',
        'samples',
        'interpolation',
        'caps',
    ]);
    const VOLUME_ORTHOGONAL_SLICE_KEYS = new Set([
        'type',
        'axis',
        'position',
        'resolution',
        'interpolation',
        'opacity',
    ]);
    const VOLUME_OBLIQUE_SLICE_KEYS = new Set([
        'type',
        'origin',
        'normal',
        'up',
        'size',
        'resolution',
        'interpolation',
        'opacity',
    ]);
    const VECTOR_MARK_KEYS = new Set([
        'type',
        'mode',
        'color',
        'opacity',
        'radius',
        'scale',
        'segments',
        'integration',
        'magnitudeEncoding',
    ]);
    const VECTOR_INTEGRATION_KEYS = new Set([
        'direction',
        'initialStep',
        'minStep',
        'maxStep',
        'tolerance',
        'maxSteps',
        'maxLength',
        'minMagnitude',
    ]);
    const SCATTER_MARK_KEYS = new Set(['type', 'color', 'opacity', 'pointSize']);
    const GLOBE_MARK_KEYS = new Set([
        'type',
        'radius',
        'landColor',
        'oceanColor',
        'borderColor',
        'pointColor',
        'routeColor',
        'opacity',
        'routeSegments',
    ]);
    const SURFACE_GRID_KEYS = new Set(['rows', 'columns', 'z', 'x', 'y', 'values']);
    const MESH_KEYS = new Set(['positions', 'triangles', 'normals', 'colors', 'labels']);
    const VOLUME_DATA_KEYS = new Set(['dimensions', 'values', 'origin', 'spacing']);
    const CONE_DATA_KEYS = new Set(['origins', 'vectors', 'labels', 'colors']);
    const STREAM_DATA_KEYS = new Set(['paths', 'magnitudes', 'labels', 'colors']);
    const VECTOR_FIELD_DATA_KEYS = new Set([
        'dimensions',
        'vectors',
        'origin',
        'spacing',
        'seeds',
        'seedGrid',
        'labels',
        'colors',
    ]);
    const VECTOR_SEED_GRID_KEYS = new Set(['dimensions', 'jitter', 'seed']);
    const SCATTER_DATA_KEYS = new Set(['positions', 'values', 'sizes', 'colors', 'labels']);
    const GLOBE_DATA_KEYS = new Set(['points', 'routes']);
    const GLOBE_POINT_KEYS = new Set(['longitude', 'latitude', 'value', 'label', 'color', 'size']);
    const GLOBE_ROUTE_KEYS = new Set(['from', 'to', 'value', 'label', 'color']);
    const MAX_LAYERS = 64;
    const MAX_POINTS = 1_000_000;
    const MAX_TRIANGLES = 2_000_000;
    const MAX_VOLUME_CELLS = 4_194_304;
    const MAX_VECTOR_COUNT = 250_000;
    const MAX_PATHS = 4_096;
    const MAX_GLOBE_ITEMS = 100_000;
    const MAX_PORTABLE_NODES = 6_000_000;
    const MAX_PORTABLE_DEPTH = 48;
    const MAX_STRING_LENGTH = 8_192;
    function isRecord(value) {
        if (value === null || typeof value !== 'object' || Array.isArray(value))
            return false;
        const prototype = Object.getPrototypeOf(value);
        if (prototype === null || prototype === Object.prototype)
            return true;
        const constructor = Object.getOwnPropertyDescriptor(prototype, 'constructor')?.value;
        return (Object.getPrototypeOf(prototype) === null &&
            typeof constructor === 'function' &&
            constructor.name === 'Object');
    }
    function issue(issues, path, message) {
        issues.push({ path, message });
    }
    function objectValue(value, path, issues) {
        if (!isRecord(value)) {
            issue(issues, path, 'Must be an object.');
            return undefined;
        }
        return value;
    }
    function closedObject$1(value, path, keys, issues) {
        const record = objectValue(value, path, issues);
        if (record === undefined)
            return undefined;
        for (const key of Object.keys(record)) {
            if (!keys.has(key))
                issue(issues, `${path}.${key}`, `Unknown property "${key}".`);
        }
        return record;
    }
    function finiteNumber(value, path, issues, minimum = -Number.MAX_VALUE, maximum = Number.MAX_VALUE) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            issue(issues, path, 'Must be a finite number.');
            return undefined;
        }
        if (value < minimum || value > maximum) {
            issue(issues, path, `Must be between ${minimum} and ${maximum}.`);
            return undefined;
        }
        return value;
    }
    function integer$1(value, path, issues, minimum, maximum) {
        const parsed = finiteNumber(value, path, issues, minimum, maximum);
        if (parsed !== undefined && !Number.isInteger(parsed)) {
            issue(issues, path, 'Must be an integer.');
            return undefined;
        }
        return parsed;
    }
    function optionalString(value, path, issues, maximum = MAX_STRING_LENGTH) {
        if (value === undefined)
            return;
        if (typeof value !== 'string') {
            issue(issues, path, 'Must be a string.');
            return;
        }
        if (value.length > maximum)
            issue(issues, path, `Must contain at most ${maximum} characters.`);
    }
    function optionalNonEmptyString(value, path, issues, maximum = MAX_STRING_LENGTH) {
        optionalString(value, path, issues, maximum);
        if (typeof value === 'string' && value.trim() === '')
            issue(issues, path, 'Must contain at least one non-whitespace character.');
    }
    function optionalIdentifier(value, path, issues, maximum = 128) {
        optionalNonEmptyString(value, path, issues, maximum);
        if (typeof value === 'string' && value.trim() !== value)
            issue(issues, path, 'Must not contain leading or trailing whitespace.');
    }
    function optionalBoolean(value, path, issues) {
        if (value !== undefined && typeof value !== 'boolean')
            issue(issues, path, 'Must be a boolean.');
    }
    function optionalEnum(value, path, values, issues) {
        if (value !== undefined && (typeof value !== 'string' || !values.has(value))) {
            issue(issues, path, `Must be one of: ${[...values].join(', ')}.`);
        }
    }
    function numberArray(value, path, issues, maximum, exactLength) {
        if (!Array.isArray(value)) {
            issue(issues, path, 'Must be an array.');
            return undefined;
        }
        if (value.length > maximum)
            issue(issues, path, `Must contain at most ${maximum} values.`);
        if (exactLength !== undefined && value.length !== exactLength) {
            issue(issues, path, `Must contain exactly ${exactLength} values.`);
        }
        for (let index = 0; index < Math.min(value.length, maximum + 1); index += 1) {
            finiteNumber(value[index], `${path}[${index}]`, issues);
        }
        return value;
    }
    function vec3(value, path, issues) {
        if (!Array.isArray(value) || value.length !== 3) {
            issue(issues, path, 'Must be a three-number tuple.');
            return false;
        }
        return value.every((entry, index) => finiteNumber(entry, `${path}[${index}]`, issues) !== undefined);
    }
    function integerVec2(value, path, issues, minimum, maximum) {
        if (!Array.isArray(value) || value.length !== 2) {
            issue(issues, path, 'Must be a two-integer tuple.');
            return false;
        }
        return value.every((entry, index) => integer$1(entry, `${path}[${index}]`, issues, minimum, maximum) !== undefined);
    }
    function positiveVec2(value, path, issues) {
        if (!Array.isArray(value) || value.length !== 2) {
            issue(issues, path, 'Must be a two-number tuple.');
            return;
        }
        value.forEach((entry, index) => finiteNumber(entry, `${path}[${index}]`, issues, 0.000001, 1_000_000_000));
    }
    function lonLat(value, path, issues) {
        if (!Array.isArray(value) || value.length !== 2) {
            issue(issues, path, 'Must be a longitude/latitude tuple.');
            return;
        }
        finiteNumber(value[0], `${path}[0]`, issues, -180, 180);
        finiteNumber(value[1], `${path}[1]`, issues, -90, 90);
    }
    function color(value, path, issues) {
        if (typeof value === 'string') {
            if (value.length === 0 || value.length > 128)
                issue(issues, path, 'Color strings must contain 1 to 128 characters.');
            return true;
        }
        if (!Array.isArray(value) || (value.length !== 3 && value.length !== 4)) {
            issue(issues, path, 'Must be a color string or a three/four-number tuple.');
            return false;
        }
        value.forEach((entry, index) => finiteNumber(entry, `${path}[${index}]`, issues, 0, 255));
        return true;
    }
    function optionalColor(value, path, issues) {
        if (value !== undefined)
            color(value, path, issues);
    }
    function optionalThemeNumber(value, path, issues, minimum = 0, maximum = 2_000) {
        if (value !== undefined)
            finiteNumber(value, path, issues, minimum, maximum);
    }
    function validateThemeStringArray(value, path, issues) {
        if (value === undefined)
            return;
        if (!Array.isArray(value) || value.length === 0 || value.length > 256) {
            issue(issues, path, 'Must be an array with 1 to 256 color strings.');
            return;
        }
        value.forEach((entry, index) => optionalNonEmptyString(entry, `${path}[${index}]`, issues, 128));
    }
    function validateThemeNameArray(value, path, issues) {
        if (value === undefined)
            return;
        if (!Array.isArray(value) || value.length > 256) {
            issue(issues, path, 'Must be an array with at most 256 non-empty names.');
            return;
        }
        value.forEach((entry, index) => optionalNonEmptyString(entry, `${path}[${index}]`, issues, 128));
    }
    function validateTheme(value, path, issues) {
        if (value === undefined)
            return;
        if (typeof value === 'string') {
            optionalNonEmptyString(value, path, issues, 128);
            return;
        }
        const theme = closedObject$1(value, path, THEME_KEYS, issues);
        if (theme === undefined) {
            issue(issues, path, 'Theme must be a registered theme name or an override object.');
            return;
        }
        optionalNonEmptyString(theme.extends, `${path}.extends`, issues, 128);
        optionalString(theme.name, `${path}.name`, issues, 128);
        optionalEnum(theme.mode, `${path}.mode`, new Set(['light', 'dark']), issues);
        if (theme.colors !== undefined) {
            const colors = closedObject$1(theme.colors, `${path}.colors`, THEME_COLOR_KEYS, issues);
            if (colors !== undefined) {
                for (const key of [
                    'background',
                    'surface',
                    'panel',
                    'text',
                    'mutedText',
                    'subtitle',
                    'axisTitle',
                    'axis',
                    'grid',
                    'minorGrid',
                    'focus',
                ])
                    optionalNonEmptyString(colors[key], `${path}.colors.${key}`, issues, 128);
                optionalEnum(colors.paletteMode, `${path}.colors.paletteMode`, new Set(['fixed', 'ggplot2-hue']), issues);
                optionalEnum(colors.continuousInterpolation, `${path}.colors.continuousInterpolation`, new Set(['step', 'rgb', 'lab']), issues);
                for (const key of ['palette', 'sequential', 'diverging'])
                    validateThemeStringArray(colors[key], `${path}.colors.${key}`, issues);
            }
        }
        if (theme.typography !== undefined) {
            const typography = closedObject$1(theme.typography, `${path}.typography`, THEME_TYPOGRAPHY_KEYS, issues);
            if (typography !== undefined) {
                optionalNonEmptyString(typography.fontFamily, `${path}.typography.fontFamily`, issues, 512);
                for (const key of [
                    'fontSize',
                    'fontWeight',
                    'titleSize',
                    'titleWeight',
                    'subtitleSize',
                    'subtitleWeight',
                    'axisLabelSize',
                    'axisLabelWeight',
                    'axisTitleSize',
                    'axisTitleWeight',
                    'legendLabelSize',
                    'legendLabelWeight',
                    'legendTitleSize',
                    'legendTitleWeight',
                    'lineHeight',
                ])
                    optionalThemeNumber(typography[key], `${path}.typography.${key}`, issues, 0, 2_000);
                optionalEnum(typography.titlePosition, `${path}.typography.titlePosition`, new Set(['plot', 'panel']), issues);
                optionalEnum(typography.titleAlign, `${path}.typography.titleAlign`, new Set(['left', 'center', 'right']), issues);
            }
        }
        if (theme.spacing !== undefined) {
            const spacing = closedObject$1(theme.spacing, `${path}.spacing`, THEME_SPACING_KEYS, issues);
            if (spacing !== undefined) {
                for (const key of ['xs', 'sm', 'md', 'lg', 'xl', 'plotMargin', 'minimumTitleBlock'])
                    optionalThemeNumber(spacing[key], `${path}.spacing.${key}`, issues);
                if (spacing.plotPadding !== undefined) {
                    const plotPadding = closedObject$1(spacing.plotPadding, `${path}.spacing.plotPadding`, THEME_PLOT_PADDING_KEYS, issues);
                    if (plotPadding !== undefined)
                        for (const key of THEME_PLOT_PADDING_KEYS)
                            optionalThemeNumber(plotPadding[key], `${path}.spacing.plotPadding.${key}`, issues);
                }
            }
        }
        if (theme.axis !== undefined) {
            const axis = closedObject$1(theme.axis, `${path}.axis`, THEME_AXIS_KEYS, issues);
            if (axis !== undefined) {
                for (const key of [
                    'lineWidth',
                    'tickLength',
                    'labelPadding',
                    'gridLineWidth',
                    'boxLineWidth',
                    'minorGridLineWidth',
                    'titleGap',
                ])
                    optionalThemeNumber(axis[key], `${path}.axis.${key}`, issues, 0, 256);
                for (const key of ['gridOpacity', 'minorGridOpacity'])
                    optionalThemeNumber(axis[key], `${path}.axis.${key}`, issues, 0, 1);
                validateThemeNameArray(axis.boxExcludedMarks, `${path}.axis.boxExcludedMarks`, issues);
                for (const key of [
                    'lineVisible',
                    'boxVisible',
                    'ticksVisible',
                    'gridX',
                    'gridX2',
                    'gridY',
                    'gridY2',
                    'minorGridVisible',
                    'emphasizeZero',
                ])
                    optionalBoolean(axis[key], `${path}.axis.${key}`, issues);
                optionalEnum(axis.lineCap, `${path}.axis.lineCap`, new Set(['butt', 'round', 'square']), issues);
            }
        }
        if (theme.mark !== undefined) {
            const mark = closedObject$1(theme.mark, `${path}.mark`, THEME_MARK_KEYS, issues);
            if (mark !== undefined) {
                for (const key of [
                    'lineWidth',
                    'pointRadius',
                    'pointStrokeWidth',
                    'barRadius',
                    'barStrokeWidth',
                    'histogramGap',
                    'boxplotLineWidth',
                    'boxplotRadius',
                    'pieStrokeWidth',
                ])
                    optionalThemeNumber(mark[key], `${path}.mark.${key}`, issues);
                optionalThemeNumber(mark.opacity, `${path}.mark.opacity`, issues, 0, 1);
                optionalThemeNumber(mark.barWidthRatio, `${path}.mark.barWidthRatio`, issues, 0, 1);
                optionalThemeNumber(mark.pieStartAngle, `${path}.mark.pieStartAngle`, issues, -1e6, 1_000_000);
                optionalBoolean(mark.areaStrokeVisible, `${path}.mark.areaStrokeVisible`, issues);
                for (const key of [
                    'defaultColor',
                    'lineColor',
                    'pointFill',
                    'pointStroke',
                    'barFill',
                    'barStroke',
                    'histogramFill',
                    'boxplotFill',
                    'boxplotMedianStroke',
                    'pieStroke',
                    'areaFill',
                    'areaStroke',
                ])
                    optionalNonEmptyString(mark[key], `${path}.mark.${key}`, issues, 128);
                validateThemeStringArray(mark.piePalette, `${path}.mark.piePalette`, issues);
                for (const key of ['pointColorMode', 'areaColorMode'])
                    optionalEnum(mark[key], `${path}.mark.${key}`, new Set(['theme', 'series']), issues);
                optionalEnum(mark.pieDirection, `${path}.mark.pieDirection`, new Set(['clockwise', 'counterclockwise']), issues);
                optionalEnum(mark.lineCap, `${path}.mark.lineCap`, new Set(['butt', 'round', 'square']), issues);
                optionalEnum(mark.lineJoin, `${path}.mark.lineJoin`, new Set(['bevel', 'round', 'miter']), issues);
            }
        }
        if (theme.legend !== undefined) {
            const legend = closedObject$1(theme.legend, `${path}.legend`, THEME_LEGEND_KEYS, issues);
            if (legend !== undefined) {
                optionalThemeNumber(legend.surfaceOpacity, `${path}.legend.surfaceOpacity`, issues, 0, 1);
                optionalNonEmptyString(legend.borderColor, `${path}.legend.borderColor`, issues, 128);
                for (const key of [
                    'borderWidth',
                    'cornerRadius',
                    'swatchRadius',
                    'swatchSize',
                    'lineWidth',
                    'pointRadius',
                    'pointStrokeWidth',
                ])
                    optionalThemeNumber(legend[key], `${path}.legend.${key}`, issues, 0, 256);
                optionalThemeNumber(legend.continuousSamples, `${path}.legend.continuousSamples`, issues, 1, 256);
                if (legend.continuousSamples !== undefined &&
                    typeof legend.continuousSamples === 'number' &&
                    !Number.isInteger(legend.continuousSamples)) {
                    issue(issues, `${path}.legend.continuousSamples`, 'Must be an integer.');
                }
                optionalEnum(legend.lineCap, `${path}.legend.lineCap`, new Set(['butt', 'round', 'square']), issues);
            }
        }
        if (theme.motion !== undefined) {
            const motion = closedObject$1(theme.motion, `${path}.motion`, THEME_MOTION_KEYS, issues);
            if (motion !== undefined) {
                optionalThemeNumber(motion.duration, `${path}.motion.duration`, issues, 0, 1_000_000);
                optionalEnum(motion.easing, `${path}.motion.easing`, new Set(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']), issues);
            }
        }
    }
    function jsonScalar(value) {
        return (value === null ||
            typeof value === 'string' ||
            typeof value === 'boolean' ||
            (typeof value === 'number' && Number.isFinite(value)));
    }
    function validateDash(value, path, issues) {
        if (value === undefined)
            return;
        if (!Array.isArray(value) || value.length > 16) {
            issue(issues, path, 'Must be an array with at most 16 values.');
            return;
        }
        value.forEach((entry, index) => finiteNumber(entry, `${path}[${index}]`, issues, 0, 256));
    }
    function validateHighlightStyle(value, path, issues) {
        optionalNonEmptyString(value.fill, `${path}.fill`, issues, 128);
        optionalNonEmptyString(value.stroke, `${path}.stroke`, issues, 128);
        if (value.opacity !== undefined)
            finiteNumber(value.opacity, `${path}.opacity`, issues, 0, 1);
        if (value.lineWidth !== undefined)
            finiteNumber(value.lineWidth, `${path}.lineWidth`, issues, 0, 64);
        if (value.padding !== undefined)
            finiteNumber(value.padding, `${path}.padding`, issues, 0, 256);
        if (value.radius !== undefined)
            finiteNumber(value.radius, `${path}.radius`, issues, 0, 256);
        validateDash(value.dash, `${path}.dash`, issues);
    }
    function validateSpatialTarget(value, path, issues) {
        const target = objectValue(value, path, issues);
        if (target === undefined || typeof target.type !== 'string') {
            if (target !== undefined)
                issue(issues, `${path}.type`, 'Target type is required.');
            return;
        }
        if (target.type === 'datum') {
            const datum = closedObject$1(target, path, new Set(['type', 'layerId', 'datumIndex', 'field', 'value', 'values']), issues);
            if (datum === undefined)
                return;
            optionalIdentifier(datum.layerId, `${path}.layerId`, issues);
            if (datum.datumIndex !== undefined) {
                const indices = Array.isArray(datum.datumIndex) ? datum.datumIndex : [datum.datumIndex];
                if (indices.length === 0 || indices.length > 1000)
                    issue(issues, `${path}.datumIndex`, 'Must select between 1 and 1000 datum indices.');
                indices.forEach((entry, index) => integer$1(entry, Array.isArray(datum.datumIndex) ? `${path}.datumIndex[${index}]` : `${path}.datumIndex`, issues, 0, Number.MAX_SAFE_INTEGER));
                if (new Set(indices).size !== indices.length)
                    issue(issues, `${path}.datumIndex`, 'Datum indices must be unique.');
            }
            optionalNonEmptyString(datum.field, `${path}.field`, issues, 128);
            if (typeof datum.field === 'string' && UNSAFE_KEYS.has(datum.field))
                issue(issues, `${path}.field`, 'Unsafe datum field is forbidden.');
            const hasValue = Object.prototype.hasOwnProperty.call(datum, 'value');
            const hasValues = Object.prototype.hasOwnProperty.call(datum, 'values');
            if (hasValue && !jsonScalar(datum.value))
                issue(issues, `${path}.value`, 'Must be a JSON scalar.');
            if (hasValues) {
                if (!Array.isArray(datum.values) || datum.values.length === 0 || datum.values.length > 200)
                    issue(issues, `${path}.values`, 'Must contain between 1 and 200 JSON scalars.');
                else
                    datum.values.forEach((entry, index) => {
                        if (!jsonScalar(entry))
                            issue(issues, `${path}.values[${index}]`, 'Must be a JSON scalar.');
                    });
                if (Array.isArray(datum.values) &&
                    new Set(datum.values.map((entry) => JSON.stringify(entry))).size !== datum.values.length)
                    issue(issues, `${path}.values`, 'Datum values must be unique.');
            }
            if (datum.field === undefined && (hasValue || hasValues))
                issue(issues, `${path}.field`, 'Field is required for value matching.');
            if (datum.field !== undefined && hasValue === hasValues)
                issue(issues, path, 'Field matching requires exactly one of value or values.');
            if (datum.datumIndex === undefined && datum.field === undefined)
                issue(issues, path, 'Datum target requires datumIndex or field matching.');
            return;
        }
        if (target.type === 'layer') {
            const layer = closedObject$1(target, path, new Set(['type', 'layerId']), issues);
            if (layer !== undefined) {
                optionalIdentifier(layer.layerId, `${path}.layerId`, issues);
                if (layer.layerId === undefined)
                    issue(issues, `${path}.layerId`, 'Layer id is required.');
            }
            return;
        }
        if (target.type === 'point') {
            const point = closedObject$1(target, path, new Set(['type', 'position']), issues);
            if (point !== undefined)
                vec3(point.position, `${path}.position`, issues);
            return;
        }
        if (target.type === 'box') {
            const box = closedObject$1(target, path, new Set(['type', 'min', 'max']), issues);
            if (box !== undefined) {
                const minValid = vec3(box.min, `${path}.min`, issues);
                const maxValid = vec3(box.max, `${path}.max`, issues);
                if (minValid &&
                    maxValid &&
                    box.min.some((entry, index) => entry > box.max[index]))
                    issue(issues, path, 'Box min values must not exceed max values.');
            }
            return;
        }
        issue(issues, `${path}.type`, 'Unsupported spatial decoration target.');
    }
    function validateSelection(value, path, issues) {
        if (value === undefined || typeof value === 'boolean')
            return;
        const selection = closedObject$1(value, path, SELECTION_KEYS, issues);
        if (selection === undefined)
            return;
        optionalEnum(selection.mode, `${path}.mode`, new Set(['single', 'multiple']), issues);
        optionalBoolean(selection.toggle, `${path}.toggle`, issues);
        optionalNonEmptyString(selection.key, `${path}.key`, issues, 128);
        if (typeof selection.key === 'string' && UNSAFE_KEYS.has(selection.key))
            issue(issues, `${path}.key`, 'Unsafe selection key is forbidden.');
        optionalBoolean(selection.clearOnBackground, `${path}.clearOnBackground`, issues);
        optionalBoolean(selection.clearOnEscape, `${path}.clearOnEscape`, issues);
        optionalNonEmptyString(selection.ariaLabel, `${path}.ariaLabel`, issues, 256);
        if (selection.highlight !== undefined) {
            const highlight = closedObject$1(selection.highlight, `${path}.highlight`, new Set(['fill', 'stroke', 'opacity', 'lineWidth', 'dash', 'padding', 'radius']), issues);
            if (highlight !== undefined)
                validateHighlightStyle(highlight, `${path}.highlight`, issues);
        }
    }
    function validateLegend(value, path, issues) {
        if (value === undefined || typeof value === 'boolean')
            return;
        const legend = closedObject$1(value, path, LEGEND_KEYS, issues);
        if (legend === undefined)
            return;
        optionalBoolean(legend.visible, `${path}.visible`, issues);
        optionalBoolean(legend.interactive, `${path}.interactive`, issues);
        optionalEnum(legend.mode, `${path}.mode`, new Set(['auto', 'layers', 'categories', 'continuous']), issues);
        optionalEnum(legend.position, `${path}.position`, new Set([
            'top',
            'right',
            'bottom',
            'left',
            'inside-top-left',
            'inside-top-right',
            'inside-bottom-left',
            'inside-bottom-right',
        ]), issues);
        optionalEnum(legend.orientation, `${path}.orientation`, new Set(['auto', 'horizontal', 'vertical']), issues);
        optionalNonEmptyString(legend.title, `${path}.title`, issues, 256);
        optionalNonEmptyString(legend.field, `${path}.field`, issues, 128);
        if (typeof legend.field === 'string' && UNSAFE_KEYS.has(legend.field))
            issue(issues, `${path}.field`, 'Unsafe legend field is forbidden.');
        optionalIdentifier(legend.layerId, `${path}.layerId`, issues);
        if (legend.maxItems !== undefined)
            integer$1(legend.maxItems, `${path}.maxItems`, issues, 1, 200);
        if (legend.items !== undefined) {
            if (!Array.isArray(legend.items) || legend.items.length === 0 || legend.items.length > 200) {
                issue(issues, `${path}.items`, 'Must contain between 1 and 200 legend items.');
            }
            else {
                legend.items.forEach((entry, index) => {
                    const itemPath = `${path}.items[${index}]`;
                    const item = closedObject$1(entry, itemPath, LEGEND_ITEM_KEYS, issues);
                    if (item === undefined)
                        return;
                    optionalNonEmptyString(item.id, `${itemPath}.id`, issues, 128);
                    optionalNonEmptyString(item.label, `${itemPath}.label`, issues, 256);
                    if (item.label === undefined)
                        issue(issues, `${itemPath}.label`, 'Label is required.');
                    optionalNonEmptyString(item.color, `${itemPath}.color`, issues, 128);
                    optionalIdentifier(item.layerId, `${itemPath}.layerId`, issues);
                    if (item.value !== undefined && !jsonScalar(item.value))
                        issue(issues, `${itemPath}.value`, 'Must be a JSON scalar.');
                    optionalEnum(item.symbol, `${itemPath}.symbol`, new Set(['auto', 'line', 'point', 'rect']), issues);
                });
            }
        }
        if (legend.mode === 'categories' && legend.items === undefined)
            issue(issues, `${path}.items`, 'Spatial category legends require explicit items.');
        if (legend.labels !== undefined) {
            const labels = closedObject$1(legend.labels, `${path}.labels`, LEGEND_LABEL_KEYS, issues);
            if (labels !== undefined)
                for (const key of LEGEND_LABEL_KEYS)
                    optionalNonEmptyString(labels[key], `${path}.labels.${key}`, issues, 128);
        }
    }
    function validateHighlights(value, path, issues) {
        if (value === undefined)
            return;
        if (!Array.isArray(value) || value.length > 256) {
            issue(issues, path, 'Must be an array with at most 256 highlights.');
            return;
        }
        value.forEach((entry, index) => {
            const itemPath = `${path}[${index}]`;
            const highlight = closedObject$1(entry, itemPath, HIGHLIGHT_KEYS, issues);
            if (highlight === undefined)
                return;
            optionalNonEmptyString(highlight.id, `${itemPath}.id`, issues, 128);
            validateSpatialTarget(highlight.target, `${itemPath}.target`, issues);
            validateHighlightStyle(highlight, itemPath, issues);
        });
    }
    function validateAnnotations(value, path, issues) {
        if (value === undefined)
            return;
        if (!Array.isArray(value) || value.length > 256) {
            issue(issues, path, 'Must be an array with at most 256 annotations.');
            return;
        }
        value.forEach((entry, index) => {
            const itemPath = `${path}[${index}]`;
            const annotation = closedObject$1(entry, itemPath, ANNOTATION_KEYS, issues);
            if (annotation === undefined)
                return;
            optionalNonEmptyString(annotation.id, `${itemPath}.id`, issues, 128);
            optionalNonEmptyString(annotation.text, `${itemPath}.text`, issues, 2_000);
            if (annotation.text === undefined)
                issue(issues, `${itemPath}.text`, 'Text is required.');
            optionalString(annotation.detail, `${itemPath}.detail`, issues, 4_000);
            validateSpatialTarget(annotation.target, `${itemPath}.target`, issues);
            optionalEnum(annotation.placement, `${itemPath}.placement`, new Set(['auto', 'top', 'right', 'bottom', 'left']), issues);
            for (const key of ['offsetX', 'offsetY'])
                if (annotation[key] !== undefined)
                    finiteNumber(annotation[key], `${itemPath}.${key}`, issues, -1e4, 10_000);
            if (annotation.connector !== undefined && typeof annotation.connector !== 'boolean') {
                const connector = closedObject$1(annotation.connector, `${itemPath}.connector`, CONNECTOR_KEYS, issues);
                if (connector !== undefined) {
                    optionalBoolean(connector.visible, `${itemPath}.connector.visible`, issues);
                    optionalNonEmptyString(connector.color, `${itemPath}.connector.color`, issues, 128);
                    if (connector.width !== undefined)
                        finiteNumber(connector.width, `${itemPath}.connector.width`, issues, 0, 64);
                    validateDash(connector.dash, `${itemPath}.connector.dash`, issues);
                }
            }
            if (annotation.style !== undefined) {
                const style = closedObject$1(annotation.style, `${itemPath}.style`, ANNOTATION_STYLE_KEYS, issues);
                if (style !== undefined) {
                    for (const key of ['background', 'border', 'color'])
                        optionalString(style[key], `${itemPath}.style.${key}`, issues, 128);
                    if (style.opacity !== undefined)
                        finiteNumber(style.opacity, `${itemPath}.style.opacity`, issues, 0, 1);
                    for (const key of ['fontSize', 'maxWidth', 'padding'])
                        if (style[key] !== undefined)
                            finiteNumber(style[key], `${itemPath}.style.${key}`, issues, 1, 2000);
                    optionalEnum(style.align, `${itemPath}.style.align`, new Set(['start', 'center', 'end']), issues);
                }
            }
        });
    }
    function validateLayerReferences(spec, issues) {
        const layerIds = new Set();
        if (Array.isArray(spec.layers)) {
            spec.layers.forEach((value, index) => {
                if (!isRecord(value))
                    return;
                const layerId = value.id === undefined ? `spatial-layer-${index}` : value.id;
                if (typeof layerId !== 'string' || layerId.trim() === '')
                    return;
                if (layerIds.has(layerId)) {
                    issue(issues, `$.layers[${index}].id`, `Layer id "${layerId}" must be unique.`);
                    return;
                }
                layerIds.add(layerId);
            });
        }
        const check = (value, path) => {
            if (!isRecord(value) || typeof value.layerId !== 'string')
                return;
            if (!layerIds.has(value.layerId)) {
                issue(issues, `${path}.layerId`, `Layer id "${value.layerId}" does not exist.`);
            }
        };
        const checkUniqueIds = (value, path, label, defaultPrefix) => {
            if (!Array.isArray(value))
                return;
            const ids = new Set();
            value.forEach((entry, index) => {
                if (!isRecord(entry))
                    return;
                const id = typeof entry.id === 'string' && entry.id.trim() !== ''
                    ? entry.id
                    : `${defaultPrefix}-${index}`;
                if (ids.has(id)) {
                    issue(issues, `${path}[${index}].id`, `${label} id "${id}" must be unique after defaults are resolved.`);
                    return;
                }
                ids.add(id);
            });
        };
        if (isRecord(spec.legend)) {
            const legend = spec.legend;
            check(legend, '$.legend');
            if (Array.isArray(legend.items)) {
                legend.items.forEach((item, index) => check(item, `$.legend.items[${index}]`));
            }
            checkUniqueIds(legend.items, '$.legend.items', 'Legend item', 'item');
            if (Array.isArray(legend.items)) {
                const semanticOwners = new Set();
                legend.items.forEach((item, index) => {
                    if (!isRecord(item) || typeof item.layerId !== 'string')
                        return;
                    const owner = legend.mode === 'categories' && Object.prototype.hasOwnProperty.call(item, 'value')
                        ? JSON.stringify(['category', item.layerId, item.value])
                        : legend.mode === 'layers'
                            ? JSON.stringify(['layer', item.layerId])
                            : null;
                    if (owner === null)
                        return;
                    if (semanticOwners.has(owner))
                        issue(issues, `$.legend.items[${index}]`, 'Interactive legend items must not control the same semantic owner.');
                    else
                        semanticOwners.add(owner);
                });
            }
        }
        if (Array.isArray(spec.highlights)) {
            spec.highlights.forEach((highlight, index) => {
                if (isRecord(highlight))
                    check(highlight.target, `$.highlights[${index}].target`);
            });
        }
        if (Array.isArray(spec.annotations)) {
            spec.annotations.forEach((annotation, index) => {
                if (isRecord(annotation))
                    check(annotation.target, `$.annotations[${index}].target`);
            });
        }
        checkUniqueIds(spec.highlights, '$.highlights', 'Highlight', 'highlight');
        checkUniqueIds(spec.annotations, '$.annotations', 'Annotation', 'annotation');
    }
    function vec3Array(value, path, issues, maximum) {
        if (!Array.isArray(value)) {
            issue(issues, path, 'Must be an array.');
            return undefined;
        }
        if (value.length > maximum)
            issue(issues, path, `Must contain at most ${maximum} points.`);
        for (let index = 0; index < Math.min(value.length, maximum + 1); index += 1) {
            vec3(value[index], `${path}[${index}]`, issues);
        }
        return value;
    }
    function parallelArray(value, path, expectedLength, issues, validateEntry) {
        if (value === undefined)
            return;
        if (!Array.isArray(value)) {
            issue(issues, path, 'Must be an array.');
            return;
        }
        if (value.length !== expectedLength)
            issue(issues, path, `Must contain exactly ${expectedLength} values.`);
        for (let index = 0; index < Math.min(value.length, MAX_POINTS + 1); index += 1) {
            validateEntry(value[index], `${path}[${index}]`, issues);
        }
    }
    function validateCamera(value, path, issues) {
        if (value === undefined)
            return;
        const camera = closedObject$1(value, path, CAMERA_KEYS, issues);
        if (camera === undefined)
            return;
        optionalEnum(camera.projection, `${path}.projection`, new Set(['perspective', 'orthographic']), issues);
        if (camera.target !== undefined)
            vec3(camera.target, `${path}.target`, issues);
        if (camera.yaw !== undefined)
            finiteNumber(camera.yaw, `${path}.yaw`, issues, -1e6, 1_000_000);
        if (camera.pitch !== undefined)
            finiteNumber(camera.pitch, `${path}.pitch`, issues, -Math.PI / 2, Math.PI / 2);
        if (camera.distance !== undefined)
            finiteNumber(camera.distance, `${path}.distance`, issues, 0.0001, 1_000_000_000);
        if (camera.fov !== undefined)
            finiteNumber(camera.fov, `${path}.fov`, issues, 10, 120);
        const near = camera.near === undefined
            ? undefined
            : finiteNumber(camera.near, `${path}.near`, issues, 0.000001, 1_000_000);
        const far = camera.far === undefined
            ? undefined
            : finiteNumber(camera.far, `${path}.far`, issues, 0.00001, 1_000_000_000_000);
        if (near !== undefined && far !== undefined && far <= near)
            issue(issues, `${path}.far`, 'Must be greater than camera.near.');
    }
    function validateLighting(value, path, issues) {
        if (value === undefined)
            return;
        const lighting = closedObject$1(value, path, LIGHTING_KEYS, issues);
        if (lighting === undefined)
            return;
        if (lighting.ambient !== undefined)
            finiteNumber(lighting.ambient, `${path}.ambient`, issues, 0, 4);
        if (lighting.diffuse !== undefined)
            finiteNumber(lighting.diffuse, `${path}.diffuse`, issues, 0, 4);
        if (lighting.direction !== undefined)
            vec3(lighting.direction, `${path}.direction`, issues);
    }
    function validateInteraction(value, path, issues) {
        if (value === undefined)
            return;
        const interaction = closedObject$1(value, path, INTERACTION_KEYS, issues);
        if (interaction === undefined)
            return;
        for (const key of ['orbit', 'pan', 'zoom', 'picking']) {
            optionalBoolean(interaction[key], `${path}.${key}`, issues);
        }
        if (interaction.controls !== undefined && typeof interaction.controls !== 'boolean') {
            const controls = closedObject$1(interaction.controls, `${path}.controls`, CONTROLS_KEYS, issues);
            if (controls !== undefined)
                optionalBoolean(controls.annotations, `${path}.controls.annotations`, issues);
        }
        optionalEnum(interaction.wheel, `${path}.wheel`, new Set(['off', 'modifier', 'always']), issues);
        if (interaction.tooltip !== undefined && typeof interaction.tooltip !== 'boolean') {
            const tooltip = closedObject$1(interaction.tooltip, `${path}.tooltip`, TOOLTIP_KEYS, issues);
            if (tooltip !== undefined) {
                optionalString(tooltip.title, `${path}.tooltip.title`, issues, 256);
                if (tooltip.fields !== undefined) {
                    if (!Array.isArray(tooltip.fields) || tooltip.fields.length > 64) {
                        issue(issues, `${path}.tooltip.fields`, 'Must be an array with at most 64 fields.');
                    }
                    else {
                        tooltip.fields.forEach((field, index) => optionalString(field, `${path}.tooltip.fields[${index}]`, issues, 128));
                    }
                }
            }
        }
        if (interaction.labels !== undefined) {
            const labels = closedObject$1(interaction.labels, `${path}.labels`, CONTROL_LABEL_KEYS, issues);
            if (labels !== undefined) {
                for (const key of CONTROL_LABEL_KEYS)
                    optionalString(labels[key], `${path}.labels.${key}`, issues, 256);
            }
        }
        validateSelection(interaction.selection, `${path}.selection`, issues);
    }
    function validateAccessibility(value, path, issues) {
        if (value === undefined)
            return;
        const accessibility = closedObject$1(value, path, ACCESSIBILITY_KEYS, issues);
        if (accessibility === undefined)
            return;
        optionalString(accessibility.description, `${path}.description`, issues, 4_096);
        optionalBoolean(accessibility.table, `${path}.table`, issues);
        if (accessibility.maxRows !== undefined)
            integer$1(accessibility.maxRows, `${path}.maxRows`, issues, 1, 1_000);
        if (accessibility.navigation !== undefined && typeof accessibility.navigation !== 'boolean') {
            const navigation = closedObject$1(accessibility.navigation, `${path}.navigation`, ACCESSIBILITY_NAVIGATION_KEYS, issues);
            if (navigation !== undefined) {
                if (navigation.pageRows !== undefined)
                    integer$1(navigation.pageRows, `${path}.navigation.pageRows`, issues, 1, 1_000);
                optionalBoolean(navigation.wrap, `${path}.navigation.wrap`, issues);
            }
        }
        if (accessibility.linkedFocus !== undefined) {
            const linked = closedObject$1(accessibility.linkedFocus, `${path}.linkedFocus`, LINKED_FOCUS_KEYS, issues);
            if (linked !== undefined) {
                optionalNonEmptyString(linked.group, `${path}.linkedFocus.group`, issues, 96);
                optionalNonEmptyString(linked.key, `${path}.linkedFocus.key`, issues, 128);
                if (linked.group === undefined)
                    issue(issues, `${path}.linkedFocus.group`, 'Linked focus group is required.');
                else if (typeof linked.group === 'string' &&
                    !/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,95}$/.test(linked.group))
                    issue(issues, `${path}.linkedFocus.group`, 'Linked focus group contains unsupported identity characters.');
                if (linked.key === undefined)
                    issue(issues, `${path}.linkedFocus.key`, 'Linked focus key is required.');
                if (typeof linked.key === 'string' && UNSAFE_KEYS.has(linked.key))
                    issue(issues, `${path}.linkedFocus.key`, 'Unsafe linked focus key is forbidden.');
            }
        }
    }
    function validateSurfaceAdvanced(mark, path, issues) {
        optionalEnum(mark.normalMode, `${path}.normalMode`, new Set(['flat', 'smooth']), issues);
        if (mark.wireOverlay !== undefined && typeof mark.wireOverlay !== 'boolean') {
            const overlay = closedObject$1(mark.wireOverlay, `${path}.wireOverlay`, SURFACE_WIRE_OVERLAY_KEYS, issues);
            if (overlay !== undefined) {
                optionalColor(overlay.color, `${path}.wireOverlay.color`, issues);
                if (overlay.opacity !== undefined)
                    finiteNumber(overlay.opacity, `${path}.wireOverlay.opacity`, issues, 0, 1);
            }
        }
        if (mark.wireframe === true && mark.wireOverlay !== undefined && mark.wireOverlay !== false)
            issue(issues, `${path}.wireOverlay`, 'A wire-only surface cannot also request a wire overlay.');
        if (mark.contours === undefined)
            return;
        const contours = closedObject$1(mark.contours, `${path}.contours`, SURFACE_CONTOUR_KEYS, issues);
        if (contours === undefined)
            return;
        if (contours.levels !== undefined) {
            const levels = numberArray(contours.levels, `${path}.contours.levels`, issues, 64);
            if (levels !== undefined && levels.length === 0)
                issue(issues, `${path}.contours.levels`, 'Must contain at least one level.');
        }
        if (contours.count !== undefined)
            integer$1(contours.count, `${path}.contours.count`, issues, 1, 64);
        if (contours.levels !== undefined && contours.count !== undefined)
            issue(issues, `${path}.contours`, 'Use either explicit levels or count, not both.');
        optionalEnum(contours.projection, `${path}.contours.projection`, new Set(['surface', 'base', 'both']), issues);
        if (contours.baseHeight !== undefined)
            finiteNumber(contours.baseHeight, `${path}.contours.baseHeight`, issues);
        optionalColor(contours.color, `${path}.contours.color`, issues);
        if (contours.opacity !== undefined)
            finiteNumber(contours.opacity, `${path}.contours.opacity`, issues, 0, 1);
        if (contours.maxSegments !== undefined)
            integer$1(contours.maxSegments, `${path}.contours.maxSegments`, issues, 1, 250_000);
    }
    function validateTransferFunction(value, path, issues) {
        if (value === undefined)
            return;
        const transfer = closedObject$1(value, path, VOLUME_TRANSFER_KEYS, issues);
        if (transfer === undefined)
            return;
        optionalEnum(transfer.interpolation, `${path}.interpolation`, new Set(['linear', 'step']), issues);
        if (!Array.isArray(transfer.stops) || transfer.stops.length < 2 || transfer.stops.length > 64) {
            issue(issues, `${path}.stops`, 'Must contain 2 to 64 transfer stops.');
            return;
        }
        let previous = -1;
        transfer.stops.forEach((value, index) => {
            const stop = closedObject$1(value, `${path}.stops[${index}]`, VOLUME_TRANSFER_STOP_KEYS, issues);
            if (stop === undefined)
                return;
            const offset = finiteNumber(stop.offset, `${path}.stops[${index}].offset`, issues, 0, 1);
            if (offset !== undefined && offset <= previous)
                issue(issues, `${path}.stops[${index}].offset`, 'Transfer offsets must be strictly increasing.');
            if (offset !== undefined)
                previous = offset;
            color(stop.color, `${path}.stops[${index}].color`, issues);
            if (stop.opacity !== undefined)
                finiteNumber(stop.opacity, `${path}.stops[${index}].opacity`, issues, 0, 1);
        });
    }
    function validateVolumeAdvanced(mark, path, issues) {
        validateTransferFunction(mark.transferFunction, `${path}.transferFunction`, issues);
        if (mark.windowLevel !== undefined) {
            const windowLevel = closedObject$1(mark.windowLevel, `${path}.windowLevel`, VOLUME_WINDOW_LEVEL_KEYS, issues);
            if (windowLevel !== undefined) {
                finiteNumber(windowLevel.window, `${path}.windowLevel.window`, issues, 0.000001);
                finiteNumber(windowLevel.level, `${path}.windowLevel.level`, issues);
            }
        }
        if (mark.render !== undefined) {
            const render = closedObject$1(mark.render, `${path}.render`, VOLUME_RENDER_KEYS, issues);
            if (render !== undefined) {
                optionalEnum(render.method, `${path}.render.method`, new Set(['raycast', 'mip', 'minip', 'average']), issues);
                optionalEnum(render.axis, `${path}.render.axis`, new Set(['x', 'y', 'z']), issues);
                if (render.resolution !== undefined)
                    integerVec2(render.resolution, `${path}.render.resolution`, issues, 2, 256);
                if (render.samples !== undefined)
                    integer$1(render.samples, `${path}.render.samples`, issues, 2, 1_024);
                optionalEnum(render.interpolation, `${path}.render.interpolation`, new Set(['nearest', 'linear']), issues);
                optionalEnum(render.caps, `${path}.render.caps`, new Set(['none', 'front', 'back', 'both']), issues);
            }
        }
        if (mark.slices !== undefined) {
            if (!Array.isArray(mark.slices) || mark.slices.length === 0 || mark.slices.length > 16) {
                issue(issues, `${path}.slices`, 'Must contain 1 to 16 slice specifications.');
            }
            else {
                mark.slices.forEach((value, index) => {
                    const itemPath = `${path}.slices[${index}]`;
                    if (!isRecord(value)) {
                        issue(issues, itemPath, 'Must be an object.');
                        return;
                    }
                    if (value.type === 'orthogonal') {
                        const slice = closedObject$1(value, itemPath, VOLUME_ORTHOGONAL_SLICE_KEYS, issues);
                        if (slice === undefined)
                            return;
                        optionalEnum(slice.axis, `${itemPath}.axis`, new Set(['x', 'y', 'z']), issues);
                        finiteNumber(slice.position, `${itemPath}.position`, issues, 0, 1);
                        if (slice.resolution !== undefined)
                            integerVec2(slice.resolution, `${itemPath}.resolution`, issues, 2, 256);
                        optionalEnum(slice.interpolation, `${itemPath}.interpolation`, new Set(['nearest', 'linear']), issues);
                        if (slice.opacity !== undefined)
                            finiteNumber(slice.opacity, `${itemPath}.opacity`, issues, 0, 1);
                        return;
                    }
                    if (value.type !== 'oblique') {
                        issue(issues, `${itemPath}.type`, 'Must be one of: orthogonal, oblique.');
                        return;
                    }
                    const slice = closedObject$1(value, itemPath, VOLUME_OBLIQUE_SLICE_KEYS, issues);
                    if (slice === undefined)
                        return;
                    vec3(slice.origin, `${itemPath}.origin`, issues);
                    if (vec3(slice.normal, `${itemPath}.normal`, issues)) {
                        const normal = slice.normal;
                        if (Math.hypot(normal[0], normal[1], normal[2]) <= 1e-12)
                            issue(issues, `${itemPath}.normal`, 'Must have non-zero length.');
                    }
                    if (slice.up !== undefined && vec3(slice.up, `${itemPath}.up`, issues)) {
                        const up = slice.up;
                        if (Math.hypot(up[0], up[1], up[2]) <= 1e-12)
                            issue(issues, `${itemPath}.up`, 'Must have non-zero length.');
                    }
                    if (slice.size !== undefined)
                        positiveVec2(slice.size, `${itemPath}.size`, issues);
                    if (slice.resolution !== undefined)
                        integerVec2(slice.resolution, `${itemPath}.resolution`, issues, 2, 256);
                    optionalEnum(slice.interpolation, `${itemPath}.interpolation`, new Set(['nearest', 'linear']), issues);
                    if (slice.opacity !== undefined)
                        finiteNumber(slice.opacity, `${itemPath}.opacity`, issues, 0, 1);
                });
            }
        }
        if (mark.mode === 'isosurface' && (mark.render !== undefined || mark.slices !== undefined))
            issue(issues, path, 'Ray projection and slices require volume mode, not isosurface mode.');
    }
    function validateSurfaceData(value, path, mode, issues) {
        const data = objectValue(value, path, issues);
        if (data === undefined)
            return;
        const meshMode = mode === 'mesh' || (mode === undefined && 'positions' in data);
        const keys = meshMode ? MESH_KEYS : SURFACE_GRID_KEYS;
        for (const key of Object.keys(data))
            if (!keys.has(key))
                issue(issues, `${path}.${key}`, `Unknown property "${key}".`);
        if (meshMode) {
            const positions = vec3Array(data.positions, `${path}.positions`, issues, MAX_POINTS);
            if (positions !== undefined && positions.length === 0)
                issue(issues, `${path}.positions`, 'Must not be empty.');
            if (!Array.isArray(data.triangles)) {
                issue(issues, `${path}.triangles`, 'Must be an array.');
            }
            else {
                if (data.triangles.length > MAX_TRIANGLES)
                    issue(issues, `${path}.triangles`, `Must contain at most ${MAX_TRIANGLES} triangles.`);
                data.triangles.slice(0, MAX_TRIANGLES + 1).forEach((triangle, index) => {
                    if (!Array.isArray(triangle) || triangle.length !== 3) {
                        issue(issues, `${path}.triangles[${index}]`, 'Must be a three-index tuple.');
                        return;
                    }
                    triangle.forEach((entry, entryIndex) => {
                        const maximum = Math.max(0, (positions?.length ?? 1) - 1);
                        integer$1(entry, `${path}.triangles[${index}][${entryIndex}]`, issues, 0, maximum);
                    });
                });
            }
            parallelArray(data.normals, `${path}.normals`, positions?.length ?? 0, issues, (entry, entryPath, target) => {
                vec3(entry, entryPath, target);
            });
            parallelArray(data.colors, `${path}.colors`, positions?.length ?? 0, issues, (entry, entryPath, target) => {
                color(entry, entryPath, target);
            });
            parallelArray(data.labels, `${path}.labels`, positions?.length ?? 0, issues, (entry, entryPath, target) => {
                optionalString(entry, entryPath, target, 1_024);
            });
            return;
        }
        const rows = integer$1(data.rows, `${path}.rows`, issues, 2, 2_048);
        const columns = integer$1(data.columns, `${path}.columns`, issues, 2, 2_048);
        const count = rows === undefined || columns === undefined ? undefined : rows * columns;
        if (count !== undefined && count > MAX_POINTS)
            issue(issues, path, `Grid may contain at most ${MAX_POINTS} points.`);
        numberArray(data.z, `${path}.z`, issues, MAX_POINTS, count);
        if (data.x !== undefined)
            numberArray(data.x, `${path}.x`, issues, 2_048, columns);
        if (data.y !== undefined)
            numberArray(data.y, `${path}.y`, issues, 2_048, rows);
        if (data.values !== undefined)
            numberArray(data.values, `${path}.values`, issues, MAX_POINTS, count);
    }
    function validateVolumeData(value, path, issues) {
        const data = closedObject$1(value, path, VOLUME_DATA_KEYS, issues);
        if (data === undefined)
            return;
        let dimensions;
        if (vec3(data.dimensions, `${path}.dimensions`, issues)) {
            dimensions = data.dimensions;
            dimensions.forEach((entry, index) => integer$1(entry, `${path}.dimensions[${index}]`, issues, 2, 256));
        }
        const count = dimensions?.reduce((total, entry) => total * entry, 1);
        if (count !== undefined && count > MAX_VOLUME_CELLS)
            issue(issues, `${path}.dimensions`, `Volume may contain at most ${MAX_VOLUME_CELLS} cells.`);
        numberArray(data.values, `${path}.values`, issues, MAX_VOLUME_CELLS, count);
        if (data.origin !== undefined)
            vec3(data.origin, `${path}.origin`, issues);
        if (data.spacing !== undefined && vec3(data.spacing, `${path}.spacing`, issues)) {
            data.spacing.forEach((entry, index) => finiteNumber(entry, `${path}.spacing[${index}]`, issues, 0.000001, 1_000_000_000));
        }
    }
    function validateVectorData(value, path, mode, issues) {
        const candidate = objectValue(value, path, issues);
        if (candidate === undefined)
            return;
        const fieldMode = 'dimensions' in candidate;
        if (fieldMode) {
            const data = closedObject$1(candidate, path, VECTOR_FIELD_DATA_KEYS, issues);
            if (data === undefined)
                return;
            let dimensions;
            if (vec3(data.dimensions, `${path}.dimensions`, issues)) {
                dimensions = data.dimensions;
                dimensions.forEach((entry, index) => integer$1(entry, `${path}.dimensions[${index}]`, issues, 2, 128));
            }
            const count = dimensions?.reduce((total, entry) => total * entry, 1);
            if (count !== undefined && count > MAX_POINTS)
                issue(issues, `${path}.dimensions`, `Vector field may contain at most ${MAX_POINTS} cells.`);
            vec3Array(data.vectors, `${path}.vectors`, issues, MAX_POINTS);
            if (Array.isArray(data.vectors) && count !== undefined && data.vectors.length !== count)
                issue(issues, `${path}.vectors`, `Must contain exactly ${count} vectors.`);
            if (data.origin !== undefined)
                vec3(data.origin, `${path}.origin`, issues);
            if (data.spacing !== undefined && vec3(data.spacing, `${path}.spacing`, issues)) {
                data.spacing.forEach((entry, index) => finiteNumber(entry, `${path}.spacing[${index}]`, issues, 0.000001, 1_000_000_000));
            }
            if (data.seeds !== undefined)
                vec3Array(data.seeds, `${path}.seeds`, issues, MAX_PATHS);
            let generatedSeeds = 0;
            if (data.seedGrid !== undefined) {
                const grid = closedObject$1(data.seedGrid, `${path}.seedGrid`, VECTOR_SEED_GRID_KEYS, issues);
                if (grid !== undefined && vec3(grid.dimensions, `${path}.seedGrid.dimensions`, issues)) {
                    const parsed = grid.dimensions.map((entry, index) => integer$1(entry, `${path}.seedGrid.dimensions[${index}]`, issues, 1, 16));
                    if (parsed.every((entry) => entry !== undefined)) {
                        generatedSeeds = parsed.reduce((total, entry) => total * entry, 1);
                        if (generatedSeeds > MAX_PATHS)
                            issue(issues, `${path}.seedGrid.dimensions`, `May generate at most ${MAX_PATHS} seeds.`);
                    }
                }
                if (grid?.jitter !== undefined)
                    finiteNumber(grid.jitter, `${path}.seedGrid.jitter`, issues, 0, 0.49);
                if (grid?.seed !== undefined)
                    integer$1(grid.seed, `${path}.seedGrid.seed`, issues, 0, 4_294_967_295);
            }
            const seedCount = (Array.isArray(data.seeds) ? data.seeds.length : 0) + generatedSeeds;
            for (const [key, validator] of [
                [
                    'labels',
                    (entry, entryPath, target) => optionalString(entry, entryPath, target, 1_024),
                ],
                [
                    'colors',
                    (entry, entryPath, target) => color(entry, entryPath, target),
                ],
            ]) {
                const entries = data[key];
                if (entries === undefined)
                    continue;
                if (!Array.isArray(entries) || entries.length > MAX_PATHS)
                    issue(issues, `${path}.${key}`, `Must contain at most ${MAX_PATHS} entries.`);
                else {
                    entries.forEach((entry, index) => validator(entry, `${path}.${key}[${index}]`, issues));
                    if (seedCount > 0 && entries.length !== seedCount)
                        issue(issues, `${path}.${key}`, `Must contain exactly ${seedCount} entries for authored seeds.`);
                }
            }
            if (mode === 'cone')
                issue(issues, path, 'Raw vector fields require streamtube mode.');
            return;
        }
        const streamMode = mode === 'streamtube' || (mode === undefined && 'paths' in candidate);
        const data = closedObject$1(candidate, path, streamMode ? STREAM_DATA_KEYS : CONE_DATA_KEYS, issues);
        if (data === undefined)
            return;
        if (streamMode) {
            if (!Array.isArray(data.paths)) {
                issue(issues, `${path}.paths`, 'Must be an array.');
                return;
            }
            const paths = data.paths;
            if (paths.length === 0 || paths.length > MAX_PATHS)
                issue(issues, `${path}.paths`, `Must contain 1 to ${MAX_PATHS} paths.`);
            let total = 0;
            paths.slice(0, MAX_PATHS + 1).forEach((entry, index) => {
                const points = vec3Array(entry, `${path}.paths[${index}]`, issues, MAX_POINTS);
                total += points?.length ?? 0;
                if (points !== undefined && points.length < 2)
                    issue(issues, `${path}.paths[${index}]`, 'Must contain at least two points.');
            });
            if (total > MAX_POINTS)
                issue(issues, `${path}.paths`, `All paths together may contain at most ${MAX_POINTS} points.`);
            if (data.magnitudes !== undefined) {
                if (!Array.isArray(data.magnitudes) || data.magnitudes.length !== paths.length) {
                    issue(issues, `${path}.magnitudes`, 'Must contain one magnitude array per path.');
                }
                else {
                    data.magnitudes.forEach((entry, index) => {
                        const pathEntry = paths[index];
                        const expected = Array.isArray(pathEntry) ? pathEntry.length : undefined;
                        numberArray(entry, `${path}.magnitudes[${index}]`, issues, MAX_POINTS, expected);
                    });
                }
            }
            parallelArray(data.labels, `${path}.labels`, paths.length, issues, (entry, entryPath, target) => optionalString(entry, entryPath, target, 1_024));
            parallelArray(data.colors, `${path}.colors`, paths.length, issues, (entry, entryPath, target) => {
                color(entry, entryPath, target);
            });
            return;
        }
        const origins = vec3Array(data.origins, `${path}.origins`, issues, MAX_VECTOR_COUNT);
        const vectors = vec3Array(data.vectors, `${path}.vectors`, issues, MAX_VECTOR_COUNT);
        const count = origins?.length ?? 0;
        if (count === 0)
            issue(issues, `${path}.origins`, 'Must not be empty.');
        if (origins !== undefined && vectors !== undefined && vectors.length !== origins.length)
            issue(issues, `${path}.vectors`, `Must contain exactly ${origins.length} vectors.`);
        parallelArray(data.labels, `${path}.labels`, count, issues, (entry, entryPath, target) => optionalString(entry, entryPath, target, 1_024));
        parallelArray(data.colors, `${path}.colors`, count, issues, (entry, entryPath, target) => {
            color(entry, entryPath, target);
        });
    }
    function validateScatterData(value, path, issues) {
        const data = closedObject$1(value, path, SCATTER_DATA_KEYS, issues);
        if (data === undefined)
            return;
        const positions = vec3Array(data.positions, `${path}.positions`, issues, MAX_POINTS);
        const count = positions?.length ?? 0;
        if (count === 0)
            issue(issues, `${path}.positions`, 'Must not be empty.');
        parallelArray(data.values, `${path}.values`, count, issues, (entry, entryPath, target) => {
            finiteNumber(entry, entryPath, target);
        });
        parallelArray(data.sizes, `${path}.sizes`, count, issues, (entry, entryPath, target) => {
            finiteNumber(entry, entryPath, target, 0, 1_000);
        });
        parallelArray(data.colors, `${path}.colors`, count, issues, (entry, entryPath, target) => {
            color(entry, entryPath, target);
        });
        parallelArray(data.labels, `${path}.labels`, count, issues, (entry, entryPath, target) => optionalString(entry, entryPath, target, 1_024));
    }
    function validateGlobeData(value, path, issues) {
        if (value === undefined)
            return;
        const data = closedObject$1(value, path, GLOBE_DATA_KEYS, issues);
        if (data === undefined)
            return;
        if (data.points !== undefined) {
            if (!Array.isArray(data.points) || data.points.length > MAX_GLOBE_ITEMS) {
                issue(issues, `${path}.points`, `Must be an array with at most ${MAX_GLOBE_ITEMS} points.`);
            }
            else {
                data.points.forEach((value, index) => {
                    const point = closedObject$1(value, `${path}.points[${index}]`, GLOBE_POINT_KEYS, issues);
                    if (point === undefined)
                        return;
                    finiteNumber(point.longitude, `${path}.points[${index}].longitude`, issues, -180, 180);
                    finiteNumber(point.latitude, `${path}.points[${index}].latitude`, issues, -90, 90);
                    if (point.value !== undefined)
                        finiteNumber(point.value, `${path}.points[${index}].value`, issues);
                    optionalString(point.label, `${path}.points[${index}].label`, issues, 1_024);
                    optionalColor(point.color, `${path}.points[${index}].color`, issues);
                    if (point.size !== undefined)
                        finiteNumber(point.size, `${path}.points[${index}].size`, issues, 0, 1_000);
                });
            }
        }
        if (data.routes !== undefined) {
            if (!Array.isArray(data.routes) || data.routes.length > MAX_GLOBE_ITEMS) {
                issue(issues, `${path}.routes`, `Must be an array with at most ${MAX_GLOBE_ITEMS} routes.`);
            }
            else {
                data.routes.forEach((value, index) => {
                    const route = closedObject$1(value, `${path}.routes[${index}]`, GLOBE_ROUTE_KEYS, issues);
                    if (route === undefined)
                        return;
                    lonLat(route.from, `${path}.routes[${index}].from`, issues);
                    lonLat(route.to, `${path}.routes[${index}].to`, issues);
                    if (route.value !== undefined)
                        finiteNumber(route.value, `${path}.routes[${index}].value`, issues);
                    optionalString(route.label, `${path}.routes[${index}].label`, issues, 1_024);
                    optionalColor(route.color, `${path}.routes[${index}].color`, issues);
                });
            }
        }
    }
    function validateVectorAdvanced(mark, path, issues) {
        optionalEnum(mark.magnitudeEncoding, `${path}.magnitudeEncoding`, new Set(['none', 'color', 'radius', 'color-radius']), issues);
        if (mark.integration === undefined)
            return;
        const integration = closedObject$1(mark.integration, `${path}.integration`, VECTOR_INTEGRATION_KEYS, issues);
        if (integration === undefined)
            return;
        optionalEnum(integration.direction, `${path}.integration.direction`, new Set(['forward', 'backward', 'both']), issues);
        const minStep = integration.minStep === undefined
            ? undefined
            : finiteNumber(integration.minStep, `${path}.integration.minStep`, issues, 0.000000001);
        const initialStep = integration.initialStep === undefined
            ? undefined
            : finiteNumber(integration.initialStep, `${path}.integration.initialStep`, issues, 0.000000001);
        const maxStep = integration.maxStep === undefined
            ? undefined
            : finiteNumber(integration.maxStep, `${path}.integration.maxStep`, issues, 0.000000001);
        if (minStep !== undefined && maxStep !== undefined && minStep > maxStep)
            issue(issues, `${path}.integration.maxStep`, 'Must be greater than or equal to minStep.');
        if (initialStep !== undefined && minStep !== undefined && initialStep < minStep)
            issue(issues, `${path}.integration.initialStep`, 'Must be greater than or equal to minStep.');
        if (initialStep !== undefined && maxStep !== undefined && initialStep > maxStep)
            issue(issues, `${path}.integration.initialStep`, 'Must be less than or equal to maxStep.');
        if (integration.tolerance !== undefined)
            finiteNumber(integration.tolerance, `${path}.integration.tolerance`, issues, 1e-12, 1_000_000);
        if (integration.maxSteps !== undefined)
            integer$1(integration.maxSteps, `${path}.integration.maxSteps`, issues, 1, 4_096);
        if (integration.maxLength !== undefined)
            finiteNumber(integration.maxLength, `${path}.integration.maxLength`, issues, 0.000001);
        if (integration.minMagnitude !== undefined)
            finiteNumber(integration.minMagnitude, `${path}.integration.minMagnitude`, issues, 0);
    }
    function validateMarkAndData(value, data, path, issues) {
        const mark = objectValue(value, `${path}.mark`, issues);
        if (mark === undefined)
            return;
        const type = mark.type;
        if (typeof type !== 'string' ||
            !new Set(['surface', 'volume', 'vector', 'scatter', 'globe']).has(type)) {
            issue(issues, `${path}.mark.type`, 'Must be one of: surface, volume, vector, scatter, globe.');
            return;
        }
        const markKeys = {
            surface: SURFACE_MARK_KEYS,
            volume: VOLUME_MARK_KEYS,
            vector: VECTOR_MARK_KEYS,
            scatter: SCATTER_MARK_KEYS,
            globe: GLOBE_MARK_KEYS,
        }[type];
        for (const key of Object.keys(mark))
            if (!markKeys.has(key))
                issue(issues, `${path}.mark.${key}`, `Unknown property "${key}".`);
        if (type === 'surface') {
            optionalEnum(mark.mode, `${path}.mark.mode`, new Set(['surface', 'mesh']), issues);
            optionalColor(mark.color, `${path}.mark.color`, issues);
            if (mark.opacity !== undefined)
                finiteNumber(mark.opacity, `${path}.mark.opacity`, issues, 0, 1);
            optionalBoolean(mark.wireframe, `${path}.mark.wireframe`, issues);
            validateSurfaceAdvanced(mark, `${path}.mark`, issues);
            validateSurfaceData(data, `${path}.data`, mark.mode, issues);
        }
        else if (type === 'volume') {
            optionalEnum(mark.mode, `${path}.mark.mode`, new Set(['volume', 'isosurface']), issues);
            if (mark.isoValue !== undefined)
                finiteNumber(mark.isoValue, `${path}.mark.isoValue`, issues);
            if (mark.opacity !== undefined)
                finiteNumber(mark.opacity, `${path}.mark.opacity`, issues, 0, 1);
            if (mark.pointSize !== undefined)
                finiteNumber(mark.pointSize, `${path}.mark.pointSize`, issues, 0.1, 256);
            if (mark.maxSamples !== undefined)
                integer$1(mark.maxSamples, `${path}.mark.maxSamples`, issues, 1, 250_000);
            optionalColor(mark.colorLow, `${path}.mark.colorLow`, issues);
            optionalColor(mark.colorHigh, `${path}.mark.colorHigh`, issues);
            validateVolumeAdvanced(mark, `${path}.mark`, issues);
            validateVolumeData(data, `${path}.data`, issues);
        }
        else if (type === 'vector') {
            optionalEnum(mark.mode, `${path}.mark.mode`, new Set(['cone', 'streamtube']), issues);
            optionalColor(mark.color, `${path}.mark.color`, issues);
            if (mark.opacity !== undefined)
                finiteNumber(mark.opacity, `${path}.mark.opacity`, issues, 0, 1);
            if (mark.radius !== undefined)
                finiteNumber(mark.radius, `${path}.mark.radius`, issues, 0.000001, 1_000_000);
            if (mark.scale !== undefined)
                finiteNumber(mark.scale, `${path}.mark.scale`, issues, 0.000001, 1_000_000);
            if (mark.segments !== undefined)
                integer$1(mark.segments, `${path}.mark.segments`, issues, 5, 48);
            validateVectorAdvanced(mark, `${path}.mark`, issues);
            validateVectorData(data, `${path}.data`, mark.mode, issues);
        }
        else if (type === 'scatter') {
            optionalColor(mark.color, `${path}.mark.color`, issues);
            if (mark.opacity !== undefined)
                finiteNumber(mark.opacity, `${path}.mark.opacity`, issues, 0, 1);
            if (mark.pointSize !== undefined)
                finiteNumber(mark.pointSize, `${path}.mark.pointSize`, issues, 0.1, 256);
            validateScatterData(data, `${path}.data`, issues);
        }
        else {
            if (data !== undefined)
                validateGlobeData(data, `${path}.data`, issues);
            for (const key of [
                'landColor',
                'oceanColor',
                'borderColor',
                'pointColor',
                'routeColor',
            ]) {
                optionalColor(mark[key], `${path}.mark.${key}`, issues);
            }
            if (mark.radius !== undefined)
                finiteNumber(mark.radius, `${path}.mark.radius`, issues, 0.000001, 1_000_000);
            if (mark.opacity !== undefined)
                finiteNumber(mark.opacity, `${path}.mark.opacity`, issues, 0, 1);
            if (mark.routeSegments !== undefined)
                integer$1(mark.routeSegments, `${path}.mark.routeSegments`, issues, 8, 128);
        }
    }
    function scanPortable(value, path, issues, ancestors, state, depth) {
        state.nodes += 1;
        if (state.nodes > MAX_PORTABLE_NODES) {
            if (state.nodes === MAX_PORTABLE_NODES + 1)
                issue(issues, path, `Specification exceeds ${MAX_PORTABLE_NODES} JSON values.`);
            return;
        }
        if (depth > MAX_PORTABLE_DEPTH) {
            issue(issues, path, `Specification nesting exceeds ${MAX_PORTABLE_DEPTH} levels.`);
            return;
        }
        if (value === undefined ||
            typeof value === 'function' ||
            typeof value === 'symbol' ||
            typeof value === 'bigint') {
            issue(issues, path, 'Must contain only JSON-serializable values.');
            return;
        }
        if (typeof value === 'number' && !Number.isFinite(value)) {
            issue(issues, path, 'Numbers must be finite.');
            return;
        }
        if (typeof value === 'string' && value.length > MAX_STRING_LENGTH) {
            issue(issues, path, `Strings may contain at most ${MAX_STRING_LENGTH} characters.`);
            return;
        }
        if (value === null || typeof value !== 'object')
            return;
        if (ancestors.has(value)) {
            issue(issues, path, 'Circular references are forbidden.');
            return;
        }
        ancestors.add(value);
        if (Array.isArray(value)) {
            for (let index = 0; index < value.length && state.nodes <= MAX_PORTABLE_NODES; index += 1) {
                scanPortable(value[index], `${path}[${index}]`, issues, ancestors, state, depth + 1);
            }
        }
        else if (!isRecord(value)) {
            issue(issues, path, 'Only plain JSON objects are allowed.');
        }
        else {
            for (const [key, entry] of Object.entries(value)) {
                if (UNSAFE_KEYS.has(key))
                    issue(issues, `${path}.${key}`, `Unsafe key "${key}" is forbidden.`);
                else
                    scanPortable(entry, `${path}.${key}`, issues, ancestors, state, depth + 1);
            }
        }
        ancestors.delete(value);
    }
    function validateSpatialSpec(input) {
        const issues = [];
        scanPortable(input, '$', issues, new WeakSet(), { nodes: 0 }, 0);
        const spec = closedObject$1(input, '$', ROOT_KEYS, issues);
        if (spec === undefined)
            return issues;
        if (spec.specVersion !== undefined && spec.specVersion !== '0.1')
            issue(issues, '$.specVersion', 'Only SpatialSpec version "0.1" is supported.');
        optionalString(spec.title, '$.title', issues, 512);
        validateTheme(spec.theme, '$.theme', issues);
        optionalString(spec.ariaLabel, '$.ariaLabel', issues, 1_024);
        optionalColor(spec.background, '$.background', issues);
        validateCamera(spec.camera, '$.camera', issues);
        validateLighting(spec.lighting, '$.lighting', issues);
        validateInteraction(spec.interaction, '$.interaction', issues);
        validateAccessibility(spec.accessibility, '$.accessibility', issues);
        validateLegend(spec.legend, '$.legend', issues);
        validateHighlights(spec.highlights, '$.highlights', issues);
        validateAnnotations(spec.annotations, '$.annotations', issues);
        if (!Array.isArray(spec.layers) || spec.layers.length === 0 || spec.layers.length > MAX_LAYERS) {
            issue(issues, '$.layers', `Must be an array with 1 to ${MAX_LAYERS} layers.`);
        }
        else {
            spec.layers.forEach((value, index) => {
                const layerPath = `$.layers[${index}]`;
                const layer = closedObject$1(value, layerPath, LAYER_KEYS, issues);
                if (layer === undefined)
                    return;
                optionalIdentifier(layer.id, `${layerPath}.id`, issues);
                optionalString(layer.name, `${layerPath}.name`, issues, 256);
                validateMarkAndData(layer.mark, layer.data, layerPath, issues);
            });
        }
        validateLayerReferences(spec, issues);
        if (issues.length === 0) {
            for (const violation of spatialOutputBudgetViolations(estimateSpatialOutput(spec))) {
                issue(issues, '$.layers', `Derived output ${violation.resource} (${violation.actual}) exceeds the safe limit (${violation.maximum}).`);
            }
        }
        return issues;
    }
    function assertValidSpatialSpec(input) {
        const issues = validateSpatialSpec(input);
        if (issues.length === 0)
            return;
        const first = issues[0];
        const error = new TypeError(`Invalid SpatialSpec at ${first?.path ?? '$'}: ${first?.message ?? 'Unknown validation error.'}`);
        Object.assign(error, { code: 'INVALID_SPATIAL_SPEC', issues });
        throw error;
    }

    const namedColors = {
        black: [0, 0, 0, 1],
        blue: [0.145, 0.388, 0.922, 1],
        cyan: [0.024, 0.714, 0.831, 1],
        gray: [0.42, 0.45, 0.5, 1],
        green: [0.063, 0.725, 0.506, 1],
        orange: [0.961, 0.62, 0.043, 1],
        red: [0.88, 0.188, 0.247, 1],
        transparent: [0, 0, 0, 0],
        white: [1, 1, 1, 1],
        yellow: [0.984, 0.749, 0.141, 1],
    };
    function fail(message) {
        throw new Error(`Invalid spatial chart: ${message}`);
    }
    function finite(value, label) {
        if (typeof value !== 'number' || !Number.isFinite(value))
            fail(`${label} must be finite.`);
        return value;
    }
    function positiveInteger(value, label) {
        if (!Number.isInteger(value) || value <= 0)
            fail(`${label} must be a positive integer.`);
        return value;
    }
    function validVec3(value, label) {
        return [
            finite(value[0], `${label}[0]`),
            finite(value[1], `${label}[1]`),
            finite(value[2], `${label}[2]`),
        ];
    }
    function parseRgbChannel(value) {
        return clamp(Number(value) / 255, 0, 1);
    }
    function spatialColor(color, opacity = 1) {
        const boundedOpacity = clamp(Number.isFinite(opacity) ? opacity : 1, 0, 1);
        if (color === undefined)
            return [0.31, 0.275, 0.898, boundedOpacity];
        if (typeof color !== 'string') {
            const values = color;
            const scale = values.some((value) => value > 1) ? 255 : 1;
            return [
                clamp((values[0] ?? 0) / scale, 0, 1),
                clamp((values[1] ?? 0) / scale, 0, 1),
                clamp((values[2] ?? 0) / scale, 0, 1),
                clamp((values[3] ?? 1) / (values[3] !== undefined && values[3] > 1 ? 255 : 1), 0, 1) *
                    boundedOpacity,
            ];
        }
        const input = color.trim().toLowerCase();
        const named = namedColors[input];
        if (named !== undefined)
            return [named[0], named[1], named[2], named[3] * boundedOpacity];
        const short = /^#([0-9a-f]{3,4})$/i.exec(input)?.[1];
        if (short !== undefined) {
            const values = [...short].map((digit) => Number.parseInt(`${digit}${digit}`, 16) / 255);
            return [values[0], values[1], values[2], (values[3] ?? 1) * boundedOpacity];
        }
        const full = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(input);
        if (full !== null) {
            const channels = full[1];
            return [
                Number.parseInt(channels.slice(0, 2), 16) / 255,
                Number.parseInt(channels.slice(2, 4), 16) / 255,
                Number.parseInt(channels.slice(4, 6), 16) / 255,
                (full[2] === undefined ? 1 : Number.parseInt(full[2], 16) / 255) * boundedOpacity,
            ];
        }
        const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/.exec(input);
        if (rgb !== null) {
            return [
                parseRgbChannel(rgb[1]),
                parseRgbChannel(rgb[2]),
                parseRgbChannel(rgb[3]),
                clamp(Number(rgb[4] ?? 1), 0, 1) * boundedOpacity,
            ];
        }
        return [0.31, 0.275, 0.898, boundedOpacity];
    }
    function interpolateColor(low, high, amount) {
        const t = clamp(amount, 0, 1);
        return [
            low[0] + (high[0] - low[0]) * t,
            low[1] + (high[1] - low[1]) * t,
            low[2] + (high[2] - low[2]) * t,
            low[3] + (high[3] - low[3]) * t,
        ];
    }
    function usesThemeContinuousScale(theme) {
        return (theme.colors.paletteMode === 'ggplot2-hue' || theme.colors.continuousInterpolation !== undefined);
    }
    function pushVec3(output, value) {
        output.push(value[0], value[1], value[2]);
    }
    function pushColor(output, value) {
        output.push(value[0], value[1], value[2], value[3]);
    }
    function repeatedValues(count, value) {
        const output = new Float32Array(count * value.length);
        for (let index = 0; index < count; index += 1)
            output.set(value, index * value.length);
        return output;
    }
    function layerThemeColor(theme, layerIndex, layerCount) {
        return categoricalColor(theme, layerIndex, layerCount);
    }
    function usesLegacySpatialDefaults(theme) {
        return theme.name === defaultThemeId;
    }
    function triangleNormals(positions, indices) {
        const normals = new Float32Array(positions.length);
        const triangleCount = indices === undefined ? positions.length / 9 : indices.length / 3;
        for (let triangle = 0; triangle < triangleCount; triangle += 1) {
            const a = indices?.[triangle * 3] ?? triangle * 3;
            const b = indices?.[triangle * 3 + 1] ?? triangle * 3 + 1;
            const c = indices?.[triangle * 3 + 2] ?? triangle * 3 + 2;
            const pa = [positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2]];
            const pb = [positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]];
            const pc = [positions[c * 3], positions[c * 3 + 1], positions[c * 3 + 2]];
            const normal = normalize3(cross3(subtract3(pb, pa), subtract3(pc, pa)), [0, 1, 0]);
            for (const vertex of [a, b, c]) {
                normals[vertex * 3] = (normals[vertex * 3] ?? 0) + normal[0];
                normals[vertex * 3 + 1] = (normals[vertex * 3 + 1] ?? 0) + normal[1];
                normals[vertex * 3 + 2] = (normals[vertex * 3 + 2] ?? 0) + normal[2];
            }
        }
        for (let index = 0; index < normals.length; index += 3) {
            const normal = normalize3([normals[index], normals[index + 1], normals[index + 2]]);
            normals.set(normal, index);
        }
        return normals;
    }
    function layerId(layer, index) {
        return layer.id?.trim() || `spatial-layer-${index}`;
    }
    function isMeshData(data) {
        return 'positions' in data;
    }
    function mappedVertexColors(colors, sourceIndices) {
        const output = new Float32Array(sourceIndices.length * 4);
        for (const [index, source] of sourceIndices.entries()) {
            output.set(colors.subarray(source * 4, source * 4 + 4), index * 4);
        }
        return output;
    }
    function contourLevels(values, contours) {
        if (contours.levels !== undefined)
            return [...new Set(contours.levels)].sort((left, right) => left - right);
        let minimum = Number.POSITIVE_INFINITY;
        let maximum = Number.NEGATIVE_INFINITY;
        for (const value of values) {
            minimum = Math.min(minimum, value);
            maximum = Math.max(maximum, value);
        }
        if (minimum === maximum)
            return [];
        const count = Math.max(1, Math.min(64, Math.trunc(contours.count ?? 8)));
        return Array.from({ length: count }, (_, index) => minimum + ((index + 1) / (count + 1)) * (maximum - minimum));
    }
    function compileSurfaceContours(id, layerIndex, positions, triangleIndices, values, contours, theme) {
        const projection = contours.projection ?? 'base';
        const projections = projection === 'both' ? ['surface', 'base'] : [projection];
        const maximum = Math.max(1, Math.trunc(contours.maxSegments ?? 100_000));
        const sourceMaximum = Math.max(1, Math.floor(maximum / projections.length));
        const segments = extractSurfaceContourSegments(positions, triangleIndices, values, {
            levels: contourLevels(values, contours),
            maxSegments: sourceMaximum,
        });
        if (segments.length === 0)
            return [];
        let minimumHeight = Number.POSITIVE_INFINITY;
        for (let index = 1; index < positions.length; index += 3)
            minimumHeight = Math.min(minimumHeight, positions[index]);
        const color = spatialColor(contours.color ?? (usesLegacySpatialDefaults(theme) ? '#111827' : theme.colors.text), contours.opacity ?? 0.92);
        return projections.map((target) => {
            const linePositions = [];
            const picks = [];
            const baseHeight = contours.baseHeight ?? minimumHeight;
            for (const [datumIndex, segment] of segments.entries()) {
                const from = target === 'base' ? [segment.from[0], baseHeight, segment.from[2]] : segment.from;
                const to = target === 'base' ? [segment.to[0], baseHeight, segment.to[2]] : segment.to;
                pushVec3(linePositions, from);
                pushVec3(linePositions, to);
                picks.push({
                    layerId: id,
                    layerIndex,
                    datumIndex,
                    nodeId: `${id}:contour:${target}:${datumIndex}`,
                    position: scale3(add3(from, to), 0.5),
                    datum: {
                        level: segment.level,
                        projection: target,
                        sourceTriangle: segment.triangleIndex,
                    },
                });
            }
            const outputPositions = new Float32Array(linePositions);
            return {
                id: `${id}:contour:${target}`,
                primitive: 'lines',
                positions: outputPositions,
                normals: repeatedValues(outputPositions.length / 3, [0, 1, 0]),
                colors: repeatedValues(outputPositions.length / 3, color),
                sizes: new Float32Array(outputPositions.length / 3).fill(1),
                picks,
                role: 'contour',
                provenance: {
                    family: 'surface',
                    operation: 'triangle-contour-projection',
                    sourceElements: triangleIndices.length / 3,
                    derivedElements: segments.length,
                    bounded: true,
                    parameters: { projection: target, levels: contourLevels(values, contours) },
                },
            };
        });
    }
    function compileSurfaceGeometry(id, layerIndex, positions, colors, triangleIndices, wireIndices, picks, layer, theme, suppliedNormals) {
        if (layer.mark.wireframe === true) {
            return [
                {
                    id,
                    primitive: 'lines',
                    positions,
                    normals: suppliedNormals ?? triangleNormals(positions, triangleIndices),
                    colors,
                    sizes: new Float32Array(positions.length / 3).fill(1),
                    indices: wireIndices,
                    picks,
                    role: 'primary',
                    provenance: {
                        family: 'surface',
                        operation: 'wireframe-only',
                        sourceElements: triangleIndices.length / 3,
                        derivedElements: wireIndices.length / 2,
                        bounded: true,
                    },
                },
            ];
        }
        const normalMode = layer.mark.normalMode ?? 'smooth';
        const normalGeometry = computeSurfaceNormalGeometry(positions, triangleIndices, normalMode);
        const fillColors = mappedVertexColors(colors, normalGeometry.sourceVertexIndices);
        const fill = {
            id,
            primitive: 'triangles',
            positions: normalGeometry.positions,
            normals: normalMode === 'smooth' && suppliedNormals !== undefined
                ? suppliedNormals
                : normalGeometry.normals,
            colors: fillColors,
            sizes: new Float32Array(normalGeometry.positions.length / 3).fill(1),
            ...(normalGeometry.indices === undefined ? {} : { indices: normalGeometry.indices }),
            picks,
            role: 'primary',
            provenance: {
                family: 'surface',
                operation: `${normalMode}-normal-surface`,
                sourceElements: triangleIndices.length / 3,
                derivedElements: normalGeometry.positions.length / 3,
                bounded: true,
                parameters: { normalMode },
            },
        };
        if (layer.mark.wireOverlay === undefined || layer.mark.wireOverlay === false)
            return [fill];
        const overlay = layer.mark.wireOverlay === true ? {} : layer.mark.wireOverlay;
        const wireColor = spatialColor(overlay.color ?? (usesLegacySpatialDefaults(theme) ? '#111827' : theme.colors.text), overlay.opacity ?? 0.72);
        return [
            fill,
            {
                id: `${id}:wire-overlay`,
                primitive: 'lines',
                positions,
                normals: suppliedNormals ?? triangleNormals(positions, triangleIndices),
                colors: repeatedValues(positions.length / 3, wireColor),
                sizes: new Float32Array(positions.length / 3).fill(1),
                indices: wireIndices,
                picks: [],
                role: 'wire-overlay',
                provenance: {
                    family: 'surface',
                    operation: 'filled-wire-overlay',
                    sourceElements: triangleIndices.length / 3,
                    derivedElements: wireIndices.length / 2,
                    bounded: true,
                },
            },
        ];
    }
    function compileSurfaceGrid(layer, layerIndex, data, theme) {
        const rows = positiveInteger(data.rows, 'surface.data.rows');
        const columns = positiveInteger(data.columns, 'surface.data.columns');
        if (rows < 2 || columns < 2)
            fail('surface grid needs at least two rows and two columns.');
        if (data.z.length !== rows * columns)
            fail('surface.data.z length must equal rows * columns.');
        if (data.values !== undefined && data.values.length !== data.z.length)
            fail('surface.data.values length must equal surface.data.z length.');
        if (data.x !== undefined && data.x.length !== columns)
            fail('surface.data.x length must equal columns.');
        if (data.y !== undefined && data.y.length !== rows)
            fail('surface.data.y length must equal rows.');
        const positions = new Float32Array(rows * columns * 3);
        const values = data.values ?? data.z;
        let minimum = Number.POSITIVE_INFINITY;
        let maximum = Number.NEGATIVE_INFINITY;
        for (const value of values) {
            minimum = Math.min(minimum, finite(value, 'surface value'));
            maximum = Math.max(maximum, value);
        }
        const colors = new Float32Array(rows * columns * 4);
        new Float32Array(rows * columns).fill(1);
        const legacyDefaults = usesLegacySpatialDefaults(theme);
        const low = spatialColor(legacyDefaults ? '#0ea5e9' : continuousColor(theme, 0), layer.mark.opacity);
        const high = spatialColor(layer.mark.color ?? (legacyDefaults ? '#7c3aed' : continuousColor(theme, 1)), layer.mark.opacity);
        const useThemeScale = !legacyDefaults && layer.mark.color === undefined && usesThemeContinuousScale(theme);
        const picks = [];
        const id = layerId(layer, layerIndex);
        for (let row = 0; row < rows; row += 1) {
            for (let column = 0; column < columns; column += 1) {
                const index = row * columns + column;
                const x = finite(data.x?.[column] ?? column, `surface x ${column}`);
                const depth = finite(data.y?.[row] ?? row, `surface y ${row}`);
                const height = finite(data.z[index], `surface z ${index}`);
                positions.set([x, height, depth], index * 3);
                const amount = maximum === minimum ? 0.5 : (values[index] - minimum) / (maximum - minimum);
                colors.set(useThemeScale
                    ? spatialColor(continuousColor(theme, amount), layer.mark.opacity)
                    : interpolateColor(low, high, amount), index * 4);
                picks.push({
                    layerId: id,
                    layerIndex,
                    datumIndex: index,
                    nodeId: `${id}:point:${index}`,
                    position: [x, height, depth],
                    datum: { row, column, x, y: depth, z: height, value: values[index] },
                });
            }
        }
        const triangleIndices = [];
        const lineIndices = [];
        for (let row = 0; row < rows - 1; row += 1) {
            for (let column = 0; column < columns - 1; column += 1) {
                const a = row * columns + column;
                const b = a + 1;
                const c = a + columns;
                const d = c + 1;
                triangleIndices.push(a, c, b, b, c, d);
                lineIndices.push(a, b, a, c);
                if (row === rows - 2)
                    lineIndices.push(c, d);
                if (column === columns - 2)
                    lineIndices.push(b, d);
            }
        }
        const triangles = new Uint32Array(triangleIndices);
        const output = compileSurfaceGeometry(id, layerIndex, positions, colors, triangles, new Uint32Array(lineIndices), picks, layer, theme);
        return layer.mark.contours === undefined
            ? output
            : [
                ...output,
                ...compileSurfaceContours(id, layerIndex, positions, triangles, values, layer.mark.contours, theme),
            ];
    }
    function compileSurfaceMesh(layer, layerIndex, data, theme, layerCount) {
        if (data.positions.length === 0)
            fail('surface mesh needs at least one position.');
        const positionValues = [];
        for (const [index, point] of data.positions.entries())
            pushVec3(positionValues, validVec3(point, `mesh position ${index}`));
        const positions = new Float32Array(positionValues);
        const indexValues = [];
        for (const [index, triangle] of data.triangles.entries()) {
            for (const vertex of triangle) {
                if (!Number.isInteger(vertex) || vertex < 0 || vertex >= data.positions.length)
                    fail(`mesh triangle ${index} contains an invalid vertex index.`);
                indexValues.push(vertex);
            }
        }
        const indices = new Uint32Array(indexValues);
        const wireframeIndices = new Uint32Array(data.triangles.flatMap(([a, b, c]) => [a, b, b, c, c, a]));
        const opacity = layer.mark.opacity ?? 1;
        const colors = new Float32Array(data.positions.length * 4);
        const defaultColor = layer.mark.color ??
            (usesLegacySpatialDefaults(theme) ? undefined : layerThemeColor(theme, layerIndex, layerCount));
        for (let index = 0; index < data.positions.length; index += 1)
            colors.set(spatialColor(data.colors?.[index] ?? defaultColor, opacity), index * 4);
        const suppliedNormals = data.normals;
        let normals;
        if (suppliedNormals !== undefined) {
            if (suppliedNormals.length !== data.positions.length)
                fail('mesh normals length must equal positions length.');
            const normalValues = [];
            for (const [index, normal] of suppliedNormals.entries())
                pushVec3(normalValues, normalize3(validVec3(normal, `mesh normal ${index}`)));
            normals = new Float32Array(normalValues);
        }
        else {
            normals = triangleNormals(positions, indices);
        }
        const id = layerId(layer, layerIndex);
        const picks = data.positions.map((position, datumIndex) => ({
            layerId: id,
            layerIndex,
            datumIndex,
            nodeId: `${id}:vertex:${datumIndex}`,
            position,
            datum: { x: position[0], y: position[1], z: position[2], label: data.labels?.[datumIndex] },
        }));
        const output = compileSurfaceGeometry(id, layerIndex, positions, colors, indices, wireframeIndices, picks, layer, theme, normals);
        return layer.mark.contours === undefined
            ? output
            : [
                ...output,
                ...compileSurfaceContours(id, layerIndex, positions, indices, data.positions.map((position) => position[1]), layer.mark.contours, theme),
            ];
    }
    function compileSurface(layer, layerIndex, theme, layerCount) {
        const mode = layer.mark.mode ?? (isMeshData(layer.data) ? 'mesh' : 'surface');
        if (mode === 'mesh') {
            if (!isMeshData(layer.data))
                fail('surface mesh mode requires positions and triangles.');
            return compileSurfaceMesh(layer, layerIndex, layer.data, theme, layerCount);
        }
        if (isMeshData(layer.data))
            fail('surface mode requires rows, columns, and z values.');
        return compileSurfaceGrid(layer, layerIndex, layer.data, theme);
    }
    function volumeDimensions$1(layer) {
        const dimensions = layer.data.dimensions;
        const x = positiveInteger(dimensions[0], 'volume dimensions[0]');
        const y = positiveInteger(dimensions[1], 'volume dimensions[1]');
        const z = positiveInteger(dimensions[2], 'volume dimensions[2]');
        if (layer.data.values.length !== x * y * z)
            fail('volume values length must equal the product of dimensions.');
        return [x, y, z];
    }
    function volumePosition(x, y, z, origin, spacing) {
        return [origin[0] + x * spacing[0], origin[1] + y * spacing[1], origin[2] + z * spacing[2]];
    }
    function volumeIndex(x, y, z, dimensions) {
        return z * dimensions[0] * dimensions[1] + y * dimensions[0] + x;
    }
    function resolvedVolumeTransfer(layer, theme) {
        const opacity = layer.mark.opacity ?? 1;
        const authored = layer.mark.transferFunction;
        if (authored !== undefined) {
            return [...authored.stops]
                .sort((left, right) => left.offset - right.offset)
                .map((stop) => ({
                offset: stop.offset,
                color: spatialColor(stop.color, opacity * (stop.opacity ?? 1)),
            }));
        }
        const legacy = usesLegacySpatialDefaults(theme);
        return [
            {
                offset: 0,
                color: spatialColor(layer.mark.colorLow ?? (legacy ? '#0ea5e9' : continuousColor(theme, 0)), opacity * 0.06),
            },
            {
                offset: 1,
                color: spatialColor(layer.mark.colorHigh ?? (legacy ? '#f43f5e' : continuousColor(theme, 1)), opacity * 0.88),
            },
        ];
    }
    function volumeSamplingContext(layer, theme) {
        const [minimum, maximum] = volumeValueExtent(layer.data.values);
        return {
            data: layer.data,
            minimum,
            maximum,
            ...(layer.mark.windowLevel === undefined ? {} : { windowLevel: layer.mark.windowLevel }),
            transfer: resolvedVolumeTransfer(layer, theme),
            transferInterpolation: layer.mark.transferFunction?.interpolation ?? 'linear',
        };
    }
    function projectionResolution(dimensions, axis, requested) {
        if (requested !== undefined)
            return [Math.trunc(requested[0]), Math.trunc(requested[1])];
        if (axis === 'x')
            return [Math.min(256, dimensions[2]), Math.min(256, dimensions[1])];
        if (axis === 'y')
            return [Math.min(256, dimensions[0]), Math.min(256, dimensions[2])];
        return [Math.min(256, dimensions[0]), Math.min(256, dimensions[1])];
    }
    function gridTriangleIndices(columns, rows) {
        const indices = [];
        for (let row = 0; row < rows - 1; row += 1) {
            for (let column = 0; column < columns - 1; column += 1) {
                const a = row * columns + column;
                const b = a + 1;
                const c = a + columns;
                const d = c + 1;
                indices.push(a, c, b, b, c, d);
            }
        }
        return new Uint32Array(indices);
    }
    function geometryFromVolumeSamples(id, layerIndex, samples, resolution, method, axis) {
        const positions = [];
        const colors = [];
        const picks = [];
        for (const [datumIndex, sample] of samples.entries()) {
            pushVec3(positions, sample.position);
            pushColor(colors, sample.color);
            if (sample.color[3] <= 0)
                continue;
            picks.push({
                layerId: id,
                layerIndex,
                datumIndex,
                nodeId: `${id}:ray:${method}:${datumIndex}`,
                position: sample.position,
                datum: {
                    row: sample.row,
                    column: sample.column,
                    value: sample.rawValue,
                    normalizedValue: sample.normalizedValue,
                    renderMethod: method,
                    rayAxis: axis,
                    rayDepth: sample.depth,
                    sampleCount: sample.sampleCount,
                },
            });
        }
        const outputPositions = new Float32Array(positions);
        const normal = axis === 'x' ? [1, 0, 0] : axis === 'y' ? [0, 1, 0] : [0, 0, 1];
        return {
            id: `${id}:volume-${method}`,
            primitive: 'triangles',
            positions: outputPositions,
            normals: repeatedValues(outputPositions.length / 3, normal),
            colors: new Float32Array(colors),
            sizes: new Float32Array(outputPositions.length / 3).fill(1),
            indices: gridTriangleIndices(resolution[0], resolution[1]),
            picks,
            role: 'volume-projection',
            provenance: {
                family: 'volume',
                operation: `cpu-${method}-webgl-projection`,
                sourceElements: samples.reduce((total, sample) => total + sample.sampleCount, 0),
                derivedElements: samples.length,
                bounded: true,
                parameters: {
                    method,
                    axis,
                    resolution,
                },
            },
        };
    }
    function sliceNormal(slice) {
        if (slice.type === 'oblique')
            return normalize3(slice.normal, [0, 0, 1]);
        return slice.axis === 'x' ? [1, 0, 0] : slice.axis === 'y' ? [0, 1, 0] : [0, 0, 1];
    }
    function geometryFromVolumeSlice(id, layerIndex, samples, resolution, slice, sliceIndex, role = 'volume-slice') {
        const positions = [];
        const colors = [];
        const picks = [];
        for (const [datumIndex, sample] of samples.entries()) {
            pushVec3(positions, sample.position);
            pushColor(colors, sample.color);
            if (sample.rawValue === null || sample.color[3] <= 0)
                continue;
            picks.push({
                layerId: id,
                layerIndex,
                datumIndex,
                nodeId: `${id}:${role}:${sliceIndex}:${datumIndex}`,
                position: sample.position,
                datum: {
                    slice: sliceIndex,
                    sliceType: slice.type,
                    row: sample.row,
                    column: sample.column,
                    value: sample.rawValue,
                    normalizedValue: sample.normalizedValue,
                },
            });
        }
        const outputPositions = new Float32Array(positions);
        return {
            id: `${id}:${role}:${sliceIndex}`,
            primitive: 'triangles',
            positions: outputPositions,
            normals: repeatedValues(outputPositions.length / 3, sliceNormal(slice)),
            colors: new Float32Array(colors),
            sizes: new Float32Array(outputPositions.length / 3).fill(1),
            indices: gridTriangleIndices(resolution[0], resolution[1]),
            picks,
            role,
            provenance: {
                family: 'volume',
                operation: slice.type === 'orthogonal' ? 'orthogonal-slice' : 'oblique-slice',
                sourceElements: samples.length,
                derivedElements: samples.length,
                bounded: true,
                parameters: {
                    sliceIndex,
                    type: slice.type,
                    resolution,
                    ...(slice.type === 'orthogonal' ? { axis: slice.axis, position: slice.position } : {}),
                },
            },
        };
    }
    function compileVolumeSlices(layer, layerIndex, theme, slices, role = 'volume-slice') {
        const id = layerId(layer, layerIndex);
        const context = volumeSamplingContext(layer, theme);
        const size = volumeDimensions$1(layer);
        return slices.map((slice, sliceIndex) => {
            const resolution = slice.resolution ??
                (slice.type === 'orthogonal'
                    ? projectionResolution(size, slice.axis)
                    : [Math.min(128, Math.max(size[0], size[2])), Math.min(128, size[1])]);
            const samples = sampleVolumeSlice(context, slice, {
                resolution,
                interpolation: slice.interpolation ?? 'linear',
                opacity: slice.opacity ?? 1,
            });
            return geometryFromVolumeSlice(id, layerIndex, samples, resolution, slice, sliceIndex, role);
        });
    }
    function compileVolumeProjection(layer, layerIndex, theme) {
        const render = layer.mark.render;
        if (render === undefined)
            return [];
        const size = volumeDimensions$1(layer);
        const axis = render.axis ?? 'z';
        const resolution = projectionResolution(size, axis, render.resolution);
        const samples = Math.max(2, Math.trunc(render.samples ?? (axis === 'x' ? size[0] : axis === 'y' ? size[1] : size[2])));
        const method = render.method ?? 'raycast';
        const projection = projectVolumeRays(volumeSamplingContext(layer, theme), {
            method,
            axis,
            resolution,
            samples,
            interpolation: render.interpolation ?? 'linear',
        });
        const output = [
            geometryFromVolumeSamples(layerId(layer, layerIndex), layerIndex, projection, resolution, method, axis),
        ];
        const caps = render.caps ?? 'none';
        const capSlices = [];
        if (caps === 'front' || caps === 'both')
            capSlices.push({ type: 'orthogonal', axis, position: 0, resolution });
        if (caps === 'back' || caps === 'both')
            capSlices.push({ type: 'orthogonal', axis, position: 1, resolution });
        if (capSlices.length > 0)
            output.push(...compileVolumeSlices(layer, layerIndex, theme, capSlices, 'volume-cap'));
        return output;
    }
    function compileVolumePoints(layer, layerIndex, theme) {
        const dimensions = volumeDimensions$1(layer);
        const origin = validVec3(layer.data.origin ?? [0, 0, 0], 'volume origin');
        const spacing = validVec3(layer.data.spacing ?? [1, 1, 1], 'volume spacing');
        const values = layer.data.values;
        let minimum = Number.POSITIVE_INFINITY;
        let maximum = Number.NEGATIVE_INFINITY;
        for (const value of values) {
            minimum = Math.min(minimum, finite(value, 'volume value'));
            maximum = Math.max(maximum, value);
        }
        const maximumSamples = Math.max(1, Math.trunc(layer.mark.maxSamples ?? 80_000));
        const positions = [];
        const colors = [];
        const sizes = [];
        const picks = [];
        const legacyDefaults = usesLegacySpatialDefaults(theme);
        const low = spatialColor(layer.mark.colorLow ?? (legacyDefaults ? '#0ea5e9' : continuousColor(theme, 0)), layer.mark.opacity ?? 0.18);
        const high = spatialColor(layer.mark.colorHigh ?? (legacyDefaults ? '#f43f5e' : continuousColor(theme, 1)), layer.mark.opacity ?? 0.72);
        const useThemeScale = !legacyDefaults &&
            layer.mark.colorLow === undefined &&
            layer.mark.colorHigh === undefined &&
            usesThemeContinuousScale(theme);
        const id = layerId(layer, layerIndex);
        const plane = dimensions[0] * dimensions[1];
        for (const datumIndex of exactStrideSampleIndices(values.length, maximumSamples)) {
            const z = Math.floor(datumIndex / plane);
            const withinPlane = datumIndex - z * plane;
            const y = Math.floor(withinPlane / dimensions[0]);
            const x = withinPlane - y * dimensions[0];
            const value = values[datumIndex];
            const amount = normalizeVolumeValue(value, minimum, maximum, layer.mark.windowLevel);
            const position = volumePosition(x, y, z, origin, spacing);
            const interpolated = interpolateColor(low, high, amount);
            const color = layer.mark.transferFunction !== undefined
                ? evaluateVolumeTransfer(resolvedVolumeTransfer(layer, theme), amount, layer.mark.transferFunction.interpolation ?? 'linear')
                : useThemeScale
                    ? spatialColor(continuousColor(theme, amount), interpolated[3])
                    : interpolated;
            pushVec3(positions, position);
            pushColor(colors, color);
            sizes.push(Math.max(1, (layer.mark.pointSize ?? 5) * (0.45 + amount * 0.75)));
            if (color[3] <= 0)
                continue;
            picks.push({
                layerId: id,
                layerIndex,
                datumIndex,
                nodeId: `${id}:voxel:${datumIndex}`,
                position,
                datum: { x, y, z, value },
            });
        }
        const positionArray = new Float32Array(positions);
        return [
            {
                id,
                primitive: 'points',
                positions: positionArray,
                normals: repeatedValues(positionArray.length / 3, [0, 1, 0]),
                colors: new Float32Array(colors),
                sizes: new Float32Array(sizes),
                picks,
                role: 'primary',
                provenance: {
                    family: 'volume',
                    operation: 'bounded-voxel-sampling',
                    sourceElements: values.length,
                    derivedElements: positionArray.length / 3,
                    bounded: true,
                    parameters: {
                        maxSamples: maximumSamples,
                        transferFunction: layer.mark.transferFunction !== undefined,
                        windowLevel: layer.mark.windowLevel !== undefined,
                    },
                },
            },
        ];
    }
    const cubeCorners = [
        [0, 0, 0],
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
        [0, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
        [0, 1, 1],
    ];
    const cubeTetrahedra = [
        [0, 5, 1, 6],
        [0, 1, 2, 6],
        [0, 2, 3, 6],
        [0, 3, 7, 6],
        [0, 7, 4, 6],
        [0, 4, 5, 6],
    ];
    const tetraEdges = [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3],
    ];
    function isoIntersection(first, second, firstValue, secondValue, isoValue) {
        const denominator = secondValue - firstValue;
        const amount = Math.abs(denominator) < 1e-12 ? 0.5 : clamp((isoValue - firstValue) / denominator, 0, 1);
        return add3(first, scale3(subtract3(second, first), amount));
    }
    function averagePoints(points) {
        if (points.length === 0)
            return [0, 0, 0];
        return scale3(points.reduce((total, point) => add3(total, point), [0, 0, 0]), 1 / points.length);
    }
    function samePoint(first, second) {
        return length3(subtract3(first, second)) <= 1e-9;
    }
    function orderedIsoPolygon(intersections, lowToHigh) {
        const unique = [];
        for (const point of intersections)
            if (!unique.some((candidate) => samePoint(candidate, point)))
                unique.push(point);
        if (unique.length < 3)
            return unique;
        const center = averagePoints(unique);
        let planeNormal = cross3(subtract3(unique[1], unique[0]), subtract3(unique[2], unique[0]));
        if (dot3(planeNormal, lowToHigh) < 0)
            planeNormal = scale3(planeNormal, -1);
        planeNormal = normalize3(planeNormal, normalize3(lowToHigh, [0, 1, 0]));
        const firstAxis = normalize3(subtract3(unique[0], center), [1, 0, 0]);
        const secondAxis = normalize3(cross3(planeNormal, firstAxis), [0, 0, 1]);
        const sorted = [...unique].sort((left, right) => {
            const leftOffset = subtract3(left, center);
            const rightOffset = subtract3(right, center);
            const leftAngle = Math.atan2(dot3(leftOffset, secondAxis), dot3(leftOffset, firstAxis));
            const rightAngle = Math.atan2(dot3(rightOffset, secondAxis), dot3(rightOffset, firstAxis));
            return leftAngle - rightAngle;
        });
        const winding = cross3(subtract3(sorted[1], sorted[0]), subtract3(sorted[2], sorted[0]));
        if (dot3(winding, lowToHigh) < 0)
            sorted.reverse();
        return sorted;
    }
    function compileIsosurface(layer, layerIndex, theme) {
        const dimensions = volumeDimensions$1(layer);
        if (dimensions.some((dimension) => dimension < 2))
            fail('isosurface mode needs dimensions of at least 2.');
        const origin = validVec3(layer.data.origin ?? [0, 0, 0], 'volume origin');
        const spacing = validVec3(layer.data.spacing ?? [1, 1, 1], 'volume spacing');
        const values = layer.data.values;
        let minimum = Number.POSITIVE_INFINITY;
        let maximum = Number.NEGATIVE_INFINITY;
        for (const value of values) {
            minimum = Math.min(minimum, finite(value, 'volume value'));
            maximum = Math.max(maximum, value);
        }
        const isoValue = finite(layer.mark.isoValue ?? (minimum + maximum) / 2, 'volume isoValue');
        const vertices = [];
        const picks = [];
        const id = layerId(layer, layerIndex);
        let triangleIndex = 0;
        for (let z = 0; z < dimensions[2] - 1; z += 1) {
            for (let y = 0; y < dimensions[1] - 1; y += 1) {
                for (let x = 0; x < dimensions[0] - 1; x += 1) {
                    const cornerPositions = cubeCorners.map((corner) => volumePosition(x + corner[0], y + corner[1], z + corner[2], origin, spacing));
                    const cornerValues = cubeCorners.map((corner) => values[volumeIndex(x + corner[0], y + corner[1], z + corner[2], dimensions)]);
                    for (const tetrahedron of cubeTetrahedra) {
                        const intersections = [];
                        const low = [];
                        const high = [];
                        for (const corner of tetrahedron) {
                            (cornerValues[corner] < isoValue ? low : high).push(cornerPositions[corner]);
                        }
                        for (const edge of tetraEdges) {
                            const first = tetrahedron[edge[0]];
                            const second = tetrahedron[edge[1]];
                            const firstValue = cornerValues[first];
                            const secondValue = cornerValues[second];
                            if (firstValue < isoValue === secondValue < isoValue)
                                continue;
                            intersections.push(isoIntersection(cornerPositions[first], cornerPositions[second], firstValue, secondValue, isoValue));
                        }
                        const polygon = orderedIsoPolygon(intersections, subtract3(averagePoints(high), averagePoints(low)));
                        if (polygon.length < 3)
                            continue;
                        const triangles = [];
                        for (let index = 1; index < polygon.length - 1; index += 1)
                            triangles.push([polygon[0], polygon[index], polygon[index + 1]]);
                        for (const triangle of triangles) {
                            for (const point of triangle)
                                pushVec3(vertices, point);
                            const center = scale3(add3(add3(triangle[0], triangle[1]), triangle[2]), 1 / 3);
                            picks.push({
                                layerId: id,
                                layerIndex,
                                datumIndex: triangleIndex,
                                nodeId: `${id}:iso:${triangleIndex}`,
                                position: center,
                                datum: { x, y, z, isoValue },
                            });
                            triangleIndex += 1;
                        }
                    }
                }
            }
        }
        const positions = new Float32Array(vertices);
        const color = layer.mark.transferFunction === undefined
            ? spatialColor(layer.mark.colorHigh ??
                (usesLegacySpatialDefaults(theme) ? '#7c3aed' : continuousColor(theme, 1)), layer.mark.opacity ?? 0.82)
            : evaluateVolumeTransfer(resolvedVolumeTransfer(layer, theme), normalizeVolumeValue(isoValue, minimum, maximum, layer.mark.windowLevel), layer.mark.transferFunction.interpolation ?? 'linear');
        return [
            {
                id,
                primitive: 'triangles',
                positions,
                normals: triangleNormals(positions),
                colors: repeatedValues(positions.length / 3, color),
                sizes: new Float32Array(positions.length / 3).fill(1),
                picks,
                role: 'primary',
                provenance: {
                    family: 'volume',
                    operation: 'marching-tetrahedra-isosurface',
                    sourceElements: values.length,
                    derivedElements: positions.length / 3,
                    bounded: true,
                    parameters: {
                        isoValue,
                        transferFunction: layer.mark.transferFunction !== undefined,
                        windowLevel: layer.mark.windowLevel !== undefined,
                    },
                },
            },
        ];
    }
    function compileVolume(layer, layerIndex, theme) {
        if ((layer.mark.mode ?? 'volume') === 'isosurface')
            return compileIsosurface(layer, layerIndex, theme);
        const slices = layer.mark.slices ?? [];
        if (layer.mark.render === undefined && slices.length === 0)
            return compileVolumePoints(layer, layerIndex, theme);
        return [
            ...compileVolumeProjection(layer, layerIndex, theme),
            ...compileVolumeSlices(layer, layerIndex, theme, slices),
        ];
    }
    function isStreamtubeData(data) {
        return 'paths' in data;
    }
    function isVectorFieldData(data) {
        return 'dimensions' in data;
    }
    function vectorBasis(direction) {
        const normalized = normalize3(direction);
        const reference = Math.abs(normalized[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        const first = normalize3(cross3(normalized, reference), [1, 0, 0]);
        return [first, normalize3(cross3(normalized, first), [0, 0, 1])];
    }
    function compileCones(layer, layerIndex, data, theme, layerCount) {
        if (data.origins.length !== data.vectors.length)
            fail('vector origins and vectors must have the same length.');
        const segments = Math.max(5, Math.min(48, Math.trunc(layer.mark.segments ?? 12)));
        const scale = Math.max(0.0001, layer.mark.scale ?? 1);
        const radiusFactor = Math.max(0.0001, layer.mark.radius ?? 0.12);
        const positions = [];
        const colors = [];
        const indices = [];
        const picks = [];
        const id = layerId(layer, layerIndex);
        for (let datumIndex = 0; datumIndex < data.origins.length; datumIndex += 1) {
            const origin = validVec3(data.origins[datumIndex], `vector origin ${datumIndex}`);
            const vector = validVec3(data.vectors[datumIndex], `vector value ${datumIndex}`);
            const magnitude = length3(vector);
            if (magnitude <= 1e-12)
                continue;
            const direction = normalize3(vector);
            const tip = add3(origin, scale3(vector, scale));
            const [first, second] = vectorBasis(direction);
            const radius = Math.max(0.004, magnitude * scale * radiusFactor);
            const baseCenter = add3(origin, scale3(subtract3(tip, origin), 0.72));
            const color = spatialColor(data.colors?.[datumIndex] ??
                layer.mark.color ??
                (usesLegacySpatialDefaults(theme)
                    ? '#0f9f8a'
                    : layerThemeColor(theme, layerIndex, layerCount)), layer.mark.opacity);
            const offset = positions.length / 3;
            pushVec3(positions, origin);
            pushColor(colors, color);
            pushVec3(positions, tip);
            pushColor(colors, color);
            for (let segment = 0; segment < segments; segment += 1) {
                const angle = (segment / segments) * Math.PI * 2;
                const radial = add3(scale3(first, Math.cos(angle) * radius), scale3(second, Math.sin(angle) * radius));
                pushVec3(positions, add3(baseCenter, radial));
                pushColor(colors, color);
            }
            for (let segment = 0; segment < segments; segment += 1) {
                const next = (segment + 1) % segments;
                indices.push(offset, offset + 2 + next, offset + 2 + segment);
                indices.push(offset + 1, offset + 2 + segment, offset + 2 + next);
            }
            picks.push({
                layerId: id,
                layerIndex,
                datumIndex,
                nodeId: `${id}:vector:${datumIndex}`,
                position: tip,
                datum: {
                    x: origin[0],
                    y: origin[1],
                    z: origin[2],
                    dx: vector[0],
                    dy: vector[1],
                    dz: vector[2],
                    magnitude,
                    label: data.labels?.[datumIndex],
                },
            });
        }
        const positionArray = new Float32Array(positions);
        const indexArray = new Uint32Array(indices);
        return [
            {
                id,
                primitive: 'triangles',
                positions: positionArray,
                normals: triangleNormals(positionArray, indexArray),
                colors: new Float32Array(colors),
                sizes: new Float32Array(positionArray.length / 3).fill(1),
                indices: indexArray,
                picks,
            },
        ];
    }
    function tubePointBasis(path, index) {
        const previous = path[Math.max(0, index - 1)];
        const next = path[Math.min(path.length - 1, index + 1)];
        return vectorBasis(subtract3(next, previous));
    }
    function compileStreamtubes(layer, layerIndex, data, theme, layerCount, integration) {
        const segments = Math.max(5, Math.min(48, Math.trunc(layer.mark.segments ?? 10)));
        const radius = Math.max(0.0001, layer.mark.radius ?? 0.035);
        const positions = [];
        const colors = [];
        const indices = [];
        const picks = [];
        const id = layerId(layer, layerIndex);
        let minimumMagnitude = Number.POSITIVE_INFINITY;
        let maximumMagnitude = Number.NEGATIVE_INFINITY;
        for (const path of data.magnitudes ?? []) {
            for (const value of path) {
                minimumMagnitude = Math.min(minimumMagnitude, value);
                maximumMagnitude = Math.max(maximumMagnitude, value);
            }
        }
        const magnitudeEncoding = layer.mark.magnitudeEncoding ?? (integration === undefined ? 'none' : 'color-radius');
        const encodeColor = magnitudeEncoding === 'color' || magnitudeEncoding === 'color-radius';
        const encodeRadius = magnitudeEncoding === 'radius' || magnitudeEncoding === 'color-radius';
        const lowMagnitudeColor = spatialColor(usesLegacySpatialDefaults(theme) ? '#0ea5e9' : continuousColor(theme, 0), layer.mark.opacity);
        const highMagnitudeColor = spatialColor(usesLegacySpatialDefaults(theme) ? '#7c3aed' : continuousColor(theme, 1), layer.mark.opacity);
        for (let datumIndex = 0; datumIndex < data.paths.length; datumIndex += 1) {
            const path = data.paths[datumIndex].map((point, index) => validVec3(point, `stream path ${datumIndex}:${index}`));
            if (path.length < 2)
                continue;
            const offset = positions.length / 3;
            const pathColor = spatialColor(data.colors?.[datumIndex] ??
                layer.mark.color ??
                (usesLegacySpatialDefaults(theme)
                    ? '#0284c7'
                    : layerThemeColor(theme, layerIndex, layerCount)), layer.mark.opacity);
            const pathMagnitudes = data.magnitudes?.[datumIndex];
            if (pathMagnitudes !== undefined && pathMagnitudes.length !== path.length)
                fail(`stream magnitudes ${datumIndex} length must equal its path length.`);
            for (let pointIndex = 0; pointIndex < path.length; pointIndex += 1) {
                const [first, second] = tubePointBasis(path, pointIndex);
                const magnitude = pathMagnitudes?.[pointIndex];
                const amount = magnitude === undefined || maximumMagnitude === minimumMagnitude
                    ? 0.5
                    : clamp((magnitude - minimumMagnitude) / (maximumMagnitude - minimumMagnitude), 0, 1);
                const pointRadius = radius * (encodeRadius ? 0.45 + amount * 0.9 : 1);
                const pointColor = encodeColor && data.colors?.[datumIndex] === undefined && layer.mark.color === undefined
                    ? interpolateColor(lowMagnitudeColor, highMagnitudeColor, amount)
                    : pathColor;
                for (let segment = 0; segment < segments; segment += 1) {
                    const angle = (segment / segments) * Math.PI * 2;
                    const radial = add3(scale3(first, Math.cos(angle) * pointRadius), scale3(second, Math.sin(angle) * pointRadius));
                    pushVec3(positions, add3(path[pointIndex], radial));
                    pushColor(colors, pointColor);
                }
            }
            for (let pointIndex = 0; pointIndex < path.length - 1; pointIndex += 1) {
                for (let segment = 0; segment < segments; segment += 1) {
                    const next = (segment + 1) % segments;
                    const a = offset + pointIndex * segments + segment;
                    const b = offset + pointIndex * segments + next;
                    const c = offset + (pointIndex + 1) * segments + segment;
                    const d = offset + (pointIndex + 1) * segments + next;
                    indices.push(a, c, b, b, c, d);
                }
            }
            for (let pointIndex = 0; pointIndex < path.length; pointIndex += 1) {
                picks.push({
                    layerId: id,
                    layerIndex,
                    datumIndex,
                    nodeId: `${id}:stream:${datumIndex}:${pointIndex}`,
                    position: path[pointIndex],
                    datum: {
                        path: datumIndex,
                        point: pointIndex,
                        x: path[pointIndex][0],
                        y: path[pointIndex][1],
                        z: path[pointIndex][2],
                        magnitude: data.magnitudes?.[datumIndex]?.[pointIndex],
                        seedIndex: integration?.paths[datumIndex]?.seedIndex,
                        seedSource: integration?.paths[datumIndex]?.seedSource,
                        acceptedSteps: integration?.paths[datumIndex]?.acceptedSteps,
                        rejectedSteps: integration?.paths[datumIndex]?.rejectedSteps,
                        termination: integration?.paths[datumIndex]?.termination,
                        label: data.labels?.[datumIndex],
                    },
                });
            }
        }
        const positionArray = new Float32Array(positions);
        const indexArray = new Uint32Array(indices);
        return [
            {
                id,
                primitive: 'triangles',
                positions: positionArray,
                normals: triangleNormals(positionArray, indexArray),
                colors: new Float32Array(colors),
                sizes: new Float32Array(positionArray.length / 3).fill(1),
                indices: indexArray,
                picks,
                role: integration === undefined ? 'primary' : 'integrated-streamtube',
                provenance: {
                    family: 'spatial-vector',
                    operation: integration === undefined ? 'provided-path-streamtube' : integration.method,
                    sourceElements: integration === undefined
                        ? data.paths.reduce((total, path) => total + path.length, 0)
                        : integration.sourceSeedCount,
                    derivedElements: positionArray.length / 3,
                    bounded: true,
                    parameters: {
                        segments,
                        magnitudeEncoding,
                        ...(integration === undefined
                            ? {}
                            : {
                                acceptedSteps: integration.acceptedSteps,
                                rejectedSteps: integration.rejectedSteps,
                                retainedSeeds: integration.seeds.length,
                                seedSourceIndices: integration.seedSourceIndices,
                            }),
                    },
                },
            },
        ];
    }
    function compileVector(layer, layerIndex, theme, layerCount) {
        const mode = layer.mark.mode ??
            (isStreamtubeData(layer.data) || isVectorFieldData(layer.data) ? 'streamtube' : 'cone');
        if (mode === 'streamtube') {
            if (isVectorFieldData(layer.data)) {
                const integration = integrateVectorField(layer.data, layer.mark.integration);
                const data = {
                    paths: integration.paths.map((path) => path.points),
                    magnitudes: integration.paths.map((path) => path.magnitudes),
                    ...(layer.data.labels === undefined
                        ? {}
                        : {
                            labels: integration.paths.map(({ seedIndex }) => layer.data.labels[seedIndex]),
                        }),
                    ...(layer.data.colors === undefined
                        ? {}
                        : {
                            colors: integration.paths.map(({ seedIndex }) => layer.data.colors[seedIndex]),
                        }),
                };
                return compileStreamtubes(layer, layerIndex, data, theme, layerCount, integration);
            }
            if (!isStreamtubeData(layer.data))
                fail('streamtube mode requires paths or a vector field.');
            return compileStreamtubes(layer, layerIndex, layer.data, theme, layerCount);
        }
        if (isVectorFieldData(layer.data))
            fail('vector field data requires streamtube mode and an integration contract.');
        if (isStreamtubeData(layer.data))
            fail('cone mode requires origins and vectors.');
        return compileCones(layer, layerIndex, layer.data, theme, layerCount);
    }
    function compileScatter(layer, layerIndex, theme, layerCount) {
        const data = layer.data;
        const count = data.positions.length;
        for (const [name, values] of [
            ['values', data.values],
            ['sizes', data.sizes],
            ['colors', data.colors],
            ['labels', data.labels],
        ]) {
            if (values !== undefined && values.length !== count)
                fail(`scatter ${name} length must equal positions length.`);
        }
        const positions = [];
        const colors = [];
        const sizes = [];
        const picks = [];
        const id = layerId(layer, layerIndex);
        let minimum = Number.POSITIVE_INFINITY;
        let maximum = Number.NEGATIVE_INFINITY;
        for (const value of data.values ?? []) {
            minimum = Math.min(minimum, finite(value, 'scatter value'));
            maximum = Math.max(maximum, value);
        }
        const legacyDefaults = usesLegacySpatialDefaults(theme);
        const low = spatialColor(legacyDefaults ? '#06b6d4' : continuousColor(theme, 0), layer.mark.opacity);
        const high = spatialColor(layer.mark.color ?? (legacyDefaults ? '#7c3aed' : continuousColor(theme, 1)), layer.mark.opacity);
        const useThemeScale = !legacyDefaults && layer.mark.color === undefined && usesThemeContinuousScale(theme);
        const category = legacyDefaults && layer.mark.color === undefined
            ? interpolateColor(low, high, 0.5)
            : spatialColor(layer.mark.color ?? layerThemeColor(theme, layerIndex, layerCount), layer.mark.opacity);
        for (let datumIndex = 0; datumIndex < count; datumIndex += 1) {
            const position = validVec3(data.positions[datumIndex], `scatter position ${datumIndex}`);
            const value = data.values?.[datumIndex];
            const amount = value === undefined || maximum === minimum ? 0.5 : (value - minimum) / (maximum - minimum);
            pushVec3(positions, position);
            pushColor(colors, data.colors?.[datumIndex] !== undefined
                ? spatialColor(data.colors[datumIndex], layer.mark.opacity)
                : value === undefined
                    ? category
                    : useThemeScale
                        ? spatialColor(continuousColor(theme, amount), layer.mark.opacity)
                        : interpolateColor(low, high, amount));
            sizes.push(Math.max(1, data.sizes?.[datumIndex] ?? layer.mark.pointSize ?? 7));
            picks.push({
                layerId: id,
                layerIndex,
                datumIndex,
                nodeId: `${id}:point:${datumIndex}`,
                position,
                datum: {
                    x: position[0],
                    y: position[1],
                    z: position[2],
                    value,
                    label: data.labels?.[datumIndex],
                },
            });
        }
        const positionArray = new Float32Array(positions);
        return [
            {
                id,
                primitive: 'points',
                positions: positionArray,
                normals: repeatedValues(count, [0, 1, 0]),
                colors: new Float32Array(colors),
                sizes: new Float32Array(sizes),
                picks,
            },
        ];
    }
    function longitudeLatitudeToSphere(longitude, latitude, radius) {
        const lon = (longitude * Math.PI) / 180;
        const lat = (latitude * Math.PI) / 180;
        const cosLat = Math.cos(lat);
        return [
            radius * cosLat * Math.cos(lon),
            radius * Math.sin(lat),
            -radius * cosLat * Math.sin(lon),
        ];
    }
    function sphereGeometry(id, radius, color) {
        const latitudeSegments = 32;
        const longitudeSegments = 64;
        const positions = [];
        const normals = [];
        const colors = [];
        const indices = [];
        for (let latitude = 0; latitude <= latitudeSegments; latitude += 1) {
            const angleLatitude = -Math.PI / 2 + (latitude / latitudeSegments) * Math.PI;
            for (let longitude = 0; longitude <= longitudeSegments; longitude += 1) {
                const angleLongitude = (longitude / longitudeSegments) * Math.PI * 2;
                const normal = [
                    Math.cos(angleLatitude) * Math.cos(angleLongitude),
                    Math.sin(angleLatitude),
                    -Math.cos(angleLatitude) * Math.sin(angleLongitude),
                ];
                pushVec3(positions, scale3(normal, radius));
                pushVec3(normals, normal);
                pushColor(colors, color);
            }
        }
        const stride = longitudeSegments + 1;
        for (let latitude = 0; latitude < latitudeSegments; latitude += 1) {
            for (let longitude = 0; longitude < longitudeSegments; longitude += 1) {
                const a = latitude * stride + longitude;
                const b = a + 1;
                const c = a + stride;
                const d = c + 1;
                indices.push(a, c, b, b, c, d);
            }
        }
        return {
            id,
            primitive: 'triangles',
            positions: new Float32Array(positions),
            normals: new Float32Array(normals),
            colors: new Float32Array(colors),
            sizes: new Float32Array(positions.length / 3).fill(1),
            indices: new Uint32Array(indices),
            picks: [],
        };
    }
    function greatCirclePoints(from, to, radius, segments) {
        const start = normalize3(longitudeLatitudeToSphere(from[0], from[1], 1));
        const end = normalize3(longitudeLatitudeToSphere(to[0], to[1], 1));
        const cosine = clamp(dot3(start, end), -1, 1);
        const angle = Math.acos(cosine);
        const tangentCandidate = subtract3(end, scale3(start, cosine));
        const tangentLength = length3(tangentCandidate);
        const leastAlignedAxis = Math.abs(start[0]) <= Math.abs(start[1]) && Math.abs(start[0]) <= Math.abs(start[2])
            ? [1, 0, 0]
            : Math.abs(start[1]) <= Math.abs(start[2])
                ? [0, 1, 0]
                : [0, 0, 1];
        const tangent = tangentLength > 1e-7
            ? scale3(tangentCandidate, 1 / tangentLength)
            : normalize3(subtract3(leastAlignedAxis, scale3(start, dot3(leastAlignedAxis, start))));
        const output = [];
        for (let index = 0; index <= segments; index += 1) {
            const amount = index / segments;
            const direction = index === 0
                ? start
                : index === segments
                    ? end
                    : add3(scale3(start, Math.cos(amount * angle)), scale3(tangent, Math.sin(amount * angle)));
            const arc = 1 + Math.sin(amount * Math.PI) * 0.08;
            output.push(scale3(normalize3(direction), radius * arc));
        }
        return output;
    }
    function planarCross(first, middle, last) {
        return (middle.x - first.x) * (last.y - first.y) - (middle.y - first.y) * (last.x - first.x);
    }
    function planarRing(ring) {
        const output = [];
        let previousLongitude;
        for (let sourceIndex = 0; sourceIndex < ring.length; sourceIndex += 1) {
            const [rawLongitude, latitude] = ring[sourceIndex];
            let longitude = rawLongitude;
            if (previousLongitude !== undefined) {
                while (longitude - previousLongitude > 180)
                    longitude -= 360;
                while (longitude - previousLongitude < -180)
                    longitude += 360;
            }
            const previous = output.at(-1);
            if (previous !== undefined &&
                Math.abs(previous.x - longitude) < 1e-10 &&
                Math.abs(previous.y - latitude) < 1e-10)
                continue;
            output.push({ sourceIndex, x: longitude, y: latitude });
            previousLongitude = longitude;
        }
        const first = output[0];
        const last = output.at(-1);
        if (first !== undefined &&
            last !== undefined &&
            output.length > 1 &&
            Math.abs(Math.abs(first.x - last.x) % 360) < 1e-10 &&
            Math.abs(first.y - last.y) < 1e-10)
            output.pop();
        return output;
    }
    function planarArea(points) {
        let area = 0;
        for (let index = 0; index < points.length; index += 1) {
            const current = points[index];
            const next = points[(index + 1) % points.length];
            area += current.x * next.y - next.x * current.y;
        }
        return area / 2;
    }
    function pointInsideTriangle(point, first, middle, last, orientation) {
        return (planarCross(first, middle, point) * orientation >= -1e-10 &&
            planarCross(middle, last, point) * orientation >= -1e-10 &&
            planarCross(last, first, point) * orientation >= -1e-10);
    }
    function triangulateRing(ring) {
        const remaining = [...planarRing(ring)];
        if (remaining.length < 3)
            return [];
        const orientation = planarArea(remaining) >= 0 ? 1 : -1;
        const triangles = [];
        let guard = remaining.length * remaining.length;
        while (remaining.length > 3 && guard > 0) {
            guard -= 1;
            let clipped = false;
            for (let index = 0; index < remaining.length; index += 1) {
                const previous = remaining[(index - 1 + remaining.length) % remaining.length];
                const current = remaining[index];
                const next = remaining[(index + 1) % remaining.length];
                if (planarCross(previous, current, next) * orientation <= 1e-10)
                    continue;
                const minX = Math.min(previous.x, current.x, next.x);
                const maxX = Math.max(previous.x, current.x, next.x);
                const minY = Math.min(previous.y, current.y, next.y);
                const maxY = Math.max(previous.y, current.y, next.y);
                const containsVertex = remaining.some((candidate) => {
                    if (candidate === previous || candidate === current || candidate === next)
                        return false;
                    if (candidate.x < minX || candidate.x > maxX || candidate.y < minY || candidate.y > maxY)
                        return false;
                    return pointInsideTriangle(candidate, previous, current, next, orientation);
                });
                if (containsVertex)
                    continue;
                triangles.push([previous.sourceIndex, current.sourceIndex, next.sourceIndex]);
                remaining.splice(index, 1);
                clipped = true;
                break;
            }
            if (clipped)
                continue;
            let smallestIndex = -1;
            let smallestCross = Number.POSITIVE_INFINITY;
            for (let index = 0; index < remaining.length; index += 1) {
                const value = Math.abs(planarCross(remaining[(index - 1 + remaining.length) % remaining.length], remaining[index], remaining[(index + 1) % remaining.length]));
                if (value < smallestCross) {
                    smallestCross = value;
                    smallestIndex = index;
                }
            }
            if (smallestIndex < 0 || smallestCross > 1e-7)
                break;
            remaining.splice(smallestIndex, 1);
        }
        if (remaining.length === 3)
            triangles.push([
                remaining[0].sourceIndex,
                remaining[1].sourceIndex,
                remaining[2].sourceIndex,
            ]);
        return triangles;
    }
    function sphericalAngle(first, second) {
        return Math.acos(clamp(dot3(normalize3(first), normalize3(second)), -1, 1));
    }
    function pushSphericalTriangle(positions, colors, color, first, middle, last, radius, depth = 0) {
        const edges = [
            sphericalAngle(first, middle),
            sphericalAngle(middle, last),
            sphericalAngle(last, first),
        ];
        const maximum = Math.max(...edges);
        if (maximum <= 0.1 || depth >= 8) {
            for (const point of [first, middle, last]) {
                pushVec3(positions, point);
                pushColor(colors, color);
            }
            return;
        }
        const edge = edges.indexOf(maximum);
        if (edge === 0) {
            const midpoint = scale3(normalize3(add3(first, middle)), radius);
            pushSphericalTriangle(positions, colors, color, first, midpoint, last, radius, depth + 1);
            pushSphericalTriangle(positions, colors, color, midpoint, middle, last, radius, depth + 1);
        }
        else if (edge === 1) {
            const midpoint = scale3(normalize3(add3(middle, last)), radius);
            pushSphericalTriangle(positions, colors, color, first, middle, midpoint, radius, depth + 1);
            pushSphericalTriangle(positions, colors, color, first, midpoint, last, radius, depth + 1);
        }
        else {
            const midpoint = scale3(normalize3(add3(last, first)), radius);
            pushSphericalTriangle(positions, colors, color, first, middle, midpoint, radius, depth + 1);
            pushSphericalTriangle(positions, colors, color, midpoint, middle, last, radius, depth + 1);
        }
    }
    function compileGlobe(layer, layerIndex, theme) {
        const id = layerId(layer, layerIndex);
        const radius = Math.max(0.001, layer.mark.radius ?? 1);
        const opacity = layer.mark.opacity ?? 1;
        const ocean = sphereGeometry(`${id}:ocean`, radius, spatialColor(layer.mark.oceanColor ??
            (usesLegacySpatialDefaults(theme) ? '#bfdbfe' : continuousColor(theme, 0.12)), opacity));
        const landPositions = [];
        const landColors = [];
        const borderPositions = [];
        const borderColors = [];
        const countryPicks = [];
        const legacyDefaults = usesLegacySpatialDefaults(theme);
        const landColor = spatialColor(layer.mark.landColor ?? (legacyDefaults ? '#dce7d5' : continuousColor(theme, 0.72)), opacity);
        const borderColor = spatialColor(layer.mark.borderColor ?? (legacyDefaults ? '#64748b' : theme.colors.mutedText), opacity);
        const landRadius = radius * 1.003;
        const countries = naturalEarthCountries110m();
        for (const [countryIndex, country] of countries.entries()) {
            const [countryId, iso2, iso3, , name, labelLongitude, labelLatitude, , polygons] = country;
            for (const polygon of polygons) {
                const outer = polygon[0];
                if (outer === undefined || outer.length < 3)
                    continue;
                const outerPoints = outer.map((position) => {
                    return longitudeLatitudeToSphere(position[0], position[1], landRadius);
                });
                for (const triangle of triangulateRing(outer)) {
                    pushSphericalTriangle(landPositions, landColors, landColor, outerPoints[triangle[0]], outerPoints[triangle[1]], outerPoints[triangle[2]], landRadius);
                }
                for (const ring of polygon) {
                    for (let index = 0; index < ring.length - 1; index += 1) {
                        pushVec3(borderPositions, longitudeLatitudeToSphere(ring[index][0], ring[index][1], radius * 1.006));
                        pushVec3(borderPositions, longitudeLatitudeToSphere(ring[index + 1][0], ring[index + 1][1], radius * 1.006));
                        pushColor(borderColors, borderColor);
                        pushColor(borderColors, borderColor);
                    }
                }
            }
            const pickPosition = longitudeLatitudeToSphere(labelLongitude, labelLatitude, radius * 1.02);
            countryPicks.push({
                layerId: id,
                layerIndex,
                datumIndex: countryIndex,
                nodeId: `${id}:country:${countryId}`,
                position: pickPosition,
                datum: { country: name, iso2, iso3, longitude: labelLongitude, latitude: labelLatitude },
                occlusion: 'globe-front',
            });
        }
        const landPositionArray = new Float32Array(landPositions);
        const land = {
            id: `${id}:land`,
            primitive: 'triangles',
            positions: landPositionArray,
            normals: Float32Array.from(landPositionArray, (value, index) => {
                const axis = index % 3;
                const start = index - axis;
                const point = [
                    landPositionArray[start],
                    landPositionArray[start + 1],
                    landPositionArray[start + 2],
                ];
                return normalize3(point)[axis];
            }),
            colors: new Float32Array(landColors),
            sizes: new Float32Array(landPositionArray.length / 3).fill(1),
            picks: countryPicks,
        };
        const borderPositionArray = new Float32Array(borderPositions);
        const borders = {
            id: `${id}:borders`,
            primitive: 'lines',
            positions: borderPositionArray,
            normals: repeatedValues(borderPositionArray.length / 3, [0, 1, 0]),
            colors: new Float32Array(borderColors),
            sizes: new Float32Array(borderPositionArray.length / 3).fill(1),
            picks: [],
        };
        const pointPositions = [];
        const pointColors = [];
        const pointSizes = [];
        const pointPicks = [];
        const globePoints = layer.data?.points ?? [];
        for (const [datumIndex, point] of globePoints.entries()) {
            const position = longitudeLatitudeToSphere(finite(point.longitude, `globe point ${datumIndex} longitude`), finite(point.latitude, `globe point ${datumIndex} latitude`), radius * 1.025);
            pushVec3(pointPositions, position);
            pushColor(pointColors, spatialColor(point.color ??
                layer.mark.pointColor ??
                (legacyDefaults
                    ? '#dc2626'
                    : categoricalColor(theme, datumIndex, Math.max(1, globePoints.length))), opacity));
            pointSizes.push(Math.max(2, point.size ?? 8));
            pointPicks.push({
                layerId: id,
                layerIndex,
                datumIndex,
                nodeId: `${id}:point:${datumIndex}`,
                position,
                datum: {
                    longitude: point.longitude,
                    latitude: point.latitude,
                    value: point.value,
                    label: point.label,
                },
                occlusion: 'globe-front',
            });
        }
        const pointPositionArray = new Float32Array(pointPositions);
        const points = {
            id: `${id}:points`,
            primitive: 'points',
            positions: pointPositionArray,
            normals: repeatedValues(pointPositionArray.length / 3, [0, 1, 0]),
            colors: new Float32Array(pointColors),
            sizes: new Float32Array(pointSizes),
            picks: pointPicks,
        };
        const routePositions = [];
        const routeColors = [];
        const routePicks = [];
        const routeSegments = Math.max(8, Math.min(128, Math.trunc(layer.mark.routeSegments ?? 32)));
        const globeRoutes = layer.data?.routes ?? [];
        for (const [datumIndex, route] of globeRoutes.entries()) {
            const path = greatCirclePoints(route.from, route.to, radius * 1.025, routeSegments);
            const color = spatialColor(route.color ??
                layer.mark.routeColor ??
                (legacyDefaults
                    ? '#f97316'
                    : categoricalColor(theme, datumIndex + Math.max(1, globePoints.length), Math.max(2, globePoints.length + globeRoutes.length))), opacity);
            for (let index = 0; index < path.length - 1; index += 1) {
                pushVec3(routePositions, path[index]);
                pushVec3(routePositions, path[index + 1]);
                pushColor(routeColors, color);
                pushColor(routeColors, color);
            }
            routePicks.push({
                layerId: id,
                layerIndex,
                datumIndex,
                nodeId: `${id}:route:${datumIndex}`,
                position: path[Math.floor(path.length / 2)],
                datum: {
                    fromLongitude: route.from[0],
                    fromLatitude: route.from[1],
                    toLongitude: route.to[0],
                    toLatitude: route.to[1],
                    value: route.value,
                    label: route.label,
                },
                occlusion: 'globe-front',
            });
        }
        const routePositionArray = new Float32Array(routePositions);
        const routes = {
            id: `${id}:routes`,
            primitive: 'lines',
            positions: routePositionArray,
            normals: repeatedValues(routePositionArray.length / 3, [0, 1, 0]),
            colors: new Float32Array(routeColors),
            sizes: new Float32Array(routePositionArray.length / 3).fill(1),
            picks: routePicks,
        };
        return [ocean, land, borders, points, routes].filter((geometry) => geometry.positions.length > 0);
    }
    const builtInCompilers = {
        globe: (layer, layerIndex, theme) => compileGlobe(layer, layerIndex, theme),
        scatter: (layer, layerIndex, theme, layerCount) => compileScatter(layer, layerIndex, theme, layerCount),
        surface: (layer, layerIndex, theme, layerCount) => compileSurface(layer, layerIndex, theme, layerCount),
        vector: (layer, layerIndex, theme, layerCount) => compileVector(layer, layerIndex, theme, layerCount),
        volume: (layer, layerIndex, theme) => compileVolume(layer, layerIndex, theme),
    };
    function compileSpatial(spec) {
        assertValidSpatialSpec(spec);
        const theme = new ThemeRegistry().resolve(spec.theme ?? defaultThemeId);
        const geometries = [];
        for (const [layerIndex, layer] of spec.layers.entries()) {
            const type = layer.mark.type.trim().toLowerCase();
            const compiler = builtInCompilers[type];
            if (compiler === undefined)
                fail(`unsupported spatial mark type "${type}".`);
            geometries.push(...compiler(layer, layerIndex, theme, spec.layers.length));
            assertCompiledSpatialOutputBudget(geometries);
        }
        return {
            geometries,
            bounds: boundsFromPositions(geometries.map(({ positions }) => positions)),
            spec,
            theme,
        };
    }

    function usableDimension(value, fallback) {
        return Number.isFinite(value) && value > 1 ? value : fallback;
    }
    function explicitDimension(...values) {
        return values.find((value) => value !== undefined && Number.isFinite(value) && value > 0);
    }
    /**
     * Fullscreen always follows the fullscreen element's measured box. Explicit creation and resize
     * dimensions apply only to the embedded chart.
     */
    function resolveSpatialSize(input) {
        const measuredWidth = usableDimension(input.measuredWidth, 640);
        const measuredHeight = usableDimension(input.measuredHeight, 420);
        if (input.fullscreen)
            return { width: measuredWidth, height: measuredHeight };
        return {
            width: explicitDimension(input.requestedWidth, input.configuredWidth) ?? measuredWidth,
            height: explicitDimension(input.requestedHeight, input.configuredHeight) ?? measuredHeight,
        };
    }

    function assertFiniteSpatialNumber(label, value) {
        if (!Number.isFinite(value))
            throw new TypeError(`Spatial ${label} must be a finite number.`);
    }
    function resolveSpatialCameraPatch(spec, current, patch, sceneRadius) {
        const candidate = { ...current, ...patch };
        assertValidSpatialSpec({ ...spec, camera: candidate });
        return normalizedCamera(candidate.projection, candidate.target, sceneRadius, candidate);
    }

    function boundedInteger(value, fallback, maximum, path) {
        const resolved = value ?? fallback;
        if (!Number.isInteger(resolved) || resolved < 1 || resolved > maximum) {
            throw new GraflumeError('INVALID_SPEC', `${path} must be an integer from 1 to ${maximum}.`, {
                path,
            });
        }
        return resolved;
    }
    function checkedProjection(value) {
        if (value === null)
            return null;
        if (![value.x, value.y, value.depth].every(Number.isFinite)) {
            throw new GraflumeError('INVALID_DATA', 'Spatial focus projection must be finite.');
        }
        return { ...value };
    }
    /**
     * Renderer-neutral roving traversal for GPU pick targets.
     *
     * Camera projection and DOM focus-ring updates are injected, keeping tests
     * deterministic and keeping the authored spatial specification function-free.
     */
    class SpatialSemanticNavigator {
        #maxRows;
        #pageRows;
        #wrap;
        #actions;
        #targets = [];
        #activeIndex = null;
        #projector = null;
        #screen = null;
        constructor(actions, options = {}) {
            this.#actions = actions;
            this.#maxRows = boundedInteger(options.maxRows, 1_000, 100_000, '$.spatial.navigation.maxRows');
            this.#pageRows = boundedInteger(options.pageRows, 10, 1_000, '$.spatial.navigation.pageRows');
            if (options.wrap !== undefined && typeof options.wrap !== 'boolean') {
                throw new GraflumeError('INVALID_SPEC', '$.spatial.navigation.wrap must be boolean.');
            }
            this.#wrap = options.wrap ?? false;
        }
        setTargets(targets, preferredNodeId) {
            if (targets.length > this.#maxRows) {
                throw new GraflumeError('INVALID_DATA', `Spatial semantic navigation has ${targets.length} targets; the deterministic limit is ${this.#maxRows}.`);
            }
            this.#targets = [...targets];
            const preferred = preferredNodeId === undefined || preferredNodeId === null
                ? -1
                : targets.findIndex(({ nodeId }) => nodeId === preferredNodeId);
            const previous = this.#activeIndex ?? -1;
            this.#activeIndex =
                preferred >= 0
                    ? preferred
                    : targets.length === 0
                        ? null
                        : Math.min(Math.max(0, previous), targets.length - 1);
            this.#synchronize(false);
            return this.state();
        }
        setProjector(projector) {
            this.#projector = projector;
            this.#synchronize(false);
            return this.state();
        }
        reproject() {
            this.#synchronize(true);
            return this.state();
        }
        focusIndex(index) {
            if (!Number.isInteger(index) || index < 0 || index >= this.#targets.length) {
                throw new GraflumeError('INVALID_DATA', 'Spatial focus index is outside semantic targets.');
            }
            this.#activeIndex = index;
            this.#synchronize(true);
            return this.state();
        }
        focusNode(nodeId) {
            const index = this.#targets.findIndex((target) => target.nodeId === nodeId);
            if (index < 0)
                throw new GraflumeError('INVALID_DATA', `Spatial target "${nodeId}" was not found.`);
            return this.focusIndex(index);
        }
        move(key) {
            const length = this.#targets.length;
            if (length === 0)
                return this.state();
            const current = this.#activeIndex ?? 0;
            let next = current;
            switch (key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    next = current - 1;
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    next = current + 1;
                    break;
                case 'Home':
                    next = 0;
                    break;
                case 'End':
                    next = length - 1;
                    break;
                case 'PageUp':
                    next = current - this.#pageRows;
                    break;
                case 'PageDown':
                    next = current + this.#pageRows;
                    break;
            }
            if (this.#wrap && (next < 0 || next >= length))
                next = (next + length) % length;
            return this.focusIndex(Math.max(0, Math.min(length - 1, next)));
        }
        activate() {
            const focus = this.focus();
            if (focus !== null)
                this.#actions.activate?.(focus);
        }
        clear() {
            this.#activeIndex = null;
            this.#screen = null;
            this.#actions.focus(null);
        }
        focus() {
            const pick = this.#activeIndex === null ? undefined : this.#targets[this.#activeIndex];
            return pick === undefined
                ? null
                : {
                    index: this.#activeIndex,
                    pick,
                    screen: this.#screen === null ? null : { ...this.#screen },
                };
        }
        state() {
            const active = this.#activeIndex === null ? undefined : this.#targets[this.#activeIndex];
            return {
                version: 1,
                rowCount: this.#targets.length,
                activeIndex: active === undefined ? null : this.#activeIndex,
                activeNodeId: active?.nodeId ?? null,
                projected: this.#screen === null ? null : { ...this.#screen },
            };
        }
        #synchronize(announce) {
            const focus = this.focus();
            if (focus === null) {
                this.#screen = null;
                if (announce)
                    this.#actions.focus(null);
                return;
            }
            this.#screen = checkedProjection(this.#projector?.(focus.pick) ?? null);
            if (announce)
                this.#actions.focus({ ...focus, screen: this.#screen });
        }
    }
    function createSpatialSemanticNavigator(actions, options = {}) {
        return new SpatialSemanticNavigator(actions, options);
    }

    function intersectionArea(left, right) {
        const width = Math.max(0, Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x));
        const height = Math.max(0, Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y));
        return width * height;
    }
    function overlapArea(bounds, obstacles) {
        return obstacles.reduce((sum, obstacle) => sum + intersectionArea(bounds, obstacle), 0);
    }
    function outsideArea(bounds, boundary) {
        return Math.max(0, bounds.width * bounds.height - intersectionArea(bounds, boundary));
    }
    function clampBounds(bounds, boundary) {
        const minimumX = boundary.x;
        const minimumY = boundary.y;
        const maximumX = Math.max(minimumX, boundary.x + boundary.width - bounds.width);
        const maximumY = Math.max(minimumY, boundary.y + boundary.height - bounds.height);
        return {
            ...bounds,
            x: Math.max(minimumX, Math.min(maximumX, bounds.x)),
            y: Math.max(minimumY, Math.min(maximumY, bounds.y)),
        };
    }
    function candidateBounds(placement, alignment, options) {
        const gap = options.gap ?? 18;
        const targetCenterX = options.target.x + options.target.width / 2;
        const targetCenterY = options.target.y + options.target.height / 2;
        let x = targetCenterX - options.width / 2;
        let y = targetCenterY - options.height / 2;
        if (placement === 'top' || placement === 'bottom') {
            x += alignment * Math.max(options.width * 0.58, options.target.width / 2 + gap);
            y =
                placement === 'top'
                    ? options.target.y - options.height - gap
                    : options.target.y + options.target.height + gap;
        }
        else {
            y += alignment * Math.max(options.height * 0.58, options.target.height / 2 + gap);
            x =
                placement === 'left'
                    ? options.target.x - options.width - gap
                    : options.target.x + options.target.width + gap;
        }
        return {
            x: x + (options.offsetX ?? 0),
            y: y + (options.offsetY ?? 0),
            width: options.width,
            height: options.height,
        };
    }
    function score(candidate, options) {
        const rawOverflow = outsideArea(candidate.rawBounds, options.boundary);
        const protectedOverlap = overlapArea(candidate.bounds, options.protectedObstacles ?? []);
        const occupiedOverlap = overlapArea(candidate.bounds, options.occupiedCallouts ?? []);
        const targetOverlap = intersectionArea(candidate.bounds, options.target);
        const dataOverlap = overlapArea(candidate.bounds, options.dataObstacles ?? []);
        const targetCenterX = options.target.x + options.target.width / 2;
        const targetCenterY = options.target.y + options.target.height / 2;
        const candidateCenterX = candidate.bounds.x + candidate.bounds.width / 2;
        const candidateCenterY = candidate.bounds.y + candidate.bounds.height / 2;
        const distance = Math.hypot(candidateCenterX - targetCenterX, candidateCenterY - targetCenterY);
        return (rawOverflow * 1_000_000 +
            occupiedOverlap * 80_000 +
            protectedOverlap * 60_000 +
            targetOverlap * 40_000 +
            dataOverlap * 16 +
            distance * 0.01 +
            candidate.order * 0.0001);
    }
    function explicitIsUnsafe(candidate, options) {
        const area = Math.max(1, candidate.bounds.width * candidate.bounds.height);
        return (outsideArea(candidate.rawBounds, options.boundary) > 0.5 ||
            overlapArea(candidate.bounds, options.protectedObstacles ?? []) > area * 0.08 ||
            overlapArea(candidate.bounds, options.occupiedCallouts ?? []) > area * 0.08 ||
            intersectionArea(candidate.bounds, options.target) > area * 0.25 ||
            overlapArea(candidate.bounds, options.dataObstacles ?? []) > area * 0.72);
    }
    /**
     * Select a deterministic, renderer-neutral perimeter position for a callout.
     * Authored cardinal placement wins while it remains in bounds and avoids a
     * severe collision; `auto` and unsafe authored positions use the lowest score.
     */
    function placeCallout(options) {
        const targetCenterX = options.target.x + options.target.width / 2;
        const targetCenterY = options.target.y + options.target.height / 2;
        const boundaryCenterX = options.boundary.x + options.boundary.width / 2;
        const boundaryCenterY = options.boundary.y + options.boundary.height / 2;
        const horizontalFirst = targetCenterX <= boundaryCenterX ? ['right', 'left'] : ['left', 'right'];
        const verticalFirst = targetCenterY <= boundaryCenterY ? ['bottom', 'top'] : ['top', 'bottom'];
        const preferred = options.placement === undefined ? 'auto' : options.placement;
        const placements = preferred === 'auto'
            ? [horizontalFirst[0], verticalFirst[0], horizontalFirst[1], verticalFirst[1]]
            : [preferred, ...[...horizontalFirst, ...verticalFirst].filter((item) => item !== preferred)];
        const candidates = [];
        let order = 0;
        for (const placement of placements) {
            for (const alignment of [0, -1, 1]) {
                const rawBounds = candidateBounds(placement, alignment, options);
                const bounds = clampBounds(rawBounds, options.boundary);
                candidates.push({
                    x: bounds.x,
                    y: bounds.y,
                    bounds,
                    placement,
                    rawBounds,
                    order,
                });
                order += 1;
            }
        }
        const explicit = candidates[0];
        if (preferred !== 'auto' && !explicitIsUnsafe(explicit, options)) {
            return {
                x: explicit.x,
                y: explicit.y,
                bounds: explicit.bounds,
                placement: explicit.placement,
            };
        }
        const best = candidates.reduce((winner, candidate) => score(candidate, options) < score(winner, options) ? candidate : winner);
        return { x: best.x, y: best.y, bounds: best.bounds, placement: best.placement };
    }

    function scalarEqual(left, right) {
        return left === right;
    }
    function datumMatches(target, pick) {
        if (target.layerId !== undefined && target.layerId !== pick.layerId)
            return false;
        if (target.datumIndex !== undefined) {
            const indices = Array.isArray(target.datumIndex) ? target.datumIndex : [target.datumIndex];
            if (!indices.includes(pick.datumIndex))
                return false;
        }
        if (target.field !== undefined) {
            const candidate = pick.datum[target.field];
            if (target.values !== undefined)
                return target.values.some((value) => scalarEqual(candidate, value));
            return scalarEqual(candidate, target.value);
        }
        return true;
    }
    function boxCorners(min, max) {
        return [
            [min[0], min[1], min[2]],
            [min[0], min[1], max[2]],
            [min[0], max[1], min[2]],
            [min[0], max[1], max[2]],
            [max[0], min[1], min[2]],
            [max[0], min[1], max[2]],
            [max[0], max[1], min[2]],
            [max[0], max[1], max[2]],
        ];
    }
    function targetPositions(target, state) {
        if (target.type === 'point')
            return [{ position: target.position }];
        if (target.type === 'box')
            return boxCorners(target.min, target.max).map((position) => ({ position }));
        const picks = state.scene.geometries.flatMap((geometry) => geometry.picks);
        if (target.type === 'layer') {
            if (state.hiddenLayerIds.has(target.layerId))
                return [];
            return picks
                .filter((pick) => pick.layerId === target.layerId)
                .map((pick) => ({ position: pick.position, pick }));
        }
        return picks
            .filter((pick) => !state.hiddenLayerIds.has(pick.layerId) && datumMatches(target, pick))
            .map((pick) => ({ position: pick.position, pick }));
    }
    function targetBounds(target, state, actions) {
        const points = targetPositions(target, state)
            .map(({ position, pick }) => actions.project(position, pick))
            .filter((point) => point !== null && point.visible);
        if (points.length === 0)
            return null;
        const xs = points.map((point) => point.x);
        const ys = points.map((point) => point.y);
        const x = Math.min(...xs);
        const y = Math.min(...ys);
        return {
            x,
            y,
            width: Math.max(0, Math.max(...xs) - x),
            height: Math.max(0, Math.max(...ys) - y),
        };
    }
    function projectedDataObstacles(state, actions) {
        const geometries = state.scene.geometries.filter((geometry) => geometry.picks.length > 0);
        const budgetPerGeometry = Math.max(1, Math.floor(384 / Math.max(1, geometries.length)));
        const columns = 12;
        const rows = 8;
        const buckets = new Map();
        for (const geometry of geometries) {
            const stride = Math.max(1, Math.ceil(geometry.picks.length / budgetPerGeometry));
            for (let index = 0; index < geometry.picks.length; index += stride) {
                const pick = geometry.picks[index];
                if (state.hiddenLayerIds.has(pick.layerId))
                    continue;
                const point = actions.project(pick.position, pick);
                if (point === null || !point.visible)
                    continue;
                const bounds = { x: point.x - 4, y: point.y - 4, width: 8, height: 8 };
                const column = Math.max(0, Math.min(columns - 1, Math.floor(((point.x - state.plotBounds.x) / Math.max(1, state.plotBounds.width)) * columns)));
                const row = Math.max(0, Math.min(rows - 1, Math.floor(((point.y - state.plotBounds.y) / Math.max(1, state.plotBounds.height)) * rows)));
                const key = row * columns + column;
                const prior = buckets.get(key);
                if (prior === undefined) {
                    buckets.set(key, bounds);
                    continue;
                }
                const x = Math.min(prior.x, bounds.x);
                const y = Math.min(prior.y, bounds.y);
                const endX = Math.max(prior.x + prior.width, bounds.x + bounds.width);
                const endY = Math.max(prior.y + prior.height, bounds.y + bounds.height);
                buckets.set(key, { x, y, width: endX - x, height: endY - y });
            }
        }
        return [...buckets.values()];
    }
    function applyHighlightStyle(element, highlight, bounds, theme) {
        const padding = highlight.padding ?? 5;
        const point = bounds.width <= 2 && bounds.height <= 2;
        const radius = point ? (highlight.radius ?? Math.max(7, padding + 3)) : 0;
        element.style.position = 'absolute';
        element.style.left = `${bounds.x - (point ? radius : padding)}px`;
        element.style.top = `${bounds.y - (point ? radius : padding)}px`;
        element.style.width = `${Math.max(1, point ? radius * 2 : bounds.width + padding * 2)}px`;
        element.style.height = `${Math.max(1, point ? radius * 2 : bounds.height + padding * 2)}px`;
        element.style.boxSizing = 'border-box';
        element.style.border = `${highlight.lineWidth ?? 2}px ${highlight.dash?.length ? 'dashed' : 'solid'} ${highlight.stroke ?? theme.colors.focus}`;
        element.style.borderRadius = point ? '999px' : `${highlight.radius ?? 7}px`;
        element.style.background = highlight.fill ?? colorWithOpacity(theme.colors.focus, 0.12);
        element.style.opacity = String(highlight.opacity ?? 1);
    }
    function connector(from, to, annotation, theme) {
        const configured = typeof annotation.connector === 'object' ? annotation.connector : {};
        const visible = typeof annotation.connector === 'boolean' ? annotation.connector : (configured.visible ?? true);
        if (!visible)
            return null;
        const length = Math.hypot(to.x - from.x, to.y - from.y);
        const line = document.createElement('div');
        line.dataset.graflumeSpatialAnnotationConnector = annotation.id ?? 'true';
        line.style.position = 'absolute';
        line.style.left = `${from.x}px`;
        line.style.top = `${from.y}px`;
        line.style.width = `${length}px`;
        line.style.height = '0';
        line.style.borderTop = `${configured.width ?? 1.5}px ${configured.dash?.length ? 'dashed' : 'solid'} ${configured.color ?? annotation.style?.border ?? theme.colors.focus}`;
        line.style.transformOrigin = '0 0';
        line.style.transform = `rotate(${Math.atan2(to.y - from.y, to.x - from.x)}rad)`;
        return line;
    }
    function prepareAnnotation(annotation, bounds, state) {
        const style = annotation.style ?? {};
        const availableWidth = Math.max(1, state.plotBounds.width - 8);
        const availableHeight = Math.max(1, state.plotBounds.height - 8);
        const maxWidth = Math.min(style.maxWidth ?? 220, availableWidth);
        const padding = Math.min(style.padding ?? 10, Math.max(0, Math.min(maxWidth / 5, availableHeight / 6)));
        const fontSize = Math.min(style.fontSize ?? state.scene.theme.typography.fontSize, Math.max(1, Math.min(maxWidth / 3, availableHeight / 3)));
        const bubble = document.createElement('div');
        bubble.dataset.graflumeSpatialAnnotation = annotation.id ?? 'true';
        bubble.setAttribute('role', 'note');
        bubble.setAttribute('aria-label', annotation.detail === undefined ? annotation.text : `${annotation.text}: ${annotation.detail}`);
        bubble.dir = 'auto';
        bubble.style.position = 'absolute';
        bubble.style.zIndex = '3';
        bubble.style.maxWidth = `${maxWidth}px`;
        bubble.style.maxHeight = `${availableHeight}px`;
        bubble.style.padding = `${padding}px`;
        bubble.style.boxSizing = 'border-box';
        bubble.style.border = `1.25px solid ${style.border ?? state.scene.theme.colors.focus}`;
        bubble.style.borderRadius = '9px';
        bubble.style.background = style.background ?? state.scene.theme.colors.background;
        bubble.style.color = style.color ?? state.scene.theme.colors.text;
        bubble.style.opacity = String(style.opacity ?? 0.97);
        bubble.style.font = `700 ${fontSize}px/1.35 ${state.scene.theme.typography.fontFamily}`;
        bubble.style.textAlign = style.align ?? 'start';
        bubble.style.overflowWrap = 'anywhere';
        bubble.style.wordBreak = 'break-word';
        bubble.style.hyphens = 'auto';
        bubble.style.pointerEvents = 'none';
        const title = document.createElement('div');
        title.textContent = annotation.text;
        title.style.overflowWrap = 'anywhere';
        title.style.wordBreak = 'break-word';
        bubble.append(title);
        let detail;
        if (annotation.detail !== undefined) {
            detail = document.createElement('div');
            detail.textContent = annotation.detail;
            detail.style.marginBlockStart = '4px';
            detail.style.fontWeight = '400';
            detail.style.color = style.color ?? state.scene.theme.colors.mutedText;
            detail.style.overflowWrap = 'anywhere';
            detail.style.wordBreak = 'break-word';
            bubble.append(detail);
        }
        const longestText = Math.max(annotation.text.length, annotation.detail?.length ?? 0, 8);
        const fallbackWidth = Math.min(maxWidth, Math.max(Math.min(72, maxWidth), longestText * fontSize * 0.58 + padding * 2));
        bubble.style.width = `${fallbackWidth}px`;
        bubble.style.visibility = 'hidden';
        bubble.style.left = '0';
        bubble.style.top = '0';
        const fallbackLines = Math.max(1, Math.ceil((annotation.text.length + (annotation.detail?.length ?? 0)) /
            Math.max(8, Math.floor(fallbackWidth / (fontSize * 0.58)))));
        const fallbackHeight = padding * 2 + fallbackLines * fontSize * 1.35 + (annotation.detail === undefined ? 0 : 4);
        return {
            annotation,
            bounds,
            bubble,
            title,
            ...(detail === undefined ? {} : { detail }),
            fontSize,
            padding,
            availableWidth,
            availableHeight,
            fallbackWidth,
            fallbackHeight,
            measurementKey: JSON.stringify([
                annotation.text,
                annotation.detail ?? null,
                annotation.style ?? null,
                state.width,
                state.height,
                state.plotBounds.x,
                state.plotBounds.y,
                state.plotBounds.width,
                state.plotBounds.height,
            ]),
        };
    }
    function placeAnnotation(prepared, state, measured, dataObstacles, protectedObstacles, occupiedCallouts) {
        const { annotation, bounds, bubble } = prepared;
        const estimatedWidth = Math.min(prepared.availableWidth, measured.width > 0 ? measured.width : prepared.fallbackWidth);
        const estimatedHeight = Math.min(prepared.availableHeight, measured.height > 0 ? measured.height : prepared.fallbackHeight);
        bubble.style.visibility = 'visible';
        bubble.style.overflow = 'hidden';
        bubble.style.maxHeight = `${estimatedHeight}px`;
        bubble.style.maxBlockSize = `${estimatedHeight}px`;
        const detailGap = prepared.detail === undefined ? 0 : 4;
        const lineHeight = prepared.fontSize * 1.35;
        const lineBudget = Math.max(1, Math.floor((estimatedHeight - prepared.padding * 2 - detailGap) / Math.max(1, lineHeight)));
        const titleLines = prepared.detail === undefined || lineBudget < 2
            ? lineBudget
            : Math.max(1, Math.min(2, lineBudget - 1));
        const clampLines = (element, lines) => {
            element.style.display = '-webkit-box';
            element.style.webkitBoxOrient = 'vertical';
            element.style.webkitLineClamp = String(Math.max(1, lines));
            element.style.overflow = 'hidden';
            element.style.overflowWrap = 'anywhere';
            element.style.wordBreak = 'break-word';
        };
        clampLines(prepared.title, titleLines);
        if (prepared.detail !== undefined) {
            if (lineBudget < 2)
                prepared.detail.style.display = 'none';
            else
                clampLines(prepared.detail, Math.max(1, lineBudget - titleLines));
        }
        const anchor = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
        const marginX = Math.min(4, Math.max(0, (state.plotBounds.width - estimatedWidth) / 2));
        const marginY = Math.min(4, Math.max(0, (state.plotBounds.height - estimatedHeight) / 2));
        const placed = placeCallout({
            target: bounds,
            width: estimatedWidth,
            height: estimatedHeight,
            boundary: {
                x: state.plotBounds.x + marginX,
                y: state.plotBounds.y + marginY,
                width: Math.max(1, state.plotBounds.width - marginX * 2),
                height: Math.max(1, state.plotBounds.height - marginY * 2),
            },
            placement: annotation.placement ?? 'auto',
            offsetX: annotation.offsetX ?? 0,
            offsetY: annotation.offsetY ?? 0,
            dataObstacles,
            protectedObstacles,
            occupiedCallouts,
        });
        const { x, y } = placed;
        bubble.style.left = `${x}px`;
        bubble.style.top = `${y}px`;
        const line = connector(anchor, { x: x + estimatedWidth / 2, y: y + estimatedHeight / 2 }, annotation, state.scene.theme);
        return {
            elements: line === null ? [bubble] : [line, bubble],
            bounds: placed.bounds,
        };
    }
    function externalLegendBounds(position, state) {
        const plot = state.plotBounds;
        if (position === 'top')
            return { x: 0, y: 0, width: state.width, height: plot.y };
        if (position === 'bottom') {
            const y = plot.y + plot.height;
            return { x: 0, y, width: state.width, height: Math.max(0, state.height - y) };
        }
        if (position === 'left')
            return { x: 0, y: 0, width: plot.x, height: state.height };
        const x = plot.x + plot.width;
        return { x, y: 0, width: Math.max(0, state.width - x), height: state.height };
    }
    function insideLegendBounds(state) {
        const legend = state.legend;
        if (legend === null || !legend.visible || !legend.position.startsWith('inside-'))
            return null;
        const plot = state.plotBounds;
        const inset = 8;
        const titleHeight = legend.title === undefined ? 0 : 24;
        const itemWidths = legend.items.map((item) => Math.max(64, item.label.length * 7 + 30));
        let width;
        let height;
        if (legend.orientation === 'horizontal') {
            width = Math.min(Math.max(1, plot.width - inset * 2), Math.max(150, itemWidths.reduce((a, b) => a + b, 0) + 20));
            const availableRowWidth = Math.max(1, width - 20);
            let rows = 1;
            let rowWidth = 0;
            for (const itemWidth of itemWidths) {
                if (rowWidth > 0 && rowWidth + itemWidth > availableRowWidth) {
                    rows += 1;
                    rowWidth = 0;
                }
                rowWidth += itemWidth;
            }
            height = Math.min(Math.max(1, plot.height - inset * 2), titleHeight + rows * 24 + 16);
        }
        else {
            width = Math.min(Math.max(1, plot.width - inset * 2), Math.min(220, Math.max(96, ...itemWidths) + 20));
            height = Math.min(Math.max(1, plot.height - inset * 2), titleHeight + Math.max(1, legend.items.length) * 24 + 16);
        }
        const right = legend.position.endsWith('right');
        const bottom = legend.position.includes('bottom');
        return {
            x: right ? plot.x + plot.width - width - inset : plot.x + inset,
            y: bottom ? plot.y + plot.height - height - inset : plot.y + inset,
            width,
            height,
        };
    }
    function legendPosition(element, legend, state) {
        const external = !legend.position.startsWith('inside-');
        const bounds = external
            ? externalLegendBounds(legend.position, state)
            : state.plotBounds;
        const inset = Math.min(8, bounds.width / 4, bounds.height / 4);
        const width = Math.max(1, bounds.width - inset * 2);
        const height = Math.max(1, bounds.height - inset * 2);
        element.style.maxWidth = `${width}px`;
        element.style.maxHeight = `${height}px`;
        if (external || legend.position.endsWith('left'))
            element.style.left = `${bounds.x + inset}px`;
        else
            element.style.right = `${state.width - bounds.x - bounds.width + inset}px`;
        if (external || legend.position.includes('top'))
            element.style.top = `${bounds.y + inset}px`;
        else
            element.style.bottom = `${state.height - bounds.y - bounds.height + inset}px`;
        if (external && (legend.position === 'top' || legend.position === 'bottom'))
            element.style.width = `${width}px`;
    }
    function createLegend(legend, state, actions, focusedItemId) {
        const element = document.createElement('div');
        let focusTarget = null;
        element.dataset.graflumeSpatialLegend = 'true';
        element.setAttribute('role', 'group');
        element.setAttribute('aria-label', legend.title ?? 'Chart legend');
        element.style.position = 'absolute';
        element.style.zIndex = '4';
        element.style.display = 'flex';
        element.style.flexDirection = legend.orientation === 'horizontal' ? 'row' : 'column';
        element.style.flexWrap = 'wrap';
        element.style.gap = '6px 10px';
        element.style.overflow = 'auto';
        element.style.padding = '8px 10px';
        element.style.boxSizing = 'border-box';
        element.style.border = `${state.scene.theme.legend?.borderWidth ?? 1}px solid ${state.scene.theme.legend?.borderColor ?? state.scene.theme.colors.axis}`;
        element.style.borderRadius = `${state.scene.theme.legend?.cornerRadius ?? 8}px`;
        const surfaceOpacity = state.scene.theme.legend?.surfaceOpacity ?? 0.9;
        element.style.background =
            surfaceOpacity >= 1
                ? state.scene.theme.colors.background
                : colorWithOpacity(state.scene.theme.colors.background, surfaceOpacity);
        element.style.color = state.scene.theme.colors.text;
        element.style.fontFamily = state.scene.theme.typography.fontFamily;
        element.style.backdropFilter = 'blur(5px)';
        element.style.pointerEvents = 'auto';
        legendPosition(element, legend, state);
        if (legend.title !== undefined) {
            const title = document.createElement('strong');
            title.textContent = legend.title;
            title.style.inlineSize = legend.orientation === 'horizontal' ? '100%' : 'auto';
            title.style.fontSize = `${state.scene.theme.typography.legendTitleSize ?? state.scene.theme.typography.fontSize}px`;
            title.style.fontWeight = String(state.scene.theme.typography.legendTitleWeight ?? 600);
            element.append(title);
        }
        if (legend.mode === 'continuous' && legend.items.length >= 2) {
            const scale = document.createElement('div');
            scale.style.display = 'grid';
            scale.style.gridTemplateColumns = '1fr 1fr';
            scale.style.minWidth = '150px';
            const gradient = document.createElement('div');
            gradient.style.gridColumn = '1 / -1';
            gradient.style.height = '10px';
            gradient.style.borderRadius = '3px';
            const colors = legend.continuousColors ?? legend.items.map(({ color }) => color);
            gradient.style.background = `linear-gradient(90deg, ${colors
            .map((color, index) => `${color} ${(index / Math.max(1, colors.length - 1)) * 100}%`)
            .join(', ')})`;
            scale.append(gradient);
            [legend.items[0], legend.items[legend.items.length - 1]].forEach((item, index) => {
                const label = document.createElement('span');
                label.textContent = item.label;
                label.style.font = `${state.scene.theme.typography.legendLabelWeight ?? 500} ${state.scene.theme.typography.legendLabelSize ?? state.scene.theme.typography.fontSize}px/1.4 ${state.scene.theme.typography.fontFamily}`;
                label.style.textAlign = index === 0 ? 'start' : 'end';
                scale.append(label);
            });
            element.append(scale);
            return { element, focusTarget };
        }
        for (const item of legend.items) {
            const row = document.createElement(item.toggleable ? 'button' : 'div');
            row.dataset.graflumeSpatialLegendItem = item.id;
            if (item.toggleable) {
                const button = row;
                button.type = 'button';
                button.setAttribute('aria-pressed', String(item.visible));
                const action = item.visible ? legend.hideLabel : legend.showLabel;
                button.setAttribute('aria-label', `${action} ${item.label}`);
                button.addEventListener('click', () => actions.setLegendVisible(item.id, !item.visible));
                if (item.id === focusedItemId)
                    focusTarget = button;
            }
            row.style.display = 'inline-flex';
            row.style.alignItems = 'center';
            row.style.gap = '6px';
            row.style.padding = '2px';
            row.style.border = '0';
            row.style.background = 'transparent';
            row.style.color = state.scene.theme.colors.text;
            row.style.font = `${state.scene.theme.typography.legendLabelWeight ?? 500} ${state.scene.theme.typography.legendLabelSize ?? state.scene.theme.typography.fontSize}px/1.35 ${state.scene.theme.typography.fontFamily}`;
            row.style.cursor = item.toggleable ? 'pointer' : 'default';
            row.style.opacity = item.visible ? '1' : '.42';
            const swatch = document.createElement('span');
            swatch.setAttribute('aria-hidden', 'true');
            swatch.style.width = item.symbol === 'line' ? '14px' : '10px';
            swatch.style.height = item.symbol === 'line' ? '2px' : '10px';
            swatch.style.borderRadius =
                item.symbol === 'point'
                    ? '999px'
                    : item.symbol === 'line' && state.scene.theme.legend?.lineCap === 'butt'
                        ? '0'
                        : `${state.scene.theme.legend?.swatchRadius ?? 3}px`;
            swatch.style.background = item.color;
            const label = document.createElement('span');
            label.textContent = item.label;
            row.append(swatch, label);
            element.append(row);
        }
        return { element, focusTarget };
    }
    class SpatialOverlayController {
        #host = null;
        #root = null;
        #content = null;
        #live = null;
        #annotationMeasurements = new Map();
        sync(host, state, actions) {
            if (this.#host !== host) {
                this.destroy();
                this.#host = host;
                const root = document.createElement('div');
                root.dataset.graflumeSpatialOverlays = 'true';
                root.style.position = 'absolute';
                root.style.inset = '0';
                root.style.zIndex = '3';
                root.style.pointerEvents = 'none';
                root.style.overflow = 'hidden';
                const content = document.createElement('div');
                content.style.position = 'absolute';
                content.style.inset = '0';
                content.style.pointerEvents = 'none';
                content.style.overflow = 'hidden';
                root.append(content);
                host.append(root);
                this.#root = root;
                this.#content = content;
            }
            const content = this.#content;
            if (content === null)
                return;
            if (state.selectionEnabled && this.#live === null) {
                const live = document.createElement('div');
                live.dataset.graflumeSpatialSelectionStatus = 'true';
                live.setAttribute('role', 'status');
                live.setAttribute('aria-live', 'polite');
                live.style.position = 'absolute';
                live.style.width = '1px';
                live.style.height = '1px';
                live.style.overflow = 'hidden';
                live.style.clipPath = 'inset(50%)';
                this.#root?.append(live);
                this.#live = live;
            }
            else if (!state.selectionEnabled && this.#live !== null) {
                this.#live.remove();
                this.#live = null;
            }
            const focusedItemId = document.activeElement?.dataset
                ?.graflumeSpatialLegendItem;
            content.replaceChildren();
            for (const [index, highlight] of state.highlights.entries()) {
                const bounds = targetBounds(highlight.target, state, actions);
                if (bounds === null)
                    continue;
                const element = document.createElement('div');
                element.dataset.graflumeSpatialHighlight = highlight.id ?? `highlight-${index}`;
                applyHighlightStyle(element, highlight, bounds, state.scene.theme);
                content.append(element);
            }
            for (const [index, target] of state.selection.entries()) {
                const bounds = targetBounds(target, state, actions);
                if (bounds === null)
                    continue;
                const element = document.createElement('div');
                element.dataset.graflumeSpatialSelection = String(index);
                applyHighlightStyle(element, {
                    fill: state.selectionHighlight.fill ?? colorWithOpacity(state.scene.theme.colors.focus, 0.16),
                    stroke: state.selectionHighlight.stroke ?? state.scene.theme.colors.focus,
                    lineWidth: state.selectionHighlight.lineWidth ?? 2.5,
                    padding: state.selectionHighlight.padding ?? 5,
                    radius: state.selectionHighlight.radius ?? 8,
                    ...(state.selectionHighlight.opacity === undefined
                        ? {}
                        : { opacity: state.selectionHighlight.opacity }),
                    ...(state.selectionHighlight.dash === undefined
                        ? {}
                        : { dash: state.selectionHighlight.dash }),
                }, bounds, state.scene.theme);
                content.append(element);
            }
            const preparedAnnotations = [];
            for (const annotation of state.annotationsVisible ? state.annotations : []) {
                const bounds = targetBounds(annotation.target, state, actions);
                if (bounds === null)
                    continue;
                const prepared = prepareAnnotation(annotation, bounds, state);
                preparedAnnotations.push(prepared);
                if (!this.#annotationMeasurements.has(prepared.measurementKey))
                    content.append(prepared.bubble);
            }
            const activeMeasurementKeys = new Set(preparedAnnotations.map(({ measurementKey }) => measurementKey));
            for (const key of this.#annotationMeasurements.keys()) {
                if (!activeMeasurementKeys.has(key))
                    this.#annotationMeasurements.delete(key);
            }
            // All writes happen before the read phase, so even a full 256-callout
            // scene incurs one layout pass. Camera-only renders reuse the cached size.
            for (const prepared of preparedAnnotations) {
                if (this.#annotationMeasurements.has(prepared.measurementKey))
                    continue;
                const bounds = prepared.bubble.getBoundingClientRect();
                this.#annotationMeasurements.set(prepared.measurementKey, {
                    width: bounds.width,
                    height: bounds.height,
                });
            }
            const dataObstacles = preparedAnnotations.length === 0 ? [] : projectedDataObstacles(state, actions);
            const protectedObstacles = [insideLegendBounds(state), state.controlBounds].filter((bounds) => bounds !== null && bounds !== undefined);
            const occupiedCallouts = [];
            for (const prepared of preparedAnnotations) {
                prepared.bubble.remove();
                const measured = this.#annotationMeasurements.get(prepared.measurementKey) ?? {
                    width: prepared.fallbackWidth,
                    height: prepared.fallbackHeight,
                };
                const placed = placeAnnotation(prepared, state, measured, dataObstacles, protectedObstacles, occupiedCallouts);
                content.append(...placed.elements);
                occupiedCallouts.push(placed.bounds);
            }
            let focusTarget = null;
            if (state.legend !== null && state.legend.visible) {
                const legend = createLegend(state.legend, state, actions, focusedItemId);
                content.append(legend.element);
                focusTarget = legend.focusTarget;
            }
            const summary = `${state.selectionLabel}: ${state.selection.length}`;
            if (this.#live !== null && this.#live.textContent !== summary)
                this.#live.textContent = summary;
            focusTarget?.focus();
        }
        destroy() {
            this.#root?.remove();
            this.#root = null;
            this.#content = null;
            this.#live = null;
            this.#host = null;
            this.#annotationMeasurements.clear();
        }
    }

    function spatialGeometryAlphaClass(geometry) {
        let minimum = 1;
        let maximum = 0;
        for (let index = 3; index < geometry.colors.length; index += 4) {
            const alpha = geometry.colors[index] ?? 0;
            minimum = Math.min(minimum, alpha);
            maximum = Math.max(maximum, alpha);
        }
        if (maximum <= 0)
            return 'hidden';
        return minimum >= 1 ? 'opaque' : 'transparent';
    }
    function geometryCenter(positions) {
        if (positions.length < 3)
            return [0, 0, 0];
        let x = 0;
        let y = 0;
        let z = 0;
        const count = Math.floor(positions.length / 3);
        for (let index = 0; index < count; index += 1) {
            x += positions[index * 3] ?? 0;
            y += positions[index * 3 + 1] ?? 0;
            z += positions[index * 3 + 2] ?? 0;
        }
        return [x / count, y / count, z / count];
    }
    function squaredDistance(left, right) {
        return (left[0] - right[0]) ** 2 + (left[1] - right[1]) ** 2 + (left[2] - right[2]) ** 2;
    }
    const vertexShaderSource = `
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec4 a_color;
attribute float a_size;
uniform mat4 u_mvp;
uniform float u_pixelRatio;
varying vec3 v_normal;
varying vec4 v_color;
void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0);
  gl_PointSize = max(1.0, a_size * u_pixelRatio);
  v_normal = a_normal;
  v_color = a_color;
}
`;
    const fragmentShaderSource = `
precision highp float;
uniform vec3 u_lightDirection;
uniform float u_ambient;
uniform float u_diffuse;
uniform float u_pointMode;
varying vec3 v_normal;
varying vec4 v_color;
void main() {
  float edgeAlpha = 1.0;
  vec3 normal = normalize(v_normal);
  if (u_pointMode > 0.5) {
    vec2 centered = gl_PointCoord * 2.0 - 1.0;
    float radiusSquared = dot(centered, centered);
    if (radiusSquared > 1.0) discard;
    normal = normalize(vec3(centered.x, -centered.y, sqrt(max(0.0, 1.0 - radiusSquared))));
    float coverage = 1.0 - smoothstep(0.82, 1.0, sqrt(radiusSquared));
    if (coverage < 0.04) discard;
    edgeAlpha = v_color.a >= 0.999 ? 1.0 : coverage;
  } else if (!gl_FrontFacing) {
    normal = -normal;
  }
  float lambert = max(dot(normal, normalize(-u_lightDirection)), 0.0);
  float light = clamp(u_ambient + u_diffuse * lambert, 0.0, 1.5);
  if (u_pointMode > 0.5) {
    float centerLight = 0.5 + normal.z * 0.5;
    light = clamp(u_ambient + u_diffuse * (lambert * 0.45 + centerLight * 0.55), 0.0, 1.5);
  }
  gl_FragColor = vec4(v_color.rgb * light, v_color.a * edgeAlpha);
}
`;
    const pickVertexShaderSource = `
attribute vec3 a_position;
attribute vec4 a_pickColor;
uniform mat4 u_mvp;
uniform float u_pointDiameter;
varying vec4 v_pickColor;
void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0);
  gl_PointSize = u_pointDiameter;
  v_pickColor = a_pickColor;
}
`;
    const pickFragmentShaderSource = `
precision highp float;
varying vec4 v_pickColor;
void main() {
  vec2 centered = gl_PointCoord * 2.0 - 1.0;
  if (dot(centered, centered) > 1.0) discard;
  gl_FragColor = v_pickColor;
}
`;
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        if (shader === null)
            throw new Error('Unable to allocate a GPU shader.');
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const message = gl.getShaderInfoLog(shader) ?? 'Unknown shader compilation error.';
            gl.deleteShader(shader);
            throw new Error(message);
        }
        return shader;
    }
    function requiredLocation(gl, program, name) {
        const location = gl.getUniformLocation(program, name);
        if (location === null)
            throw new Error(`GPU uniform ${name} was optimized away.`);
        return location;
    }
    function createProgram(gl) {
        const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = gl.createProgram();
        if (program === null)
            throw new Error('Unable to allocate a GPU program.');
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const message = gl.getProgramInfoLog(program) ?? 'Unknown GPU program link error.';
            gl.deleteProgram(program);
            throw new Error(message);
        }
        const position = gl.getAttribLocation(program, 'a_position');
        const normal = gl.getAttribLocation(program, 'a_normal');
        const color = gl.getAttribLocation(program, 'a_color');
        const size = gl.getAttribLocation(program, 'a_size');
        if (position < 0 || normal < 0 || color < 0 || size < 0)
            throw new Error('GPU program is missing a required vertex attribute.');
        return {
            program,
            position,
            normal,
            color,
            size,
            mvp: requiredLocation(gl, program, 'u_mvp'),
            lightDirection: requiredLocation(gl, program, 'u_lightDirection'),
            ambient: requiredLocation(gl, program, 'u_ambient'),
            diffuse: requiredLocation(gl, program, 'u_diffuse'),
            pixelRatio: requiredLocation(gl, program, 'u_pixelRatio'),
            pointMode: requiredLocation(gl, program, 'u_pointMode'),
        };
    }
    function createPickProgram(gl) {
        const vertex = createShader(gl, gl.VERTEX_SHADER, pickVertexShaderSource);
        const fragment = createShader(gl, gl.FRAGMENT_SHADER, pickFragmentShaderSource);
        const program = gl.createProgram();
        if (program === null)
            throw new Error('Unable to allocate a GPU picking program.');
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const message = gl.getProgramInfoLog(program) ?? 'Unknown GPU picking program link error.';
            gl.deleteProgram(program);
            throw new Error(message);
        }
        const position = gl.getAttribLocation(program, 'a_position');
        const color = gl.getAttribLocation(program, 'a_pickColor');
        if (position < 0 || color < 0)
            throw new Error('GPU picking program is missing a required vertex attribute.');
        return {
            program,
            position,
            color,
            mvp: requiredLocation(gl, program, 'u_mvp'),
            pointDiameter: requiredLocation(gl, program, 'u_pointDiameter'),
        };
    }
    function encodedPickColor(identifier) {
        return [
            (identifier & 0xff) / 255,
            ((identifier >>> 8) & 0xff) / 255,
            ((identifier >>> 16) & 0xff) / 255,
            1,
        ];
    }
    function decodedPickIdentifier(pixel) {
        return (pixel[0] ?? 0) | ((pixel[1] ?? 0) << 8) | ((pixel[2] ?? 0) << 16);
    }
    function isGlobePickFrontFacing(pick, camera) {
        if (pick.occlusion !== 'globe-front')
            return true;
        const outward = normalize3(pick.position);
        return dot3(outward, subtract3(cameraEye(camera), pick.position)) > 0;
    }
    function createArrayBuffer(gl, data) {
        const buffer = gl.createBuffer();
        if (buffer === null)
            throw new Error('Unable to allocate a GPU buffer.');
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        return buffer;
    }
    function maximumIndex(indices) {
        let maximum = 0;
        for (const index of indices)
            maximum = Math.max(maximum, index);
        return maximum;
    }
    function createIndexBuffer(gl, indices) {
        const buffer = gl.createBuffer();
        if (buffer === null)
            throw new Error('Unable to allocate a GPU index buffer.');
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        if (maximumIndex(indices) <= 65_535) {
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
            return { buffer, type: gl.UNSIGNED_SHORT };
        }
        const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
        if (!isWebGL2 && gl.getExtension('OES_element_index_uint') === null)
            throw new Error('This GPU cannot address a spatial mesh with more than 65,535 vertices.');
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        return { buffer, type: gl.UNSIGNED_INT };
    }
    function primitiveMode(gl, geometry) {
        if (geometry.primitive === 'points')
            return gl.POINTS;
        if (geometry.primitive === 'lines')
            return gl.LINES;
        return gl.TRIANGLES;
    }
    function bindAttribute(gl, location, buffer, size) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    }
    class SpatialWebGLRenderer {
        #callbacks;
        #canvas;
        #gl = null;
        #program = null;
        #pickProgram = null;
        #scene = null;
        #camera = null;
        #geometries = [];
        #pickGpu = null;
        #pickTargets = [];
        #pickFramebuffer = null;
        #pickTexture = null;
        #pickDepth = null;
        #pickDirty = true;
        #pickRadius = -1;
        #width = 1;
        #height = 1;
        #pixelRatio = 1;
        #lost = false;
        #destroyed = false;
        #contextLostListener = (event) => {
            event.preventDefault();
            this.#lost = true;
            this.#geometries = [];
            this.#program = null;
            this.#pickProgram = null;
            this.#pickGpu = null;
            this.#pickFramebuffer = null;
            this.#pickTexture = null;
            this.#pickDepth = null;
            this.#pickDirty = true;
            this.#callbacks.contextLost();
        };
        #contextRestoredListener = () => {
            this.#lost = false;
            try {
                this.#initializeContext();
                this.#uploadScene();
                this.render();
                this.#callbacks.contextRestored();
            }
            catch (error) {
                this.#lost = true;
                this.#callbacks.unavailable(error instanceof Error ? error.message : String(error));
                this.#callbacks.error(error);
            }
        };
        constructor(callbacks) {
            this.#callbacks = callbacks;
            this.#canvas = document.createElement('canvas');
            this.#canvas.dataset.graflumeSpatialSurface = 'true';
            this.#canvas.setAttribute('role', 'img');
            this.#canvas.tabIndex = 0;
            this.#canvas.style.display = 'block';
            this.#canvas.style.width = '100%';
            this.#canvas.style.height = '100%';
            this.#canvas.style.touchAction = 'pan-y';
            this.#canvas.addEventListener('webglcontextlost', this.#contextLostListener);
            this.#canvas.addEventListener('webglcontextrestored', this.#contextRestoredListener);
        }
        mount(target, ariaLabel, ariaDescription) {
            this.#canvas.setAttribute('aria-label', ariaLabel);
            if (ariaDescription !== undefined)
                this.#canvas.setAttribute('aria-description', ariaDescription);
            target.append(this.#canvas);
            try {
                this.#initializeContext();
                return true;
            }
            catch (error) {
                this.#canvas.hidden = true;
                this.#callbacks.unavailable(error instanceof Error ? error.message : String(error));
                return false;
            }
        }
        surface() {
            return this.#canvas;
        }
        available() {
            return this.#gl !== null && this.#program !== null && !this.#lost && !this.#destroyed;
        }
        resize(width, height, pixelRatio) {
            this.#width = Math.max(1, width);
            this.#height = Math.max(1, height);
            this.#pixelRatio = Math.max(0.25, Math.min(4, pixelRatio));
            const physicalWidth = Math.max(1, Math.round(this.#width * this.#pixelRatio));
            const physicalHeight = Math.max(1, Math.round(this.#height * this.#pixelRatio));
            const physicalSizeChanged = this.#canvas.width !== physicalWidth || this.#canvas.height !== physicalHeight;
            if (this.#canvas.width !== physicalWidth)
                this.#canvas.width = physicalWidth;
            if (this.#canvas.height !== physicalHeight)
                this.#canvas.height = physicalHeight;
            if (physicalSizeChanged)
                this.#deletePickingFramebuffer();
            this.#canvas.style.width = `${this.#width}px`;
            this.#canvas.style.height = `${this.#height}px`;
            this.#pickDirty = true;
            this.render();
        }
        setScene(scene) {
            this.#scene = scene;
            this.#pickDirty = true;
            this.#uploadScene();
        }
        setCamera(camera) {
            this.#camera = camera;
            this.#pickDirty = true;
        }
        render() {
            const gl = this.#gl;
            const program = this.#program;
            const scene = this.#scene;
            const camera = this.#camera;
            if (gl === null || program === null || scene === null || camera === null || this.#lost)
                return;
            gl.viewport(0, 0, this.#canvas.width, this.#canvas.height);
            const background = spatialColor(scene.spec.background ?? scene.theme.colors.panel ?? scene.theme.colors.surface);
            gl.clearColor(background[0], background[1], background[2], background[3]);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.disable(gl.CULL_FACE);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.useProgram(program.program);
            const matrix = viewProjectionMat4(camera, this.#width, this.#height);
            gl.uniformMatrix4fv(program.mvp, false, matrix);
            const lighting = scene.spec.lighting ?? {};
            const direction = lighting.direction ?? [0.4, 0.8, 0.7];
            gl.uniform3f(program.lightDirection, direction[0], direction[1], direction[2]);
            gl.uniform1f(program.ambient, Math.max(0, lighting.ambient ?? 0.42));
            gl.uniform1f(program.diffuse, Math.max(0, lighting.diffuse ?? 0.72));
            gl.uniform1f(program.pixelRatio, this.#pixelRatio);
            const opaque = this.#geometries.filter(({ alphaClass }) => alphaClass === 'opaque');
            const eye = cameraEye(camera);
            const transparent = this.#geometries
                .filter(({ alphaClass }) => alphaClass === 'transparent')
                .sort((left, right) => squaredDistance(right.center, eye) - squaredDistance(left.center, eye));
            gl.depthMask(true);
            this.#drawGeometries(gl, program, opaque);
            gl.depthMask(false);
            this.#drawGeometries(gl, program, transparent);
            gl.depthMask(true);
        }
        hitTest(x, y, radius = 14) {
            const scene = this.#scene;
            const camera = this.#camera;
            if (scene === null || camera === null)
                return null;
            const gpuPick = this.#gpuHitTest(x, y, radius);
            if (gpuPick !== undefined)
                return gpuPick;
            const matrix = viewProjectionMat4(camera, this.#width, this.#height);
            let best = null;
            let bestDistance = radius;
            for (const geometry of scene.geometries) {
                if (spatialGeometryAlphaClass(geometry) === 'hidden')
                    continue;
                for (const pick of geometry.picks) {
                    if (!isGlobePickFrontFacing(pick, camera))
                        continue;
                    const projected = projectPoint(matrix, pick.position, this.#width, this.#height);
                    if (!projected.visible)
                        continue;
                    const distance = Math.hypot(projected.x - x, projected.y - y);
                    if (distance > bestDistance ||
                        (Math.abs(distance - bestDistance) < 0.01 &&
                            best !== null &&
                            projected.depth >= best.screen.depth))
                        continue;
                    bestDistance = distance;
                    best = { ...pick, screen: { x: projected.x, y: projected.y, depth: projected.depth } };
                }
            }
            return best;
        }
        project(position) {
            const camera = this.#camera;
            if (camera === null)
                return null;
            return projectPoint(viewProjectionMat4(camera, this.#width, this.#height), position, this.#width, this.#height);
        }
        toDataURL() {
            this.render();
            return this.#canvas.toDataURL('image/png');
        }
        destroy() {
            if (this.#destroyed)
                return;
            this.#destroyed = true;
            this.#deleteGpuResources();
            this.#canvas.removeEventListener('webglcontextlost', this.#contextLostListener);
            this.#canvas.removeEventListener('webglcontextrestored', this.#contextRestoredListener);
            this.#canvas.remove();
            this.#gl = null;
            this.#program = null;
            this.#scene = null;
        }
        #initializeContext() {
            if (this.#destroyed)
                throw new Error('Spatial renderer has been destroyed.');
            const attributes = {
                alpha: true,
                antialias: true,
                depth: true,
                preserveDrawingBuffer: true,
                premultipliedAlpha: false,
            };
            const gl = this.#canvas.getContext('webgl2', attributes) ?? this.#canvas.getContext('webgl', attributes);
            if (gl === null)
                throw new Error('Hardware-accelerated 3D rendering is unavailable.');
            this.#gl = gl;
            this.#program = createProgram(gl);
            this.#pickProgram = createPickProgram(gl);
            this.#pickDirty = true;
        }
        #uploadScene() {
            const gl = this.#gl;
            const scene = this.#scene;
            if (gl === null || scene === null || this.#lost)
                return;
            this.#deleteGeometryBuffers();
            this.#geometries = scene.geometries
                .filter((source) => spatialGeometryAlphaClass(source) !== 'hidden')
                .map((source) => {
                const base = {
                    source,
                    alphaClass: spatialGeometryAlphaClass(source),
                    center: geometryCenter(source.positions),
                    position: createArrayBuffer(gl, source.positions),
                    normal: createArrayBuffer(gl, source.normals),
                    color: createArrayBuffer(gl, source.colors),
                    size: createArrayBuffer(gl, source.sizes),
                };
                if (source.indices === undefined)
                    return base;
                const index = createIndexBuffer(gl, source.indices);
                return {
                    ...base,
                    index: index.buffer,
                    indexType: index.type,
                    indexCount: source.indices.length,
                };
            });
            this.#uploadPickTargets();
            this.#pickDirty = true;
        }
        #uploadPickTargets() {
            const gl = this.#gl;
            const scene = this.#scene;
            if (gl === null || scene === null)
                return;
            for (const geometry of this.#geometries)
                for (const pick of geometry.source.picks)
                    this.#pickTargets.push(pick);
            if (this.#pickTargets.length === 0)
                return;
            if (this.#pickTargets.length > 0xff_ff_ff)
                throw new RangeError('The GPU picking pass supports at most 16,777,215 targets.');
            const positions = new Float32Array(this.#pickTargets.length * 3);
            const colors = new Float32Array(this.#pickTargets.length * 4);
            for (const [index, pick] of this.#pickTargets.entries()) {
                positions.set(pick.position, index * 3);
                colors.set(encodedPickColor(index + 1), index * 4);
            }
            this.#pickGpu = {
                position: createArrayBuffer(gl, positions),
                color: createArrayBuffer(gl, colors),
                count: this.#pickTargets.length,
            };
        }
        #drawGeometries(gl, program, geometries = this.#geometries) {
            for (const geometry of geometries) {
                const offsetSurfaceFill = geometry.source.primitive === 'triangles' &&
                    geometry.source.role === 'primary' &&
                    geometry.source.provenance?.family === 'surface' &&
                    this.#geometries.some((candidate) => candidate.source.role === 'wire-overlay' &&
                        candidate.source.id.startsWith(`${geometry.source.id}:`)) &&
                    typeof gl.polygonOffset === 'function';
                if (offsetSurfaceFill) {
                    gl.enable(gl.POLYGON_OFFSET_FILL);
                    gl.polygonOffset(1, 1);
                }
                bindAttribute(gl, program.position, geometry.position, 3);
                bindAttribute(gl, program.normal, geometry.normal, 3);
                bindAttribute(gl, program.color, geometry.color, 4);
                bindAttribute(gl, program.size, geometry.size, 1);
                gl.uniform1f(program.pointMode, geometry.source.primitive === 'points' ? 1 : 0);
                const mode = primitiveMode(gl, geometry.source);
                if (geometry.index !== undefined &&
                    geometry.indexType !== undefined &&
                    geometry.indexCount !== undefined) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.index);
                    gl.drawElements(mode, geometry.indexCount, geometry.indexType, 0);
                }
                else {
                    gl.drawArrays(mode, 0, geometry.source.positions.length / 3);
                }
                if (offsetSurfaceFill)
                    gl.disable(gl.POLYGON_OFFSET_FILL);
            }
        }
        #prepareSceneProgram(gl, program, scene, camera) {
            const matrix = viewProjectionMat4(camera, this.#width, this.#height);
            gl.useProgram(program.program);
            gl.uniformMatrix4fv(program.mvp, false, matrix);
            const lighting = scene.spec.lighting ?? {};
            const direction = lighting.direction ?? [0.4, 0.8, 0.7];
            gl.uniform3f(program.lightDirection, direction[0], direction[1], direction[2]);
            gl.uniform1f(program.ambient, Math.max(0, lighting.ambient ?? 0.42));
            gl.uniform1f(program.diffuse, Math.max(0, lighting.diffuse ?? 0.72));
            gl.uniform1f(program.pixelRatio, this.#pixelRatio);
        }
        #ensurePickingFramebuffer() {
            const gl = this.#gl;
            if (gl === null || this.#pickFramebuffer !== null)
                return;
            const framebuffer = gl.createFramebuffer();
            const texture = gl.createTexture();
            const depth = gl.createRenderbuffer();
            if (framebuffer === null || texture === null || depth === null) {
                if (framebuffer !== null)
                    gl.deleteFramebuffer(framebuffer);
                if (texture !== null)
                    gl.deleteTexture(texture);
                if (depth !== null)
                    gl.deleteRenderbuffer(depth);
                throw new Error('Unable to allocate the depth-aware picking target.');
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.#canvas.width, this.#canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.#canvas.width, this.#canvas.height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
            const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            if (!complete) {
                gl.deleteFramebuffer(framebuffer);
                gl.deleteTexture(texture);
                gl.deleteRenderbuffer(depth);
                throw new Error('The depth-aware picking target is incomplete.');
            }
            this.#pickFramebuffer = framebuffer;
            this.#pickTexture = texture;
            this.#pickDepth = depth;
        }
        #renderPickingBuffer(radius) {
            const gl = this.#gl;
            const program = this.#program;
            const pickProgram = this.#pickProgram;
            const scene = this.#scene;
            const camera = this.#camera;
            const pickGpu = this.#pickGpu;
            if (gl === null ||
                program === null ||
                pickProgram === null ||
                scene === null ||
                camera === null ||
                pickGpu === null ||
                this.#lost)
                return false;
            this.#ensurePickingFramebuffer();
            if (this.#pickFramebuffer === null)
                return false;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.#pickFramebuffer);
            gl.viewport(0, 0, this.#canvas.width, this.#canvas.height);
            gl.colorMask(true, true, true, true);
            gl.depthMask(true);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.disable(gl.CULL_FACE);
            gl.disable(gl.BLEND);
            this.#prepareSceneProgram(gl, program, scene, camera);
            gl.colorMask(false, false, false, false);
            this.#drawGeometries(gl, program, this.#geometries.filter(({ alphaClass }) => alphaClass === 'opaque'));
            gl.colorMask(true, true, true, true);
            gl.useProgram(pickProgram.program);
            gl.uniformMatrix4fv(pickProgram.mvp, false, viewProjectionMat4(camera, this.#width, this.#height));
            gl.uniform1f(pickProgram.pointDiameter, Math.max(2, radius * 2 * this.#pixelRatio));
            bindAttribute(gl, pickProgram.position, pickGpu.position, 3);
            bindAttribute(gl, pickProgram.color, pickGpu.color, 4);
            gl.drawArrays(gl.POINTS, 0, pickGpu.count);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            this.#pickDirty = false;
            this.#pickRadius = radius;
            return true;
        }
        #gpuHitTest(x, y, radius) {
            const gl = this.#gl;
            const camera = this.#camera;
            if (gl === null || camera === null || this.#lost)
                return undefined;
            if (this.#pickTargets.length === 0)
                return null;
            try {
                if (this.#pickDirty || this.#pickRadius !== radius) {
                    if (!this.#renderPickingBuffer(radius))
                        return null;
                }
                if (this.#pickFramebuffer === null)
                    return null;
                const physicalX = Math.max(0, Math.min(this.#canvas.width - 1, Math.floor(x * this.#pixelRatio)));
                const physicalY = Math.max(0, Math.min(this.#canvas.height - 1, this.#canvas.height - 1 - Math.floor(y * this.#pixelRatio)));
                const pixel = new Uint8Array(4);
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.#pickFramebuffer);
                gl.readPixels(physicalX, physicalY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                const identifier = decodedPickIdentifier(pixel);
                if (identifier === 0)
                    return null;
                const pick = this.#pickTargets[identifier - 1];
                if (pick === undefined)
                    return null;
                const projected = projectPoint(viewProjectionMat4(camera, this.#width, this.#height), pick.position, this.#width, this.#height);
                if (!projected.visible)
                    return null;
                return { ...pick, screen: { x: projected.x, y: projected.y, depth: projected.depth } };
            }
            catch (error) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.colorMask(true, true, true, true);
                gl.depthMask(true);
                this.#callbacks.error(error);
                return null;
            }
        }
        #deletePickingFramebuffer() {
            const gl = this.#gl;
            if (gl !== null) {
                if (this.#pickFramebuffer !== null)
                    gl.deleteFramebuffer(this.#pickFramebuffer);
                if (this.#pickTexture !== null)
                    gl.deleteTexture(this.#pickTexture);
                if (this.#pickDepth !== null)
                    gl.deleteRenderbuffer(this.#pickDepth);
            }
            this.#pickFramebuffer = null;
            this.#pickTexture = null;
            this.#pickDepth = null;
            this.#pickDirty = true;
        }
        #deleteGeometryBuffers() {
            const gl = this.#gl;
            if (gl === null)
                return;
            for (const geometry of this.#geometries) {
                gl.deleteBuffer(geometry.position);
                gl.deleteBuffer(geometry.normal);
                gl.deleteBuffer(geometry.color);
                gl.deleteBuffer(geometry.size);
                if (geometry.index !== undefined)
                    gl.deleteBuffer(geometry.index);
            }
            this.#geometries = [];
            if (this.#pickGpu !== null) {
                gl.deleteBuffer(this.#pickGpu.position);
                gl.deleteBuffer(this.#pickGpu.color);
                this.#pickGpu = null;
            }
            this.#pickTargets = [];
        }
        #deleteGpuResources() {
            const gl = this.#gl;
            if (gl === null)
                return;
            this.#deleteGeometryBuffers();
            if (this.#program !== null)
                gl.deleteProgram(this.#program.program);
            if (this.#pickProgram !== null)
                gl.deleteProgram(this.#pickProgram.program);
            this.#deletePickingFramebuffer();
        }
    }

    function spatialPlotViewport(spec, width, height, reflowLegend = false) {
        const input = spec.legend;
        if (input === undefined ||
            input === false ||
            (typeof input === 'object' && input.visible === false))
            return { x: 0, y: 0, width, height };
        const authoredPosition = typeof input === 'object' ? (input.position ?? 'right') : 'right';
        const position = reflowLegend && (input === true || (typeof input === 'object' && input.position === undefined))
            ? 'bottom'
            : authoredPosition;
        if (position.startsWith('inside-'))
            return { x: 0, y: 0, width, height };
        if (position === 'top' || position === 'bottom') {
            const rail = Math.min(Math.max(0, height - 1), Math.max(32, Math.min(72, height * 0.2)));
            return {
                x: 0,
                y: position === 'top' ? rail : 0,
                width,
                height: Math.max(1, height - rail),
            };
        }
        const rail = Math.min(Math.max(0, width - 1), Math.max(88, Math.min(176, width * 0.3)));
        return {
            x: position === 'left' ? rail : 0,
            y: 0,
            width: Math.max(1, width - rail),
            height,
        };
    }
    const defaultLabels = {
        chart: 'Interactive three-dimensional chart',
        toolbar: 'Three-dimensional chart controls',
        orbit: 'Orbit camera',
        pan: 'Pan camera',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        reset: 'Reset camera',
        projection: 'Switch projection',
        fullscreen: 'Toggle fullscreen',
        exportPng: 'Download PNG',
        showAnnotations: 'Show annotations',
        hideAnnotations: 'Hide annotations',
        instructions: 'Drag to orbit. Use Pan mode, Shift-drag, or the secondary pointer button to pan. Use Control or Command with the wheel, pinch, or plus and minus keys to zoom. Arrow keys move the camera; zero resets it.',
        contextLost: 'The 3D rendering context was lost. Restoring…',
        unavailable: 'Hardware-accelerated 3D rendering is unavailable. The data table remains available.',
    };
    const svgNamespace = 'http://www.w3.org/2000/svg';
    let spatialSemanticViewSequence = 0;
    function resolveTarget(target) {
        if (typeof target !== 'string')
            return target;
        const element = document.querySelector(target);
        if (element === null)
            throw new Error(`Spatial chart target "${target}" was not found.`);
        return element;
    }
    function arrayLikeLength(value) {
        if (value === null || typeof value !== 'object')
            return 0;
        const length = value.length;
        return typeof length === 'number' && Number.isInteger(length) && length >= 0 ? length : 0;
    }
    function estimateSpatialRowCount(spec) {
        let total = 0;
        for (const layer of spec.layers) {
            const data = layer.data;
            if (data === undefined)
                continue;
            total += Math.max(arrayLikeLength(data.positions), arrayLikeLength(data.origins), arrayLikeLength(data.paths), arrayLikeLength(data.z), arrayLikeLength(data.values), arrayLikeLength(data.points), arrayLikeLength(data.routes));
        }
        return Math.min(Number.MAX_SAFE_INTEGER, total);
    }
    function eventPoint(event, element) {
        const bounds = element.getBoundingClientRect();
        return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    }
    function center(left, right) {
        return { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
    }
    function distance(left, right) {
        return Math.hypot(left.x - right.x, left.y - right.y);
    }
    function icon(paths, circles = []) {
        const svg = document.createElementNS(svgNamespace, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.style.pointerEvents = 'none';
        for (const value of paths) {
            const path = document.createElementNS(svgNamespace, 'path');
            path.setAttribute('d', value);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', 'currentColor');
            path.setAttribute('stroke-width', '1.8');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            svg.append(path);
        }
        for (const [cx, cy, radius] of circles) {
            const circle = document.createElementNS(svgNamespace, 'circle');
            circle.setAttribute('cx', String(cx));
            circle.setAttribute('cy', String(cy));
            circle.setAttribute('r', String(radius));
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', 'currentColor');
            circle.setAttribute('stroke-width', '1.8');
            svg.append(circle);
        }
        return svg;
    }
    function annotationIcon(visible) {
        return icon(visible
            ? ['M4.5 5.5h15v10h-9l-4 3v-3h-2v-10Z']
            : ['M4.5 5.5h15v10h-5', 'M10.5 15.5l-4 3v-3h-2v-10h2', 'M4 4l16 16']);
    }
    function safeText(value, limit = 160) {
        const text = value === null || value === undefined ? '—' : String(value);
        return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
    }
    function scalarEntries(datum, fields) {
        const selected = fields ?? Object.keys(datum);
        const output = [];
        for (const field of selected) {
            const value = datum[field];
            if (value !== null &&
                value !== undefined &&
                typeof value !== 'string' &&
                typeof value !== 'number' &&
                typeof value !== 'boolean')
                continue;
            output.push([field, safeText(value)]);
            if (output.length >= 8)
                break;
        }
        return output;
    }
    function safeId(value) {
        return value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
    }
    function colorCss(value) {
        const color = spatialColor(value);
        return `rgba(${Math.round(color[0] * 255)},${Math.round(color[1] * 255)},${Math.round(color[2] * 255)},${color[3]})`;
    }
    function layerColor(layer, theme, layerIndex, layerCount, endpoint) {
        if (layer.mark.type === 'volume')
            return colorCss(endpoint === 'high'
                ? (layer.mark.colorHigh ?? continuousColor(theme, 1))
                : (layer.mark.colorLow ?? continuousColor(theme, 0)));
        if (layer.mark.type === 'surface') {
            const data = layer.data;
            if (endpoint === undefined && 'positions' in data)
                return colorCss(data.colors?.[0] ?? layer.mark.color ?? categoricalColor(theme, layerIndex, layerCount));
            return colorCss(endpoint === 'high'
                ? (layer.mark.color ?? continuousColor(theme, 1))
                : continuousColor(theme, 0));
        }
        if (layer.mark.type === 'scatter') {
            const data = layer.data;
            if (endpoint === undefined && (data.values === undefined || data.values.length === 0))
                return colorCss(data.colors?.[0] ?? layer.mark.color ?? categoricalColor(theme, layerIndex, layerCount));
            return colorCss(endpoint === 'high'
                ? (layer.mark.color ?? continuousColor(theme, 1))
                : continuousColor(theme, 0));
        }
        if (layer.mark.type === 'vector') {
            const data = layer.data;
            return colorCss(data.colors?.[0] ?? layer.mark.color ?? categoricalColor(theme, layerIndex, layerCount));
        }
        if (layer.mark.type === 'globe') {
            const data = layer.data;
            return colorCss(data?.points?.[0]?.color ??
                layer.mark.pointColor ??
                layer.mark.landColor ??
                categoricalColor(theme, layerIndex, layerCount));
        }
        return categoricalColor(theme, layerIndex, layerCount);
    }
    function layerLegendSymbol(layer) {
        if (layer?.mark.type === 'scatter')
            return 'point';
        if (layer?.mark.type === 'vector' && layer.mark.mode === 'streamtube')
            return 'line';
        if (layer?.mark.type === 'globe')
            return 'point';
        return 'rect';
    }
    function cloneSpatialTarget(target) {
        if (target.type === 'datum') {
            return {
                ...target,
                ...(Array.isArray(target.datumIndex) ? { datumIndex: [...target.datumIndex] } : {}),
                ...(target.values === undefined ? {} : { values: [...target.values] }),
            };
        }
        if (target.type === 'point')
            return { type: 'point', position: [...target.position] };
        if (target.type === 'box') {
            return {
                type: 'box',
                min: [...target.min],
                max: [...target.max],
            };
        }
        return { ...target };
    }
    function cloneSpatialDatumTarget(target) {
        return cloneSpatialTarget(target);
    }
    function cloneSpatialAnnotation(annotation) {
        return {
            ...annotation,
            target: cloneSpatialTarget(annotation.target),
            ...(typeof annotation.connector === 'object'
                ? { connector: { ...annotation.connector, dash: [...(annotation.connector.dash ?? [])] } }
                : {}),
            ...(annotation.style === undefined ? {} : { style: { ...annotation.style } }),
        };
    }
    function spatialSelectionKey(target) {
        const values = target.field === undefined
            ? null
            : [...(target.values ?? [target.value ?? null])].sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
        const indices = target.datumIndex === undefined
            ? null
            : (Array.isArray(target.datumIndex) ? [...target.datumIndex] : [target.datumIndex]).sort((left, right) => left - right);
        return JSON.stringify([target.layerId ?? null, indices, target.field ?? null, values]);
    }
    class SpatialChart {
        #target;
        #wrapper;
        #renderer;
        #overlays = new SpatialOverlayController();
        #events = new EventEmitter();
        #options;
        #adaptiveOptions;
        #activePointers = new Map();
        #controlButtons = new Map();
        #semanticViewId;
        #spec;
        #scene;
        #camera;
        #initialCamera;
        #mode = 'orbit';
        #previousPointer = null;
        #pinch = null;
        #resizeObserver = null;
        #windowResizeListener = null;
        #adaptiveMediaLists = [];
        #adaptiveState;
        #tooltip = null;
        #fallback = null;
        #accessibility = null;
        #scopedStyle = null;
        #instructions = null;
        #controls = null;
        #destroyed = false;
        #availability = { status: 'initializing', available: false };
        #width = 1;
        #height = 1;
        #plotViewport = { x: 0, y: 0, width: 1, height: 1 };
        #gestureActive = false;
        #hiddenLegendItems = new Set();
        #selection = [];
        #annotations = [];
        #annotationsVisible = true;
        #annotationSequence = 0;
        #semanticNavigation = null;
        #semanticNavigationSignature = '';
        #semanticKeyboardNavigation = false;
        #semanticFocusRing = null;
        #semanticMarks = new Map();
        #linkedFocusUnregister = null;
        #linkedFocusUnsubscribe = null;
        #applyingLinkedFocus = false;
        #lastPublishedSemanticId = null;
        #adaptiveMediaListener = () => {
            if (!this.#destroyed)
                this.resize();
        };
        constructor(target, spec, options = {}) {
            if (typeof document === 'undefined')
                throw new Error('A DOM environment is required for a spatial chart.');
            this.#target = resolveTarget(target);
            spatialSemanticViewSequence += 1;
            this.#semanticViewId = `spatial-view-${spatialSemanticViewSequence}`;
            this.#spec = spec;
            this.#options = options;
            this.#adaptiveOptions = normalizeAdaptiveOptions(options.adaptive);
            this.#adaptiveState = resolveAdaptiveProfile(detectBrowserAdaptiveEnvironment({
                width: options.width ?? (this.#target.clientWidth || 640),
                height: options.height ?? (this.#target.clientHeight || 420),
                rowCount: estimateSpatialRowCount(spec),
            }, this.#adaptiveOptions.environment), this.#adaptiveOptions);
            this.#scene = compileSpatial(spec);
            this.#annotations = (spec.annotations ?? []).map((annotation, index) => ({
                ...cloneSpatialAnnotation(annotation),
                id: annotation.id ?? `annotation-${index}`,
            }));
            this.#camera = this.#cameraForScene(this.#scene);
            this.#initialCamera = this.#camera;
            this.#wrapper = document.createElement('div');
            this.#wrapper.dataset.graflumeSpatial = 'true';
            this.#wrapper.style.position = 'relative';
            this.#wrapper.style.overflow = 'hidden';
            this.#wrapper.style.width = '100%';
            this.#wrapper.style.height =
                options.height === undefined ? '100%' : `${Math.max(1, options.height)}px`;
            this.#wrapper.style.minHeight = options.height === undefined ? '280px' : '0';
            this.#applyThemeChrome();
            this.#renderer = new SpatialWebGLRenderer({
                contextLost: () => {
                    this.#showFallback('context-lost');
                    this.#events.emit('contextloss', { chart: this });
                },
                contextRestored: () => {
                    this.#hideFallback();
                    this.#setAvailability('ready');
                    this.#events.emit('contextrestore', { chart: this });
                    this.render();
                },
                unavailable: () => this.#showFallback('unavailable'),
                error: (error) => this.#events.emit('error', { chart: this, error }),
            });
            try {
                this.#installScopedStyles();
                this.#target.append(this.#wrapper);
                const labels = { ...defaultLabels, ...spec.interaction?.labels };
                const accessibleDescription = spatialAccessibleDescription(spec.accessibility?.description, labels.instructions);
                const mounted = this.#renderer.mount(this.#wrapper, this.#chartLabel(labels), accessibleDescription);
                if (mounted)
                    this.#setAvailability('ready');
                this.#renderer.setScene(this.#scene);
                this.#renderer.setCamera(this.#camera);
                this.#syncSemanticNavigation();
                this.#syncAccessibilityDom();
                this.#renderAccessibilityTable();
                this.#syncControlStructure();
                this.#syncAvailabilityCopy();
                this.#attachInteraction();
                this.#configureResize();
                this.resize(options.width, options.height);
                this.render();
            }
            catch (error) {
                try {
                    this.destroy();
                }
                catch {
                    // Preserve the original constructor failure after best-effort cleanup.
                }
                throw error;
            }
        }
        getSpec() {
            return this.#spec;
        }
        getAdaptiveState() {
            this.#assertAlive();
            return this.#adaptiveState;
        }
        setSpec(spec) {
            this.#assertAlive();
            const scene = compileSpatial(spec);
            this.#spec = spec;
            this.#scene = scene;
            this.#hiddenLegendItems.clear();
            this.#selection = [];
            this.#annotationsVisible = true;
            this.#annotations = (spec.annotations ?? []).map((annotation, index) => ({
                ...cloneSpatialAnnotation(annotation),
                id: annotation.id ?? `annotation-${index}`,
            }));
            this.#camera = this.#cameraForScene(scene);
            this.#initialCamera = this.#camera;
            this.#renderer.setScene(scene);
            this.#renderer.setCamera(this.#camera);
            this.#syncSemanticNavigation();
            this.#applyThemeChrome();
            this.#hideTooltip();
            this.#syncAccessibilityDom();
            this.#renderAccessibilityTable();
            this.#syncControlStructure();
            this.#syncAvailabilityCopy();
            this.#resizeRendererViewport();
            this.#emitCamera('spec');
            this.render();
            this.#events.emit('legendchange', {
                chart: this,
                state: this.getLegendState(),
                reason: 'spec',
            });
            this.#emitSelection('spec');
            this.#emitAnnotations('spec');
            this.#emitAnnotationVisibility('spec');
        }
        getLegendState() {
            const resolved = this.#legendOverlayState();
            return {
                enabled: resolved !== null,
                items: resolved?.items.map((item) => ({
                    id: item.id,
                    label: item.label,
                    color: item.color,
                    visible: item.visible,
                    toggleable: item.toggleable,
                    symbol: item.symbol,
                    ...(item.layerId === undefined ? {} : { layerId: item.layerId }),
                    ...(item.value === undefined ? {} : { value: item.value }),
                })) ?? [],
            };
        }
        setLegendItemVisible(id, visible) {
            this.#setLegendItemVisible(id, visible, 'programmatic');
        }
        resetLegend() {
            this.#assertAlive();
            if (this.#hiddenLegendItems.size === 0)
                return;
            this.#hiddenLegendItems.clear();
            this.#installEffectiveScene();
            this.render();
            this.#events.emit('legendchange', {
                chart: this,
                state: this.getLegendState(),
                reason: 'reset',
            });
        }
        getSelection() {
            return {
                enabled: this.#selectionConfig() !== false,
                items: this.#selection.map(cloneSpatialDatumTarget),
            };
        }
        setSelection(items) {
            this.#assertAlive();
            if (this.#selectionConfig() === false)
                throw new TypeError('Enable interaction.selection before setting selection state.');
            assertValidSpatialSpec({
                ...this.#spec,
                // Replace authored highlights while validating selection targets so
                // their count and IDs cannot interfere with transient selection state.
                highlights: items.map((target) => ({ target })),
            });
            const selection = this.#selectionConfig();
            if (selection !== false && selection.mode === 'single' && items.length > 1)
                throw new TypeError('Single selection mode accepts at most one target.');
            const next = items.map(cloneSpatialDatumTarget);
            const keys = next.map(spatialSelectionKey);
            if (new Set(keys).size !== keys.length)
                throw new TypeError('Selection targets must be unique.');
            if (next.length === this.#selection.length &&
                next.every((target, index) => spatialSelectionKey(target) === spatialSelectionKey(this.#selection[index])))
                return;
            this.#selection = next;
            this.render();
            this.#emitSelection('programmatic');
        }
        clearSelection() {
            this.#assertAlive();
            if (this.#selection.length === 0)
                return;
            this.#selection = [];
            this.render();
            this.#emitSelection('clear');
        }
        getAnnotations() {
            return this.#annotations.map(cloneSpatialAnnotation);
        }
        getAnnotationsVisible() {
            this.#assertAlive();
            return this.#annotationsVisible;
        }
        setAnnotationsVisible(visible) {
            this.#setAnnotationsVisible(visible, 'programmatic');
        }
        toggleAnnotations() {
            this.#assertAlive();
            this.#setAnnotationsVisible(!this.#annotationsVisible, 'toggle');
        }
        setAnnotations(annotations) {
            this.#assertAlive();
            const resolved = annotations.map((annotation, index) => ({
                ...cloneSpatialAnnotation(annotation),
                id: annotation.id ?? `annotation-${index}`,
            }));
            assertValidSpatialSpec({ ...this.#spec, annotations: resolved });
            this.#annotations = resolved;
            this.render();
            this.#emitAnnotations('set');
        }
        addAnnotation(annotation) {
            this.#assertAlive();
            this.#annotationSequence += 1;
            const id = annotation.id ?? `annotation-runtime-${this.#annotationSequence}`;
            if (this.#annotations.some((candidate) => candidate.id === id))
                throw new TypeError(`Spatial annotation "${id}" already exists.`);
            const next = [...this.#annotations, { ...cloneSpatialAnnotation(annotation), id }];
            assertValidSpatialSpec({ ...this.#spec, annotations: next });
            this.#annotations = next;
            this.render();
            this.#emitAnnotations('add', id);
            return id;
        }
        updateAnnotation(id, patch) {
            this.#assertAlive();
            const index = this.#annotations.findIndex((annotation) => annotation.id === id);
            if (index < 0)
                throw new TypeError(`Spatial annotation "${id}" was not found.`);
            const updated = cloneSpatialAnnotation({
                ...this.#annotations[index],
                ...patch,
                id,
            });
            const next = this.#annotations.map((annotation, candidate) => candidate === index ? updated : annotation);
            assertValidSpatialSpec({ ...this.#spec, annotations: next });
            this.#annotations = next;
            this.render();
            this.#emitAnnotations('update', id);
        }
        removeAnnotation(id) {
            this.#assertAlive();
            const next = this.#annotations.filter((annotation) => annotation.id !== id);
            if (next.length === this.#annotations.length)
                return false;
            this.#annotations = next;
            this.render();
            this.#emitAnnotations('remove', id);
            return true;
        }
        getCamera() {
            return { ...this.#camera, target: [...this.#camera.target] };
        }
        getAvailability() {
            return { ...this.#availability };
        }
        getSemanticNavigationState() {
            return (this.#semanticNavigation?.state() ?? {
                version: 1,
                rowCount: 0,
                activeIndex: null,
                activeNodeId: null,
                projected: null,
            });
        }
        focusSemanticNode(nodeId) {
            this.#assertAlive();
            if (this.#semanticNavigation === null)
                throw new TypeError('Enable accessibility.navigation before focusing GPU marks.');
            this.#semanticNavigation.focusNode(nodeId);
        }
        clearSemanticFocus() {
            this.#assertAlive();
            this.#semanticNavigation?.clear();
            this.#lastPublishedSemanticId = null;
            const store = this.#focusStore();
            if (this.#spec.accessibility?.linkedFocus !== undefined &&
                store.state().focused?.sourceViewId === this.#semanticViewId) {
                store.clear();
            }
        }
        setCamera(camera) {
            this.#assertAlive();
            this.#camera = resolveSpatialCameraPatch(this.#spec, this.#camera, camera, this.#scene.bounds.radius);
            this.#renderer.setCamera(this.#camera);
            this.#emitCamera('spec');
            this.render();
        }
        orbitBy(deltaYaw, deltaPitch) {
            this.#assertFiniteInteraction('orbit deltaYaw', deltaYaw);
            this.#assertFiniteInteraction('orbit deltaPitch', deltaPitch);
            if (this.#spec.interaction?.orbit === false)
                return;
            this.#camera = {
                ...this.#camera,
                yaw: this.#camera.yaw + deltaYaw,
                pitch: clamp(this.#camera.pitch + deltaPitch, -Math.PI * 0.49, Math.PI * 0.49),
            };
            this.#renderer.setCamera(this.#camera);
            this.#emitCamera('orbit');
            this.render();
        }
        panBy(deltaX, deltaY) {
            this.#assertFiniteInteraction('pan deltaX', deltaX);
            this.#assertFiniteInteraction('pan deltaY', deltaY);
            if (this.#spec.interaction?.pan === false)
                return;
            const basis = cameraBasis(this.#camera);
            const scale = this.#camera.distance / Math.max(120, this.#plotViewport.height);
            const movement = add3(scale3(basis.right, -deltaX * scale), scale3(basis.up, deltaY * scale));
            this.#camera = { ...this.#camera, target: add3(this.#camera.target, movement) };
            this.#renderer.setCamera(this.#camera);
            this.#emitCamera('pan');
            this.render();
        }
        zoomBy(factor) {
            this.#assertFiniteInteraction('zoom factor', factor);
            if (factor <= 0)
                throw new RangeError('Spatial zoom factor must be greater than zero.');
            if (this.#spec.interaction?.zoom === false)
                return;
            const minimum = Math.max(0.001, this.#scene.bounds.radius * 0.08);
            const maximum = Math.max(100, this.#scene.bounds.radius * 100);
            this.#camera = {
                ...this.#camera,
                distance: clamp(this.#camera.distance / factor, minimum, maximum),
            };
            this.#renderer.setCamera(this.#camera);
            this.#emitCamera('zoom');
            this.render();
        }
        resetCamera() {
            this.#camera = {
                ...this.#initialCamera,
                target: [...this.#initialCamera.target],
            };
            this.#renderer.setCamera(this.#camera);
            this.#emitCamera('reset');
            this.render();
        }
        setProjection(projection) {
            if (projection !== 'perspective' && projection !== 'orthographic')
                return;
            this.#camera = { ...this.#camera, projection };
            this.#renderer.setCamera(this.#camera);
            this.#syncControlStructure();
            this.#emitCamera('projection');
            this.render();
        }
        resize(width, height) {
            this.#assertAlive();
            const fullscreen = document.fullscreenElement === this.#wrapper;
            const bounds = fullscreen
                ? this.#wrapper.getBoundingClientRect()
                : this.#target.getBoundingClientRect();
            const { width: resolvedWidth, height: resolvedHeight } = resolveSpatialSize({
                fullscreen,
                measuredWidth: bounds.width,
                measuredHeight: bounds.height,
                ...(width === undefined ? {} : { requestedWidth: width }),
                ...(height === undefined ? {} : { requestedHeight: height }),
                ...(this.#options.width === undefined ? {} : { configuredWidth: this.#options.width }),
                ...(this.#options.height === undefined ? {} : { configuredHeight: this.#options.height }),
            });
            const previousAdaptiveState = this.#adaptiveState;
            this.#adaptiveState = resolveAdaptiveProfile(detectBrowserAdaptiveEnvironment({
                width: resolvedWidth,
                height: resolvedHeight,
                rowCount: estimateSpatialRowCount(this.#spec),
            }, this.#adaptiveOptions.environment), this.#adaptiveOptions);
            this.#width = resolvedWidth;
            this.#height = resolvedHeight;
            this.#wrapper.style.height = `${resolvedHeight}px`;
            this.#resizeRendererViewport();
            this.#semanticNavigation?.reproject();
            this.#syncOverlays();
            applyAdaptiveSurface(this.#wrapper, this.#renderer.surface(), this.#adaptiveState);
            this.#events.emit('resize', { chart: this, width: resolvedWidth, height: resolvedHeight });
            if (adaptiveStateSignature(previousAdaptiveState) !== adaptiveStateSignature(this.#adaptiveState)) {
                this.#events.emit('adaptivechange', {
                    chart: this,
                    state: this.#adaptiveState,
                    previous: previousAdaptiveState,
                });
            }
        }
        render() {
            this.#assertAlive();
            this.#renderer.setCamera(this.#camera);
            this.#renderer.render();
            this.#semanticNavigation?.reproject();
            this.#syncAccessibilityDom();
            this.#syncControlStructure();
            this.#syncOverlays();
            applyAdaptiveSurface(this.#wrapper, this.#renderer.surface(), this.#adaptiveState);
            this.#events.emit('render', { chart: this, scene: this.#scene });
        }
        toDataURL() {
            this.#assertAlive();
            if (this.#renderer.available())
                return this.#renderer.toDataURL();
            const fallback = document.createElement('canvas');
            fallback.width = Math.max(1, Math.round(this.#width));
            fallback.height = Math.max(1, Math.round(this.#height));
            const context = fallback.getContext('2d');
            if (context === null)
                return 'data:image/png;base64,';
            context.fillStyle = colorCss(this.#spec.background ?? this.#scene.theme.colors.background);
            context.fillRect(0, 0, fallback.width, fallback.height);
            context.fillStyle = this.#scene.theme.colors.text;
            context.font = `600 18px ${this.#scene.theme.typography.fontFamily}`;
            context.fillText(this.#spec.title ?? this.#chartLabel(), 24, 38);
            context.fillStyle = this.#scene.theme.colors.mutedText;
            context.font = `14px ${this.#scene.theme.typography.fontFamily}`;
            context.fillText(this.#labels().unavailable, 24, 68, Math.max(20, fallback.width - 48));
            return fallback.toDataURL('image/png');
        }
        async toggleFullscreen() {
            this.#assertAlive();
            if (document.fullscreenElement === this.#wrapper) {
                await document.exitFullscreen();
                return false;
            }
            if (this.#wrapper.requestFullscreen === undefined)
                return false;
            await this.#wrapper.requestFullscreen();
            return true;
        }
        on(type, listener) {
            return this.#events.on(type, listener);
        }
        off(type, listener) {
            this.#events.off(type, listener);
        }
        destroy() {
            if (this.#destroyed)
                return;
            this.#destroyed = true;
            this.#setAvailability('destroyed');
            this.#resizeObserver?.disconnect();
            if (this.#windowResizeListener !== null)
                window.removeEventListener('resize', this.#windowResizeListener);
            for (const query of this.#adaptiveMediaLists)
                query.removeEventListener?.('change', this.#adaptiveMediaListener);
            this.#adaptiveMediaLists = [];
            document.removeEventListener('fullscreenchange', this.#fullscreenListener);
            this.#detachInteraction();
            this.#overlays.destroy();
            this.#renderer.destroy();
            this.#tooltip?.remove();
            this.#semanticFocusRing?.remove();
            this.#linkedFocusUnregister?.();
            this.#linkedFocusUnsubscribe?.();
            this.#fallback?.remove();
            this.#accessibility?.remove();
            this.#wrapper.remove();
            this.#events.clear();
        }
        #pointerDownListener = (event) => {
            if (!(event instanceof PointerEvent))
                return;
            const surface = this.#renderer.surface();
            const point = eventPoint(event, surface);
            this.#activePointers.set(event.pointerId, point);
            this.#previousPointer = point;
            if (event.pointerType !== 'touch')
                this.#beginGesture(surface);
            if (this.#activePointers.size === 2) {
                this.#beginGesture(surface);
                const [left, right] = [...this.#activePointers.values()];
                if (left !== undefined && right !== undefined)
                    this.#pinch = {
                        distance: distance(left, right),
                        center: center(left, right),
                        camera: this.#camera,
                    };
            }
        };
        #pointerMoveListener = (event) => {
            if (!(event instanceof PointerEvent))
                return;
            const surface = this.#renderer.surface();
            const point = eventPoint(event, surface);
            if (this.#activePointers.has(event.pointerId)) {
                this.#activePointers.set(event.pointerId, point);
                if (this.#activePointers.size >= 2 && this.#pinch !== null) {
                    const [left, right] = [...this.#activePointers.values()];
                    if (left !== undefined && right !== undefined) {
                        const currentDistance = Math.max(1, distance(left, right));
                        const currentCenter = center(left, right);
                        this.#camera = this.#pinch.camera;
                        this.zoomBy(currentDistance / Math.max(1, this.#pinch.distance));
                        this.#camera = { ...this.#camera, distance: this.#camera.distance };
                        this.panBy(currentCenter.x - this.#pinch.center.x, currentCenter.y - this.#pinch.center.y);
                    }
                    event.preventDefault();
                    return;
                }
                if (this.#previousPointer !== null) {
                    const deltaX = point.x - this.#previousPointer.x;
                    const deltaY = point.y - this.#previousPointer.y;
                    if (!this.#gestureActive && event.pointerType === 'touch') {
                        if (Math.hypot(deltaX, deltaY) < 5)
                            return;
                        if (Math.abs(deltaY) >= Math.abs(deltaX))
                            return;
                        this.#beginGesture(surface);
                    }
                    const panMode = this.#mode === 'pan' || event.shiftKey || event.button === 2 || event.buttons === 2;
                    if (panMode)
                        this.panBy(deltaX, deltaY);
                    else
                        this.orbitBy(-deltaX * 0.008, -deltaY * 0.008);
                }
                this.#previousPointer = point;
                event.preventDefault();
                return;
            }
            if (this.#spec.interaction?.picking === false)
                return;
            const hit = this.#renderer.hitTest(point.x, point.y);
            this.#showTooltip(hit, event);
            this.#events.emit('hover', { chart: this, hit, sourceEvent: event });
        };
        #pointerEndListener = (event) => {
            if (!(event instanceof PointerEvent))
                return;
            this.#activePointers.delete(event.pointerId);
            this.#pinch = null;
            this.#previousPointer = this.#activePointers.values().next().value ?? null;
            if (this.#activePointers.size === 0)
                this.#endGesture();
        };
        #pointerLeaveListener = (event) => {
            if (!(event instanceof PointerEvent) || this.#activePointers.size > 0)
                return;
            this.#hideTooltip();
            this.#events.emit('hover', { chart: this, hit: null, sourceEvent: event });
        };
        #clickListener = (event) => {
            if (!(event instanceof PointerEvent) || this.#spec.interaction?.picking === false)
                return;
            const point = eventPoint(event, this.#renderer.surface());
            const hit = this.#renderer.hitTest(point.x, point.y);
            this.#applyClickSelection(hit);
            this.#events.emit('click', { chart: this, hit, sourceEvent: event });
        };
        #wheelListener = (event) => {
            if (!(event instanceof WheelEvent) || this.#spec.interaction?.zoom === false)
                return;
            const wheel = this.#spec.interaction?.wheel ?? 'modifier';
            if (wheel === 'off' || (wheel === 'modifier' && !event.ctrlKey && !event.metaKey))
                return;
            this.zoomBy(Math.exp(-event.deltaY * 0.0012));
            event.preventDefault();
        };
        #contextMenuListener = (event) => event.preventDefault();
        #keyDownListener = (event) => {
            if (!(event instanceof KeyboardEvent))
                return;
            const selection = this.#selectionConfig();
            if (event.key === 'Escape') {
                let cleared = false;
                if (selection !== false && selection.clearOnEscape && this.#selection.length > 0) {
                    this.clearSelection();
                    cleared = true;
                }
                if (this.#semanticNavigation?.state().activeIndex !== null) {
                    this.clearSemanticFocus();
                    cleared = true;
                }
                if (cleared)
                    event.preventDefault();
                if (cleared)
                    return;
            }
            const semanticKeys = new Set([
                'ArrowLeft',
                'ArrowRight',
                'ArrowUp',
                'ArrowDown',
                'Home',
                'End',
                'PageUp',
                'PageDown',
            ]);
            if (this.#semanticKeyboardNavigation &&
                this.#semanticNavigation !== null &&
                !event.shiftKey &&
                semanticKeys.has(event.key)) {
                this.#semanticNavigation.move(event.key);
                event.preventDefault();
                return;
            }
            if (this.#semanticKeyboardNavigation &&
                this.#semanticNavigation !== null &&
                (event.key === 'Enter' || event.key === ' ')) {
                this.#semanticNavigation.activate();
                event.preventDefault();
                return;
            }
            const pan = event.shiftKey || this.#mode === 'pan';
            let handled = true;
            const navigationAllowed = pan
                ? this.#spec.interaction?.pan !== false
                : this.#spec.interaction?.orbit !== false;
            if (event.key === 'ArrowLeft' && navigationAllowed)
                pan ? this.panBy(-12, 0) : this.orbitBy(0.08, 0);
            else if (event.key === 'ArrowRight' && navigationAllowed)
                pan ? this.panBy(12, 0) : this.orbitBy(-0.08, 0);
            else if (event.key === 'ArrowUp' && navigationAllowed)
                pan ? this.panBy(0, -12) : this.orbitBy(0, 0.08);
            else if (event.key === 'ArrowDown' && navigationAllowed)
                pan ? this.panBy(0, 12) : this.orbitBy(0, -0.08);
            else if ((event.key === '+' || event.key === '=') && this.#spec.interaction?.zoom !== false)
                this.zoomBy(1.16);
            else if ((event.key === '-' || event.key === '_') && this.#spec.interaction?.zoom !== false)
                this.zoomBy(1 / 1.16);
            else if (event.key === '0' || event.key === 'Home')
                this.resetCamera();
            else
                handled = false;
            if (handled)
                event.preventDefault();
        };
        #fullscreenListener = () => {
            const active = document.fullscreenElement === this.#wrapper;
            this.#wrapper.style.width = active ? '100vw' : '100%';
            this.#wrapper.style.height = active
                ? '100vh'
                : this.#options.height === undefined
                    ? '100%'
                    : `${Math.max(1, this.#options.height)}px`;
            this.#wrapper.style.minHeight = active
                ? '0'
                : this.#options.height === undefined
                    ? '280px'
                    : '0';
            this.resize();
            this.#events.emit('fullscreenchange', { chart: this, active });
        };
        #selectionConfig() {
            const input = this.#spec.interaction?.selection;
            if (input === undefined || input === false)
                return false;
            const value = typeof input === 'object' ? input : {};
            return {
                mode: value.mode ?? 'single',
                toggle: value.toggle ?? true,
                ...(value.key === undefined ? {} : { key: value.key }),
                clearOnBackground: value.clearOnBackground ?? true,
                clearOnEscape: value.clearOnEscape ?? true,
                ariaLabel: value.ariaLabel ?? 'Spatial chart selection',
                highlight: { ...value.highlight },
            };
        }
        #legendOverlayState() {
            const input = this.#spec.legend;
            if (input === undefined || input === false)
                return null;
            const legend = typeof input === 'object' ? input : {};
            if (legend.visible === false)
                return null;
            const selectedLayer = this.#spec.layers.find((layer) => layer.id === legend.layerId) ?? this.#spec.layers[0];
            const autoMode = this.#spec.layers.length === 1 &&
                (selectedLayer?.mark.type === 'surface' || selectedLayer?.mark.type === 'volume')
                ? 'continuous'
                : 'layers';
            const mode = legend.mode === undefined || legend.mode === 'auto' ? autoMode : legend.mode;
            let items;
            let continuousColors;
            if (legend.items !== undefined && legend.items.length > 0) {
                const configuredItems = legend.items.slice(0, legend.maxItems ?? 24);
                items = configuredItems.map((item, index) => {
                    const id = item.id ?? `item-${index}`;
                    const owner = this.#spec.layers.find((layer) => layer.id === item.layerId);
                    const ownerIndex = owner === undefined ? index : this.#spec.layers.indexOf(owner);
                    return {
                        id,
                        label: item.label,
                        color: item.color ??
                            (owner === undefined
                                ? categoricalColor(this.#scene.theme, index, configuredItems.length)
                                : layerColor(owner, this.#scene.theme, ownerIndex, this.#spec.layers.length)),
                        visible: !this.#hiddenLegendItems.has(id),
                        toggleable: (legend.interactive ?? false) && mode === 'layers' && item.layerId !== undefined,
                        symbol: item.symbol === undefined || item.symbol === 'auto'
                            ? layerLegendSymbol(owner)
                            : item.symbol,
                        ...(item.layerId === undefined ? {} : { layerId: item.layerId }),
                        ...(item.value === undefined ? {} : { value: item.value }),
                    };
                });
            }
            else if (mode === 'continuous' && selectedLayer !== undefined) {
                let values = [];
                let configuredColors;
                const selectedData = selectedLayer.data;
                const selectedLayerId = selectedLayer.id ?? `spatial-layer-${this.#spec.layers.indexOf(selectedLayer)}`;
                const inferredField = legend.field ??
                    (selectedLayer.mark.type === 'vector' && selectedLayer.mark.mode !== 'streamtube'
                        ? 'magnitude'
                        : selectedLayer.mark.type === 'surface' &&
                            selectedData !== undefined &&
                            'positions' in selectedData
                            ? 'y'
                            : 'value');
                const compiledValues = this.#scene.geometries
                    .flatMap((geometry) => geometry.picks)
                    .filter((pick) => pick.layerId === selectedLayerId)
                    .map((pick) => pick.datum[inferredField])
                    .filter((value) => typeof value === 'number' && Number.isFinite(value));
                if (legend.field !== undefined) {
                    values = compiledValues;
                }
                else if (selectedLayer.mark.type === 'vector' &&
                    selectedData !== undefined &&
                    'vectors' in selectedData) {
                    values =
                        'dimensions' in selectedData
                            ? compiledValues
                            : selectedData.vectors.map((vector) => Math.hypot(...vector));
                    configuredColors = selectedData.colors;
                }
                else if (selectedLayer.mark.type === 'volume')
                    values = selectedLayer.data.values;
                else if (selectedLayer.mark.type === 'surface') {
                    if (selectedData !== undefined && 'positions' in selectedData) {
                        values = selectedData.positions.map((position) => position[1]);
                        configuredColors = selectedData.colors;
                    }
                    else {
                        const data = selectedLayer.data;
                        values = data.values ?? data.z ?? [];
                    }
                }
                else if (selectedLayer.mark.type === 'scatter') {
                    const data = selectedLayer.data;
                    values = data.values ?? [];
                    configuredColors = data.colors;
                }
                if (values.length === 0)
                    values = compiledValues;
                const finite = values.filter(Number.isFinite);
                const minimum = finite.length === 0 ? 0 : Math.min(...finite);
                const maximum = finite.length === 0 ? 1 : Math.max(...finite);
                const minimumIndex = values.findIndex((value) => value === minimum);
                const maximumIndex = values.findIndex((value) => value === maximum);
                const lowColor = minimumIndex >= 0 && configuredColors?.[minimumIndex] !== undefined
                    ? colorCss(configuredColors[minimumIndex])
                    : layerColor(selectedLayer, this.#scene.theme, this.#spec.layers.indexOf(selectedLayer), this.#spec.layers.length, 'low');
                const highColor = maximumIndex >= 0 && configuredColors?.[maximumIndex] !== undefined
                    ? colorCss(configuredColors[maximumIndex])
                    : layerColor(selectedLayer, this.#scene.theme, this.#spec.layers.indexOf(selectedLayer), this.#spec.layers.length, 'high');
                const authoredContinuousColor = configuredColors !== undefined ||
                    (selectedLayer.mark.type === 'volume' &&
                        (selectedLayer.mark.colorLow !== undefined ||
                            selectedLayer.mark.colorHigh !== undefined)) ||
                    (selectedLayer.mark.type === 'surface' && selectedLayer.mark.color !== undefined) ||
                    (selectedLayer.mark.type === 'scatter' && selectedLayer.mark.color !== undefined);
                const continuousSamples = this.#scene.theme.legend?.continuousSamples;
                if (!authoredContinuousColor && continuousSamples !== undefined) {
                    continuousColors = Array.from({ length: continuousSamples }, (_value, index) => continuousColor(this.#scene.theme, index / Math.max(1, continuousSamples - 1)));
                }
                let formatter;
                try {
                    formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 });
                }
                catch {
                    formatter = new Intl.NumberFormat();
                }
                items = [
                    {
                        id: 'continuous-min',
                        label: formatter.format(minimum),
                        color: lowColor,
                        visible: true,
                        toggleable: false,
                        symbol: 'rect',
                        layerId: selectedLayer.id ?? 'spatial-layer-0',
                        value: minimum,
                    },
                    {
                        id: 'continuous-max',
                        label: formatter.format(maximum),
                        color: highColor,
                        visible: true,
                        toggleable: false,
                        symbol: 'rect',
                        layerId: selectedLayer.id ?? 'spatial-layer-0',
                        value: maximum,
                    },
                ];
            }
            else {
                items = this.#spec.layers.slice(0, legend.maxItems ?? 24).map((layer, index) => {
                    const layerId = layer.id ?? `spatial-layer-${index}`;
                    const id = `layer-${safeId(layerId)}-${index}`;
                    return {
                        id,
                        label: layer.name ?? layer.id ?? `Series ${index + 1}`,
                        color: layerColor(layer, this.#scene.theme, index, this.#spec.layers.length),
                        visible: !this.#hiddenLegendItems.has(id),
                        toggleable: (legend.interactive ?? false) && mode === 'layers',
                        symbol: layerLegendSymbol(layer),
                        layerId,
                    };
                });
            }
            const authoredPosition = legend.position ?? 'right';
            const position = this.#adaptiveState.layout.legend === 'bottom-flow' && legend.position === undefined
                ? 'bottom'
                : authoredPosition;
            return {
                visible: true,
                ...(legend.title === undefined ? {} : { title: legend.title }),
                position,
                orientation: legend.orientation === undefined || legend.orientation === 'auto'
                    ? position === 'top' || position === 'bottom'
                        ? 'horizontal'
                        : 'vertical'
                    : legend.orientation,
                mode,
                showLabel: legend.labels?.show ?? 'Show',
                hideLabel: legend.labels?.hide ?? 'Hide',
                items,
                ...(continuousColors === undefined ? {} : { continuousColors }),
            };
        }
        #hiddenLayerIds() {
            const hidden = new Set();
            for (const item of this.#legendOverlayState()?.items ?? []) {
                if (!item.visible && item.layerId !== undefined)
                    hidden.add(item.layerId);
            }
            return hidden;
        }
        #installEffectiveScene() {
            const hidden = this.#hiddenLayerIds();
            if (hidden.size === 0) {
                this.#renderer.setScene(this.#scene);
                return;
            }
            this.#renderer.setScene({
                ...this.#scene,
                geometries: this.#scene.geometries.map((geometry) => {
                    const layerId = geometry.picks[0]?.layerId;
                    const hiddenGeometry = (layerId !== undefined && hidden.has(layerId)) ||
                        [...hidden].some((candidate) => geometry.id === candidate || geometry.id.startsWith(`${candidate}:`));
                    if (!hiddenGeometry)
                        return geometry;
                    const colors = new Float32Array(geometry.colors);
                    for (let index = 3; index < colors.length; index += 4)
                        colors[index] = 0;
                    return { ...geometry, colors };
                }),
            });
        }
        #setLegendItemVisible(id, visible, reason) {
            this.#assertAlive();
            const item = this.getLegendState().items.find((candidate) => candidate.id === id);
            if (item === undefined)
                throw new TypeError(`Spatial legend item "${id}" was not found.`);
            if (!item.toggleable)
                throw new TypeError(`Spatial legend item "${id}" is not toggleable.`);
            if (item.visible === visible)
                return;
            if (visible)
                this.#hiddenLegendItems.delete(id);
            else
                this.#hiddenLegendItems.add(id);
            this.#installEffectiveScene();
            this.render();
            this.#events.emit('legendchange', {
                chart: this,
                state: this.getLegendState(),
                reason,
            });
        }
        #applyClickSelection(hit) {
            const selection = this.#selectionConfig();
            if (selection === false)
                return;
            if (hit === null) {
                if (selection.clearOnBackground && this.#selection.length > 0) {
                    this.#selection = [];
                    this.render();
                    this.#emitSelection('click');
                }
                return;
            }
            const keyValue = selection.key === undefined ? undefined : hit.datum[selection.key];
            const portable = keyValue === null ||
                typeof keyValue === 'string' ||
                typeof keyValue === 'boolean' ||
                (typeof keyValue === 'number' && Number.isFinite(keyValue))
                ? keyValue
                : undefined;
            const target = selection.key !== undefined && portable !== undefined
                ? {
                    type: 'datum',
                    layerId: hit.layerId,
                    field: selection.key,
                    value: portable,
                }
                : { type: 'datum', layerId: hit.layerId, datumIndex: hit.datumIndex };
            const key = spatialSelectionKey(target);
            const existing = this.#selection.findIndex((candidate) => spatialSelectionKey(candidate) === key);
            const before = this.#selection.map(spatialSelectionKey).join('|');
            if (selection.mode === 'single') {
                this.#selection = existing >= 0 && selection.toggle ? [] : [target];
            }
            else if (existing >= 0 && selection.toggle) {
                this.#selection = this.#selection.filter((_, index) => index !== existing);
            }
            else if (existing < 0) {
                this.#selection = [...this.#selection, target];
            }
            if (before === this.#selection.map(spatialSelectionKey).join('|'))
                return;
            this.render();
            this.#emitSelection('click');
        }
        #emitSelection(reason) {
            this.#events.emit('selectionchange', {
                chart: this,
                state: this.getSelection(),
                reason,
            });
        }
        #emitAnnotations(reason, id) {
            this.#events.emit('annotationchange', {
                chart: this,
                annotations: this.getAnnotations(),
                reason,
                ...(id === undefined ? {} : { id }),
            });
        }
        #setAnnotationsVisible(visible, reason) {
            this.#assertAlive();
            if (typeof visible !== 'boolean')
                throw new TypeError('Annotation visibility must be a boolean.');
            if (visible === this.#annotationsVisible)
                return;
            this.#annotationsVisible = visible;
            this.render();
            this.#emitAnnotationVisibility(reason);
        }
        #emitAnnotationVisibility(reason) {
            this.#events.emit('annotationvisibilitychange', {
                chart: this,
                visible: this.#annotationsVisible,
                reason,
            });
        }
        #syncOverlays() {
            const selection = this.#selectionConfig();
            const controlBounds = this.#controlCollisionBounds();
            this.#overlays.sync(this.#wrapper, {
                scene: this.#scene,
                width: this.#width,
                height: this.#height,
                plotBounds: this.#plotViewport,
                ...(controlBounds === undefined ? {} : { controlBounds }),
                hiddenLayerIds: this.#hiddenLayerIds(),
                legend: this.#legendOverlayState(),
                highlights: this.#spec.highlights ?? [],
                selection: selection === false ? [] : this.#selection,
                selectionEnabled: selection !== false,
                selectionHighlight: selection === false ? {} : selection.highlight,
                annotations: this.#annotations,
                annotationsVisible: this.#annotationsVisible,
                selectionLabel: selection === false ? 'Spatial chart selection' : selection.ariaLabel,
            }, {
                project: (position, pick) => {
                    if (pick !== undefined && !isGlobePickFrontFacing(pick, this.#camera))
                        return null;
                    const projected = this.#renderer.project(position);
                    if (projected === null)
                        return null;
                    return {
                        ...projected,
                        x: projected.x + this.#plotViewport.x,
                        y: projected.y + this.#plotViewport.y,
                    };
                },
                setLegendVisible: (id, visible) => this.#setLegendItemVisible(id, visible, 'toggle'),
            });
        }
        #controlCollisionBounds() {
            if (this.#controls === null || this.#controlButtons.size === 0)
                return undefined;
            const buttonSize = this.#adaptiveState.enabled
                ? this.#adaptiveState.layout.controlTarget
                : this.#width <= 560
                    ? 44
                    : 28;
            const height = buttonSize + 2;
            const width = Math.min(Math.max(1, this.#plotViewport.width - 12), this.#controlButtons.size * buttonSize + Math.max(0, this.#controlButtons.size - 1) + 4);
            return {
                x: Math.max(this.#plotViewport.x, this.#plotViewport.x + this.#plotViewport.width - width - 6),
                y: this.#plotViewport.y + 6,
                width,
                height,
            };
        }
        #attachInteraction() {
            const surface = this.#renderer.surface();
            surface.addEventListener('pointerdown', this.#pointerDownListener);
            surface.addEventListener('pointermove', this.#pointerMoveListener);
            surface.addEventListener('pointerup', this.#pointerEndListener);
            surface.addEventListener('pointercancel', this.#pointerEndListener);
            surface.addEventListener('pointerleave', this.#pointerLeaveListener);
            surface.addEventListener('click', this.#clickListener);
            surface.addEventListener('wheel', this.#wheelListener, { passive: false });
            surface.addEventListener('contextmenu', this.#contextMenuListener);
            surface.addEventListener('keydown', this.#keyDownListener);
            document.addEventListener('fullscreenchange', this.#fullscreenListener);
        }
        #detachInteraction() {
            const surface = this.#renderer.surface();
            surface.removeEventListener('pointerdown', this.#pointerDownListener);
            surface.removeEventListener('pointermove', this.#pointerMoveListener);
            surface.removeEventListener('pointerup', this.#pointerEndListener);
            surface.removeEventListener('pointercancel', this.#pointerEndListener);
            surface.removeEventListener('pointerleave', this.#pointerLeaveListener);
            surface.removeEventListener('click', this.#clickListener);
            surface.removeEventListener('wheel', this.#wheelListener);
            surface.removeEventListener('contextmenu', this.#contextMenuListener);
            surface.removeEventListener('keydown', this.#keyDownListener);
        }
        #beginGesture(surface) {
            this.#gestureActive = true;
            surface.style.touchAction = 'none';
            for (const pointerId of this.#activePointers.keys()) {
                try {
                    surface.setPointerCapture?.(pointerId);
                }
                catch {
                    // A browser may already have handed a vertical touch to page scrolling.
                }
            }
        }
        #endGesture() {
            this.#gestureActive = false;
            this.#renderer.surface().style.touchAction = 'pan-y';
        }
        #configureResize() {
            this.#windowResizeListener = () => {
                const fullscreen = document.fullscreenElement === this.#wrapper;
                const embeddedFallback = typeof ResizeObserver === 'undefined' &&
                    this.#options.autoResize !== false &&
                    this.#options.width === undefined;
                if (fullscreen || embeddedFallback)
                    this.resize();
            };
            window.addEventListener('resize', this.#windowResizeListener);
            if (this.#adaptiveOptions.enabled && typeof window.matchMedia === 'function') {
                this.#adaptiveMediaLists = [
                    ...new Set(adaptiveMediaQueries.map((query) => {
                        try {
                            return window.matchMedia(query);
                        }
                        catch {
                            return null;
                        }
                    })),
                ].filter((query) => query !== null);
                for (const query of this.#adaptiveMediaLists)
                    query.addEventListener?.('change', this.#adaptiveMediaListener);
            }
            if (this.#options.autoResize === false || this.#options.width !== undefined)
                return;
            if (typeof ResizeObserver !== 'undefined') {
                this.#resizeObserver = new ResizeObserver(() => this.resize());
                this.#resizeObserver.observe(this.#target);
                return;
            }
        }
        #cameraForScene(scene) {
            const input = scene.spec.camera ?? {};
            return normalizedCamera(input.projection ?? 'perspective', input.target ?? scene.bounds.center, scene.bounds.radius, {
                ...(input.projection === undefined ? {} : { projection: input.projection }),
                ...(input.target === undefined ? {} : { target: input.target }),
                ...(input.yaw === undefined ? {} : { yaw: input.yaw }),
                ...(input.pitch === undefined ? {} : { pitch: input.pitch }),
                ...(input.distance === undefined ? {} : { distance: input.distance }),
                ...(input.fov === undefined ? {} : { fov: input.fov }),
                ...(input.near === undefined ? {} : { near: input.near }),
                ...(input.far === undefined ? {} : { far: input.far }),
            });
        }
        #syncSemanticNavigation() {
            const authored = this.#spec.accessibility?.navigation;
            const linked = this.#spec.accessibility?.linkedFocus;
            this.#semanticKeyboardNavigation = authored === true || typeof authored === 'object';
            this.#linkedFocusUnregister?.();
            this.#linkedFocusUnregister = null;
            this.#linkedFocusUnsubscribe?.();
            this.#linkedFocusUnsubscribe = null;
            this.#semanticMarks.clear();
            this.#lastPublishedSemanticId = null;
            if (!this.#semanticKeyboardNavigation && linked === undefined) {
                this.#semanticNavigation?.clear();
                this.#semanticNavigation = null;
                this.#semanticNavigationSignature = '';
                this.#hideSemanticFocus();
                return;
            }
            const navigation = typeof authored === 'object' ? authored : {};
            const maxRows = this.#spec.accessibility?.maxRows ?? 100;
            const signature = JSON.stringify({
                maxRows,
                pageRows: navigation.pageRows ?? 10,
                wrap: navigation.wrap ?? false,
            });
            if (this.#semanticNavigation === null || signature !== this.#semanticNavigationSignature) {
                this.#semanticNavigation = new SpatialSemanticNavigator({
                    focus: (focus) => this.#applySemanticFocus(focus),
                    activate: (focus) => this.#activateSemanticFocus(focus),
                }, {
                    maxRows,
                    pageRows: navigation.pageRows ?? 10,
                    wrap: navigation.wrap ?? false,
                });
                this.#semanticNavigationSignature = signature;
            }
            const previousNode = this.#semanticNavigation.state().activeNodeId;
            const picks = collectAccessibleSpatialPicks(this.#scene.geometries, maxRows);
            this.#semanticNavigation.setProjector((pick) => {
                const projected = this.#renderer.project(pick.position);
                return projected === null ? null : { ...projected };
            });
            this.#semanticNavigation.setTargets(picks, previousNode);
            if (linked === undefined)
                return;
            const linkable = picks.filter(({ datum }) => {
                const value = datum[linked.key];
                return ((typeof value === 'string' && value !== '') ||
                    typeof value === 'boolean' ||
                    (typeof value === 'number' && Number.isFinite(value)) ||
                    (value instanceof Date && Number.isFinite(value.getTime())));
            });
            for (const pick of linkable) {
                const projected = this.#renderer.project(pick.position);
                this.#semanticMarks.set(pick.nodeId, {
                    id: pick.nodeId,
                    viewId: this.#semanticViewId,
                    layerId: pick.layerId,
                    rowIndex: pick.datumIndex,
                    role: 'spatial-pick',
                    channels: {},
                    datum: pick.datum,
                    lineage: {
                        sourceId: pick.layerId,
                        sourceRowIndices: [pick.datumIndex],
                        truncated: false,
                    },
                    bounds: projected === null
                        ? { x: 0, y: 0, width: 0, height: 0 }
                        : { x: projected.x, y: projected.y, width: 8, height: 8 },
                    visible: projected?.visible ?? false,
                    label: safeText(pick.datum.label ?? `${pick.layerId} ${pick.datumIndex + 1}`),
                });
            }
            const store = this.#focusStore();
            this.#linkedFocusUnregister = store.registerView(this.#semanticViewId, linked, [
                ...this.#semanticMarks.values(),
            ]);
            this.#linkedFocusUnsubscribe = store.subscribe((change) => this.#applyLinkedSemanticFocus(change));
            this.#applyLinkedSemanticFocus({
                state: store.state(),
                reason: 'index',
            });
        }
        #applyLinkedSemanticFocus(change) {
            const linked = this.#spec.accessibility?.linkedFocus;
            if (linked === undefined || change.state.focused?.group !== linked.group)
                return;
            const match = change.state.matches.find(({ viewId }) => viewId === this.#semanticViewId);
            if (match === undefined) {
                this.#hideSemanticFocus();
                return;
            }
            if (this.#semanticNavigation?.state().activeNodeId === match.semanticId) {
                this.#semanticNavigation.reproject();
                return;
            }
            this.#applyingLinkedFocus = true;
            try {
                this.#semanticNavigation?.focusNode(match.semanticId);
            }
            finally {
                this.#applyingLinkedFocus = false;
            }
        }
        #applySemanticFocus(focus) {
            if (focus === null || focus.screen === null || !focus.screen.visible) {
                this.#hideSemanticFocus();
                return;
            }
            if (this.#semanticFocusRing === null) {
                const ring = document.createElement('div');
                ring.dataset.graflumeSpatialSemanticFocus = 'true';
                ring.setAttribute('aria-hidden', 'true');
                ring.style.position = 'absolute';
                ring.style.zIndex = '19';
                ring.style.pointerEvents = 'none';
                ring.style.width = '14px';
                ring.style.height = '14px';
                ring.style.border = `3px solid ${this.#scene.theme.colors.focus}`;
                ring.style.borderRadius = '50%';
                ring.style.boxShadow = '0 0 0 2px rgba(255,255,255,.9)';
                this.#wrapper.append(ring);
                this.#semanticFocusRing = ring;
            }
            this.#semanticFocusRing.style.borderColor = this.#scene.theme.colors.focus;
            this.#semanticFocusRing.style.left = `${this.#plotViewport.x + focus.screen.x - 10}px`;
            this.#semanticFocusRing.style.top = `${this.#plotViewport.y + focus.screen.y - 10}px`;
            this.#semanticFocusRing.hidden = false;
            const rowId = this.#spatialSemanticRowId(focus.pick);
            this.#renderer.surface().setAttribute('aria-activedescendant', rowId);
            const hit = {
                ...focus.pick,
                screen: {
                    x: focus.screen.x,
                    y: focus.screen.y,
                    depth: focus.screen.depth,
                },
            };
            const surfaceBounds = this.#renderer.surface().getBoundingClientRect();
            this.#showTooltip(hit, {
                clientX: surfaceBounds.left + focus.screen.x,
                clientY: surfaceBounds.top + focus.screen.y,
            });
            if (!this.#applyingLinkedFocus &&
                this.#spec.accessibility?.linkedFocus !== undefined &&
                this.#lastPublishedSemanticId !== focus.pick.nodeId) {
                const mark = this.#semanticMarks.get(focus.pick.nodeId);
                if (mark !== undefined) {
                    this.#lastPublishedSemanticId = focus.pick.nodeId;
                    this.#focusStore().focus(this.#semanticViewId, mark);
                }
            }
        }
        #focusStore() {
            return this.#options.focusStore ?? defaultSemanticFocusStore;
        }
        #activateSemanticFocus(focus) {
            if (focus.screen === null)
                return;
            this.#applyClickSelection({
                ...focus.pick,
                screen: {
                    x: focus.screen.x,
                    y: focus.screen.y,
                    depth: focus.screen.depth,
                },
            });
        }
        #hideSemanticFocus() {
            if (this.#semanticFocusRing !== null)
                this.#semanticFocusRing.hidden = true;
            this.#renderer.surface().removeAttribute?.('aria-activedescendant');
            this.#hideTooltip();
        }
        #spatialSemanticRowId(pick) {
            return `graflume-spatial-row-${this.#semanticViewId}-${pick.layerIndex}-${pick.datumIndex}`;
        }
        #syncAccessibilityDom() {
            const labels = this.#labels();
            const surface = this.#renderer.surface();
            const annotationDescription = this.#annotations
                .map((annotation) => annotation.detail === undefined
                ? annotation.text
                : `${annotation.text}: ${annotation.detail}`)
                .join('. ');
            const legend = this.#legendOverlayState();
            const legendDescription = legend === null
                ? ''
                : `${legend.title ?? 'Legend'}: ${legend.items
                .slice(0, 12)
                .map((item) => item.label)
                .join(', ')}`;
            const authoredDescription = [
                this.#spec.accessibility?.description,
                annotationDescription,
                legendDescription,
            ]
                .filter(Boolean)
                .join('. ');
            const description = spatialAccessibleDescription(authoredDescription === '' ? undefined : authoredDescription, labels.instructions);
            surface.setAttribute('aria-label', this.#chartLabel(labels));
            surface.setAttribute('aria-description', description);
            if (this.#instructions === null) {
                this.#instructions = document.createElement('p');
                this.#instructions.id = `graflume-spatial-instructions-${Math.random().toString(36).slice(2)}`;
                this.#instructions.style.position = 'absolute';
                this.#instructions.style.width = '1px';
                this.#instructions.style.height = '1px';
                this.#instructions.style.overflow = 'hidden';
                this.#instructions.style.clipPath = 'inset(50%)';
                this.#wrapper.append(this.#instructions);
            }
            this.#instructions.textContent = description;
            surface.setAttribute('aria-describedby', this.#instructions.id);
        }
        #installScopedStyles() {
            const style = document.createElement('style');
            style.textContent = `
[data-graflume-spatial="true"] canvas:focus-visible,
[data-graflume-spatial="true"] [data-graflume-spatial-control]:focus-visible {
  outline: 2px solid ${this.#scene.theme.colors.focus};
  outline-offset: 2px;
}
[data-graflume-spatial="true"] [data-graflume-spatial-controls="true"] {
  max-inline-size: calc(100% - 12px);
  overflow-x: auto;
  scrollbar-width: thin;
}
[data-graflume-spatial="true"][data-graflume-adaptive-viewport="micro"] [data-graflume-spatial-control],
[data-graflume-spatial="true"][data-graflume-adaptive-viewport="narrow"] [data-graflume-spatial-control],
[data-graflume-spatial="true"][data-graflume-adaptive-input="coarse"] [data-graflume-spatial-control],
[data-graflume-spatial="true"][data-graflume-adaptive-input="keyboard"] [data-graflume-spatial-control],
[data-graflume-spatial="true"][data-graflume-adaptive-input="remote"] [data-graflume-spatial-control] {
  inline-size: var(--graflume-control-target, 44px) !important;
  block-size: var(--graflume-control-target, 44px) !important;
  min-inline-size: var(--graflume-control-target, 44px);
}
[data-graflume-spatial="true"][data-graflume-adaptive-display="e-ink"] [data-graflume-spatial-controls="true"],
[data-graflume-spatial="true"][data-graflume-adaptive-display="monochrome"] [data-graflume-spatial-controls="true"],
[data-graflume-spatial="true"][data-graflume-adaptive-display="grid"] [data-graflume-spatial-controls="true"],
[data-graflume-spatial="true"][data-graflume-adaptive-display="high-contrast"] [data-graflume-spatial-controls="true"] {
  color: #000 !important;
  border: 2px solid #000 !important;
  background: #fff !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}
[data-graflume-spatial="true"][data-graflume-adaptive-display="e-ink"] [data-graflume-spatial-legend="true"],
[data-graflume-spatial="true"][data-graflume-adaptive-display="monochrome"] [data-graflume-spatial-legend="true"],
[data-graflume-spatial="true"][data-graflume-adaptive-display="grid"] [data-graflume-spatial-legend="true"],
[data-graflume-spatial="true"][data-graflume-adaptive-display="high-contrast"] [data-graflume-spatial-legend="true"] {
  color: #000 !important;
  border-color: #000 !important;
  background: #fff !important;
}
@media (pointer: coarse), (max-width: 560px) {
  [data-graflume-spatial="true"] [data-graflume-spatial-control] {
    inline-size: 44px !important;
    block-size: 44px !important;
    min-inline-size: 44px;
  }
}`;
            this.#scopedStyle = style;
            this.#wrapper.append(style);
        }
        #applyThemeChrome() {
            const { colors, typography } = this.#scene.theme;
            this.#wrapper.style.background = colorCss(this.#spec.background ?? colors.background);
            this.#wrapper.style.color = colors.text;
            this.#wrapper.style.fontFamily = typography.fontFamily;
            if (this.#tooltip !== null) {
                this.#tooltip.style.borderColor = colors.axis;
                this.#tooltip.style.background = colors.background;
                this.#tooltip.style.color = colors.text;
                this.#tooltip.style.font = `${typography.fontSize}px/${typography.lineHeight} ${typography.fontFamily}`;
            }
            if (this.#fallback !== null) {
                this.#fallback.style.color = colors.mutedText;
                this.#fallback.style.background = colors.background;
                this.#fallback.style.font = `${typography.fontSize}px/${typography.lineHeight} ${typography.fontFamily}`;
            }
            if (this.#scopedStyle !== null)
                this.#scopedStyle.textContent = this.#scopedStyle.textContent.replace(/outline: 2px solid [^;]+;/, `outline: 2px solid ${colors.focus};`);
        }
        #createControls() {
            const labels = this.#labels();
            const toolbar = document.createElement('div');
            toolbar.dataset.graflumeSpatialControls = 'true';
            toolbar.setAttribute('role', 'toolbar');
            toolbar.setAttribute('aria-label', labels.toolbar);
            toolbar.style.position = 'absolute';
            toolbar.style.insetBlockStart = '6px';
            toolbar.style.insetInlineEnd = '6px';
            toolbar.style.zIndex = '4';
            toolbar.style.display = 'flex';
            toolbar.style.gap = '1px';
            toolbar.style.padding = '1px';
            toolbar.style.border = `1px solid ${this.#scene.theme.colors.axis}`;
            toolbar.style.borderRadius = '6px';
            toolbar.style.background = this.#scene.theme.colors.background;
            toolbar.style.backdropFilter = 'blur(5px)';
            toolbar.style.direction = 'ltr';
            const definitions = [
                [
                    'orbit',
                    labels.orbit,
                    icon(['M5 7c3-4 11-4 14 0', 'M19 17c-3 4-11 4-14 0', 'M18 3l1 4-4-1', 'M6 21l-1-4 4 1']),
                ],
                [
                    'pan',
                    labels.pan,
                    icon([
                        'M12 3v18M3 12h18M12 3l-3 3m3-3 3 3M3 12l3-3m-3 3 3 3m15-3-3-3m3 3-3 3m-6 6-3-3m3 3 3-3',
                    ]),
                ],
                ['zoom-in', labels.zoomIn, icon(['M8 11h6M11 8v6M16 16l4 4'], [[11, 11, 6]])],
                ['zoom-out', labels.zoomOut, icon(['M8 11h6M16 16l4 4'], [[11, 11, 6]])],
                ['reset', labels.reset, icon(['M4 10a8 8 0 1 1 2 8', 'M4 4v6h6'])],
                [
                    'projection',
                    labels.projection,
                    icon(['M12 3l8 4-8 4-8-4 8-4', 'M4 7v9l8 5 8-5V7', 'M12 11v10']),
                ],
                ['fullscreen', labels.fullscreen, icon(['M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5'])],
                ['png', labels.exportPng, icon(['M4 5h4l2-2h4l2 2h4v15H4V5'], [[12, 12, 4]])],
            ];
            if (this.#annotationControlVisible())
                definitions.splice(6, 0, ['annotations', labels.hideAnnotations, annotationIcon(true)]);
            for (const [id, label, graphic] of definitions) {
                const button = document.createElement('button');
                button.type = 'button';
                button.dataset.graflumeSpatialControl = id;
                button.title = label;
                button.setAttribute('aria-label', label);
                button.style.boxSizing = 'border-box';
                button.style.width = '28px';
                button.style.height = '28px';
                button.style.display = 'grid';
                button.style.placeItems = 'center';
                button.style.padding = '0';
                button.style.border = '0';
                button.style.borderRadius = '4px';
                button.style.color = this.#scene.theme.colors.text;
                button.style.background = 'transparent';
                button.style.cursor = 'pointer';
                button.append(graphic);
                button.addEventListener('click', () => this.#activateControl(id));
                toolbar.append(button);
                this.#controlButtons.set(id, button);
            }
            this.#wrapper.append(toolbar);
            this.#controls = toolbar;
            this.#syncControlLayout();
            this.#syncControls();
        }
        #resizeRendererViewport() {
            this.#plotViewport = spatialPlotViewport(this.#spec, this.#width, this.#height, this.#adaptiveState.layout.legend === 'bottom-flow');
            const surface = this.#renderer.surface();
            surface.style.position = 'absolute';
            surface.style.left = `${this.#plotViewport.x}px`;
            surface.style.top = `${this.#plotViewport.y}px`;
            const ratio = this.#options.pixelRatio ?? window.devicePixelRatio ?? 1;
            this.#renderer.resize(this.#plotViewport.width, this.#plotViewport.height, Math.min(ratio, this.#adaptiveState.rendering.pixelRatioCap));
            this.#syncControlLayout();
        }
        #syncControlLayout() {
            if (this.#controls === null)
                return;
            this.#controls.style.insetBlockStart = 'auto';
            this.#controls.style.insetInlineEnd = 'auto';
            this.#controls.style.top = `${this.#plotViewport.y + 6}px`;
            this.#controls.style.right = `${Math.max(6, this.#width - this.#plotViewport.x - this.#plotViewport.width + 6)}px`;
        }
        #syncControlStructure() {
            const controlsEnabled = this.#spec.interaction?.controls !== false;
            if (!controlsEnabled) {
                this.#controls?.remove();
                this.#controls = null;
                this.#controlButtons.clear();
                return;
            }
            if (this.#controls !== null &&
                this.#controlButtons.has('annotations') !== this.#annotationControlVisible()) {
                this.#controls.remove();
                this.#controls = null;
                this.#controlButtons.clear();
            }
            if (this.#controls === null)
                this.#createControls();
            const labels = this.#labels();
            this.#controls?.setAttribute('aria-label', labels.toolbar);
            const byId = {
                orbit: labels.orbit,
                pan: labels.pan,
                'zoom-in': labels.zoomIn,
                'zoom-out': labels.zoomOut,
                reset: labels.reset,
                projection: labels.projection,
                fullscreen: labels.fullscreen,
                png: labels.exportPng,
                annotations: this.#annotationsVisible ? labels.hideAnnotations : labels.showAnnotations,
            };
            for (const [id, button] of this.#controlButtons) {
                const label = byId[id];
                if (label !== undefined) {
                    button.title = label;
                    button.setAttribute('aria-label', label);
                }
                button.disabled =
                    (id === 'orbit' && this.#spec.interaction?.orbit === false) ||
                        (id === 'pan' && this.#spec.interaction?.pan === false) ||
                        ((id === 'zoom-in' || id === 'zoom-out') && this.#spec.interaction?.zoom === false) ||
                        (id === 'annotations' && this.#annotations.length === 0);
            }
            if (this.#mode === 'orbit' && this.#spec.interaction?.orbit === false)
                this.#mode = 'pan';
            if (this.#mode === 'pan' && this.#spec.interaction?.pan === false)
                this.#mode = 'orbit';
            this.#syncControls();
        }
        #activateControl(id) {
            if (id === 'orbit' || id === 'pan')
                this.#mode = id;
            else if (id === 'zoom-in')
                this.zoomBy(1.2);
            else if (id === 'zoom-out')
                this.zoomBy(1 / 1.2);
            else if (id === 'reset')
                this.resetCamera();
            else if (id === 'projection')
                this.setProjection(this.#camera.projection === 'perspective' ? 'orthographic' : 'perspective');
            else if (id === 'fullscreen')
                void this.toggleFullscreen();
            else if (id === 'png')
                this.#downloadPng();
            else if (id === 'annotations')
                this.toggleAnnotations();
            this.#syncControls();
        }
        #syncControls() {
            if (this.#controls !== null) {
                this.#controls.style.borderColor = this.#scene.theme.colors.axis;
                this.#controls.style.background = this.#scene.theme.colors.background;
            }
            const active = this.#scene.theme.colors.panel ?? this.#scene.theme.colors.surface;
            for (const button of this.#controlButtons.values())
                button.style.color = this.#scene.theme.colors.text;
            for (const mode of ['orbit', 'pan']) {
                const button = this.#controlButtons.get(mode);
                button?.setAttribute('aria-pressed', String(this.#mode === mode));
                if (button !== undefined) {
                    button.style.background = this.#mode === mode ? active : 'transparent';
                }
            }
            this.#controlButtons
                .get('projection')
                ?.setAttribute('aria-pressed', String(this.#camera.projection === 'orthographic'));
            const annotations = this.#controlButtons.get('annotations');
            if (annotations !== undefined) {
                const labels = this.#labels();
                const label = this.#annotationsVisible ? labels.hideAnnotations : labels.showAnnotations;
                annotations.title = label;
                annotations.setAttribute('aria-label', label);
                annotations.setAttribute('aria-pressed', String(this.#annotationsVisible));
                annotations.disabled = this.#annotations.length === 0;
                annotations.style.color = this.#scene.theme.colors.text;
                annotations.style.background = this.#annotationsVisible ? active : 'transparent';
                if (annotations.dataset.graflumeAnnotationVisibility !== String(this.#annotationsVisible)) {
                    annotations.replaceChildren(annotationIcon(this.#annotationsVisible));
                    annotations.dataset.graflumeAnnotationVisibility = String(this.#annotationsVisible);
                }
            }
        }
        #annotationControlEnabled() {
            const controls = this.#spec.interaction?.controls;
            return controls === true || (typeof controls === 'object' && controls.annotations === true);
        }
        #annotationControlVisible() {
            return this.#annotationControlEnabled() && this.#annotations.length > 0;
        }
        #downloadPng() {
            const anchor = document.createElement('a');
            anchor.download = 'graflume-spatial.png';
            anchor.href = this.toDataURL();
            anchor.click();
        }
        #showTooltip(hit, event) {
            if (hit === null || this.#spec.interaction?.tooltip === false) {
                this.#hideTooltip();
                return;
            }
            if (this.#tooltip === null) {
                this.#tooltip = document.createElement('div');
                this.#tooltip.dataset.graflumeSpatialTooltip = 'true';
                this.#tooltip.setAttribute('role', 'tooltip');
                this.#tooltip.style.position = 'absolute';
                this.#tooltip.style.zIndex = '5';
                this.#tooltip.style.pointerEvents = 'none';
                this.#tooltip.style.maxWidth = '260px';
                this.#tooltip.style.padding = '8px 10px';
                this.#tooltip.style.border = `1px solid ${this.#scene.theme.colors.axis}`;
                this.#tooltip.style.borderRadius = '7px';
                this.#tooltip.style.background = this.#scene.theme.colors.background;
                this.#tooltip.style.color = this.#scene.theme.colors.text;
                this.#tooltip.style.font = `${this.#scene.theme.typography.fontSize}px/${this.#scene.theme.typography.lineHeight} ${this.#scene.theme.typography.fontFamily}`;
                this.#wrapper.append(this.#tooltip);
            }
            this.#tooltip.style.borderColor = this.#scene.theme.colors.axis;
            this.#tooltip.style.background = this.#scene.theme.colors.background;
            this.#tooltip.style.color = this.#scene.theme.colors.text;
            this.#tooltip.style.font = `${this.#scene.theme.typography.fontSize}px/${this.#scene.theme.typography.lineHeight} ${this.#scene.theme.typography.fontFamily}`;
            this.#tooltip.replaceChildren();
            const configured = typeof this.#spec.interaction?.tooltip === 'object' ? this.#spec.interaction.tooltip : {};
            const heading = document.createElement('strong');
            heading.textContent =
                configured.title ?? safeText(hit.datum.label ?? this.#spec.title ?? hit.layerId, 90);
            heading.style.display = 'block';
            heading.style.marginBlockEnd = '4px';
            this.#tooltip.append(heading);
            for (const [field, value] of scalarEntries(hit.datum, configured.fields)) {
                const row = document.createElement('div');
                row.textContent = `${field}: ${value}`;
                this.#tooltip.append(row);
            }
            const bounds = this.#wrapper.getBoundingClientRect();
            const left = clamp(event.clientX - bounds.left + 12, 4, Math.max(4, this.#width - 264));
            const top = clamp(event.clientY - bounds.top + 12, 4, Math.max(4, this.#height - 120));
            this.#tooltip.style.left = `${left}px`;
            this.#tooltip.style.top = `${top}px`;
            this.#tooltip.hidden = false;
        }
        #hideTooltip() {
            if (this.#tooltip !== null)
                this.#tooltip.hidden = true;
        }
        #showFallback(status) {
            if (this.#fallback === null) {
                this.#fallback = document.createElement('div');
                this.#fallback.dataset.graflumeSpatialFallback = 'true';
                this.#fallback.setAttribute('role', 'status');
                this.#fallback.style.position = 'absolute';
                this.#fallback.style.inset = '0';
                this.#fallback.style.display = 'grid';
                this.#fallback.style.placeItems = 'center';
                this.#fallback.style.padding = '24px';
                this.#fallback.style.textAlign = 'center';
                this.#fallback.style.color = this.#scene.theme.colors.mutedText;
                this.#fallback.style.background = this.#scene.theme.colors.background;
                this.#fallback.style.font = `${this.#scene.theme.typography.fontSize}px/${this.#scene.theme.typography.lineHeight} ${this.#scene.theme.typography.fontFamily}`;
                this.#wrapper.append(this.#fallback);
            }
            this.#fallback.style.color = this.#scene.theme.colors.mutedText;
            this.#fallback.style.background = this.#scene.theme.colors.background;
            this.#fallback.style.font = `${this.#scene.theme.typography.fontSize}px/${this.#scene.theme.typography.lineHeight} ${this.#scene.theme.typography.fontFamily}`;
            const labels = this.#labels();
            const message = status === 'context-lost' ? labels.contextLost : labels.unavailable;
            this.#fallback.textContent = message;
            this.#fallback.style.display = 'grid';
            this.#fallback.hidden = false;
            this.#setAvailability(status, message);
        }
        #hideFallback() {
            if (this.#fallback !== null) {
                this.#fallback.hidden = true;
                this.#fallback.style.display = 'none';
            }
        }
        #renderAccessibilityTable() {
            this.#accessibility?.remove();
            if (this.#spec.accessibility?.table === false)
                return;
            const host = document.createElement('div');
            host.dataset.graflumeSpatialData = 'true';
            host.style.position = 'absolute';
            host.style.width = '1px';
            host.style.height = '1px';
            host.style.overflow = 'hidden';
            host.style.clipPath = 'inset(50%)';
            const table = document.createElement('table');
            const caption = document.createElement('caption');
            caption.textContent =
                this.#spec.accessibility?.description ?? this.#spec.title ?? this.#chartLabel(this.#labels());
            table.append(caption);
            const picks = collectAccessibleSpatialPicks(this.#scene.geometries, this.#spec.accessibility?.maxRows ?? 100);
            const fields = [
                ...new Set(picks.flatMap(({ datum }) => scalarEntries(datum).map(([field]) => field))),
            ].slice(0, 8);
            if (fields.length > 0) {
                const head = document.createElement('thead');
                const headRow = document.createElement('tr');
                for (const field of fields) {
                    const cell = document.createElement('th');
                    cell.scope = 'col';
                    cell.textContent = field;
                    headRow.append(cell);
                }
                head.append(headRow);
                table.append(head);
                const body = document.createElement('tbody');
                for (const pick of picks) {
                    const row = document.createElement('tr');
                    row.id = this.#spatialSemanticRowId(pick);
                    row.dataset.graflumeSpatialSemanticId = pick.nodeId;
                    row.setAttribute('aria-label', safeText(pick.datum.label ?? `${pick.layerId} ${pick.datumIndex + 1}`));
                    for (const field of fields) {
                        const cell = document.createElement('td');
                        cell.textContent = safeText(pick.datum[field]);
                        row.append(cell);
                    }
                    body.append(row);
                }
                table.append(body);
            }
            host.append(table);
            this.#wrapper.append(host);
            this.#accessibility = host;
        }
        #emitCamera(reason) {
            this.#events.emit('camerachange', { chart: this, camera: this.getCamera(), reason });
        }
        #labels() {
            return { ...defaultLabels, ...this.#spec.interaction?.labels };
        }
        #chartLabel(labels = this.#labels()) {
            return this.#spec.ariaLabel ?? this.#spec.title ?? labels.chart;
        }
        #syncAvailabilityCopy() {
            if (this.#availability.status === 'context-lost')
                this.#showFallback('context-lost');
            else if (this.#availability.status === 'unavailable')
                this.#showFallback('unavailable');
        }
        #setAvailability(status, message) {
            const previous = this.#availability;
            const next = {
                status,
                available: status === 'ready',
                ...(message === undefined ? {} : { message }),
            };
            if (previous.status === next.status &&
                previous.available === next.available &&
                previous.message === next.message)
                return;
            this.#availability = next;
            this.#events.emit('availabilitychange', {
                chart: this,
                state: this.getAvailability(),
                previous: { ...previous },
            });
        }
        #assertAlive() {
            if (this.#destroyed)
                throw new Error('Spatial chart has been destroyed.');
        }
        #assertFiniteInteraction(label, value) {
            assertFiniteSpatialNumber(label, value);
        }
    }

    const spatialChartFamilies = Object.freeze([
        {
            familyId: 'surface',
            renderer: 'webgl',
            entryPoint: 'graflume/spatial',
            variants: [
                {
                    id: 'surface',
                    mode: 'surface',
                    mark: 'surface',
                    quickApi: 'surface',
                    description: 'Regular x/y grid rendered as a lit height surface.',
                },
                {
                    id: 'mesh',
                    mode: 'mesh',
                    mark: 'surface',
                    quickApi: 'mesh',
                    description: 'Indexed arbitrary triangle mesh with optional normals and vertex colors.',
                },
            ],
        },
        {
            familyId: 'volume',
            renderer: 'webgl',
            entryPoint: 'graflume/spatial',
            variants: [
                {
                    id: 'volume',
                    mode: 'volume',
                    mark: 'volume',
                    quickApi: 'volume',
                    description: 'Bounded scalar-volume sampling rendered as depth-aware points.',
                },
                {
                    id: 'isosurface',
                    mode: 'isosurface',
                    mark: 'volume',
                    quickApi: 'isosurface',
                    description: 'Constant-value boundary extracted into lit triangle geometry.',
                },
            ],
        },
        {
            familyId: 'spatial-vector',
            renderer: 'webgl',
            entryPoint: 'graflume/spatial',
            variants: [
                {
                    id: 'vector-cone',
                    mode: 'cone',
                    mark: 'vector',
                    quickApi: 'vectorCone',
                    description: 'Oriented cone glyphs for magnitude and direction vectors.',
                },
                {
                    id: 'streamtube',
                    mode: 'streamtube',
                    mark: 'vector',
                    quickApi: 'streamtube',
                    description: 'Tube geometry following ordered three-dimensional paths.',
                },
                {
                    id: 'spatial-scatter',
                    mode: 'scatter',
                    mark: 'scatter',
                    quickApi: 'spatialScatter',
                    description: 'Depth-tested point observations with sizes, colors, labels, and picking.',
                },
            ],
        },
    ]);
    const spatialCompatibilityModes = Object.freeze([
        {
            id: 'globe',
            canonicalFamilyId: 'map',
            mode: 'globe',
            mark: 'globe',
            quickApi: 'globe',
            renderer: 'webgl',
            entryPoint: 'graflume/spatial',
            integration: 'existing-family-spatial-mode',
            description: 'Natural Earth land and borders on a sphere with optional points and routes.',
        },
    ]);
    const spatialCatalogBoundary = Object.freeze({
        coreAndCompleteCanonicalFamilies: 41,
        coreAndCompletePresets: 168,
        spatialCanonicalFamilies: spatialChartFamilies.length,
        totalCanonicalFamilies: 44,
        spatialVariants: spatialChartFamilies.reduce((total, family) => total + family.variants.length, 0),
        integratedExistingFamilyModes: spatialCompatibilityModes.length,
        totalPresetsAndModes: 176,
    });

    /*
     * Deterministic, browser-safe data materializers for the public demo recipe contract.
     *
     * This module deliberately has no DOM, Node, timer, locale, or ambient-randomness dependency.
     * The catalog generator imports the same implementation that Rollup includes in the public API.
     */

    const commonParameterKeys = [
      'family',
      'scenario',
      'valuePolicy',
      'valueFields',
      'positiveFields',
      'nullableFields',
    ];

    const recipeDefinitions = [
      [
        'time-signal',
        'rows',
        'Time-binned signal with trend, seasonality, and deterministic incidents.',
        'time-bin-lttb',
        'quantiles',
        ['seriesCount', 'dateCycleDays'],
      ],
      [
        'categorical-events',
        'rows',
        'Ranked category aggregates derived from a logical event stream.',
        'group-sum-top-k',
        'top-groups',
        ['categoryCount', 'explicitPerformance'],
      ],
      [
        'clustered-points',
        'rows',
        'Stratified samples from separated, labeled point clusters.',
        'stratified-cluster-sample',
        'quantiles',
        ['clusterCount', 'explicitPerformance'],
      ],
      [
        'interval-sequence',
        'rows',
        'Ordered non-negative intervals with stable identities.',
        'interval-window-sample',
        'quantiles',
        [],
      ],
      [
        'ohlcv-sequence',
        'rows',
        'Time-binned OHLCV candles that preserve price invariants.',
        'ohlcv-time-bins',
        'quantiles',
        ['explicitPerformance'],
      ],
      [
        'motion-trajectories',
        'rows',
        'Entity trajectories sampled across representative frames.',
        'entity-frame-strata',
        'trajectory-frames',
        ['entityCount', 'frameCount', 'explicitPerformance'],
      ],
      [
        'geo-events',
        'rows',
        'Weighted geographic events sampled around stable world hubs.',
        'geohash-stratified-sample',
        'spatial-slice',
        ['geometry'],
      ],
      [
        'relationship-edges',
        'rows',
        'Weighted modular graph edges with bounded degree and stable IDs.',
        'community-edge-aggregation',
        'top-groups',
        ['topology', 'nodeCount', 'categoryCount', 'explicitPerformance'],
      ],
      [
        'hierarchy-nodes',
        'rows',
        'Balanced rooted hierarchy with bounded visible depth and fanout.',
        'hierarchy-level-of-detail',
        'hierarchy-focus',
        ['topology', 'nodeCount', 'explicitPerformance'],
      ],
      [
        'text-corpus',
        'rows',
        'Aggregated multilingual term frequencies from a logical corpus.',
        'term-frequency-top-k',
        'top-groups',
        ['wordCount', 'explicitPerformance'],
      ],
      [
        'multivariate-observations',
        'rows',
        'Stratified multivariate observations with correlated dimensions.',
        'stratified-observation-sample',
        'quantiles',
        ['mode', 'dimensionCount', 'explicitPerformance'],
      ],
      [
        'grid-2d',
        'rows',
        'Downsampled two-dimensional field preserving peaks and spatial gradients.',
        'area-weighted-grid-downsample',
        'spatial-slice',
        ['rows', 'columns'],
      ],
      [
        'ternary-composition',
        'rows',
        'Stratified non-negative compositions normalized to a positive total.',
        'simplex-stratified-sample',
        'quantiles',
        [],
      ],
      [
        'smith-sweep',
        'rows',
        'Frequency sweep over non-negative resistance and signed reactance.',
        'frequency-window-sample',
        'quantiles',
        [],
      ],
      [
        'venn-membership',
        'rows',
        'Exact bounded intersections aggregated from logical memberships.',
        'set-intersection-aggregate',
        'intersection-summary',
        ['aggregateSetCount', 'preAggregate'],
      ],
      [
        'surface-grid',
        'surface-grid',
        'Multi-lobe terrain grid with an output-bounded level of detail.',
        'surface-grid-level-of-detail',
        'spatial-slice',
        ['rows', 'columns'],
      ],
      [
        'volume-grid',
        'volume-grid',
        'Multi-lobe volumetric density field with bounded voxel resolution.',
        'volume-grid-level-of-detail',
        'spatial-slice',
        ['dimensions', 'maxSamples'],
      ],
      [
        'spatial-vector',
        'rows-or-vector-set',
        'Vortex vector field represented as rows or a Spatial vector set.',
        'vector-grid-level-of-detail',
        'spatial-slice',
        ['dimensions', 'maxSamples'],
      ],
    ];

    const demoRecipeCatalog$1 = Object.freeze(
      recipeDefinitions.map(
        ([id, shape, summary, reductionMethod, previewMethod, recipeParameterKeys]) =>
          Object.freeze({
            id,
            shape,
            summary,
            reductionMethod,
            previewMethod,
            parameterKeys: Object.freeze([...commonParameterKeys, ...recipeParameterKeys]),
          }),
      ),
    );

    const definitionById = new Map(demoRecipeCatalog$1.map((definition) => [definition.id, definition]));
    const palette = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669', '#0891b2'];
    const segmentNames = [
      'Enterprise',
      'Growth',
      'Core',
      'Education',
      'Public',
      'Research',
      'Creator',
      'Community',
    ];
    const capabilityNames = ['Insights', 'Dashboards', 'Reports', 'Alerts', 'Models', 'Exports'];
    const acquisitionChannelNames = [
      'Organic search',
      'Direct',
      'Product referrals',
      'Community',
      'Campaigns',
      'Partner ecosystem',
    ];
    const funnelStageNames = [
      'Visited',
      'Explored a chart',
      'Created a view',
      'Shared with a team',
      'Returned in 30 days',
    ];
    const revenueDriverNames = [
      'Opening MRR',
      'New teams',
      'Plan upgrades',
      'Downgrades',
      'Churn',
      'Currency impact',
    ];
    const phaseNames = ['Discover', 'Prepare', 'Model', 'Review', 'Publish', 'Monitor'];
    const seriesNames = ['Dashboards', 'Reports', 'Models', 'Exports', 'Alerts', 'Catalogs'];
    const relationshipNodeNames = [
      'Collection',
      'Validation',
      'Catalog',
      'Exploration',
      'Modeling',
      'Reports',
      'Alerts',
      'Exports',
      'Governance',
      'Collaboration',
      'Monitoring',
      'Publishing',
    ];
    const relationshipCommunityNames = [
      'Data engineering',
      'Analysis',
      'Research',
      'Product',
      'Design',
      'Operations',
    ];
    const accountNames = [
      'Aurora Labs',
      'Blue Harbor',
      'Cedar Health',
      'Delta Works',
      'Evergreen Public',
      'Fieldnote Studio',
      'Granite Research',
      'Helio Education',
      'Indigo Systems',
      'Juniper Market',
      'Keystone Civic',
      'Lumen Analytics',
    ];
    const initiativeNames = [
      'Atlas migration',
      'Beacon catalog',
      'Compass metrics',
      'Drift monitor',
      'Ember forecast',
      'Foundry reports',
      'Harbor alerts',
      'Iris governance',
      'Junction exports',
      'Kepler models',
      'Lantern quality',
      'Meridian access',
    ];
    const operatingRegions = ['APAC', 'EMEA', 'Americas', 'Public sector', 'Education', 'Research'];
    const releaseTrainNames = ['Horizon', 'Northstar', 'Solstice', 'Waypoint'];
    const regionalMetricNames = [
      'freshness monitor',
      'quality review',
      'catalog search',
      'forecast refresh',
      'dashboard session',
      'alert delivery',
    ];
    const vennSetNames = ['Analysis', 'Engineering', 'Design', 'Operations', 'Research'];
    const hubCoordinates = [
      [126.978, 37.5665, 'Seoul'],
      [-122.4194, 37.7749, 'San Francisco'],
      [-0.1276, 51.5072, 'London'],
      [2.3522, 48.8566, 'Paris'],
      [13.405, 52.52, 'Berlin'],
      [139.6917, 35.6895, 'Tokyo'],
      [151.2093, -33.8688, 'Sydney'],
      [103.8198, 1.3521, 'Singapore'],
      [-46.6333, -23.5505, 'Sao Paulo'],
      [28.0473, -26.2041, 'Johannesburg'],
    ];
    const corpusTerms = [
      '통계',
      'data',
      'visualization',
      '분석',
      'model',
      'quality',
      'insight',
      'research',
      'forecast',
      'dashboard',
      'reproducible',
      'open-source',
      '데이터',
      '시각화',
      'evidence',
      'workflow',
      'monitoring',
      'accessibility',
    ];

    function invariant(condition, message) {
      if (!condition) throw new TypeError(`Invalid Graflume demo recipe: ${message}`);
    }

    function integer(value, fallback, minimum = 1, maximum = 1_000_000) {
      if (!Number.isFinite(value)) return fallback;
      return Math.min(maximum, Math.max(minimum, Math.trunc(value)));
    }

    function numeric(value, fallback) {
      return Number.isFinite(value) ? Number(value) : fallback;
    }

    function stringValue(value, fallback) {
      return typeof value === 'string' && value.length > 0 ? value : fallback;
    }

    function parameter(recipe, name, fallback) {
      const parameters = recipe.parameters;
      if (parameters === null || typeof parameters !== 'object' || Array.isArray(parameters)) {
        return fallback;
      }
      return Object.hasOwn(parameters, name) ? parameters[name] : fallback;
    }

    function hash32(value) {
      let result = value >>> 0;
      result ^= result >>> 16;
      result = Math.imul(result, 0x7feb352d);
      result ^= result >>> 15;
      result = Math.imul(result, 0x846ca68b);
      result ^= result >>> 16;
      return result >>> 0;
    }

    function unit(seed, index, stream = 0) {
      return (
        hash32((seed ^ Math.imul(index + 1, 0x9e3779b1) ^ Math.imul(stream + 1, 0x85ebca6b)) >>> 0) /
        4_294_967_296
      );
    }

    function signed(seed, index, stream = 0) {
      return unit(seed, index, stream) * 2 - 1;
    }

    function gaussian(seed, index, stream = 0) {
      const first = Math.max(Number.EPSILON, unit(seed, index, stream));
      const second = unit(seed, index, stream + 1);
      return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
    }

    function round(value, digits = 4) {
      const factor = 10 ** digits;
      return Math.round(value * factor) / factor;
    }

    function isoDate(dayOffset) {
      return new Date(Date.UTC(2024, 0, 1 + dayOffset)).toISOString().slice(0, 10);
    }

    function sourceRows(recipe) {
      return integer(recipe.cardinality?.sourceRows, 1);
    }

    function materializationLimit(recipe, preferredMaximum = Number.POSITIVE_INFINITY) {
      return Math.min(
        sourceRows(recipe),
        integer(recipe.outputBudget?.maximum, 1, 1, 4_194_304),
        preferredMaximum,
      );
    }

    function evenlySpacedIndices(length, count) {
      if (count >= length) return Array.from({ length }, (_, index) => index);
      if (count <= 1) return [Math.floor((length - 1) / 2)];
      return Array.from({ length: count }, (_, index) =>
        Math.round((index * (length - 1)) / (count - 1)),
      );
    }

    function sampledRows(rows, maximumRows, score) {
      if (rows.length <= maximumRows) return rows.map((row) => ({ ...row }));
      const indices = new Set(evenlySpacedIndices(rows.length, Math.max(2, maximumRows - 2)));
      if (score !== undefined) {
        let low = 0;
        let high = 0;
        for (let index = 1; index < rows.length; index += 1) {
          if (score(rows[index]) < score(rows[low])) low = index;
          if (score(rows[index]) > score(rows[high])) high = index;
        }
        indices.add(low);
        indices.add(high);
      }
      return [...indices]
        .sort((a, b) => a - b)
        .slice(0, maximumRows)
        .map((index) => ({ ...rows[index] }));
    }

    function timeSignal(recipe) {
      const family = stringValue(parameter(recipe, 'family', ''), 'line');
      const seriesCount = integer(
        parameter(recipe, 'seriesCount', family === 'area' ? 4 : 1),
        family === 'area' ? 4 : 1,
        1,
        8,
      );
      const preferredPoints = family === 'line' || family === 'area' ? 1_800 : 1_200;
      const points = Math.max(seriesCount, materializationLimit(recipe, preferredPoints));
      const perSeries = Math.max(1, Math.floor(points / seriesCount));
      const daySpan = integer(parameter(recipe, 'dateCycleDays', 731), 731, 2, 100_000) - 1;
      const rows = [];
      for (let series = 0; series < seriesCount; series += 1) {
        for (let index = 0; index < perSeries; index += 1) {
          const progress = perSeries <= 1 ? 0 : index / (perSeries - 1);
          const season = Math.sin(progress * Math.PI * 8 + series * 0.8) * (10 + series * 2);
          const longWave = Math.sin(progress * Math.PI * 2.2 + 0.4) * 7;
          const incident = Math.exp(-((progress - 0.72) ** 2) / 0.0028) * 22;
          const value =
            58 +
            series * 9 +
            progress * 30 +
            season +
            longWave +
            incident +
            signed(recipe.seed, index, series) * 2.4;
          const day = Math.round(progress * daySpan);
          const milestone = [
            [0.18, 'Baseline approved'],
            [0.48, 'Model launched'],
            [0.72, 'Campaign lift'],
            [0.9, 'Quarterly review'],
          ].find(([position]) => Math.abs(progress - position) < 0.5 / Math.max(1, perSeries));
          rows.push({
            date: isoDate(day),
            category: isoDate(day).slice(0, 7),
            value: round(value, 2),
            target: round(70 + progress * 22 + series * 6, 2),
            previous: round(value - 4 - Math.sin(progress * 9) * 3, 2),
            annotation: milestone?.[1] ?? '',
            series: seriesNames[series % seriesNames.length],
            angle: round(progress * 360, 3),
          });
        }
      }
      return rows;
    }

    function categoricalEvents(recipe) {
      const family = stringValue(parameter(recipe, 'family', ''), 'bar');
      const familyCount =
        family === 'gauge'
          ? 1
          : family === 'pie' || family === 'funnel'
            ? 5
            : ['bar', 'difference', 'item', 'waterfall'].includes(family)
              ? 6
              : 8;
      const requested = integer(parameter(recipe, 'categoryCount', familyCount), familyCount, 1, 80);
      const count = Math.min(requested, materializationLimit(recipe, 80));
      const labels =
        family === 'pie' || family === 'item'
          ? acquisitionChannelNames
          : family === 'funnel'
            ? funnelStageNames
            : family === 'waterfall'
              ? revenueDriverNames
              : capabilityNames;
      const rows = Array.from({ length: count }, (_, index) => {
        const base = 1_600 / (1 + index * 0.23);
        const value = Math.max(0, base * (0.84 + unit(recipe.seed, index, 1) * 0.32));
        return {
          category: index < labels.length ? labels[index] : `Segment ${index + 1}`,
          value: round(value, 1),
          previous: round(value * (0.82 + unit(recipe.seed, index, 2) * 0.2), 1),
          target: round(value * (1.05 + unit(recipe.seed, index, 3) * 0.12), 1),
          radius: round(18 + unit(recipe.seed, index, 4) * 34, 2),
        };
      });
      if (family === 'funnel') rows.sort((left, right) => right.value - left.value);
      if (family === 'waterfall') {
        rows.forEach((row, index) => {
          row.value = round((index === 0 ? 1 : index % 3 === 0 ? -0.38 : 0.24) * row.value, 1);
        });
      }
      if (family === 'gauge') {
        rows[0] = { category: 'Reliability', value: 99.93, previous: 99.84, target: 99.9, radius: 34 };
      }
      if (family === 'item') {
        const total = rows.reduce((sum, row) => sum + row.value, 0);
        let allocated = 0;
        rows.forEach((row, index) => {
          row.value =
            index === rows.length - 1 ? 100 - allocated : Math.round((row.value / total) * 100);
          allocated += row.value;
        });
      }
      return rows;
    }

    function clusteredPoints(recipe) {
      const count = materializationLimit(recipe, 4_000);
      const clusterCount = integer(parameter(recipe, 'clusterCount', 6), 6, 2, 12);
      return Array.from({ length: count }, (_, index) => {
        const cluster = index % clusterCount;
        const angle = (cluster / clusterCount) * Math.PI * 2;
        const centerX = Math.cos(angle) * 44;
        const centerY = Math.sin(angle) * 31;
        const x = centerX + gaussian(recipe.seed, index, 10) * (5 + cluster * 0.35);
        const y = centerY + gaussian(recipe.seed, index, 12) * (4 + cluster * 0.28);
        return {
          x: round(x, 3),
          y: round(y, 3),
          size: round(6 + unit(recipe.seed, index, 14) * 34, 2),
          group: segmentNames[cluster % segmentNames.length],
          label: `${accountNames[index % accountNames.length]} · ${segmentNames[cluster % segmentNames.length]}`,
        };
      });
    }

    function intervalSequence(recipe) {
      const count = materializationLimit(recipe, 64);
      const rows = Array.from({ length: count }, (_, index) => {
        const lane = index % phaseNames.length;
        const startDay = Math.floor(index / phaseNames.length) * 2 + lane;
        const duration = 2 + Math.floor(unit(recipe.seed, index, 20) * 10);
        const low = round(18 + lane * 10 + signed(recipe.seed, index, 21) * 4, 2);
        const high = round(low + 5 + unit(recipe.seed, index, 22) * 16, 2);
        const initiative = initiativeNames[index % initiativeNames.length];
        const region =
          operatingRegions[Math.floor(index / initiativeNames.length) % operatingRegions.length];
        return {
          id: `${initiative.toLowerCase().replaceAll(' ', '-')}-${phaseNames[lane].toLowerCase()}-${region.toLowerCase().replaceAll(' ', '-')}`,
          category: `${phaseNames[lane]} · ${initiative} · ${region}`,
          start: isoDate(startDay),
          end: isoDate(startDay + duration),
          low,
          high,
          value: round((low + high) / 2, 2),
          progress: Math.round(unit(recipe.seed, index, 23) * 100),
        };
      });
      return rows;
    }

    function ohlcvSequence(recipe) {
      const family = stringValue(parameter(recipe, 'family', ''), 'candlestick');
      const preferredCount = family === 'candlestick' ? 720 : family === 'price-blocks' ? 900 : 1_000;
      const count = materializationLimit(recipe, preferredCount);
      const source = sourceRows(recipe);
      const binSize = Math.max(1, source / count);
      const rows = [];
      let previousClose = 118 + unit(recipe.seed, 0, 30) * 8;
      for (let index = 0; index < count; index += 1) {
        const trend = index / Math.max(1, count - 1);
        const open = previousClose;
        const impulse = Math.sin(index * 0.11) * 1.3 + signed(recipe.seed, index, 31) * 2.1 + 0.035;
        const close = Math.max(1, open + impulse);
        const spread = 0.6 + unit(recipe.seed, index, 32) * 2.8;
        const low = Math.max(
          0.01,
          Math.min(open, close) - spread * (0.45 + unit(recipe.seed, index, 33)),
        );
        const high = Math.max(open, close) + spread * (0.45 + unit(recipe.seed, index, 34));
        const volume = Math.round((85_000 + unit(recipe.seed, index, 35) * 340_000) * binSize);
        const middle = (open + high + low + close) / 4;
        rows.push({
          // Source rows represent intraday observations; each emitted row is one
          // aggregate candle. Keep the displayed horizon realistic instead of
          // stretching the logical event count across centuries.
          date: isoDate(index),
          open: round(open, 4),
          high: round(high, 4),
          low: round(low, 4),
          close: round(close, 4),
          value: round(close, 4),
          price: round(middle, 4),
          volume,
          lower: round(close * (0.965 - trend * 0.003), 4),
          upper: round(close * (1.035 + trend * 0.003), 4),
          signal: round((open + close) / 2, 4),
        });
        previousClose = close;
      }
      if (family === 'volume-profile') {
        const bins = new Map();
        for (const row of rows) {
          const price = Math.round(row.price / 2) * 2;
          const current = bins.get(price) ?? { date: row.date, price, volume: 0 };
          current.volume += row.volume;
          bins.set(price, current);
        }
        return [...bins.values()].sort((left, right) => left.price - right.price);
      }
      return rows;
    }

    function motionTrajectories(recipe) {
      const desiredFrames = integer(parameter(recipe, 'frameCount', 20), 20, 2, 120);
      const desiredEntities = integer(parameter(recipe, 'entityCount', 5_000), 5_000, 1, 50_000);
      const limit = materializationLimit(recipe, 4_000);
      const frames = Math.min(desiredFrames, Math.max(2, Math.floor(Math.sqrt(limit))));
      const entities = Math.min(desiredEntities, Math.max(1, Math.floor(limit / frames)));
      const rows = [];
      for (let frame = 0; frame < frames; frame += 1) {
        const time = frame / Math.max(1, frames - 1);
        for (let entity = 0; entity < entities; entity += 1) {
          const group = entity % 6;
          const baseAngle = (entity / Math.max(1, entities)) * Math.PI * 2;
          const radius = 25 + group * 5 + signed(recipe.seed, entity, 40) * 4;
          const angle = baseAngle + time * (0.8 + group * 0.17);
          const account = accountNames[entity % accountNames.length];
          const region =
            operatingRegions[Math.floor(entity / accountNames.length) % operatingRegions.length];
          const train =
            releaseTrainNames[
              Math.floor(entity / (accountNames.length * operatingRegions.length)) %
                releaseTrainNames.length
            ];
          rows.push({
            id: `${account} · ${region} · ${train}`,
            x: round(Math.cos(angle) * radius + time * 24 - 12, 3),
            y: round(Math.sin(angle) * radius + Math.sin(time * Math.PI) * 9, 3),
            size: round(8 + unit(recipe.seed, entity, 41) * 26, 2),
            group: segmentNames[group],
            time: `2026-W${String(frame + 1).padStart(2, '0')}`,
          });
        }
      }
      return rows;
    }

    function geoEvents(recipe) {
      const count = materializationLimit(recipe, 2_400);
      return Array.from({ length: count }, (_, index) => {
        const hub = hubCoordinates[index % hubCoordinates.length];
        const longitude = Math.max(
          -180,
          Math.min(180, hub[0] + gaussian(recipe.seed, index, 50) * 3.2),
        );
        const latitude = Math.max(-85, Math.min(85, hub[1] + gaussian(recipe.seed, index, 52) * 2.2));
        return {
          longitude: round(longitude, 5),
          latitude: round(latitude, 5),
          value: round(25 + unit(recipe.seed, index, 54) * 975, 2),
          category: hub[2],
          label: `${hub[2]} · ${regionalMetricNames[index % regionalMetricNames.length]}`,
        };
      });
    }

    function relationshipEdges(recipe) {
      const family = stringValue(parameter(recipe, 'family', ''), 'network');
      const limit = materializationLimit(recipe, 8_000);
      const defaultNodeCount = Math.ceil(Math.sqrt(sourceRows(recipe)));
      const requestedCategoryCount = parameter(recipe, 'categoryCount', defaultNodeCount);
      const requestedNodes = integer(
        parameter(recipe, 'nodeCount', requestedCategoryCount),
        defaultNodeCount,
        4,
        5_000,
      );
      // A dense relationship source is pre-aggregated into a readable product
      // workflow. Twelve named nodes keep labels legible at the manual's mobile
      // and desktop viewports while every retained node remains inspectable.
      const visualNodeLimit = family === 'chord' ? 12 : family === 'network' ? 12 : 64;
      const nodes = Math.min(requestedNodes, visualNodeLimit, Math.max(4, Math.floor(limit * 0.72)));
      const nodeLabel = (index) => {
        const base = relationshipNodeNames[index % relationshipNodeNames.length];
        const cohort = Math.floor(index / relationshipNodeNames.length);
        return cohort === 0 ? base : `${base} · ${operatingRegions[cohort % operatingRegions.length]}`;
      };
      const rows = [];
      for (let index = 1; index < nodes && rows.length < limit; index += 1) {
        const community = index % 12;
        const parent =
          family === 'flow' ? Math.max(0, index - 1 - (index % 3)) : Math.floor((index - 1) / 2);
        rows.push({
          id: `edge-${rows.length + 1}`,
          source: nodeLabel(parent),
          target: nodeLabel(index),
          value: round(2 + unit(recipe.seed, index, 60) * 48, 2),
          community: relationshipCommunityNames[community % relationshipCommunityNames.length],
        });
        if (family !== 'flow' && index > 3 && rows.length < limit && index % 4 === 0) {
          rows.push({
            id: `edge-${rows.length + 1}`,
            source: nodeLabel(Math.max(0, index - 4)),
            target: nodeLabel(index),
            value: round(1 + unit(recipe.seed, index, 61) * 20, 2),
            community: relationshipCommunityNames[community % relationshipCommunityNames.length],
          });
        }
      }
      return rows;
    }

    function hierarchyNodes(recipe) {
      const family = stringValue(parameter(recipe, 'family', ''), 'hierarchy');
      const limit = materializationLimit(recipe, 240);
      const rows = [];
      for (let index = 0; index < limit; index += 1) {
        const parentIndex = index === 0 ? -1 : Math.floor((index - 1) / 5);
        const depth = index === 0 ? 0 : Math.floor(Math.log(index * 4 + 1) / Math.log(5));
        const initiative = initiativeNames[index % initiativeNames.length];
        const region =
          operatingRegions[Math.floor(index / initiativeNames.length) % operatingRegions.length];
        const train =
          releaseTrainNames[
            Math.floor(index / (initiativeNames.length * operatingRegions.length)) %
              releaseTrainNames.length
          ];
        const label =
          index === 0
            ? 'Statground'
            : `${phaseNames[depth % phaseNames.length]} · ${initiative} · ${region} · ${train}`;
        const value = Math.max(1, Math.round(120_000 / (1 + depth * 3 + (index % 17))));
        const id =
          index === 0
            ? 'statground'
            : `${train.toLowerCase()}-${region.toLowerCase().replaceAll(' ', '-')}-${initiative
            .toLowerCase()
            .replaceAll(' ', '-')}`;
        rows.push(
          family === 'word-tree'
            ? { word: label, parent: parentIndex < 0 ? '' : rows[parentIndex].word, weight: value }
            : {
                id,
                parent: parentIndex < 0 ? '' : rows[parentIndex].id,
                value,
                label,
              },
        );
      }
      return rows;
    }

    function textCorpus(recipe) {
      const count = Math.min(
        materializationLimit(recipe, 80),
        Math.max(12, integer(parameter(recipe, 'wordCount', 80), 80, 12, 80)),
      );
      return Array.from({ length: count }, (_, index) => ({
        word: index < corpusTerms.length ? corpusTerms[index] : `term-${index + 1}`,
        weight: Math.max(
          1,
          Math.round((30_000 / (index + 8) ** 0.72) * (0.9 + unit(recipe.seed, index, 70) * 0.2)),
        ),
        language: index % 5 === 0 ? 'ko' : 'mixed',
      }));
    }

    function multivariateObservations(recipe) {
      const family = stringValue(parameter(recipe, 'family', ''), 'distribution');
      const preferredCount =
        family === 'parallel'
          ? 160
          : family === 'scatter-matrix'
            ? 400
            : family === 'table'
              ? 5_000
              : 2_000;
      const count = materializationLimit(recipe, preferredCount);
      return Array.from({ length: count }, (_, index) => {
        const cohort = index % 5;
        const latent = gaussian(recipe.seed, index, 80);
        const speed = 64 + cohort * 5 + latent * 8 + gaussian(recipe.seed, index, 82) * 2;
        const quality = 72 + cohort * 3 + latent * 5 + gaussian(recipe.seed, index, 84) * 4;
        const cost = 96 - cohort * 7 - latent * 4 + gaussian(recipe.seed, index, 86) * 5;
        const initiative = initiativeNames[index % initiativeNames.length];
        const region =
          operatingRegions[Math.floor(index / initiativeNames.length) % operatingRegions.length];
        const train =
          releaseTrainNames[
            Math.floor(index / (initiativeNames.length * operatingRegions.length)) %
              releaseTrainNames.length
          ];
        return {
          name: `${initiative} · ${region} · ${train}`,
          category: segmentNames[cohort],
          series: index % 2 === 0 ? 'Current' : 'Previous',
          speed: round(speed, 3),
          quality: round(quality, 3),
          cost: round(Math.max(1, cost), 3),
          value: round(quality + speed * 0.25, 3),
          target: round(88 + cohort * 2, 3),
          previous: round(quality + speed * 0.25 - 4.5 - cohort * 0.4, 3),
        };
      });
    }

    function gridDimensions(recipe, maximum) {
      const sourceGridRows = integer(
        parameter(recipe, 'rows', recipe.cardinality?.axes?.rows ?? 256),
        256,
        2,
        1_024,
      );
      const sourceColumns = integer(
        parameter(recipe, 'columns', recipe.cardinality?.axes?.columns ?? 256),
        256,
        2,
        1_024,
      );
      const ratio = sourceColumns / sourceGridRows;
      const rows = Math.max(2, Math.min(sourceGridRows, Math.floor(Math.sqrt(maximum / ratio))));
      const columns = Math.max(2, Math.min(sourceColumns, Math.floor(maximum / rows)));
      return [rows, columns];
    }

    function fieldValue(x, y, seed, index) {
      const peakA = Math.exp(-((x + 0.42) ** 2 + (y - 0.18) ** 2) * 7.5) * 92;
      const peakB = Math.exp(-((x - 0.36) ** 2 + (y + 0.3) ** 2) * 13) * 68;
      const basin = Math.exp(-((x - 0.05) ** 2 + (y - 0.02) ** 2) * 4) * 22;
      return peakA + peakB - basin + Math.sin(x * 7 + y * 4) * 6 + signed(seed, index, 90) * 1.4;
    }

    function grid2d(recipe) {
      const family = stringValue(parameter(recipe, 'family', ''), 'heatmap');
      const preferredCells = family === 'image' ? 9_000 : family === 'contour' ? 6_400 : 3_600;
      const [rows, columns] = gridDimensions(recipe, materializationLimit(recipe, preferredCells));
      const output = [];
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column;
          const x = columns <= 1 ? 0 : (column / (columns - 1)) * 2 - 1;
          const y = rows <= 1 ? 0 : (row / (rows - 1)) * 2 - 1;
          const value = fieldValue(x, y, recipe.seed, index);
          const normalized = Math.max(0, Math.min(1, (value + 28) / 126));
          output.push({
            row,
            column,
            x: family === 'image' ? column : round(x, 5),
            y: family === 'image' ? row : round(y, 5),
            a: round(x, 5),
            b: round(y, 5),
            px: round(x + Math.sin(y * Math.PI) * 0.16, 5),
            py: round(y + Math.cos(x * Math.PI) * 0.12, 5),
            value: round(value, 4),
            red: Math.round(28 + normalized * 218),
            green: Math.round(45 + (1 - Math.abs(normalized - 0.55) * 1.5) * 155),
            blue: Math.round(80 + (1 - normalized) * 165),
          });
        }
      }
      return output;
    }

    function ternaryComposition(recipe) {
      const count = materializationLimit(recipe, 1_500);
      return Array.from({ length: count }, (_, index) => {
        const rawA = 0.08 + unit(recipe.seed, index, 100) ** 1.4;
        const rawB = 0.08 + unit(recipe.seed, index, 101) ** 1.2;
        const rawC = 0.08 + unit(recipe.seed, index, 102) ** 1.6;
        const total = rawA + rawB + rawC;
        return {
          a: round(rawA / total, 7),
          b: round(rawB / total, 7),
          c: round(rawC / total, 7),
          series: segmentNames[index % 6],
        };
      });
    }

    function smithSweep(recipe) {
      const count = materializationLimit(recipe, 800);
      return Array.from({ length: count }, (_, index) => {
        const t = count <= 1 ? 0 : index / (count - 1);
        const frequency = 0.8 + t * 5.2;
        return {
          frequency: round(frequency, 6),
          real: round(Math.max(0, 0.08 + 1.9 * t + Math.sin(t * Math.PI * 4) * 0.12), 7),
          imaginary: round(Math.sin((t - 0.5) * Math.PI * 3) * (1.3 - t * 0.45), 7),
        };
      });
    }

    function vennMembership(recipe) {
      const setCount = integer(parameter(recipe, 'aggregateSetCount', 5), 5, 2, 5);
      const rows = [];
      const combinations = 2 ** setCount - 1;
      for (let mask = 1; mask <= combinations; mask += 1) {
        const names = [];
        let cardinality = sourceRows(recipe);
        for (let index = 0; index < setCount; index += 1) {
          if ((mask & (1 << index)) !== 0) {
            names.push(vennSetNames[index]);
            cardinality *= 0.36 + unit(recipe.seed, index, 110) * 0.1;
          }
        }
        const size = Math.max(
          0,
          Math.floor(cardinality * (0.82 + unit(recipe.seed, mask, 111) * 0.16)),
        );
        rows.push({
          category: names.join('&'),
          sets: names,
          size,
          members: [`${size.toLocaleString('en-US')} logical records`],
        });
      }
      return rows.sort((left, right) => right.size - left.size);
    }

    function surfaceGrid(recipe) {
      const [rows, columns] = gridDimensions(recipe, materializationLimit(recipe, 262_144));
      const x = Array.from({ length: columns }, (_, column) =>
        round((column / (columns - 1)) * 8 - 4, 5),
      );
      const y = Array.from({ length: rows }, (_, row) => round((row / (rows - 1)) * 6 - 3, 5));
      const z = [];
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const normalizedX = x[column] / 4;
          const normalizedY = y[row] / 3;
          z.push(
            round(fieldValue(normalizedX, normalizedY, recipe.seed, row * columns + column) / 24, 5),
          );
        }
      }
      return { rows, columns, x, y, z, values: [...z] };
    }

    function volumeDimensions(recipe, maximum) {
      const dimensions = Array.isArray(parameter(recipe, 'dimensions', undefined))
        ? parameter(recipe, 'dimensions', undefined)
        : recipe.cardinality?.axes?.dimensions;
      const source =
        Array.isArray(dimensions) && dimensions.length === 3
          ? dimensions.map((value) => integer(value, 64, 2, 256))
          : [64, 64, 64];
      const scale = Math.min(1, Math.cbrt(maximum / (source[0] * source[1] * source[2])));
      let output = source.map((value) => Math.max(2, Math.floor(value * scale)));
      while (output[0] * output[1] * output[2] > maximum) {
        const largest = output.indexOf(Math.max(...output));
        output[largest] = Math.max(2, output[largest] - 1);
      }
      return output;
    }

    function volumeGrid(recipe) {
      const dimensions = volumeDimensions(recipe, materializationLimit(recipe, 262_144));
      const values = [];
      const [width, height, depth] = dimensions;
      for (let z = 0; z < depth; z += 1) {
        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const nx = (x / (width - 1)) * 2 - 1;
            const ny = (y / (height - 1)) * 2 - 1;
            const nz = (z / (depth - 1)) * 2 - 1;
            const lobeA = Math.exp(
              -((nx + 0.28) ** 2 * 5 + (ny - 0.15) ** 2 * 8 + (nz + 0.08) ** 2 * 6),
            );
            const lobeB = Math.exp(
              -((nx - 0.38) ** 2 * 10 + (ny + 0.3) ** 2 * 7 + (nz - 0.24) ** 2 * 11),
            );
            const ring = Math.exp(-((Math.hypot(nx, ny) - 0.54) ** 2) * 32 - nz * nz * 7);
            values.push(round(lobeA * 0.92 + lobeB * 0.78 + ring * 0.32, 6));
          }
        }
      }
      return {
        dimensions,
        values,
        origin: [-1, -1, -1],
        spacing: [2 / (width - 1), 2 / (height - 1), 2 / (depth - 1)],
      };
    }

    function vectorComponents(x, y, z) {
      const attenuation = Math.exp(-(x * x + y * y + z * z) * 0.28);
      return [-y * attenuation, x * attenuation, (0.32 + Math.sin((x + y) * 1.4) * 0.18) * attenuation];
    }

    function spatialVector(recipe) {
      const maximum = materializationLimit(recipe, recipe.shape === 'rows' ? 625 : 3_375);
      const side = Math.max(2, Math.floor(Math.cbrt(maximum)));
      const count = Math.min(maximum, side ** 3);
      if (recipe.shape === 'rows') {
        const rows = [];
        const twoDimensionalSide = Math.max(2, Math.floor(Math.sqrt(maximum)));
        for (let yIndex = 0; yIndex < twoDimensionalSide; yIndex += 1) {
          for (let xIndex = 0; xIndex < twoDimensionalSide; xIndex += 1) {
            if (rows.length >= maximum) break;
            const x = (xIndex / (twoDimensionalSide - 1)) * 4 - 2;
            const y = (yIndex / (twoDimensionalSide - 1)) * 4 - 2;
            const [u, v] = vectorComponents(x, y, 0);
            const magnitude = Math.hypot(u, v);
            rows.push({
              x: round(x, 5),
              y: round(y, 5),
              value: round(u, 6),
              high: round(v, 6),
              direction: round(((Math.atan2(v, u) * 180) / Math.PI + 360) % 360, 4),
              magnitude: round(magnitude, 6),
            });
          }
        }
        return rows;
      }
      const origins = [];
      const vectors = [];
      const labels = [];
      const colors = [];
      for (let index = 0; index < count; index += 1) {
        const xIndex = index % side;
        const yIndex = Math.floor(index / side) % side;
        const zIndex = Math.floor(index / (side * side));
        const x = (xIndex / (side - 1)) * 4 - 2;
        const y = (yIndex / (side - 1)) * 4 - 2;
        const z = (zIndex / (side - 1)) * 3 - 1.5;
        origins.push([round(x, 5), round(y, 5), round(z, 5)]);
        vectors.push(vectorComponents(x, y, z).map((value) => round(value, 6)));
        const eastWest = x < -0.35 ? 'west' : x > 0.35 ? 'east' : 'central';
        const northSouth = y < -0.35 ? 'south' : y > 0.35 ? 'north' : 'midline';
        const altitude = z < -0.3 ? 'lower' : z > 0.3 ? 'upper' : 'middle';
        labels.push(`${altitude} ${northSouth} ${eastWest} flow`);
        colors.push(palette[index % palette.length]);
      }
      return { origins, vectors, labels, colors };
    }

    const generators = {
      'time-signal': timeSignal,
      'categorical-events': categoricalEvents,
      'clustered-points': clusteredPoints,
      'interval-sequence': intervalSequence,
      'ohlcv-sequence': ohlcvSequence,
      'motion-trajectories': motionTrajectories,
      'geo-events': geoEvents,
      'relationship-edges': relationshipEdges,
      'hierarchy-nodes': hierarchyNodes,
      'text-corpus': textCorpus,
      'multivariate-observations': multivariateObservations,
      'grid-2d': grid2d,
      'ternary-composition': ternaryComposition,
      'smith-sweep': smithSweep,
      'venn-membership': vennMembership,
      'surface-grid': surfaceGrid,
      'volume-grid': volumeGrid,
      'spatial-vector': spatialVector,
    };

    function dataCardinality(data) {
      if (Array.isArray(data)) return data.length;
      if (Array.isArray(data.z)) return data.z.length;
      if (Array.isArray(data.values)) return data.values.length;
      if (Array.isArray(data.origins)) return data.origins.length;
      throw new TypeError('Invalid Graflume demo materialization: unsupported output shape.');
    }

    function spatialPreview(data, maximumRows) {
      if (Array.isArray(data)) {
        return sampledRows(data, maximumRows, (row) =>
          numeric(row.value ?? row.magnitude ?? row.weight, 0),
        );
      }
      if (Array.isArray(data.z)) {
        const middle = Math.floor(data.rows / 2);
        return evenlySpacedIndices(data.columns, Math.min(maximumRows, data.columns)).map((column) => {
          const index = middle * data.columns + column;
          return {
            row: middle,
            column,
            x: data.x?.[column] ?? column,
            y: data.y?.[middle] ?? middle,
            z: data.z[index],
            value: data.values?.[index] ?? data.z[index],
          };
        });
      }
      if (Array.isArray(data.values)) {
        const [width, height, depth] = data.dimensions;
        const z = Math.floor(depth / 2);
        return evenlySpacedIndices(width * height, Math.min(maximumRows, width * height)).map(
          (within) => {
            const x = within % width;
            const y = Math.floor(within / width);
            return { x, y, z, value: data.values[z * width * height + within] };
          },
        );
      }
      return evenlySpacedIndices(data.origins.length, Math.min(maximumRows, data.origins.length)).map(
        (index) => {
          const [x, y, z] = data.origins[index];
          const [u, v, w] = data.vectors[index];
          return {
            x,
            y,
            z,
            u,
            v,
            w,
            magnitude: round(Math.hypot(u, v, w), 6),
            color: data.colors?.[index] ?? palette[index % palette.length],
            label: data.labels?.[index] ?? `Vector ${index + 1}`,
          };
        },
      );
    }

    function previewRowsFor(recipe, definition, data) {
      const maximumRows = integer(recipe.preview?.maximumRows, 12, 1, 12);
      if (definition.previewMethod === 'top-groups' && Array.isArray(data)) {
        return [...data]
          .sort(
            (left, right) =>
              numeric(right.value ?? right.weight, 0) - numeric(left.value ?? left.weight, 0),
          )
          .slice(0, maximumRows)
          .map((row) => ({ ...row }));
      }
      if (definition.previewMethod === 'hierarchy-focus' && Array.isArray(data)) {
        return data.slice(0, maximumRows).map((row) => ({ ...row }));
      }
      if (definition.previewMethod === 'intersection-summary' && Array.isArray(data)) {
        return data.slice(0, maximumRows).map((row) => ({ ...row }));
      }
      if (definition.previewMethod === 'trajectory-frames' && Array.isArray(data)) {
        const frames = [...new Set(data.map((row) => row.time))];
        const selectedFrames = new Set([
          frames[0],
          frames[Math.floor(frames.length / 2)],
          frames.at(-1),
        ]);
        return data
          .filter((row) => selectedFrames.has(row.time))
          .slice(0, maximumRows)
          .map((row) => ({ ...row }));
      }
      const preview = spatialPreview(data, maximumRows);
      if (
        recipe.parameters.family === 'annotation' &&
        Array.isArray(data) &&
        !preview.some((row) => typeof row.annotation === 'string' && row.annotation.length > 0)
      ) {
        const milestone = data.find(
          (row) => typeof row.annotation === 'string' && row.annotation.length > 0,
        );
        if (milestone !== undefined) {
          preview[preview.length - 1] = { ...milestone };
          preview.sort((left, right) => String(left.date).localeCompare(String(right.date)));
        }
      }
      return preview;
    }

    const recipeKeys = [
      'id',
      'version',
      'seed',
      'shape',
      'parameters',
      'cardinality',
      'reduction',
      'outputBudget',
      'preview',
      'initialView',
      'expectedInvariants',
    ];
    const axesByRecipe = {
      'time-signal': [],
      'categorical-events': ['categoryCount'],
      'clustered-points': [],
      'interval-sequence': [],
      'ohlcv-sequence': [],
      'motion-trajectories': ['entityCount', 'frameCount'],
      'geo-events': [],
      'relationship-edges': ['nodeCount', 'categoryCount'],
      'hierarchy-nodes': ['nodeCount'],
      'text-corpus': [],
      'multivariate-observations': [],
      'grid-2d': ['rows', 'columns'],
      'ternary-composition': [],
      'smith-sweep': [],
      'venn-membership': ['aggregateSetCount'],
      'surface-grid': ['rows', 'columns'],
      'volume-grid': ['dimensions'],
      'spatial-vector': ['vectors', 'dimensions'],
    };
    const stageByRecipe = {
      'time-signal': 'bin',
      'categorical-events': 'pre-aggregate',
      'clustered-points': 'sample',
      'interval-sequence': 'sample',
      'ohlcv-sequence': 'bin',
      'motion-trajectories': 'sample',
      'geo-events': 'sample',
      'relationship-edges': 'pre-aggregate',
      'hierarchy-nodes': 'level-of-detail',
      'text-corpus': 'pre-aggregate',
      'multivariate-observations': 'sample',
      'grid-2d': 'level-of-detail',
      'ternary-composition': 'sample',
      'smith-sweep': 'sample',
      'venn-membership': 'pre-aggregate',
      'surface-grid': 'level-of-detail',
      'volume-grid': 'level-of-detail',
      'spatial-vector': 'level-of-detail',
    };
    const resourcesByRecipe = {
      'time-signal': ['marks', 'line-points', 'bar-marks', 'combined-marks'],
      'categorical-events': ['marks', 'bar-marks', 'radial-marks'],
      'clustered-points': ['marks', 'point-marks'],
      'interval-sequence': ['marks', 'bar-marks'],
      'ohlcv-sequence': ['marks', 'bar-marks', 'line-points'],
      'motion-trajectories': ['marks', 'point-marks'],
      'geo-events': ['marks', 'point-marks'],
      'relationship-edges': ['marks', 'bar-marks', 'line-points'],
      'hierarchy-nodes': ['marks', 'bar-marks'],
      'text-corpus': ['marks', 'bar-marks'],
      'multivariate-observations': [
        'marks',
        'line-points',
        'point-marks',
        'visible-rows',
        'parallel-paths',
      ],
      'grid-2d': ['marks', 'bar-marks', 'line-points'],
      'ternary-composition': ['marks', 'point-marks'],
      'smith-sweep': ['marks', 'line-points'],
      'venn-membership': ['marks', 'set-intersections'],
      'surface-grid': ['spatial-elements', 'grid-points'],
      'volume-grid': ['spatial-elements', 'sampled-voxels'],
      'spatial-vector': ['marks', 'point-marks', 'spatial-elements', 'vectors'],
    };

    function closedObject(value, allowedKeys, requiredKeys, label) {
      invariant(
        value !== null && typeof value === 'object' && !Array.isArray(value),
        `${label} must be an object`,
      );
      const allowed = new Set(allowedKeys);
      for (const key of Object.keys(value)) {
        invariant(allowed.has(key), `${label}.${key} is not allowed`);
      }
      for (const key of requiredKeys) {
        invariant(Object.hasOwn(value, key), `${label}.${key} is required`);
      }
    }

    function numericDomain(value, label) {
      invariant(
        Array.isArray(value) &&
          value.length === 2 &&
          value.every(Number.isFinite) &&
          value[0] <= value[1],
        `${label} must be a finite ordered pair`,
      );
    }

    function validateRecipe(recipe) {
      closedObject(recipe, recipeKeys, recipeKeys, 'recipe');
      invariant(recipe.version === 2, 'version must equal 2');
      invariant(definitionById.has(recipe.id), `unknown recipe id ${String(recipe.id)}`);
      const definition = definitionById.get(recipe.id);
      invariant(
        definition.shape === recipe.shape ||
          (definition.shape === 'rows-or-vector-set' && ['rows', 'vector-set'].includes(recipe.shape)),
        `shape ${String(recipe.shape)} does not match ${recipe.id}`,
      );
      invariant(
        Number.isInteger(recipe.seed) && recipe.seed >= 1 && recipe.seed <= 0xffffffff,
        'seed must be an unsigned non-zero 32-bit integer',
      );
      closedObject(
        recipe.parameters,
        definition.parameterKeys,
        commonParameterKeys,
        'recipe.parameters',
      );
      invariant(
        typeof recipe.parameters.family === 'string' &&
          recipe.parameters.family.length > 0 &&
          typeof recipe.parameters.scenario === 'string' &&
          recipe.parameters.scenario.length > 0,
        'common parameters must be non-empty',
      );
      for (const key of ['valueFields', 'positiveFields', 'nullableFields']) {
        invariant(Array.isArray(recipe.parameters[key]), `recipe.parameters.${key} must be an array`);
      }
      closedObject(
        recipe.cardinality,
        ['sourceRows', 'unit', 'axes'],
        ['sourceRows', 'unit', 'axes'],
        'recipe.cardinality',
      );
      invariant(
        Number.isInteger(recipe.cardinality.sourceRows) && recipe.cardinality.sourceRows >= 1,
        'cardinality.sourceRows must be a positive integer',
      );
      const expectedUnit =
        recipe.id === 'categorical-events' || recipe.id === 'text-corpus'
          ? 'events'
          : recipe.id === 'relationship-edges'
            ? 'edges'
            : recipe.id === 'hierarchy-nodes'
              ? 'nodes'
              : recipe.shape === 'surface-grid' || recipe.id === 'grid-2d'
                ? 'cells'
                : recipe.shape === 'volume-grid'
                  ? 'voxels'
                  : recipe.shape === 'vector-set'
                    ? 'vectors'
                    : 'rows';
      invariant(
        recipe.cardinality.unit === expectedUnit,
        `cardinality.unit must equal ${expectedUnit}`,
      );
      closedObject(recipe.cardinality.axes, axesByRecipe[recipe.id], [], 'recipe.cardinality.axes');
      closedObject(recipe.reduction, ['stage', 'method'], ['stage', 'method'], 'recipe.reduction');
      invariant(
        recipe.reduction.stage === stageByRecipe[recipe.id],
        'reduction stage does not match the recipe id',
      );
      invariant(
        recipe.reduction.method === definition.reductionMethod,
        'reduction method does not match the recipe id',
      );
      closedObject(
        recipe.outputBudget,
        ['resource', 'maximum'],
        ['resource', 'maximum'],
        'recipe.outputBudget',
      );
      invariant(
        resourcesByRecipe[recipe.id].includes(recipe.outputBudget.resource),
        `outputBudget.resource ${String(recipe.outputBudget.resource)} does not match ${recipe.id}`,
      );
      invariant(
        Number.isInteger(recipe.outputBudget.maximum) &&
          recipe.outputBudget.maximum >= 1 &&
          recipe.outputBudget.maximum <= 4_194_304,
        'outputBudget.maximum is outside the safe contract',
      );
      closedObject(
        recipe.preview,
        ['method', 'maximumRows'],
        ['method', 'maximumRows'],
        'recipe.preview',
      );
      invariant(
        recipe.preview.method === definition.previewMethod,
        'preview method does not match the recipe id',
      );
      invariant(
        Number.isInteger(recipe.preview.maximumRows) &&
          recipe.preview.maximumRows >= 1 &&
          recipe.preview.maximumRows <= 12,
        'preview.maximumRows is outside the closed range',
      );
      closedObject(
        recipe.initialView,
        ['kind', 'zoom', 'xDomain', 'yDomain', 'zDomain', 'frame', 'sliceAxis', 'sliceIndex'],
        ['kind', 'zoom'],
        'recipe.initialView',
      );
      invariant(
        ['domain', 'viewport', 'camera', 'slice'].includes(recipe.initialView.kind),
        'initialView.kind is unknown',
      );
      invariant(
        Number.isFinite(recipe.initialView.zoom) && recipe.initialView.zoom > 0,
        'initialView.zoom must be positive',
      );
      for (const key of ['xDomain', 'yDomain', 'zDomain']) {
        if (Object.hasOwn(recipe.initialView, key))
          numericDomain(recipe.initialView[key], `recipe.initialView.${key}`);
      }
      invariant(
        Array.isArray(recipe.expectedInvariants) &&
          recipe.expectedInvariants.length > 0 &&
          recipe.expectedInvariants.every((value) => typeof value === 'string' && value.length > 0) &&
          new Set(recipe.expectedInvariants).size === recipe.expectedInvariants.length,
        'expectedInvariants must be a unique non-empty string array',
      );
    }

    /**
     * Materialize a closed Graflume demo recipe into deterministic, output-bounded data.
     * The logical source cardinality remains in the plan; generated data is a semantic LOD.
     */
    function materializeDemoRecipe$1(recipe) {
      validateRecipe(recipe);
      const definition = definitionById.get(recipe.id);
      const data = generators[recipe.id](recipe);
      const derivedRows = dataCardinality(data);
      const renderedMaximum = integer(recipe.outputBudget.maximum, 1, 1, 4_194_304);
      invariant(
        derivedRows <= renderedMaximum,
        `derived output ${derivedRows} exceeds budget ${renderedMaximum}`,
      );
      const previewRows = previewRowsFor(recipe, definition, data);
      invariant(
        previewRows.length >= 1 && previewRows.length <= 12,
        'preview must contain between 1 and 12 rows',
      );
      return {
        data,
        previewRows,
        plan: {
          recipeId: recipe.id,
          seed: recipe.seed,
          sourceRows: sourceRows(recipe),
          derivedRows,
          renderedRows: derivedRows,
          renderedMaximum,
          reduction: { stage: recipe.reduction.stage, method: recipe.reduction.method },
          budget: { resource: recipe.outputBudget.resource, maximum: renderedMaximum },
        },
      };
    }

    const demoRecipeIds = [
        'time-signal',
        'categorical-events',
        'clustered-points',
        'interval-sequence',
        'ohlcv-sequence',
        'motion-trajectories',
        'geo-events',
        'relationship-edges',
        'hierarchy-nodes',
        'text-corpus',
        'multivariate-observations',
        'grid-2d',
        'ternary-composition',
        'smith-sweep',
        'venn-membership',
        'surface-grid',
        'volume-grid',
        'spatial-vector',
    ];
    const demoRecipeCatalog = demoRecipeCatalog$1;
    function materializeDemoRecipe(recipe) {
        return materializeDemoRecipe$1(recipe);
    }

    const spatialSpecVersion = '0.1';
    function specBase(options) {
        return {
            specVersion: spatialSpecVersion,
            ...(options.title === undefined ? {} : { title: options.title }),
            ...(options.theme === undefined ? {} : { theme: options.theme }),
            ...(options.background === undefined ? {} : { background: options.background }),
            ...(options.ariaLabel === undefined ? {} : { ariaLabel: options.ariaLabel }),
            ...(options.camera === undefined ? {} : { camera: options.camera }),
            ...(options.lighting === undefined ? {} : { lighting: options.lighting }),
            ...(options.interaction === undefined ? {} : { interaction: options.interaction }),
            ...(options.accessibility === undefined ? {} : { accessibility: options.accessibility }),
            ...(options.legend === undefined ? {} : { legend: options.legend }),
            ...(options.highlights === undefined ? {} : { highlights: options.highlights }),
            ...(options.annotations === undefined ? {} : { annotations: options.annotations }),
        };
    }
    function createSpatial(target, spec, options) {
        return new SpatialChart(target, spec, options);
    }
    function surface(target, data, options = {}) {
        return createSpatial(target, {
            ...specBase(options),
            layers: [
                {
                    ...(options.id === undefined ? {} : { id: options.id }),
                    mark: {
                        type: 'surface',
                        mode: 'surface',
                        ...(options.color === undefined ? {} : { color: options.color }),
                        ...(options.opacity === undefined ? {} : { opacity: options.opacity }),
                        ...(options.normalMode === undefined ? {} : { normalMode: options.normalMode }),
                        ...(options.wireframe === undefined ? {} : { wireframe: options.wireframe }),
                        ...(options.wireOverlay === undefined ? {} : { wireOverlay: options.wireOverlay }),
                        ...(options.contours === undefined ? {} : { contours: options.contours }),
                    },
                    data,
                },
            ],
        }, options.create);
    }
    function mesh(target, data, options = {}) {
        return createSpatial(target, {
            ...specBase(options),
            layers: [
                {
                    ...(options.id === undefined ? {} : { id: options.id }),
                    mark: {
                        type: 'surface',
                        mode: 'mesh',
                        ...(options.color === undefined ? {} : { color: options.color }),
                        ...(options.opacity === undefined ? {} : { opacity: options.opacity }),
                        ...(options.normalMode === undefined ? {} : { normalMode: options.normalMode }),
                        ...(options.wireframe === undefined ? {} : { wireframe: options.wireframe }),
                        ...(options.wireOverlay === undefined ? {} : { wireOverlay: options.wireOverlay }),
                        ...(options.contours === undefined ? {} : { contours: options.contours }),
                    },
                    data,
                },
            ],
        }, options.create);
    }
    function volumeQuick(target, data, mode, options) {
        return createSpatial(target, {
            ...specBase(options),
            layers: [
                {
                    ...(options.id === undefined ? {} : { id: options.id }),
                    mark: {
                        type: 'volume',
                        mode,
                        ...(options.isoValue === undefined ? {} : { isoValue: options.isoValue }),
                        ...(options.opacity === undefined ? {} : { opacity: options.opacity }),
                        ...(options.pointSize === undefined ? {} : { pointSize: options.pointSize }),
                        ...(options.maxSamples === undefined ? {} : { maxSamples: options.maxSamples }),
                        ...(options.colorLow === undefined ? {} : { colorLow: options.colorLow }),
                        ...(options.colorHigh === undefined ? {} : { colorHigh: options.colorHigh }),
                        ...(options.transferFunction === undefined
                            ? {}
                            : { transferFunction: options.transferFunction }),
                        ...(options.windowLevel === undefined ? {} : { windowLevel: options.windowLevel }),
                        ...(options.render === undefined ? {} : { render: options.render }),
                        ...(options.slices === undefined ? {} : { slices: options.slices }),
                    },
                    data,
                },
            ],
        }, options.create);
    }
    function volume(target, data, options = {}) {
        return volumeQuick(target, data, 'volume', options);
    }
    function isosurface(target, data, options = {}) {
        return volumeQuick(target, data, 'isosurface', options);
    }
    function vectorChart(target, data, mode, options) {
        return createSpatial(target, {
            ...specBase(options),
            layers: [
                {
                    ...(options.id === undefined ? {} : { id: options.id }),
                    mark: {
                        type: 'vector',
                        mode,
                        ...(options.color === undefined ? {} : { color: options.color }),
                        ...(options.opacity === undefined ? {} : { opacity: options.opacity }),
                        ...(options.radius === undefined ? {} : { radius: options.radius }),
                        ...(options.scale === undefined ? {} : { scale: options.scale }),
                        ...(options.segments === undefined ? {} : { segments: options.segments }),
                        ...(options.integration === undefined ? {} : { integration: options.integration }),
                        ...(options.magnitudeEncoding === undefined
                            ? {}
                            : { magnitudeEncoding: options.magnitudeEncoding }),
                    },
                    data,
                },
            ],
        }, options.create);
    }
    function vectorCone(target, data, options = {}) {
        return vectorChart(target, data, 'cone', options);
    }
    function streamtube(target, data, options = {}) {
        return vectorChart(target, data, 'streamtube', options);
    }
    /** Integrates a portable raw 3D vector lattice and renders the derived paths as streamtubes. */
    function vectorField(target, data, options = {}) {
        return vectorChart(target, data, 'streamtube', options);
    }
    function spatialScatter(target, data, options = {}) {
        return createSpatial(target, {
            ...specBase(options),
            layers: [
                {
                    ...(options.id === undefined ? {} : { id: options.id }),
                    mark: {
                        type: 'scatter',
                        ...(options.color === undefined ? {} : { color: options.color }),
                        ...(options.opacity === undefined ? {} : { opacity: options.opacity }),
                        ...(options.pointSize === undefined ? {} : { pointSize: options.pointSize }),
                    },
                    data,
                },
            ],
        }, options.create);
    }
    const scatter = spatialScatter;
    function globe(target, data = {}, options = {}) {
        return createSpatial(target, {
            ...specBase(options),
            layers: [
                {
                    ...(options.id === undefined ? {} : { id: options.id }),
                    mark: {
                        type: 'globe',
                        ...(options.radius === undefined ? {} : { radius: options.radius }),
                        ...(options.landColor === undefined ? {} : { landColor: options.landColor }),
                        ...(options.oceanColor === undefined ? {} : { oceanColor: options.oceanColor }),
                        ...(options.borderColor === undefined ? {} : { borderColor: options.borderColor }),
                        ...(options.pointColor === undefined ? {} : { pointColor: options.pointColor }),
                        ...(options.routeColor === undefined ? {} : { routeColor: options.routeColor }),
                        ...(options.opacity === undefined ? {} : { opacity: options.opacity }),
                        ...(options.routeSegments === undefined
                            ? {}
                            : { routeSegments: options.routeSegments }),
                    },
                    data,
                },
            ],
        }, options.create);
    }
    function spatialCapabilities() {
        return {
            renderer: 'webgl',
            gpu: true,
            projections: ['perspective', 'orthographic'],
            marks: {
                surface: ['surface', 'mesh'],
                volume: ['volume', 'isosurface'],
                vector: ['cone', 'streamtube'],
                scatter: ['scatter'],
                globe: ['globe', 'point', 'route'],
            },
            exportFormats: ['image/png'],
        };
    }
    const webglSpatialRenderer = Object.freeze({
        name: 'webgl',
        gpu: true,
        projections: ['perspective', 'orthographic'],
    });

    exports.SpatialChart = SpatialChart;
    exports.SpatialSemanticNavigator = SpatialSemanticNavigator;
    exports.adaptiveCapabilityCatalog = adaptiveCapabilityCatalog;
    exports.adaptiveContractVersion = adaptiveContractVersion;
    exports.adaptiveMediaQueries = adaptiveMediaQueries;
    exports.adaptiveProfileCatalog = adaptiveProfileCatalog;
    exports.assertValidSpatialSpec = assertValidSpatialSpec;
    exports.builtInThemeCatalog = builtInThemeCatalog;
    exports.compileSpatial = compileSpatial;
    exports.computeSurfaceNormalGeometry = computeSurfaceNormalGeometry;
    exports.createAdaptiveEnvironment = createAdaptiveEnvironment;
    exports.createSpatial = createSpatial;
    exports.createSpatialSemanticNavigator = createSpatialSemanticNavigator;
    exports.defaultThemeId = defaultThemeId;
    exports.demoRecipeCatalog = demoRecipeCatalog;
    exports.demoRecipeIds = demoRecipeIds;
    exports.detectBrowserAdaptiveEnvironment = detectBrowserAdaptiveEnvironment;
    exports.evaluateVolumeTransfer = evaluateVolumeTransfer;
    exports.extractSurfaceContourSegments = extractSurfaceContourSegments;
    exports.generateVectorFieldSeeds = generateVectorFieldSeeds;
    exports.globe = globe;
    exports.graflumeDark = graflumeDark;
    exports.graflumeGgplot = graflumeGgplot;
    exports.graflumeLight = graflumeLight;
    exports.graflumeMatplotlib = graflumeMatplotlib;
    exports.graflumeRBase = graflumeRBase;
    exports.integrateVectorField = integrateVectorField;
    exports.isosurface = isosurface;
    exports.materializeDemoRecipe = materializeDemoRecipe;
    exports.mesh = mesh;
    exports.normalizeAdaptiveOptions = normalizeAdaptiveOptions;
    exports.normalizeVolumeValue = normalizeVolumeValue;
    exports.projectVolumeRays = projectVolumeRays;
    exports.resolveAdaptiveProfile = resolveAdaptiveProfile;
    exports.sampleVectorField = sampleVectorField;
    exports.sampleVolumeSlice = sampleVolumeSlice;
    exports.sampleVolumeValue = sampleVolumeValue;
    exports.scatter = scatter;
    exports.spatialCapabilities = spatialCapabilities;
    exports.spatialCatalogBoundary = spatialCatalogBoundary;
    exports.spatialChartFamilies = spatialChartFamilies;
    exports.spatialCompatibilityModes = spatialCompatibilityModes;
    exports.spatialOutputLimits = spatialOutputLimits;
    exports.spatialScatter = spatialScatter;
    exports.spatialSpecVersion = spatialSpecVersion;
    exports.streamtube = streamtube;
    exports.surface = surface;
    exports.validateSpatialSpec = validateSpatialSpec;
    exports.vectorCone = vectorCone;
    exports.vectorField = vectorField;
    exports.vectorFieldWorldBounds = vectorFieldWorldBounds;
    exports.volume = volume;
    exports.volumeValueExtent = volumeValueExtent;
    exports.volumeWorldBounds = volumeWorldBounds;
    exports.volumeWorldPosition = volumeWorldPosition;
    exports.webglSpatialRenderer = webglSpatialRenderer;

    return exports;

})({});
//# sourceMappingURL=graflume.spatial.global.js.map
