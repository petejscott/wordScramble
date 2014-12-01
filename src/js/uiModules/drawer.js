'use strict'

; (function(win, swipeHandler) {

	var manager = {};
	
	var CONST_DRAWER_CLASS = ".drawer"; // multiple elements allowed

	function getElement(el_id)
	{
		return win.document.querySelector(el_id);
	}
	
	function getElements(sel)
	{
		return win.document.querySelectorAll(sel);
	}
	
	manager.clear = function(evt)
	{
		var drawer = evt.target;
		if (drawer === null) return;

		drawer.classList.remove("visible");
		drawer.classList.remove("flyoff");

		drawer.removeEventListener(
			'animationend',
			manager.clear,
			false);
		drawer.removeEventListener(
			'webkitAnimationEnd',
			manager.clear,
			false);
	}
	
	function bindListeners()
	{	
		var drawers = getElements(CONST_DRAWER_CLASS);
		for (var i=0, len=drawers.length; i<len; i++)
		{
			var drawer = drawers[i];
			bindOpen(drawer);
			bindClose(drawer);
			bindMenuToggle(drawer);
		}
	}
	function bindMenuToggle(drawer)
	{
		var toggle_selector = drawer.getAttribute("data-toggle-selector");
		if (toggle_selector === null)
		{
			return;
		}
		var toggles = getElements(toggle_selector);
		if (toggles.length === 0)
		{
			return;
		}
		
		var callback = function(evt)
		{
			drawer.classList.toggle('visible');
			evt.preventDefault();
		}
		for (var i=0, len=toggles.length; i<len; i++)
		{
			toggles[i].addEventListener('click', callback);
		}
	}
	function bindOpen(drawer)
	{
		var swipe_target_selector = drawer.getAttribute("data-swipe-target");
		if (swipe_target_selector === null) return;
		
		var swipe_target = getElement(swipe_target_selector);
		if (swipe_target === null) return;

		var in_dir = drawer.getAttribute("data-slide-in-dir");
		
		var callback = function(evt, opts)
		{
			if (opts === null || opts.target_drawer === null) 
			{
				return;
			}
			var drawer = opts.target_drawer;
			drawer.classList.add('visible');
		}
		
		var swipe = new swipeHandler({
			element: swipe_target,
			opts: { 'target_drawer' : drawer },
			callback: callback,
			direction: in_dir,
			distance: 80
		});
	}
	function bindClose(drawer)
	{
		var out_dir = drawer.getAttribute("data-slide-out-dir");
		
		var callback = function(evt, opts)
		{
			if (opts === null || opts.target_drawer === null) 
			{
				return;
			}
			var drawer = opts.target_drawer;
			drawer.classList.add('flyoff');

			drawer.addEventListener(
				'animationend',
				manager.clear,
				false);
			drawer.addEventListener(
				'webkitAnimationEnd',
				manager.clear,
				false);
		}

		var swipe = new swipeHandler({
			element: drawer,
			opts: { 'target_drawer' : drawer },
			callback: callback,
			direction: out_dir,
			distance: 80
		});
	}
	
	bindListeners();

})(this, wordScramble.swipeHandler);