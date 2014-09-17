'use strict';

var wordScramble = wordScramble || {};
wordScramble.gameService = function(dService, configuration)
{
	var _data = {};
	var wordAttempt = [];

	function getLetters()
	{
		var count = configuration.letterCount;
		var letters = wordScramble.letterService.getUniqueRandomLetters(count);

		return letters;
	}

	(function subscribe(gService)
	{
		wordScramble.pubsub.subscribe("wordScramble/endGame", function()
		{
			gService.clearGameCache();
		});
		wordScramble.pubsub.subscribe("wordScramble/startGame", function()
		{
			gService.startGame();
		});
		wordScramble.pubsub.subscribe("wordScramble/submitWord", function()
		{
			gService.submitWordAttempt(wordScramble.wordAttemptService.getWordString());
			wordScramble.pubsub.publish("wordScramble/clearWordAttempt");
		});
	})(this);

	// create a word attempt object for these 6 methods
	this.addAttempt = function(letter, id)
	{
		if (!id) id = -1;
		wordAttempt.push({"letter":letter,"id":id});
	}
	this.getPreviousAttempt = function()
	{
		if (wordAttempt.length == 0) return null;
		return wordAttempt[wordAttempt.length];
	}
	this.removePreviousAttempt = function()
	{
		if (wordAttempt.length > 0)
		{
			return wordAttempt.pop();
		}
		return null;
	}
	this.getAttempts = function()
	{
		return wordAttempt;
	}
	this.clearAttempt = function()
	{
		wordAttempt = [];
	}
	this.getWordAttemptString = function()
	{
		var str = "";
		wordAttempt.forEach(function(w)
		{
			str+=w.letter;
		});
		return str;
	}
	this.getGameData = function()
	{
		return _data;
	}
	this.saveGameData = function()
	{
		window.localStorage.setItem(gService.storageKey, JSON.stringify(_data));
	}
	this.setWordSolved = function(wordObject)
	{
		var index = _data.words.indexOf(wordObject);
		wordObject.solved = true;
		_data.words.splice(index, 1, wordObject);
	}
	this.startGame = function()
	{
		var gService = this;
		gService.clearAttempt();
		dService.onDictionaryReady = function()
		{
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
				}
				catch(e)
				{
					console.log(e);
				}
			}
			if (!dataLoadSuccess || !data.letters || data.letters.length === 0 || !data.words || data.words.length === 0)
			{
				var letters = getLetters();
				var worker = new Worker("js/wordFinder_worker.js");

				var messageCount = 0;
				worker.addEventListener('error', function(evt)
				{
					console.log(evt);
				});
				worker.addEventListener('message', function(evt)
				{
					messageCount++;

					var words = JSON.parse(evt.data);

					if (messageCount >= 10)
					{
						throw "Too many iterations; giving up";
					}

					if (words.length < configuration.minWords)
					{
						// new letters
						letters = getLetters();
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
				});

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
			wordScramble.pubsub.publish("wordScramble/lettersChanged", { "letters":data.letters });
			wordScramble.pubsub.publish("wordScramble/wordsChanged", { "words":data.words });

			_data = data;
			window.localStorage.setItem(gService.storageKey, JSON.stringify(data));

			wordScramble.pubsub.publish("wordScramble/gameReady", {  });
		}
		dService.loadDictionary(configuration.dictionaryUrl);
	}
}

wordScramble.gameService.prototype.storageKey = 'wordScramble.gameData';
wordScramble.gameService.prototype.clearGameCache = function()
{
	var words = this.getGameData().words;
	wordScramble.pubsub.publish("wordScramble/gameOver", {"words":words});
	window.localStorage.removeItem(this.storageKey);
}
wordScramble.gameService.prototype.submitWordAttempt = function(word)
{
	var words = this.getGameData().words;
	var result = words.filter(function(o)
	{
		return o.word === word;
	});
	if (result && result[0] != null)
	{
		if (result[0].solved === true)
		{
			wordScramble.pubsub.publish("wordScramble/wordAttemptAlreadyExists", {"word":word});
		}
		else
		{
			this.setWordSolved(result[0]);

			// refetch to get updated value.
			words = this.getGameData().words;

			wordScramble.pubsub.publish("wordScramble/wordsChanged", {"words":words});
			wordScramble.pubsub.publish("wordScramble/wordAttemptAccepted", {"word":word});
		}
	}
	else
	{
		wordScramble.pubsub.publish("wordScramble/wordAttemptRejected", {"word":word});
	}

	this.clearAttempt();

	var victory = words.every(function(o, i)
	{
		return o.solved === true;
	});
	if (victory)
	{
		wordScramble.pubsub.publish("wordScramble/allWordsSolved", {"words":words});
	}

	this.saveGameData();
}
