'use strict';

var wordScramble = wordScramble || {};
wordScramble.wordsOfLengthQuery = function(wordsList, minLength, maxLength) 
{
	this.handle = function()
	{
		var filtered = wordsList.filter(function(w) { return w.length >= minLength && w.length <= maxLength; });
		return filtered;
	}
}