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
      drawer.classList.toggle('visible')
      drawer.classList.toggle('hidden')
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

    var side = drawer.getAttribute('data-drawer-side')
    // if the drawer is on the left, it slides to the right when opening
    var inDirection = (side === 'left' ? 'right' : 'left')

    var callback = function (evt, opts) {
      if (opts === null || opts.target_drawer === null) {
        return
      }
      var drawer = opts.target_drawer
      drawer.classList.remove('hidden')
      drawer.classList.add('visible')
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
    var side = drawer.getAttribute('data-drawer-side')
    // if the drawer is on the left, it is hidden by sliding back to the left
    var outDirection = side

    var callback = function (evt, opts) {
      if (opts === null || opts.target_drawer === null) {
        return
      }
      var drawer = opts.target_drawer
      drawer.classList.remove('visible')
      drawer.classList.add('hidden')
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

