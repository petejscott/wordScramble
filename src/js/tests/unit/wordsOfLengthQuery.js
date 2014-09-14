var testRunner = function ()
{
	'use strict';

	test('getWordsOfLength', function (assert)
	{
		var words = [ 'a', 'ab', 'abc', 'abde', 'abdef', 'abcdefg' ];
		var min = 3, max = 4;
		
		var sut = new wordScramble.wordsOfLengthQuery(words, min, max);
		var words = sut.handle();
		ok(words.every(function(x) { return x.length >= min && x.length <= max }));
		ok(words.length === 2);
	});
	
}();