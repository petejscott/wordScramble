'use strict';

var wordScramble = wordScramble || {};
wordScramble.uiService = (function()
{
	var uiService = {};

	var CONST_ELEMENT_ID = "#gameContainer";

	function getElement()
	{
		return document.querySelector(CONST_ELEMENT_ID);
	}

	function provideFeedback(feedback)
	{
		var el = getElement();
		if (el === null) return;

		document.addEventListener('animationend', function(evt)
		{
			el.classList.remove(feedback);
		}, false);
		document.addEventListener('webkitAnimationEnd', function(evt)
		{
			el.classList.remove(feedback);
		}, false);

		el.classList.add(feedback);
	}

	function subscribe()
	{
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

})();
