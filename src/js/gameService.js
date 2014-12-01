'use strict';

var wordScramble = wordScramble || {};
wordScramble.gameService = (function(configuration, pubsub)
{
	var gService = {};

	var CONST_ELEMENT_ID = "#gameContainer";
	var storageKey = 'wordScramble.gameData';
	var previousStorageKey = 'wordScramble.previousGameData';
	var dictionary = [];
	var gameData = {};

	function getElement()
	{
		return document.querySelector(CONST_ELEMENT_ID);
	}

	function saveGameData()
	{
		window.localStorage.setItem(storageKey, JSON.stringify(gameData));
	}
	function loadGameData()
	{
		if (!window.localStorage) return;
		var storedData = window.localStorage.getItem(storageKey);
		if (storedData)
		{
			gameData = JSON.parse(storedData);
			return true;
		}
		return false;
	}

	function setWordSolved(wordObject)
	{
		var index = gameData.words.indexOf(wordObject);
		wordObject.solved = true;
		gameData.words.splice(index, 1, wordObject);
	}

	function subscribe()
	{
		pubsub.subscribe("wordScramble/endGame", function()
		{
			clearGameCache();
		});
		pubsub.subscribe("wordScramble/startGame", function()
		{
			startGame();
			pubsub.publish("wordScramble/clearWordAttempt");
		});
		pubsub.subscribe("wordScramble/submitWord", function()
		{
			submitWordAttempt(wordScramble.wordAttemptService.getWordString());
			pubsub.publish("wordScramble/clearWordAttempt");
		});
		pubsub.subscribe("wordScramble/gameReady", function(topic, data)
		{
			console.log(data);
			var el = document.querySelector("body");
			if (el !== null)
			{
				el.classList.remove("status");
				var status = document.querySelector("#status");
				status.textContent = "";
			}
			gameData = data.gameData;

			pubsub.publish("wordScramble/lettersChanged", { "letters":gameData.letters });
-			pubsub.publish("wordScramble/wordsChanged", { "words":gameData.words });

			saveGameData();
		});
	}

	function clearGameCache()
	{
		window.localStorage.removeItem(previousStorageKey);		
		window.localStorage.setItem(previousStorageKey, JSON.stringify(gameData));
		window.localStorage.removeItem(storageKey);	
		
		var words = gameData.words;
		pubsub.publish("wordScramble/gameOver", {"words":words});
	}

	function submitWordAttempt(word)
	{
		var words = gameData.words;
		var result = words.filter(function(o)
		{
			return o.word === word;
		});
		if (result && result[0] != null)
		{
			if (result[0].solved === true)
			{
				pubsub.publish("wordScramble/wordAttemptAlreadyExists", {"word":word});
			}
			else
			{
				setWordSolved(result[0]);

				// refetch to get updated value.
				words = gameData.words;

				pubsub.publish("wordScramble/wordsChanged", {"words":words});
				pubsub.publish("wordScramble/wordAttemptAccepted", {"word":word});
			}
		}
		else
		{
			pubsub.publish("wordScramble/wordAttemptRejected", {"word":word});
		}

		var victory = words.every(function(o, i)
		{
			return o.solved === true;
		});
		if (victory)
		{
			pubsub.publish("wordScramble/allWordsSolved", {"words":words});
		}

		saveGameData();
	}

	function startGame()
	{
		var el = document.querySelector("body");
		if (el !== null)
		{
			el.classList.add("status");
			var status = document.querySelector("#status");
			status.textContent = "Preparing game...";
		}

		var loaded = loadGameData();
		if (loaded)
		{
			pubsub.publish("wordScramble/gameReady", { gameData : gameData });
		}
		else
		{
			wordScramble.gameBuilder.build(wordScramble.dict);
		}
		
		var previousGameDataStr = window.localStorage.getItem(previousStorageKey);
		if (previousGameDataStr.length === 0) return;
		
		var previousGameData = JSON.parse(previousGameDataStr);
		if (previousGameData === null) return;
		
		pubsub.publish("wordScramble/previousGameDataAvailable", {"words":previousGameData.words});
	}

	subscribe();
	startGame();

	return gService;

})(wordScramble.configuration, window.pubsubz);


