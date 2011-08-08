/*global define*/

/**
 * Poorly implements some of the Node "path" library that is required by language js.
 */
define(function() {

var exports = {};

function normalize(p) {
	var segments = p.split(/\/+/),
		newPath = [];
	for (var i=0; i < segments.length; i++) {
		var segment = segments[i];
		if (segment === "..") {
			newPath.pop();
		} else if (segment !== ".") {
			newPath.push(segment);
		}
	}
	if (p[p.length-1] === "/") {
		// preserve trailing backslash
		newPath.push("/");
	}
	return newPath.join("/");
}

function join(/*path1, path2, ...*/) {
	return normalize(Array.prototype.slice.call(arguments, 0).join("/"));
}

function dirname(filename) {
	// lie, since we really know nothing about the server directory structure
	var p = filename.split(/\/+/);
	if (p[p.length-1] !== "/") {
		p.pop();
	}
	return p.join("/");
}

exports.normalize = normalize;
exports.join = join;
exports.dirname = dirname;

return exports;
});