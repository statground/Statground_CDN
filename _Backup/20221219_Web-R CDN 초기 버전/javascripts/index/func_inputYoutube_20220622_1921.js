function func_inputYoutube(channelUUID) {
	var url = "/get_index_youtube/?uuid=" + channelUUID + "&videoCount=1"
	
	$.ajax({
		url : url,
		success:function(data){
		
			for(key in data){
				$("#index_youtube").html("")
				
				html = ""
				
				html += '<div class="blog-img">'
				
				html += '<center>'
				html += '<a class="thumb-image" href="' + data[key].url + '" target="_blank">'
				html += '<img src="' + data[key].url_thumbnail + '" alt="" width="75%"/>'
				html += '</a>'
				html += '</center>'
				
				html += '</div>'
				
				
				html += '<div class="blog-ctn">'
				
				html += '<div class="blog-hd-sw">'
				html += '<center>'
				html += '<a class="thumb-image" href="' + data[key].url + '" target="_blank">'
				html += '<h2>' + data[key].title + '</h2>'
				html += '</a>'
				html += '</center>'
				html += '</div>'

				html += '</div>'
				
				$("#index_youtube").append(html)
			}
		}
	})
}