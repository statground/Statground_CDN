function get_table_payments()
{
	$.ajax({
		url : "/operation/ajax_payments_table_payments",
		success:function(data){
			$('#loading_table_payments').remove()
			table_payments_options = {
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
			$('#table_payments').DataTable(table_payments_options);
		}
	})
}