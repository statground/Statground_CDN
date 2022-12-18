function submitCmtOfCmt(inputID)
{
	var str = $("#comOfCom_" + inputID).val();
	str = str.replace(/(?:\r\n|\r|\n)/g, '<br />');
	$("#cmtOfCmt_content").val(str);
	$("#cmtOfCmt_parentUUID").val(inputID)
	$("#formCommentOfComment").submit()
}