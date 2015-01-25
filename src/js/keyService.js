/* keyService.js */
'use strict';

; (function(pubsub, letterListManager)
{

	function keypressEventHandler(evt)
	{
		if (evt.keyCode >= 65 && evt.keyCode <= 90) // a-zA-Z
		{
			// submit letter
		}
		else if (evt.keyCode === 13) // enter
		{
			pubsub.publish("wordScramble/submitWord", {"target":null});
			evt.preventDefault();
		}
		else if (evt.keyCode === 8) // backspace
		{
			// clear word attempt
		}
		else if (evt.keyCode === 32) // space
		{
			pubsub.publish("wordScramble/shuffleRequest");
			evt.preventDefault();
		}
	} 
	
	// bind keyboard handler
	function init() 
	{
		document.addEventListener('keyup',
			keypressEventHandler,
		false);
	}
	
	init();
	
})(window.pubsub, wordScramble.letterListManager);
