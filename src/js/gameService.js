'use strict';

var wordScramble = wordScramble || {};
wordScramble.gameService = (function(configuration)
{
	var gService = {};

	var storageKey = 'wordScramble.gameData';
	var dictionary = [];
	var data = {};

	function getLetters()
	{
		var count = configuration.letterCount;
		var letters = wordScramble.letterService.getUniqueRandomLetters(count);

		return letters;
	}

	function saveGameData()
	{
		window.localStorage.setItem(storageKey, JSON.stringify(data));
	}

	function setWordSolved(wordObject)
	{
		var index = data.words.indexOf(wordObject);
		wordObject.solved = true;
		data.words.splice(index, 1, wordObject);
	}

	function subscribe()
	{
		wordScramble.pubsub.subscribe("wordScramble/endGame", function()
		{
			clearGameCache();
		});
		wordScramble.pubsub.subscribe("wordScramble/startGame", function()
		{
			startGame();
		});
		wordScramble.pubsub.subscribe("wordScramble/submitWord", function()
		{
			submitWordAttempt(wordScramble.wordAttemptService.getWordString());
			wordScramble.pubsub.publish("wordScramble/clearWordAttempt");
		});
		wordScramble.pubsub.subscribe("wordScramble/dictionaryReady", function(topic, data)
		{
			dictionary = data.dict;
			startGame();
		});
	}

	function clearGameCache()
	{
		var words = data.words;
		wordScramble.pubsub.publish("wordScramble/gameOver", {"words":words});
		window.localStorage.removeItem(storageKey);
	}

	function submitWordAttempt(word)
	{
		var words = data.words;
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
				setWordSolved(result[0]);

				// refetch to get updated value.
				words = data.words;

				wordScramble.pubsub.publish("wordScramble/wordsChanged", {"words":words});
				wordScramble.pubsub.publish("wordScramble/wordAttemptAccepted", {"word":word});
			}
		}
		else
		{
			wordScramble.pubsub.publish("wordScramble/wordAttemptRejected", {"word":word});
		}

		var victory = words.every(function(o, i)
		{
			return o.solved === true;
		});
		if (victory)
		{
			wordScramble.pubsub.publish("wordScramble/allWordsSolved", {"words":words});
		}

		saveGameData();
	}

	function onDataReady(gameData)
	{
		data = gameData;

		wordScramble.pubsub.publish("wordScramble/lettersChanged", { "letters":data.letters });
		wordScramble.pubsub.publish("wordScramble/wordsChanged", { "words":data.words });
		wordScramble.pubsub.publish("wordScramble/gameReady", {  });

		window.localStorage.setItem(storageKey, JSON.stringify(data));
	}

	function startGame()
	{
		var data = {};

		var dataLoadSuccess = false;
		if (window.localStorage !== null && window.localStorage.getItem(storageKey) !== null)
		{
			try
			{
				var jdata = window.localStorage.getItem(storageKey);
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
				console.log("wordFinder: iteration " + messageCount);

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
						"words" : dictionary,
						"configuration" : configuration,
						"letters" : letters
					}));
				}
				else
				{
					data.words = words;
					data.letters = letters;
					onDataReady(data);
				}
			});
			worker.postMessage(JSON.stringify(
			{
				"words" : dictionary,
				"configuration" : configuration,
				"letters" : letters
			}));
		}
		else
		{
			onDataReady(data);
		}
	}

	subscribe();

	return gService;

})(wordScramble.configuration);


