'use strict';

var wordScramble = wordScramble || {};
wordScramble.gameService = function(dService, lService, configuration) 
{
	var _data = {};
	
	function getLetters(lService)
	{
		var count = configuration.letterCount;
		var letters = lService.getUniqueRandomLetters(count);
		
		return letters;
	}
	function getWords(dService, letters)
	{
		var words = dService.getDictionary();
		
		var withLetterQuery = new wordScramble.wordsWithLettersQuery(words, letters);
		words = withLetterQuery.handle();
		
		var min = configuration.minWordLength, max = letters.length;
		var lengthQuery = new wordScramble.wordsOfLengthQuery(words, min, max);
		words = lengthQuery.handle();
		
		// transform the word array into word objects
		var wordObjects = words.map(function(w) { return { "word" : w , "solved" : false , "chars" : w.length }; });
		
		// and sort them by length
		wordObjects.sort(function(a, b) 
		{
			return a.chars - b.chars;
		});
		
		return wordObjects;
	}
	function createGameData(lService, dService)
	{
		var data = {};
		data.letters = getLetters(lService);
		data.words = getWords(dService, data.letters);
		
		if (data.words.length < configuration.minWords)
		{
			data = createGameData(lService, dService);
		}
		
		return data;
	}
	function populateGameData(lService, dService)
	{
		var data = {};
		
		var dataLoadSuccess = false;
		if (window.localStorage !== null && window.localStorage.getItem(gService.storageKey) !== null)
		{
			try
			{
				var jdata = window.localStorage.getItem(gService.storageKey);
				data = JSON.parse(jdata);
				dataLoadSuccess = true;
			}
			catch(e)
			{
				console.log(e);
			}
		}
		if (!dataLoadSuccess)
		{
			data = createGameData(lService, dService);
			window.localStorage.setItem(gService.storageKey, JSON.stringify(data));
		}
		
		if (configuration.cheatMode)
		{
			console.log(data.words);
		}
		
		return data;
	}
	this.getGameData = function()
	{
		return _data;
	}
	this.saveGameData = function()
	{
		window.localStorage.setItem(gService.storageKey, JSON.stringify(_data));
	}
	this.shuffleLetters = function()
	{
		var letterService = new wordScramble.letterService();
		_data.letters = letterService.shuffleLetters(_data.letters);
	}
	this.setWordSolved = function(wordObject)
	{
		var index = _data.words.indexOf(wordObject);
		wordObject.solved = true;
		_data.words.splice(index,1,wordObject);
	}
	this.startGame = function()
	{
		var gService = this;
		gService.wordAttempt = "";
		dService.onDictionaryReady = function()
		{
			_data = populateGameData(lService, dService);
			gService.onGameReady(gService);
		}
		dService.loadDictionary(configuration.dictionaryUrl);
	}
}

wordScramble.gameService.prototype.storageKey = 'wordScramble.gameData';
wordScramble.gameService.prototype.wordAttempt = "";
wordScramble.gameService.prototype.removeCache = function()
{
	window.localStorage.removeItem(this.storageKey);
}
wordScramble.gameService.prototype.submitWord = function(wordAttempt)
{
	var result = this.getGameData().words.filter(function(o)
	{
		return o.word === wordAttempt;
	});
	if (result && result[0] != null)
	{
		if (result[0].solved === true)
		{
			if (this.onWordAttemptAlreadyAccepted)
			{
				this.onWordAttemptAlreadyAccepted(wordAttempt);
			}
		}
		else
		{
			this.setWordSolved(result[0]);
			if (this.onWordAttemptAccepted) 
			{
				this.onWordAttemptAccepted(wordAttempt);
			}
		}
	}
	else if (this.onWordAttemptRejected)
	{
		this.onWordAttemptRejected(wordAttempt);
	}
	
	this.wordAttempt = "";
	
	var victory = this.getGameData().words.every(function(o, i)
	{
		return o.solved === true;
	});
	if (victory && this.onAllWordsSolved)
	{
		this.onAllWordsSolved();
	}
	
	this.saveGameData();
}

wordScramble.gameService.prototype.onGameReady = null;
wordScramble.gameService.prototype.onWordAttemptAccepted = null;
wordScramble.gameService.prototype.onWordAttemptAlreadyAccepted = null;
wordScramble.gameService.prototype.onWordAttemptRejected = null;
wordScramble.gameService.prototype.onAllWordsSolved = null;
