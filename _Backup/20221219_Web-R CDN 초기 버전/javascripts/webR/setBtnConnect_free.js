function setBtnConnect() {
	$.ajax({
		url : "/get_user_info/",
		success:function(data){		
			if (data.group_info.uuid.toString() != "961f0790-d788-11ec-9d64-0242ac120002")
			{
				replaceBtn("btnConnect01", "btn notika-btn-indigo btn-reco-mg btn-button-mg", "9e4829e0-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect02", "btn notika-btn-indigo btn-reco-mg btn-button-mg", "9e482b8e-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect03", "btn notika-btn-indigo btn-reco-mg btn-button-mg", "9e482e18-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect04", "btn notika-btn-indigo btn-reco-mg btn-button-mg", "9e482f08-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect05", "btn notika-btn-indigo btn-reco-mg btn-button-mg", "9e482fee-f0a8-11ec-8ea0-0242ac120002")
				replaceBtn("btnConnect06", "btn notika-btn-indigo btn-reco-mg btn-button-mg", "9e4830ca-f0a8-11ec-8ea0-0242ac120002")
			}
		}
	})
}