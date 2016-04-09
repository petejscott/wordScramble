describe('wordScramble.Configuration', function () {
  var config;

  beforeEach(function () {
    config = wordScramble.configuration
  })

  it('should contain minWords property with a number value', function () {
    expect(config.minWords).toBeDefined()
    expect(config.minWords).toEqual(jasmine.any(Number))
  })

  it('should contain maxWords property with a number value', function () {
    expect(config.maxWords).toBeDefined()
    expect(config.maxWords).toEqual(jasmine.any(Number))
  })

  it('should contain minWordLength property with a number value', function () {
    expect(config.minWordLength).toBeDefined()
    expect(config.maxWords).toEqual(jasmine.any(Number))
  })

  it('should contain letterCount property with a number value', function () {
    expect(config.letterCount).toBeDefined()
    expect(config.letterCount).toEqual(jasmine.any(Number))
  })
})
