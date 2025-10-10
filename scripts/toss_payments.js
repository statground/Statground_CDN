function func_billing_card(clientKey, orderID, orderName, amount, username, successURL, failedURL) {
	var tossPayments = TossPayments(clientKey)
	
	tossPayments.requestPayment('카드', {
		amount: amount, orderId: orderID, orderName: orderName, customerName: username,
		successUrl: successURL, failUrl: failedURL
	})
}

function func_billing_va(clientKey, orderID, orderName, amount, username, successURL, failedURL) {
	var tossPayments = TossPayments(clientKey)
	
	tossPayments.requestPayment('가상계좌', {
		amount: amount, orderId: orderID, orderName: orderName, customerName: username,
		successUrl: successURL, failUrl: failedURL,
		validHours: 24, cashReceipt: {type: '소득공제',},
	})
}

function func_billing_account(clientKey, orderID, orderName, amount, username, successURL, failedURL) {
	var tossPayments = TossPayments(clientKey)
	
	tossPayments.requestPayment('계좌이체', {
		amount: amount, orderId: orderID, orderName: orderName, customerName: username,
		successUrl: successURL, failUrl: failedURL
	})
}

function func_billing_mobile(clientKey, orderID, orderName, amount, username, successURL, failedURL) {
	var tossPayments = TossPayments(clientKey)
	
	tossPayments.requestPayment('휴대폰', {
		amount: amount, orderId: orderID, orderName: orderName, customerName: username,
		successUrl: successURL, failUrl: failedURL
	})
}

function func_billing_voucher(clientKey, orderID, orderName, amount, username, successURL, failedURL) {
	var tossPayments = TossPayments(clientKey)
	
	tossPayments.requestPayment('도서문화상품권', {
		amount: amount, orderId: orderID, orderName: orderName, customerName: username,
		successUrl: successURL, failUrl: failedURL
	})
}