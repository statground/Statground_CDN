async function check_payments_statistics_amount() {
	function Div_statistics(props){
		return(
			<div class="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800 text-center">
				<p>{props.title}</p>
				<dl class="grid max-w-screen-xl sm:grid-cols-1 lg:grid-cols-4 gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-2xl font-extrabold">{props.data.amount_total}원 / {props.data.cnt_total}건</dt>
						<dd class="font-light text-gray-500">총 결제액</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-2xl font-extrabold">{props.data.amount_current_year}원 / {props.data.cnt_current_year}건</dt>
						<dd class="font-light text-gray-500">올해 결제액</dd>
						<dd class="font-light text-gray-500">(작년: {props.data.amount_last_year}원 / {props.data.cnt_last_year}건)</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-2xl font-extrabold">{props.data.amount_current_month}원 / {props.data.cnt_current_month}건</dt>
						<dd class="font-light text-gray-500">이번 달 결제액</dd>
						<dd class="font-light text-gray-500">(지난 달: {props.data.amount_last_month}원 / {props.data.cnt_last_month}건)</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-2xl font-extrabold">{props.data.amount_today}원 / {props.data.cnt_today}건</dt>
						<dd class="font-light text-gray-500">오늘 결제액</dd>
						<dd class="font-light text-gray-500">(어제: {props.data.amount_yesterday}원 / {props.data.cnt_yesterday}건)</dd>
					</div>
				</dl>
			</div>
		)
	}

	const data = await fetch("/operation/ajax_payments_statistics_amount")
					.then(res=> { return res.json(); })
					.then(res=> { return res; });

	ReactDOM.render(<Div_statistics title="결제액" data={data} />, document.getElementById("div_statistics_amount"))
}

check_payments_statistics_amount()