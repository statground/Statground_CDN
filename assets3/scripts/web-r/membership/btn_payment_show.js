function btn_payment_show(mode, email) {
	let button_1 = document.getElementById("div_buttons_default_1")
	let button_2 = document.getElementById("div_buttons_default_2")
	let button_3 = document.getElementById("div_buttons_default_3")

	function Div_button_paymnets_clear(props) {
		return ("")
	}

	function Div_button_paymnets(props) {
		return (
			<div>
				<button type="button" id="button_card" name="button_card" 
						class="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 w-full"
						onClick={() => request_order_id(props.product_id, "13381046-8486-11ed-a1eb-0242ac120002", "card", props.email)}
						>
					카드 결제
				</button>
				<button type="button" id="button_va" name="button_va" 
						class="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 w-full"
						onClick={() => request_order_id(props.product_id, "13381046-8486-11ed-a1eb-0242ac120002", "va", props.email)}
						>
					가상계좌 결제
				</button>
				<button type="button" id="button_account" name="button_account" 
						class="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 w-full"
						onClick={() => request_order_id(props.product_id, "13381046-8486-11ed-a1eb-0242ac120002", "account", props.email)}
						>
					계좌 이체
				</button>
			</div>
		)
	}

	const defaultClassName = "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 w-full"

	let product_id = "e2a47288-7384-11ed-a1eb-0242ac120002"
	let price = 100000

	if (mode == "1") {
		button_1.className = defaultClassName + " hidden"
		button_2.className = defaultClassName
		button_3.className = defaultClassName

		ReactDOM.render(<Div_button_paymnets product_id={product_id} price={price}/>, document.getElementById("div_buttons_payment_1"))
		ReactDOM.render(<Div_button_paymnets_clear />, document.getElementById("div_buttons_payment_2"))
		ReactDOM.render(<Div_button_paymnets_clear />, document.getElementById("div_buttons_payment_3"))

	} else if (mode == "2") {
		product_id = "f24deb88-7384-11ed-a1eb-0242ac120002"
		price = 1000000
		button_1.className = defaultClassName
		button_2.className = defaultClassName + " hidden"
		button_3.className = defaultClassName

		ReactDOM.render(<Div_button_paymnets_clear />, document.getElementById("div_buttons_payment_1"))
		ReactDOM.render(<Div_button_paymnets product_id={product_id} price={price}/>, document.getElementById("div_buttons_payment_2"))
		ReactDOM.render(<Div_button_paymnets_clear />, document.getElementById("div_buttons_payment_3"))
	} else if (mode == "3") {
		product_id = "247d7ba0-7385-11ed-a1eb-0242ac120002"
		price = 2000000
		button_1.className = defaultClassName
		button_2.className = defaultClassName
		button_3.className = defaultClassName + " hidden"

		ReactDOM.render(<Div_button_paymnets_clear />, document.getElementById("div_buttons_payment_1"))
		ReactDOM.render(<Div_button_paymnets_clear />, document.getElementById("div_buttons_payment_2"))
		ReactDOM.render(<Div_button_paymnets product_id={product_id} price={price}/>, document.getElementById("div_buttons_payment_3"))
	}
}