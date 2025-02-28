async function Div_board(){            
	function Col(props) {
		let style_head = {'text-align':"center"}
		let style_title = {color:"black"}

		const articleList = Object.keys(props.data).map((article) =>
			<div class="row border-dashed-bottom border-color-8 py-2 align-items-center font-1">
				<div class="col">
					<a href={props.data[article].board_url} target="_blank">
						<h6 class="font-1 mb-0" style={style_title}>
							{props.data[article].title}
						</h6>
					</a>
				</div>
				<div class="col-4 text-right">
					<h6 class="font-1 mb-0" style={style_title}>{props.data[article].regdate}</h6>
				</div>
			</div>
		)
		return (
			<div class="col-lg-4 pb-3">
				<h5 class="mb-4 font-1" style={style_head}>{props.title}</h5>
				{articleList}
				<br/>
			</div>
		)
	}

	function Result(props) {
		console.log(props)
		return (
			<div class="row">
				<Col title="자유게시판" data={props.data.free} />
				<Col title="가입안사 / 방명록" data={props.data.guestbook} />
				<Col title="공지사항" data={props.data.notice} />
				<Col title="책 게시판" data={props.data.book} />
				<Col title="워크샵 게시판" data={props.data.workshop} />
				<Col title="유튜브 강의 게시판" data={props.data.youtube} />
			</div>
		)
	}

	const data = await fetch("/ajax_index_board")
						.then(res=> { return res.json(); })
						.then(res=> { return res; });

	ReactDOM.render(<Result data={data} />, document.getElementById("index_board"));
}

Div_board()