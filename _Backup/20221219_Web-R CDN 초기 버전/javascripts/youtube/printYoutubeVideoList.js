function printYoutubeVideoList()
{		
	var url = "/get_youtube_video_list/"

	var table = $('#table_youtubeList').DataTable( {
		"destroy": true,
		"responsive": true,
		"processing": true,
		"serverSide": true,
		"ordering": false,
		"responsive": true,
		"autoWidth": true,
		"lengthChange": true,
		"lengthMenu": [ 3, 5, 10, 25, 50],
		"pageLength": 3,
		"searching": true,
		"ajax": {
			"url": url,
			"type": "GET",
			"dataSrc": function(res) {
				var data = res.data;
				return data;
			}
		},
		"columns" : [
			{"data": "Image"},
			{"data": "Content"}
		],
		"oLanguage": { "sInfo" : "_TOTAL_명의 영상 중 _START_ ~ _END_번째 영상" },
		"language": { "lengthMenu": "페이지당 _MENU_ 개씩 보기" }
	} );
	
	table.on( 'responsive-resize', function ( e, datatable, columns ) {
		var count = columns.reduce( function (a,b) {
			return b === false ? a+1 : a;
		}, 0 );
	} );		
};