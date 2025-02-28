function check_members_statistics_group()
{
	$.ajax({
		url : "/operation/ajax_members_statistics_group",
		success:function(data){
			html = ""
			$("#div_members_statistics_group").html(html)

			html += '<p style="text-align:center;">등급별 멤버 수</p>'
			html += insert_div_block('기관회원', numberWithCommas(data.cnt_44064) + '명')
			html += insert_div_block('VIP회원', numberWithCommas(data.cnt_254) + '명')
			html += insert_div_block('정회원', numberWithCommas(data.cnt_3) + '명')
			html += insert_div_block('준회원', numberWithCommas(data.cnt_2) + '명')
			$("#div_members_statistics_group").html(html)
		}
	})
}