async function check_visitors_statistics_visitors() {
	function Div_statistics(props){
		return(
			<div class="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800 text-center">
				<p>{props.title}</p>
				<dl class="grid max-w-screen-xl sm:grid-cols-1 lg:grid-cols-4 gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.avg_total}건</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">방문자 수/일</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.avg_current_year}명</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">올해 방문자 수/일</dd>
						<dd class="font-light text-gray-500 dark:text-gray-400">(작년: {props.data.avg_last_year}명)</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.avg_current_month}명</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">이번 달 방문자 수/일</dd>
						<dd class="font-light text-gray-500 dark:text-gray-400">(지난 달: {props.data.avg_last_month}명)</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.avg_today}명</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">오늘 방문자 수</dd>
						<dd class="font-light text-gray-500 dark:text-gray-400">(어제: {props.data.avg_yesterday}명)</dd>
					</div>
				</dl>
			</div>
		)
	}

	const data = await fetch("/operation/ajax_visitors_statistics_visitors")
					.then(res=> { return res.json(); })
					.then(res=> { return res; });

	ReactDOM.render(<Div_statistics title="방문자 수" data={data} />, document.getElementById("div_statistics_vistors"))
}

check_visitors_statistics_visitors()