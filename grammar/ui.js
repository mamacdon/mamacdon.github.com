/*jslint browser:true*/
/*global DOMParser ActiveXObject require window*/

require(["plist2js/plist2js"], function(m_plist2js) {
	require.ready(function() {
		function show(/**String*/ text) {
			document.getElementById("result").value = text;
			document.getElementById("resultDiv").style.display = "block";
		}
		function getXmlDocument(/**String*/ text) {
			if (window.DOMParser) {
				var parser = new DOMParser();
				return parser.parseFromString(text);
			} else {
				var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = "false";
				xmlDoc.loadXML(text);
				return xmlDoc;
			}
		}
		function convert(/**String*/ plist) {
			if (plist.replace(/^\s+|\s+$/g, "") === "") {
				show("You didn't provide a .tmLanguage file :(");
			} else {
				try {
					var xmlDoc = getXmlDocument(plist);
					var result = m_plist2js.convert(plist);
					show(result);
				} catch (e) {
					show("An error occurred: " + e);
				}
			}
		}
		
		// Click
		document.getElementById("convert").onclick = function() {
			var xml = document.getElementById("textarea").value;
			convert(xml);
		};
		
		// DnD
		if (window.File && window.FileReader && window.FileList) {
			var kill = function(e) {
				e.stopPropagation();
				e.preventDefault();
			};
			var textarea = document.getElementById("textarea");
			
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