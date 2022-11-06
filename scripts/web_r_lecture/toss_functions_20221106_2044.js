function func_billing_card(orderID, username, successURL, failURL) {
	tossPayments.requestPayment('카드', {
		// 결제 정보 파라미터
		amount: 150000,
		orderId: orderID,
		orderName: '[Web-R] R을 이용한 생존분석 워크샵 수강료',
		customerName: username,
		successUrl: successURL,
		failUrl: failURL
	})
}

function func_billing_va(orderID, username, successURL, failURL) {
	tossPayments.requestPayment('가상계좌', {
		// 결제 정보 파라미터
		amount: 150000,
		orderId: orderID,
		orderName: '[Web-R] R을 이용한 생존분석 워크샵 수강료',
		customerName: username,
		successUrl: successURL,
		failUrl: failURL,
		validHours: 24,
		cashReceipt: {type: '소득공제',},
	})
}

function func_billing_account(orderID, username, successURL, failURL) {
	tossPayments.requestPayment('계좌이체', {
		// 결제 정보 파라미터
		amount: 150000,
		orderId: orderID,
		orderName: '[Web-R] R을 이용한 생존분석 워크샵 수강료',
		customerName: username,
		successUrl: successURL,
		failUrl: failURL
	})
}

function func_billing_mobile(orderID, username, successURL, failURL) {
	tossPayments.requestPayment('휴대폰', {
		// 결제 정보 파라미터
		amount: 150000,
		orderId: orderID,
		orderName: '[Web-R] R을 이용한 생존분석 워크샵 수강료',
		customerName: username,
		successUrl: successURL,
		failUrl: failURL
	})
}

function func_billing_voucher(orderID, username, successURL, failURL) {
	tossPayments.requestPayment('도서문화상품권', {
		// 결제 정보 파라미터
		amount: 150000,
		orderId: orderID,
		orderName: '[Web-R] R을 이용한 생존분석 워크샵 수강료',
		customerName: username,
		successUrl: successURL,
		failUrl: failURL
	})
}