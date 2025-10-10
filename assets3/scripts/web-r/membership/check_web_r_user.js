async function check_web_r_user() {
	let input_email = document.getElementById("email")

	let button_default = document.getElementById("btn_default")
	let button_loading = document.getElementById("btn_loading")
	let button_next = document.getElementById("btn_next")

	let result_msg_success = document.getElementById("result_msg_success")
	let result_msg_failed = document.getElementById("result_msg_failed")

	function Div_result_msg_success_extra_info(props) {
		if (props.group_name == '관리그룹') {
			return (
				<div>
					<div class="text-red-500">관리그룹은 결제일이 만료되지 않습니다.</div>
					<div class="text-sm font-light text-gray-500 dark:text-gray-400">
						최초 결제일: {props.created_at}<br/>
						마지막 결제일: {props.updated_at}
					</div>
				</div>
			)
		}
		else if (props.group_name != '준회원') {
			return (
				<div>
					<div class="text-red-500">{props.group_name} 만료일: {props.expired_at}</div>
					<div class="text-sm font-light text-gray-500 dark:text-gray-400">
						최초 결제일: {props.created_at}<br/>
						마지막 결제일: {props.updated_at}
					</div>
				</div>
			)
		} else { return ( "" ) }
	}

	function Div_result_msg_success(props) {
		return (
			<div class="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">계정이 확인되었습니다.</h3>
				<p class="my-4">
					이름: {props.data.user_name}<br/>
					닉네임: {props.data.nick_name}<br/>
					가입 일자: {props.data.regdate}<br/>
					<b>회원 등급: {props.data.group_name}</b>
				</p>
				<Div_result_msg_success_extra_info 
					group_name={props.data.group_name}
					created_at={props.data.created_at}
					updated_at={props.data.updated_at}
					expired_at={props.data.expired_at}
				 />
			</div>
		)
	}

	
	button_default.className = "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 hidden"
	button_loading.className = "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"

	const data = await fetch("/membership/ajax_check_web_r_account/?email=" + input_email.value)
				.then(res=> { return res.json(); })
				.then(res=> { return res; });


	// 검색 실패
	if (data.user_name == null || data.user_name == "wrong_email") {
		button_default.className = "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
		button_loading.className = "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 hidden"

		input_email.className = "rounded-none rounded-r-lg bg-red-50 border border-red-300 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block flex-1 min-w-0 w-full p-2.5 dark:bg-red-100 dark:border-red-400";
		result_msg_success.className = "flex flex-col items-center justify-center p-8 text-center bg-white border border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-tl-lg md:border-r dark:bg-gray-800 dark:border-gray-700 hidden"
		result_msg_failed.className = "mt-2 text-sm text-red-600 dark:text-red-500"

	// 검색 성공
	} else {
		button_next.className = "text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
		button_loading.className = "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 hidden"

		input_email.className = "rounded-none rounded-r-lg bg-green-50 border border-green-300 text-green-900 placeholder-green-700 rounded-lg focus:ring-green-500 focus:border-green-500 block flex-1 min-w-0 w-full text-sm p-2.5 dark:bg-green-100 dark:border-green-400";
		result_msg_success.className = "flex flex-col items-center justify-center p-8 text-center bg-white border border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-tl-lg md:border-r dark:bg-gray-800 dark:border-gray-700"
		button_next.href = '/membership/application?email=' + input_email.value
		result_msg_failed.className = "mt-2 text-sm text-red-600 dark:text-red-500 hidden"

		ReactDOM.render(<Div_result_msg_success data={data} />, document.getElementById("result_msg_success"))
	}
}