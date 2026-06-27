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
    "ko": { title: "회원가입", desc: "Google 계정으로 Statground 계정을 만들 수 있습니다.", home: "홈으로" },
    "en": { title: "Sign up", desc: "Create your Statground account with Google.", home: "Home" },
    "ja": { title: "会員登録", desc: "Google アカウントで Statground アカウントを作成できます。", home: "ホームへ" },
    "zh-Hans": { title: "注册", desc: "可使用 Google 帐号创建 Statground 帐号。", home: "返回首页" },
    "zh-Hant": { title: "註冊", desc: "可使用 Google 帳號建立 Statground 帳號。", home: "返回首頁" },
    "es": { title: "Registro", desc: "Crea tu cuenta de Statground con Google.", home: "Inicio" },
    "fr": { title: "Inscription", desc: "Créez votre compte Statground avec Google.", home: "Accueil" },
    "de": { title: "Registrierung", desc: "Erstellen Sie Ihr Statground-Konto mit Google.", home: "Startseite" },
    "pt-BR": { title: "Cadastro", desc: "Crie sua conta Statground com o Google.", home: "Início" },
    "ru": { title: "Регистрация", desc: "Создайте аккаунт Statground через Google.", home: "На главную" },
    "id": { title: "Daftar", desc: "Buat akun Statground dengan Google.", home: "Beranda" },
    "vi": { title: "Đăng ký", desc: "Tạo tài khoản Statground bằng Google.", home: "Trang chủ" },
    "th": { title: "สมัครสมาชิก", desc: "สร้างบัญชี Statground ด้วย Google", home: "หน้าแรก" },
    "ms": { title: "Daftar", desc: "Cipta akaun Statground dengan Google.", home: "Laman utama" },
    "fil": { title: "Mag-sign up", desc: "Gumawa ng Statground account gamit ang Google.", home: "Home" },
    "hi": { title: "साइन अप", desc: "Google से अपना Statground खाता बनाएँ।", home: "होम" },
    "ar": { title: "إنشاء حساب", desc: "أنشئ حساب Statground باستخدام Google.", home: "الرئيسية" },
    "it": { title: "Registrazione", desc: "Crea il tuo account Statground con Google.", home: "Home" },
    "nl": { title: "Registreren", desc: "Maak uw Statground-account met Google.", home: "Home" },
    "pl": { title: "Rejestracja", desc: "Utwórz konto Statground przez Google.", home: "Strona główna" },
    "sv": { title: "Registrering", desc: "Skapa ditt Statground-konto med Google.", home: "Startsida" },
    "tr": { title: "Kayıt", desc: "Google ile Statground hesabınızı oluşturun.", home: "Ana sayfa" },
    "uk": { title: "Реєстрація", desc: "Створіть обліковий запис Statground через Google.", home: "На головну" }
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

  function googleMessage(checker, fallback) {
    switch (checker) {
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
      case "GOOGLE_ALREADY_LINKED":
      case "GOOGLE_ALREADY_LINKED_OTHER":
        return "이미 다른 계정에 연결된 Google 계정입니다.";
      default:
        return fallback || "일시적으로 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    }
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
            if (setMsg) setMsg(googleMessage(result && result.checker, result && result.msg));
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
      '<button id="sg-login-submit" type="button" class="w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold px-4 py-2.5 text-white bg-blue-700 hover:bg-blue-800">로그인</button>',
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

    function setMsg(text) {
      if (!msg) return;
      msg.textContent = text || "";
      msg.classList.toggle("hidden", !text);
    }

    async function submit() {
      if (!button) return;
      button.disabled = true;
      button.textContent = "확인 중...";
      setMsg("");
      try {
        const result = await postForm("/account/ajax_signin_email/", {
          txt_email: email ? email.value : "",
          txt_password: password ? password.value : ""
        });
        if (result && result.checker === "SUCCESS") {
          window.location.href = "/";
          return;
        }
        setMsg(result && result.checker === "WRONGPASSWORD" ? "비밀번호가 일치하지 않습니다." : "계정을 확인할 수 없습니다.");
      } catch (e) {
        setMsg("일시적으로 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
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
    renderGoogleButton("sg-google-login", "login", setMsg);
  }

  function renderSignup() {
    const root = document.getElementById("div_main");
    if (!root) return;
    const copy = signupCopy();
    root.innerHTML = card(copy.title, copy.desc, [
      '<div class="space-y-4">',
      '<div id="sg-account-msg" class="hidden rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm"></div>',
      '<div id="sg-google-signup" class="flex justify-center"></div>',
      '<a class="inline-flex w-full justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold" href="/account/">이미 계정이 있나요?</a>',
      '</div>'
    ].join(""));
    const msg = document.getElementById("sg-account-msg");
    function setMsg(text) {
      if (!msg) return;
      msg.textContent = text || "";
      msg.classList.toggle("hidden", !text);
    }
    renderGoogleButton("sg-google-signup", "signup", setMsg);
  }

  function renderMyInfo(root) {
    root.innerHTML = card("내 정보", "계정 정보를 확인합니다.", '<div id="sg-myinfo" class="text-left whitespace-pre-wrap text-xs bg-gray-50 border rounded-lg p-4">불러오는 중...</div>');
    const box = document.getElementById("sg-myinfo");
    fetch("/account/ajax_get_userinfo/", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((json) => {
        if (box) box.textContent = JSON.stringify(json || {}, null, 2);
      })
      .catch(() => {
        if (box) box.textContent = "일시적으로 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
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
    if (page.url === "change_password") return renderPlaceholder(root, "비밀번호 재설정", "인증 메일 발송 API 연결이 필요한 화면입니다.", "홈으로");
    if (page.url === "welcome") return renderPlaceholder(root, "환영합니다", "회원가입이 완료되었습니다.", "홈으로");
    if (page.url === "myinfo" || page.url === "userinfo") return renderMyInfo(root);
    renderLogin(root);
  }

  window.addEventListener("sg_lang_changed", function () {
    if (ctx().url === "signup") renderSignup();
  });
  window.set_main = setMain;
})();
