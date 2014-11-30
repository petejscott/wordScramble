'use strict';

var wordScramble = wordScramble || {};
wordScramble.gameBuilderLetters = (function()
{
	var ls = {};

	// letters contains duplicates to account for frequency distribution
	var letters = ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'b', 'c', 'c', 'c', 'd', 'd', 'd', 'd', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'f', 'f', 'g', 'g', 'h', 'h', 'h', 'h', 'h', 'h', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'j', 'k', 'l', 'l', 'l', 'l', 'm', 'm', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'p', 'p', 'q', 'r', 'r', 'r', 'r', 'r', 'r', 's', 's', 's', 's', 's', 's', 't', 't', 't', 't', 't', 't', 't', 't', 't', 'u', 'u', 'u', 'v', 'w', 'w', 'x', 'y', 'y', 'z'];

	ls.getUniqueRandomLetters = function(numLetters)
	{
		var random = [];
		for (var i = 0; i < numLetters; i++)
		{
			var randomIndex = Math.floor(Math.random() * letters.length);
			var letter = letters[randomIndex];
			random.push(letter);
		}
		return random;
	}

	return ls;
})();