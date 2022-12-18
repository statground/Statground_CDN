function ajax_readArticleComments(inputURL, requestUUID)
{
	url = "/" + inputURL + "/?requestUUID=" + requestUUID
	
	$.ajax({
		url : url,
		success:function(data){
			console.log(data)
			$("#commentList").append(data.comments.toString())
		}
	})
}