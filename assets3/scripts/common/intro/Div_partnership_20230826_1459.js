function Div_partnership() {
	function Div_partner(props) {
		return (
			<div class="items-center bg-gray-50 flex">
				<div class="p-4 text-center">
					<a href={props.url} target="_blank">
						<img class="w-full rounded-lg" src={props.url_image} alt={props.name} />
					</a>
					<h3 class="text-lg font-bold tracking-tight text-gray-900 mt-4">
						<a href={props.url} target="_blank">{props.name}</a>
					</h3>
					<p class="mt-3 mb-4 font-light text-sm text-gray-500">
						{props.content}
					</p>
				</div>
			</div>                    
		)
	}

	return (
		<section class="bg-white">
			<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-6">
				<Div_sub_header title="파트너십" content="통계마당과 함께 미래를 만들어가는 파트너들이에요." />
		
				<div class="grid gap-8 mb-6 lg:grid-cols-5 md:grid-cols-2 sm:grid-cols-1">
					<Div_partner name="(주)KB국민카드" content="데이터 비즈(Data Biz) 파트너 계약"
								 url="https://card.kbcard.com/"
								 url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/partnership/kbkookmincard.jpg" />

					<Div_partner name="슬기로운 통계생활" content="사업 협력 계약"
								 url="https://statisticsplaybook.com/"
								 url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/partnership/statisticsplaybook.jpg" />

					<Div_partner name="(주)인사이트마이닝" content="공동 연구, 정보와 자료 교환, 장비와 인력 교류 등을 통한 업무 협약"
								 url="http://insightmining.co.kr/"
								 url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/partnership/insightmining.jpg" />

					<Div_partner name="(사)AI프렌즈학회" content="기업 회원, 공동 세미나 진행"
								 url="https://aifrenz.notion.site/"
								 url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/partnership/aifrenz.jpg" />

					<Div_partner name="(주)LG CNS" content="Data lake 포털 구축 등"
								 url="https://www.lgcns.com/"
								 url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/partnership/LGCNS.jpg" />

					<Div_partner name="이그나이트" content="Chief Technology Officer 참여 등"
								 url="https://www.ignite-artist.com/"
								 url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/partnership/ignite-artist.jpg" />

					<Div_partner name="Korean International Statistical Society" content="2023 KISS Summer School 시행사"
								 url="https://statkiss.org/"
								 url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/partnership/kiss.jpg" />

					<Div_partner name="Korea Startup Forum" content="코리아 스타트업 포럼 멘토단"
								 url="https://kstartupforum.org/"
								 url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/partnership/koreastartupforum.jpg" />

					<Div_partner name="경북대학교 컴퓨터학부" content="경북대 온라인 현장실습 멘토링"
								 url="https://computer.knu.ac.kr/"
								 url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/partnership/knuit.jpg" />

					<Div_partner name="(주)워니프레임" content="공동 플랫폼 제작을 위한 업무 협약"
								 url="http://wonyframe.com/"
								 url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/partnership/wonyframe.jpg" />

					<Div_partner name="세종과학예술영재학교" content="교육통계분석 서비스 공동 개발"
								 url="https://sasa.sjeduhs.kr/"
								 url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/partnership/sasa.jpg" />

					<Div_partner name="소셜러스(주)" content="주식 양수 계약"
								 url="https://socialerus.com/"
								 url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/partnership/socialerus.jpg" />
				</div>
			</div>
		  </section>
	)
}
