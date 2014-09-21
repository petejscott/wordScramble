'use strict';

var publisher = {
	subscribers : [],
	addSubscriber : function(subscriber)
	{
		this.subscribers.push(subscriber);
	},
	removeSubscriber : function(subscriber)
	{
		var index = this.subscribers.indexOf(subscriber);
		if (index !== -1)
		{
			this.subscribers.splice(index, 1);
		}
	},
	publish : function()
	{
		var subscribers = this.subscribers;
		var model = this;
		setTimeout(function ()
		{
	        var len = subscribers ? subscribers.length : 0;
	        while (len--)
	        {
	            subscribers[len](model);
	        }
	    },
	    0);
	}
};