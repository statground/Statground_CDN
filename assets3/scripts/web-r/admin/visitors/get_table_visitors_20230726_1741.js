let toggle_table_daily = 0
let toggle_table_monthly = 0
let toggle_table_yearly = 0

async function get_table_visitors(type){
	let columns = null;
	let chartData = null;

	if (type == "daily" && toggle_table_daily == 0) {
		const data = await fetch("/operation/ajax_visitors_table")
		.then(res=> { return res.json(); })
		.then(res=> { return res; });

		columns = data.daily.columns;
		chartData = data.daily.data;
		
	} else if (type == "monthly" && toggle_table_monthly == 0) {
		const data = await fetch("/operation/ajax_visitors_table")
		.then(res=> { return res.json(); })
		.then(res=> { return res; });

		columns = data.monthly.columns;
		chartData = data.monthly.data;
		
	} else if (type == "yearly" && toggle_table_yearly == 0) {
		const data = await fetch("/operation/ajax_visitors_table")
		.then(res=> { return res.json(); })
		.then(res=> { return res; });

		columns = data.yearly.columns;
		chartData = data.yearly.data;
	}

	let table_visitors_options = {
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
		columnDefs: [{"target":0, "className": "font-normal text-sm w-full"},
					{"target":1, "className": "font-normal text-sm w-full"},
					{"target":2, "className": "font-normal text-sm w-full"}],
		data: chartData,
		"order": [[ 0, 'desc' ]],
		"oLanguage": { "sInfo" : "_TOTAL_페이지 중 _START_ ~ _END_번째" },
		"language": { "lengthMenu": "페이지당 _MENU_ 개씩 보기" }
	}

	function Div_table(props)
	{
		return (
			<div class="w-full max-w-full">
				<div class="relative flex flex-col min-w-0 break-words bg-white border-0 shadow-soft-xl rounded-2xl bg-clip-border">
					<div class="table-responsive w-full mx-auto">
						<table id={props.id} class="w-fit text-xm text-right text-gray-500 px-2">
							<thead class="text-xs text-gray-700 uppercase bg-gray-100"></thead>
						</table>
					</div>
				</div>
			</div>
		)
	}
	

	if (type == "daily" && toggle_table_daily == 0) {
		ReactDOM.render(<Div_table id="div_table_daily" />, document.getElementById("table_daily"))
		$('#div_table_daily').DataTable(table_visitors_options);
		toggle_table_daily = 1

	} else if (type == "monthly" && toggle_table_monthly == 0) {
		ReactDOM.render(<Div_table id="div_table_monthly" />, document.getElementById("table_monthly"))
		$('#div_table_monthly').DataTable(table_visitors_options);
		toggle_table_monthly = 1
		
	} else if (type == "yearly" && toggle_table_yearly == 0) {
		ReactDOM.render(<Div_table id="div_table_yearly" />, document.getElementById("table_yearly"))
		$('#div_table_yearly').DataTable(table_visitors_options);
		toggle_table_yearly = 1
	}
}

get_table_visitors("daily")