function ajax_modificationArticle(inputURL, requestUUID)
{
	url = "/" + inputURL + "/?requestUUID=" + requestUUID
	
	$.ajax({
		url : url,
		success:function(data){
			console.log(data)
			// 첨부 파일
			//$("#attachedFile").append(data.attached_file.toString())
		
			// 제목
			$('[name="title"]').val(data.title.toString())
			
			// 내용
			$('[name="content"]').val(data.content.toString())
		}
	})
}