/* gameBuilder_dictSearch.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.WordFinder = function (wordList) {
  function makeStatusUpdate (statusMessage) {
    console.log(statusMessage)
    send({
      update: 1,
      status: statusMessage
    })
  }

  function mapWordsToWordObjects (words) {
    var wordObjects = words.map(function (w) {
      return { 'word': w.word, 'solved': false, 'chars': w.length }
    })
    return wordObjects
  }

  function sortWordObjectsByLength (wordObjects) {
    return wordObjects.sort(function (a, b) {
      return a.chars - b.chars
    })
  }

  function removeShortAndLongWords (words, minLength, maxLength) {
    return words.filter(function (word) {
      return word.length <= maxLength && word.length >= minLength
    })
  }

  function removeWordsWithOtherLetters (words, letterSet) {
    var allLetters = 'abcdefghijklmnopqrstuvwxyz'
    var otherLetters = allLetters.split('').filter(function (allLettersElement) {
      return !letterSet.letterList.includes(allLettersElement)
    })
    for (var i = 0, len = otherLetters.length; i < len; i++) {
      words = words.filter(function (word) {
        return word.word.indexOf(otherLetters[i]) === -1
      })
    }
    return words
  }

  function removeWordsWithExtraLetters (words, letterSet) {
    words = words.filter(function (wordObject) {
      return wordObject.word.split('').every(function (letterInWord) {
        var letterObject = letterSet.letterCounts.find(function (letterObject) {
          return letterObject.letter === letterInWord
        })
        var countOfLetterInWordCandidate = wordObject.word.split(letterObject.letter).length - 1
        if (countOfLetterInWordCandidate <= letterObject.count) {
          return true
        }
      })
    })
    return words
  }

  function hasAcceptableWordCount (words, wordSetConfiguration) {
    if (words.length > wordSetConfiguration.maximumWords) {
      makeStatusUpdate('Too many words found (' + words.length + ')')
      return false
    }
    if (words.length < wordSetConfiguration.minimumWords) {
      makeStatusUpdate('Not enough words found (' + words.length + ')')
      return false
    }
    return true
  }

  function hasCorrectLetterCounts (words, letterSet) {
    return letterSet.letterCounts.every(function (letterObject) {
      var countOfLetterInList = letterObject.count
      return words.some(function (wordObject) {
        if (wordObject.word.split(letterObject.letter).length === countOfLetterInList) {
          return true
        }
      })
    })
  }

  function getUniqueLetters (letterList) {
    return letterList.filter(function (v, i) {
      return letterList.indexOf(v) === i
    })
  }

  this.makeLetterSet = function (letterList) {
    var letterCounts = []
    var letterString = letterList.join('')
    var uniqueLetters = getUniqueLetters(letterList)
    uniqueLetters.forEach(function (letter) {
      var letterObject = {
        'letter': letter,
        'count': 1
      }
      letterCounts.push(letterObject)
    })
    letterCounts.forEach(function (letterObject) {
      letterObject.count = letterString.split(letterObject.letter).length - 1
    })

    return {
      'letterList': letterList,
      'letterString': letterString,
      'letterCounts': letterCounts,
      'uniqueLetters': uniqueLetters
    }
  }

  this.findWords = function (wordSetConfiguration, letterSet) {
    var words = wordList

    makeStatusUpdate('Filtering ' + words.length + ' words (1 of 3)')
    words = removeShortAndLongWords(words, wordSetConfiguration.minimumWordLength, letterSet.letterList.length)

    makeStatusUpdate('Filtering ' + words.length + ' words (2 of 3)')
    words = removeWordsWithOtherLetters(words, letterSet)

    makeStatusUpdate('Filtering ' + words.length + ' words (3 of 3)')
    words = removeWordsWithExtraLetters(words, letterSet)

    if (!hasAcceptableWordCount(words, wordSetConfiguration)) return []

    makeStatusUpdate('Ensuring all letters are used')
    if (!hasCorrectLetterCounts(words, letterSet)) {
      makeStatusUpdate('Not all letters are used')
      return []
    }

    var wordObjects = mapWordsToWordObjects(words)
    wordObjects = sortWordObjectsByLength(wordObjects)

    return wordObjects
  }
}

var onmessage = function (evt) {
  if (evt == null) return
  var data = JSON.parse(evt.data)

  var configuration = data.configuration
  var wordList = data.dictionary
  var letterList = data.letters

  if (!wordList || wordList.length === 0) {
    throw new Error('No words provided to wordFinder')
  }

  var wordFinder = new wordScramble.WordFinder(wordList)
  var letterSet = wordFinder.makeLetterSet(letterList)
  var wordSetConfiguration = {
    'minimumWordLength': configuration.minWordLength,
    'maximumWords': configuration.maxWords,
    'minimumWords': configuration.minWords
  }
  var wordObjects = wordFinder.findWords(wordSetConfiguration, letterSet)

  send({
    complete: 1,
    words: wordObjects,
    letters: letterList
  })
}

var send = function (message) {
  postMessage(JSON.stringify(message))
}
onmessage(null)
