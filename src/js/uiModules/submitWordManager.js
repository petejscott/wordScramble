/* submitWordManager.js */
'use strict';

var wordScramble = wordScramble || {};
wordScramble.submitWordManager = (function(pubsub)
{
	var manager = {};

	var CONST_ELEMENT_ID = "#submitWord";

	function getElement()
	{
		return document.querySelector(CONST_ELEMENT_ID);
	}

	function cleanup()
	{
		var el = getElement();
		if (el === null) return;

		el.removeEventListener(
			'click', manager.eventHandler, false);
	}
	
	function setup()
	{
		var el = getElement();
		if (el === null) return;

		el.disabled = true;
		pubsub.subscribe("wordScramble/wordAttemptUpdated", function(topic, data)
		{
			var canSubmit = isSubmitCandidate(data.wordString);
			if (canSubmit && el.disabled) {
				enable(el, data.wordString);
			}
			else if (!canSubmit && !el.disabled)
			{
				disable(el);
			}
		});
		
		el.addEventListener(
			'click', manager.eventHandler, false);
	}
	
	function isSubmitCandidate(wordString) {
		return wordString.length >= wordScramble.configuration.minWordLength;
	}
	
	function disable(el) {
		el.disabled = true;
		el.value = "...";
	}
	
	function enable(el, word) {
		el.disabled = false;
		el.value = "Submit Word";
	}

	manager.eventHandler = function(evt)
	{
		pubsub.publish("wordScramble/submitWord", {"target":evt.target});
		evt.preventDefault();
	}

	manager.init = function()
	{
		cleanup();
		setup();
	};
	manager.init();

	return manager;

})(window.pubsub);

