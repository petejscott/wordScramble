/* gameService.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.settingService = (function (configuration, pubsub) {
  var sService = {}

  var storageKey = 'wordScramble.configData'

  function saveSettingData (config) {
    window.localStorage.setItem(storageKey, JSON.stringify(config))
  }
  function loadSettingData () {
    if (!window.localStorage) return
    var storedData = window.localStorage.getItem(storageKey)
    if (storedData) {
      var config = JSON.parse(storedData)
      pubsub.publish('wordScramble/configLoaded', config)
      return true
    }
    return false
  }

  pubsub.subscribe('wordScramble/configChanged', function (topic, data) {
    saveSettingData(data)
  })

  loadSettingData()

  return sService
})(wordScramble.configuration, window.pubsub)

