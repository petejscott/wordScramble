/* letterListManager.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.letterListManager = (function (pubsub) {
  var manager = {}

  var CONST_ELEMENT_ID = '#letterContainer'
  var letterObjects = []

  function getElement () {
    return document.querySelector(CONST_ELEMENT_ID)
  }

  function createLetterObjects (letters) {
    var letterObjects = letters.map(function (l, i) {
      return {
        token: 'letter_' + i,
        letter: l,
        selected: false,
        focused: false
      }
    })
    return letterObjects
  }

  function clear () {
    var el = getElement()
    if (el === null) return

    while (el.firstChild) {
      el.removeChild(el.firstChild)
    }
  }

  function render (letters) {
    var el = getElement()
    if (el === null) return

    var letterList = document.createElement('div')
    letterList.setAttribute('id', 'letterList')

    if (letters !== null) {
      letterObjects = createLetterObjects(letters)
    }

    for (var i = 0, len = letterObjects.length; i < len; i++) {
      var letterButton = makeLetterButton(letterObjects[i])
      letterList.appendChild(letterButton)
    }

    var shufflerLink = document.createElement('a')
    shufflerLink.appendChild(document.createTextNode('shuffle'))
    shufflerLink.setAttribute('href', '#shuffle')
    shufflerLink.setAttribute('id', 'shuffler')
    shufflerLink.addEventListener('click', shuffleClickEventHandler, false)

    var shuffler = document.createElement('div')
    shuffler.setAttribute('class', 'shuffleContainer')
    shuffler.appendChild(shufflerLink)

    el.appendChild(letterList)
    el.appendChild(shuffler)

    setStates()
  }

  function makeLetterButton (letterObject) {
    var letterButton = document.createElement('input')

    letterButton.classList.add('letterButton')

    letterButton.setAttribute('data-focused', letterObject.focused)
    letterButton.setAttribute('data-selected', letterObject.selected)
    letterButton.setAttribute('data-letter', letterObject.letter)
    letterButton.setAttribute('data-token', letterObject.token)

    letterButton.setAttribute('type', 'button')
    letterButton.setAttribute('tabindex', '-1')
    letterButton.setAttribute('value', letterObject.letter)
    letterButton.setAttribute('id', letterObject.token)

    letterButton.addEventListener('keydown', function (evt) {
      if (evt.target) evt.target.blur()
      return false
    }, false)
    letterButton.addEventListener('click', letterClickEventHandler, false)
    return letterButton
  }

  function setStates () {
    letterObjects.forEach(function (lo) {
      var button = getElement().querySelector('#' + lo.token)
      if (!button) return

      if (lo.selected) {
        button.classList.add('selected')
        button.setAttribute('data-selected', 'true')
        button.setAttribute('disabled', 'true')
      } else {
        button.removeAttribute('disabled')
        button.classList.remove('selected')
        button.setAttribute('data-selected', 'false')
      }

      if (lo.focused) {
        button.removeAttribute('disabled')
        button.setAttribute('data-focused', 'true')
        button.focus()
      } else {
        button.setAttribute('data-focused', 'false')
      }
    })
  }

  function shuffle () {
    var shuffled = []
    while (letterObjects.length) {
      var randomIndex = Math.floor(Math.random() * letterObjects.length)
      var element = letterObjects.splice(randomIndex, 1)
      shuffled.push(element[0])
    }
    return shuffled
  }

  function subscribe () {
    pubsub.subscribe('wordScramble/shuffleRequest', function (topic, data) {
      shuffleClickEventHandler(null)
    })
    pubsub.subscribe('wordScramble/lettersChanged', function (topic, data) {
      var letters = data.letters || null
      clear()
      render(letters)
    })
    pubsub.subscribe('wordScramble/letterSelected', function (topic, data) {
      letterClickEventHandler(data)
    })
    pubsub.subscribe('wordScramble/wordAttemptUpdated', function (topic, data) {
      var tokens = data.allTokens
      var lastToken = tokens[tokens.length - 1]
      // update the selected/focused to match the data provided
      for (var i = 0, len = letterObjects.length; i < len; i++) {
        var lo = letterObjects[i]

        if (tokens.indexOf(lo.token) === -1) {
          lo.selected = false
        } else {
          lo.selected = true
        }

        // only focus the last item in allTokens
        if (lo.token === lastToken) {
          lo.focused = true
        } else {
          lo.focused = false
        }
      }
      setStates()
    })
  }

  function getLetterObjectsByToken (token) {
    var matches = letterObjects.filter(function (lo) {
      return lo.token.toLowerCase() === token.toLowerCase()
    })
    return matches
  }

  function getLetterObjectsByLetter (letter) {
    var matches = letterObjects.filter(function (lo) {
      return lo.letter.toUpperCase() === letter.toUpperCase()
    })
    return matches
  }

  function letterClickEventHandler (evt) {
    var matches = []

    if (evt.target) {
      evt.target.blur()
    }

    if (evt.letter) {
      matches = getLetterObjectsByLetter(evt.letter)
    }
    if (matches.length === 0 && evt.target) {
      var token = evt.target.getAttribute('id')
      matches = getLetterObjectsByToken(token)
    }

    if (matches.length === 0) {
      return
    }

    var unselectedMatch = matches.find(function (x) {
      return x.selected === false
    })
    var selectedMatch = matches.find(function (x) {
      return x.selected === true
    })

    if (typeof unselectedMatch === 'undefined') {
      pubsub.publish('wordScramble/removeLetter', {
        'letter': selectedMatch.letter,
        'token': selectedMatch.token
      })
    } else {
      pubsub.publish('wordScramble/submitLetter', {
        'letter': unselectedMatch.letter,
        'token': unselectedMatch.token
      })
    }
    if (evt.preventDefault) evt.preventDefault()
  }

  function endShuffle (evt) {
    var el = getElement()
    if (el === null) return

    el.classList.remove('shuffling')

    el.removeEventListener(
      'animationend',
      endShuffle,
      false)
    el.removeEventListener(
      'webkitAnimationEnd',
      endShuffle,
      false)
  }
  function shuffleClickEventHandler (evt) {
    var el = getElement()
    if (el !== null) {
      el.classList.add('shuffling')

      el.addEventListener(
        'animationend',
        endShuffle,
        false)
      el.addEventListener(
        'webkitAnimationEnd',
        endShuffle,
        false)
    }
    letterObjects = shuffle()
    pubsub.publish('wordScramble/lettersChanged', {})
    if (evt !== null) evt.preventDefault()
  }

  subscribe()

  return manager
})(window.pubsub)

