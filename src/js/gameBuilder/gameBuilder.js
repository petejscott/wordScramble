/* gameBuilder.js */
'use strict';

var wordScramble = wordScramble || {};
wordScramble.gameBuilder = (function(configuration, pubsub)
{
	var gbuilder = {};

	var data = {};
	var retries = 10;

	function getNewLetters()
	{
		var count = configuration.letterCount;
		var letters = wordScramble.gameBuilderLetters.getUniqueRandomLetters(count);

		return letters;
	}

	function onDataReady(gameData)
	{
		pubsub.publish("wordScramble/gameReady", { gameData : gameData });
	}

	function buildGame(worker, dictionary)
	{
		var letters = 	getNewLetters();
		var words = 	dictionary;

		var message = JSON.stringify(
		{
			"dictionary" : dictionary,
			"configuration" : configuration,
			"letters" : letters
		});
		worker.postMessage(message);
	}

	function build(dictionary)
	{
		var data = {};
		var worker = new Worker("js/gameBuilder/gameBuilder_dictSearch.js");
		var messageCount = 0;

		worker.addEventListener('error', function(evt)
		{
			console.log(evt);
		});
		worker.addEventListener('message', function(evt)
		{
			messageCount++;
			console.log("wordFinder: iteration " + messageCount);

			var response = JSON.parse(evt.data);

			if (messageCount >= retries)
			{
				throw new Error("Too many iterations; giving up");
			}

			if (response.words.length < configuration.minWords)
			{
				buildGame(worker, dictionary);
			}
			else
			{
				onDataReady(response);
			}
		});

		buildGame(worker, dictionary);
	}

	return {
		build : build
	};

})(wordScramble.configuration, window.pubsub);

