/*jslint browser:true*/
/*global require */

require(["./lib/language", "fs"], function(m_language, m_fs) {
	var jsGrammar = m_fs.readFileSync("languages/JavaScript.language");
	var parser = new m_language.Parser(jsGrammar);
	
	var result = parser.parse(" function f() { var q = 'x'; } ");
	var x;
});