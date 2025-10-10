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
				"lengthChange": true,
				"lengthMenu":[5, 10, 20, 30, 40, 50],
				"pageLength": 10,
				columns: data.columns,
				columnDefs: data.columnDefs,
				data: data.data,
				"oLanguage": { "sInfo" : "_TOTAL_명의 회원 중 _START_ ~ _END_번째" },
				"language": { "lengthMenu": "페이지당 _MENU_ 개씩 보기" }
			}
			$('#table_members').DataTable(table_members_options);
		}
	})
}