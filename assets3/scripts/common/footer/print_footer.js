function print_footer(footer_menu = true) {
	function Div_footer() {
		return (
			<div class="w-full">
				<div class="sm:flex sm:items-center sm:justify-between mx-auto">
					<Div_footer_address />
					{footer_menu == true
					? <Div_sub_menu />
					: ""}
				</div>
		
				<hr class="my-6 border-gray-200 sm:mx-auto lg:my-8" />
				
				<Div_footer_icons />
			</div>
		)
	}

	ReactDOM.render(<Div_footer />, document.getElementById("div_footer"))
}