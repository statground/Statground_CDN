async function get_menu_header() {
	const mount = document.getElementById("div_menu_sub_header");
	if (!mount) return;

	const raw = await fetch("/account/ajax_get_myinfo/")
	  .then((res) => res.json())
	  .catch(() => ({}));

	// Normalize: 다양한 필드명(name, nickname, username 등)을 nickname으로, 다양한 role 필드도 role로 통일
	const data = {
	  // AJAX 응답의 nickname, role만 사용 (폴백: 빈 문자열)
	  nickname: raw.nickname || "",
	  role: raw.role || "",
	  // 원본 전체도 필요하면 포함
	  _raw: raw,
	};

	window.gv_role = data.role || "";
	console.log("*** role:", window.gv_role, "raw:", raw);

	function Div_sub_menu_header(props) {
	  function Div_sub(props) {
		return (
		  <a href={props.url} class="flex flex-row justify-center items-center hover:underline">
			{props.url_image != null && (
			  <img src={props.url_image} class="size-4 mr-2" />
			)}
			{props.name}
		  </a>
		);
	  }

	  // 로그인 판정: 템플릿 주입값 또는 AJAX로 받아온 데이터 존재 여부로 판단
	  const isLoggedIn =
		((window.gv_username || "") !== "") ||
		(!!(props.data && props.data.nickname));

	  // 안전한 표시값: AJAX 데이터만 사용 (없으면 "사용자")
	  const nameToShow = (props.data && props.data.nickname) || "사용자";
	  const roleToShow = (props.data && props.data.role) || "";

	  return (
		<div onClick={() => click_dropdown()} id="div_menu_sub_header"
			class="flex justify-center items-center w-full h-[35px]">
		  {!isLoggedIn ? (
			<div class="flex flex-row justify-end items-center text-end text-sm space-x-4 w-full h-full px-[35px]">
			  <Div_sub url={"/account/"} name={"Sign In"} />
			  <span>|</span>
			  <Div_sub url={"/account/signup/"} name={"Sign Up"} />
			</div>
		  ) : (
			<div class="flex flex-row justify-end items-center text-end text-sm space-x-2 w-full h-full px-[35px]">
			  <Div_sub
				url={"/account/myinfo/"}
				name={nameToShow}
				url_image={"https://cdn.jsdelivr.net/gh/statground/statkiss_CDN/images/svg/header_user.svg"}
			  />
			  <span class="px-2">|</span>

			  <a
				href="/intro/membership/"
				class="flex flex-row justify-center items-center font-extrabold hover:underline"
			  >
				{roleToShow}
			  </a>
			  <span class="px-2">|</span>

			  {roleToShow === "Administrator" && (
				<>
				  <Div_sub url={"/admin/"} name={"Admin Page"} />
				  <span class="px-2">|</span>
				</>
			  )}

			  <Div_sub url={"/account/logout/"} name={"Sign Out"} />
			</div>
		  )}
		</div>
	  );
	}

	ReactDOM.render(<Div_sub_menu_header data={data} />, mount);
}
