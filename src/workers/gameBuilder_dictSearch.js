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
  
  function findMatchingWordsInDictionary (words, possibleWords, letterCounts) {
    var matchingWords = words.filter(function (wordCandidate) {
      var found = possibleWords.some(function (wordPermutation) {
        return wordPermutation.indexOf(wordCandidate.word) !== -1
      })
      if (found === true) {
        // get a count of each distinct letter
        var wordLetters = wordCandidate.word.split('')
        wordLetters.forEach(function (l) {
          // count of the number of occurrences in this word
          var wordCnt = wordCandidate.word.split(l).length - 1
          // current count from letterCount
          var currentCnt = letterCounts.charAt(letterCounts.indexOf(l) + 1, 0)
          // compare and update if necessary
          if (wordCnt > currentCnt) {
            letterCounts = letterCounts.replace(l + currentCnt, l + wordCnt)
          }
        })

        return wordCandidate
      }
    })
    return { 'matchingWords': matchingWords, 'letterCounts': letterCounts }
  }

  this.queryObjects = function (mininumWordLength, letterList) {
    var words = wordList
    var letterCounts = ''

    // build our letterCount string
    letterList.forEach(function (l) {
      if (letterCounts.indexOf(l) === -1) {
        letterCounts += l + '0'
      }
    })

    makeStatusUpdate('filtering word list by length')
    words = filterShortAndLongWords(words, mininumWordLength, letterList.length)

    makeStatusUpdate('building letter permutations')
    var possibleWords = makeLetterPermutations(letterList)

    // find words in the dictionary that match or contain our possibleWords
    makeStatusUpdate('searching dictionary')
    var result = findMatchingWordsInDictionary(words, possibleWords, letterCounts)
    words = result.matchingWords
    letterCounts = result.letterCounts

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
    for (var i = 0, len = letterList.length; i < len; i++) {
      var letter = letterList[i]
      var letterCountInWord = getCountOfLetterInWord(letter, possibleWords[0])
      var letterCountInLetterList = letterCounts.charAt(letterCounts.indexOf(letter) + 1, 0)
      if (letterCountInWord !== Number(letterCountInLetterList)) {
        // throw it all out and start over, sadly.
        makeStatusUpdate('letter counts are wrong')
        return []
      }
    }

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
  var wordObjects = wordFinder.queryObjects(configuration.minWordLength, letterList)

  var message = {
    complete: 1,
    words: wordObjects,
    letters: letterList
  }

  postMessage(JSON.stringify(message))
}

