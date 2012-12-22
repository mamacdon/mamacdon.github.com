/*jslint browser:true*/
/*global DOMParser ActiveXObject require window*/

require(["plist2js/plist2js", "beautify/beautify"], function(m_plist2js, m_jsbeautify) {
	require.ready(function() {
		function show(/**String*/ text) {
			document.getElementById("result").value = text;
			document.getElementById("resultDiv").style.display = "block";
		}
		/** @returns {Document} */
		function parseXmlDocument(/**String*/ text) {
			var xmlDoc;
			if (window.DOMParser) {
				var parser = new DOMParser();
				xmlDoc = parser.parseFromString(text, "text/xml");
			} else {
				xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = "false";
				xmlDoc.loadXML(text);
			}
			if (!xmlDoc) {
				throw new Error("Couldn't parse the file (are you sure it's a PList XML file?)");
			}
			return xmlDoc;
		}
		function convert(/**String*/ plist) {
			if (plist.replace(/^\s+|\s+$/g, "") === "") {
				show("You didn't provide a .tmLanguage file :(");
			} else {
				try {
					var xmlDoc = parseXmlDocument(plist);
					var result = m_plist2js.convertToString(xmlDoc);
					show(result);
				} catch (e) {
					show(e);
				}
			}
		}
		
		var textarea = document.getElementById("textarea");
		
		// Click
		document.getElementById("convert").onclick = function() {
			convert(textarea.value);
		};
		document.getElementById("cleanup").onclick = function() {
			var resultTextarea = document.getElementById("result");
			var options = { indent_size: 1, indent_char: "\t" };
			resultTextarea.value = m_jsbeautify.js_beautify(resultTextarea.value, options);
		};
		
		// Change
		var lastFired;
		textarea.onkeyup = function() {
			lastFired = +new Date();
			var makeFunc = function(mytime) {
				return function() {
					if (lastFired === mytime) {
						convert(textarea.value);
					}
				};
			};
			window.setTimeout(makeFunc(lastFired), 300);
		};
		
		// DnD
		if (window.File && window.FileReader && window.FileList) {
			var kill = function(e) {
				e.stopPropagation();
				e.preventDefault();
			};
			
			textarea.ondragover = function(e) {
				kill(e);
				textarea.className = "drag";
			};
			textarea.ondragleave = function(e) {
				kill(e);
				textarea.className = "";
			};
			textarea.ondrop = function(dropEvent) {
				kill(dropEvent);
				textarea.className = "";
				var files = dropEvent.dataTransfer.files;
				if (files) {
					var file = files[0];
					var reader = new window.FileReader();
					reader.onload = function(loadEvent) {
						var fileContent = loadEvent.target.result;
						textarea.value = fileContent;
						convert(fileContent);
					};
					reader.readAsText(file);
				} else {
					var text = dropEvent.dataTransfer.getData("Text");
					textarea.value = text;
					convert(text);
				}
			};
		}
	});
});