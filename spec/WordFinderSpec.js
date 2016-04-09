describe('wordScramble.WordFinder.getCountOfLetterInWord()', function () {
  var wordFinder;

  beforeEach(function () {
    wordFinder = new wordScramble.WordFinder()
  })

  it('should return 0 instances of letter "f" in word "big"', function () {
    expect(wordFinder.getCountOfLetterInWord('f', 'big')).toEqual(0)
  })

  it('should return 2 instances of letter "a" in word "madman"', function () {
    expect(wordFinder.getCountOfLetterInWord('a', 'madman')).toEqual(2)
  })
})

describe('wordScramble.WordFinder.removeShortAndLongWords()', function () {
  var wordFinder;
  var words;

  beforeEach(function () {
    wordFinder = new wordScramble.WordFinder()
    words = makeWords()
  })

  function makeWords () {
    return [
      'zebra',
      'ox'
    ]
  }

  it('should return 0 words when none are within min/max letter count range', function () {
    expect(wordFinder.removeShortAndLongWords(words, 3, 4).length).toEqual(0)
  })

  it('should return 1 word when one is within min/max letter count range', function () {
    var remainingWords = wordFinder.removeShortAndLongWords(words, 5, 6)
    expect(remainingWords.length).toEqual(1)
    expect(remainingWords[0]).toEqual('zebra')
  })
})
