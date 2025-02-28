function Div_sub_header(props) {
	return (
		<div class="mx-auto mb-8 max-w-screen-sm lg:mb-16">
			<h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900">{props.title}</h2>
			<p class="font-light text-gray-500 sm:text-xl dark:text-gray-400">{props.content}</p>
		</div> 
	)
}