'use strict';

var wordScramble = wordScramble || {};
wordScramble.letterService = function()
{
	// letters contains duplicates to account for frequency distribution
	var letters = ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'b', 'c', 'c', 'c', 'd', 'd', 'd', 'd', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'f', 'f', 'g', 'g', 'h', 'h', 'h', 'h', 'h', 'h', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'j', 'k', 'l', 'l', 'l', 'l', 'm', 'm', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'p', 'p', 'q', 'r', 'r', 'r', 'r', 'r', 'r', 's', 's', 's', 's', 's', 's', 't', 't', 't', 't', 't', 't', 't', 't', 't', 'u', 'u', 'u', 'v', 'w', 'w', 'x', 'y', 'y', 'z'];

	this.getUniqueRandomLetters = function(numLetters)
	{
		var random = [];
		for (var i = 0; i < numLetters; i++)
		{
			var randomIndex = Math.floor(Math.random() * letters.length);
			var letter = letters[randomIndex];
			if (random.indexOf(letter) == -1)
			{
				random.push(letter);
			}
			else
			{
				i--;
			}
		}
		return random;
	}

	this.shuffleLetters = function(letters)
	{
		var currentIndex = letters.length, temporaryValue, randomIndex;
		while (0 !== currentIndex)
		{
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			temporaryValue = letters[currentIndex];
			letters[currentIndex] = letters[randomIndex];
			letters[randomIndex] = temporaryValue;
		}
		return letters;
	}
}