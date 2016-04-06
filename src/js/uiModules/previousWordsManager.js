/* previousWordsManager.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.previousWordsManager = (function (pubsub, cardPartRenderer) {
  var manager = {}

  var CONST_PREVIOUS_ELEMENT_ID = '#previousGameSummaryContents'

  function getPreviousGameSummaryElement () {
    return document.querySelector(CONST_PREVIOUS_ELEMENT_ID)
  }

  function clearPreviousGameSummaryElement () {
    var el = getPreviousGameSummaryElement()
    if (el === null) return

    while (el.firstChild) {
      el.removeChild(el.firstChild)
    }
  }

  var getMask = function (count) {
    var maskChar = '_'
    var mask = ''
    for (var i = 0; i < count; i++) {
      mask += maskChar += ' '
    }
    return mask
  }

  function renderPreviousGameSummary (words) {
    var cardPart = {
      'title': makeCardTitle(words),
      'content': makeWordsContent(words, false)
    }
    cardPartRenderer.draw(cardPart, getPreviousGameSummaryElement())
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

  function makeWordsContent (words, maskUnsolvedWords) {
    var contentContainer = document.createElement('div')
    for (var i = 0, len = words.length; i < len; i++) {
      var wordContainer = document.createElement('span')
      wordContainer.classList.add('word')

      var wordObject = words[i]

      var wordElement = makeWordElement(wordObject.word, true)
      if (maskUnsolvedWords && !wordObject.solved) {
        wordElement = makeWordElement(getMask(wordObject.chars), false)
      }

      if (wordObject.solved) {
        wordContainer.classList.add('solved')
      } else {
        wordContainer.classList.add('missed')
      }

      wordContainer.appendChild(wordElement)
      contentContainer.appendChild(wordContainer)
    }
    return contentContainer.innerHTML
  }

  function makeWordElement (textContent, linkToDefinition) {
    var wordNode = document.createTextNode(textContent)
    if (linkToDefinition) {
      var defineElement = document.createElement('a')
      var defineUrl = 'https://www.google.com/search?q=define+' + textContent
      defineElement.setAttribute('href', defineUrl)
      defineElement.setAttribute('title', 'definition')
      defineElement.setAttribute('target', '_blank')
      defineElement.appendChild(wordNode)
      return defineElement
    }
    return wordNode
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
      clearPreviousGameSummaryElement()
      renderPreviousGameSummary(words)
    })
  }

  subscribe()

  return manager
})(window.pubsub, wordScramble.cardPartRenderer)
