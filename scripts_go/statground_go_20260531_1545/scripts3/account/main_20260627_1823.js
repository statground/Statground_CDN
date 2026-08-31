(function () {
  function ctx() {
    return window.STATGROUND_PAGE_CONTEXT || {};
  }

  function currentLang() {
    if (window.sg_get_current_lang) {
      return String(window.sg_get_current_lang() || "ko").trim() || "ko";
    }
    return String(ctx().lang || document.documentElement.lang || "ko").trim() || "ko";
  }

  const signupMessages = {
    "ko": { title: "회원가입", desc: "이메일 또는 Google 계정으로 Statground 계정을 만들 수 있습니다.", home: "홈으로" },
    "en": { title: "Sign up", desc: "Create your Statground account with email or Google.", home: "Home" },
    "ja": { title: "会員登録", desc: "メールまたは Google アカウントで Statground アカウントを作成できます。", home: "ホームへ" },
    "zh-Hans": { title: "注册", desc: "可使用邮箱或 Google 帐号创建 Statground 帐号。", home: "返回首页" },
    "zh-Hant": { title: "註冊", desc: "可使用電子郵件或 Google 帳號建立 Statground 帳號。", home: "返回首頁" },
    "es": { title: "Registro", desc: "Crea tu cuenta de Statground con correo electrónico o Google.", home: "Inicio" },
    "fr": { title: "Inscription", desc: "Créez votre compte Statground avec un e-mail ou Google.", home: "Accueil" },
    "de": { title: "Registrierung", desc: "Erstellen Sie Ihr Statground-Konto per E-Mail oder Google.", home: "Startseite" },
    "pt-BR": { title: "Cadastro", desc: "Crie sua conta Statground com e-mail ou Google.", home: "Início" },
    "ru": { title: "Регистрация", desc: "Создайте аккаунт Statground по электронной почте или через Google.", home: "На главную" },
    "id": { title: "Daftar", desc: "Buat akun Statground dengan email atau Google.", home: "Beranda" },
    "vi": { title: "Đăng ký", desc: "Tạo tài khoản Statground bằng email hoặc Google.", home: "Trang chủ" },
    "th": { title: "สมัครสมาชิก", desc: "สร้างบัญชี Statground ด้วยอีเมลหรือ Google", home: "หน้าแรก" },
    "ms": { title: "Daftar", desc: "Cipta akaun Statground dengan e-mel atau Google.", home: "Laman utama" },
    "fil": { title: "Mag-sign up", desc: "Gumawa ng Statground account gamit ang email o Google.", home: "Home" },
    "hi": { title: "साइन अप", desc: "ईमेल या Google से अपना Statground खाता बनाएँ।", home: "होम" },
    "ar": { title: "إنشاء حساب", desc: "أنشئ حساب Statground باستخدام البريد الإلكتروني أو Google.", home: "الرئيسية" },
    "it": { title: "Registrazione", desc: "Crea il tuo account Statground con e-mail o Google.", home: "Home" },
    "nl": { title: "Registreren", desc: "Maak uw Statground-account met e-mail of Google.", home: "Home" },
    "pl": { title: "Rejestracja", desc: "Utwórz konto Statground przez e-mail lub Google.", home: "Strona główna" },
    "sv": { title: "Registrering", desc: "Skapa ditt Statground-konto med e-post eller Google.", home: "Startsida" },
    "tr": { title: "Kayıt", desc: "Statground hesabınızı e-posta veya Google ile oluşturun.", home: "Ana sayfa" },
    "uk": { title: "Реєстрація", desc: "Створіть обліковий запис Statground електронною поштою або через Google.", home: "На головну" }
  };

  function signupCopy() {
    const lang = currentLang();
    return signupMessages[lang] || signupMessages[lang.split("-")[0]] || signupMessages.ko;
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function postForm(url, data) {
    const body = new URLSearchParams();
    Object.keys(data || {}).forEach((key) => body.append(key, data[key]));
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "Accept": "application/json" },
      body,
      credentials: "same-origin"
    }).then((res) => res.json());
  }

  function card(title, desc, body) {
    return [
      '<div class="w-full flex justify-center">',
      '<div class="w-full max-w-xl bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-4">',
      title ? '<div class="text-lg font-bold mb-2">' + esc(title) + '</div>' : '',
      desc ? '<div class="text-sm text-gray-600 mb-4 leading-relaxed">' + esc(desc) + '</div>' : '',
      body || '',
      '</div>',
      '</div>'
    ].join("");
  }

  function googleConfig() {
    const page = ctx();
    return {
      clientId: String(page.google_client_id || "").trim(),
      nonce: String(page.google_login_nonce || "").trim(),
      endpoint: String(page.google_login_endpoint || "/account/ajax_signin_google/").trim()
    };
  }

  function ensureGoogleAPI(callback, attempt) {
    attempt = attempt || 0;
    if (window.google && window.google.accounts && window.google.accounts.id) {
      callback();
      return;
    }
    if (!document.querySelector('script[data-statground-google-gsi="1"]')) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.statgroundGoogleGsi = "1";
      document.head.appendChild(script);
    }
    if (attempt < 80) {
      window.setTimeout(function () { ensureGoogleAPI(callback, attempt + 1); }, 100);
    }
  }

  function accountMessage(checker, fallback) {
    switch (checker) {
      case "MISSING":
        return "필수 정보를 모두 입력해 주세요.";
      case "EXIST":
        return "이미 가입된 이메일입니다.";
      case "WRONGPASSWORD":
        return "비밀번호가 일치하지 않습니다.";
      case "NOTEXIST":
      case "INACTIVE":
        return "계정을 확인할 수 없습니다.";
      case "DISABLED":
        return "현재 서버에 계정 DB가 설정되어 있지 않습니다.";
      case "GOOGLE_DISABLED":
        return "현재 Google 로그인이 설정되어 있지 않습니다.";
      case "INVALID_GOOGLE_TOKEN":
      case "CSRF_FAILED":
      case "NONCE_FAILED":
        return "Google 로그인 인증을 확인하지 못했습니다. 다시 시도해 주세요.";
      case "GOOGLE_EMAIL_REQUIRED":
      case "GOOGLE_EMAIL_UNVERIFIED":
        return "Google 계정의 인증된 이메일을 확인할 수 없습니다.";
      case "DOMAIN_NOT_ALLOWED":
        return "허용된 Google Workspace 계정으로만 로그인할 수 있습니다.";
      case "LINK_REQUIRED":
        return "이 이메일은 먼저 비밀번호로 로그인한 뒤 Google 계정을 연결해 주세요.";
      case "EMAIL_CHANGE_REQUIRES_VERIFICATION":
        return "이메일 주소 변경은 별도의 이메일 인증이 필요합니다.";
      case "EXPIRED":
        return "인증 링크가 만료되었거나 이미 사용되었습니다. 새 인증 메일을 요청해 주세요.";
      case "RATE_LIMITED":
        return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
      case "GOOGLE_ALREADY_LINKED":
      case "GOOGLE_ALREADY_LINKED_OTHER":
      case "GOOGLE_EMAIL_OWNED_BY_OTHER_ACCOUNT":
        return "이미 다른 계정에 연결된 Google 계정입니다.";
      default:
        return fallback || "일시적으로 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    }
  }

  function setMessageElement(msg, text) {
    if (!msg) return;
    msg.textContent = text || "";
    msg.classList.toggle("hidden", !text);
  }

  function renderGoogleButton(targetId, flow, setMsg) {
    const target = document.getElementById(targetId);
    const config = googleConfig();
    if (!target || !config.clientId || !config.nonce) return;
    ensureGoogleAPI(function () {
      window.google.accounts.id.initialize({
        client_id: config.clientId,
        nonce: config.nonce,
        ux_mode: "popup",
        callback: function (response) {
          if (!response || !response.credential) {
            if (setMsg) setMsg("Google 로그인 인증을 확인하지 못했습니다. 다시 시도해 주세요.");
            return;
          }
          postForm(config.endpoint, {
            credential: response.credential,
            nonce: config.nonce,
            flow: flow || "login"
          }).then(function (result) {
            if (result && result.checker === "SUCCESS") {
              window.location.href = result.redirect || "/";
              return;
            }
            if (setMsg) setMsg(accountMessage(result && result.checker, result && result.msg));
          }).catch(function () {
            if (setMsg) setMsg("일시적으로 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
          });
        }
      });
      target.innerHTML = "";
      window.google.accounts.id.renderButton(target, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: flow === "signup" ? "signup_with" : "signin_with",
        shape: "pill",
        logo_alignment: "left",
        width: 320
      });
    });
  }

  function renderLogin(root) {
    root.innerHTML = card("로그인", "Statistical Ground 계정으로 로그인합니다.", [
      '<div class="space-y-4">',
      '<div id="sg-account-msg" class="hidden rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm"></div>',
      '<div class="w-full space-y-1 text-left">',
      '<label for="sg-email" class="block text-sm font-medium text-gray-900">이메일</label>',
      '<input id="sg-email" type="email" autocomplete="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2" />',
      '</div>',
      '<div class="w-full space-y-1 text-left">',
      '<label for="sg-password" class="block text-sm font-medium text-gray-900">비밀번호</label>',
      '<input id="sg-password" type="password" autocomplete="current-password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2" />',
      '</div>',
      '<button id="sg-login-submit" type="button" class="w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold px-4 py-2.5 text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60">로그인</button>',
      '<div class="flex items-center gap-3 py-1 text-xs font-semibold text-gray-400"><span class="h-px flex-1 bg-gray-200"></span><span>또는</span><span class="h-px flex-1 bg-gray-200"></span></div>',
      '<div id="sg-google-login" class="flex justify-center"></div>',
      '<div class="grid grid-cols-2 gap-2">',
      '<a class="text-sm text-blue-700 hover:underline" href="/account/signup/">회원가입</a>',
      '<a class="text-sm text-blue-700 hover:underline" href="/account/change_password/">비밀번호 재설정</a>',
      '</div>',
      '</div>'
    ].join(""));

    const email = document.getElementById("sg-email");
    const password = document.getElementById("sg-password");
    const button = document.getElementById("sg-login-submit");
    const msg = document.getElementById("sg-account-msg");

    async function submit() {
      if (!button) return;
      button.disabled = true;
      button.textContent = "확인 중...";
      setMessageElement(msg, "");
      try {
        const result = await postForm("/account/ajax_signin_email/", {
          txt_email: email ? email.value : "",
          txt_password: password ? password.value : ""
        });
        if (result && result.checker === "SUCCESS") {
          window.location.href = "/";
          return;
        }
        setMessageElement(msg, accountMessage(result && result.checker, result && result.msg));
      } catch (e) {
        setMessageElement(msg, "일시적으로 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        button.disabled = false;
        button.textContent = "로그인";
      }
    }

    [email, password].forEach((el) => {
      if (!el) return;
      el.addEventListener("keydown", (event) => {
        if (event.key === "Enter") submit();
      });
    });
    if (button) button.addEventListener("click", submit);
    renderGoogleButton("sg-google-login", "login", function (text) { setMessageElement(msg, text); });
  }

  function renderSignup() {
    const root = document.getElementById("div_main");
    if (!root) return;
    const copy = signupCopy();
    root.innerHTML = card(copy.title, copy.desc, [
      '<div class="space-y-4">',
      '<div id="sg-account-msg" class="hidden rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm"></div>',
      '<div class="w-full space-y-1 text-left">',
      '<label for="sg-signup-email" class="block text-sm font-medium text-gray-900">이메일</label>',
      '<input id="sg-signup-email" type="email" autocomplete="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2" />',
      '</div>',
      '<div class="w-full space-y-1 text-left">',
      '<label for="sg-signup-password" class="block text-sm font-medium text-gray-900">비밀번호</label>',
      '<input id="sg-signup-password" type="password" autocomplete="new-password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2" />',
      '</div>',
      '<div class="w-full space-y-1 text-left">',
      '<label for="sg-signup-name" class="block text-sm font-medium text-gray-900">이름 또는 닉네임</label>',
      '<input id="sg-signup-name" type="text" autocomplete="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2" />',
      '</div>',
      '<button id="sg-signup-submit" type="button" class="w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold px-4 py-2.5 text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60">가입하고 시작</button>',
      '<div class="flex items-center gap-3 py-1 text-xs font-semibold text-gray-400"><span class="h-px flex-1 bg-gray-200"></span><span>또는</span><span class="h-px flex-1 bg-gray-200"></span></div>',
      '<div id="sg-google-signup" class="flex justify-center"></div>',
      '<a class="inline-flex w-full justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold" href="/account/">이미 계정이 있나요?</a>',
      '</div>'
    ].join(""));

    const email = document.getElementById("sg-signup-email");
    const password = document.getElementById("sg-signup-password");
    const name = document.getElementById("sg-signup-name");
    const button = document.getElementById("sg-signup-submit");
    const msg = document.getElementById("sg-account-msg");

    async function submit() {
      if (!button) return;
      button.disabled = true;
      button.textContent = "가입 중...";
      setMessageElement(msg, "");
      try {
        const displayName = name ? name.value : "";
        const result = await postForm("/account/ajax_signup/", {
          txt_email: email ? email.value : "",
          txt_password: password ? password.value : "",
          txt_name: displayName,
          txt_realname: displayName,
          sel_gender: "응답하고 싶지 않음"
        });
        if (result && result.checker === "SUCCESS") {
          window.location.href = result.redirect || "/account/welcome/";
          return;
        }
        setMessageElement(msg, accountMessage(result && result.checker, result && result.msg));
      } catch (e) {
        setMessageElement(msg, "일시적으로 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        button.disabled = false;
        button.textContent = "가입하고 시작";
      }
    }

    [email, password, name].forEach((el) => {
      if (!el) return;
      el.addEventListener("keydown", (event) => {
        if (event.key === "Enter") submit();
      });
    });
    if (button) button.addEventListener("click", submit);
    renderGoogleButton("sg-google-signup", "signup", function (text) { setMessageElement(msg, text); });
  }

  function renderMyInfo(root) {
    root.innerHTML = card("내 정보", "TiDB 권위 저장소의 현재 계정 정보를 확인합니다.", '<div id="sg-myinfo" class="text-left text-sm bg-gray-50 border rounded-lg p-4">불러오는 중...</div>');
    const box = document.getElementById("sg-myinfo");
    fetch("/account/ajax_get_userinfo/", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((json) => {
        if (!box) return;
        if (!json || !json.uuid) {
          box.innerHTML = '<p class="text-red-700">로그인이 필요하거나 계정 정보를 불러오지 못했습니다.</p><a class="mt-3 inline-flex text-blue-700 hover:underline" href="/account/">로그인</a>';
          return;
        }
        const rows = [
          ["이메일", json.email],
          ["닉네임", json.nickname || json.name],
          ["실명", json.realname],
          ["성별", json.gender],
          ["회원 역할", json.role],
          ["이메일 수신", json.email_subscription ? "수신" : "수신 안 함"],
          ["가입일", json.date_joined ? new Date(json.date_joined).toLocaleString() : "-"]
        ];
        box.innerHTML = rows.map(function (row) {
          return '<div class="grid grid-cols-[7rem_1fr] gap-3 border-b border-gray-200 py-2 last:border-0"><strong>' + esc(row[0]) + '</strong><span class="break-all">' + esc(row[1] || "-") + '</span></div>';
        }).join("") + '<a class="mt-4 inline-flex w-full justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800" href="/account/userinfo/">내 정보 수정</a>';
      })
      .catch(() => {
        if (box) box.textContent = "일시적으로 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
      });
  }

  function renderUserInfo(root) {
    root.innerHTML = card("내 정보 수정", "로그인한 계정의 닉네임, 실명, 성별과 이메일 수신 여부를 수정합니다.", [
      '<div id="sg-account-msg" class="hidden rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm mb-4"></div>',
      '<div id="sg-userinfo-loading" class="text-sm text-gray-600">불러오는 중...</div>',
      '<form id="sg-userinfo-form" class="hidden space-y-4 text-left">',
      '<div><label class="block text-sm font-medium mb-1" for="sg-userinfo-email">이메일</label><input id="sg-userinfo-email" type="email" readonly class="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600" /><p class="mt-1 text-xs text-gray-500">이메일 주소 변경에는 별도 인증이 필요합니다.</p></div>',
      '<div><label class="block text-sm font-medium mb-1" for="sg-userinfo-nickname">닉네임</label><input id="sg-userinfo-nickname" type="text" minlength="2" maxlength="120" class="w-full rounded-lg border border-gray-300 px-3 py-2" required /></div>',
      '<div><label class="block text-sm font-medium mb-1" for="sg-userinfo-realname">실명</label><input id="sg-userinfo-realname" type="text" minlength="2" maxlength="120" class="w-full rounded-lg border border-gray-300 px-3 py-2" required /></div>',
      '<div><label class="block text-sm font-medium mb-1" for="sg-userinfo-gender">성별</label><select id="sg-userinfo-gender" class="w-full rounded-lg border border-gray-300 px-3 py-2"><option value="응답하고 싶지 않음">응답하고 싶지 않음</option><option value="Male">남성</option><option value="Female">여성</option><option value="기타">기타</option></select></div>',
      '<label class="flex items-center gap-2 text-sm"><input id="sg-userinfo-subscription" type="checkbox" class="h-4 w-4" /> Statground 소식 이메일 수신</label>',
      '<button id="sg-userinfo-submit" type="submit" class="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">저장</button>',
      '</form>'
    ].join(""));

    const form = document.getElementById("sg-userinfo-form");
    const loading = document.getElementById("sg-userinfo-loading");
    const msg = document.getElementById("sg-account-msg");
    const email = document.getElementById("sg-userinfo-email");
    const nickname = document.getElementById("sg-userinfo-nickname");
    const realname = document.getElementById("sg-userinfo-realname");
    const gender = document.getElementById("sg-userinfo-gender");
    const subscription = document.getElementById("sg-userinfo-subscription");
    const submit = document.getElementById("sg-userinfo-submit");

    fetch("/account/ajax_get_userinfo/", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((json) => {
        if (!json || !json.uuid) {
          window.location.href = "/account/?msg=login_required";
          return;
        }
        email.value = json.email || "";
        nickname.value = json.nickname || json.name || "";
        realname.value = json.realname || "";
        gender.value = json.gender || "응답하고 싶지 않음";
        subscription.checked = Boolean(json.email_subscription);
        loading.classList.add("hidden");
        form.classList.remove("hidden");
      })
      .catch(() => setMessageElement(msg, "계정 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."));

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      submit.disabled = true;
      setMessageElement(msg, "");
      try {
        const result = await postForm("/account/ajax_update_userinfo/", {
          txt_email: email.value,
          txt_name: nickname.value,
          txt_realname: realname.value,
          rad_gender: gender.value,
          rad_email_subscription: subscription.checked ? "1" : "0"
        });
        if (result && result.checker === "SUCCESS") {
          window.location.href = "/account/myinfo/";
          return;
        }
        setMessageElement(msg, accountMessage(result && result.checker, (result && (result.msg || result.error))));
      } catch (e) {
        setMessageElement(msg, "일시적으로 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        submit.disabled = false;
      }
    });
  }

  function renderPasswordResetRequest(root) {
    root.innerHTML = card("비밀번호 재설정", "가입한 이메일로 1시간 동안 유효한 인증 링크를 보냅니다.", [
      '<div class="space-y-4 text-left">',
      '<div id="sg-account-msg" class="hidden rounded-lg border border-blue-200 bg-blue-50 text-blue-900 px-4 py-3 text-sm"></div>',
      '<label class="block text-sm font-medium" for="sg-reset-email">이메일</label>',
      '<input id="sg-reset-email" type="email" autocomplete="email" class="w-full rounded-lg border border-gray-300 px-3 py-2" required />',
      '<button id="sg-reset-submit" type="button" class="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">인증 메일 보내기</button>',
      '</div>'
    ].join(""));
    const email = document.getElementById("sg-reset-email");
    const submit = document.getElementById("sg-reset-submit");
    const msg = document.getElementById("sg-account-msg");
    async function send() {
      if (!email.value.trim()) {
        setMessageElement(msg, "이메일을 입력해 주세요.");
        return;
      }
      submit.disabled = true;
      setMessageElement(msg, "");
      try {
        const result = await postForm("/account/ajax_send_auth_email/", { email: email.value });
        if (result && result.exist === "EXIST") {
          setMessageElement(msg, "인증 메일을 보냈습니다. 받은편지함과 스팸함을 확인해 주세요.");
          return;
        }
        if (result && result.error) {
          setMessageElement(msg, result.error);
          return;
        }
        setMessageElement(msg, "입력한 이메일과 일치하는 활성 계정이 있으면 인증 메일을 보냅니다.");
      } catch (e) {
        setMessageElement(msg, "일시적으로 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        submit.disabled = false;
      }
    }
    submit.addEventListener("click", send);
    email.addEventListener("keydown", function (event) { if (event.key === "Enter") send(); });
  }

  function renderPasswordResetAuth(root) {
    const authCode = String(ctx().msg || "").trim();
    if (window.STATGROUND_PAGE_CONTEXT) window.STATGROUND_PAGE_CONTEXT.msg = "";
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, "/account/change_password/auth/");
    }
    root.innerHTML = card("새 비밀번호 설정", "인증 링크를 확인하고 새 비밀번호를 저장합니다.", [
      '<div id="sg-account-msg" class="rounded-lg border border-gray-200 bg-gray-50 text-gray-700 px-4 py-3 text-sm mb-4">인증 링크를 확인하는 중...</div>',
      '<form id="sg-reset-password-form" class="hidden space-y-4 text-left">',
      '<div><label class="block text-sm font-medium mb-1" for="sg-new-password">새 비밀번호</label><input id="sg-new-password" type="password" minlength="8" maxlength="1024" autocomplete="new-password" class="w-full rounded-lg border border-gray-300 px-3 py-2" required /></div>',
      '<div><label class="block text-sm font-medium mb-1" for="sg-new-password-confirm">새 비밀번호 확인</label><input id="sg-new-password-confirm" type="password" minlength="8" maxlength="1024" autocomplete="new-password" class="w-full rounded-lg border border-gray-300 px-3 py-2" required /></div>',
      '<button id="sg-reset-password-submit" type="submit" class="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">비밀번호 변경</button>',
      '</form>',
      '<a id="sg-reset-retry" class="hidden mt-4 text-sm text-blue-700 hover:underline" href="/account/change_password/">새 인증 메일 요청</a>'
    ].join(""));
    const msg = document.getElementById("sg-account-msg");
    const form = document.getElementById("sg-reset-password-form");
    const retry = document.getElementById("sg-reset-retry");
    const password = document.getElementById("sg-new-password");
    const confirm = document.getElementById("sg-new-password-confirm");
    const submit = document.getElementById("sg-reset-password-submit");

    if (!authCode) {
      setMessageElement(msg, accountMessage("EXPIRED"));
      retry.classList.remove("hidden");
      return;
    }
    postForm("/account/ajax_check_auth_code/", { auth_code: authCode })
      .then(function (result) {
        if (result && result.checker === "SUCCESS") {
          setMessageElement(msg, "인증되었습니다. 새 비밀번호를 입력해 주세요.");
          form.classList.remove("hidden");
          return;
        }
        setMessageElement(msg, accountMessage("EXPIRED"));
        retry.classList.remove("hidden");
      })
      .catch(function () {
        setMessageElement(msg, "인증 링크를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        retry.classList.remove("hidden");
      });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (password.value !== confirm.value) {
        setMessageElement(msg, "새 비밀번호가 서로 일치하지 않습니다.");
        return;
      }
      if (password.value.length < 8) {
        setMessageElement(msg, "비밀번호는 8자 이상이어야 합니다.");
        return;
      }
      submit.disabled = true;
      try {
        const result = await postForm("/account/ajax_password_change/", { auth_code: authCode, password: password.value });
        if (result && result.checker === "SUCCESS") {
          window.location.href = "/account/?msg=password_changed";
          return;
        }
        setMessageElement(msg, accountMessage(result && result.checker, result && result.error));
        if (result && result.checker === "EXPIRED") retry.classList.remove("hidden");
      } catch (e) {
        setMessageElement(msg, "비밀번호를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        submit.disabled = false;
      }
    });
  }

  function renderPlaceholder(root, title, desc, linkText) {
    root.innerHTML = card(title, desc, '<a class="inline-flex w-full justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold" href="/">' + esc(linkText || "홈으로") + '</a>');
  }

  function setMain() {
    const root = document.getElementById("div_main");
    if (!root) return;
    const page = ctx();
    if (page.url === "signup") return renderSignup();
    if (page.url === "change_password" && page.mode === "auth") return renderPasswordResetAuth(root);
    if (page.url === "change_password") return renderPasswordResetRequest(root);
    if (page.url === "welcome") return renderPlaceholder(root, "환영합니다", "회원가입이 완료되었습니다.", "홈으로");
    if (page.url === "userinfo") return renderUserInfo(root);
    if (page.url === "myinfo") return renderMyInfo(root);
    renderLogin(root);
  }

  window.addEventListener("sg_lang_changed", function () {
    if (ctx().url === "signup") renderSignup();
  });
  window.set_main = setMain;
})();
