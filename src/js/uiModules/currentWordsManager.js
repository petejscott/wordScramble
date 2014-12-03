/* currentWordsManager.js */
'use strict';

var wordScramble = wordScramble || {};
wordScramble.currentWordsManager = (function(pubsub)
{
	var manager = {};

	var CONST_ELEMENT_ID = "#currentGameSummaryContents";

	function getElement()
	{
		return document.querySelector(CONST_ELEMENT_ID);
	}

	function clear()
	{
		var el = getElement();
		if (el === null) return;

		while (el.firstChild)
		{
			el.removeChild(el.firstChild);
		}
	}
	
	var getMask = function(count)
	{
		var maskChar = "_";
		var mask = "";
		for (var i = 0; i < count; i++)
		{
			mask += maskChar += " ";
		}
		return mask;
	}

	function render(words)
	{
		var el = getElement();
		if (el === null) return;

		var currentWordsTitle = document.createElement("div");
		currentWordsTitle.setAttribute("id", "currentWordsTitle");

		var currentWordsContainer = document.createElement("div");
		currentWordsContainer.setAttribute("id", "currentWords");

		var solvedCount = 0;
		for (var i = 0, len = words.length; i < len; i++)
		{
			var wordContainer = document.createElement("span");
			wordContainer.classList.add("word");
			
			var wordObject = words[i];

			var wordNode = null;
			if (!wordObject.solved)
			{
				var maskedWord = getMask(wordObject.chars);
				wordNode = document.createTextNode(maskedWord);
				wordContainer.classList.add("missed");
				wordContainer.appendChild(wordNode);
			}
			else
			{
				wordNode = document.createTextNode(wordObject.word);
				wordContainer.classList.add("solved");
				solvedCount++;

				var defineElement = document.createElement("a");
				var defineUrl = "https://www.google.com/search?q=define+" + wordObject.word;
				defineElement.setAttribute("href", defineUrl);
				defineElement.setAttribute("title", "definition");
				defineElement.setAttribute("target", "_blank");
				
				defineElement.appendChild(wordNode);
				wordContainer.appendChild(defineElement);
			}
			currentWordsContainer.appendChild(wordContainer);
		}

		var titleText = solvedCount + " out of " + words.length;
		if (solvedCount == words.length)
		{
			currentWordsContainer.classList.add("victory");
			titleText = "Nicely done! " + titleText;
		}
		currentWordsTitle.appendChild(document.createTextNode(titleText));

		el.appendChild(currentWordsTitle);
		el.appendChild(currentWordsContainer);
	}

	function showSummary()
	{
		var summaryDrawer = document.querySelector("#gameSummary");
		if (summaryDrawer === null) return;
		
		if (!summaryDrawer.classList.contains("visible"))
		{
			summaryDrawer.classList.add("visible");
		}
	}

	function subscribe()
	{
		pubsub.subscribe("wordScramble/endGame", function(topic, data)
		{
			clear();
		});
		pubsub.subscribe("wordScramble/wordsChanged", function(topic, data)
		{
			var words = data.words;
			clear();
			render(words);
		});
	}

	subscribe();

	return manager;

})(window.pubsubz);

