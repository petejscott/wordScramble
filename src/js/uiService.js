/* uiService.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.uiService = (function (pubsub) {
  var uiService = {}

  var CONST_GAME_ELEMENT_ID = '#gameContainer'
  function getElement (selector) {
    return document.querySelector(selector)
  }

  function provideFeedback (feedback) {
    var el = getElement(CONST_GAME_ELEMENT_ID)
    if (el === null) return

    document.addEventListener('animationend', function (evt) {
      el.classList.remove(feedback)
    }, false)
    document.addEventListener('webkitAnimationEnd', function (evt) {
      el.classList.remove(feedback)
    }, false)

    el.classList.add(feedback)
  }

  function subscribe () {
    pubsub.subscribe('wordScramble/gameReady', function () {

    })
    pubsub.subscribe('wordScramble/wordAttemptAccepted', function (topic, data) {
      provideFeedback('success')
    })
    pubsub.subscribe('wordScramble/wordAttemptAlreadyExists', function (topic, data) {
      provideFeedback('warning')
    })
    pubsub.subscribe('wordScramble/wordAttemptRejected', function (topic, data) {
      provideFeedback('error')
    })
    pubsub.subscribe('wordScramble/allWordsSolved', function (topic, data) {
      var words = data.words
      pubsub.publish('wordScramble/endGame', {'words': words})
      pubsub.publish('wordScramble/startGame', {})
    })
  }

  subscribe()

  return uiService
})(window.pubsub)

