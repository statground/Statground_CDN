function setBtnConnect() {
	$.ajax({
		url : "/get_user_info/",
		success:function(data){		
			colorTag = "btn notika-btn-indigo btn-reco-mg btn-button-mg"
			
			if (data.group_info.uuid.toString() != "961f0790-d788-11ec-9d64-0242ac120002")
			{
				replaceBtn("btnConnect01", colorTag, "9e4829e0-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect02", colorTag, "9e482b8e-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect03", colorTag, "9e482e18-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect04", colorTag, "9e482f08-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect05", colorTag, "9e482fee-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect06", colorTag, "9e4830ca-f0a8-11ec-8ea0-0242ac120002")
			}
			else
			{	
				rejectMsg = "이메일 인증이 필요합니다."
				replaceBtn_reject("btnConnect01", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect02", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect03", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect04", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect05", colorTag, rejectMsg)
				replaceBtn_reject("btnConnect06", colorTag, rejectMsg)
			}
		}
	})
}