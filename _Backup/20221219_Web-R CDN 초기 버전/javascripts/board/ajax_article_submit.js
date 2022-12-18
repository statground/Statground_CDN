function ajax_article_submit()
{
	if (isEmpty($("#title").val()))
	{
		alert("제목을 입력해주세요.")
	}
	else if (isEmpty($('[name="content"]').val()))
	{
		alert("내용을 입력해주세요.")
	}
	else
	{
		$("#formWriteSubmit").submit()
	}
}