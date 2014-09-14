'use strict';

var wordScramble = wordScramble || {};
wordScramble.wordsWithLettersQuery = function(wordList, letterList) 
{
	this.handle = function()
	{
		var filtered = [];
		
		for (var i=0, len=wordList.length; i<len; i++)
		{
			var thisWord = wordList[i];
			var wordLetters = thisWord.split("");
			
			var match = wordLetters.every(function(wl) 
			{ 
				// make sure letters are not repeated
				var count = wordLetters.filter(function(w) { return w==wl }).length;
				if (count == 1)
				{
					// make sure each word letter exists in letterList
					return letterList.indexOf(wl) !== -1; 
				}
			});
			
			if (match)
			{
				filtered.push(thisWord);
			}
		}
		wordList = filtered;
		
		// make sure each letter in the letterlist is used
		filtered = []; // reset
		for (var i=0, len=letterList.length; i<len; i++)
		{
			var wordsThatContainLetter = wordList.filter(function(w)
			{
				return w.indexOf(letterList[i]) !== -1;
			});
			filtered = filtered.concat(wordsThatContainLetter);
		}
		wordList = filtered;
		
		// clean up the duplicate words in wordList
		filtered = [];
		var filtered = wordList.filter(function(element, index, array)
		{
			return array.indexOf(element) >= index;
		});
		wordList = filtered;
		
		return wordList;
	}
}