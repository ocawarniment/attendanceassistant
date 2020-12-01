// function to format dates to mm/dd/yyyy
function formatDate(date) {
	var dateString = date.toString();
	var splitDateString = dateString.split("-");
	return splitDateString[1] + "/" + splitDateString[2] + "/" + splitDateString[0];
}
///////
var storage = chrome.storage.local;

/////// CryptoJS INIT ///////
var cryptoPass = "oca2018";

// listen for the DV to refresh
chrome.tabs.onUpdated.addListener(function (tabId , info) {
	if (info.status === 'complete') {
		// your code ...
	}
});

// listen to page
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	  try{
		if (request.type == "console") {
			console.log(request.command);
		}

		if (request.type == "loadCAT") {
			chrome.webNavigation.getAllFrames({tabId:sender.tab.id},function(frames){
				var catFrameId = frames[1].frameId;
				chrome.tabs.executeScript(sender.tab.id,{
					frameId: catFrameId,
					file: "/js/activityTracker/getTime.js"
				},function(results){
					//Handle any results
				});
			});
			/*
			chrome.tabs.executeScript({
				"file": "/js/activityTracker/getTime.js",
				"allFrames" : true
			});
			*/
			
		}

		if(request.type == "openPage"){
			chrome.tabs.create({ url: request.url, selected: request.focused }, function(tab) {
				/*
				// execute the download homeroom external script on the new tab
				// var changesText = result.allChanges[result.studentID].toString();
				chrome.tabs.executeScript(tab.id, {
					file: '/js/truancyIA.js',
					runAt: 'document_end'
				});
				*/
			});
			if(request.closeSender){
				chrome.tabs.remove(sender.tab.id);
			}
		}

		if (request.type == "cteccpAdjust") {
			console.log(request);
			chrome.webNavigation.getAllFrames({tabId:sender.tab.id},function(frames){
				// find the correct frame
				frames.forEach(frame => {
					if(frame.url !== sender.tab.url) {
						catFrameId = frame.frameId;
					}
				})
				// store variables to the inner frame
				console.log(frames);
				chrome.tabs.executeScript(sender.tab.id,{
					frameId: catFrameId,
					code: 'var callback = "' + request.callback + '"; var dailyHours='+request.dailyHours+'; var adjType="'+request.adjType+'"; var baseQuery="'+request.baseQuery+'"'
				}),
				// call the function on the the inner frame
				chrome.tabs.executeScript(sender.tab.id,{
					frameId: catFrameId, //allFrames: true,
					file: "/js/activityTracker/cteccpAdjust.js"
				},function(results){
					//Handle any results
				});
			});
		}

		if (request.type == "cteccpCheck") {
			console.log(request);
			chrome.webNavigation.getAllFrames({tabId:sender.tab.id},function(frames){
				// find the correct frame
				frames.forEach(frame => {
					if(frame.url !== sender.tab.url) {
						catFrameId = frame.frameId;
					}
				})
				// store variables to the inner frame
				console.log(frames);
				chrome.tabs.executeScript(sender.tab.id,{
					frameId: catFrameId,
					code: 'var approve = ' + request.approve + '; var dailyHours='+request.dailyHours+'; var adjType="'+request.adjType+'"; var baseQuery="'+request.baseQuery+'"'
				}),
				// call the function on the the inner frame
				chrome.tabs.executeScript(sender.tab.id,{
					frameId: catFrameId, //allFrames: true,
					file: "/js/activityTracker/cteccpCheck.js"
				},function(results){
					// handle results
				});
			});
		}

		if (request.type == "cteccpSave") {
			console.log('trying to save...');
			chrome.webNavigation.getAllFrames({tabId:sender.tab.id},function(frames){
				// find the correct frame
				frames.forEach(frame => {
					console.log(frame);
					if(frame.url == sender.tab.url) {
						parentFrameId = frame.frameId;
					}
				})
				// send to the outter frame
				chrome.tabs.executeScript(sender.tab.id,{
					allFrames: true,
					code: "document.querySelector('.cxPrimaryBtn').click();"
				},function(results){
					//Handle any results
				});
			});
		}

		if (request.type == "cteccpAlertResults") {
			console.log('cteccpStatus: ' + request.correct);
			chrome.storage.local.get(null, (results)=>{
				var correct = request.correct;
				if(correct == false) {
					const tabId = results.actLogID;
					chrome.tabs.update(tabId, {selected: true});
					chrome.tabs.executeScript(tabId, {
						file: 'js/activityLog/cteccpInitiateChange.js',
						runAt: 'document_idle'
					});
				} else {
					const tabId = results.actLogID;
					chrome.tabs.update(tabId, {selected: true});
					chrome.tabs.executeScript(tabId, {
						file: 'js/activityLog/cteccpConfirmTime.js',
						runAt: 'document_idle'
					});
				}
			})
			chrome.tabs.remove(sender.tab.id, ()=>{} );
		}

		if (request.type == "getCatTime") {
			console.log('trying');
			chrome.webNavigation.getAllFrames({tabId:sender.tab.id},function(frames){
				// find the correct frame
				frames.forEach(frame => {
					if(frame.url !== sender.tab.url) {
						catFrameId = frame.frameId;
					}
				})
				// call the function on the the inner frame
				chrome.tabs.executeScript(sender.tab.id,{
					frameId: catFrameId, //allFrames: true,
					file: "/js/activityTracker/getCatTime.js"
				},function(results){
					// handle results
				});
			});
		}

		if (request.type == "activityLogOpenAndSave") {
			// create the tab with the student id
			setTimeout(()=>{
				chrome.tabs.create({ url: 'https://www.connexus.com/webuser/activity/activity.aspx' + request.attendanceParams, selected: true }, function(tab) {
					// execute the get work script on the opened tab
					chrome.tabs.executeScript(tab.id, {
						code: 'var btnApprove = document.querySelector("#btnApprove"); btnApprove.onclick = ()=>{WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions("btnApprove", "", true, "approve", "", false, true));}; btnApprove.click();',
						runAt: 'document_end'
					});
				});
				// close the sender
				chrome.tabs.remove(sender.tab.id, ()=>{} );
			},2000);
		}
		
		if (request.type == "activityLogOpen") {
			// create the tab with the student id
			setTimeout(()=>{
				chrome.tabs.create({ url: 'https://www.connexus.com/webuser/activity/activity.aspx' + request.attendanceParams, selected: true }, function(tab) {
					var changes = request.changes;
					var changesString = changes.join(",");
					console.log(changesString);
					// execute the get work script on the opened tab
					chrome.tabs.executeScript(tab.id, {
						code: 'window.alert("Changes complete!");',
						runAt: 'document_end'
					});
				});
				// close the sender
				chrome.tabs.remove(sender.tab.id, ()=>{} );
			},2000);
		}

		if (request.type == "scrapeValue") {
			//getWeaponUsage(request.weaponType).then( (results)=>{ sendResponse({results: results}); } );
			chrome.tabs.create({url: request.url, selected: false},(tab) => {
				chrome.tabs.executeScript(tab.id, {
					code: `const cssSelector="${request.cssSelector}";`,
					runAt: 'document_end'
				});
				chrome.tabs.executeScript(tab.id, {
					file: '/js/scraper/waitAndScrape.js',
					runAt: 'document_end'
				},(result) => {
					console.log(result);
					sendResponse(result[0]);
					chrome.tabs.remove(tab.id);
				});
			})
			return true; // keep connection open for async repionse
		} 

		if (request.type == "getWork") {
			// close tab id they request
			if (request.closeSender == true) { chrome.tabs.remove(sender.tab.id); }
			// load variables
			chrome.storage.local.get(null, function (result) {
				// create the tab with the student id
				chrome.tabs.create({ url: 'https://www.connexus.com/webuser/dataview.aspx?idWebuser=' + result.studentID + '&idDataview=410', selected: false }, function(tab) {
					// execute the get work script on the opened tab
					chrome.tabs.executeScript(tab.id, {
						file: '/js/work/getWork.js',
						runAt: 'document_end'
					});
				});
			});
		}
		
		if (request.type == "reloadWork") {
			function checkLoad() {
				storage.get(null, function(result) {
					setTimeout(function() {
						if(result.workReload == false) {
							chrome.tabs.executeScript(sender.tab.id, {code: 'if(document.getElementsByClassName("cxAlert cxAlertVisible").length == 1){chrome.runtime.sendMessage({type: "saveWork"});}', runAt: 'document_end'});
							if(loopCount<=15) {
								loopCount = loopCount + 1;
								checkLoad();
							}
						}
					}, 1000);
				});
			}
			loopCount=0;
			storage.set({'workReload': false});
			checkLoad();
		}
		
		if (request.type == "saveWork") {
			storage.set({"workReload": true});
			if (request.closeSender == true) { chrome.tabs.remove(sender.tab.id); }
			// load variables
			chrome.tabs.executeScript(sender.tab.id, {
				file: '/js/work/storeWork.js',
				runAt: 'document_end'
			});
		}
		
		if (request.type == "closeWorkDVs") {
			closeWorkDVs();
			focusOnAL();
		};
		
		if (request.type == "updateWork") {
			// check that the originally id is still stored
			storage.get('actLogID', function(result) { updateWorkCounts(result.actLogID); });
			// close out any stragglers
			closeWorkDVs();
		};

		if (request.type == 'loadCatTime'){
			// check that the originally id is still stored
			storage.get('actLogID', function(result) {
				chrome.tabs.update(result.actLogId, {selected: true});
				chrome.tabs.executeScript(result.actLogId, {
					file: '/js/activityLog/loadCatTime.js',
					runAt: 'document_idle'
				});
			});
			if (request.closeSender == true) { chrome.tabs.remove(sender.tab.id); }
		}


		if (request.type == "searchIA") {
			chrome.tabs.create({ url: 'https://www.connexus.com/issueaware/search.aspx?autoSearch=true&idWebuserSubject=' + request.studentID + '&searchText=Truancy', selected: true}, function(tab) {
				// execute the download homeroom external script on the new tab
				// var changesText = result.allChanges[result.studentID].toString();
				chrome.tabs.executeScript(tab.id, {
					file: '/js/truancyIA.js',
					runAt: 'document_end'
				});
			});
		};
		if (request.type == "createLog") {
			chrome.tabs.create({ url: 'https://www.connexus.com/log/logEntry.aspx?idWebuser=' + request.studentID + '&sendto=%2flog%2fdefault.aspx%3fidWebuser%3d' + request.studentID, selected: true}, function(tab) {
				// execute the download homeroom external script on the new tab
				chrome.tabs.executeScript(tab.id, {
					file: '/js/createLog.js',
					runAt: 'document_end'
				});
			});
		};
		if (request.type == "sendWebmail") {
			storage.get(null, function(result) {	
				storage.set({globalStartDate: request.startDate, globalEndDate: request.endDate});
				chrome.tabs.create({ url: 'https://www.connexus.com/webmail?hideHeader=true/#/composemessage?idWebuser=' + request.studentID + '&includeStudent=true&includeCaretakers=true&subject=Attendance Adjustments: ' + request.startDate + " - " + request.endDate, selected: true}, function(tab) {
					// execute the download homeroom external script on the new tab
					chrome.tabs.executeScript(tab.id, {
						file: '/js/sendWebmail.js',
						runAt: 'document_end'
					});
				});
			});
		};
		if (request.type == "downloadHomeroom") {
			// check for debug mode
			// var homeroomArray = {};
			// id, name, overdue, attendanceStatus = false, escalation, escReason
			// homeroomArray['ST' + studentID] = studentArray;
			//storage.set({'homeroomArray': homeroomArray});

				chrome.tabs.create({ url: 'https://www.connexus.com/sectionsandstudents#/mystudents/' + request.homeroomID, selected: true}, function(tab) {
					// execute the download homeroom external script on the new tab
					chrome.tabs.executeScript(tab.id, {
						file: '/js/downloadHomeroom.js',
						runAt: 'document_end'
					});
				});
		};

		if (request.type == "checkAssessments") {
			chrome.tabs.create({url: "https://www.connexus.com/assessments/results/listTaken.aspx?idWebuser="+request.studentID, selected: true}, function(tab) {} );
		}

		if (request.type == "downloadSection") {
			storage.get(null,function(result){
				chrome.tabs.create({ url: 'https://www.connexus.com/lmu/sections/webusers.aspx?idSection=' + result.sectionId, selected: true}, function(tab) {
					// execute the download homeroom external script on the new tab
					chrome.tabs.executeScript(tab.id, {
						file: '/js/downloadSection.js',
						runAt: 'document_end'
					});
				});
			});	
		};

		if (request.type == "updateOverdue") {
			chrome.tabs.create({ url: 'https://www.connexus.com/sectionsandstudents#/mystudents/' + request.homeroomID, selected: true}, function(tab) {
				// execute the download homeroom external script on the new tab
				chrome.tabs.executeScript(tab.id, {
					file: '/js/truancy/loadTruancy.js',
					runAt: 'document_end'
				});
			});
		};
		if (request.type == "getTruancy") {
			if (request.first == true) {
				storage.get(null, function(result) {
					// Set the first ID in the array
					var idList = result.truancyIdList;
					var studentID = idList[0];
					storage.set({'truancyID': studentID});
					// open the tab and work
					getTruancy(studentID);
				});
			}
			if (request.first !== true) {
				storage.get(null, function(result) {
					var idList = result.truancyIdList;
					// this is from the truancy page confirming its completion
					// check completedID
					var previousID = request.completedID;
					// grab the next ID
					var nextIndex = idList.indexOf(previousID) + 1;
					// Let this run if it is within the bounds of the array. Otherwise... stop the maddness...
					if (nextIndex <= idList.length - 1) {
						var studentID = idList[nextIndex];
						storage.set({'truancyID': studentID});
						// open the tab and work
						getTruancy(studentID);
					} else {
						
						var currentdate = new Date(); 
						var hours = currentdate.getHours();
						if(hours > 12) { hours = hours - 12; var timeOfDay = "PM" } else { var timeOfDay = "AM" }
						if(hours == 12) { var timeOfDay = "PM" }
						if(hours == 0) {hours = 12};
						var minutes = currentdate.getMinutes();
						if(minutes < 10) { minutes = '0' + minutes; };
						timestamp = "Last Sync: " + (currentdate.getMonth()+1)  + "/"
										+ currentdate.getDate() + "/"
										+ currentdate.getFullYear() + " @ "  
										+ hours + ":"  
										+ minutes + " "
										+ timeOfDay;
						timestamp = timestamp.toString();
						storage.set({'homeroomTimestamp': timestamp});
						
						var timestamp = new Date();
						try{chrome.tabs.remove(sender.tab.id);} catch(err) {}
						alert("Your homeroom has been downloaded! Please open the Attendance Assistant to see your updated homeroom.");
					}
				});
			}
			
			function getTruancy(studentID) {
				// get the truancy DV for the school selected
				chrome.storage.local.get(null,function(result){ 
					chrome.tabs.create({ url: 'https://www.connexus.com/dataview/' + result.schoolVars.truancy.dataViewID + '?idWebuser=' + studentID, selected: false}, function(tab) {
						// execute the get truancy values script at the document end
						chrome.tabs.executeScript(tab.id, {
							file: '/js/truancy/getTruancy.js',
							runAt: 'document_end'
						});
					});
				});
			}
		}
		if (request.type == "closeTab") {
			try {
				chrome.tabs.remove(sender.tab.id, function(){});
			} catch(err) {
				// handle the last tab delete error
			}
		};
		////// Store any tab ID in storage to reference later
		if (request.type == "storeTabID") {
			storage.set({[request.tabTitle]: sender.tab.id});
		};
		if (request.type == "reloadTab") {
			chrome.tabs.reload(sender.tab.id);
		};
		if (request.type == "attendanceChangeCancel") {
			tabURL = sender.tab.url;
			chrome.tabs.remove(sender.tab.id, function() { });
			chrome.tabs.create({url: tabURL, selected: true}, function(tab) {} );
			
		};
	} catch(err) {

	}
  }
);

function closeWorkDVs() {
	// close any stragler windows that are on the Assessment and Lesson Data View
	chrome.windows.getAll({populate:true},function(windows){
	  windows.forEach(function(window){
		window.tabs.forEach(function(tab){
			// if the url matches, remove the warning using a message then close the tab
			if (tab.url.match(/https?:\/\/www\.connexus\.com\/dataview\/410.*/g)) {
				//close em up
				chrome.tabs.remove(tab.id);
			};
		});
	  });
	});
}

// function to focus on the activities log
function focusOnAL() {
	chrome.windows.getAll({populate:true},function(windows){
	  windows.forEach(function(window){
		window.tabs.forEach(function(tab){
			// if the url matches, focus on it
			if (tab.url.match(/https?:\/\/www\.connexus\.com\/webuser\/activity\/activity\.aspx\?idWebuser=.*/g)) {
				//focus on the new activities log
				chrome.tabs.update(tab.id, {selected: true});
			};
		});
	  });
	});
}

// function to update work
function updateWorkCounts(activitiesLogID) {
	chrome.tabs.update(activitiesLogID, {selected: true});
	chrome.tabs.executeScript(activitiesLogID, {
		file: '/js/work/loadWork.js',
		runAt: 'document_idle'
	});
}

// function to update homeroom
function updateHomeroom() {
	// tell popup to update the values from local storage
}
