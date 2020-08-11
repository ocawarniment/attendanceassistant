/////// SHORTHAND OPERATORS ///////
// message to background console
function bgConsole(sendCommand) {
	chrome.runtime.sendMessage({type: 'console', command: sendCommand});
}
// chrome local
var storage = chrome.storage.local;

/////// CryptoJS INIT ///////
var cryptoPass = "oca2018";

//check for dates to end early
var pageState = "inactive";
if (document.getElementById("startDate").getAttribute("Value") == null) {
	pageState = "inactive";
} else {
	pageState = "active";
}

if (pageState == "active") {
	// get the student id for the current page
	var url = window.location.href;
	var studentID = url.match(/.idWebuser=\d*/)[0].substring(url.match(/.idWebuser=\d*/)[0].indexOf("=")+1);
	
	// get the dates from the current page
	var startDate = document.getElementById("startDate").value.toString();
	var endDate = document.getElementById("endDate").value.toString();
	storage.set({globalStartDate: startDate, globalEndDate: endDate});
	prepTable();
	getWork();
	adjustApproveButton();
	floatTotalDiv();
	addCTECCP();
}

function addCTECCP(){
	var url = window.location.href;
	var cte = url.includes('cte=true');
	var ccp = url.includes('ccp=true');

	if(cte == true || ccp == true){
		window.alert('CCP or CTE STUDENT!!!');
	}
}

function getTotalTime() {
	// Count the rows in the table to use throughout
	var rowCount = document.getElementById("activityGrid").getElementsByTagName("tbody")[0].getElementsByTagName("tr").length - 3;
	// calculate the total time and place it here: activityGrid_ctl01_lblNumRecords
	n = 0;
	var currentTime;
	var currentHours;
	var currentMin;
	var totalTime;
	var totalHours = 0;
	var totalMin = 0;
	while (n <= rowCount - 3) {
		currentTime = document.getElementById("activityGrid").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[n + 3].getElementsByTagName("td")[2].innerText;
		if(currentTime.match("N/A")){currentTime = "0h 0min";}
		console.log(currentTime);
		currentHours = parseInt(currentTime.match(/.+?(?=h)/));
		currentMin = parseInt(currentTime.match(/h (.*)min/)[1]);
		if (currentTime.substring(0, 1) == "-") { currentMin = currentMin * -1; }
		//console.log(currentHours + " " + currentMin);
		totalHours = totalHours + currentHours;
		totalMin = totalMin + currentMin;
		//console.log(totalHours + " " + totalMin);
		n++;
	}
	// if min > 60 convert to hours
	if (totalMin >= 60) {
		totalHours = totalHours + Math.floor(totalMin/60);
		totalMin = totalMin - (Math.floor(totalMin/60)*60);
	}
	//alert(totalHours + "h " + totalMin + "min ");
	document.getElementById('activityGrid_ctl01_lblNumRecords').innerText = 'Total Time: ' + totalHours + 'h ' + totalMin + 'min';
	
	// check if > 27.5 - 
	if (totalHours*60 + totalMin >= 1650) { document.getElementById('activityGrid_ctl01_pagerHeaderCell').setAttribute("style","background-color:#9fff96"); } else { document.getElementById('activityGrid_ctl01_pagerHeaderCell').setAttribute("style","background-color:#ff9696"); };
}

function getWork() {
	// store global dates
	var startDate = document.getElementById("startDate").value.toString();
	var endDate = document.getElementById("endDate").value.toString();
	storage.set({'globalStartDate': startDate});
	storage.set({'globalEndDate': endDate});
	// Update the student id storage
	storage.set({'studentID': studentID});
	// store the sender tab id to go back to it after this is all done
	chrome.runtime.sendMessage({type: "storeTabID", tabTitle: 'actLogID'});
	// send message to report to go get the work
	chrome.storage.local.get(null, function(result) {
		storage.set({'getWorkLoop': 0});
		chrome.runtime.sendMessage({type: "getWork"});
	});
}

function floatTotalDiv() {
	var totalTimeDiv = document.getElementsByClassName("rollup-total")[0];
	totalTimeDiv.setAttribute("style", "position: fixed; bottom: 45px; right: 3.5%; background: white; background: #ffffff; padding: 15px; text-align: left; border-style: solid; border-width: 2px; border-radius: 5px; border-color: #8c8c8c; box-shadow: rgba(0,0,0,0.2) 0px 1px 3px;");
}

function addCells(rowNumber, dateCount, currentDate) {
	storage.get(null, function(result) {
		
		// Setup the current row to add cells
		var currentRow = document.getElementById("activityGrid").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[rowNumber];
	
		///// Create and add the new cells
		// lesson count
		var lessonCountCell = document.createElement("td");
		lessonCountCell.setAttribute("align", "center");
		lessonCountCell.id = "lessonCountCell" + currentDate.trim();
		lessonCountCell.setAttribute("rowspan", dateCount);
		document.getElementById("activityGrid").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[rowNumber].insertBefore(lessonCountCell, currentRow.childNodes[4]);

		// assessment count
		var asstCountCell = document.createElement("td");
		var asstCountButton = document.createElement("button");
		asstCountButton.id = "asstCountButton" + currentDate.trim();
		asstCountButton.innerText = "--";
		asstCountButton.type = "button";
		asstCountButton.onclick = function() {checkAssessments(studentID, currentDate);};
		asstCountCell.setAttribute("align", "center");
		asstCountCell.id = "asstCountCell" + currentDate.trim();
		asstCountCell.setAttribute("rowspan", dateCount);
		asstCountCell.appendChild(asstCountButton);
		document.getElementById("activityGrid").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[rowNumber].insertBefore(asstCountCell, currentRow.childNodes[4]);

		// compile dates in the left column
		var rowspan = document.getElementById('lessonCountCell' + currentDate).getAttribute('rowspan');
		document.getElementById("activityGrid").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[rowNumber].getElementsByTagName("td")[0].setAttribute('rowspan', rowspan);
		for(i=1; i<rowspan; i++) {
			document.getElementById("activityGrid").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[rowNumber + i].getElementsByTagName("td")[0].setAttribute('style', 'display:none');
		}
	});
}

function prepTable() {

	// Count the rows in the table to use throughout
	var rowCount = document.getElementById("activityGrid").getElementsByTagName("tbody")[0].getElementsByTagName("tr").length - 1;

	// Create New Cells to add to header
	var asstCountHeader = document.createElement("th");
	asstCountHeader.id = "asstCountHeader";
	asstCountHeader.innerText = "Asmnt.";
	asstCountHeader.setAttribute("scope","col");

	var lessonCountHeader = document.createElement("th");
	lessonCountHeader.id = "lessonCountHeader";
	lessonCountHeader.innerText = "Lssn.";
	lessonCountHeader.setAttribute("scope","col");
	
	// Add the headers
	var tableHeader = document.getElementById("activityGrid").getElementsByTagName("tr")[0];
	tableHeader.insertBefore(lessonCountHeader, tableHeader.childNodes[4]);
	tableHeader.insertBefore(asstCountHeader, tableHeader.childNodes[4]);

	///// count date occurances and create block cells
	// check date of first row
	var dateCount = 1;
	i = 1;
	// set the two checking rows
	var currentDate = document.getElementById("activityGrid").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[i].getElementsByTagName("td")[0].innerText.trim();
	var nextDate = document.getElementById("activityGrid").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[i + 1].getElementsByTagName("td")[0].innerText.trim();
	
	while (i <= rowCount - 1)
	{
		var nextDateCellClass = document.getElementById("activityGrid").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[i + 1].getAttribute('class');
		//alert("checking if " + currentDate + " matches " + nextDate);
		if (nextDateCellClass != 'date-header-row' && nextDateCellClass != 'date-header-row shade' ) {
			//alert("match!");
			dateCount++;
		} else {
			addCells(i-(dateCount-1), dateCount, currentDate);
			currentDate = nextDate;
			dateCount = 1;
		}
		i++;
		try {
			var nextDate = document.getElementById("activityGrid").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[i+1].getElementsByTagName("td")[0].innerText;
		} catch(err) {
			addCells(i-(dateCount-1), dateCount, currentDate);
			currentDate = nextDate;
			dateCount = 1;
		}
	}
}

function checkAssessments(studentID, assessmentDate) {
	storage.set({'assessmentDate': assessmentDate});
	chrome.runtime.sendMessage({type: 'checkAssessments', studentID: studentID});
}

function adjustApproveButton() {
	storage.get(null, function (result) {
		var url = window.location.href;
		var studentID = url.match(/.idWebuser=\d*/)[0].substring(url.match(/.idWebuser=\d*/)[0].indexOf("=")+1);
		// approve
		try {
			document.getElementById('btnApprove').onclick = function() {
				var homeroomArray = result.homeroomArray;
				console.log(homeroomArray);
				console.log("ST" + studentID);
				var student = homeroomArray['ST' + studentID];
				student['attendanceStatus'] = true;
				storage.set({'homeroomArray': homeroomArray});
				console.log(result.homeroomArray);
			}
		} catch(err) {
		//btnUnapprove
			document.getElementById('btnUnapprove').onclick = function() {
				var homeroomArray = result.homeroomArray;
				console.log(homeroomArray);
				console.log("ST" + studentID);
				var student = homeroomArray['ST' + studentID];
				student['attendanceStatus'] = false;
				storage.set({'homeroomArray': homeroomArray});
				console.log(result.homeroomArray);
			}
		}
	});
}
