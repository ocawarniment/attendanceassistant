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
    catBox.selectedIndex = 1; //hard coded to get the 1 index which is comment
	var contacteesPanel = document.getElementById('contacteesPanel');
	contacteesPanel.setAttribute('style', 'display:none');
	
	var attenBox = document.getElementById("areaCategoryChooser_pickList_pickListContaner").getElementsByClassName("rtLI")[66].getElementsByTagName("span")[1]; //[1].getElementsByClassName("rtUnchecked")[1];
	
	var drop=document.getElementById("areaCategoryChooser_pickList_ToggleIcon"); 
	var allCats = document.getElementById("areaCategoryChooser_pickList_tree").getElementsByClassName("rtLI");
	
	// get the items we need
	var adminDrop = getCat("Administrative").getElementsByClassName("rtPlus")[0];
	var adminBox = getItem("Administrative","Administrative").getElementsByClassName("rtUnchecked")[0];
	var attenBox = getItem("Administrative","Attendance").getElementsByClassName("rtUnchecked")[0];

	// clear cats
	i=0;
	while (i<allCats.length) {
		if(allCats[i].getElementsByTagName("span")[1].getAttribute("class") == "rtChecked") {
			allCats[i].getElementsByTagName("span")[1].click();
		}
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

// function to get cat open item
function getCat(category){
	// get the category index
	var allCategories = document.getElementById("areaCategoryChooser_pickList_tree").getElementsByClassName("rtUL")[0].children;
	var foundCat;
	
	for(i=0; i<allCategories.length; i++){
		var catString = allCategories[i].innerText;
		if(catString.includes(category)) {
			foundCat = allCategories[i];
		}
	}

	return foundCat;
}

// function to find the right toggle box
function getItem(category, item){
	// get the category index
	var allCategories = document.getElementById("areaCategoryChooser_pickList_tree").getElementsByClassName("rtUL")[0].children;
	var foundCat;
	
	for(i=0; i<allCategories.length; i++){
		var catString = allCategories[i].innerText;
		if(catString.includes(category)) {
			foundCat = allCategories[i];
		}
	}

	var allItems = foundCat.getElementsByClassName("rtLI");
	var foundItem;
	// find the correct item within the found category
	for(i=0; i<allItems.length; i++){
		var itemString = allItems[i].innerText;
		if(itemString.includes(item)){
			foundItem = allItems[i];
		}
	}

	return foundItem;

}	
	
