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

  function getCountOfLetterInWord (letter, word) {
    return word.split(letter).length - 1
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
        var countOfLetterInWordCandidate = getCountOfLetterInWord(letterObject.letter, wordObject.word)
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

    makeStatusUpdate('Enough words were found (' + words.length + ')')
    return true
  }

  function hasCorrectLetterCounts (words, letterSet) {
    return letterSet.letterCounts.every(function (letterObject) {
      return words.some(function (wordObject) {
        var countOfLetterInWord = getCountOfLetterInWord(letterObject.letter, wordObject.word)
        if (countOfLetterInWord === letterObject.count) {
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

  function makeLetterSet (letterList) {
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
      letterObject.count = getCountOfLetterInWord(letterObject.letter, letterString)
    })

    return {
      'letterList': letterList,
      'letterString': letterString,
      'letterCounts': letterCounts,
      'uniqueLetters': uniqueLetters
    }
  }

  function findWords (wordSetConfiguration, letterSet) {
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

    return wordObjects
  }

  return {
    'getCountOfLetterInWord': getCountOfLetterInWord,
    'makeLetterSet': makeLetterSet,
    'findWords': findWords,
    'removeShortAndLongWords': removeShortAndLongWords
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
