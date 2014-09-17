'use strict';

var wordScramble = wordScramble || {};
wordScramble.pubsub = ( function()
{
	var ps = {};

	var topics = {};
	var subUid = -1;

	var globalSub = null;

	ps.publish = function(topic, args)
	{
		if (!topics[topic])
		{
			return false;
		}

		var subscribers = topics[topic], len = subscribers ? subscribers.length : 0;

		while (len--)
		{
			subscribers[len].func(topic, args);
		}

		if (globalSub !== null)
		{
			globalSub.func(topic, args);
		}

		return this;
	};

	ps.subscribeAll = function(func)
	{
		globalSub = {
			token : -1,
			func : func
		};
	};

	ps.subscribe = function(topic, func)
	{
		if (!topics[topic])
		{
			topics[topic] = [];
		}

		var token = (++subUid ).toString();
		topics[topic].push(
		{
			token : token,
			func : func
		});
		return token;
	};

	ps.unsubscribe = function(token)
	{
		for (var m in topics )
		{
			if (topics[m])
			{
				for (var i = 0, j = topics[m].length; i < j; i++)
				{
					if (topics[m][i].token === token)
					{
						topics[m].splice(i, 1);
						return token;
					}
				}
			}
		}
		return this;
	};

	return ps;
}());