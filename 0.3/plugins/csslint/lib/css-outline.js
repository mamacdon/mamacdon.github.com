/*global CSSLint cssOutline:true*/

CSSLint.addRule({
	id: "css-outline",
	name: "CSS outline",
	desc: "Dummy rule, exposes structural outline info about CSS file we parsed",
	browsers: "All",
	
	init: function(parser, reporter) {
		cssOutline = [];
		parser.addListener("startrule", function(event) {
			var selectors = event.selectors;
			if (selectors && selectors.length) {
				var selectorText = [], line = null, col = null;
				for (var i=0; i < selectors.length; i++) {
					var sel = selectors[i];
					if (line === null) { line = sel.line; }
					if (col === null) { col = sel.col; }
					selectorText.push(sel.text);
				}
				cssOutline.push({
					label: selectorText.join(", "),
					line: line,
					col: col
				});
			}
		});
	}
});