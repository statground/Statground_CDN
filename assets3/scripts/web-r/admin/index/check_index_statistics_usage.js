async function check_index_statistics_usage() {
	function Div_statistics(props){
		return(
			<div class="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800 text-center">
				<h5 class="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white">
					<span class="text-blue-600 dark:text-blue-500">{props.title}</span>
				</h5>
				<dl class="grid max-w-screen-xl grid-cols-2 gap-8 p-4 mx-auto text-gray-900 sm:grid-cols-2 xl:grid-cols-3 dark:text-white sm:p-8">
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.avg_pageview}건</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">일 평균 페이지 뷰</dd>
						<dd class="font-light text-gray-500 dark:text-gray-400">(지난 달: {props.data.avg_pageview_lm}건)</dd>
					</div>
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.avg_visitor}명</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">일 평균 접속자 수</dd>
						<dd class="font-light text-gray-500 dark:text-gray-400">(지난 달: {props.data.avg_visitor_lm}명)</dd>
					</div>
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.join_member}명</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">이번 달 가입자 수</dd>
						<dd class="font-light text-gray-500 dark:text-gray-400">(지난 달: {props.data.join_member_lm}명)</dd>
					</div>
				</dl>
			</div>
		)
	}

	const data = await fetch("/operation/ajax_index_statistics_usage")
					  .then(res=> { return res.json(); })
					  .then(res=> { return res; });

	ReactDOM.render(<Div_statistics title="이용 현황" data={data} />, document.getElementById("div_statistics_usage"))
}

check_index_statistics_usage()