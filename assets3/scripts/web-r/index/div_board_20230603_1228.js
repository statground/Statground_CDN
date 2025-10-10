async function Div_board(){            
	function Col(props) {

		const articleList = Object.keys(props.data).map((article) =>
			<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
				<td class="px-6 py-4">
					<a href={props.data[article].board_url} target="_blank">
						<h6 class="font-1 mb-0 font-bold">
							{props.data[article].title}
							{
								props.data[article].tag_new == 1
								? <span class="text-yellow-500 text-sm ml-2 animate-pulse"><i class="fa-solid fa-splotch"></i></span>
								: ""
							}

							{
								props.data[article].status == "SECRET"
								? <span class="text-red-500 text-sm ml-2 animate-pulse"><i class="fa-solid fa-lock"></i></span>
								: ""
							}
						</h6>
					</a>
					{
						props.data[article].nick_name == "맛있는호랑이" || props.data[article].nick_name == "cardiomoon"
						?   <span class="bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
								<i class="fa-solid fa-user mr-1"></i>{props.data[article].nick_name}
							</span>
						:   <span class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
								<i class="fa-solid fa-user mr-1"></i>{props.data[article].nick_name}
							</span>
					}

					<span class="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
						<i class="fa-regular fa-calendar-days mr-1"></i>{props.data[article].regdate}
					</span>
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