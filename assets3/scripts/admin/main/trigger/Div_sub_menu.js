function Div_sub_menu(props) {
	return (
		<li class="py-2 hover:underline hover:decoration-orange-600 hover:decoration-wavy">
			<div class="flex items-center space-x-4 cursor-pointer" onClick={() => location.href='/main/trigger/' + props.name}>
				<img src={props.svg} class="w-4 h-4" />
				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-gray-900 truncate ..">
						{props.name}
					</p>
				</div>
				<img src="https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/right_vector.svg" class="w-4 h-4" />
			</div>
		</li>
	)
}