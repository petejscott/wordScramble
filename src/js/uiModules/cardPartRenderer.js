/* cardPartRenderer.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.cardPartRenderer = (function () {
  var cardPartRenderer = {}

  cardPartRenderer.draw = function (cardPart, cardElement) {
    if (typeof cardPart === 'undefined') {
      throw new Error('card must be provided')
    }
    if (typeof cardElement === 'undefined') {
      throw new Error('container must be provided')
    }

    var title = document.createElement('div')
    title.classList.add('card-part-title')
    title.appendChild(document.createTextNode(cardPart.title))

    var content = document.createElement('div')
    content.classList.add('card-part-contents')
    content.innerHTML = cardPart.content

    var cardPartElement = document.createElement('div')
    cardPartElement.classList.add('card-part')
    cardPartElement.appendChild(title)
    cardPartElement.appendChild(content)

    cardElement.appendChild(cardPartElement)
  }

  return cardPartRenderer
})()

