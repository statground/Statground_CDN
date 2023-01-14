// 회원 현황 - 멤머 수
function check_members_statistics_count()
{
	$.ajax({
		url : "/operation/ajax_members_statistics_count",
		success:function(data){
			html = ""
			$("#div_members_statistics_count").html(html)

			html += '<p style="text-align:center;">멤버 수</p>'
			html += insert_div_block('총 가입자 수',
									numberWithCommas(data.cnt_total) + '명',
									3)
			html += insert_div_block('올해의 가입자 수',
									numberWithCommas(data.cnt_current_year) + '명' 
									+ '<br/>'
									+ '(작년: ' + numberWithCommas(data.cnt_last_year) + '명)'
									3)
			html += insert_div_block('이번 달 가입자 수',
									numberWithCommas(data.cnt_current_month) + '명' 
									+ '<br/>'
									+ '(지난 달: ' + numberWithCommas(data.cnt_last_month) + '명)'
									3)
			html += insert_div_block('오늘 가입자 수',
									numberWithCommas(data.cnt_current_day) + '명' 
									+ '<br/>'
									+ '(어제: ' + numberWithCommas(data.cnt_last_day) + '명)'
									3)
			$("#div_members_statistics_count").html(html)
		}
	})
}



// 회원 현황 - 등급별 멤버 수
function check_members_statistics_group()
{
	$.ajax({
		url : "/operation/ajax_members_statistics_group",
		success:function(data){
			html = ""
			$("#div_members_statistics_group").html(html)

			html += '<p style="text-align:center;">등급별 멤버 수</p>'
			html += insert_div_block('기관회원', numberWithCommas(data.cnt_44064) + '명', 3)
			html += insert_div_block('VIP회원', numberWithCommas(data.cnt_254) + '명', 3)
			html += insert_div_block('정회원', numberWithCommas(data.cnt_3) + '명', 3)
			html += insert_div_block('준회원', numberWithCommas(data.cnt_2) + '명', 3)
			$("#div_members_statistics_group").html(html)
		}
	})
}



// 회원 현황 - 가입자 수 추이 (그래프)
function get_graph_members(type)
{
	$("#div_members_graph_loading").show()
	$("#div_members_graph_buttons").hide()
	$("#div_members_graph_daily").hide()
	$("#div_members_graph_monthly").hide()
	$("#div_members_graph_yearly").hide()

	$.ajax({
		url : "/operation/ajax_members_graph",
		success:function(data){
			options = {
				series: {
					0: {targetAxisIndex: 0},
					1: {targetAxisIndex: 1}
				},
				width: '100%',
				legend: { position: 'none' },
				crosshair: {orientation: 'vertical', trigger: 'focus'},
				focusTarget: 'category',
				hAxis: { textStyle: { color: 'green' }, format: 'yy-MM-dd' },
				explorer: { actions: ['dragToZoom', 'rightClickToReset'], axis: 'horizontal' },
				bar: { groupWidth: "90%" } 
			};

			$("#div_members_graph_loading").hide()
			$("#div_members_graph_buttons").show()
			if (type=="daily"){
				$("#div_members_graph_daily").show()
				bar(data.daily, 'div_members_graph_daily', options);
			} else if (type=="monthly"){
				$("#div_members_graph_monthly").show()
				bar(data.monthly, 'div_members_graph_monthly', options);
			} else if (type=="yearly"){
				$("#div_members_graph_yearly").show()
				bar(data.yearly, 'div_members_graph_yearly', options);
			}
		}
	})
}



// 멤버 현황 (표)
function get_table_members()
{
	$.ajax({
		url : "/operation/ajax_members_table_members",
		success:function(data){
			$('#loading_table_members').remove()
			table_members_options = {
				"dom": 'Bfrtip',
				"buttons": ['copy', 'csv', 'excel', 'pdf', 'print'],
				"ordering": true,
				"bDestroy": true,
				"lengthChange": true,
				"searching": true,
				"scrollX": true,
				"scrollCollapse": true,
				"lengthChange": true,
				"lengthMenu":[5, 10, 20, 30, 40, 50],
				"pageLength": 5,
				columns: data.columns,
				columnDefs: data.columnDefs,
				data: data.data,
				"order": [[ 5, 'desc' ]],
				"oLanguage": { "sInfo" : "_TOTAL_명의 회원 중 _START_ ~ _END_번째" },
				"language": { "lengthMenu": "페이지당 _MENU_ 개씩 보기" }
			}
			$('#table_members').DataTable(table_members_options);
		}
	})
}