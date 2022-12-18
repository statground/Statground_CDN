function setBtnConnect() {
	$.ajax({
		url : "/get_user_info/",
		success:function(data){		
			colorTag = "btn notika-btn-blue"
			
			if (data.group_info.uuid.toString() != "961f0790-d788-11ec-9d64-0242ac120002")
			{
				replaceBtn("btnConnect01", colorTag, "fa-solid fa-credit-card", "카드 결제", "9e4829e0-f0a8-11ec-8ea0-0242ac120002")
			}
			else
			{	
				rejectMsg = "이메일 인증이 필요합니다."
				replaceBtn_reject("btnConnect01", colorTag, rejectMsg)
			}
		}
	})
}