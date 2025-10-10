// 방문 현황 - 방문자 수
function check_visitors_statistics_visitors()
{
	$.ajax({
		url : "/operation/ajax_visitors_statistics_visitors",
		success:function(data){
			html = ""
			$("#div_visitors_statistics_count").html(html)

			html += '<p style="text-align:center;">방문자 수</p>'
			html += insert_div_block('방문자 수/일',
									numberWithCommas(data.avg_total) + '명',
									3)
			html += insert_div_block('올해의 방문자 수/일 ',
									numberWithCommas(data.avg_current_year) + '명' 
									+ '<br/>'
									+ '(작년: ' + numberWithCommas(data.avg_last_year) + '명)',
									3)
			html += insert_div_block('이번 달 방문자 수/일',
									numberWithCommas(data.avg_current_month) + '명' 
									+ '<br/>'
									+ '(지난 달: ' + numberWithCommas(data.avg_last_month) + '명)',
									3)
			html += insert_div_block('오늘 방문자 수',
									numberWithCommas(data.avg_today) + '명' 
									+ '<br/>'
									+ '(어제: ' + numberWithCommas(data.avg_yesterday) + '명)',
									3)
			$("#div_visitors_statistics_count").html(html)
		}
	})
}



// 방문 현황 - 페이지 뷰
function check_visitors_statistics_pageview()
{
	$.ajax({
		url : "/operation/ajax_visitors_statistics_pageview",
		success:function(data){
			html = ""
			$("#div_visitors_statistics_pageview").html(html)

			html += '<p style="text-align:center;">페이지 뷰</p>'
			html += insert_div_block('총 페이지 뷰',
									numberWithCommas(data.sum_total) + '명',
									3)
			html += insert_div_block('올해의 페이지 뷰 ',
									numberWithCommas(data.sum_current_year) + '명' 
									+ '<br/>'
									+ '(작년: ' + numberWithCommas(data.sum_last_year) + '명)',
									3)
			html += insert_div_block('이번 달 페이지 뷰',
									numberWithCommas(data.sum_current_month) + '명' 
									+ '<br/>'
									+ '(지난 달: ' + numberWithCommas(data.sum_last_month) + '명)',
									3)
			html += insert_div_block('오늘 페이지 뷰',
									numberWithCommas(data.sum_today) + '명' 
									+ '<br/>'
									+ '(어제: ' + numberWithCommas(data.sum_yesterday) + '명)',
									3)
			$("#div_visitors_statistics_pageview").html(html)
		}
	})
}


// 방문 현황 - 방문 추이 (그래프)
function get_graph_visitors(type)
{
	$("#div_visitors_graph_loading").show()
	$("#div_visitors_graph_buttons").hide()
	$("#div_visitors_graph_daily").hide()
	$("#div_visitors_graph_monthly").hide()
	$("#div_visitors_graph_yearly").hide()

	$.ajax({
		url : "/operation/ajax_visitors_graph",
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

			$("#div_visitors_graph_loading").hide()
			$("#div_visitors_graph_buttons").show()
			if (type=="daily"){
				$("#div_visitors_graph_daily").show()
				bar(data.daily, 'div_visitors_graph_daily', options);
			} else if (type=="monthly"){
				$("#div_visitors_graph_monthly").show()
				bar(data.monthly, 'div_visitors_graph_monthly', options);
			} else if (type=="yearly"){
				$("#div_visitors_graph_yearly").show()
				bar(data.yearly, 'div_visitors_graph_yearly', options);
			}
		}
	})
}



// 방문 현황 (표)
function get_table_visitors(type="daily")
{
	$("#div_loading_table_visitors").show();
	$("#div_visitors_table_buttons").hide();
	$("#table_visitors").hide();
	$("#table_visitors").html("");

	$.ajax({
		url : "/operation/ajax_visitors_table",
		success:function(data){
			if (type == "daily") {
				columns = data.daily.columns;
				chartData = data.daily.data;
			} else if (type == "monthly") {
				columns = data.monthly.columns;
				chartData = data.monthly.data;
			} else {
				columns = data.yearly.columns;
				chartData = data.yearly.data;
			}

			table_visitors_options = {
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
				"pageLength": 10,
				columns: columns,
				columnDefs: [{"target":0, "className": 'dt-body-right'},
							 {"target":1, "className": 'dt-body-right'},
							 {"target":2, "className": 'dt-body-right'}],
				data: chartData,
				"order": [[ 0, 'desc' ]],
				"oLanguage": { "sInfo" : "_TOTAL_페이지 중 _START_ ~ _END_번째" },
				"language": { "lengthMenu": "페이지당 _MENU_ 개씩 보기" }
			}

			$('#table_visitors').DataTable(table_visitors_options);
		}
	})

	$("#div_loading_table_visitors").hide()
	$("#div_visitors_table_buttons").show()
	$('#table_visitors').show()
}