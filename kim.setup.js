kim && kim.define && kim.define(function(require, exports, module) {
	var navigator = window.navigator,
		head;

	function _addMeta(name, content) {
		var meta = document.createElement('meta');

		meta.setAttribute('name', name);
		meta.setAttribute('content', content);
		head.append(meta);
	}

	function _addIcon(href, sizes, precomposed) {
		var link = document.createElement('link');
		link.setAttribute('rel', 'apple-touch-icon' + (precomposed ? '-precomposed' : ''));
		link.setAttribute('href', href);
		if (sizes) {
			link.setAttribute('sizes', sizes);
		}
		head.append(link);
	}

	function _addStartupImage(href, media) {
		var link = document.createElement('link');
		link.setAttribute('rel', 'apple-touch-startup-image');
		link.setAttribute('href', href);
		if (media) {
			link.setAttribute('media', media);
		}
		head.append(link);
	}

	function _getHead() {
		return document.head || document.getElementsByTagName('head')[0];
	}

	var ua = navigator.userAgent;

	function _isPhone(ua) {
		var isMobile = /Mobile(\/|\s)/.test(ua);

		// Either:
		// - iOS but not iPad
		// - Android 2
		// - Android with "Mobile" in the UA

		return /(iPhone|iPod)/.test(ua) ||
			(!/(Silk)/.test(ua) && (/(Android)/.test(ua) && (/(Android 2)/.test(ua) || isMobile))) ||
			(/(BlackBerry|BB)/.test(ua) && isMobile) ||
			/(Windows Phone)/.test(ua);
	}

	function _isTablet(ua) {
		return !_isPhone(ua) && (/iPad/.test(ua) || /Android/.test(ua) || /(RIM Tablet OS)/.test(ua) ||
			(/MSIE 10/.test(ua) && /; Touch/.test(ua)));
	}

	kim.support.isPhone = _isPhone(ua);
	kim.support.isTablet = _isTablet(ua);

	kim.setup = function(options, callback) {
		head = jQuery(_getHead());
		var args = arguments,
			len = args.length;
		if (len == 1 && kim.isFunction(args[0])) {
			callback = options;
			options = false;
		}
		var triggerFn = function() {
			if (navigator.standalone) {
				_addMeta('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0');
			} else {
				_addMeta('viewport', 'initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, minimum-ui');
			}
			_addMeta('apple-mobile-web-app-capable', 'yes');
			_addMeta('apple-touch-fullscreen', 'yes');

			var statusBarStyle = options && options.statusBarStyle || 'black';

			if (statusBarStyle) {
				_addMeta('apple-mobile-web-app-status-bar-style', statusBarStyle);
			}

			if (kim.support.touch) {

				var icon = options && options.icon,
					devicePixelRatio = window.devicePixelRatio || 1,
					startupImage = options && options.startupImage || {},
					isIconPrecomposed = Boolean(options && options.isIconPrecomposed);

				if (icon && kim.isString(icon)) {
					icon = {
						57: icon,
						72: icon,
						114: icon,
						144: icon
					};
				} else if (!icon) {
					icon = {};
				}

				if (_isTablet(ua)) {
					if (devicePixelRatio >= 2) {
						// Retina iPad - Landscape
						if ('1496x2048' in startupImage) {
							_addStartupImage(startupImage['1496x2048'], '(orientation: landscape)');
						}
						// Retina iPad - Portrait
						if ('1536x2008' in startupImage) {
							_addStartupImage(startupImage['1536x2008'], '(orientation: portrait)');
						}

						// Retina iPad
						if ('144' in icon) {
							_addIcon(icon['144'], '144x144', isIconPrecomposed);
						}
					} else {
						// Non-Retina iPad - Landscape
						if ('748x1024' in startupImage) {
							_addStartupImage(startupImage['748x1024'], '(orientation: landscape)');
						}
						// Non-Retina iPad - Portrait
						if ('768x1004' in startupImage) {
							_addStartupImage(startupImage['768x1004'], '(orientation: portrait)');
						}

						// Non-Retina iPad
						if ('72' in icon) {
							_addIcon(icon['72'], '72x72', isIconPrecomposed);
						}
					}
				} else if (_isPhone(ua)) {
					// Retina iPhone, iPod touch with iOS version >= 4.3
					if (devicePixelRatio >= 2) {
						if (/(iPhone)/.test(ua) && window.screen.height == 568) {
							_addStartupImage(startupImage['640x1096']);
						} else {
							_addStartupImage(startupImage['640x920']);
						}

						// Retina iPhone and iPod touch
						if ('114' in icon) {
							_addIcon(icon['114'], '114x114', isIconPrecomposed);
						}
					} else {
						_addStartupImage(startupImage['320x460']);

						// Non-Retina iPhone, iPod touch, and Android devices
						if ('57' in icon) {
							_addIcon(icon['57'], null, isIconPrecomposed);
						}
					}
				}

			}

			callback && callback();
		};
		if (navigator.standalone) {
			setTimeout(function() {
				setTimeout(function() {
					triggerFn();
				}, 1);
			}, 1);
		} else {
			setTimeout(function() {
				triggerFn();
			}, 1);
		}

		return this;
	};
});