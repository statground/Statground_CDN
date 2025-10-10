async function check_members_statistics_count() {
	function Div_statistics(props){
		return(
			<div class="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800 text-center">
				<p>{props.title}</p>
				<dl class="grid max-w-screen-xl sm:grid-cols-1 lg:grid-cols-4 gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.sum_total}명</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">총 가입자 수</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.cnt_current_year}명</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">올해 가입자 수</dd>
						<dd class="font-light text-gray-500 dark:text-gray-400">(작년: {props.data.cnt_last_year}명)</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.cnt_current_month}명</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">이번 달 가입자 수</dd>
						<dd class="font-light text-gray-500 dark:text-gray-400">(지난 달: {props.data.cnt_last_month}명)</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.cnt_current_day}명</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">오늘 가입자 수</dd>
						<dd class="font-light text-gray-500 dark:text-gray-400">(어제: {props.data.cnt_last_day}명)</dd>
					</div>
				</dl>
			</div>
		)
	}

	const data = await fetch("/operation/ajax_members_statistics_count")
					.then(res=> { return res.json(); })
					.then(res=> { return res; });

	ReactDOM.render(<Div_statistics title="페이지 뷰" data={data} />, document.getElementById("div_statistics_count"))
}

check_members_statistics_count()