/////////////
var storage = chrome.storage.local;
// message to background console
function bgConsole(sendCommand) {
	chrome.runtime.sendMessage({type: 'console', command: sendCommand});
}

// download truancy
storage.get(null, function(result) {
		var homeroomArray = result.homeroomArray;
		var studentID = result.truancyID;
		
		try{
			// temp FORCE scrape caButton_ok
			//var error = document.getElementById('caButton_ok').innerText;
			// original replace after fix
			var error = document.getElementById('pageTitleHeaderTextSpan').innerText;
			alert("This student does not have an active Truancy Tracking Data View. Please click OK to continue.");
			homeroomArray['ST' + studentID]['lastLogin'] = "N/A";
			homeroomArray['ST' + studentID]['lastContact'] = "N/A";
			homeroomArray['ST' + studentID]['missingHours'] = "N/A";
			homeroomArray['ST' + studentID]['gapDate'] = "N/A";
			
		} catch(err){
				
				var totalMissingHours; //EF_StudentLastSynchronousContact
				var totalApproved = document.getElementById(result.schoolVars.truancy.totalApproved.toString()).innerText;
				var totalRequired = document.getElementById(result.schoolVars.truancy.totalRequired.toString()).innerText;
				totalMissingHours = document.getElementById(result.schoolVars.truancy.missingHours.toString()).innerText;
				
				//var overdue;
				//overdue = document.getElementById('EF_NumberLessonsBehind').innerText * 1;
				//if (overdue == "#VALUE!" || overdue == "") {overdue = 0}
				//homeroomArray['ST' + studentID]['overdue'] = overdue;
				//studentArray['overdue'] = studentOverdue;
				
				var lastLogin;
				lastLogin = document.getElementById(result.schoolVars.truancy.lastLogin.toString()).innerText.trim();
				if (lastLogin == "#VALUE!" || lastLogin == "" || lastLogin == null) {lastLogin = "-"}
				homeroomArray['ST' + studentID]['lastLogin'] = lastLogin;
				
				var gapDate;
				gapDate = document.getElementById(result.schoolVars.truancy.gapDate.toString()).innerText.trim();
				if (gapDate == "#VALUE!" || gapDate == "" || gapDate == null) {gapDate = "-"}
				homeroomArray['ST' + studentID]['gapDate'] = gapDate;
				
				var lessonsBehind;
				lessonsBehind = document.getElementById(result.schoolVars.truancy.lessonsBehind.toString()).innerText.trim();
				if (lessonsBehind == "#VALUE!" || lessonsBehind == "" || lessonsBehind == null) {lessonsBehind = "-"}
				homeroomArray['ST' + studentID]['lessonsBehind'] = lessonsBehind;

				// get last contact
				var lastSyncContact;
				lastSyncContact = getExtendedField(result.schoolVars.truancy.lastContact.toString());
				// calc days since contact
				var today = new Date();
				var diff =  -1*(Math.floor(( Date.parse(lastSyncContact) - today) / 86400000) + 1); 
				// flow chart days since contact
				if (diff >= 14) { homeroomArray['ST' + studentID]['escalation'] = "Approaching Alarm" }
				if (diff >= 21) { homeroomArray['ST' + studentID]['escalation'] = "Alarm" };
				// set hover text
				homeroomArray['ST' + studentID]['escReason'] = "Last Contact: " + lastSyncContact;

				homeroomArray['ST' + studentID]['totalMissingHours'] = Math.round(100*(totalApproved - totalRequired))/100;
				//totalMissingHours = Math.round(100*(totalApproved - totalRequired))/100;
				// if hours are missing, calculate based on attendance metric and FDP
				/*
				if (totalMissingHours == "#VALUE!" || totalMissingHours == "") {
					var attendanceMetric = document.getElementById(result.schoolVars.truancy.attendanceMetric.toString()).innerText;
					attendanceMetric = parseFloat(attendanceMetric); // turn into float
					var firstDayString = document.getElementById(result.schoolVars.truancy.firstDay.toString()).innerText.trim();
					var firstDay = new Date(firstDayString);
					var daysEnrolled = (today-firstDay)/(1000 * 60 * 60 * 24);
					var weekDays = (daysEnrolled/7)*(-2) + daysEnrolled; // remove weekends... roughly
					var expectedHours = weekDays*5.5;
					// if attendane metric <1 then -1
					totalMissingHours = (attendanceMetric - 1)*expectedHours;
					totalMissingHours = Math.round(100*totalMissingHours)/100;
				} else {
					//window.alert(totalApproved + " | " + totalRequired);
					totalMissingHours = Math.round(100*(totalApproved - totalRequired))/100
				};
				*/
				//homeroomArray['ST' + studentID]['totalMissingHours'] = totalMissingHours;
				//homeroomArray['ST' + studentID]['test'] = 'dunno';

				// check CCP and CTE
				var cte = document.getElementById(result.schoolVars.truancy.cteStudent.toString()).innerText;
				if(cte == 'Yes'){
					homeroomArray['ST' + studentID]['cte'] = document.getElementById(result.schoolVars.truancy.cteHours.toString()).value;
				} else {
					homeroomArray['ST' + studentID]['cte'] = false;
				}
				var ccp = document.getElementById(result.schoolVars.truancy.ccpStudent.toString()).innerText;
				if(ccp !== ''){
					homeroomArray['ST' + studentID]['ccp'] = document.getElementById(result.schoolVars.truancy.ccpHours.toString()).value;
				} else {
					homeroomArray['ST' + studentID]['ccp'] = false;
				}

				// test state ID
				//homeroomArray['ST' + studentID]['stateId'] =  document.getElementById(result.schoolVars.truancy.stateId.toString()).innerText;

				// debug and testing color coding
				//overdue = "26";
				//lastLogin = 8/10/2018;
				//totalMissingHours = "15";
				//homeroomArray['ST' + studentID]['overdue'] = overdue;
				//homeroomArray['ST' + studentID]['lastLogin'] = lastLogin;
				
				storage.set({'homeroomArray': homeroomArray});
				storage.set({'truancyLoading': false});
		}
		
		chrome.runtime.sendMessage({type: 'getTruancy', first: false, completedID: studentID});
		window.close();
});

function getExtendedField(name) {
	var value;
	value = document.getElementById(name).innerText;
	return value;
}