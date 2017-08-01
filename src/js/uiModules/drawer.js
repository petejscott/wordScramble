/* drawer.js */
'use strict'

; (function (win, SwipeHandler) {
  var manager = {}

  var CONST_DRAWER_CLASS = '.drawer' // multiple elements allowed

  function getElement (elementId) {
    return win.document.querySelector(elementId)
  }

  function getElements (sel) {
    return win.document.querySelectorAll(sel)
  }

  function bindListeners () {
    var drawers = getElements(CONST_DRAWER_CLASS)
    for (var i = 0, len = drawers.length; i < len; i++) {
      var drawer = drawers[i]
      bindOpen(drawer)
      bindClose(drawer)
      bindMenuToggle(drawer)
    }
  }
  function bindMenuToggle (drawer) {
    var toggleSelector = drawer.getAttribute('data-toggle-selector')
    if (toggleSelector === null) {
      return
    }
    var toggles = getElements(toggleSelector)
    if (toggles.length === 0) {
      return
    }

    var callback = function (evt) {
      drawer.classList.toggle('show')
      evt.preventDefault()
    }
    for (var i = 0, len = toggles.length; i < len; i++) {
      toggles[i].addEventListener('click', callback)
    }
  }
  function bindOpen (drawer) {
    var swipeTargetSelector = drawer.getAttribute('data-swipe-target')
    if (swipeTargetSelector === null) return

    var swipeTarget = getElement(swipeTargetSelector)
    if (swipeTarget === null) return

    var drawerSide = drawer.getAttribute('data-drawer-side')
    var inDirection = (drawerSide === 'left' ? 'right' : 'left')

    var callback = function (evt, opts) {
      if (opts === null || opts.target_drawer === null) {
        return
      }
      var drawer = opts.target_drawer
      drawer.classList.add('show')
    }

    SwipeHandler({
      element: swipeTarget,
      opts: { 'target_drawer': drawer },
      callback: callback,
      direction: inDirection,
      distance: 80
    })
  }
  function bindClose (drawer) {
    var drawerSide = drawer.getAttribute('data-drawer-side')
    var outDirection = drawerSide

    var callback = function (evt, opts) {
      if (opts === null || opts.target_drawer === null) {
        return
      }
      var drawer = opts.target_drawer
      drawer.classList.remove('show')
    }

    SwipeHandler({
      element: drawer,
      opts: { 'target_drawer': drawer },
      callback: callback,
      direction: outDirection,
      distance: 80
    })
  }

  bindListeners()
})(this, wordScramble.swipeHandler)

