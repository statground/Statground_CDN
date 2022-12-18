function getMyUserInfo() {
	$.ajax({
		url : "/get_user_info/",
		success:function(data){		

			// Variables
			groupName = data.group_info.group_name.toString()
			expiredAt = "영구 적용"
			if (data.info_WebR.expired_at.toString() != "None") { expiredAt = data.info_WebR.expired_at.toString() }
			
			$("#myuserinfo_role").html("")
			$("#myuserinfo_expiredat").html("")
			
			// 회원 등급
			html = '<h2>' + groupName + '</h2>'
			$("#myuserinfo_role").append(html)

			// 만료일
			html = '<h2>' + expiredAt + '</h2>'
			$("#myuserinfo_expiredat").append(html)
		}
	})
}
