'use strict';

var wordScramble = wordScramble || {};
wordScramble.clearWordAttemptManager = (function()
{
	var manager = {};

	var CONST_ELEMENT_ID = "#clearWordAttempt";

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

		el.addEventListener(
			'click', manager.eventHandler, false);

		wordScramble.pubsub.subscribe("wordScramble/wordAttemptUpdated", function(topic, data)
		{
			if (data.wordString.length > 0)
			{
				el.classList.add("visible");
			}
			else
			{
				el.classList.remove("visible");
			}
		});
	}

	manager.eventHandler = function(evt)
	{
		wordScramble.pubsub.publish("wordScramble/clearWordAttempt", {"target":evt.target});
		evt.preventDefault();
	}

	manager.init = function()
	{
		cleanup();
		setup();
	};
	manager.init();

	return manager;

})();