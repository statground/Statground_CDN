function setSignInHeader() {
	$.ajax({
		url : "/get_user_info/",
		success:function(data){		
			$(".trigger_index_userinfo_role").remove()
			$("#trigger_userinfo_role").remove()
			$("#userinfo_role").html("")
			$("#index_userinfo_role").html("")
			
			// Variables
			groupName = data.group_info.group_name.toString()
			expiredAt = "영구 적용"
			if (data.info_WebR.expired_at.toString() != "None") { expiredAt = data.info_WebR.expired_at.toString() }
			
			
			// 계정 등급
			html = groupName + " 계정입니다.<br/>"
			
			// 만료일
			html += "<span style='color:MediumBlue; font-size:small;'>"
			html += "만료일: " + expiredAt
			html += "</span>"
			
			$("#userinfo_role").append(html)
			
			if (data.group_info.uuid.toString() == "961f0790-d788-11ec-9d64-0242ac120002")
			{
				$("#myInfo_nonauthorized").show()
			}
			
			html = "<b>회원 등급:</b> " + groupName + "<br/>"
			html += "<span style='color:MediumBlue; font-size:small;'>"
			html += "<b>만료일:</b> " + expiredAt
			html += "</span>"
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