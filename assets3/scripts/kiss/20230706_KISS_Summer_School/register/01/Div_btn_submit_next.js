// 다음 단계로
function Div_btn_submit_next() {
	return(
		<div class="flex pt-4 justify-center">
			<a type="button" id="btn_next" name="btn_next"
			   class="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 
					  hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300
					  font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 cursor-pointer"
			   onClick={() => submit()}>
				다음 단계로
			</a>
			<button type="button" onClick={() => location.href='/'}
					class="py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 
						   focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200">
				돌아가기
			</button>
		</div>
	)
}