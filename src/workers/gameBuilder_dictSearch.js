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

  this.queryObjects = function (mininumWordLength, letterList) {
    var words = wordList
    var letterCounts = ''

    // build our letterCount string
    letterList.forEach(function (l) {
      if (letterCounts.indexOf(l) === -1) {
        letterCounts += l + '0'
      }
    })

    // filter our words to not exceed the length of letterList
    // and to at least meet the minimumWordLength
    makeStatusUpdate('filtering word list by length')
    words = words.filter(function (w) {
      return w.length <= letterList.length && w.length >= mininumWordLength
    })

    // get all possible permutations of the letterList
    makeStatusUpdate('building letter permutations')
    var letterPermutations = permute(letterList)
    var wordPermutations = letterPermutations.map(function (lp) {
      return lp.join('')
    })

    // find wordPermutations that match w or contain w
    makeStatusUpdate('searching dictionary')
    words = words.filter(function (w) {
      var found = wordPermutations.some(function (wp) {
        return wp.indexOf(w.word) !== -1
      })
      if (found === true) {
        // get a count of each distinct letter
        var wordLetters = w.word.split('')
        wordLetters.forEach(function (l) {
          // count of the number of occurrences in this word
          var wordCnt = w.word.split(l).length - 1
          // current count from letterCount
          var currentCnt = letterCounts.charAt(letterCounts.indexOf(l) + 1, 0)
          // compare and update if necessary
          if (wordCnt > currentCnt) {
            letterCounts = letterCounts.replace(l + currentCnt, l + wordCnt)
          }
        })

        return w
      }
    })

    // if we have no words, we can exit now.
    if (words.length === 0) {
      makeStatusUpdate('no words found for selected letters')
      return []
    }

    // if our letterCounts contains a 0, we can exit now
    if (letterCounts.indexOf(0) !== -1) {
      makeStatusUpdate('oops, found words with letters you don\'t have')
      return []
    }

    // make sure our letterCounts match our letters
    // we can use ANY of our wordPermutations for this
    makeStatusUpdate('validating results')
    var perm = wordPermutations[0]
    for (var i = 0, len = letterList.length; i < len; i++) {
      var letter = letterList[i]
      var permCnt = perm.split(letter).length - 1
      var currentCnt = letterCounts.charAt(letterCounts.indexOf(letter) + 1, 0)
      if (permCnt !== Number(currentCnt)) {
        // throw it all out and start over, sadly.
        makeStatusUpdate('validation failed')
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
  var wordList = 		data.dictionary
  var letterList = 	data.letters

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

