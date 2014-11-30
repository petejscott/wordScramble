'use strict';

var wordScramble = wordScramble || {};
wordScramble.swipeHandler = function(swipeConfiguration)
{
	if (!swipeConfiguration)
	{
		throw "swipeConfiguration is required!";
	}
	
	var isSwiping = false;

	var touchCoords = {
		startX: null,
		startY: null,
		endX: null,
		endY: null
	};

	function isLeftSwipe(absX, absY, newX, newY)
	{
		if (absX > absY && // mostly horizontal swipe
			newX < touchCoords.startX) // towards the left
		{
			return true;
		}
		return false;
	}
	function isRightSwipe(absX, absY, newX, newY)
	{
		if (absX > absY && // mostly horizontal swipe
			newX > touchCoords.startX) // towards the right
		{
			return true;
		}
		return false;
	}
	function isUpSwipe(absX, absY, newX, newY)
	{
		if (absX < absY && // mostly vertical swipe
			newY < touchCoords.startY) // towards the top
		{
			return true;
		}
		return false;
	}
	function isDownSwipe(absX, absY, newX, newY)
	{
		if (absX < absY && // mostly vertical swipe
			newY > touchCoords.startY) // towards the bottom
		{
			return true;
		}
		return false;
	}

	function handleSwipe(callback, evt)
	{
		if (isSwiping === true) 
		{   
			return;
		}           
		isSwiping = true;
		
		callback(evt, swipeConfiguration.opts);
	}
	
	swipeConfiguration.element.addEventListener('touchend', function(evt)
	{
		isSwiping = false;
	});
	swipeConfiguration.element.addEventListener('touchstart', function(evt)
	{
		touchCoords.startX = evt.targetTouches[0].clientX;
		touchCoords.startY = evt.targetTouches[0].clientY;
		touchCoords.endX = touchCoords.startX;
		touchCoords.endY = touchCoords.startY;
	});
	swipeConfiguration.element.addEventListener('touchmove', function(evt)
	{
		var newX = evt.targetTouches[0].clientX;
        var newY = evt.targetTouches[0].clientY;
        var absX = Math.abs(touchCoords.endX - newX);
        var absY = Math.abs(touchCoords.endY - newY);

		var direction = swipeConfiguration.direction;

		if (direction === 'left' && isLeftSwipe(absX,absY,newX,newY))
		{
			if (absX > swipeConfiguration.distance)
			{
				handleSwipe(swipeConfiguration.callback, evt);
			}
		}
		else if (direction === 'right' && isRightSwipe(absX,absY,newX,newY))
		{
			if (absX > swipeConfiguration.distance)
			{
				handleSwipe(swipeConfiguration.callback, evt);
			}
		}
		else if (direction === 'up' && isUpSwipe(absX,absY,newX,newY))
		{
			if (absY > swipeConfiguration.distance)
			{
				handleSwipe(swipeConfiguration.callback, evt);
			}
		}
		else if (direction === 'down' && isDownSwipe(absX,absY,newX,newY))
		{
			if (absY > swipeConfiguration.distance)
			{
				handleSwipe(swipeConfiguration.callback, evt);
			}
		}
		
		evt.preventDefault();
	});

}