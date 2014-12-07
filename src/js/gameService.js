/* gameService.js */
'use strict';

var wordScramble = wordScramble || {};
wordScramble.gameService = (function(configuration, pubsub)
{
	var gService = {};

	var storageKey = 'wordScramble.gameData';
	var previousStorageKey = 'wordScramble.previousGameData';
	var dictionary = [];
	var gameData = {};

	var CONST_TURN_ACTIONS_ELEMENT_ID = "#turnActions";
	var CONST_LETTER_LIST_ELEMENT_ID = "#letterList";
	var CONST_WORD_LIST_ELEMENT_ID = "#maskedWords";
	var CONST_SUBMIT_ELEMENT_ID = "#turnSubmit";
	var CONST_SHUFFLE_ELEMENT_ID = ".shuffleContainer";
	
	function getElement(selector)
	{
		return document.querySelector(selector);
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
	
	function clearElement(el)
	{
		if (el === null) return;
		while (el.firstChild)
		{
			el.removeChild(el.firstChild);
		}
	}
	
	function clearGameUI()
	{
		var statusUI = getElement(CONST_LETTER_LIST_ELEMENT_ID);
		if (statusUI !== null) 
		{
			clearElement(statusUI);
		}
		statusUI.textContent = "Preparing Game...";
		
		var shuff = getElement(CONST_SHUFFLE_ELEMENT_ID);
		if (!shuff.classList.contains("hide")) shuff.classList.add("hide");
		
		var turnActions = getElement(CONST_TURN_ACTIONS_ELEMENT_ID);
		if (!turnActions.classList.contains("hide")) turnActions.classList.add("hide");
		
		var turnSubmit = getElement(CONST_SUBMIT_ELEMENT_ID);		
		if (!turnSubmit.classList.contains("hide")) turnSubmit.classList.add("hide");
		
		var wordList = getElement(CONST_WORD_LIST_ELEMENT_ID);
		if (!wordList.classList.contains("hide")) wordList.classList.add("hide");
	}
	
	function setGameUI()
	{
		var shuff = getElement(CONST_SHUFFLE_ELEMENT_ID);
		if (shuff.classList.contains("hide")) shuff.classList.remove("hide");		
		
		var turnActions = getElement(CONST_TURN_ACTIONS_ELEMENT_ID);
		if (turnActions.classList.contains("hide")) turnActions.classList.remove("hide");
		
		var turnSubmit = getElement(CONST_SUBMIT_ELEMENT_ID);		
		if (turnSubmit.classList.contains("hide")) turnSubmit.classList.remove("hide");
		
		var wordList = getElement(CONST_WORD_LIST_ELEMENT_ID);
		if (wordList.classList.contains("hide")) wordList.classList.remove("hide");
	}

	function subscribe()
	{
		pubsub.subscribe("wordScramble/endGame", function()
		{
			clearGameUI();
			clearGameCache();
		});
		pubsub.subscribe("wordScramble/startGame", function()
		{
			startGame();
			setGameUI();
			pubsub.publish("wordScramble/clearWordAttempt");
		});
		pubsub.subscribe("wordScramble/submitWord", function()
		{
			submitWordAttempt(wordScramble.wordAttemptService.getWordString());
			pubsub.publish("wordScramble/clearWordAttempt");
		});
		pubsub.subscribe("wordScramble/gameReady", function(topic, data)
		{
			gameData = data.gameData;

			pubsub.publish("wordScramble/lettersChanged", { "letters":gameData.letters });
			pubsub.publish("wordScramble/wordsChanged", { "words":gameData.words });

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

})(wordScramble.configuration, window.pubsub);

