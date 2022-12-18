function getStatistics()
{
	function generateTr(title, value, notAuth = null)
	{
		header = '<tr>'
		header += '<td>'
		
		tag_content = "<b>" + title + "</b>" + ": " + value.toString() + "명"
		if (notAuth != null) 
		{	
			tag_content += "<br/>(<span style='color:blue'>인증: " + (value - notAuth).toString() + "명</span>"
			tag_content += " / "
			tag_content += "<span style='color:red'>미인증: " + notAuth.toString() + "명</span>)"
		}
		
		footer = '</td>'
		footer += '</tr>';	
		
		const temp = $([header, 
								tag_content, 
								footer].join(""))
		return temp
	}

	$.ajax({
		url : "/get_list_board_member_count/",
		success:function(data){
			var tTable = $('#table_board_member_statistics').DataTable();
			tTable.row.add(generateTr("총 멤버 수", data.total, null)).draw();
			tTable.row.add(generateTr("관리자", data.countMember_all.admin, null)).draw();
			tTable.row.add(generateTr("VIP회원", data.countMember_all.vip, data.countMember_notAuth.vip)).draw();
			tTable.row.add(generateTr("정회원", data.countMember_all.regular, data.countMember_notAuth.regular)).draw();
			tTable.row.add(generateTr("준회원", data.countMember_all.associate, data.countMember_notAuth.associate)).draw();
		}
	})
	
	$('#table_board_member_statistics').DataTable( {
		"ordering": false,
		"responsive": true,
		"autoWidth": true,
		"paging": false,
		"lengthChange": false,
		"searching": false,
		"pageLength": 3,
		columnDefs: [
			{	targets: 0,	className: 'dt-body-left'	}
		],
		"oLanguage": { "sInfo" : "" },
		"language": { "lengthMenu": "" }
	});
}