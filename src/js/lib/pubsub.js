/* pubsub.js */
'use strict;'

var pubsub = (function () {

    var _subscriptions = [];
    var _topics = {};
    var _key = 0;

    var _publishing = 0;
    var _pendingKeys = [];

    function subscribe(topic, fn) {
        var keys = _topics[topic];
        if (!keys) {
            keys = _topics[topic] = [];
        }
        var key = _key;
        _subscriptions[key] = topic;
        _subscriptions[key + 1] = fn;
        _key = key + 2;
        keys.push(key);

        return key;
    }

    function unsubscribe(topic, fn)
    {
        var keys = _topics[topic];
        if (keys) {
            var subscriptions = _subscriptions;
            var foundKey = null;
            for (var i = 0, len = keys.length; i < len; i++) {
                if (subscriptions[i+1] == fn) {
                    foundKey = i;
                }
            }
            if (foundKey >= 0) {
                return unsubscribeKey(foundKey);
            }
        }
        return false;
    }
    
    function unsubscribeKey(key) {

        // don't unsubscribe while publishing is occurring.
        // instead, add the unsub to a list of pending unsubs
        if (_publishing !== 0) {
            if (!_pendingKeys) {
                _pendingKeys = [];
            }
            _pendingKeys.push(key);
            return false;
        }
        // unsubscribe
        var topic = _subscriptions[key];
        if (topic) {
            var keys = _topics[topic];
            if (keys) {
                var i = keys.indexOf(key);
                if (i >= 0) {
                    keys.splice(i, 1);
                }
            }
            delete _subscriptions[key];
            delete _subscriptions[key + 1];
        }

        return !!topic;
    }

    function publish(topic, data)
    {
        var keys = _topics[topic];
        if (keys) {
            // lock to prevent unsubs
            _publishing++;

            // publish
            for (var i = 0, len = keys.length; i < len; i++) {
                var key = keys[i];
                _subscriptions[key + 1](topic, data);
            }

            // unlock
            _publishing--;
        }

        // process pending unsubscribes
        if (_pendingKeys && _publishing == 0) {
            var pendingKey;
            while ((pendingKey = _pendingKeys.pop())) {
                unsubscribeByKey(pendingKey);
            }
        }
    }

    function getSubscriptionCount(topic) {
        if (topic)
        {
            var keys = _topics[topic];
            return keys ? keys.length : 0;
        }

        var count = 0;
        for (var topic in _topics)
        {
            count += getSubscriptionCount(topic);
        }
        return count;
    }

    function clear() {
        _subscriptions.length = 0;
        _topics = {};
    }

    return {
        clear: clear,
        publish: publish,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        getSubscriptionCount: getSubscriptionCount
    }
})();

