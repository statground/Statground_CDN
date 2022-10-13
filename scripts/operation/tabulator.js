// DB 모니터링
var table_database = new Tabulator("#table_database", {
	ajaxURL:"/operation/get_db_stat/", //ajax URL
	progressiveLoad:"load",          //load data into the table as the user scrolls
	ajaxContentType:"json", // send parameters to the server as a JSON encoded string
	layout:"fitDataFill",
	pagination: "local",
	paginationSize: 20,
	movableColumns: true,
	columns: [
				{ title: "서버명", field: "serverName", align:"center",},
				{ title: "데이터베이스", field: "db", align:"center",},
				{ title: "collections", field: "collections", hozAlign:"right", formatter:function(cell, formatterParams){return(tabulator_checkNumFilter(cell.getValue()));}},
				{ title: "views", field: "views", hozAlign:"right", formatter:function(cell, formatterParams){return(tabulator_checkNumFilter(cell.getValue()));}},
				{ title: "objects", field: "objects", hozAlign:"right", formatter:function(cell, formatterParams){return(tabulator_checkNumFilter(cell.getValue()));}},
				{ title: "avgObjSize", field: "avgObjSize", hozAlign:"right", formatter:function(cell, formatterParams){return(tabulator_checkNumFilter(cell.getValue()));}},
				{ title: "dataSize", field: "dataSize", hozAlign:"right", formatter:function(cell, formatterParams){return(tabulator_checkNumFilter(cell.getValue()));}},
				{ title: "storageSize", field: "storageSize", hozAlign:"right", formatter:function(cell, formatterParams){return(tabulator_checkNumFilter(cell.getValue()));}},
				{ title: "indexes", field: "indexes", hozAlign:"right", formatter:function(cell, formatterParams){return(tabulator_checkNumFilter(cell.getValue()));}},
				{ title: "indexSize", field: "indexSize", hozAlign:"right", formatter:function(cell, formatterParams){return(tabulator_checkNumFilter(cell.getValue()));}},
				{ title: "totalSize", field: "totalSize", hozAlign:"right", formatter:function(cell, formatterParams){return(tabulator_checkNumFilter(cell.getValue()));}},
				{ title: "scaleFactor", field: "scaleFactor", hozAlign:"right", formatter:function(cell, formatterParams){return(tabulator_checkNumFilter(cell.getValue()));}},
				{ title: "fsUsedSize", field: "fsUsedSize", hozAlign:"right", formatter:function(cell, formatterParams){return(tabulator_checkNumFilter(cell.getValue()));}},
				{ title: "fsTotalSize", field: "fsTotalSize", hozAlign:"right", formatter:function(cell, formatterParams){return(tabulator_checkNumFilter(cell.getValue()));}},
				{ title: "ok", field: "ok", hozAlign:"right", formatter:function(cell, formatterParams){return(tabulator_checkNumFilter(cell.getValue()));}}
			],
});