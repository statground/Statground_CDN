// 이용 현황
function check_index_statistics_usage()
{
	$.ajax({
		url : "/operation/ajax_index_statistics_usage",
		success:function(data){
			html = ""
			$("#div_index_statistics_usage").html(html)

			html += '<h4 class="text-primary fw-bold mb-3" style="text-align:center;">이용 현황</h4>'
			html += '<p style="text-align:center;">KST 기준입니다. (Web-R 관리자 페이지는 UTC 기준)</p>'
			html += insert_div_block('이번 달의 일 평균 페이지 뷰', numberWithCommas(data.avg_pageview) + '건' 
										+ ' (지난 달: ' + numberWithCommas(data.avg_pageview_lm) + '건)')
			html += insert_div_block('이번 달의 일 평균 접속자 수', numberWithCommas(data.avg_visitor) + '명' 
										+ ' (지난 달: ' + numberWithCommas(data.avg_visitor_lm) + '명)')
			html += insert_div_block('이번 달 가입자 수', numberWithCommas(data.join_member) + '명' 
										+ ' (지난 달: ' + numberWithCommas(data.join_member_lm) + '명)')
			$("#div_index_statistics_usage").html(html)
		}
	})
}


// 결제 현황
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