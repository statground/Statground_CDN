function ajax_board(inputUUID, tableName)
{	
	function func_defineInputHtml_span(color, msg, fontSize)
	{
		return '<span style="color:' + color + '; font-size:' + fontSize + ';">' + msg + '</span>'
	}
	
	function func_defineInputHtml_sub_realtime_bw(inputContent)
	{
		return '<div class="realtime-bw">' + inputContent + '</div>'
	}
	
	function getCurrentTime(days)
	{
		var today = new Date();   
		var dayOfMonth = today.getDate();
		today.setDate(dayOfMonth - days);
		
		var year = today.getFullYear();
		var month = ('0' + (today.getMonth() + 1)).slice(-2);
		var day = ('0' + today.getDate()).slice(-2);
		var hours = ('0' + today.getHours()).slice(-2); 
		var minutes = ('0' + today.getMinutes()).slice(-2);
		var seconds = ('0' + today.getSeconds()).slice(-2); 

		var dateString = year + '-' + month  + '-' + day;
		var timeString = hours + ':' + minutes  + ':' + seconds;
		
		return dateString + " " + timeString
	}

	$.ajax({
		url : "/get_index_board/" + inputUUID + "/",
		success:function(data){
			var fontSize = "small";	var fontSize_small = "x-small"
			var tTable = $('#' + tableName).DataTable();
			
			for(key in data){
				header = '<tr>'
				header += '<td>'
				
				header += '<a href="/' + inputUUID + '/readArticle/' + data[key].uuid.toString() + '">'
				header += '<h5 style="color:black">'
				
				tag_tag = ""
				if (data[key].active == 2)	{	tag_tag += '<i class="fa-solid fa-lock"></i>&nbsp&nbsp'	}	// 비밀글 표시
				
				// 묻고 답하기
				if (inputUUID == "qna")
				{
					if (data[key].comment_count == 0)	{	tag_tag += func_defineInputHtml_span("red", "[답변을 기다리고 있어요.]&nbsp;", fontSize);	}
					else												{	tag_tag += func_defineInputHtml_span("blue", "[답변이 있어요!]&nbsp;", fontSize);	}
				}
				
				if ((inputUUID == "visitors") && (data[key].comment_count == 0))
				{
					tag_tag += func_defineInputHtml_span("Peru", '[<i class="fa-solid fa-hand-sparkles"></i> 환영해주세요]&nbsp;', fontSize)
				}
				
				// 제목
				tag_title = func_defineInputHtml_span("black", data[key].title.toString(), fontSize)
				
				// 1주일 이내에 작성된 글이면, 새싹이 나타난다.
				let today = new Date();   
				if (getCurrentTime(7) <= data[key].created_at.toString())
				{
					tag_title += func_defineInputHtml_span("red", '&nbsp;<b><i class="fa-solid fa-seedling"></i></b>', fontSize)
				}
				
				tag_footer = '</h5></a>'
				tag_footer += '</a>'
				
				
				tag_sub_header = '<div class="realtime-country-ctn realtime-ltd-mg">'
				
				// 작성자 닉네임, 작성 시간
				msg_username = '<i class="' + data[key].user_icon.icon.toString() + '"></i>&nbsp;&nbsp;<b>' + data[key].username.toString() + '</b>'
				msg_time = '<i class="fa-solid fa-clock"></i>&nbsp;&nbsp;' + data[key].created_at.toString().substr(0, 10)
				tag_sub_info = '<div class="realtime-ctn-bw">'
				tag_sub_info += func_defineInputHtml_sub_realtime_bw(func_defineInputHtml_span(data[key].user_icon.color.toString(), msg_username, fontSize_small))
				tag_sub_info += func_defineInputHtml_sub_realtime_bw(func_defineInputHtml_span("DarkGreen", msg_time, fontSize_small))
				tag_sub_info += '</div>'
				tag_sub_info += '</div>'
				
				footer = '</td>'
				footer += '</tr>';	
				
				const temp = $(header + tag_tag + tag_title + tag_footer + tag_sub_header + tag_sub_info + footer)
				tTable.row.add(temp).draw();
			}
			
			$("#showTable_" + tableName).show()
			$("#loadTable_" + tableName).hide()
		}
	})
	
	$('#' + tableName).DataTable( {
		"ordering": false,
		"responsive": true,
		"autoWidth": true,
		"paging": false,
		"lengthChange": false,
		"searching": false,
		"pageLength": 3,
		columnDefs: [
			{	targets: 0,	className: 'dt-body-left'	}
		],
		"oLanguage": { "sInfo" : "" },
		"language": { "lengthMenu": "" }
	});
}