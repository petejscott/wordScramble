'use strict';

var wordScramble = wordScramble || {};
wordScramble.uiService = (function(configuration, gameService)
{
	var uiService = {};

	uiService.submitLetter = function(letter, id)
	{
		if (gameService.getGameData().letters.indexOf(letter) === -1)
		{
			// not a valid letter
			return;
		}

		var wordAttemptContainer = document.querySelector("#wordAttempt");
		wordScramble.pubsub.unsubscribe("wordScramble/wordAttemptUpdated");
		wordScramble.pubsub.subscribe("wordScramble/wordAttemptUpdated", function(topic, data)
		{
			wordAttemptContainer.textContent = data.wordString;
		});

		// if it was the last letter submitted, go ahead and roll it back
		var previousAttempt = wordScramble.wordAttemptService.getPrevious();
		if (previousAttempt != null && previousAttempt.token == id)
		{
			wordScramble.wordAttemptService.removePrevious();
			return;
		}

		// if it was not the last letter submitted, but HAS been submitted,
		// it's just not valid
		var existing = wordScramble.wordAttemptService.getByToken(id);
		if (existing && existing.length > 0 && existing[0].token === id)
		{
			console.log("stopping!");
			return;
		}

		wordScramble.wordAttemptService.add(letter, id);
	}

	function provideFeedback(feedback)
	{
		document.addEventListener('animationend', function(evt)
		{
			document.querySelector("#gameContainer").classList.remove(feedback);
		}, false);
		document.addEventListener('webkitAnimationEnd', function(evt)
		{
			document.querySelector("#gameContainer").classList.remove(feedback);
		}, false);
		document.querySelector("#gameContainer").classList.add(feedback);
	}

	function snoop()
	{
		var pubListener = function(topic, data)
		{
			console.log("log: "+topic+" received with "+JSON.stringify(data));
		}
		wordScramble.pubsub.subscribeAll(pubListener);
	}

	function subscribe()
	{
		if (configuration.debug && configuration.debug === true)
		{
			//snoop();
		}

		wordScramble.pubsub.subscribe("wordScramble/endGame", function()
		{
			gameService.clearGameCache();
		});
		wordScramble.pubsub.subscribe("wordScramble/startGame", function()
		{
			gameService.startGame();
		});
		wordScramble.pubsub.subscribe("wordScramble/submitWord", function()
		{
			gameService.submitWordAttempt(wordScramble.wordAttemptService.getWordString());
			wordScramble.wordAttemptService.clear();
		});
		wordScramble.pubsub.subscribe("wordScramble/clearWordAttempt", function()
		{
			wordScramble.wordAttemptService.clear();
		});
		wordScramble.pubsub.subscribe("wordScramble/submitLetter", function(topic, data)
		{
			var letter = data.letter;
			var token = data.token;
			uiService.submitLetter(letter, token);
		});
		wordScramble.pubsub.subscribe("wordScramble/gameReady", function()
		{

		});
		wordScramble.pubsub.subscribe("wordScramble/wordAttemptAccepted", function(topic, data)
		{
			provideFeedback('success');
		});
		wordScramble.pubsub.subscribe("wordScramble/wordAttemptAlreadyExists", function(topic, data)
		{
			provideFeedback('warning');
		});
		wordScramble.pubsub.subscribe("wordScramble/wordAttemptRejected", function(topic, data)
		{
			provideFeedback('error');
		});
		wordScramble.pubsub.subscribe("wordScramble/allWordsSolved", function(topic, data)
		{
			var words = data.words;
			wordScramble.pubsub.publish("wordScramble/endGame", {"words":words});
			wordScramble.pubsub.publish("wordScramble/startGame", {});
		});
	}

	subscribe();

	return uiService;

})(activeConfiguration, gService);
