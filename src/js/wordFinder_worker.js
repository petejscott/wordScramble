'use strict';

var wordScramble = wordScramble || {};
wordScramble.wordFinder = function(wordList)
{
	function filterWordsLackingLetters(words, letters)
	{
		var filtered = [];
		for (var i = 0, len = words.length; i < len; i++)
		{
			var thisWord = words[i];
			var wordLetters = thisWord.split("");

			var match = wordLetters.every(function(wl)
			{
				// make sure letters are not repeated
				var count = wordLetters.filter(function(w)
				{
					return w == wl;
				}).length;
				if (count == 1)
				{
					// make sure each word letter exists in letterList
					return letters.indexOf(wl) !== -1;
				}
			});

			if (match)
			{
				filtered.push(thisWord);
			}
		}
		return filtered;
	}

	function filterWordsWithExtraLetters(words, letters)
	{
		var filtered = [];
		for (var i = 0, len = letters.length; i < len; i++)
		{
			var wordsThatContainLetter = words.filter(function(w)
			{
				return w.indexOf(letters[i]) !== -1;
			});
			filtered = filtered.concat(wordsThatContainLetter);
		}
		return filtered;
	}

	function filterDuplicateWords(words)
	{
		var filtered = [];
		var filtered = words.filter(function(element, index, array)
		{
			return array.indexOf(element) >= index;
		});
		return filtered;
	}

	function filterWordsByLength(words, minimumWordLength)
	{
		var filtered = [];
		var filtered = words.filter(function(w)
		{
			return w.length >= minimumWordLength;
		});
		return filtered;
	}

	function mapWordsToWordObjects(words)
	{
		var wordObjects = words.map(function(w)
		{
			return { "word" : w, "solved" : false, "chars" : w.length };
		});
		return wordObjects;
	}

	function sortWordObjectsByLength(wordObjects)
	{
		return wordObjects.sort(function(a, b)
		{
			return a.chars - b.chars;
		});
	}

	this.queryObjects = function(mininumWordLength, letterList)
	{
		var words = wordList;
		words = filterWordsLackingLetters(words, letterList);
		words = filterWordsWithExtraLetters(words, letterList);
		words = filterDuplicateWords(words);
		words = filterWordsByLength(words, mininumWordLength);

		var wordObjects = mapWordsToWordObjects(words);
		wordObjects = sortWordObjectsByLength(wordObjects);

		return wordObjects;
	}
}

onmessage = function(evt)
{
	var data = JSON.parse(evt.data);

	var configuration = data.configuration;
	var wordList = 		data.words;
	var letterList = 	data.letters;

	var wordFinder = new wordScramble.wordFinder(wordList);
	var wordObjects = wordFinder.queryObjects(configuration.minWordLength, letterList);

	postMessage(JSON.stringify(wordObjects));
};
