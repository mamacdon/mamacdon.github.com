define(function() {

var exports = {};

exports.readFileSync = function(filename, encoding) {
	try {
		var objXml = new XMLHttpRequest();
		objXml.open("GET", filename, false);
		objXml.send(null);
		return objXml.responseText;
	} catch (e) {
		return null;
	}
};

return exports;
});