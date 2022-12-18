function func_statistics(inputURL, divName) {
	var url = inputURL
	
	$.ajax({
		url : url,
		success:function(data){
			$("#" + divName).html("")
			$("#" + divName).html(data.html.toString())
		}
	})
}