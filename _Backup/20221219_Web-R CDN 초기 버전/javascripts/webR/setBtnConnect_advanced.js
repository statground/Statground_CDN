function setBtnConnect() {
	$.ajax({
		url : "/get_user_info/",
		success:function(data){		
			colorTag = "btn notika-btn-deeporange btn-reco-mg btn-button-mg"
			
			if (data.group_info.uuid.toString() == "961f0790-d788-11ec-9d64-0242ac120002")
			{
				rejectMsg = "이메일 인증이 필요합니다."
				replaceBtn_reject("btnConnect01", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect02", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect03", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect04", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect05", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect06", colorTag, rejectMsg)
			}
			else if (data.group_info.uuid.toString() == "c20a20fe-ec93-11ec-8ea0-0242ac120002")
			{
				rejectMsg = "정회원 이상만 이용할 수 있습니다."
				replaceBtn_reject("btnConnect01", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect02", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect03", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect04", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect05", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect06", colorTag, rejectMsg)
			}
			else
			{	
				replaceBtn("btnConnect01", colorTag, "9e4831b0-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect02", colorTag, "9e483296-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect03", colorTag, "9e483372-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect04", colorTag, "9e483458-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect05", colorTag, "9e4836b0-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect06", colorTag, "9e4837b4-f0a8-11ec-8ea0-0242ac120002")
			}
		}
	})
}