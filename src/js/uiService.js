'use strict';

var wordScramble = wordScramble || {};
wordScramble.uiService = function(gameContainer, gameService) 
{
	if (!gameContainer)
	{
		throw "Missing or Invalid Game Container";
	}
	if (!gameService)
	{
		throw "Missing or Invalid gameService";
	}
	
	this.getContainer = function()
	{
		return gameContainer;
	}
	
	this.getGameService = function()
	{
		return gameService;
	}
	
	// Render
	
	this.renderLetterList = function()
	{		
		var letterContainer = uiService.getContainer().querySelector('#letterContainer');
		var letterList = uiService.getContainer().querySelector('#letterList');
		
		while (letterContainer.firstChild)
		{
			letterContainer.removeChild(letterContainer.firstChild);
		}
		letterContainer.appendChild(letterList);
		while (letterList.firstChild)
		{
			letterList.removeChild(letterList.firstChild);
		}
		
		var data = this.getGameService().getGameData();
		
		for (var i=0, len=data.letters.length; i<len; i++)
		{
			var letter = data.letters[i];
			
			var letterNode = document.createTextNode(letter);
			var letterButton = document.createElement("input");
			letterButton.classList.add('letterButton');
			letterButton.setAttribute("data-letter", letter);
			letterButton.setAttribute("type", "button");
			letterButton.setAttribute("value", letter);
			
			if (gameService.wordAttempt.indexOf(letter) !== -1)
			{
				letterButton.classList.add("selected");
			}
			
			letterButton.addEventListener('click', 
				function(evt) { uiService.selectedLetterEventHandler(evt, uiService); }, 
				false);
			letterList.appendChild(letterButton);
		}
		
		var shuffler = document.createElement("a");
		shuffler.appendChild(document.createTextNode("shuffle"));
		shuffler.setAttribute("href","#shuffle");
		shuffler.setAttribute("id","shuffler");
		shuffler.addEventListener('click', uiService.shuffleHandler, false);
			
		letterContainer.appendChild(shuffler);
	}
	
	this.renderWordList = function()
	{
		var maskedWords = uiService.getContainer().querySelector('#maskedWords');
		
		while (maskedWords.firstChild)
		{
			maskedWords.removeChild(maskedWords.firstChild);
		}
		
		var data = this.getGameService().getGameData();
		
		// masked words
		var getMask = function(count) 
		{
			var maskChar = "_";
			var mask = "";
			for(var i=0; i<count; i++)
			{
				mask += maskChar += " ";
			}
			return mask;
		}
		
		for (var i=0, len=data.words.length; i<len; i++)
		{
			var wordNode = null;
			var wordContainer = document.createElement("span");;
		
			var wordObject = data.words[i];
			if (wordObject.solved)
			{
				wordNode = document.createTextNode(wordObject.word);
				wordContainer.classList.add("solved");
			}
			else 
			{
				var maskedWord = getMask(wordObject.chars);		
				wordNode = document.createTextNode(maskedWord);
			}
			wordContainer.classList.add("word");
			wordContainer.appendChild(wordNode);
			maskedWords.appendChild(wordContainer);
		}
	}
	
	this.renderPreviousWords = function()
	{
		var previousWordsWrapper = document.querySelector("#previousWordsWrapper");
		
		var previousWordsTitle = document.createElement("div");
		previousWordsTitle.setAttribute("id","previousWordsTitle");
		
		var previousWordsContainer = document.createElement("div");
		previousWordsContainer.setAttribute("id","previousWords");
		
		var previousWords = gameService.getGameData().words;
		
		var solvedCount = 0;
		for(var i=0, len=previousWords.length; i<len; i++)
		{
			var wordContainer = document.createElement("span");;
			var wordObject = previousWords[i];
			
			var wordNode = document.createTextNode(wordObject.word);
			if (wordObject.solved)
			{
				wordContainer.classList.add("solved");
				solvedCount++;
			}
			else 
			{
				wordContainer.classList.add("missed");
			}
			wordContainer.classList.add("word");
			
			var defineElement = document.createElement("a");
			var defineUrl = "https://www.google.com/search?q=define+" + wordObject.word;
			defineElement.setAttribute("href", defineUrl);
			defineElement.setAttribute("target", "_blank");
			
			defineElement.appendChild(wordNode);
			wordContainer.appendChild(defineElement);
			previousWordsContainer.appendChild(wordContainer);
		}
		
		var titleText = "";
		if (solvedCount == previousWords.length)
		{
			previousWordsContainer.classList.add("victory");			
			titleText = "Nicely done!";
		}
		else
		{
			titleText = solvedCount + " out of " + previousWords.length;
		}
		previousWordsTitle.appendChild(document.createTextNode(titleText));
		previousWordsWrapper.appendChild(previousWordsTitle);
		previousWordsWrapper.appendChild(previousWordsContainer);
		previousWordsWrapper.classList.add("visible");
		
		var previousWordsCloser = document.createElement("div");
		previousWordsCloser.setAttribute("id", "previousWordsCloser");
		previousWordsCloser.appendChild(document.createTextNode("close this list"));
		previousWordsCloser
			.addEventListener('click', 
			uiService.closePreviousWordWrapperHandler, 
			true);
		
		previousWordsWrapper.appendChild(previousWordsCloser);
	}
	
	this.startNewGame = function()
	{
		uiService.renderPreviousWords();		
		gameService.removeCache();
		gameService.startGame();
	}
	this.gameWon = function()
	{
		this.startNewGame();
	}
	this.submitLetter = function(letter)
	{
		if (gameService.getGameData().letters.indexOf(letter) === -1)
		{
			// not a valid letter
			return;
		}
		if (gameService.wordAttempt.indexOf(letter) !== -1)
		{
			// letter already submitted (note: remove this if allowing duplicate letters)
			return;
		}
		
		gameService.wordAttempt += letter;
		
		if (gameService.wordAttempt.length === 1)
		{
			uiService.getContainer().querySelector("#clearWordAttempt").classList.add("visible");
		}
		
		var letterButton = uiService.getContainer().querySelector('.letterButton[data-letter="'+letter+'"]');
		if (letterButton)
		{
			letterButton.classList.add("selected");
		}
		
		var wordAttemptContainer = uiService.getContainer().querySelector("#wordAttempt");
		wordAttemptContainer.textContent = gameService.wordAttempt;
	}
	this.submitWordAttempt = function()
	{
		gameService.submitWord(gameService.wordAttempt);
		uiService.clearWordAttempt();
	}
	this.clearWordAttempt = function()
	{
		gameService.wordAttempt = "";
		
		uiService.getContainer().querySelector("#clearWordAttempt").classList.remove("visible");
		
		var letterButtons = uiService.getContainer().querySelectorAll('.letterButton');
		for(var i=0, len=letterButtons.length; i<len; i++)
		{
			letterButtons[i].classList.remove("selected");
		}
		
		var wordAttemptContainer = uiService.getContainer().querySelector("#wordAttempt");
		wordAttemptContainer.textContent = gameService.wordAttempt;
	}
	this.shuffleLetters = function()
	{
		uiService.getGameService().shuffleLetters();
		uiService.renderLetterList();
	}
	this.closePreviousWordWrapper = function()
	{
		var previousWordsWrapper = document.querySelector("#previousWordsWrapper");		
		while (previousWordsWrapper.firstChild)
		{
			previousWordsWrapper.removeChild(previousWordsWrapper.firstChild);
		}
		previousWordsWrapper.classList.remove("visible");
	}
	
	// Event Handlers
	
	this.newGameEventHandler = function(evt)
	{
		uiService.startNewGame();
		evt.preventDefault();
	}
	this.keypressEventHandler = function(evt)
	{
		// if previous words are rendered, convert ANY keypress 
		// into a clearing of the previous word list
		if (document.querySelector('#previousWords') != null)
		{
			uiService.closePreviousWordWrapper();
			return;
		}
		
		if (evt.keyCode >= 65 && evt.keyCode <= 90) // a-zA-Z
		{
			var letter = String.fromCharCode(evt.keyCode).toLowerCase();
			uiService.submitLetter(letter);
		}
		else if (evt.keyCode === 13) // enter
		{
			uiService.submitWordAttempt();
		}
		else if (evt.keyCode === 8) // backspace
		{
			uiService.clearWordAttempt();
			evt.preventDefault();
		}
		else if (evt.keyCode === 9) // tab
		{
			uiService.shuffleLetters();
		}
		else if (evt.keyCode === 32) // space
		{
			uiService.startNewGame();
		}
	}	
	this.selectedLetterEventHandler = function(evt)
	{
		var letter = evt.target.getAttribute("data-letter");
		uiService.submitLetter(letter);
		evt.target.blur();
	}
	this.submitWordEventHandler = function(evt)
	{
		uiService.submitWordAttempt();
	}
	this.clearWordAttemptHandler = function(evt)
	{
		uiService.clearWordAttempt();
		evt.preventDefault();
	}
	this.shuffleHandler = function(evt)
	{
		uiService.shuffleLetters();
		evt.preventDefault();
	}
	this.closePreviousWordWrapperHandler = function(evt)
	{
		uiService.closePreviousWordWrapper();
	}
	
	// Cleanup
	
	this.cleanup = function()
	{
		if (this.keypressEventHandler)
		{
			this.getContainer().removeEventListener('keyup',
				this.keypressEventHandler,
				false);
		}
		
		if (this.newGameEventHandler)
		{
			this.getContainer().querySelector('#newGame')
				.removeEventListener('click',
				this.newGameEventHandler,
				false);
		}
		
		if (this.submitWordEventHandler)
		{
			this.getContainer().querySelector('#submitWord')
				.removeEventListener('click',
				this.submitWordEventHandler,
				false);
		}
		
		if (this.clearWordAttemptHandler)
		{
			this.getContainer().querySelector('#clearWordAttempt')
				.removeEventListener('click', 
				this.clearWordAttemptHandler, 
				false);
		}
	}
	
	// Setup
	
	this.setup = function()
	{
		var data = this.getGameService().getGameData();
		//console.log(data.letters);
		//console.log(data.words);

		var uiService = this;
		
		// new game 
		uiService.getContainer().querySelector('#newGame')
			.addEventListener('click', uiService.newGameEventHandler, false);
		
		// letter list
		this.renderLetterList();

		// masked words
		this.renderWordList();
		
		// submit word
		uiService.getContainer().querySelector('#submitWord')
			.addEventListener('click', uiService.submitWordEventHandler, false);
				
		// clear word
		uiService.getContainer().querySelector('#clearWordAttempt')
			.addEventListener('click', uiService.clearWordAttemptHandler, false);
	
		// bind a keyboard handler too
		document.addEventListener('keyup',
			uiService.keypressEventHandler,
			false);
	}
	
	var uiService = this;
	
	// bind to game service
	gameService.onGameReady = function()
	{
		console.log("game ready");
		uiService.cleanup();
		uiService.setup();
	}
	gameService.onWordAttemptAccepted = function(wordAttempt)
	{
		uiService.renderWordList();
	}
	gameService.onWordAttemptRejected = function(wordAttempt)
	{
		uiService.getContainer()
			.addEventListener('animationend', 
			function(evt)
			{
				uiService.getContainer().classList.remove('error');
			}, 
			false);
		uiService.getContainer()
			.addEventListener('webkitAnimationEnd',
			function(evt)
			{
				uiService.getContainer().classList.remove('error');
			},
			false);
		uiService.getContainer().classList.add('error');
	}
	gameService.onAllWordsSolved = function()
	{
		uiService.gameWon();
	}
}
