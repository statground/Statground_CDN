function Div_people() {
	function Div_person(props) {
		return (
			<div class="text-center text-gray-500">
				<img class="mx-auto mb-4 w-36 h-36 rounded-full" src={props.url_profile} alt={props.name} />
				<h3 class="mb-1 text-2xl font-bold tracking-tight text-gray-900">
					<a href={props.url_facebook} target="_blank">{props.name}</a>
				</h3>
				<p>{props.role}</p>
				<ul class="flex justify-center mt-4 space-x-4">
					<li>
						<a href={props.url_facebook} class="text-[#39569c] hover:text-gray-900" target="_blank">
							<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
							</svg>
						</a>
					</li>
				</ul>
			</div>
		)
	}

	return (
		<section class="bg-white">
			<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-6">
				<Div_sub_header title="만든 사람들" content="통계마당을 만든 사람들이에요." />
		
				<div class="grid gap-8 lg:gap-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
		
					<Div_person name="Jae-seong Yoo" role="CEO"
								url_profile="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/admin/Yoo.jpg"
								url_facebook="https://www.facebook.com/JSYoo86" />

					<Div_person name="Jae-kwang Kim" role="Technical Advisor"
								url_profile="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/admin/Kim.jpg"
								url_facebook="https://www.facebook.com/profile.php?id=100013068106711" />
								
					<Div_person name="Seung-sik Hwang" role="Admin. of Community"
								url_profile="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/admin/Hwang.jpg"
								url_facebook="https://www.facebook.com/seungsik.hwang" />
								
					<Div_person name="Keon-Woong Moon" role="Admin. of Web-R"
								url_profile="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets/images/admin/Moon.jpg"
								url_facebook="https://www.facebook.com/cardiomoon" />
		
				</div>  
			</div>
		</section>
	)
}