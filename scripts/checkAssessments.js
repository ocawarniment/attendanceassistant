// 
var storage = chrome.storage.local;

storage.get(null, function(result) {
	setTimeout(function() {
		document.getElementById('assessments_port_FilterAssessments_ctl08_dPk_dIn').focus();
		document.getElementById('assessments_port_FilterAssessments_ctl08_dPk_dIn').class = 'riTextBox riEnabled'
		document.getElementById('assessments_port_FilterAssessments_ctl08_dPk_dIn').value = result.assessmentDate;
		document.getElementById('assessments_port_FilterAssessments_ctl08_dPk_dIn').class = 'riTextBox riEnabled field'
		document.getElementById('assessments_port_FilterAssessments_ctl08_dPk_dIn').fireEvent("onchange");
	}, 0);
	setTimeout(function() {
		document.getElementById('assessments_port_FilterAssessments_ctl09_dPk_dIn').focus();
		document.getElementById('assessments_port_FilterAssessments_ctl09_dPk_dIn').class = 'riTextBox riEnabled'
		document.getElementById('assessments_port_FilterAssessments_ctl09_dPk_dIn').value = result.assessmentDate;
		document.getElementById('assessments_port_FilterAssessments_ctl09_dPk_dIn').class = 'riTextBox riEnabled field'
		document.getElementById('assessments_port_FilterAssessments_ctl09_dPk_dIn').fireEvent("onchange");
	}, 0);
	setTimeout(function() {
		document.getElementById('assessments_port_FilterAssessments_ctl10').focus();
		document.getElementById('assessments_port_FilterAssessments_ctl10').click();
	}, 500);
});