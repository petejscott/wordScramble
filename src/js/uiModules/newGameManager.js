/* newGameManager.js */
'use strict';

var wordScramble = wordScramble || {};
wordScramble.newGameManager = (function(pubsub)
{
	var manager = {};

	var CONST_ELEMENT_ID = "#newGame";

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
	}

	manager.eventHandler = function(evt)
	{
		pubsub.publish("wordScramble/endGame", {"target":evt.target});
		pubsub.publish("wordScramble/startGame", {"target":evt.target});
		evt.preventDefault();
	}

	manager.init = function()
	{
		cleanup();
		setup();
	};
	manager.init();

	return manager;

})(window.pubsubz);

