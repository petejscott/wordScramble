var testRunner = function ()
{
	'use strict';

	test('dictionaryService loadDictionary with empty path fails', function ()
	{
		throws(
			function() 
			{ 
				var sut = new wordScramble.dictionaryService(); 
				sut.loadDictionary();
			},
			/Missing path to dictionary/,
			"parameterless dictionaryService.loadDictionary() throws missing path exception");
	});
	
	test('setDictionary with null dict fails', function ()
	{
		throws(
			function() 
			{ 
				var sut = new wordScramble.dictionaryService();
				sut.loadDictionary('http://localhost/sandbox/WordScramble/src/dict/american-english.txt');
				sut.setDictionary();
			},
			/Cannot set dictionary to an empty value/,
			"setDictionary without value throws empty value exception");
	});
	
	asyncTest('retrieveDictionary', function (assert)
	{
		var callback = function(dict) 
		{ 
			ok(dict.length > 0);
			start();
		}
		var sut = new wordScramble.dictionaryService();
		sut.retrieveDictionary('http://localhost/sandbox/WordScramble/src/dict/crossword.txt',callback);
	});
	
	asyncTest('onDictionaryReady', function (assert)
	{
		var sut = new wordScramble.dictionaryService();
		sut.onDictionaryReady = function()
		{
			ok(sut.getDictionary().length > 0);
			start();
		}
		sut.loadDictionary('http://localhost/sandbox/WordScramble/src/dict/crossword.txt');
	});
	
}();