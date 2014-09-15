'use strict';

var wordScramble = wordScramble || {};
wordScramble.gameService = function(dService, lService, configuration)
{
	var _data =
	{
	};

	function getLetters(lService)
	{
		var count = configuration.letterCount;
		var letters = lService.getUniqueRandomLetters(count);

		return letters;
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
		_data.words.splice(index, 1, wordObject);
	}
	this.startGame = function()
	{
		if (configuration.debug)
			console.log("startGame");

		var gService = this;
		gService.wordAttempt = "";
		dService.onDictionaryReady = function()
		{
			if (configuration.debug)
				console.log("onDictionaryReady");
			var data =
			{
			};

			var dataLoadSuccess = false;
			if (window.localStorage !== null && window.localStorage.getItem(gService.storageKey) !== null)
			{
				try
				{
					var jdata = window.localStorage.getItem(gService.storageKey);
					data = JSON.parse(jdata);
					dataLoadSuccess = true;
					if (configuration.debug)
						console.log("dataLoadSuccess === true: " + JSON.stringify(data));
				}
				catch(e)
				{
					console.log(e);
				}
			}
			if (!dataLoadSuccess || !data.letters || data.letters.length === 0 || !data.words || data.words.length === 0)
			{
				if (configuration.debug)
					console.log("dataLoadSuccess === false");

				var letters = getLetters(lService);
				var worker = new Worker("js/wordCollectionWorker.js");

				var messageCount = 0;
				worker.onmessage = function(evt)
				{
					if (configuration.debug)
						console.log("firing off wordCollectionWorker (iteration " + messageCount + ")");
					messageCount++;

					var words = JSON.parse(evt.data);

					if (messageCount >= 10)
					{
						throw "Too many iterations; giving up";
					}

					if (words.length < configuration.minWords)
					{
						// new letters
						letters = getLetters(lService);
						// work again
						worker.postMessage(JSON.stringify(
						{
							"words" : dService.getDictionary(),
							"configuration" : configuration,
							"letters" : letters
						}));
					}
					else
					{
						data.words = words;
						data.letters = letters;
						gService.onDataReady(data);
					}
				}
				worker.postMessage(JSON.stringify(
				{
					"words" : dService.getDictionary(),
					"configuration" : configuration,
					"letters" : letters
				}));
			}
			else
			{
				gService.onDataReady(data);
			}

		}
		gService.onDataReady = function(data)
		{
			if (configuration.debug)
				console.log("onDataReady: " + JSON.stringify(data));
			_data = data;
			window.localStorage.setItem(gService.storageKey, JSON.stringify(data));

			if (configuration.debug)
				console.log("calling onGameReady...");
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
