/*jslint browser: true*/
/*global define window*/
define(['orion/URITemplate', 'text!plugins.json', 'domReady!'], function(URITemplate, plugins, document) {
	function json(str) {
		return JSON.parse(str);
	}

	var pluginsData = json(plugins).plugins;
	var TARGET = 'target', VERSION = 'version', ORION_HOME = 'OrionHome';

	(function() {
		// Turn 'pluginsData' JSON structure into objects with behavior.
		(function unmarshallPlugins() {
			function Plugin(source) {
				var keys = Object.keys(source);
				for (var i=0; i < keys.length; i++) {
					this[keys[i]] = source[keys[i]];
				}
			}
			Plugin.prototype = {
				getDescription: function() { return this.description; },
				getInstallURL: function(version, target, orionHome) {
					var ver = this.getVersion(version);
					var url = (ver && ver[0]) || null;
					if (this.orionHome && url) {
						if (orionHome) {
							url = new URITemplate(url).expand({
								OrionHome: orionHome
							});
							url = decodeURIComponent(url); // i don't know
						} else {
							url = null; // no OrionHome param passed; can't install this
						}
					}
					return url;
				},
				getSourceURL: function(version) {
					var ver = this.getVersion(version);
					return (ver && ver[1]) || null;
				},
				getName: function() { return this.name; },
				getVersion: function(versionId) {
					var versions = this.versions,
					    keys = Object.keys(versions);
					// Try an exact match first
					if (Object.prototype.hasOwnProperty.call(versions, versionId)) {
						return versions[versionId];
					}
					// Otherwise check for a range
					var version;
					keys.some(function(key) {
						var regexMatch = /([<>]=?)([\d.]+)/.exec(key),
						    rangeMatch;
						if (regexMatch) {
							var op = regexMatch[1], number = parseFloat(regexMatch[2]);
							switch (op) {
							case "<":
								rangeMatch = (versionId < number);
								break;
							case ">": 
								rangeMatch = (versionId > number);
								break;
							case "<=":
								rangeMatch = (versionId <= number);
								break;
							case ">=": 
								rangeMatch = (versionId >= number);
								break;
							}
							if (rangeMatch) {
								version = versions[key];
								return true;
							}
						}
						return false;
					});
					return version || null;
//					for (var i=0; i < keys.length; i++) {
//						var ver = keys[i];
//						if (ver.split('|').indexOf(versionId) !== -1) {
//							return versions[ver];
//						}
//					}
//					return null;
				},
				getVersionIds: function() {
					return Object.keys(this.versions);
				}
			};
			for (var i = 0; i < pluginsData.length; i++) {
				pluginsData[i] = new Plugin(pluginsData[i]);
			}
		}());
		function getPluginsMatching(predicate) {
			return pluginsData.filter(predicate);
		}
		function getAllVersions(/**Plugin[]*/ plugins) {
			return '0.5 1.0 2.0 3.0 4.0'.split(' ');
		}
		function parseParameters() {
			var params = {};
			var hash = window.location.hash && window.location.hash.substr(1);
			if (hash) {
				var array = hash.split(/\?|,|&|(=)/);
				for (var i=0; i < array.length; i++) {
					var key = array[i];
					if (key && array[i + 1] === '=') {
						params[key] = array[i + 2];
						i++;
					}
				}
			}
			return params;
		}
		function createTbody(table, plugins, params) {
			function createHeaderRow(table, versions) {
				// Plugin header cell
				var headerRow1 = table.insertRow(-1);
				var th = document.createElement('th');
				th.textContent = "Plugin";
				th.setAttribute('rowspan', 2);
				headerRow1.appendChild(th);

				// Orion Version header cell
				th = document.createElement('th');
				th.textContent = "Orion Version";
				th.setAttribute('colspan', versions.length);
				headerRow1.appendChild(th);

				// Subheaders for each version (or if installing into a target Orion, a single
				// column for the target's version)
				var headerRow2 = table.insertRow(-1);
				if (Object.prototype.hasOwnProperty.call(params, VERSION)) {
					versions = [params[VERSION]];
				}

				versions.forEach(function(version) {
					th = document.createElement('th');
					th.innerHTML = '' + version;
					headerRow2.appendChild(th);
				});
			}
			function getQualifiedInstallURL(target, /**Plugin*/ plugin, versionId, /*String?*/ orionHome) {
				function qualify(url) {
					var a = document.createElement('a');
					a.href = url;
					return a.href;
				}
				var url = plugin.getInstallURL(versionId, target, orionHome);
				if (url) {
					return new URITemplate(target + '#{,resource,params*}').expand({
						resource: '',
						params: {
							category: 'plugins',
							installPlugin: qualify(url)
						}
					});
				}
				return null;
			}
			function generatePluginCell(cell, plugin, versionId) {
				var html = ''; 
				var pluginVersion = plugin.getVersion(versionId);
				if (params[TARGET] && pluginVersion) {
					var url = getQualifiedInstallURL(params[TARGET], plugin, versionId, params[ORION_HOME]);
					if (url) {
						html = '<a href="' + url + '" title="Install into Orion">Install</a>';
					} else {
						html = '&ndash;';
					}
				} else {
					if (pluginVersion) {
						var installURL = plugin.getInstallURL(versionId), sourceURL = plugin.getSourceURL(versionId);
						if (installURL) {
							html = '<div class="pluginURL"><a href="' + installURL + '">Plugin</a></div>';
						}
						if (sourceURL) {
							html += '<div class="pluginSource"><a href="' + sourceURL + '">Source</a></div>';
						}
					} else {
						html = '&ndash;';
						cell.title = 'Not available for Orion ' + versionId;
					}
				}
				cell.innerHTML = html;
			}
			
			var versions = getAllVersions(plugins);
			createHeaderRow(table, versions);
			plugins.sort(function(p1, p2) {
				return p1.getName().toLowerCase().localeCompare(p2.getName().toLowerCase());
			});
			for (var i=0; i < plugins.length; i++) {
				var plugin = plugins[i];
				var row = table.insertRow(-1);
				var desc = row.insertCell(-1);
				desc.innerHTML = '<div class="pluginName">' + plugin.getName() + '</div>' + 
						'<div class="pluginDesc">' + plugin.getDescription() + '</div>';
				var cell, versionId;
				if (params[VERSION]) {
					cell = row.insertCell(-1);
					cell.className = 'dl';
					versionId = params[VERSION];
					generatePluginCell(cell, plugin, versionId);
				} else {
					for (var j=0; j < versions.length; j++) {
						cell = row.insertCell(-1);
						cell.className = 'dl';
						versionId = versions[j];
						generatePluginCell(cell, plugin, versionId);
					}
				}
			}
		}
		function createTable() {
			var table = document.getElementById('pluginTable');
			while (table.firstChild) {
				table.removeChild(table.firstChild);
			}
			var params = parseParameters();
			createTbody(table, getPluginsMatching(function(plugin) {
					// If VERSION is provided, only show plugins with that version defined.
					// If TARGET is provided, only show plugins with an install URL for the version.
					var versionId = params[VERSION], target = params[TARGET];
					var versionMatch = !versionId || plugin.getVersion(versionId);
					var installMatch = !versionId || !target || plugin.getInstallURL(versionId, null, params[ORION_HOME]);
					return versionMatch && installMatch;
				}), params);
		}
		// Initialization starts here
		window.addEventListener('hashchange', createTable, false);

		createTable();
	}());
});
