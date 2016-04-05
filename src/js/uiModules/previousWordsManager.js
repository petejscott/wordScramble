/* previousWordsManager.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.previousWordsManager = (function (pubsub, cardPartRenderer) {
  var manager = {}

  var CONST_ELEMENT_ID = '#previousGameSummaryContents'

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
    var cardPart = {
      'title': makeCardTitle(words),
      'content': makeCardContent(words)
    }
    cardPartRenderer.draw(cardPart, getElement())
  }

  function makeCardTitle (words) {
    var solvedCount = words.filter(function (word) {
      return word.solved
    }).length
    var titleText = solvedCount + ' out of ' + words.length
    if (solvedCount === words.length) {
      titleText = 'Nicely done! ' + titleText
    }
    return titleText
  }

  function makeCardContent (words) {
    var contentContainer = document.createElement('div')
    var solvedCount = 0
    for (var i = 0, len = words.length; i < len; i++) {
      var wordContainer = document.createElement('span')
      var wordObject = words[i]

      var wordNode = document.createTextNode(wordObject.word)
      if (wordObject.solved) {
        wordContainer.classList.add('solved')
        solvedCount++
      } else {
        wordContainer.classList.add('missed')
      }
      wordContainer.classList.add('word')

      var defineElement = document.createElement('a')
      var defineUrl = 'https://www.google.com/search?q=define+' + wordObject.word
      defineElement.setAttribute('href', defineUrl)
      defineElement.setAttribute('title', 'definition')
      defineElement.setAttribute('target', '_blank')

      defineElement.appendChild(wordNode)
      wordContainer.appendChild(defineElement)
      contentContainer.appendChild(wordContainer)
    }
    return contentContainer.innerHTML
  }

  function showSummary () {
    var summaryDrawer = document.querySelector('#statistics')
    if (summaryDrawer === null) return

    if (!summaryDrawer.classList.contains('visible')) {
      summaryDrawer.classList.add('visible')
    }
  }

  function subscribe () {
    pubsub.subscribe('wordScramble/gameOver', function (topic, data) {
      pubsub.publish('wordScramble/previousGameDataAvailable', data)
      showSummary()
    })
    pubsub.subscribe('wordScramble/previousGameDataAvailable', function (topic, data) {
      var words = data.words
      clear()
      render(words)
    })
  }

  subscribe()

  return manager
})(window.pubsub, wordScramble.cardPartRenderer)
