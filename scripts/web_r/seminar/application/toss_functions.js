var successURL = "/seminar/application/success/"
var failedURL = "/seminar/application/failed/"

function func_billing_card(clientKey, orderID, username) {
	var tossPayments = TossPayments(clientKey)
	
	tossPayments.requestPayment('카드', {
		// 결제 정보 파라미터
		amount: 150000,
		orderId: orderID,
		orderName: '[Web-R] R을 이용한 생존분석 워크샵 수강료',
		customerName: username,
		successUrl: successURL + "card/",
		failUrl: failURL
	})
}

function func_billing_va(clientKey, orderID, username) {
	var tossPayments = TossPayments(clientKey)
	
	tossPayments.requestPayment('가상계좌', {
		// 결제 정보 파라미터
		amount: 150000,
		orderId: orderID,
		orderName: '[Web-R] R을 이용한 생존분석 워크샵 수강료',
		customerName: username,
		successUrl: successURL + "va/",
		failUrl: failURL,
		validHours: 24,
		cashReceipt: {type: '소득공제',},
	})
}

function func_billing_account(clientKey, orderID, username) {
	var tossPayments = TossPayments(clientKey)
	
	tossPayments.requestPayment('계좌이체', {
		// 결제 정보 파라미터
		amount: 150000,
		orderId: orderID,
		orderName: '[Web-R] R을 이용한 생존분석 워크샵 수강료',
		customerName: username,
		successUrl: successURL + "account/",
		failUrl: failURL
	})
}

function func_billing_mobile(clientKey, orderID, username) {
	var tossPayments = TossPayments(clientKey)
	
	tossPayments.requestPayment('휴대폰', {
		// 결제 정보 파라미터
		amount: 150000,
		orderId: orderID,
		orderName: '[Web-R] R을 이용한 생존분석 워크샵 수강료',
		customerName: username,
		successUrl: successURL + "mobile/",
		failUrl: failURL
	})
}

function func_billing_voucher(clientKey, orderID, username) {
	var tossPayments = TossPayments(clientKey)
	
	tossPayments.requestPayment('도서문화상품권', {
		// 결제 정보 파라미터
		amount: 150000,
		orderId: orderID,
		orderName: '[Web-R] R을 이용한 생존분석 워크샵 수강료',
		customerName: username,
		successUrl: successURL + "voucher/",
		failUrl: failURL
	})
}