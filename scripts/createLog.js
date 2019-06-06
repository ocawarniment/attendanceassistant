/////// Function delcations ////////
// function to format dates to mm/dd/yyyy
function formatDate(date) {
	var dateString = date.toString();
	var splitDateString = dateString.split("-");
	return splitDateString[1] + "/" + splitDateString[2] + "/" + splitDateString[0];
}
// message to background console
function bgConsole(sendCommand) {
	chrome.runtime.sendMessage({type: 'console', command: sendCommand});
}
// chrome local
var storage = chrome.storage.local;

storage.get(null, function(result) {
	// click the HR section ID
	if (result.homeroomID == null) {
		alert("Please enter your homeroom section ID on the popup page!");
	} else {
		try {
			document.getElementById('Link_' + result.homeroomID).click();
		} catch(err) {alert("Cannot select Homeroom section due to Connexus error when selecting System.")}
	}

	// click comment observation
	var catBox = document.getElementById("idLogEntryContactType_ctl00");
    catBox.selectedIndex = 1;
	var contacteesPanel = document.getElementById('contacteesPanel');
	contacteesPanel.setAttribute('style', 'display:none');
	
	var attenBox = document.getElementById("areaCategoryChooser_pickList_pickListContaner").getElementsByClassName("rtLI")[66].getElementsByTagName("span")[1]; //[1].getElementsByClassName("rtUnchecked")[1];
	
	var drop=document.getElementById("areaCategoryChooser_pickList_ToggleIcon"); 
	var allCats = document.getElementById("areaCategoryChooser_pickList_tree").getElementsByClassName("rtLI")
	var adminDrop = document.getElementById("areaCategoryChooser_pickList_pickListContaner").getElementsByClassName("rtPlus")[2];
	
	// clear cats
	i=0;
	while (i<allCats.length) {
		if(allCats[i].getElementsByTagName("span")[1].getAttribute("class") == "rtChecked") {
			allCats[i].getElementsByTagName("span")[1].click();
		}
		i++;
	}
	
	// find cat boxes
	i=0;
	while (i<allCats.length) {
		if(allCats[i].getElementsByTagName("span")[2].innerText == "Administrative") {var adminBox=allCats[i].getElementsByTagName("span")[1];}
		//if(allCats[i].getElementsByTagName("span")[2].innerText == "Attendance") {var attenBox=allCats[i].getElementsByTagName("span")[1];}
		i++;
	}
	// click boxes
	drop.click(); 
	adminDrop.click(); 
	window.setTimeout(function(){
		adminBox.click(); 
		attenBox.click();
		drop.click(); 
	}, 250); 
	
	// set the comment box text
	var comment = document.getElementById('comment');
	var changesText = "";
	for(i=0;i<result.timeAdjustments.length;i++) {
		changesText = changesText + result.timeAdjustments[i] + "\n"
	}
	if (result.timeAdjustments !== null) {
		comment.innerHTML = "Attendance Adjustments \n" + result.globalStartDate + " - " + result.globalEndDate + "\n\n" + result.studentLessons + "\n" + result.studentAssessments + "\n\n" + changesText;
	} else {
		alert("No changes!");
	}
});
	