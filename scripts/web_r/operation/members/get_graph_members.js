function get_graph_members(type)
{
	$("#div_members_graph_loading").show()
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