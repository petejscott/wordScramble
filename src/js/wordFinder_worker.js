'use strict';

var wordScramble = wordScramble || {};
wordScramble.wordFinder = function(wordList)
{
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

	var permArr = [];
	var usedChars = [];
	function permute(input)
	{
		var i, ch;
		for (i = 0; i < input.length; i++)
		{
			ch = input.splice(i, 1)[0];
			usedChars.push(ch);
			if (input.length == 0)
			{
				permArr.push(usedChars.slice());
			}
			permute(input);
			input.splice(i, 0, ch);
			usedChars.pop();
		}
		return permArr
	};

	this.queryObjects = function(mininumWordLength, letterList)
	{
		var words = wordList;

		// filter our words to not exceed the length of letterList
		// and to at least meet the minimumWordLength
		words = words.filter(function(w){
			return w.length <= letterList.length && w.length >= mininumWordLength;
		});

		// get all possible permutations of the letterList
		var letterPermutations = permute(letterList);
		var wordPermutations = letterPermutations.map(function(lp)
		{
			return lp.join('');
		});

		// find wordPermutations that match w or contain w
		words = words.filter(function(w)
		{
			var found = wordPermutations.some(function(wp)
			{
				return wp.indexOf(w) !== -1;
			});
			if (found === true) return w;
		});

		var wordObjects = mapWordsToWordObjects(words);
		wordObjects = sortWordObjectsByLength(wordObjects);

		return wordObjects;
	}
}

var onmessage = function(evt)
{
	var data = JSON.parse(evt.data);

	var configuration = data.configuration;
	var wordList = 		data.words;
	var letterList = 	data.letters;

	var wordFinder = new wordScramble.wordFinder(wordList);
	var wordObjects = wordFinder.queryObjects(configuration.minWordLength, letterList);

	postMessage(JSON.stringify(wordObjects));
};
