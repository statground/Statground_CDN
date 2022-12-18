function ajax_modificationArticle(inputURL, requestUUID)
{
	url = "/" + inputURL + "/?requestUUID=" + requestUUID + "&readType=modification"
	
	$.ajax({
		url : url,
		success:function(data){
			// 제목
			$('[name="title"]').val(data.title.toString())
			
			// 첨부 파일
			if (("attached_file" in data) && (!isEmpty(data.attached_file)))
			{
				html = '<i class="fa-solid fa-paperclip"></i> <b>첨부 파일:</b>&nbsp;&nbsp;'
				html += '<span style="color:red"><b>' + data.attached_file.toString() + '</b></span>'
				html += '<input type="checkbox" id="deleteFile" name="deleteFile" value="1"> 파일을 삭제하려면 체크하세요.</input>'
				$("#attachedFile").append(html)
			}
			
			// 비밀글 전환
			if (data.active == 2)
			{
				$("input:checkbox[id='secretArticle']").prop("checked", true);
			}
			
		}
	})
}