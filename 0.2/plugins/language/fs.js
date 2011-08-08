/*jslint browser:true*/
/*global define*/

/**
 * Poorly implements some of the Node "fs" library that is required by language js.
 */
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