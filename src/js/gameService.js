/* gameService.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.gameService = (function (configuration, pubsub) {
  var gService = {}

  var storageKey = 'wordScramble.gameData'
  var previousStorageKey = 'wordScramble.previousGameData'
  var gameData = {}

  function getElement (selector) {
    return document.querySelector(selector)
  }

  function saveGameData () {
    window.localStorage.setItem(storageKey, JSON.stringify(gameData))
  }
  function loadGameData () {
    if (!window.localStorage) return
    var storedData = window.localStorage.getItem(storageKey)
    if (storedData) {
      gameData = JSON.parse(storedData)
      return true
    }
    return false
  }

  function setWordSolved (wordObject) {
    var index = gameData.words.indexOf(wordObject)
    wordObject.solved = true
    gameData.words.splice(index, 1, wordObject)
  }

  function clearElement (el) {
    if (el === null) return
    while (el.firstChild) {
      el.removeChild(el.firstChild)
    }
  }

  function setGameBuildStatus (statusText) {
    var statusUI = getElement('#statusContainer')
    if (statusUI !== null) {
      clearElement(statusUI)
    }
    statusUI.textContent = statusText
  }

  function clearGameUI (statusText) {
    setGameBuildStatus(statusText)

    var gc = getElement('#gameContainer')
    if (!gc.classList.contains('hide')) gc.classList.add('hide')

    var sc = getElement('#statusContainer')
    if (sc.classList.contains('hide')) sc.classList.remove('hide')
  }

  function setGameUI () {
    var gc = getElement('#gameContainer')
    if (gc.classList.contains('hide')) gc.classList.remove('hide')

    var sc = getElement('#statusContainer')
    if (!sc.classList.contains('hide')) sc.classList.add('hide')
  }

  function subscribe () {
    pubsub.subscribe('wordScramble/updateGameBuildStatus', function (topic, data) {
      setGameBuildStatus(data.statusMessage)
    })
    pubsub.subscribe('wordScramble/endGame', function () {
      clearGameUI('Preparing game...')
      clearGameCache()
    })
    pubsub.subscribe('wordScramble/startGame', function () {
      clearGameUI('Preparing game...')
      startGame()
      pubsub.publish('wordScramble/clearWordAttempt')
    })
    pubsub.subscribe('wordScramble/submitWord', function () {
      submitWordAttempt(wordScramble.wordAttemptService.getWordString())
      pubsub.publish('wordScramble/clearWordAttempt')
    })
    pubsub.subscribe('wordScramble/gameReady', function (topic, data) {
      gameData = data.gameData

      pubsub.publish('wordScramble/lettersChanged', { 'letters': gameData.letters })
      pubsub.publish('wordScramble/wordsChanged', { 'words': gameData.words })

      setGameUI()

      saveGameData()
    })
  }

  function submitWordAttempt (word) {
    var words = gameData.words
    var result = words.filter(function (o) {
      return o.word === word.toLowerCase()
    })
    if (result && result[0] != null) {
      if (result[0].solved === true) {
        pubsub.publish('wordScramble/wordAttemptAlreadyExists', {'word': word})
      } else {
        setWordSolved(result[0])

        // refetch to get updated value.
        words = gameData.words

        pubsub.publish('wordScramble/wordsChanged', {'words': words})
        pubsub.publish('wordScramble/wordAttemptAccepted', {'word': word})
      }
    } else {
      pubsub.publish('wordScramble/wordAttemptRejected', {'word': word})
    }

    var victory = words.every(function (o, i) {
      return o.solved === true
    })
    if (victory) {
      pubsub.publish('wordScramble/allWordsSolved', {'words': words})
    }

    saveGameData()
  }

  function addGameDataToPreviousGamesCache (gameData) {
    var previousGames = getPreviousGames()

    // TODO: this is probably horribly inefficient
    var numberOfPreviousGames = previousGames.games.unshift(gameData)
    if (numberOfPreviousGames > 5) previousGames.games.pop()

    window.localStorage.setItem(previousStorageKey, JSON.stringify(previousGames))
    window.localStorage.removeItem(storageKey)
  }

  function clearGameCache () {
    addGameDataToPreviousGamesCache(gameData)
    pubsub.publish('wordScramble/gameOver', {'words': gameData.words})
  }

  function getPreviousGames () {
    var previousGameDataStr = window.localStorage.getItem(previousStorageKey)
    if (previousGameDataStr === null || previousGameDataStr.length === 0) {
      return { 'games': [] }
    }
    var previousGameData = JSON.parse(previousGameDataStr)
    if (previousGameData === null) {
      return { 'games': [] }
    }
    if (typeof previousGameData.games === 'undefined') {
      window.localStorage.removeItem(previousStorageKey)
      previousGameData = { 'games': [] }
    }
    return previousGameData
  }

  function startGame () {
    var loaded = loadGameData()
    if (loaded) {
      pubsub.publish('wordScramble/gameReady', { gameData: gameData })
    } else {
      wordScramble.gameBuilder.build(wordScramble.dict)
    }

    var previousGameData = getPreviousGames()
    pubsub.publish('wordScramble/previousGameDataAvailable', {'games': previousGameData.games})
  }

  subscribe()
  startGame()

  return gService
})(wordScramble.configuration, window.pubsub)

