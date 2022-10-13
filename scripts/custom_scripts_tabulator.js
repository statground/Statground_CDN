// 숫자에 콤마 찍기
function tabulator_checkNumFilter(num){
	//var num = cell.getValue();
	  var tempnum = "";
	  if (num == "0"){
		   tempnum = "";
	  }
	  else if (num == ""){
		 tempnum = "";
	  }
	  else{
		tempnum = Number(num).toLocaleString();
	  }
	  return(tempnum);
}