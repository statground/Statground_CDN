function board_payment_details()
{
	var table = $('#board_payment_details').DataTable( {
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
			"url": "/get_payment_details_list/",
			"type": "GET",
			"dataSrc": function(res) {
				var data = res.data;
				return data;
			}
		},
		columnDefs: [
			{	targets: 0,	className: 'dt-body-left'	}
		],
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