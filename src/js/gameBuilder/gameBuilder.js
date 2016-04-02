/* gameBuilder.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.gameBuilder = (function (configuration, pubsub) {
  var retries = 10
  var tryCount = 0
  var gameDictionary = null

  function getNewLetters () {
    var count = configuration.letterCount
    var letters = wordScramble.gameBuilderLetters.getUniqueRandomLetters(count)

    return letters
  }

  function onDataReady (gameData) {
    pubsub.publish('wordScramble/gameReady', { gameData: gameData })
  }

  function buildGame (worker) {
    var letters = 	getNewLetters()

    var message = JSON.stringify({
      'dictionary': gameDictionary,
      'configuration': configuration,
      'letters': letters
    })
    worker.postMessage(message)
  }

  function build (dictionary) {
    gameDictionary = dictionary

    var worker = new Worker('workers/gameBuilder_dictSearch.js')
    worker.addEventListener('error', handleWorkerError)
    worker.addEventListener('message', handleWorkerMessage)

    buildGame(worker)
  }

  function handleWorkerError (evt) {
    console.log(evt)
  }

  function handleWorkerMessage (evt) {
    var response = JSON.parse(evt.data)
    if (response.complete === 1) {
      handleCompletedWorker(evt)
    } else if (response.update === 1) {
      pubsub.publish('wordScramble/updateGameBuildStatus', { 'statusMessage': response.status })
    }
  }

  function handleCompletedWorker (evt) {
    tryCount++
    console.log('wordFinder: iteration ' + tryCount)

    var response = JSON.parse(evt.data)

    if (tryCount >= retries) {
      throw new Error('Too many iterations; giving up')
    }

    if (response.words.length < configuration.minWords) {
      buildGame(evt.target)
    } else {
      onDataReady(response)
      tryCount = 0
    }
  }

  return {
    build: build
  }
})(wordScramble.configuration, window.pubsub)

