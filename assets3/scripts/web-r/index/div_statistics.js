async function Div_statistics(){
	function Div_Sub(props) {
		return (
			<div id="toast-simple" class="flex items-center w-full w-max-md p-4 space-x-4 text-gray-500 bg-white divide-x divide-gray-200 rounded-lg shadow dark:text-gray-400 dark:divide-gray-700 space-x dark:bg-gray-800" role="alert">
				<i class="fa-solid fa-user w-5 h-5 text-blue-600 dark:text-blue-500"></i>
				<div class="pl-4 text-sm font-normal">
					<div class="pl-4 text-md font-bold">{props.title}</div>
					<div class="pl-4 text-sm font-normal">{props.content}{props.unit}</div>
				</div>
			</div>
		)
	}

	function Div_Result(props) {
		return (
			<div class="container mx-auto">
				<div class="grid lg:grid-cols-3 md:grid-cols-1 mx-auto">
					<Div_Sub title="총 가입자 수" content={props.result.cnt_member} unit="명" />
					<br/>
					<Div_Sub title="일 평균 방문자 수" content={props.result.cnt_visitor} unit="명" />
					<br/>
					<Div_Sub title="총 페이지 뷰" content={props.result.cnt_pageview} unit="건" />
				</div>
			</div>
		)
	}

	const data = await fetch("/ajax_index_statistics")
						.then(res=> { return res.json(); })
						.then(res=> { return res; });

	ReactDOM.render(<Div_Result result={data} />, document.getElementById("div_statistics"))
}

Div_statistics()