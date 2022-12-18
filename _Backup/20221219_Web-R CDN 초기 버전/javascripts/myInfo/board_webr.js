function board_webr()
{
	var table = $('#table_myInfo_WebR').DataTable( {
		"responsive": true,
		"processing": true,
		"serverSide": true,
		"ordering": false,
		"responsive": true,
		"autoWidth": true,
		"paging": "simple",
		"lengthChange": false,
		"searching": false,
		"pageLength": 5,
		"ajax": {
			"url": "/get_list_my_webR_log/",
			"type": "GET",
			"dataSrc": function(res) {
				var data = res.data;
				return data;
			}
		},
		columnDefs: [
			{	targets: 0,	className: 'dt-body-left'	}
		],
		"oLanguage": { "sInfo" : "_TOTAL_개의 로그 중, _START_ ~ _END_  번째 로그" },
		"language": { "lengthMenu": "페이지당 _MENU_ 개씩 보기" },
		"columns" : [
			{"data": "Logs"}
		],
		"drawCallback": function( settings ) {
			 $("#board_payment_details thead").remove();
		 }
	} );

	table.on( 'responsive-resize', function ( e, datatable, columns ) {
		var count = columns.reduce( function (a,b) {
			return b === false ? a+1 : a;
		}, 0 );
	} );
}