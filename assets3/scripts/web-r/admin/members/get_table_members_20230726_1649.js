async function get_table_members(){
	const data = await fetch("/operation/ajax_members_table_members")
	.then(res=> { return res.json(); })
	.then(res=> { return res; });

	let table_members_options = {
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
		columns: data.columns,
		columnDefs: data.columnDefs,
		data: data.data,
		"order": [[ 5, 'desc' ]],
		"oLanguage": { "sInfo" : "_TOTAL_명의 회원 중 _START_ ~ _END_번째" },
		"language": { "lengthMenu": "페이지당 _MENU_ 개씩 보기" }
	}

	function Div_table(props)
	{
		return (
			<div class="w-full max-w-full">
				<div class="relative flex flex-col min-w-0 break-words bg-white border-0 shadow-soft-xl rounded-2xl bg-clip-border">
					<div class="table-responsive mx-auto">
						<table id={props.id} class="w-full text-xm text-right text-gray-500">
							<thead class="text-xs text-gray-700 uppercase bg-gray-100"></thead>
						</table>
					</div>
				</div>
			</div>
		)
	}
	
	ReactDOM.render(<Div_table id="table_member_result" />, document.getElementById("table_members"))
	$('#table_member_result').DataTable(table_members_options);
}

get_table_members()