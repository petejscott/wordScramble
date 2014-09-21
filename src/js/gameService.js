'use strict';

var wordScramble = wordScramble || {};
wordScramble.gameService = (function(configuration, pubsub)
{
	var gService = {};

	var CONST_ELEMENT_ID = "#gameContainer";
	var storageKey = 'wordScramble.gameData';
	var dictionary = [];
	var data = {};

	function getElement()
	{
		return document.querySelector(CONST_ELEMENT_ID);
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
		pubsub.subscribe("wordScramble/endGame", function()
		{
			clearGameCache();
		});
		pubsub.subscribe("wordScramble/startGame", function()
		{
			startGame();
		});
		pubsub.subscribe("wordScramble/submitWord", function()
		{
			submitWordAttempt(wordScramble.wordAttemptService.getWordString());
			pubsub.publish("wordScramble/clearWordAttempt");
		});
		pubsub.subscribe("wordScramble/gameReady", function(topic, d)
		{
			var el = document.querySelector("body");
			if (el !== null)
			{
				el.classList.remove("status");
				var status = document.querySelector("#status");
				status.textContent = "";
			}
			data = d.gameData;

			pubsub.publish("wordScramble/lettersChanged", { "letters":data.letters });
-			pubsub.publish("wordScramble/wordsChanged", { "words":data.words });

			saveGameData();
		});
	}

	function clearGameCache()
	{
		var words = data.words;
		pubsub.publish("wordScramble/gameOver", {"words":words});
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
				pubsub.publish("wordScramble/wordAttemptAlreadyExists", {"word":word});
			}
			else
			{
				setWordSolved(result[0]);

				// refetch to get updated value.
				words = data.words;

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

		wordScramble.gameBuilder.build(wordScramble.dict);
	}

	subscribe();
	startGame();

	return gService;

})(wordScramble.configuration, window.pubsubz);


