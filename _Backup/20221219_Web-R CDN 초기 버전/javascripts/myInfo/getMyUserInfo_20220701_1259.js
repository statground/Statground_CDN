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
			if (("details" in data) && (!isEmpty(data.details.name)))	
			{
				details_name = data.details.name.toString()
				html += details_name
				$("#details_name_modification").val(details_name)
			}
			else {	html += "-";	}
			$("#details_name").html("")
			$("#details_name").append(html)
			
			// 생년월일
			html = '<p>'
			if (("details" in data) && (!isEmpty(data.details.birthday)) && (data.details.birthday != "0"))	
			{
				details_birthday = data.details.birthday.toString()
				html += details_birthday
				$("#details_birthday_modification").val(details_birthday)
			}
			else {	html += "-";	}
			$("#details_birthday").html("")
			$("#details_birthday").append(html)
			
			// 블로그
			html = '<p>'
			if (("details" in data) && (!isEmpty(data.details.blog)))
			{
				details_blog = data.details.blog.toString()
				html += '<a href="' + details_blog + '" target="_blank">' + details_blog + '</a>'
				$("#details_blog_modification").val(details_blog)
			} else {	html += "-";	}
			html += '</p>'
			$("#details_blog").html("")
			$("#details_blog").append(html)
			
			// 홈페이지
			html = '<p>'
			if (("details" in data) && (!isEmpty(data.details.homepage)))
			{
				details_homepage = data.details.homepage.toString()
				html += '<p><a href="' + details_homepage + '" target="_blank">' + details_homepage + '</a></p>'
				$("#details_homepage_modification").val(details_homepage)
			} else {	html += "-";	}
			html += '</p>'
			$("#details_homepage").html("")
			$("#details_homepage").append(html)
			
			$('#btnModification').attr('disabled', false);
		}
	})
}
