/* clearWordAttemptManager.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.clearWordAttemptManager = (function (pubsub) {
  var manager = {}

  var CONST_ELEMENT_ID = '#clearWordAttempt'

  function getElement () {
    return document.querySelector(CONST_ELEMENT_ID)
  }

  function setVisible (el) {
    el.classList.remove('fadeout')
    el.classList.add('fadein')
  }
  function setHidden (el) {
    el.classList.remove('fadein')
    el.classList.add('fadeout')
  }
  function cleanup () {
    var el = getElement()
    if (el === null) return

    el.removeEventListener(
      'click', manager.eventHandler, false)
  }
  function setup () {
    var el = getElement()
    if (el === null) return

    el.addEventListener(
      'click', manager.eventHandler, false)

    pubsub.subscribe('wordScramble/wordAttemptUpdated', function (topic, data) {
      if (data.wordString.length > 0) {
        setVisible(el)
      } else {
        setHidden(el)
      }
    })
  }

  manager.eventHandler = function (evt) {
    pubsub.publish('wordScramble/clearWordAttempt', {'target': evt.target})
    evt.preventDefault()
  }

  manager.init = function () {
    cleanup()
    setup()
  }
  manager.init()

  return manager
})(window.pubsub)

