function setBtnWrite(locURL) {
	$.ajax({
		url : "/get_user_info/",
		success:function(data){		
			if ((data.group_info.uuid.toString() == "d0423ce2-ec93-11ec-8ea0-0242ac120002") ||  // 개발자
				(data.group_info.uuid.toString() == "426dc228-d727-11ec-9d64-0242ac120002") // 관리그룹
				)
			{
				$("#btnWrite").html("")
				
				html = '<button class="btn notika-btn-green btn-reco-mg btn-button-mg" id="btnWrite" name="btnWrite" onclick="location.href=\'/' + locURL + '/write/\'">'
				html += '<span style="color:white">글쓰기</span>'
				html += '</button>'
				$("#btnWrite").html(html)
			}
		}
	})
}