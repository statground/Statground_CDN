let toggle_graph_monthly = 0
let toggle_graph_yearly = 0

async function get_graph_visitors(type)
{
	let div_graph_monthly = document.getElementById("graph_monthly");
	let div_graph_yearly = document.getElementById("graph_yearly");

	let options = {
		title: "일 평균 방문자 수(왼쪽, 파란색) / 페이지 뷰 합계(오른쪽, 빨간색)",
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

	if (type == "daily") {
		bar(data.daily, 'graph_daily', options);

	} else if (type == "monthly" && toggle_graph_monthly == 0) {
		const data = await fetch("/operation/ajax_visitors_graph")
		.then(res=> { return res.json(); })
		.then(res=> { return res; });

		div_graph_monthly.className = "p-4 rounded-lg bg-gray-50 dark:bg-gray-800 w-full"
		div_graph_yearly.className = "hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800 w-full"
		bar(data.monthly, 'graph_monthly', options);
		toggle_graph_monthly = 1
		
	} else if (type == "yearly" && toggle_graph_yearly == 0) {
		const data = await fetch("/operation/ajax_visitors_graph")
		.then(res=> { return res.json(); })
		.then(res=> { return res; });

		div_graph_monthly.className = "hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800 w-full"
		div_graph_yearly.className = "p-4 rounded-lg bg-gray-50 dark:bg-gray-800 w-full"
		bar(data.yearly, 'graph_yearly', options);
		toggle_graph_yearly = 1
	}
}    

get_graph_visitors("monthly")