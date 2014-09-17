'use strict';

var wordScramble = wordScramble || {};
wordScramble.wordAttemptService = ( function()
{
	var service = {};

	var CONST_ELEMENT_ID = "#wordAttempt";
	var wordAttempts = [];

	function getElement()
	{
		return document.querySelector(CONST_ELEMENT_ID);
	}

	function subscribe()
	{
		wordScramble.pubsub.subscribe("wordScramble/wordAttemptUpdated", function(topic, data)
		{
			var el = getElement();
			if (el === null) return;
			el.textContent = data.wordString;
		});
		wordScramble.pubsub.subscribe("wordScramble/submitLetter", function(topic, data)
		{
			var letter = data.letter;
			var token = data.token;
			service.add(letter, token);
		});
		wordScramble.pubsub.subscribe("wordScramble/removeLetter", function(topic, data)
		{
			var letter = data.letter;
			var token = data.token;
			service.removePrevious();
			return;
		});
		wordScramble.pubsub.subscribe("wordScramble/clearWordAttempt", function()
		{
			service.clear();
		});
	}

	service.getByLetter = function(letter)
	{
		return wordAttempts.filter(function(wa)
		{
			return wa.letter == letter;
		});
	};

	service.getByToken = function(token)
	{
		return wordAttempts.filter(function(wa)
		{
			return wa.token == token;
		});
	};

	service.getWordString = function()
	{
		var str = wordAttempts.reduce(function(prev, wa)
		{
			return prev + wa.letter;
		},"");
		return str;
	};

	service.getAllTokens = function()
	{
		var tokens = wordAttempts.map(function(wa)
		{
			return wa.token;
		});
		return tokens;
	};

	service.getCount = function()
	{
		return wordAttempts.length;
	}

	service.getPrevious = function()
	{
		var old = wordAttempts[wordAttempts.length-1];
		return old;
	}

	service.removePrevious = function()
	{
		var old = wordAttempts.pop();
		wordScramble.pubsub.publish("wordScramble/wordAttemptUpdated",
		{
			"type":"remove",
			"wordString":service.getWordString(),
			"letter":old.letter,
			"token":old.token,
			"allTokens":service.getAllTokens()
		});
		return old;
	}

	service.clear = function()
	{
		wordAttempts = [];
		wordScramble.pubsub.publish("wordScramble/wordAttemptUpdated",
		{
			"type":"remove",
			"wordString":service.getWordString(),
			"letter":null,
			"token":null,
			"allTokens":service.getAllTokens()
		});
	}

	service.add = function(letter, token)
	{
		wordAttempts.push(
		{
			"letter": letter,
			"token" : token
		});
		wordScramble.pubsub.publish("wordScramble/wordAttemptUpdated",
		{
			"type":"add",
			"wordString":service.getWordString(),
			"letter":letter,
			"token":token,
			"allTokens":service.getAllTokens()
		});
	};

	subscribe();

	return service;
}());