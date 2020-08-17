//https://www.connexus.com/activitytracker/default/weeksummary?idWebuser=3612545&sendTo=%2fwebuser%2foverview.aspx%3fidWebuser%3d3612545
// wait till ready

console.log('inital load');
chrome.runtime.sendMessage({type: 'loadCAT'});
