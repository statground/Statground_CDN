function check_index_statistics_payments()
{
	$.ajax({
		url : "/operation/ajax_index_statistics_payments",
		success:function(data){
			html = ""
			$("#div_index_statistics_payments").html(html)

			html += '<h4 class="text-primary fw-bold mb-3" style="text-align:center;">결제 현황</h4>'
			html += insert_div_block('이번 달 총 결제',
									numberWithCommas(data.amount_total) + '원' 
									+ ' (' + numberWithCommas(data.cnt_total) + '건)'
									+ '<br/>'
									+ '(지난 달: ' + numberWithCommas(data.amount_total_lm) + '원' 
									+ ' / '
									+ numberWithCommas(data.cnt_total_lm) + '건)')
			html += insert_div_block('이번 달 회원 업그레이드 결제',
									numberWithCommas(data.amount_group) + '원' 
									+ ' (' + numberWithCommas(data.cnt_group) + '건)'
									+ '<br/>'
									+ '(지난 달: ' + numberWithCommas(data.amount_group_lm) + '원' 
									+ ' / ' 
									+ numberWithCommas(data.cnt_group_lm) + '건)')
			html += insert_div_block('이번 달 세미나 결제',
									numberWithCommas(data.amount_seminar) + '원' 
									+ ' (' + numberWithCommas(data.cnt_seminar) + '건)'
									+ '<br/>'
									+ '(지난 달: ' + numberWithCommas(data.amount_seminar_lm) + '원' 
									+ ' / ' 
									+ numberWithCommas(data.cnt_seminar_lm) + '건)')
			$("#div_index_statistics_payments").html(html)
		}
	})
}