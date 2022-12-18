function ajax_readArticle(inputURL, requestUUID)
{
	url = "/" + inputURL + "/?requestUUID=" + requestUUID
	
	$.ajax({
		url : url,
		success:function(data){
			$(".trigger_content").hide()
			
			// 버튼 목록
			$("#buttonList").append(data.button_list.toString())
		
			// 첨부 파일
			$("#attachedFile").append(data.attached_file.toString())
			
			// 댓글 입력 창
			$("#commentWriter").append(data.comment_writer.toString())
		
			// 제목
			title = data.title.toString()
			html = '<h2>' + title + '</h2>'
			$("#title").append(html)
			changeTitle(title)		// 메타 태그: 타이틀 변경
			
			// 작성자
			html = '<b>작성자: </b>' + data.user_name.toString()
			$("#username").append(html)
			
			// 작성 일시
			html = '<b>작성 일시:</b> ' + data.created_at.toString()
			$("#created_at").append(html)
			
			// 조회수
			html = "조회 수: " + data.details.readed_count.toString() + "건"
			$("#viewer_count").append(html)
			
			// 내용
			html = data.content.toString()
			$("#content").append(html)
		}
	})
}