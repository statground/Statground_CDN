async function result_order_id(paymentKey, orderID) {
	let button_waiting = document.getElementById("button_waiting")
	let button_init = document.getElementById("button_init")
	let button_webr = document.getElementById("button_webr")

	function Div_result_success(props) {
		return (
			<figure class="flex flex-col items-center justify-center p-4 text-center bg-white border border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-tl-lg md:border-r dark:bg-gray-800 dark:border-gray-700">
				<div class="flex flex-col items-center justify-center p-4 text-center bg-white border border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-tl-lg md:border-r dark:bg-gray-800 dark:border-gray-700">
					<div class="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white">결제가 완료되었습니다.</h3>
						<p class="my-4">
							Web-R 계정(E-mail): {props.data.email}<br/>
							이름: {props.data.username}<br/><br/>

							주문번호: {props.data.order_id}<br/>
							{props.data.log.result.orderName}<br/><br/>

							회원 등급 만료일: {props.data.web_r_product.expired_at}<br/>
						</p>
						<div>
							<div class="text-red-500">Web-R 홈페이지 로그아웃 후 다시 로그인해 주세요.</div>
						</div>
					</div>
				</div>
			</figure>
		)
	}

	function Div_result_waiting_for_deposit(props) {
		return (
			<figure class="flex flex-col items-center justify-center p-4 text-center bg-white border border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-tl-lg md:border-r dark:bg-gray-800 dark:border-gray-700">
				<div class="flex flex-col items-center justify-center p-4 text-center bg-white border border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-tl-lg md:border-r dark:bg-gray-800 dark:border-gray-700">
					<div class="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white">입금 대기. 결제를 완료하면, 업그레이드가 완료됩니다.</h3>
						<p class="my-4">
							Web-R 계정(E-mail): {props.data.email}<br/>
							이름: {props.data.username}<br/><br/>

							주문번호: {props.data.order_id}<br/>
							{props.data.log.result.orderName}<br/><br/>

							은행:: {props.data.log.result.virtualAccount.bank}<br/>
							계좌번호: {props.data.log.result.virtualAccount.accountNumber}<br/>
							금액: {props.data.log.result.virtualAccount.balanceAmount}원<br/>
							만료 시각: {props.data.log.result.virtualAccount.dueDate.replace('T', ' ')}<br/>
						</p>
						<div>
							<div class="text-red-500">결제가 완료되면 Web-R 홈페이지 로그아웃 후 다시 로그인해 주세요.</div>
						</div>
					</div>
				</div>
			</figure>
		)
	}

	function Div_result_failed(props) {
		return (
			<figure class="flex flex-col items-center justify-center p-4 text-center bg-white border border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-tl-lg md:border-r dark:bg-gray-800 dark:border-gray-700">
				<div class="flex flex-col items-center justify-center p-4 text-center bg-white border border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-tl-lg md:border-r dark:bg-gray-800 dark:border-gray-700">
					<div class="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white">결제를 실패하였습니다.</h3>
						<p class="my-4">
							Web-R 계정(E-mail): {props.data.email}<br/>
							이름: {props.data.username}<br/><br/>
						</p>
						<div>
							<div class="text-red-500">{props.data.log.result.message}</div>
						</div>
					</div>
				</div>
			</figure>
		)
	}


	const data = await fetch("/ajax_finish_order_id/?paymentKey=" + paymentKey + "&orderID=" + orderID)
					  .then(res=> { return res.json(); })
					  .then(res=> { return res; });


	// 결제 실패
	if ("result" in data.log && "message" in data.log.result){
		ReactDOM.render(<Div_result_failed data={data} />, document.getElementById("div_result_text"))

	// 가상 계좌 - 결제 대기
	} else if (data.status == "WAITING_FOR_DEPOSIT") {
		ReactDOM.render(<Div_result_waiting_for_deposit data={data} />, document.getElementById("div_result_text"))

	// 결제 완료
	} else {
		ReactDOM.render(<Div_result_success data={data} />, document.getElementById("div_result_text"))

	}

	button_waiting.className = "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 inline-flex items-center hidden"
	button_init.className = "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
	button_webr.className = "text-gray-900 bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
}