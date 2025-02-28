function bar(inputData, divName, options)
{
	google.charts.load("current", {packages:['corechart']});
	google.charts.setOnLoadCallback(drawChart);

	function drawChart() {
		var data = new google.visualization.arrayToDataTable(inputData);
		var chart = new google.visualization.ColumnChart(document.getElementById(divName));
  
		chart.draw(data, options);
		
		$(window).smartresize(function () {
			chart.draw(data, options);
		});
	}
}