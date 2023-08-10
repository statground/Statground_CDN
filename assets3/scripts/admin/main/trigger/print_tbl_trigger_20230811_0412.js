async function print_tbl_trigger(mode) {
	if (mode != "None") {
		const data_request = new FormData();
		data_request.append('mode', mode);

		let data = await fetch("/main/ajax_trigger_view_get_trigger/", {  method: "post", 
														headers: {"X-CSRFToken": getCookie("csrftoken")},
														body: data_request
													 })
						.then(res=> { return res.json(); })
						.then(res=> { return res; });

		grid_trigger = new tui.Grid(
			{
				el: document.getElementById('tbl_trigger'),
				data: Object.keys(data).map(function(element) {
					return data[element]
				}),
				rowHeaders: [ { type: 'rowNum', width: 100, align: 'left', valign: 'bottom', width: 'auto'} ],
				scrollX: false,
				scrollY: false,
				columns:  Object.keys(data['0']).map(function(element){
					return {header:element, 
							name:element, 
							editor: {type: 'text' },
							width: 'auto'
						}
				}),
				columnOptions: { resizable: true }
			}
		)

	} else {
		return false

	}
}