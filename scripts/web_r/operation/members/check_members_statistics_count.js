function check_members_statistics_count()
{
	$.ajax({
		url : "/operation/ajax_members_statistics_count",
		success:function(data){
			console.log(data)
			html = ""
			$("#div_members_statistics_count").html(html)

			html += insert_div_block('총 가입자 수',
									numberWithCommas(data.cnt_total) + '명')
			html += insert_div_block('올해의 가입자 수',
									numberWithCommas(data.cnt_current_year) + '명' 
									+ '<br/>'
									+ '(작년: ' + numberWithCommas(data.cnt_last_year) + '명)')
			html += insert_div_block('이번 달 가입자 수',
									numberWithCommas(data.cnt_current_month) + '명' 
									+ '<br/>'
									+ '(지난 달: ' + numberWithCommas(data.cnt_last_month) + '명)')
			html += insert_div_block('오늘 가입자 수',
									numberWithCommas(data.cnt_current_day) + '명' 
									+ '<br/>'
									+ '(어제: ' + numberWithCommas(data.cnt_last_day) + '명)')
			$("#div_members_statistics_count").html(html)
		}
	})
}