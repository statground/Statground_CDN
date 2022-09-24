function readDocs(docsUUID)
{
	url = "/get_page_docs_readArticle/?requestUUID=" + docsUUID

	$.ajax({
		url : url,
		success:function(data){
			// 제목
			title = data.title.toString()
			changeTitle(title)

			html = data.docs_content.toString()
			$("#docs_content").append(html)
		}
	})
}