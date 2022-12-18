function ajax_board(inputUUID, tableName)
{		
	url = "/get_index_board/" + inputUUID + "/"

	var table = $('#' + tableName).DataTable( {
		"destroy": true,
		"responsive": true,
		"processing": true,
		"serverSide": true,
		"ordering": false,
		"responsive": true,
		"autoWidth": true,
		"paging": false,
		"lengthChange": false,
		"searching": false,
		"pageLength": 5,
		"ajax": {
			"url": url,
			"type": "GET",
			"dataSrc": function(res) {
				var data = res.data;
				return data;
			}
		},
		"columns" : [
			{"data": "Contents"}
		],
		columnDefs: [
			{	targets: 0,	className: 'dt-body-left'	}
		],
		"oLanguage": { "sInfo" : "" },
		"language": { "lengthMenu": "" }
	} );
	
	table.on( 'responsive-resize', function ( e, datatable, columns ) {
		var count = columns.reduce( function (a,b) {
			return b === false ? a+1 : a;
		}, 0 );
	} );
}