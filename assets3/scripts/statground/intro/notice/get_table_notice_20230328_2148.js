let toggle_table_all = 0
let toggle_table_news = 0
let toggle_table_patch = 0

async function get_table_notice(type){
	let res_data = null;
	
	if (type == "all" && toggle_table_all == 0) {
		const data = await fetch("/intro/ajax_get_intro_notice_table")
		.then(res=> { return res.json(); })
		.then(res=> { return res; });

		res_data = data.all
		
	} else if (type == "news" && toggle_table_news == 0) {
		const data = await fetch("/intro/ajax_get_intro_notice_table")
		.then(res=> { return res.json(); })
		.then(res=> { return res; });

		res_data = data.news
		
	} else if (type == "patch" && toggle_table_patch == 0) {
		const data = await fetch("/intro/ajax_get_intro_notice_table")
		.then(res=> { return res.json(); })
		.then(res=> { return res; });

		res_data = data.patch
	}

	let table_notice_options = {
		"ordering": false,
		"bDestroy": true,
		"searching": false,
		"scrollX": false,
		"scrollCollapse": false,
		"lengthChange": false,
		"pageLength": 5,
		columnDefs: [{"target":0, "className": "font-normal leading-normal text-sm w-full"}],
		"oLanguage": { "sInfo" : "_TOTAL_페이지 중 _START_ ~ _END_번째" },
		"language": { "lengthMenu": "페이지당 _MENU_ 개씩 보기" }
	}

	function Div_table(props)
	{
		const articleList = Object.keys(props.data).map((article) =>
			<tr class="w-full bg-white border-b">
				<td class="px-6 py-4 text-left">
					<a href={props.data[article].url}>
						<h6 class="font-1 mb-0 font-bold">
							{props.data[article].title}
						</h6>
					</a>
					<span class={props.data[article].span_css}>
						{props.data[article].category}
					</span>
					<span class="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
						{props.data[article].created_at}
					</span>
				</td>
			</tr>
		)

		return (
			<div class="w-full max-w-full">
				<div class="relative flex flex-col min-w-0 break-words bg-white border-0 shadow-soft-xl rounded-2xl bg-clip-border">
					<div class="table-responsive">
						<table id={props.id} class="text-sm text-left text-gray-500">
							<thead class="text-xs text-gray-700 uppercase bg-gray-100">
								<tr><th>{props.header}</th></tr>
							</thead>
							<tbody>
								{articleList}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		)
	}
	

	if (type == "all" && toggle_table_all == 0) {
		ReactDOM.render(<Div_table id="div_table_all" header="공지사항" data={res_data} />, document.getElementById("table_all"))
		$('#div_table_all').DataTable(table_notice_options);
		toggle_table_all = 1

	} else if (type == "news" && toggle_table_news == 0) {
		ReactDOM.render(<Div_table id="div_table_news" header="통계마당 소식" data={res_data} />, document.getElementById("table_news"))
		$('#div_table_news').DataTable(table_notice_options);
		toggle_table_news = 1
		
	} else if (type == "patch" && toggle_table_patch == 0) {
		ReactDOM.render(<Div_table id="div_table_patch" header="패치노트" data={res_data} />, document.getElementById("table_patch"))
		$('#div_table_patch').DataTable(table_notice_options);
		toggle_table_patch = 1
	}
}

get_table_notice("all")