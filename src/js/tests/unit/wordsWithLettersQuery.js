var testRunner = function ()
{
	'use strict';

	test('findWordsWithLetters', function ()
	{
		var words = [ 'cat' , 'cap', 'cast' , 'cape', 'care' ];
		var letters = [ 'c' , 'a' , 'p' , 't' , 'e' ]; // "care" and "cast" should not be returned.
		
		var sut = new wordScramble.wordsWithLettersQuery(words, letters);
		var words = sut.handle();
		ok(words.length == 3);
	});
	
	test('findWordsWithLetters, avoiding duplicated letters', function ()
	{
		var words = [ 'cat' , 'cap', 'cast' , 'cape', 'care' , 'papa' ];
		var letters = [ 'c' , 'a' , 'p' , 't' , 'e' ]; // "care", "cast", and "papa" should not be returned.
		
		var sut = new wordScramble.wordsWithLettersQuery(words, letters);
		var output = sut.handle();
		ok(output.length == 3);
	});
	
	// this doesn't really belong here. leaving it as a guide for development, though.
	test('composited queries', function ()
	{
		var min = 3, max = 4;
		var words = [ 'cat' , 'cap', 'cast' , 'cape', 'care' , 'papa' , 'capte' ]; // "care", "cast", "papa", and "capte" should not be returned.
		var letters = [ 'c' , 'a' , 'p' , 't' , 'e' ]; 
		
		var sut1 = new wordScramble.wordsOfLengthQuery(words, min, max);
		var sut2 = new wordScramble.wordsWithLettersQuery(sut1.handle(), letters);
		var output = sut2.handle();
		ok(output.length == 3);
	});
	
}();