function Div_li_payment_btn(props) {
	return (
		<div class="bg-indigo-50">
			<div class="flex flex-col w-full h-full justify-center items-center text-start p-8 mx-auto">
				<h3 class="mb-2 text-xl font-semibold">결제하기</h3>
				<div class="flex flex-col justify-center items-center text-center w-full text-start">
					<span class="mr-2 text-3xl font-extrabold">{(price_days_1+price_days_2).toLocaleString('ko-KR')}원</span>
					{
						chk_student == 0
						? <span class="text-gray-500">(각 세션당 120,000원)</span>
						: <span class="text-gray-500">(각 세션당 80,000원; 학생 할인 적용)</span>
					}
				</div>
				<div class="flex flex-col justify-center items-baseline w-full text-start">
					<span class="text-gray-700 text-sm underline mb-1">선택한 세션</span>
					{
						btn_days_1 == 1
						? <span class="text-gray-700 text-sm"><i class="fa-solid fa-circle-check mr-2"></i>1일차: Theory and Methods for missing data analysis</span>
						: ""
					}
					{
						btn_days_2 == 1
						? <span class="text-gray-700 text-sm"><i class="fa-solid fa-circle-check mr-2"></i>2일차: 딥러닝의 통계학적 이해</span>
						: ""
					}
				</div>
			</div>

			<div class="flex flex-row w-full h-full justify-center items-center text-start mx-auto">
				{
					(document.getElementById("id_file_input").value == '' && chk_student == 1) || (price_days_1 + price_days_2 == 0)
					? <button type="button" class={class_btn_disabled}>
						카드 결제
					  </button>
					: <button type="button" class={class_btn_enabled}
							  onClick={() => request_order_id(product_id, "80d44930-0226-11ee-be56-0242ac120002", "card", email, name, phone)}>
						카드 결제
					  </button>
				}
				{
					(document.getElementById("id_file_input").value == '' && chk_student == 1) || (price_days_1 + price_days_2 == 0)
					? <button type="button" class={class_btn_disabled}>
						무통장 입금
					  </button>
					: <button type="button" class={class_btn_enabled}
							  onClick={() => request_order_id(product_id, "80d44930-0226-11ee-be56-0242ac120002", "va", email, name, phone)}>
						무통장 입금
					  </button>
				}
				{
					(document.getElementById("id_file_input").value == '' && chk_student == 1) || (price_days_1 + price_days_2 == 0)
					? <button type="button" class={class_btn_disabled}>
						계좌 이체
					  </button>
					: <button type="button" class={class_btn_enabled}
							  onClick={() => request_order_id(product_id, "80d44930-0226-11ee-be56-0242ac120002", "account", email, name, phone)}>
						계좌 이체
					  </button>
				}
			</div>

			<div>
				{
					(price_days_1 + price_days_2 == 0)
					? <span class="text-sm text-red-500">* 선택한 강의가 없습니다.<br/></span>
					: ""
				}
				
				{
					document.getElementById("id_file_input").value == '' && chk_student == 1
					? <span class="text-sm text-red-500">* 학생임을 증명할 수 있는 파일을 첨부해야 다음 절차를 진행하실 수 있습니다.</span>
					: ""
				}
			</div>
			
		</div>
	)
}