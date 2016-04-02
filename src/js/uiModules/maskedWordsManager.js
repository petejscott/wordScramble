/* maskedWordsManager.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.maskedWordsManager = (function (pubsub) {
  var manager = {}

  var CONST_ELEMENT_ID = '#maskedWords'

  function getElement () {
    return document.querySelector(CONST_ELEMENT_ID)
  }

  function clear () {
    var el = getElement()
    if (el === null) return

    while (el.firstChild) {
      el.removeChild(el.firstChild)
    }
  }
  function render (words) {
    var el = getElement()
    if (el === null) return

    var getMask = function (count) {
      var maskChar = '_'
      var mask = ''
      for (var i = 0; i < count; i++) {
        mask += maskChar += ' '
      }
      return mask
    }

    var maskedWords = document.createElement('div')
    for (var i = 0, len = words.length; i < len; i++) {
      var wordNode = null
      var wordContainer = document.createElement('span')

      var wordObject = words[i]
      if (wordObject.solved) {
        wordNode = document.createTextNode(wordObject.word)
        wordContainer.classList.add('solved')
      } else {
        var maskedWord = getMask(wordObject.chars)
        wordNode = document.createTextNode(maskedWord)
      }
      wordContainer.classList.add('word')
      wordContainer.appendChild(wordNode)
      maskedWords.appendChild(wordContainer)
    }

    el.appendChild(maskedWords)
  }

  function subscribe () {
    pubsub.subscribe('wordScramble/wordsChanged', function (topic, data) {
      var words = data.words
      clear()
      render(words)
    })
  }

  subscribe()

  return manager
})(window.pubsub)

