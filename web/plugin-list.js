var plugins = [
	{	name: "JS Beautify",
		description: 'Cleans up the formatting of your JavaScript code using <a href="http://jsbeautifier.org/">jsbeautifier</a>.',
		versions: {
			/*"0.2 M6/M7": [
				"/m6/beautify/jsbeautify.html",
				"https://github.com/mamacdon/mamacdon.github.com/tree/master/m6/beautify"
			],*/
			"0.2": [
				"/0.2/plugins/beautify/jsbeautify.html",
				"https://github.com/mamacdon/mamacdon.github.com/tree/master/m6/beautify"
			],
			"0.3": [
				"/0.2/plugins/beautify/jsbeautify.html",
				"https://github.com/mamacdon/mamacdon.github.com/tree/master/m6/beautify"
			]
		}
	},
	{	name: "Uglify",
		description: 'Minifies your JavaScript code using <a href="https://github.com/mishoo/UglifyJS">uglify-js</a>.',
		versions: {
			/*"0.2 M6/M7": [
				"/m6/uglify/uglify-plugin.html",
				"https://github.com/mamacdon/mamacdon.github.com/tree/master/m6/uglify"
			],*/
			"0.2": [
				"/0.2/plugins/uglify/uglify-plugin.html",
				"https://github.com/mamacdon/mamacdon.github.com/tree/master/0.2/plugins/uglify"
			],
			"0.3": [
				"/0.2/plugins/uglify/uglify-plugin.html",
				"https://github.com/mamacdon/mamacdon.github.com/tree/master/0.2/plugins/uglify"
			]
		}
	},
	{	name: "CSSLint",
		description: 'Provides validation and style tips on your CSS files using <a href="https://github.com/stubbornella/csslint">CSS Lint</a>. (Included with Orion by default starting in 0.4)',
		versions: {
			"0.2": [
				"/0.2/plugins/csslint/csslintPlugin.html",
				"https://github.com/mamacdon/mamacdon.github.com/tree/master/0.2/plugins/csslint",
			],
			"0.3": [
				"/0.3/plugins/csslint/csslintPlugin.html",
				"https://github.com/mamacdon/mamacdon.github.com/tree/master/0.3/plugins/csslint",
			]
		}
	},
	{	name: "reverse",
		description: 'A minimal plugin example used as part of a <a href="http://wiki.eclipse.org/Orion/Documentation/Developer_Guide/Simple_plugin_example">tutorial</a>.',
		versions: {
			/*"0.2 M6/M7": [
				"/m6/uglify/uglify-plugin.html",
				"https://github.com/mamacdon/mamacdon.github.com/tree/master/m6/reverse"
			],*/
			"0.2": [
				"/0.2/plugins/reverse/reversePlugin.html",
				"https://github.com/mamacdon/mamacdon.github.com/tree/master/0.2/plugins/reverse"
			],
			"0.3": [
				"/0.2/plugins/reverse/reversePlugin.html",
				"https://github.com/mamacdon/mamacdon.github.com/tree/master/0.2/plugins/reverse"
			]
		}
	},
	{	name: "Bugzilla",
		description: 'A <a href="http://dev.eclipse.org/mhonarc/lists/orion-dev/msg00688.html">Bugzilla integration</a> plugin for Orion.',
		versions: {
			"0.3": [
				"/0.3/plugins/bugzilla/plugin.html",
				"https://github.com/mamacdon/mamacdon.github.com/tree/master/0.3/plugins/bugzilla"
			]
		}
	},
	//{	name: "language.js",
	//	description: 'Provides content assist suggestions JavaScript identifiers using <a href="http://languagejs.com/">language.js</a>.',
	//	experimental: true,
	//	versions: {
	//		"0.2": [
	//			"/0.2/plugins/language/languagejsPlugin.html",
	//			"https://github.com/mamacdon/mamacdon.github.com/tree/master/0.2/plugins/language/"
	//		],
	//		"0.3": [
	//			"/0.2/plugins/language/languagejsPlugin.html",
	//			"https://github.com/mamacdon/mamacdon.github.com/tree/master/0.2/plugins/language/"
	//		]
	//	}
	//},
	{	name: "JavaScript hierarchical outline",
		description: 'Provides a simple tree view of the functions in a JavaScript file.',
		experimental: true,
		versions: {
			"0.3": [
				"http://mamacdon.github.com/outliner/outlinerPlugin.html",
				"https://github.com/mamacdon/outliner"
			]
		}
	},
	{	name: "Nonymous outline",
		description: 'Provides a tree view of JavaScript functions using the \"Function-Object Consumption\" algorithm to generate meaningful names for anonymous functions.',
		experimental: true,
		versions: {
			"0.3": [
				"http://johnjbarton.github.com/outliner/nonymousPlugin.html",
				"https://github.com/johnjbarton/outliner"
			]
		}
	},
	{	name: "CodeMirror highlighting",
		description: 'Uses <a href="http://codemirror.net/">CodeMirror</a> modes to highlight your code.',
		experimental: true,
		versions: {
			"0.4": [
				"http://mamacdon.github.com/orion-codemirror/codeMirrorPlugin.html",
				"https://github.com/mamacdon/orion-codemirror"
			]
		}
	},
	{	name: "HTML Outline",
		description: 'Provides a hierarchical outline of the elements in an HTML file.',
		versions: {
			"0.4": [
				"http://jarthorn.github.com/html-tools/htmlOutlinePlugin.html",
				"https://github.com/jarthorn/html-tools"
			]
		}
	},
	{	name: "Esprima outline",
		description: 'Uses the <a href="http://esprima.org">esprima</a> JavaScript parser to provide a detailed outline of your JavaScript code.',
		versions: {
			"0.4": [
				"http://aclement.github.com/esprima-outline/esprimaOutlinerPlugin.html",
				"https://github.com/aclement/esprima-outline"
			]
		}
	}];

document.addEventListener("DOMContentLoaded", function() {
	function getVersions() {
		var versions = {};
		for (var i=0; i < plugins.length; i++) {
			var plugin = plugins[i];
			for (var prop in plugin.versions) {
				if (plugin.versions.hasOwnProperty(prop)) {
					versions[prop] = null;
				}
			}
		}
		var array = [];
		for (prop in versions) {
			array.push(prop);
		}
		return array;
	}

	function createTbody(tableId, plugins) {
		var table = document.getElementById(tableId),
		    versions = getVersions(),
		    headerRow = table.insertRow(-1),
		    th = document.createElement("th");
		th.innerHTML = "";
		headerRow.appendChild(th);
		for (var i=0; i < versions.length; i++) {
			th = document.createElement("th");
			th.innerHTML = "Orion " + versions[i];
			headerRow.appendChild(th);
		}
		plugins.sort(function(p1, p2) {
			return p1.name.toLowerCase().localeCompare(p2.name.toLowerCase());
		});
		for (i=0; i < plugins.length; i++) {
			var plugin = plugins[i];
			var row = table.insertRow(-1);
			var desc = row.insertCell(-1);
			desc.innerHTML = '<div class="pluginName">' + plugin.name + '</div>' + '<div class="pluginDesc">' + plugin.description + '</div>';
			for (var j=0; j < versions.length; j++) {
				var cell = row.insertCell(-1),
				    versionId = versions[j],
				    pluginVersion = plugin.versions[versionId];
				cell.className = "dl";
				if (pluginVersion) {
					var html = '<div class="pluginURL"><a href="' + pluginVersion[0] + '">Plugin</a></div>';
					if (pluginVersion[1]) {
						html += '<div class="pluginSource"><a href="' + pluginVersion[1] + '">Source</a></div>';
					}
					cell.innerHTML = html;
				} else {
					cell.innerHTML = "&ndash;";
					cell.title = "Not available for Orion " + versionId;
				}
			}
		}
	}

	createTbody("pluginTable", plugins);
}, false);