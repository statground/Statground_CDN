function Div_clients() {
	function Div_client(props) {
		return (
			<div class="items-center bg-gray-50 flex">
				<div class="p-4 text-center">
					<img class="w-full rounded-lg" src={props.url_image} alt={props.name} />
					<h3 class="text-sm font-bold tracking-tight text-gray-900 mt-4">
						<a href={props.url} target="_blank">{props.name}</a>
					</h3>
				</div>
			</div>                    
		)
	}

	return (
		<section class="bg-white">
			<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-6">
				<Div_sub_header title="클라이언트" content="통계마당의 서비스를 이용한 고객들이에요." />
		
				<div class="grid gap-8 mb-8 lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-2">
					<Div_client name="(주)바이풀디자인"
								url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/client/by_fulldesign.jpg" />

					<Div_client name="한국환경연구원"
								url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/client/kei.jpg" />

					<Div_client name="고려대학교"
								url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/client/koreauniv.jpg" />

					<Div_client name="성신여자대학교"
								url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/client/sungshinuniv.jpg" />

					<Div_client name="단국대학교천안캠퍼스"
								url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/client/dankookuniv.jpg" />

					<Div_client name="한국에너지기술연구원"
								url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/client/kier.jpg" />

					<Div_client name="충북대학교"
								url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/client/chungbukuniv.jpg" />

					<Div_client name="양산부산대학교병원"
								url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/client/pnuyangsan.jpg" />

					<Div_client name="전남대학교병원"
								url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/client/chonnamunivhospital.jpg" />
								
					<Div_client name="나무인텔리전스(주)"
								url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/client/namu.jpg" />
								
					<Div_client name="서울특별시 광역치매센터"
								url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/client/seoulnid.jpg" />
								
					<Div_client name="서울아산병원"
								url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/client/asan.jpg" />
								
					<Div_client name="조선대학교"
								url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/client/chosun2.jpg" />
								
					<Div_client name="JK통계컨설팅"
								url_image="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/client/jk.jpg" />
				</div>
			</div>
		  </section>
	)
}