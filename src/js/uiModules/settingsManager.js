/* settingsManager.js */
'use strict'

var wordScramble = wordScramble || {}
wordScramble.settingsManager = (function (configuration, pubsub) {
  var manager = {}

  var CONST_ELEMENT_ID = '#settings'

  manager.configureUI = function (config) {
    updateBooleanElement('#sortAlpha', 'sortAlpha')
    updateBooleanElement('#sortByLength', 'sortByLength')
  }

  function updateBooleanElement (elementSelector, configurationPropertyName) {
    var settingUI = document.querySelector(CONST_ELEMENT_ID).querySelector(elementSelector)
    settingUI.checked = (configuration[configurationPropertyName] === 1)
    settingUI.addEventListener('change', function (e) {
      configuration[configurationPropertyName] = (e.currentTarget.checked ? 1 : 0)
      console.log(configuration)
      manager.configureUI(configuration)
    })
  }

  manager.configureUI(configuration)

  return manager
})(wordScramble.configuration, window.pubsub)
