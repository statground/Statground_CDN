function submitModiCmt(inputID)
{
	var str = $("#comment_" + inputID).val();
	str = str.replace(/(?:\r\n|\r|\n)/g, '<br />');
	$("#comModi_content").val(str);
	$("#comModi_commentUUID").val(inputID)
	$("#formCommentModification").submit()
}