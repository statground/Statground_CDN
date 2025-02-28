async function check_visitors_statistics_pageview() {
	function Div_statistics(props){
		return(
			<div class="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800 text-center">
				<p>{props.title}</p>
				<dl class="grid max-w-screen-xl sm:grid-cols-1 lg:grid-cols-4 gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.sum_total}건</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">총 페이지 뷰</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.sum_current_year}건</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">올해 페이지 뷰</dd>
						<dd class="font-light text-gray-500 dark:text-gray-400">(작년: {props.data.sum_last_year}건)</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.sum_current_month}건</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">이번 달 페이지 뷰</dd>
						<dd class="font-light text-gray-500 dark:text-gray-400">(지난 달: {props.data.sum_last_month}건)</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.sum_today}건</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">오늘 페이지 뷰</dd>
						<dd class="font-light text-gray-500 dark:text-gray-400">(어제: {props.data.sum_yesterday}건)</dd>
					</div>
				</dl>
			</div>
		)
	}

	const data = await fetch("/operation/ajax_visitors_statistics_pageview")
					.then(res=> { return res.json(); })
					.then(res=> { return res; });

	ReactDOM.render(<Div_statistics title="페이지 뷰" data={data} />, document.getElementById("div_statistics_pageview"))
}

check_visitors_statistics_pageview()