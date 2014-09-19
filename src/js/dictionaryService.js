'use strict';

var wordScramble = wordScramble || {};
wordScramble.dictionaryService = (function(configuration)
{
	var dictService = {};

	var dict = {};
	var storageKey = "wordScramble.dict";

	function setDictionary(input)
	{
		if (!input)
		{
			throw "Cannot set dictionary to an empty value";
		}
		dict = parseDictionary(input);
		wordScramble.pubsub.publish("wordScramble/dictionaryReady", { "dict" : dict });
	}

	function parseDictionary(input)
	{
		var end = '\n';
		if (input.indexOf("\r\n") !== -1)
		{
			end = "\r\n";
		}
		var words = input.split(end);
		return words;
	}

	function removeCache()
	{
		if (window.localStorage !== null)
		{
			window.localStorage.removeItem(storageKey);
		}
	}

	dictService.getDictionary = function()
	{
		return dict;
	}

	dictService.loadDictionary = function(pathToDict)
	{
		if (!pathToDict)
		{
			throw "Missing path to dictionary";
		}
		if (window.localStorage !== null && window.localStorage.getItem(storageKey) !== null)
		{
			setDictionary(window.localStorage.getItem(storageKey));
			return;
		}
		var filename = pathToDict;

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function()
		{
			if (xmlhttp.status == 200 && xmlhttp.readyState == 4)
			{
				var response = xmlhttp.responseText;
				if (window.localStorage !== null)
				{
					window.localStorage.setItem(storageKey, response);
				}
				setDictionary(response);
			}
			else if (xmlhttp.status != 200 && xmlhttp.readyState == 4)
			{
				throw "Cannot retrieve dictionary";
				return;
			}
		}
		xmlhttp.open("GET", filename, true);
		xmlhttp.send();
	}

	dictService.loadDictionary(configuration.dictionaryUrl);

	return dictService;

})(wordScramble.configuration);