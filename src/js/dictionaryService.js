'use strict';

var wordScramble = wordScramble || {};
wordScramble.dictionaryService = function()
{
	var _dict = {};
	
	this.setDictionary = function(dict)
	{
		if (!dict)
		{
			throw "Cannot set dictionary to an empty value";
		}
		_dict = dict;
		
		if (this.onDictionaryReady) this.onDictionaryReady();
	}
	this.getDictionary = function()
	{
		return _dict;
	}
}

wordScramble.dictionaryService.prototype.storageKey = 'wordScramble.dict';
wordScramble.dictionaryService.prototype.onDictionaryReady = null;

wordScramble.dictionaryService.prototype.loadDictionary = function(pathToDict)
{
	if (!pathToDict) throw "Missing path to dictionary";
	this.retrieveDictionary(pathToDict, this.parseDictionary);
}

wordScramble.dictionaryService.prototype.retrieveDictionary = function(pathToDict, callback)
{
	if (!pathToDict) throw "Missing path to dictionary";
	
	var dService = this;
	
	if (window.localStorage !== null && window.localStorage.getItem(dService.storageKey) !== null)
	{
		callback(window.localStorage.getItem(dService.storageKey) , dService);
		return;
	}
	var filename = pathToDict;
	
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function()
	{
		if(xmlhttp.status==200 && xmlhttp.readyState==4)
		{ 
			var dict = xmlhttp.responseText;
			if ( window.localStorage !== null ) 
			{
                window.localStorage.setItem(dService.storageKey, dict);
            }
			callback(dict, dService);
		}
		else if (xmlhttp.status != 200 && xmlhttp.readyState==4)  
		{
			throw "Cannot retrieve dictionary";
     		return;
		}
	}
	xmlhttp.open("GET",filename,true);
	xmlhttp.send();
}

wordScramble.dictionaryService.prototype.parseDictionary = function(dict, dService)
{
	var words = dict.split( "\n" );
	dService.setDictionary(words);
}

wordScramble.dictionaryService.prototype.removeCache = function()
{
	if (window.localStorage !== null) 
	{
		window.localStorage.removeItem(this.storageKey);
	}
}