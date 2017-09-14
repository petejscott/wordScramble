/* settingsManager.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.settingsManager = (function (baseConfiguration, pubsub) {
  var manager = {}

  var CONST_ELEMENT_ID = '#settings'
  var config = baseConfiguration

  manager.configureUI = function (config) {
    console.log(config)
    updateBooleanElement('#sortAlpha', 'sortAlpha')
    updateBooleanElement('#sortByLength', 'sortByLength')
  }

  function updateBooleanElement (elementSelector, configurationPropertyName) {
    var settingUI = document.querySelector(CONST_ELEMENT_ID).querySelector(elementSelector)
    settingUI.checked = (config[configurationPropertyName] === 1)
    settingUI.addEventListener('change', function (e) {
      config[configurationPropertyName] = (e.currentTarget.checked ? 1 : 0)
      manager.configureUI(config)
      pubsub.publish('wordScramble/configChanged', config)
    })
  }

  pubsub.subscribe('wordScramble/configLoaded', function (topic, data) {
    config = data
    manager.configureUI(config)
  })
  manager.configureUI(config)

  return manager
})(wordScramble.configuration, window.pubsub)
