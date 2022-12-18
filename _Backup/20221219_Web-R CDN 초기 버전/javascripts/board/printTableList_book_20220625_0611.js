function printTableList(inputURL, categoryTag = null)
{		
	var url = "/" + inputURL + "/"
	
	if (categoryTag != null)
	{
		url += categoryTag + "/"
	}

	var table = $('#table_board_community').DataTable( {
		"destroy": true,
		"responsive": true,
		"processing": true,
		"serverSide": true,
		"ordering": false,
		"responsive": true,
		"autoWidth": true,
		"paging": true,
		"lengthMenu": [ 4, 7, 10, 15, 20, 25 ],
		"pageLength": 4,
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
		"oLanguage": { "sInfo" : "_TOTAL_개의 게시물 중, _START_ ~ _END_  번째 게시물" },
		"language": { "lengthMenu": "페이지당 _MENU_ 개씩 보기" }
	} );
	
	table.on( 'responsive-resize', function ( e, datatable, columns ) {
		var count = columns.reduce( function (a,b) {
			return b === false ? a+1 : a;
		}, 0 );
	} );
};