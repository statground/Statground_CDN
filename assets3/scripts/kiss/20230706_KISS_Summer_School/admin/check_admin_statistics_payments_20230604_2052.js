async function check_admin_statistics_payments() {
	function Div_statistics(props){
		return(
			<div class="p-4 bg-white rounded-lg md:p-8 text-center">
				<p>{props.title}</p>
				<dl class="grid w-full sm:grid-cols-1 lg:grid-cols-3 gap-8 p-4 mx-auto text-gray-900 sm:p-8">
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">
							{props.data.amount_total.toLocaleString('ko-KR')}원
						</dt>
						<dd class="font-light text-gray-500">이번 달 총 결제</dd>
						<dd class="font-light text-gray-500">(총 수강생 중<br/>일반: {props.data.amount_not_student.toLocaleString('ko-KR')}원 / 학생: {props.data.amount_student.toLocaleString('ko-KR')}원)</dd>
					</div>
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">
							{props.data.amount_day_1.toLocaleString('ko-KR')}원
						</dt>
						<dd class="font-light text-gray-500">1일차 결제 금액</dd>
						<dd class="font-light text-gray-500">(학생: {props.data.amount_day_1_student.toLocaleString('ko-KR')}원 포함)</dd>
					</div>
					<div class="flex flex-col items-center justify-center">
						<dt class="mb-2 text-3xl font-extrabold">
							{props.data.amount_day_2.toLocaleString('ko-KR')}원
						</dt>
						<dd class="font-light text-gray-500">2일차 결제 금액</dd>
						<dd class="font-light text-gray-500">(학생: {props.data.amount_day_2_student.toLocaleString('ko-KR')}원 포함)</dd>
					</div>
				</dl>
			</div>
		)
	}

	const data = await fetch("/administrator/ajax_admin_statistics_payments")
					  .then(res=> { return res.json(); })
					  .then(res=> { return res; });

	ReactDOM.render(<Div_statistics title="결제 금액" data={data} />, document.getElementById("div_statistics_payments"))
}

check_admin_statistics_payments()