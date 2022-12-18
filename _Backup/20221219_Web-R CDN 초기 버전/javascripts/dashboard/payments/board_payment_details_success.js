function board_payment_details_success()
{
	var table = $('#board_payment_details_success').DataTable( {
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
			"url": "/get_payment_details_list_admin/?inputSuccessStatus=True",
			"type": "GET",
			"dataSrc": function(res) {
				var data = res.data;
				return data;
			}
		},
		columnDefs: [
			{	targets: 0,	className: 'dt-body-left'	}
		],
		"oLanguage": { "sInfo" : "_TOTAL_개의 결제 내역 중, _START_ ~ _END_  번째 내역" },
		"language": { "lengthMenu": "페이지당 _MENU_ 개씩 보기" },
		"columns" : [
			{"data": "PaymentDetails"}
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