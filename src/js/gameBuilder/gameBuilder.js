/* gameBuilder.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.gameBuilder = (function (configuration, pubsub) {
  var retries = 10
  var tryCount = 0
  var gameDictionary = null

  function getNewLetters () {
    var count = configuration.letterCount
    var letters = wordScramble.gameBuilderLetters.getRandomLetters(count)
    return letters
  }

  function onDataReady (gameData) {
    pubsub.publish('wordScramble/gameReady', { gameData: gameData })
  }

  function buildGame (worker) {
    var letters = getNewLetters()

    var message = JSON.stringify({
      'dictionary': gameDictionary,
      'configuration': configuration,
      'letters': letters
    })

    worker.postMessage(message)
  }

  function build (dictionary) {
    gameDictionary = dictionary

    if (!window.Worker) {
      pubsub.publish('wordScramble/updateGameBuildStatus', {
        'statusMessage': 'Web Workers are not supported by your browser.'
      })
      return
    }
    var worker = new window.Worker('workers/gameBuilder_dictSearch.js')
    worker.addEventListener('error', handleWorkerError)
    worker.addEventListener('message', handleWorkerMessage)

    buildGame(worker)
  }

  function handleWorkerError (evt) {
    console.log(evt)
    pubsub.publish('wordScramble/updateGameBuildStatus', {
      'statusMessage': evt.message
    })
  }

  function handleWorkerMessage (evt) {
    var response = JSON.parse(evt.data)
    if (response.complete === 1) {
      handleCompletedWorker(evt)
    } else if (response.update === 1) {
      pubsub.publish('wordScramble/updateGameBuildStatus', {
        'statusMessage': response.status
      })
    }
  }

  function handleCompletedWorker (evt) {
    tryCount++
    console.log('wordFinder: completed iteration ' + tryCount)

    var response = JSON.parse(evt.data)

    if (tryCount >= retries) {
      pubsub.publish('wordScramble/updateGameBuildStatus', {
        'statusMessage': 'I took too long. Try again?'
      })
      tryCount = 0
      throw new Error('Too many iterations; giving up')
    }

    if (response.words.length === 0) {
      buildGame(evt.target)
    } else {
      response.words = sortWords(response.words)
      onDataReady(response)
      tryCount = 0
    }
  }

  function sortWords (words) {
    if (configuration.sortAlpha && configuration.sortByLength) {
      words = sortWordObjectsByLengthAndAlphabetically(words)
    } else if (configuration.sortAlpha) {
      words = sortWordObjectsAlphabetically(words)
    } else if (configuration.sortByLength) {
      words = sortWordObjectsByLength(shuffleWords(words))
    } else {
      words = shuffleWords(words)
    }
    console.log(JSON.stringify(words))
    return words
  }

  function shuffleWords (wordObjects) {
    var shuffled = []
    while (wordObjects.length) {
      var randomIndex = Math.floor(Math.random() * wordObjects.length)
      var element = wordObjects.splice(randomIndex, 1)
      shuffled.push(element[0])
    }
    return shuffled
  }

  function sortWordObjectsAlphabetically (wordObjects) {
    return wordObjects.sort(function (a, b) {
      return a.word.localeCompare(b.word)
    })
  }

  function sortWordObjectsByLengthAndAlphabetically (wordObjects) {
    return wordObjects.sort(function (a, b) {
      return a.chars - b.chars || a.word.localeCompare(b.word)
    })
  }

  function sortWordObjectsByLength (wordObjects) {
    return wordObjects.sort(function (a, b) {
      return a.chars - b.chars
    })
  }

  return {
    build: build,
    sortWords: sortWords
  }
})(wordScramble.configuration, window.pubsub)

