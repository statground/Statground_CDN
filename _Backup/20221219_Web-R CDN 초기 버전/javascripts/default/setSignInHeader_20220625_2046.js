function setSignInHeader() {
	$.ajax({
		url : "/get_user_info/",
		success:function(data){		
			$("#userinfo_role").html("")
			$("#index_userinfo_role").html("")
			
			// 계정 등급
			html = data.group_info.group_name.toString() + " 계정입니다.<br/>"
			
			// 만료일
			expiredAt = data.info_WebR.expired_at
			html += "<span style='color:MediumBlue'>"
			if (expiredAt == "None")
			{
				html += "만료일: 영구 적용"
			} else {
				html += "만료일: " + expiredAt.toString()
			}
			html += "</span>"
			
			$("#userinfo_role").append(html)
			
			if (data.group_info.uuid.toString() == "961f0790-d788-11ec-9d64-0242ac120002")
			{
				$("#myInfo_nonauthorized").show()
			}
			
			html = "<b>회원 등급:</b> " + data.group_info.group_name.toString()
			$("#index_userinfo_role").append(html)

			if ("is_admin" in data.group_info || "is_staff" in data.group_info )
			{
				 if (data.group_info.is_admin > 0 || data.group_info.is_staff > 0)
				{
					$("#notification_operation").show()
				}
			}
		}
	})
}