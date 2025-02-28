function btn_payment_show(productNum)
{
	$("#div_buttons_payment_1").hide(); $("#div_buttons_payment_2").hide(); $("#div_buttons_payment_3").hide()
	$("#div_buttons_upgrade_1").show(); $("#div_buttons_upgrade_2").show(); $("#div_buttons_upgrade_3").show()

	for (var i = 1; i <= 4; i++)
	{
		if (i != productNum) 
		{
			$("#div_buttons_upgrade_" + productNum.toString()).hide()
			$("#div_buttons_payment_" + productNum.toString()).show()
		} else {
			$("#div_buttons_upgrade_" + productNum.toString()).show()
			$("#div_buttons_payment_" + productNum.toString()).hide()
		}
	}
}