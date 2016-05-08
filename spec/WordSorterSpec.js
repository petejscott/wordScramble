describe('wordScramble.gameBuilder.sortWords()', function () {
  function makeWordObjects(words) {
    var wordObjects = []
    for (var i = 0, len = words.length; i < len; i++) {
      var wordObject = { 'word': words[i], 'chars': words[i].length }
      wordObjects.push(wordObject)
    }
    return wordObjects
  }

  it('should return no word objects when provided no word objects', function () {
    var sortedWords = wordScramble.gameBuilder.sortWords([], {})
    expect(sortedWords.length).toEqual(0)
  })

  it('should return a list sorted by length', function () {
    var sortedWords = wordScramble.gameBuilder.sortWords(
      makeWordObjects(['blind', 'aadvark', 'a']),
      {'sortByLength': 1})
    expect(sortedWords.length).toEqual(3)
    expect(sortedWords[0].word).toEqual('a')
    expect(sortedWords[1].word).toEqual('blind')
    expect(sortedWords[2].word).toEqual('aadvark')
  })
})