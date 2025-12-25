// ===== Header (AJAX + Render) =====
async function get_menu_header() {
	// Small safe-guard to ensure container exists
	const mount = document.getElementById("div_menu_sub_header");
	if (!mount) return;

	const raw = await fetch("/ajax_get_menu_header/")
	  .then((res) => res.json())
	  .catch(() => ({}));

	const data = {
	  nickname: raw.nickname || raw.name || raw.username || raw.displayName || window.gv_username || "",
	  role: raw.role || raw.user_role || raw.user_role_name || raw.group || window.gv_role || "",
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

	  const isLoggedIn = (window.gv_username || "") !== "";

	  const nameToShow = (props.data && (props.data.name || props.data.nickname || props.data.username)) || window.gv_username || "";
	  const roleToShow = (props.data && (props.data.role || props.data.user_role)) || window.gv_role || "";

	  return (
		<div onClick={() => click_dropdown()} id="div_menu_sub_header"
			class="flex justify-center items-center w-full h-[35px]">
		  {!isLoggedIn ? (
			<div class="flex flex-row justify-end items-center text-end text-sm space-x-4 w-full h-full px-[35px]">
			  <Div_sub url={"/account/"} name={"로그인"} />
			  <span>|</span>
			  <Div_sub url={"/account/signup/"} name={"회원 가입"} />
			</div>
		  ) : (
			<div class="flex flex-row justify-end items-center text-end text-sm space-x-4 w-full h-full px-[35px]">
			  <Div_sub
				url={"/account/myinfo/"}
				name={nameToShow}
				url_image={
				  "https://cdn.jsdelivr.net/gh/statground/statkiss_CDN/images/svg/header_user.svg"
				}
			  />
			  <span>|</span>

			  <a
				href="/intro/membership/"
				class="flex flex-row justify-center items-center font-extrabold hover:underline"
			  >
				{roleToShow}
				{roleToShow == "준회원" && (
				  <div class="ml-2 animate-pulse">
					<span class="font-extrabold text-red-500">(정회원 가입하기)</span>
				  </div>
				)}
			  </a>
			  <span>|</span>

			  {roleToShow == "관리자" && <Div_sub url={"/admin/"} name={"Admin Page"} />}
			  {roleToShow == "관리자" && <span>|</span>}

			  <Div_sub url={"/account/logout/"} name={"로그아웃"} />
			</div>
		  )}
		</div>
	  );
	}

	ReactDOM.render(<Div_sub_menu_header data={data} />, mount);
}