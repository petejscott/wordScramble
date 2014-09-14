var testRunner = function ()
{
	'use strict';

	test('letterService.GetUniqueRandomLetters() returns proper amount', function ()
	{
		var letterService = new wordScramble.letterService();
		var arr = letterService.getUniqueRandomLetters(4);
		ok(arr.length == 4);
		
		var arr = letterService.getUniqueRandomLetters(7);
		ok(arr.length == 7);
	});
	
}();