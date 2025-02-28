function Div_main() {
	function Div_header() {
		return (
			<div class="flex flex-col justify-center items-center w-full">
				<h1 class="mb-4 text-3xl font-extrabold text-gray-900 md:text-2xl">
					<span class="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">국내 최대의 데이터 커뮤니티</span>
				</h1>
				<h1 class="mb-4 text-6xl font-extrabold text-gray-900 md:text-3xl">
					<span>통계마당</span>
				</h1>
			</div>
		)
	}

	function Div_sub_header(props) {
		return (
			<div class="mx-auto mb-8 max-w-screen-sm lg:mb-16">
				<h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900">{props.title}</h2>
				<p class="font-light text-gray-500 sm:text-xl dark:text-gray-400">{props.content}</p>
			</div> 
		)
	}


	function Div_our_story() {
		return (
			<main class="pt-8 pb-16 lg:pt-16 lg:pb-24 bg-white">
				<div class="flex justify-between px-4 mx-auto max-w-full">
					<article class="p-4 mx-auto w-full format format-sm sm:format-base lg:format-lg format-blue">
						<blockquote class="text-2xl font-semibold text-gray-900">
							<svg aria-hidden="true" class="w-10 h-10 text-gray-400" viewBox="0 0 24 27" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" fill="currentColor"/>
							</svg>
							통계마당의 스토리
						</blockquote>
			
						<blockquote class="p-4 my-4 border-l-4 border-gray-300 bg-gray-50">
							<p class="text-xl font-medium leading-relaxed text-gray-900">
								IT 분야에는 다양한 커뮤니티가 있으며, 이것이 IT 분야의 발전을 선도하기도 합니다.
							</p>
						</blockquote>
			
						<p class="indent-2">
							IT 관련 커뮤니티가 많은 이유는 컴퓨터가 널리 사용되기 때문이며, 컴퓨터를 직접 다루기 때문에 커뮤니티에 대한 접근성이 좋기 때문입니다.
						</p>
						<p class="indent-2">
							컴퓨터는 각기 다른 분야에서 다양하게 사용되기 때문에, 컴퓨터를 사용하는 사람들이 서로 의견을 공유하고 정보를 교환하기 위해 커뮤니티를 만들기도 합니다. 컴퓨터를 사용하는 사람들은 새로운 기술과 도구에 대해 관심이 많기 때문에, 커뮤니티를 통해 새로운 정보를 얻거나 질문을 하기도 합니다.
						</p>
						<p class="indent-2">
							컴퓨터 관련 커뮤니티에서 활동하는 것은 학습에 도움이 될 수 있습니다.  커뮤니티에서 사람들이 서로 의견을 교환하고 다른 사람의 질문에 답변을 하는 과정을 통해 새로운 정보를 얻을 수 있고, 스스로 이해하지 못하는 내용을 질문하는 과정으로 이해력을 향상시킬 수 있습니다.
						</p>
			
						<br/>
			
						<blockquote class="p-4 my-4 border-l-4 border-gray-300 bg-gray-50">
							<p class="text-xl font-medium leading-relaxed text-gray-900 pt">
								통계 또한 다양한 분야에서 널리 사용됩니다. 그럼에도 불구하고, 파워풀한 커뮤니티가 부족합니다.
							</p>
						</blockquote>
			
						<p class="indent-2">
							통계 또한 다양한 분야에서 널리 사용됩니다. 그렇기 때문에, 통계를 사용하는 사람들이 서로 의견을 공유하고 정보를 교환할 수 있는 커뮤니티는 매우 유용할 수 있습니다. 통계를 공부하거나 사용하는 사람들은 커뮤니티를 통해 새로운 정보를 얻거나 질문을 할 수 있을 것입니다.
						</p>
						<p class="indent-2">
							그럼에도 불구하고, 파워풀한 커뮤니티가 부족합니다.
						</p>
						<br/>
						<p class="indent-2">
							통계와 관련된 커뮤니티가 없었던 것은 아닙니다. 그런데 다음과 같은 문제가 있었습니다.
						</p>
						<br/>
			
						<dl class="max-w-full text-gray-900 divide-y divide-gray-200">
							<div class="flex flex-col py-3">
								<dt class="font-semibold">포털 사이트의 카페 기반 커뮤니티들</dt>
								<dd class="indent-2">2010년대 전에는 카페가 유행하였고, 활성화된 곳이 많았습니다. 그러나 포털의 흥망이 곧 카페의 흥망으로 연결되어, 그 영향을 고스란히 받았습니다.</dd>
							</div>
							<div class="flex flex-col py-3">
								<dt class="font-semibold">커뮤니티 사이트 기반의 게시판들</dt>
								<dd class="indent-2">방법을 알고 나면 접근하기 쉬우나, 커뮤니티마다 성향이 있기 마련이고 그 영향에서 자유롭지 못하였습니다.</dd>
							</div>
							<div class="flex flex-col py-3">
								<dt class="font-semibold">SNS 기반의 그룹들</dt>
								<dd class="indent-2">카페 이후로 SNS가 인기를 끌고, 때마침 "빅데이터"라는 키워드가 유행하기 시작하면서 관련 그룹들이 속속 생기기 시작한 때가 있었습니다. 이들은 현재 대부분 죽은 그룹이 되었고, 다만 그 중에서 살아남은 그룹이 있습니다. 통계마당이 그 중 하나였습니다. 다만 이들도 과거 2015~2017년 즈음의 전성기 때 만큼의 활동량을 보이지 못하고 있는 실정입니다. 또한 그룹의 특성상 다양한 방향으로 확장하지 못하고 자신의 영역에 머물러 있다는 한계를 극복하지 못하고 있습니다.</dd>
							</div>
						</dl>
			
						<br/>
			
						<blockquote class="p-4 my-4 border-l-4 border-gray-300 bg-gray-50">
							<p class="text-xl font-medium leading-relaxed text-gray-900">
								커뮤니티는 단순히 소통의 창구만은 아닌, 정보가 순환되고 이를 기반으로 발전할 수 있는 원동력이 될 수 있습니다.
							</p>
						</blockquote>
			
						<p class="indent-2">
							한편, 통계마당 페이스북 그룹은, 한국의 통계 관련 커뮤니티 중에서는 가장 많은 멤버 수를 보유하게 되었습니다. 그러나 그 과정에서 다양한 위기 상황이 있었고, 이를 극복하는 과정에서 무언가 한계를 느끼고 특별한 원동력이 필요하다는 것을 실감하였습니다.<br/>
						</p>
						<p class="indent-2">
							이에, 통계와 관련된 정보의 순환 창구를 주도적으로 만들고, 이 과정에서의 기여에 대한 적극적인 보상을 구상하여, 최종적으로는 통계의 전반적인 발전을 도모하기 위해, 통계마당을 사업화하기로 하였습니다.<br/>
						</p>
						<p class="indent-2">
							통계마당은 통계학에 관련된 일련의 정보를 제공하는 사이트 또는 공간을 만드는 비전을 가지고 있습니다. 통계마당은 통계학에 관련된 일련의 정보, 자료, 코드 등을 제공하는 곳이기도 하면서, 통계학에 관심이 있는 사람들이 서로 정보를 공유하고 지식을 쌓을 수 있는 공간을 만드는 것을 목표로 하고 있습니다.<br/>
						</p>
						
					</article>
				</div>
			</main>
		)
	}


	function Div_people(props) {
		const people_list = Object.keys(props.data).map((btn_data) => 
			<div class="text-center text-gray-500">
				<img class="mx-auto mb-4 w-36 h-36 rounded-full" src={props.data[btn_data].url_image} alt={props.data[btn_data].name} />
				<h3 class="mb-1 text-2xl font-bold tracking-tight text-gray-900">
					<a href={props.data[btn_data].url_facebook} target="_blank">{props.data[btn_data].name}</a>
				</h3>
				<p>{props.data[btn_data].role}</p>
				<ul class="flex justify-center mt-4 space-x-4">
					<li>
						<a href={props.data[btn_data].url_facebook} class="text-[#39569c] hover:text-gray-900" target="_blank">
							<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
							</svg>
						</a>
					</li>
				</ul>
			</div>
		)

		return (
			<section class="bg-white">
				<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-6">
					<Div_sub_header title="만든 사람들" content="통계마당을 만든 사람들이에요." />
			
					<div class="grid gap-8 grid-cols-5 lg:gap-16 md:grid-cols-2">
						{people_list}
					</div>  
				</div>
			</section>
		)
	}


	function Div_partnership(props) {
		const partner_list = Object.keys(props.data).map((btn_data) => 
			<div class="items-center bg-gray-50 flex">
				<div class="p-4 text-center">
					<a href={props.data[btn_data].url_homepage} target="_blank">
						<img class="w-full rounded-lg" src={props.data[btn_data].url_image} alt={props.data[btn_data].name} />
					</a>
					<h3 class="text-lg font-bold tracking-tight text-gray-900 mt-4">
						<a href={props.data[btn_data].url} target="_blank">{props.data[btn_data].name}</a>
					</h3>
					<p class="mt-3 mb-4 font-light text-sm text-gray-500">
						{props.data[btn_data].role}
					</p>
				</div>
			</div>
		)
	
		return (
			<section class="bg-white">
				<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-6">
					<Div_sub_header title="파트너십" content="통계마당과 함께 미래를 만들어가는 파트너들이에요." />
			
					<div class="grid gap-8 grid-cols-6 mb-6 md:grid-cols-2">
						{partner_list}
					</div>
				</div>
			  </section>
		)
	}


	function Div_clients(props) {
		const client_list = Object.keys(props.data).map((btn_data) => 
			<div class="items-center bg-gray-50 flex">
				<div class="p-4 text-center">
					<img class="w-full rounded-lg" src={props.data[btn_data].url_image} alt={props.data[btn_data].name} />
					<h3 class="text-sm font-bold tracking-tight text-gray-900 mt-4">
						{props.data[btn_data].name}
					</h3>
				</div>
			</div>
		)
	
		return (
			<section class="bg-white">
				<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-6">
					<Div_sub_header title="클라이언트" content="통계마당의 서비스를 이용한 고객들이에요." />
			
					<div class="grid gap-8 grid-cols-6 mb-8 md:grid-cols-3">
						{client_list}
					</div>
				</div>
			  </section>
		)
	}


	return (
		<div class="container flex flex-col pt-12 pb-12 justify-center mx-auto">
			<Div_header />
			<Div_our_story />
			<Div_people data={data_people} />
			<Div_partnership data={data_partnership} />
			<Div_clients data={data_clients} />
		</div>
	)            
}