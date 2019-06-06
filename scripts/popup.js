var storage = chrome.storage.local;
// message to background console
function bgConsole(sendCommand) {
	chrome.runtime.sendMessage({type: 'console', command: sendCommand});
}
// CryptoJS
var cryptoPass = "oca2018";

// clear everything but homeroom, dates, calendar, settings
clearTempStorage();
loadSettings();
loadHomeroom();
loadHomeroomID();
homeroomTab.style.display = 'block';

// Function for changing tabs
function openHomeroom() {
	settingsTab.style.display = 'none';
	homeroomTab.style.display = 'block';
	autoDatesTab.style.display = 'none';
}
// Function for changing tabs
function openSettings() {
	homeroomTab.style.display = 'none';
	settingsTab.style.display = 'block';
	autoDatesTab.style.display = 'none';
}
// Function for changing tabs
function openAutoDates() {
	homeroomTab.style.display = 'none';
	settingsTab.style.display = 'none';
	autoDatesTab.style.display = 'block';
}

// function to format dates
function formatDate(date) {
	var dateString = date.toString();
	var splitDateString = dateString.split("-");
	return splitDateString[1] + "/" + splitDateString[2] + "/" + splitDateString[0];
}

// load current saved dates and settings
function loadSettings() {
	chrome.storage.local.get(null, function (result) { 
		document.getElementById("startDate").value = result.approveStartDate;
		document.getElementById("endDate").value = result.approveEndDate;
		document.getElementById("calendarSetting").checked = result.calendarSetting;
		document.getElementById('autoWorkSetting').checked = result.autoWorkSetting;
		document.getElementById('calendarSetting').checked = result.calendarSetting;
		document.getElementById('autoCloseSetting').checked = result.autoCloseSetting;
		if (result.autoCloseSetting == undefined) {document.getElementById('autoCloseSetting').checked = true; storage.set({'autoCloseSetting': true});}
		if (result.autoWorkSetting == undefined) {document.getElementById('autoWorkSetting').checked = true; storage.set({'autoWorkSetting': true});}
		if (result.calendarSetting == undefined) {document.getElementById('calendarSetting').checked = true; storage.set({'calendarSetting': true});}
		if (result.homeroomTimestamp !== undefined) {document.getElementById('homeroomTimestamp').innerText = result.homeroomTimestamp;}
		//document.getElementById('hoursPerLesson').selectedIndex = result.hoursPerLesson;
		//document.getElementById('minutesPerLesson').selectedIndex = result.minutesPerLesson/15;
	});
}



function storeHomeroomID() {
	document.getElementById('homeroomID').onchange = function(){
		storage.set({'homeroomID': homeroomID.value});
	}
}

function loadHomeroomID() {
	storage.get(null, function(result) {
		if (result.homeroomID == undefined) {
			document.getElementById('homeroomID').value = "";
		} else {
			document.getElementById('homeroomID').value = result.homeroomID;
		}
	});
}

function downloadHomeroom(homeroomID) {
	// start the homeroom download
	storage.get(null, function(result) {
				
		// backup current HR list
		storage.set({ 'oldHomeroomArray': result.homeroomArray });
		
		var allChanges = result.allChanges;
		allChanges[studentID] = [];
		storage.set({'allChanges': allChanges});
	});
	chrome.runtime.sendMessage({type: 'downloadHomeroom', homeroomID: homeroomID});
}

function loadHomeroom() {
// update the table
	storage.get(null, function(result) {

		var manualDateMode = result.manualDateMode;
		
		if(manualDateMode == "TRUE") {
			// do some manual stuff
			document.getElementById("dateMode").innerHTML="<a href='javascript:void(0)'>(Manual Mode - Click here to return to Automatic)</a>";
			document.getElementById("dateMode").onclick = autoDates;
		} else {
			// call autoDates function to get atuo dates
			autoDates();
		}

		// enable the change date functions
		document.getElementById("startDate").onchange = manualModeEnable;
		document.getElementById("endDate").onchange = manualModeEnable;

		document.getElementById("startDate").value = result.approveStartDate;
		document.getElementById("endDate").value = result.approveEndDate;

		// variables for loop
		var studentCount = result.homeroomArray['studentCount'];
		var homeroomArray = result.homeroomArray;
		
		var studentCount = Object.keys(homeroomArray).length;
		
		// create new table
		var newtbody = document.createElement("tbody");
		
		// add the headders
		var headerRow = document.createElement("tr");
		var idHeader = document.createElement("th");
		var nameHeader = document.createElement("th");
		var missingHoursHeader = document.createElement("th");
		var gapDateHeader = document.createElement("th");
		var overdueHeader = document.createElement("th");
		var approveHeader = document.createElement("th");
		var totalHoursHeader = document.createElement("th");
		var lastContactHeader = document.createElement("th");
		var escHeader = document.createElement("th");

		var workMetricHeader = document.createElement("th");
		// DISPLAY LAST SHOWN METRIC
		console.log(result);
		var workMetricClass = result.workMetric;
		if( workMetricClass == 'overdue' || workMetricClass == null ) { var metricHeader = "Overdue (HS)"; workMetricClass = 'overdue'} else { var metricHeader = "Behind (K8)"; workMetricClass = "behind"}
		workMetricHeader.innerHTML = '<button id="toggleWorkMetric" class="'+workMetricClass+'">' + metricHeader + '</button>'

		idHeader.innerText = "ID";
		nameHeader.innerText = "Name";
		totalHoursHeader.innerHTML = "Hours<br>Over/Under";
		missingHoursHeader.innerHTML = "Last Login";
		missingHoursHeader.align = "center";
		gapDateHeader.innerHTML = "Approval<br>Gap Date";
		gapDateHeader.align = "center";
		overdueHeader.innerHTML = "Overdue<br>Lessons";
		overdueHeader.align = "center"; 
		approveHeader.innerHTML = "Connexus Activity<br>Tracker";
		// add the header cells to the header row
		headerRow.appendChild(idHeader);
		headerRow.appendChild(escHeader);
		headerRow.appendChild(nameHeader);
		headerRow.appendChild(totalHoursHeader);
		//headerRow.appendChild(lastContactHeader);
		headerRow.appendChild(workMetricHeader); // FIX THIS BACK TO overdueHEader
		headerRow.appendChild(missingHoursHeader);
		headerRow.appendChild(approveHeader);
		headerRow.appendChild(gapDateHeader);
		// add the header row to the new tbody
		newtbody.appendChild(headerRow);
		
		rowNumber = 1;
		for (var student in homeroomArray) {
			var studentRow = document.createElement("tr");
			var idCell = document.createElement("td");
			var nameCell = document.createElement("td");
			var lastLoginCell = document.createElement("td");
			var gapDateCell = document.createElement("td");
			var overdueCell = document.createElement("td");
			var approveCell = document.createElement("td");
			var totalMissingHoursCell = document.createElement("td");
			var escCell = document.createElement("td");
			
			//var lastContactCell = document.createElement("td");
			approveCell.align = 'center';
			lastLoginCell.align = 'center';
			gapDateCell.align = 'center';
			overdueCell.align = 'center';
			totalMissingHoursCell.align = 'center';
			// create the cells
			if(homeroomArray[student]['totalMissingHours']<0) {colorStyle = 'style="background-color: #ff9696;"'} else {colorStyle=""};// red if negative, keep black if positive
			totalMissingHoursCell.innerHTML = "<button "+colorStyle+ ">" + homeroomArray[student]['totalMissingHours'] + "</button>";
			if(homeroomArray[student]['totalMissingHours']<0) {totalMissingHoursCell.setAttribute('class','red')};// red if negative, keep black if positive
			idCell.innerHTML = '<a href="https://www.connexus.com/webuser/overview.aspx?idWebuser=' + homeroomArray[student]['id'] + '" target="_newtab">' + homeroomArray[student]['id'] + '</a>';
			// decrypt NAME
			//nameCell.innerText = homeroomArray[student]['name'];
			var encryptedName = homeroomArray[student]['name'];
			var decryptedName = CryptoJS.AES.decrypt(encryptedName,cryptoPass);
			// check escalation for icon
			var escIconSrc;
			if(homeroomArray[student]['escalation'] == 'Alarm') { escIconSrc = '/images/alarm.png'} 
				else if(homeroomArray[student]['escalation'] == 'Approaching Alarm') { escIconSrc = 'images/approaching.png' } 
				else if(homeroomArray[student]['escalation'] == 'On Track') {escIconSrc = '/images/ontrack.png'} 
				else {escIconSrc = '/images/exempt.png'}
			escCell.innerHTML = '<img src="' + escIconSrc + '" title="' +homeroomArray[student]['escReason']+ '">';
			nameCell.innerText = decryptedName.toString(CryptoJS.enc.Utf8);

			// Last login days
			lastLoginCell.innerText = homeroomArray[student]['lastLogin'];
			if(homeroomArray[student]['lastLogin'] == "-") { lastLoginCell.innerText = "None"; lastLoginCell.setAttribute("style","font-weight:bold");}
			
			// approval gap date
			gapDateCell.innerText = homeroomArray[student]['gapDate'];
			
			// overdue lessons cell
			var bold = false;
			var colorAlert = "black";
			var studentWorkMetric;
			if( result.workMetric == 'overdue' || result.workMetric == null ) { studentWorkMetric = homeroomArray[student]['overdue'] } else { studentWorkMetric = homeroomArray[student]['lessonsBehind'] }
			overdueCell.innerHTML = '<a href="https://www.connexus.com/assessments/results/listTaken.aspx?idWebuser=' + homeroomArray[student]['id'] + '" target="_newtab">' + studentWorkMetric + '</a>';
			
			if (studentWorkMetric >= 20) { colorAlert = "#d50000", bold = true };
			if (bold == true) {
				overdueCell.firstChild.setAttribute("style","font-weight:bold; color:" + colorAlert);
			} else {
				overdueCell.firstChild.setAttribute("style","color:" + colorAlert);
			}
			
			// create the approve button cell
			var approveButton = document.createElement("button"); //create new button
			approveButton.innerText = "Approve";
			if (homeroomArray[student]['attendanceStatus'] == true) {approveButton.innerHTML = "<strike>" + approveButton.innerText + "</strike>";}
			approveButton.type = "button";
			approveButton.class = homeroomArray[student]['id'];
			approveButton.onclick = function() {approveAttendance(this.class);};
			approveCell.appendChild(approveButton);
			
			// add the cells to the row
			studentRow.appendChild(idCell);
			studentRow.appendChild(escCell);
			studentRow.appendChild(nameCell);
			studentRow.appendChild(totalMissingHoursCell);
			studentRow.appendChild(overdueCell);
			studentRow.appendChild(lastLoginCell);
			studentRow.appendChild(approveCell);
			studentRow.appendChild(gapDateCell);
			
			newtbody.appendChild(studentRow);
			
			rowNumber = rowNumber + 1;
		}
		
		// replace table
		var oldtbody = document.getElementById("homeroomTab").getElementsByTagName("tbody")[0];
		oldtbody.parentNode.replaceChild(newtbody, oldtbody);
	
		sortTable();
		openHomeroom();
		setIndicators();

		// set the toggle work metric button
		document.getElementById("toggleWorkMetric").onclick = function() {
			var toggleButton = document.getElementById("toggleWorkMetric");
			if (toggleButton.getAttribute('class') == 'overdue') {
				toggleButton.innerText = 'Behind (K8)';
				var studentRows = document.getElementById('homeroomTable').getElementsByTagName('tr');
				for(i=1;i<studentRows.length;i++){
					// change the column
					var studentID = studentRows[i].getElementsByTagName('td')[0].innerText.trim();
					studentRows[i].getElementsByTagName('td')[4].innerHTML = '<a href="https://www.connexus.com/assessments/results/listTaken.aspx?idWebuser=' + studentID + '" target="_newtab">' + homeroomArray['ST' + studentID]['lessonsBehind'] + '</a>';
					// change the formatting of the records
					if (homeroomArray['ST'+studentID]['lessonsBehind'] >= 20) {
						studentRows[i].getElementsByTagName('td')[4].firstChild.setAttribute("style","font-weight:bold; color:#d50000");
					} else {
						studentRows[i].getElementsByTagName('td')[4].firstChild.setAttribute("style","color:black");
					}
					toggleButton.setAttribute('class','behind');
					storage.set({'workMetric':'behind'})
				}
				setIndicators();
			} else {
				toggleButton.innerText = 'Overdue (HS)';
				var studentRows = document.getElementById('homeroomTable').getElementsByTagName('tr');
				for(i=1;i<studentRows.length;i++){
					var studentID = studentRows[i].getElementsByTagName('td')[0].innerText.trim();
					studentRows[i].getElementsByTagName('td')[4].innerHTML = '<a href="https://www.connexus.com/assessments/results/listTaken.aspx?idWebuser=' + studentID + '" target="_newtab">' + homeroomArray['ST'+ studentID]['overdue'] + '</a>';
					if (homeroomArray['ST'+studentID]['overdue'] >= 20) {
						studentRows[i].getElementsByTagName('td')[4].firstChild.setAttribute("style","font-weight:bold; color:#d50000");
					} else {
						studentRows[i].getElementsByTagName('td')[4].firstChild.setAttribute("style","color:black");
					}
					storage.set({'workMetric':'overdue'})
				}
				toggleButton.setAttribute('class','overdue');
				setIndicators();
			}
		}

	});
}

/* code taken and adapted from https://www.w3schools.com/howto/howto_js_sort_table.asp */
function sortTable() {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("homeroomTable");
  switching = true;
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.getElementsByTagName("TR");
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[2];
      y = rows[i + 1].getElementsByTagName("TD")[2];
      //check if the two rows should switch place:
      if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
        //if so, mark as a switch and break the loop:
        shouldSwitch= true;
        break;
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}


// function for setting status colors based on ODs and lesson completion
function setIndicators() {
	// strike if approved
	storage.get(null, function(result) {
		var tableRows = document.getElementById('homeroomTable').getElementsByTagName("tr");
		for(i=1; i<tableRows.length; i++) {
			var studentID = tableRows[i].getElementsByTagName("td")[0].innerText.trim()
			var overdueString = tableRows[i].getElementsByTagName("td")[4].innerText.trim();
			var leadingNewOverdueIndex = overdueString.indexOf(" ",0) + 3;
			var oldOverdue = overdueString.substring(0, 1);
			var newOverdue = overdueString.substring(leadingNewOverdueIndex, overdueString.length);
			var overdue = parseInt(tableRows[i].getElementsByTagName("td")[4].innerText.trim());
			var missingHours = parseFloat(tableRows[i].getElementsByTagName("td")[3].innerText);
			
			// indicator changing color code
			var indicator = 0;
			if (missingHours<=-28) {indicator = indicator + 1;}
			if (missingHours<=-56) {indicator = indicator + 1;}
			if (overdue>=15) {indicator = indicator + 1;}
			if (overdue>=30) {indicator = indicator + 1;}
			
			// set approveButton variable
			var approveButton = tableRows[i].getElementsByTagName("td")[6].getElementsByTagName("button")[0];
			var advice = "";

			// indicator override
			if (missingHours > 0) {
				// >15 ODs
				if (overdue >=20) {
					//. 30 ODs
					if (overdue >= 35) {
						indicator = 3;
						advice = "Consider removing time";
					} else {
						indicator = 1;
						advice = "Consider adjustments";
					}
				} else {
					indicator = 0;
					advice = "Approve";
				}
			} else {
				// >15 ODs
				if (overdue >=20) {
					// time diff
					timeDiff = Math.abs(Math.abs(missingHours) - Math.abs(overdue));
					if (timeDiff > 10) {
						indicator = 3;
						advice = "Align time with missing lessons";
					} else {
						indicator = 0;
						advice = "Missing time and lessons are aligned";
					}
				} else {
					indicator = 3;
					advice = "Consider adding time";
				}
			}

			// set the advice
			approveButton.title = advice;
			
			// check if beginning of year
			var netHoursCell = tableRows[i].getElementsByTagName("td")[3];
			if (netHoursCell.innerHTML == "-") { indicator = 1;}
			
			// check if kid is missing hours but caught up on lessons
			if (overdue <= 20 & missingHours <0) {indicator = 3;}
			
			// check days since login
			var lastLoginCell = tableRows[i].getElementsByTagName("td")[5];
			var loginDate = new Date(lastLoginCell.innerText);
			var currentDate = new Date();
			var daysSinceLogin = Math.round((currentDate.setDate(currentDate.getDate() - (currentDate.getDay() + 6) %7 ) - loginDate.getTime())/(1000*60*60*24));
			var weekendAdjustment = 0;
			if (currentDate.getDay() <= 2) { weekendAdjustment = 6 } else { weekendAdjustment = 4}
			if (daysSinceLogin >= weekendAdjustment || lastLoginCell.innerText == "None") { lastLoginCell.setAttribute("style","font-weight:bold"); indicator = 3;}
			
			if (indicator >= 3) {approveButton.setAttribute('style', 'background-color: #ff9696; font-family: opensans;'); approveButton.innerText = "Review";}
			if (indicator == 1 || indicator == 2) {approveButton.setAttribute('style', 'background-color: #fff389; font-family: opensans;'); approveButton.innerText = "Review";}
			if (indicator == 0) {approveButton.setAttribute('style', 'background-color: #9fff96; font-family: opensans;'); approveButton.innerText = "Approve";}
			
			// if indicator >= 1 then calendar view
			if (indicator >= 1) { approveButton.onclick = function() {approveAttendance(this.class);}; }

			// set hours button to go to DV
			tableRows[i].getElementsByTagName("td")[3].getElementsByTagName('button')[0].class = studentID;
			tableRows[i].getElementsByTagName("td")[3].getElementsByTagName('button')[0].onclick = function(){openDV(this.class)};
			
			var homeroomArray = result.homeroomArray;
			console.log(homeroomArray['ST' + studentID])
			if (homeroomArray['ST' + studentID]['attendanceStatus'] == true) {approveButton.setAttribute('style', 'background-color:'); approveButton.innerHTML = '<strike>'+ approveButton.innerHTML + '</strike>';}
		}
	});
}

function updateHours() {
	idList = [];
	studentRows = document.getElementById('homeroomTable').getElementsByTagName('tr');
	var i;
	for (i=1; i<studentRows.length; i++) {
		idList.push(studentRows[i].getElementsByTagName("td")[0].innerText);
	}

	storage.set({'truancyIdList': idList});
	// send message to get the values
	//chrome.runtime.sendMessage({type: 'updateOverdue', first: true});
	var homeroomID = document.getElementById("homeroomID").value;
	chrome.runtime.sendMessage({type: 'updateOverdue', homeroomID: homeroomID});
	window.close();
}

function approveAttendance(studentID) {
	
	closeActivityLogs();
	
	var startDate = document.getElementById("startDate").value;
	var endDate = document.getElementById("endDate").value;

	chrome.tabs.create({ url: 'https://www.connexus.com/webuser/activity/activity.aspx?idWebuser=' + studentID + '&startDate=' + startDate + '&endDate=' + endDate, selected: true}, function(tab) { });
}

function openDV(studentID) {
	chrome.tabs.create({ url: 'https://www.connexus.com/webuser/dataview.aspx?idWebuser='+studentID+'&idDataview=11961'});
}

function closeActivityLogs() {
	chrome.windows.getAll({populate:true},function(windows){
	  windows.forEach(function(window){
		window.tabs.forEach(function(tab){
			// if the url matches, focus on it
			if(tab.url.startsWith("https://www.connexus.com/webuser/activity/activity.aspx?idWebuser=") == true || tab.url.startsWith("https://www.connexus.com/activitytracker/default/weeksummary?idWebuser=") == true) {
			  chrome.tabs.remove(tab.id);
		  }
		});
	  });
	});
}

function clearTempStorage(){
	storage.get(null, function(result) {
		// save dates
		var startDate = result.approveStartDate;
		var endDate = result.approveEndDate;
		// date mode
		var manualDateMode = result.manualDateMode;
		// save homeroomArray
		var homeroomArray = result.homeroomArray;
		// save homeroomID
		var homeroomID = result.homeroomID;
		// save homeroom timestamp
		var homeroomTimestamp = result.homeroomTimestamp;
		// save settings status
		var calendarSetting = result.calendarSetting;
		var autoWorkSetting = result.autoWorkSetting;
		var autoCloseSetting = result.autoCloseSetting;
		if (result.assessmentAlertSetting !== null) { var assessmentAlertSetting = result.assessmentAlertSetting; } else { assessmentAlertSetting = false; }
		var hoursPerLesson = result.hoursPerLesson;
		var minutesPerLesson = result.minutesPerLesson;
		// save the workMetric setting
		var workMetric = result.workMetric;
		// save list of changes
		if (result.allChanges !== null) {var allChanges = result.allChanges;} else {var allChanges = {} };
		// CLEAR IT ALL
		chrome.storage.local.clear(function() {
			var error = chrome.runtime.lastError;
			if (error) {
				console.error(error);
			}
		});
		// Okay... now put it back. restore dates and homeroom
		storage.set({'manualDateMode': manualDateMode,'approveStartDate': startDate, 'approveEndDate': endDate, 'homeroomID': homeroomID, 'homeroomArray': homeroomArray, 'homeroomTimestamp': homeroomTimestamp, 'allChanges': allChanges, 'autoCloseSetting': autoCloseSetting, 'autoWorkSetting': autoWorkSetting, 'calendarSetting': calendarSetting, 'hoursPerLesson': hoursPerLesson, 'minutesPerLesson': minutesPerLesson, 'assessmentAlertSetting': assessmentAlertSetting, 'workMetric': workMetric});
		// also... set the calendar array
		var schoolCalendar = ['8/29/2017', '8/30/2017', '8/31/2017', '9/1/2017', '9/5/2017', '9/6/2017', '9/7/2017', '9/8/2017', '9/11/2017', '9/12/2017', '9/13/2017', '9/14/2017', '9/15/2017', '9/18/2017', '9/19/2017', '9/20/2017', '9/21/2017', '9/22/2017', '9/25/2017', '9/26/2017', '9/27/2017', '9/28/2017', '9/29/2017', '10/2/2017', '10/3/2017', '10/4/2017', '10/5/2017', '10/6/2017', '10/10/2017', '10/11/2017', '10/12/2017', '10/13/2017', '10/16/2017', '10/17/2017', '10/18/2017', '10/19/2017', '10/20/2017', '10/23/2017', '10/24/2017', '10/25/2017', '10/26/2017', '10/27/2017', '10/30/2017', '10/31/2017', '11/1/2017', '11/2/2017', '11/3/2017', '11/6/2017', '11/7/2017', '11/8/2017', '11/9/2017', '11/10/2017', '11/13/2017', '11/14/2017', '11/15/2017', '11/16/2017', '11/17/2017', '11/20/2017', '11/21/2017', '11/27/2017', '11/28/2017', '11/29/2017', '11/30/2017', '12/1/2017', '12/4/2017', '12/5/2017', '12/6/2017', '12/7/2017', '12/8/2017', '12/11/2017', '12/12/2017', '12/13/2017', '12/14/2017', '12/15/2017', '12/18/2017', '12/19/2017', '12/20/2017', '1/3/2018', '1/4/2018', '1/5/2018', '1/8/2018', '1/9/2018', '1/10/2018', '1/11/2018', '1/12/2018', '1/16/2018', '1/19/2018', '1/22/2018', '1/23/2018', '1/24/2018', '1/25/2018', '1/26/2018', '1/29/2018', '1/30/2018', '1/31/2018', '2/1/2018', '2/2/2018', '2/5/2018', '2/6/2018', '2/7/2018', '2/8/2018', '2/9/2018', '2/12/2018', '2/13/2018', '2/14/2018', '2/15/2018', '2/16/2018', '2/20/2018', '2/21/2018', '2/22/2018', '2/23/2018', '2/26/2018', '2/27/2018', '2/28/2018', '3/1/2018', '3/2/2018', '3/5/2018', '3/6/2018', '3/7/2018', '3/8/2018', '3/9/2018', '3/12/2018', '3/13/2018', '3/14/2018', '3/15/2018', '3/16/2018', '3/19/2018', '3/20/2018', '3/21/2018', '3/22/2018', '3/23/2018', '4/2/2018', '4/3/2018', '4/4/2018', '4/5/2018', '4/6/2018', '4/9/2018', '4/10/2018', '4/11/2018', '4/12/2018', '4/13/2018', '4/16/2018', '4/17/2018', '4/18/2018', '4/19/2018', '4/20/2018', '4/23/2018', '4/24/2018', '4/25/2018', '4/26/2018', '4/27/2018', '4/30/2018', '5/1/2018', '5/2/2018', '5/3/2018', '5/4/2018', '5/7/2018', '5/8/2018', '5/9/2018', '5/10/2018', '5/11/2018', '5/14/2018', '5/15/2018', '5/16/2018', '5/17/2018', '5/18/2018', '5/21/2018', '5/22/2018', '5/23/2018', '5/24/2018', '5/25/2018', '5/29/2018', '5/30/2018', '5/31/2018', '6/1/2018'];
		storage.set({'schoolCalendar': schoolCalendar});
	});
}

function storeExpectedHours() {
	document.getElementById('hoursPerLesson').onchange = function(){
		storage.set({'hoursPerLesson': hoursPerLesson.value});
	}
}
function storeExpectedMinutes() {
	document.getElementById('minutesPerLesson').onchange = function(){
		storage.set({'minutesPerLesson': minutesPerLesson.value});
	}
}

function setSetting(settingTitle, bool) {
	storage.set({[settingTitle]: bool});
}

// attach the button functions
//var storeDatesButton = document.getElementById("storeDatesButton");
//storeDatesButton.onclick = saveDates;
//var homeroomTabButton = document.getElementById("homeroomTabButton");
//homeroomTabButton.onclick = openHomeroom;
//var autoDatesTabButton = document.getElementById("autoDatesTabButton");
//autoDatesTabButton.onclick = openAutoDates;
//var settingsTabButton = document.getElementById("settingsTabButton");
//settingsTabButton.onclick = openSettings;
var downloadHomeroomButton = document.getElementById("downloadHomeroomButton");
downloadHomeroomButton.onclick = function() {
	if(document.getElementById('homeroomID').value == "") {
		document.getElementById('homeroomID').select();
		document.getElementById('homeroomID').focus();
	} else { 
		downloadHomeroom(document.getElementById('homeroomID').value)
	};
};


/* 
var updateHoursButton = document.getElementById("updateHoursButton");
updateHoursButton.onclick = function() {
	if(document.getElementById('homeroomID').value == "") {
		document.getElementById('homeroomID').select();
		document.getElementById('homeroomID').focus();
	} else { 
		update = confirm("This can be used throughout the week. It will ONLY update Hours, Last Login, and Gap Date.\n\nClick OK to continue or Cancel to return.")
		if(update == true) {
			updateHours()
		}
	};
};
*/

var calendarSettingBox = document.getElementById("calendarSetting");
calendarSettingBox.onclick = function() {setSetting('calendarSetting', this.checked)};

var autoWorkSettingBox = document.getElementById("autoWorkSetting");
autoWorkSettingBox.onclick = function() {setSetting('autoWorkSetting', this.checked)};

var autoCloseSettingBox = document.getElementById("autoCloseSetting");
autoCloseSettingBox.onclick = function() {setSetting('autoCloseSetting', this.checked)};

var homeroomIDBox = document.getElementById('homeroomID');
homeroomIDBox.onChange = storeHomeroomID();
//var hoursPerLessonDrop = document.getElementById('hoursPerLesson');
//hoursPerLessonDrop.onChange = storeExpectedHours();
//var minutesPerLessonDrop = document.getElementById('minutesPerLesson');
//minutesPerLessonDrop.onChange = storeExpectedMinutes();

// increment days function
function addDays(date, daysAdded) {
	var nextDay = new Date(date.getTime()+1000*60*60*24*daysAdded);
	return nextDay;
  }

// manual date change button
function manualModeEnable() {

	storage.set({'manualDateMode': "TRUE"});
	document.getElementById("dateMode").innerHTML="<a href='javascript:void(0)'>(Manual Mode - Click here to return to Automatic)</a>";
	document.getElementById("dateMode").onclick = autoDates;

	var startDateSplit = document.getElementById("startDate").value.split("-");
	var endDateSplit = document.getElementById("endDate").value.split("-");

	storage.set({'approveStartDate': startDateSplit[0]+"-"+startDateSplit[1]+"-"+startDateSplit[2]});
	storage.set({'approveEndDate': endDateSplit[0]+"-"+endDateSplit[1]+"-"+endDateSplit[2]});
	
}

// mark automatic dates
function autoDates() {
	document.getElementById("dateMode").innerText="(Automatic - Dates are based on prior school week)";
	storage.set({'manualDateMode': "FALSE"});
	// set the dates
	var todayDate = new Date();
	var startDate = new Date(todayDate);
	// set to Monday of this week
	startDate.setDate(todayDate.getDate() - (todayDate.getDay() + 7) % 7);
	// set to previous Monday
	startDate.setDate(startDate.getDate() - 7);
	var endDate = new Date(addDays(startDate,6));

	var startMonth = startDate.getMonth() + 1;
	if (startMonth < 10) { startMonth = "0" + startMonth };
	var startDay = startDate.getDate();
	if (startDay < 10) { startDay = "0" + startDay };
	var startYear = startDate.getYear() + 1900;
	var endMonth = endDate.getMonth() + 1;
	if (endMonth < 10) { endMonth = "0" + endMonth };
	var endDay = endDate.getDate();
	if (endDay < 10) { endDay = "0" + endDay };
	var endYear = endDate.getYear() + 1900;

	chrome.storage.local.set({'approveStartDate': startYear+"-"+startMonth+"-"+startDay});
	chrome.storage.local.set({'approveEndDate': endYear+"-"+endMonth+"-"+endDay});

	document.getElementById("startDate").value =startYear+"-"+startMonth+"-"+startDay;
	document.getElementById("endDate").value = endYear+"-"+endMonth+"-"+endDay;
}