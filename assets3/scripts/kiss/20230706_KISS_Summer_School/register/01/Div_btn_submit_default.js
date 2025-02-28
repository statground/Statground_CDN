// 입력 확인 중
function Div_btn_submit_default() {
	return(
		<div class="flex pt-4 justify-center">
			<button type="button" id="btn_default" name="btn_default"
					class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 
						   hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 
						   font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 cursor-pointer"
					onClick={() => check_registered_user()}>
				입력 확인하기
			</button>
			<button type="button" onClick={() => location.href='/'}
					class="py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 
						focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200">
				돌아가기
			</button>
		</div>
	)
}