function Div_finish_order(props) {
	return (
		<div class="flex flex-col justify-center items-center mx-auto">    
			<div class="flex flex-col justify-center items-center mx-auto ">
				<h1 class="mb-4 text-md font-extrabold leading-none tracking-tight text-gray-900 md:text-xl lg:text-2xl">
					<span class="underline underline-offset-3 decoration-8 decoration-blue-400">이용자 정보</span>
				</h1>

				<p class="text-sm font-normal text-gray-500 lg:text-sm">
					<b>E-mail: </b>{props.data.email}
				</p>
				<p class="text-sm font-normal text-gray-500 lg:text-sm">
					<b>이름: </b>{props.data.username}
				</p>
			</div>
			
			{
				props.data.log_status == "FAILED"
				? <div class="flex flex-col justify-center items-center mx-auto pt-4 pb-4">
					<h1 class="mb-4 text-md font-extrabold leading-none tracking-tight text-gray-900 md:text-xl lg:text-2xl">
						<span class="underline underline-offset-3 decoration-8 decoration-red-400">수강 신청 실패</span>
					</h1>
					<p class="text-sm font-normal text-gray-500 lg:text-sm">
						{props.data.log.result.message}
					</p>
				  </div>
				: ""
			}
			{
				props.data.log_status == "WAITING"
				? <div class="flex flex-col justify-center items-center mx-auto pt-4 pb-4">
					<h1 class="mb-4 text-md font-extrabold leading-none tracking-tight text-gray-900 md:text-xl lg:text-2xl">
						<span class="underline underline-offset-3 decoration-8 decoration-green-400">결제 대기</span>
					</h1>

					<p class="text-sm font-normal text-gray-500 lg:text-sm">
						<b>주문 번호: </b>{props.data.order_id}
					</p>
					<p class="text-sm font-normal text-gray-500 lg:text-sm">
						<b>은행: </b>{props.data.log.result.virtualAccount.bank}
					</p>
					<p class="text-sm font-normal text-gray-500 lg:text-sm">
						<b>계좌번호: </b>{props.data.log.result.virtualAccount.accountNumber}
					</p>
					<p class="text-sm font-normal text-gray-500 lg:text-sm">
						<b>만료 시각: </b>{props.data.log.result.virtualAccount.dueDate.replace('T', ' ')}
					</p>
				  </div>
				: ""
			}
			{
				props.data.log_status == "SUCCESS"
				? <div class="flex flex-col justify-center items-center mx-auto pt-4 pb-4">
					<h1 class="mb-4 text-md font-extrabold leading-none tracking-tight text-gray-900 md:text-xl lg:text-2xl">
						<span class="underline underline-offset-3 decoration-8 decoration-green-400">수강 신청 완료</span>
					</h1>
					<p class="text-sm font-normal text-gray-500 lg:text-sm">
						{props.data.log.result.orderName}
					</p>
					<p class="text-sm font-normal text-gray-500 lg:text-sm">
						<b>결제 금액: </b>{props.data.log.result.totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 원
					</p>
				  </div>
				: ""
			}
		</div>
	)
}