function func_inputBook() {
	var url = "/get_index_book/?videoCount=1"
	
	$.ajax({
		url : url,
		success:function(data){
			console.log(data)
			for(key in data){
				$("#index_book").html("")
				
				html = ""
				
				html += '<div class="blog-img">'
				
				html += '<center>'
				html += '<a class="thumb-image" href="' + data[key].link + '" target="_blank">'
				html += '<img src="' + data[key].image + '" alt="" />'
				html += '</a>'
				html += '</center>'
				
				html += '</div>'
				
				
				html += '<div class="blog-ctn">'
				
				html += '<div class="blog-hd-sw">'
				html += '<center>'
				html += '<a class="thumb-image" href="' + data[key].link + '" target="_blank">'
				html += '<h2>' + data[key].title + '</h2>'
				html += '</a>'
				html += '</center>'
				html += '</div>'
				html += '<p>' + textLengthOverCut(data[key].description.toString(), 85) + '</p>'

				html += '</div>'
				
				$("#index_book").append(html)
			}
		}
	})
}