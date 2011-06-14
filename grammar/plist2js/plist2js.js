/*jslint browser:true*/
/*global define */

define([], function() {
	var exports = {};
	
	/**
	 * @param {Document} xmlDoc The PList file as an XML Document
	 * @returns {String} Source code for the JavaScript object literal.
	 */
	exports.convert = function(xmlDoc) {
		/*
		<key>fileTypes</key>
		<array>
			<string></string>
		</array>
		*/
		return "fixme";
	};
	
	return exports;
});