'use strict';

var wordScramble = wordScramble || {};
wordScramble.letterListManager = (function()
{
	var manager = {};

	var CONST_ELEMENT_ID = "#letterContainer";
	var letterObjects = [];

	function getElement()
	{
		return document.querySelector(CONST_ELEMENT_ID);
	}

	function createLetterObjects(letters)
	{
		var letterObjects = letters.map(function(l, i)
		{
			return {
				token : "letter_"+ i,
				letter : l,
				selected : false,
				focused : false
			}
		});
		return letterObjects;
	}

	function getLetterObjectIndexByToken(token)
	{
		var matches = letterObjects.filter(function(lo)
		{
			return lo.token == token;
		});
		if (matches)
		{
			return letterObjects.indexOf(matches[0]);
		}
		return -1;
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

	function render(letters)
	{
		var el = getElement();
		if (el === null) return;

		var letterList = document.createElement("div");
		letterList.setAttribute("id", "letterList");

		if (letters !== null)
		{
			letterObjects = createLetterObjects(letters);
		}

		for (var i = 0, len = letterObjects.length; i < len; i++)
		{
			var o = letterObjects[i];

			var letterButton = document.createElement("input");

			letterButton.classList.add('letterButton');

			letterButton.setAttribute("data-focused", o.focused);
			letterButton.setAttribute("data-selected", o.selected);
			letterButton.setAttribute("data-letter", o.letter);
			letterButton.setAttribute("data-token", o.token);

			letterButton.setAttribute("type", "button");
			letterButton.setAttribute("tabindex", "-1");
			letterButton.setAttribute("value", o.letter);
			letterButton.setAttribute("id", o.token);

			letterButton.addEventListener('click', manager.letterClickEventHandler, false);
			letterList.appendChild(letterButton);
		}

		var shuffler = document.createElement("a");
		shuffler.appendChild(document.createTextNode("shuffle"));
		shuffler.setAttribute("href", "#shuffle");
		shuffler.setAttribute("id", "shuffler");
		shuffler.addEventListener('click', manager.shuffleClickEventHandler, false);

		el.appendChild(letterList);
		el.appendChild(shuffler);

		setStates();
	}

	function setStates()
	{
		letterObjects.forEach(function(lo)
		{
			var button = getElement().querySelector("#"+lo.token);
			if (!button) return;

			if (lo.selected)
			{
				button.classList.add('selected');
				button.setAttribute("data-selected","true");
				button.setAttribute("disabled","true");
			}
			else
			{
				button.removeAttribute("disabled");
				button.classList.remove('selected');
				button.setAttribute("data-selected","false");
			}
			if (lo.focused)
			{
				button.removeAttribute("disabled");
				button.setAttribute("data-focused","true");
				button.focus();
			}
			else
			{
				button.setAttribute("data-focused","false");
			}
		});
	}

	function shuffle()
	{
		var currentIndex = letterObjects.length, temporaryValue, randomIndex;
		while (0 !== currentIndex)
		{
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			temporaryValue = letterObjects[currentIndex];
			letterObjects[currentIndex] = letterObjects[randomIndex];
			letterObjects[randomIndex] = temporaryValue;
		}
	}

	function subscribe()
	{
		wordScramble.pubsub.subscribe("wordScramble/lettersChanged", function(topic,data)
		{
			var letters = data.letters || null;
			clear();
			render(letters);
		});
		wordScramble.pubsub.subscribe("wordScramble/wordAttemptUpdated", function(topic, data)
		{
			var tokens = data.allTokens;
			var lastToken = tokens[tokens.length - 1];
			// update the selected/focused to match the data provided
			for(var i=0, len=letterObjects.length; i<len; i++)
			{
				var lo = letterObjects[i];

				if (tokens.indexOf(lo.token) === -1)
				{
					lo.selected = false;
				}
				else
				{
					lo.selected = true;
				}

				// only focus the last item in allTokens
				if (lo.token == lastToken)
				{
					lo.focused = true;
				}
				else
				{
					lo.focused = false;
				}
			}
			setStates();
		});
	}

	manager.letterClickEventHandler = function(evt)
	{
		evt.target.blur();
		var token = evt.target.getAttribute("id");

		var loIndex = getLetterObjectIndexByToken(token);
		if (loIndex !== -1)
		{
			// registered as selected. needs to be unselected if allowed
			if (letterObjects[loIndex].selected === true)
			{
				//TODO: this can be a separate subscription now.
				wordScramble.pubsub.publish("wordScramble/submitLetter",
				{
					"letter":evt.target.getAttribute("data-letter"),
					"token":token
				});
			}
			// not yet selected. submit it!
			else
			{
				wordScramble.pubsub.publish("wordScramble/submitLetter",
				{
					"letter":evt.target.getAttribute("data-letter"),
					"token":token
				});
			}
		}
		evt.preventDefault();
	}
	manager.shuffleClickEventHandler = function(evt)
	{
		shuffle();
		wordScramble.pubsub.publish("wordScramble/lettersChanged", {});
		evt.preventDefault();
	}

	subscribe();

	return manager;

})();