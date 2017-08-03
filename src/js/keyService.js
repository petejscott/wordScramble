/* keyService.js */
'use strict'

;(function (pubsub) {
  var CONST_STARTALPHA_KEYCODE = 65
  var CONST_ENDALPHA_KEYCODE = 90
  var CONST_ENTER_KEYCODE = 13
  var CONST_BACKSPACE_KEYCODE = 8
  var CONST_SPACE_KEYCODE = 32

  function keypressEventHandler (evt) {
    if (evt.keyCode >= CONST_STARTALPHA_KEYCODE && evt.keyCode <= CONST_ENDALPHA_KEYCODE) {
      // submit letter
      var selectedCharacter = String.fromCharCode(evt.keyCode)
      pubsub.publish('wordScramble/letterSelected', {'letter': selectedCharacter})
    } else if (evt.keyCode === CONST_ENTER_KEYCODE) {
      pubsub.publish('wordScramble/submitWord', {'target': null})
      evt.preventDefault()
      return false
    } else if (evt.keyCode === CONST_BACKSPACE_KEYCODE) {
      pubsub.publish('wordScramble/clearWordAttempt')
      evt.preventDefault()
    } else if (evt.keyCode === CONST_SPACE_KEYCODE) {
      pubsub.publish('wordScramble/shuffleRequest')
      evt.preventDefault()
    }
  }

  // bind keyboard handler
  function init () {
    document.addEventListener('keyup',
      keypressEventHandler,
    false)
  }

  init()
})(window.pubsub)
