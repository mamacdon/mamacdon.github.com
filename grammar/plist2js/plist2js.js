/*jslint*/
/*global define Node*/

// http://www.apple.com/DTDs/PropertyList-1.0.dtd
define([], function() {
	var exports = {};
	
	/** @returns {String} */
	function toSource(/**Object*/ obj) {
		if (obj instanceof Array) {
			var elems = [];
			for (var i=0; i < obj.length; i++) {
				elems.push(toSource(obj[i]));
			}
			return "[" + elems.join(", ") + "]";
		}
		switch (typeof obj) {
			case "number":
			case "string":
				return JSON.stringify(obj); // gives us "" and escapes
			case "object":
				var props = [];
				for (var prop in obj) {
					if (obj.hasOwnProperty(prop)) {
						props.push(prop + ": " + toSource(obj[prop]));
					}
				}
				return "{ " + props.join(", ") + " }";
			case "function":
				return obj.toString(); // shouldn't happen
		}
	}
	
	/** @returns Element[] */
	function childElements(/**Node*/ node) {
		var result = [];
		var childNodes = node.childNodes;
		for (var i=0; i < childNodes.length; i++) {
			if (childNodes[i].nodeType === Node.ELEMENT_NODE) {
				result.push(childNodes[i]);
			}
		}
		return result;
	}
	
	/** @returns {Object} */
	function toObject(/**Element*/ element) {
		var i, children;
		switch (element.tagName) {
			case "plist": // root only
				return toObject(childElements(element)[0]);
			case "array":
				var array = [];
				children = childElements(element);
				for (i=0; i < children.length; i++) {
					array.push(toObject(children[i]));
				}
				return array;
			case "date": // TODO parse ISO 8601
				return String(element.textContent);
			case "dict":
				children = childElements(element);
				var obj = {};
				for (i=0; i < children.length; i++) {
					var child = children[i];
					if (child.tagName === "key") {
						obj[child.textContent] = toObject(children[++i]);
					}
				}
				return obj;
			case "real":
			case "integer":
				return Number(element.textContent);
			case "data": // base64-encoded data
			case "string":
				return String(element.textContent);
			case "true":
				return true;
			case "false":
				return false;
		}
	}
	
	exports.convert = function(doc) {
		var root = childElements(doc)[0];
		return toObject(root);
	};
	
	/**
	 * Converts a PList XML file into an object literal.
	 * @param {Document} doc The PList XML file as a Document.
	 * @returns {String} Source code for the JavaScript object literal.
	 */
	exports.convertToString = function(doc) {
		var obj = exports.convert(doc);
		// is there a better way to do this??
		return toSource(obj);
	};
	
	return exports;
});