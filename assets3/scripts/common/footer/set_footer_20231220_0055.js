function set_footer(service) {
	function Div_footer(props) {
		function Div_footer_address(props) {
			return (
				<div class="flex flex-col space-y-4">
					<p class="text-sm">
						통계마당의 모든 컨텐츠는 저작권법에 의거 보호받고 있습니다.
					</p>

					<div class="flex flex-col">
						<p class="text-sm">{data_footer.company}</p>
						<div class="flex flex-row md:flex-col">
							<p class="text-sm">{data_footer.representative}</p>
							{
								data_footer.administrator != null
								?   <p class="flex text-sm md:hidden">　|　{data_footer.administrator}</p>
								:   ""
							}
							{
								data_footer.administrator != null
								?   <p class="hidden text-sm md:flex md:visible">{data_footer.administrator}</p>
								:   ""
							}
						</div>
						<div class="flex flex-row md:flex-col">
							<p class="text-sm">{data_footer.registration_no}</p>
							<p class="flex text-sm md:hidden">　|　{data_footer.mail_order_no}</p>
							<p class="hidden text-sm md:flex md:visible">{data_footer.mail_order_no}</p>
						</div>
						<p class="text-sm">{data_footer.address}</p>
						<div class="flex flex-row md:flex-col">
							<p class="text-sm">{data_footer.phone}</p>
							<p class="flex text-sm md:hidden">　|　{data_footer.email}</p>
							<p class="hidden text-sm md:flex md:visible">{data_footer.email}</p>
						</div>
					</div>
				</div>
			)
		}

		function Div_footer_sub_menu(props) {
			let class_sub_menu = "mr-4 hover:underline hover:decoration-gray-900 hover:decoration-wavy md:mr-6"
			return (
				<ul class="flex flex-wrap items-center mb-6 text-center text-sm sm:mb-0 pt-8">
					<li>
						<a href="/intro/notice" class={class_sub_menu}>공지사항</a>
					</li>
					<li>
						<a href="/intro" class={class_sub_menu}>회사 소개</a>
					</li>
					<li>
						<a href="/intro/terms" class={class_sub_menu}>서비스 이용약관</a>
					</li>
					<li>
						<a href="/intro/privates" class={class_sub_menu}>개인정보 보호 방침</a>
					</li>
				</ul>
			)
		}

		function Div_footer_sub_menu_webr(props) {
			let class_sub_menu = "mr-4 hover:underline hover:decoration-gray-900 hover:decoration-wavy md:mr-6"
			return (
				<ul class="flex flex-wrap items-center mb-6 text-center text-sm sm:mb-0 pt-8">
					<li>
						<a href="https://web-r.org/notice" target="_blank" class={class_sub_menu}>공지사항</a>
					</li>
					<li>
						<a href="/intro" class={class_sub_menu}>회사 소개</a>
					</li>
					<li>
						<a href="https://web-r.org/foot_info" target="_blank" class={class_sub_menu}>서비스 이용약관</a>
					</li>
					<li>
						<a href="https://web-r.org/privates" target="_blank" class={class_sub_menu}>개인정보 보호 방침</a>
					</li>
				</ul>
			)
		}

		function Div_footer_icons(props) {
			function Div_sub_icon(props) {
				return (
					<a title={props.name} class="text-gray-500 hover:text-gray-900" href={props.url} target="_blank" alt={props.name}>
						<img src={props.url_icon} class="w-4 h-4" />
					</a>
				)
			}
			return (
				<div class="flex flex-row justify-center space-x-6 w-full">
					<Div_sub_icon name={"Facebook Group"}
								  url={"https://www.facebook.com/groups/statground"}
								  url_icon={"https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/footer_facebook_group.svg"} />
					<Div_sub_icon name={"Facebook Page"}
								  url={"https://www.facebook.com/Statground"}
								  url_icon={"https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/footer_facebook_page.svg"} />
					<Div_sub_icon name={"Twitter"}
								  url={"https://twitter.com/Statground1"}
								  url_icon={"https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/footer_twitter_x.svg"} />
					<Div_sub_icon name={"Instagram"}
								  url={"https://www.instagram.com/statground/"}
								  url_icon={"https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/footer_instagram.svg"} />
					<Div_sub_icon name={"LinkedIn"}
								  url={"https://www.linkedin.com/company/82371650/"}
								  url_icon={"https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/footer_linkedin.svg"} />
					<Div_sub_icon name={"Threads"}
								  url={"https://www.threads.net/@statground"}
								  url_icon={"https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/footer_threads.svg"} />
				</div>
			)
		}

		return (
			<div class="py-24 bg-white rounded-lg md:py-8 w-full">
				<div class="flex flex-row justify-between items-center md:flex-col">
					<Div_footer_address />
					{
						service == null
						?   <Div_footer_sub_menu />
						:   ""
					}
					{
						service == "webr"
						?   <Div_footer_sub_menu_webr />
						:   ""
					}
				</div>
		
				<hr class="my-6 border-gray-200 lg:my-8" />
				
				<div class="flex flex-row justify-center items-center w-full">
					<Div_footer_icons />
				</div>
			</div>
		)
	}

	ReactDOM.render(<Div_footer />, document.getElementById("div_footer"))
}