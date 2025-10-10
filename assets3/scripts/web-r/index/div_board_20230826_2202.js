async function Div_board(){            
	function Col(props) {

		const articleList = Object.keys(props.data).map((article) =>
			<tr class="bg-white border-b">
				<td class="px-6 py-4">
					<a href={props.data[article].board_url} target="_blank" class="flex flex-row items-center mb-1">
						<h2 class="font-1 mb-0 font-bold text-sm w-fit max-w-8/12 truncate ...
								   hover:underline hover:decoration-gray-600 hover:decoration-wavy">
							{props.data[article].title}
						</h2>
						{
							props.data[article].tag_new == 1
							? <span class="text-red-500 text-sm ml-2 animate-pulse">
								<img src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/new.svg" class="w-6 h-6" />
							  </span>
							: ""
						}

						{
							props.data[article].status == "SECRET"
							? <span class="text-red-500 text-sm ml-2 animate-pulse">
								<img src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/secret.svg" class="w-4 h-4" />
							  </span>
							: ""
						}
					</a>
					<div class="flex flex-row">
						{
							props.data[article].nick_name == "맛있는호랑이" || props.data[article].nick_name == "cardiomoon"
							?   <span class="flex flex-row w-fit bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
									<img src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/board_user.svg" class="w-4 h-4 mr-1" />
									{props.data[article].nick_name}
								</span>
							:   <span class="flex flex-row w-fit bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
								<img src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/board_user.svg" class="w-4 h-4 mr-1" />
									{props.data[article].nick_name}
								</span>
						}
	
						<span class="flex flex-row w-fit bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
							<img src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/board_calendar.svg" class="w-4 h-4 mr-1" />
							{props.data[article].regdate}
						</span>
					</div>
				</td>
			</tr>
		)

		return (
			<div class="lg:col-span-4 md:col-span-12 mx-4 pb-8 justify-center text-center content-center">
				<h5 class="mb-2 text-xl pb-4 font-bold tracking-tight text-gray-900 dark:text-white">
					{props.title}
				</h5>
				<table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
					<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
						<tr></tr>
					</thead>
					<tbody>
						{articleList}
					</tbody>
				</table>
			</div>
		)
	}

	function Result(props) {
		return (
			<div class="container mx-auto">
				<div class="grid lg:grid-cols-12 md:grid-cols-1 mx-auto">
					<Col title="자유게시판" data={props.data.free} />
					<Col title="가입인사 / 방명록" data={props.data.guestbook} />
					<Col title="공지사항" data={props.data.notice} />
					<Col title="책 게시판" data={props.data.book} />
					<Col title="워크샵 게시판" data={props.data.workshop} />
					<Col title="유튜브 강의 게시판" data={props.data.youtube} />
				</div>
			</div>
		)
	}

	const data = await fetch("/ajax_index_board")
						.then(res=> { return res.json(); })
						.then(res=> { return res; });

	ReactDOM.render(<Result data={data} />, document.getElementById("div_board"));
}

Div_board()