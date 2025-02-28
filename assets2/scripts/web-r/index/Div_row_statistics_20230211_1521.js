async function Div_row_statistics(){
	function Col_lg_4(props) {
		return (
			<div class="col-lg-4">
				<h3 class="fw-400 color-oxford">{props.content}{props.unit}</h3>
				<p class="lead color-4">{props.title}</p>
			</div>
		)
	}

	function Col_hidden() {
		return (
			<div class="col-12 hidden-lg-up">
				<hr class="color-9 mb-4" />
			</div>
		)
	}

	function Col_finish() {
		return (
			<div class="col-12">
				<hr class="color-9 mb-0" />
			</div>
		)
	}

	function Result(props) {
		return (
			<div class="container">
				<div class="row justify-content-center">
					<div class="col-lg-8">
						<h4 class="color-oxford">Web-R의 통계</h4>
					</div>
					<div class="col-lg-6">
						<p class="lead mb-5">많은 사람들이 Web-R을 이용하고 있어요.</p>
					</div>
					<Col_finish />
				</div>

				<div class="row justify-content-center">
					<br/>
				</div>

				<div class="row justify-content-center">
					<Col_lg_4 title="가입자 수" content={props.result.cnt_member} unit="명" />
					<Col_hidden />
					<Col_lg_4 title="일 평균 방문자 수" content={props.result.cnt_visitor} unit="명" />
					<Col_hidden />
					<Col_lg_4 title="총 페이지 뷰"  content={props.result.cnt_pageview} unit="건" />
					<Col_finish />
				</div>
			</div>
		)
	}

	const data = await fetch("/ajax_index_statistics")
						.then(res=> { return res.json(); })
						.then(res=> { return res; });

	ReactDOM.render(<Result result={data} />, document.getElementById("div_row_statistics"))
}

Div_row_statistics()