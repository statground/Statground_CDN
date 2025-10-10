async function check_members_statistics_group() {
	function Div_statistics(props){
		return(
			<div class="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800 text-center">
				<p>{props.title}</p>
				<dl class="grid max-w-screen-xl sm:grid-cols-1 lg:grid-cols-4 gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.cnt_44064}건</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">기관회원</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.cnt_254}명</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">VIP회원</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.cnt_3}명</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">정회원</dd>
					</div>
					<div class="flex flex-col align-top">
						<dt class="mb-2 text-3xl font-extrabold">{props.data.cnt_2}명</dt>
						<dd class="font-light text-gray-500 dark:text-gray-400">준회원</dd>
					</div>
				</dl>
			</div>
		)
	}

	const data = await fetch("/operation/ajax_members_statistics_group")
					.then(res=> { return res.json(); })
					.then(res=> { return res; });

	ReactDOM.render(<Div_statistics title="등급별 멤버 수" data={data} />, document.getElementById("div_statistics_group"))
}

check_members_statistics_group()