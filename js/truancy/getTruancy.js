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
			var error = document.getElementById('pageTitleHeaderTextSpan').innerText;
			alert("This student does not have an active OCA Truancy Tracking 2018-2019 Data View. Please click OK to continue.");
			homeroomArray['ST' + studentID]['lastLogin'] = "N/A";
			homeroomArray['ST' + studentID]['lastContact'] = "N/A";
			homeroomArray['ST' + studentID]['missingHours'] = "N/A";
			homeroomArray['ST' + studentID]['gapDate'] = "N/A";
			
		} catch(err){
			var lastLogin; //EF_LastLogin
			lastLogin = document.getElementById('EF_LastLogin').innerText;
			if (lastLogin == "#VALUE!" || lastLogin == "") {lastLogin = 0}
			homeroomArray['ST' + studentID]['lastLogin'] = lastLogin;
			
			var totalMissingHours; //EF_StudentLastSynchronousContact
			var totalApproved = document.getElementById('OCA_Truancy1819_ActualAttHrs').innerText;
			var totalRequired = document.getElementById('OCA_Truancy1819_ReqInstrucHrs').innerText;
			totalMissingHours = document.getElementById('OCA_Truancy1819_HrsMissedYTD').innerText;
			if (totalMissingHours == "#VALUE!" || totalMissingHours == "") {totalMissingHours = "-"} else {totalMissingHours = Math.round(100*(totalApproved - totalRequired))/100};
			homeroomArray['ST' + studentID]['totalMissingHours'] = totalMissingHours;
			
			//var overdue;
			//overdue = document.getElementById('EF_NumberLessonsBehind').innerText * 1;
			//if (overdue == "#VALUE!" || overdue == "") {overdue = 0}
			//homeroomArray['ST' + studentID]['overdue'] = overdue;
			//studentArray['overdue'] = studentOverdue;
			
			var lastLogin;
			lastLogin = document.getElementById('EF_LastLogin').innerText.trim();
			if (lastLogin == "#VALUE!" || lastLogin == "" || lastLogin == null) {lastLogin = "-"}
			homeroomArray['ST' + studentID]['lastLogin'] = lastLogin;
			
			var gapDate;
			gapDate = document.getElementById('OCA_1stDateWUnapprovedAttend').innerText.trim();
			if (gapDate == "#VALUE!" || gapDate == "" || gapDate == null) {gapDate = "-"}
			homeroomArray['ST' + studentID]['gapDate'] = gapDate;
			
			var lessonsBehind;
			lessonsBehind = document.getElementById('EF_NumberLessonsBehind').innerText.trim();
			if (lessonsBehind == "#VALUE!" || lessonsBehind == "" || lessonsBehind == null) {lessonsBehind = "-"}
			homeroomArray['ST' + studentID]['lessonsBehind'] = lessonsBehind;

			// get last contact
			var lastSyncContact;
			lastSyncContact = getExtendedField("EF_StudentLastSynchronousContact");
			// calc days since contact
			var today = new Date();
			var diff =  -1*(Math.floor(( Date.parse(lastSyncContact) - today) / 86400000) + 1); 
			// flow chart days since contact
			if (diff >= 14) { homeroomArray['ST' + studentID]['escalation'] = "Approaching Alarm" }
			if (diff >= 21) { homeroomArray['ST' + studentID]['escalation'] = "Alarm" };
			// set hover text
			homeroomArray['ST' + studentID]['escReason'] = "Last Contact: " + lastSyncContact;
			
			// debug and testing color coding
			//overdue = "26";
			//lastLogin = 8/10/2018;
			//totalMissingHours = "15";
			//homeroomArray['ST' + studentID]['overdue'] = overdue;
			//homeroomArray['ST' + studentID]['lastLogin'] = lastLogin;
			//homeroomArray['ST' + studentID]['totalMissingHours'] = totalMissingHours;
			
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