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
			
			
			/********** 상세 정보 **********/
			// 이름
			html = '<p>'
			if (("details" in data) && (!isEmpty(data.details.name)))	{	html += data.details.name.toString();	}
			else {	html += "-";	}
			$("#details_name").html("")
			$("#details_name").append(html)
			
			// 생년월일
			html = '<p>'
			if (("details" in data) && (!isEmpty(data.details.birthday)) && (data.details.birthday != "0"))	{	html += data.details.birthday.toString();	}
			else {	html += "-";	}
			$("#details_birthday").html("")
			$("#details_birthday").append(html)
			
			// 블로그
			html = '<p>'
			if (("details" in data) && (!isEmpty(data.details.blog)))
			{
				blog = data.blog.homepage.toString()
				html += '<a href="' + blog + '" target="_blank">' + blog + '</a>'
			} else {	html += "-";	}
			html += '</p>'
			$("#details_blog").html("")
			$("#details_blog").append(html)
			
			// 홈페이지
			html = '<p>'
			if (("details" in data) && (!isEmpty(data.details.homepage)))
			{
				homepage = data.details.homepage.toString()
				html += '<p><a href="' + homepage + '" target="_blank">' + homepage + '</a></p>'
			} else {	html += "-";	}
			html += '</p>'
			$("#details_homepage").html("")
			$("#details_homepage").append(html)
		}
	})
}