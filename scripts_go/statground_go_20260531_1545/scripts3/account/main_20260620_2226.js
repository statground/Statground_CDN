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
    "ko": { title: "회원가입", desc: "현재는 신규 회원가입을 받고 있지 않습니다.", home: "홈으로" },
    "en": { title: "Sign up", desc: "New signups are not available at the moment.", home: "Home" },
    "ja": { title: "会員登録", desc: "現在、新規会員登録は受け付けていません。", home: "ホームへ" },
    "zh-Hans": { title: "注册", desc: "目前暂不开放新用户注册。", home: "返回首页" },
    "zh-Hant": { title: "註冊", desc: "目前暫不開放新會員註冊。", home: "返回首頁" },
    "es": { title: "Registro", desc: "Actualmente no estamos aceptando nuevos registros.", home: "Inicio" },
    "fr": { title: "Inscription", desc: "Les nouvelles inscriptions ne sont pas ouvertes pour le moment.", home: "Accueil" },
    "de": { title: "Registrierung", desc: "Neue Registrierungen sind derzeit nicht möglich.", home: "Startseite" },
    "pt-BR": { title: "Cadastro", desc: "No momento, novos cadastros não estão disponíveis.", home: "Início" },
    "ru": { title: "Регистрация", desc: "Сейчас регистрация новых пользователей закрыта.", home: "На главную" },
    "id": { title: "Daftar", desc: "Saat ini pendaftaran anggota baru belum dibuka.", home: "Beranda" },
    "vi": { title: "Đăng ký", desc: "Hiện tại chưa nhận đăng ký thành viên mới.", home: "Trang chủ" },
    "th": { title: "สมัครสมาชิก", desc: "ขณะนี้ยังไม่เปิดรับสมัครสมาชิกใหม่", home: "หน้าแรก" },
    "ms": { title: "Daftar", desc: "Pendaftaran ahli baharu belum dibuka buat masa ini.", home: "Laman utama" },
    "fil": { title: "Mag-sign up", desc: "Hindi muna tumatanggap ng bagong pagpaparehistro sa ngayon.", home: "Home" },
    "hi": { title: "साइन अप", desc: "अभी नए सदस्य पंजीकरण स्वीकार नहीं किए जा रहे हैं।", home: "होम" },
    "ar": { title: "إنشاء حساب", desc: "لا نستقبل تسجيلات جديدة في الوقت الحالي.", home: "الرئيسية" },
    "it": { title: "Registrazione", desc: "Al momento non accettiamo nuove registrazioni.", home: "Home" },
    "nl": { title: "Registreren", desc: "Nieuwe registraties zijn momenteel niet beschikbaar.", home: "Home" },
    "pl": { title: "Rejestracja", desc: "Obecnie nie przyjmujemy nowych rejestracji.", home: "Strona główna" },
    "sv": { title: "Registrering", desc: "Nya registreringar är inte öppna just nu.", home: "Startsida" },
    "tr": { title: "Kayıt", desc: "Şu anda yeni üyelik başvuruları alınmamaktadır.", home: "Ana sayfa" },
    "uk": { title: "Реєстрація", desc: "Наразі реєстрація нових користувачів закрита.", home: "На головну" }
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
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
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

  function renderSignup() {
    const root = document.getElementById("div_main");
    if (!root) return;
    const copy = signupCopy();
    renderPlaceholder(root, copy.title, copy.desc, copy.home);
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
