/* gameBuilder_dictSearch.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.WordFinder = function (wordList) {
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

  function makeStatusUpdate (statusMessage) {
    var message = {
      update: 1,
      status: statusMessage
    }
    console.log(message)
    postMessage(JSON.stringify(message))
  }

  var permArr = []
  var usedChars = []
  function permute (input) {
    var i, ch
    for (i = 0; i < input.length; i++) {
      ch = input.splice(i, 1)[0]
      usedChars.push(ch)
      if (input.length === 0) {
        permArr.push(usedChars.slice())
      }
      permute(input)
      input.splice(i, 0, ch)
      usedChars.pop()
    }
    return permArr
  };

  function getCountOfLetterInWord (letter, word) {
    return word.split(letter).length - 1
  }

  function checkWordLength (word, minLength, maxLength) {
    return word.length <= maxLength && word.length >= minLength
  }

  function filterShortAndLongWords (words, minLength, maxLength) {
    return words.filter(function (word) {
      return checkWordLength(word, minLength, maxLength)
    })
  }

  function makeLetterPermutations (letterList) {
    return permute(letterList).map(function (letterPermutation) {
      return letterPermutation.join('')
    })
  }

  function getUniqueLetters (letterList) {
    return letterList.filter(function (v, i) {
      return letterList.indexOf(v) === i
    })
  }

  function initializeLetterCounts (letterList) {
    var letterCounts = ''
    letterList.forEach(function (l) {
      if (letterCounts.indexOf(l) === -1) {
        letterCounts += l + '0'
      }
    })
    return letterCounts
  }

  function filterWordsWithOtherLetters (words, letterList) {
    var allLetters = 'abcdefghijklmnopqrstuvwxyz'
    var otherLetters = allLetters.split('').filter(function (allLettersElement) {
      return !letterList.includes(allLettersElement)
    })
    for (var i = 0, len = otherLetters.length; i < len; i++) {
      words = words.filter(function (word) {
        return word.word.indexOf(otherLetters[i]) === -1
      })
    }
    return words
  }

  function getMaxCountOfLettersInWords (letter, letterCounts) {
    return letterCounts.charAt(letterCounts.indexOf(letter) + 1, 0)
  }

  function findMatchingWordsInDictionary (words, letterList) {
    makeStatusUpdate('building letter permutations')
    var possibleWords = makeLetterPermutations(letterList)

    var letterCounts = initializeLetterCounts(letterList)

    makeStatusUpdate('searching dictionary')
    var matchingWords = words.filter(function (wordCandidate) {
      var found = possibleWords.some(function (wordPermutation) {
        return wordPermutation.indexOf(wordCandidate.word) !== -1
      })
      if (found === true) {
        // get a count of each distinct letter
        var wordLetters = wordCandidate.word.split('')
        wordLetters.forEach(function (letter) {
          // count of the number of occurrences in this word
          var letterListLetterCount = getCountOfLetterInWord(letter, wordCandidate.word)
          // current count from letterCount
          var currentLetterCountFromLetterCounts = getMaxCountOfLettersInWords(letter, letterCounts)
          // compare and update if necessary
          if (letterListLetterCount > currentLetterCountFromLetterCounts) {
            letterCounts = letterCounts.replace(letter + currentLetterCountFromLetterCounts, letter + letterListLetterCount)
          }
        })

        return wordCandidate
      }
    })

    return { 'matchingWords': matchingWords, 'letterCounts': letterCounts }
  }

  this.queryObjects = function (mininumWordLength, maxWords, letterList) {
    var words = wordList

    makeStatusUpdate('filtering word list by length')
    words = filterShortAndLongWords(words, mininumWordLength, letterList.length)

    // remove words that contain letters that are NOT in our letterList
    words = filterWordsWithOtherLetters(words, letterList)

    // find words in the dictionary that match or contain our possibleWords
    var result = findMatchingWordsInDictionary(words, letterList)
    words = result.matchingWords
    var letterCounts = result.letterCounts

    if (words.length > maxWords) {
      makeStatusUpdate('too many words found')
      return []
    }

    // if we have no words, we can exit now.
    if (words.length === 0) {
      makeStatusUpdate('no words found for selected letters')
      return []
    }

    // if our letterCounts contains a 0, we can exit now
    // this means that maybe we have a Z in our letter list,
    // but no words containing Z are in our word list.
    if (letterCounts.indexOf(0) !== -1) {
      makeStatusUpdate('oops, extra letters')
      return []
    }

    // make sure each letter in our list is found the same
    // number of times in one of our words as it is in our list.
    makeStatusUpdate('checking letter counts')
    getUniqueLetters(letterList).forEach(function (letter) {
      var letterCountFromList = getCountOfLetterInWord(letter, letterList.join(''))
      var letterCountFromWords = getMaxCountOfLettersInWords(letter, letterCounts)
      if (letterCountFromList !== Number(letterCountFromWords)) {
        // throw it all out and start over, sadly.
        console.log('letter ' + letter + ' is in our found words (' + letterCounts + ') a max of ' + letterCountFromWords + ' times; in ' + letterList.join('') + ' ' + letterCountFromList + ' times')
        makeStatusUpdate('letter counts are wrong')
        return []
      }
    })

    var wordObjects = mapWordsToWordObjects(words)
    wordObjects = sortWordObjectsByLength(wordObjects)

    return wordObjects
  }
}

var onmessage = function (evt) {
  var data = JSON.parse(evt.data)

  var configuration = data.configuration
  var wordList = data.dictionary
  var letterList = data.letters

  if (!wordList || wordList.length === 0) {
    throw new Error('No words provided to wordFinder')
  }

  var wordFinder = new wordScramble.WordFinder(wordList)
  var wordObjects = wordFinder.queryObjects(configuration.minWordLength, configuration.maxWords, letterList)

  var message = {
    complete: 1,
    words: wordObjects,
    letters: letterList
  }

  postMessage(JSON.stringify(message))
}

