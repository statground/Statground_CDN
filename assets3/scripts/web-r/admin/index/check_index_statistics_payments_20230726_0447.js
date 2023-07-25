async function check_index_statistics_payments() {
	function Div_statistics(props){
		function Div_sub(props) {
			return (
				<div class="flex flex-col items-center justify-center">
					{
						props.cnt != "" 
					?   <dt class="mb-2 text-3xl font-extrabold">{props.amount}원 / {props.cnt}건</dt>
					:   <dt class="mb-2 text-2xl font-bold">{props.amount}원</dt>
					}
					
					<dd class="font-light text-gray-500">{props.title}</dd>
					{
						props.cnt_lm != "" 
					?   <dd class="font-light text-gray-500">(지난 달: {props.amount_lm}원 / {props.cnt_lm}건)</dd>
					:   <dd class="font-light text-gray-500">(지난 달: {props.amount_lm}원)</dd>
					}

				</div>
			)
		}

		return(
			<div class="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800 text-center">
				<Div_title title="결제 현황" />

				<dl class="grid w-full sm:grid-cols-1 lg:grid-cols-3 gap-8 p-4 mx-auto text-gray-900 sm:p-8">
					<Div_sub title="이번 달 총 결제"
							 amount={props.data.amount_total} cnt={props.data.cnt_total}
							 amount_lm={props.data.amount_total_lm} cnt_lm={props.data.cnt_total_lm} />
					<Div_sub title="이번 달 회원 업그레이드 결제"
							 amount={props.data.amount_group} cnt={props.data.cnt_group}
							 amount_lm={props.data.amount_group_lm} cnt_lm={props.data.cnt_group_lm} />
					<Div_sub title="이번 달 세미나 결제"
							 amount={props.data.amount_seminar} cnt={props.data.cnt_seminar}
							 amount_lm={props.data.amount_seminar_lm} cnt_lm={props.data.cnt_seminar_lm} />
				</dl>
				<dl class="grid w-full sm:grid-cols-1 lg:grid-cols-4 gap-8 p-4 mx-auto text-gray-900 sm:p-8">
					<Div_sub title="부가세 (10%)"
							 amount={props.data.amount_total_tax} cnt=""
							 amount_lm={props.data.amount_total_lm_tax} cnt_lm="" />
					<Div_sub title="토스페이먼츠 수수료 (3.63%)"
							 amount={props.data.amount_total_toss} cnt=""
							 amount_lm={props.data.amount_total_lm_toss} cnt_lm="" />
					<Div_sub title="통계마당 수수료 (10%)"
							 amount={props.data.amount_total_statground} cnt=""
							 amount_lm={props.data.amount_total_lm_statground} cnt_lm="" />
					<Div_sub title="정산액"
							 amount={props.data.amount_total_refund} cnt=""
							 amount_lm={props.data.amount_total_lm_refund} cnt_lm="" />
				</dl>
			</div>
		)
	}

	const data = await fetch("/operation/ajax_index_statistics_payments")
					  .then(res=> { return res.json(); })
					  .then(res=> { return res; });

	ReactDOM.render(<Div_statistics data={data} />, document.getElementById("div_statistics_payments"))
}