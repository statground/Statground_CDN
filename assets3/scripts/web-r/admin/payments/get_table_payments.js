async function get_table_payments(){
	const data = await fetch("/operation/ajax_payments_table_payments")
	.then(res=> { return res.json(); })
	.then(res=> { return res; });

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
		"pageLength": 5,
		columns: data.columns,
		columnDefs: data.columnDefs,
		data: data.data,
		"order": [[ 14, 'desc' ]],
		"oLanguage": { "sInfo" : "_TOTAL_건의 결제 중 _START_ ~ _END_번째" },
		"language": { "lengthMenu": "페이지당 _MENU_ 개씩 보기" }
	}

	function Div_table(props)
	{
		return (
			<div class="w-full max-w-full">
				<div class="relative flex flex-col min-w-0 break-words bg-white border-0 shadow-soft-xl rounded-2xl bg-clip-border">
					<div class="table-responsive">
						<table id={props.id} class="w-full text-sm text-right text-gray-500 dark:text-gray-400">
							<thead class="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400"></thead>
						</table>
					</div>
				</div>
			</div>
		)
	}
	
	ReactDOM.render(<Div_table id="table_payments_result" />, document.getElementById("table_payments"))
	$('#table_payments_result').DataTable(table_visitors_options);
}

get_table_payments()