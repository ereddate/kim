;
(function() {

	var events = ["load", "click", "change", "blur", "focus", "contextmenu", "formchange", "forminput", "input", "invalid", "reset", "select", "submit", "keyup", "keydown", "keypress", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mousewheel", "scroll", "dblclick", "error", "resize", "unload", "abort", "canplay", "canplaythrough", "durationchange", "emptied", "ended", "loadeddata", "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "readystatechange", "seeked", "seeking", "stalled", "suspend", "timeupdate", "volumechange", "waiting", "afterprint", "beforeprint", "beforeunload", "haschange", "message", "offline", "online", "pagehide", "pageshow", "popstate", "redo", "storage", "undo", "tap", "swipe"];
	//, "gesturestart", "gestureend", "gesturechange"

	var item = ["page", "view", "control", "item"];

	function _getConstructorName(o) {
		//加o.constructor是因为IE下的window和document
		if (o != null && o.constructor != null) {
			return Object.prototype.toString.call(o).slice(8, -1);
		} else {
			return '';
		}
	}

	function _mulReplace(s, arr) {
		for (var i = 0; i < arr.length; i++) {
			s = s.replace(arr[i][0], arr[i][1]);
		}
		return s;
	}

	function _escapeChars(s) {
		return _mulReplace(s, [
			[/\\/g, "\\\\"],
			[/"/g, "\\\""],
			//[/'/g, "\\\'"],//标准json里不支持\后跟单引号
			[/\r/g, "\\r"],
			[/\n/g, "\\n"],
			[/\t/g, "\\t"]
		]);
	}

	function _stringify(obj) {
		if (obj == null) {
			return 'null';
		}
		if (obj.toJSON) {
			return obj.toJSON();
		}
		var type = _getConstructorName(obj).toLowerCase();
		switch (type) {
			case 'string':
				return '"' + _escapeChars(obj) + '"';
			case 'number':
				var ret = obj.toString();
				return /N/.test(ret) ? 'null' : ret;
			case 'boolean':
				return obj.toString();
			case 'date':
				return 'new Date(' + obj.getTime() + ')';
			case 'array':
				var ar = [];
				for (var i = 0; i < obj.length; i++) {
					ar[i] = _stringify(obj[i]);
				}
				return '[' + ar.join(',') + ']';
			case 'object':
				if (jQuery.isPlainObject(obj)) {
					ar = [];
					for (i in obj) {
						ar.push('"' + _escapeChars(i) + '":' + _stringify(obj[i]));
					}
					return '{' + ar.join(',') + '}';
				}
		}
		return 'null'; //无法序列化的，返回null;
	}

	function _capitalize(val) {
		return val[0].toUpperCase() + val.substr(1);
	}

	function _tmpl(data, temp) {
		if (data) {
			if (typeof data == "function")(data = data());
			jQuery.each(data, function(name, val) {
				var regex = new RegExp("\{\{" + name + "\}\}", "gi");
				temp = temp.replace(regex, (typeof val == "string" && val || typeof val == "function" && val() || _stringify(val)));
			});
			return temp;
		} else {
			return "";
		}
	}

	var support = {
		touch: "ontouchend" in document
	};

	function getCoordinates(event) {
		var touches = event.touches && event.touches.length ? event.touches : [event];
		var e = (event.changedTouches && event.changedTouches[0]) ||
			(event.originalEvent && event.originalEvent.changedTouches &&
				event.originalEvent.changedTouches[0]) ||
			touches[0].originalEvent || touches[0];

		return {
			x: e.clientX,
			y: e.clientY
		};
	}

	function _validSwipe(coords) {
		if (!this.startCoords) return false;
		var deltaY = Math.abs(coords.y - this.startCoords.y);
		var deltaX = (coords.x - this.startCoords.x) * -1;
		return this.valid &&
			deltaY < 75 &&
			deltaX > 0 &&
			deltaX > 30 &&
			deltaY / deltaX < 0.3;
	}

	function _touch(elem, type, callback) {
		var target = this;
		jQuery.each(["touchstart", "touchend", "touchmove", "touchcancel"], function(i, name) {
			jQuery(elem).data(type, true).off(name).on(name, function(e) {
				var evt = e.target;
				if (jQuery(evt).data(type)) {
					switch (name.replace("touch", "")) {
						case "start":
							this.startCoords = getCoordinates(e);
							if (/swipe/.test(type)) {
								this.active = true;
								this.totalX = 0;
								this.totalY = 0;
								this.lastPos = this.startCoords;
								this.valid = true;
							} else {
								this.active = false;
							}
							break;
						case "move":
							if (!this.active) return;

							if (!this.startCoords) return;
							var coords = getCoordinates(e);

							this.totalX += Math.abs(coords.x - this.lastPos.x);
							this.totalY += Math.abs(coords.y - this.lastPos.y);

							this.lastPos = coords;

							if (this.totalX < 10 && this.totalY < 10) {
								return;
							}

							if (this.totalY > this.totalX) {} else {
								e.preventDefault();
							}
							break;
						case "cancel":
							if (!this.active) return;

							if (!this.startCoords) return;
							var coords = getCoordinates(e);

							this.totalX += Math.abs(coords.x - this.lastPos.x);
							this.totalY += Math.abs(coords.y - this.lastPos.y);

							this.lastPos = coords;

							if (this.totalX < 10 && this.totalY < 10) {
								return;
							}

							if (this.totalY > this.totalX) {
								this.active = false;
								this.valid = false;
							}
							break;
						case "end":
							if (/swipe/.test(type) && 'lastPos' in this) {
								if (!this.active) return;
								this.active = false;
								var coords = getCoordinates(e);
								var result = _validSwipe.call(this, coords);
								callback && callback.call(this, result ? "left" : "right", coords, e, target);
								return;
							} else {
								e.preventDefault();
								var selfElem = this;
								if (selfElem.TouchTimeout) clearTimeout(selfElem.TouchTimeout);
								selfElem.TouchTimeout = setTimeout(function() {
									callback && callback.call(selfElem, getCoordinates(e), e, target);
								}, 250);
							}
							break;
					}
				}
			});
		});
	}

	var model = function(elem, target) {
		return new model.fn.init(elem, target);
	};

	model.fn = model.prototype = {
		init: function(elem, target) {
			this.elem = elem;
			this.target = target;
			return this;
		},
		_initApp: function() {
			var self = this,
				elem = self.elem,
				target = self.target;
			if (typeof elem.attr("ng-app") != "undefined") {
				if (!target.app) target.app = {};
				var name = (elem.attr("ng-app") != "" ? elem.attr("ng-app") : "app" + Math.random());
				if (!target.app[name]) {
					target.app[name] = {
						parent: elem
					};
					elem.addClass("ng-app ng-app-" + name);
					model(elem, target)._initTmpl()._initShow()._add();
				}
			} else {
				jQuery(elem).children().each(function(i, obj) {
					model(jQuery(obj), target)._initApp();
				});
			}
			return this;
		},
		_initHandle: function() {
			var self = this,
				target = self.target,
				elem = self.elem;
			jQuery.each(events, function(i, eventname) {
				if (elem && typeof jQuery(elem).attr("ng-" + eventname) != "undefined") {
					var eventhandle = jQuery(elem).attr("ng-" + eventname);
					if (target.config.handle[eventhandle]) {
						if (support && /^tap|swipe/.test(eventname)) {
							/tap/.test(eventname) && jQuery.kim.tap(elem, target.config.handle[eventhandle]) || /swipe/.test(eventname) && jQuery.kim.swipe(elem, target.config.handle[eventhandle]);
						} else {
							jQuery(elem).on(eventname, function(e) {
								/click/.test(eventname) && e.preventDefault();
								target.config.handle[eventhandle].call(this, e, target);
							});
						}
					}
				}
			});
			return this;
		},
		_initShow: function() {
			var self = this,
				elem = self.elem,
				target = self.target,
				show = jQuery(elem).attr("ng-show");
			typeof show != "undefined" && jQuery(elem)[show == "show" ? "show" : "hide"]();
			return this;
		},
		_initTmpl: function(elem) {
			var self = this,
				elem = self.elem,
				target = self.target;
			jQuery.each(target.model, function(name, obj) {
				if (typeof jQuery(elem).attr("ng-" + name) != "undefined") {
					var command = jQuery(elem).attr("ng-" + name);
					if (/\(/.test(command)) {
						var regex = new RegExp("(" + command.replace(/\)/, ")\\\)").replace(/\(/, ")\\\((").replace(/(\_|\-)/gi, "\\$1"));
						//console.log(regex)
						command = regex.exec(command);
						//console.log(command);
					}
					if (typeof command == "string") {
						target.model[name].call(target, elem, command);
						return true;
					} else if (command) {
						var args = [elem, command[1], command[2], target];
						target.model[name].apply(target, args);
					}
				}
			});
			return this;
		},
		_add: function() {
			var self = this,
				elem = self.elem,
				target = self.target;
			jQuery(elem).children().each(function(i, obj) {
				model(jQuery(obj), target)._initItem(function(obj) {
					model(obj, target)._add();
				});
			});
			return this;
		},
		_initItem: function(end) {
			var self = this,
				elem = self.elem,
				target = self.target;
			jQuery.each(item, function(i, type) {
				if (typeof elem.attr("ng-" + type) != "undefined" && !/\{\{/.test(elem.attr("ng-" + type))) {
					var name = (elem.attr("ng-" + type) != "" ? elem.attr("ng-" + type) : type + Math.random());
					elem.addClass("ng-" + type + " ng-" + type + "-" + name);
					var app = elem.parents(".ng-app").attr("ng-app");
					if (target.app[app]) {
						if (!target.app[app][type]) target.app[app][type] = {};
						target.app[app][type][name] = elem;

					}
					model(elem, target)._initShow()._initTmpl()._initHandle();
				}
			});
			end(elem);
			return this;
		}
	};

	model.fn.init.prototype = model.fn;

	function _init(elem) {
		var self = this;
		if (elem) {
			model(elem, self)._initApp();
			return;
		}
		ren = jQuery("html").children();
		ren.each(function(i, obj) {
			var a = jQuery(obj);
			model(a, self)._initApp();
		});
	}

	var kim = function(elem, ops) {
		return new kim.fn.init(elem, ops);
	};
	kim.fn = kim.prototype = {
		init: function() {
			var args = arguments,
				ops, elem;
			if (typeof args[1] == "undefined") ops = args[0], elem = undefined;
			else elem = args[0], ops = args[1];
			if (!this.config) this.config = {};
			jQuery.extend(this.config, ops);
			_init.call(this, elem);
			this.config.initialization && this.config.initialization.call(this);
			return this;
		}
	};
	kim.fn.init.prototype = kim.fn;

	jQuery.each(["tap", "swipe"], function(i, name) {
		kim[name] = function(elem, callback) {
			_touch.call(this, elem, name, callback);
		};
	});

	function activeElem(elem) {
		var self = this;
		var len = jQuery(elem).length;
		if (len < self.length) {
			for (var i = 0; i < self.length; i++)
				if (i >= len) delete self[i];
			self.length = len;
			//return;
		}
		jQuery(elem).each(function(i, obj) {
			self[i] = obj;
		});
		self.length = len;
	}

	jQuery.extend(kim.fn, {
		eq: function(val) {
			var self = this;
			typeof val == "string" ? jQuery(self).each(function(i, elem) {
				if (jQuery(elem).hasClass(val)) {
					activeElem.call(self, elem);
					return false;
				}
			}) : activeElem.call(self, jQuery(self).eq(val));
			return this;
		},
		find: function(val) {
			var self = this;
			activeElem.call(self, jQuery(self).find("." + val.replace(/\./gi, "")));
			return this;
		},
		get: function(elem) {
			if (typeof elem == "string") {
				if (/ng\-/.test(elem) && (new regExp(item.join('\-|'))).test(elem)) {
					return this.find(elem);
				} else {
					var self = this;
					jQuery.each(item, function(i, name) {
						var obj = self.find("ng-" + name + "-" + elem);
						if (obj.length > 0) return false;
					});
					return this;
				}
			}
			activeElem.call(this, elem);
			return this;
		},
		build: function(elem) {
			var self = this,
				target = elem || self;
			model(target, self)._add();
			return this;
		},
		tmpl: function(data, tmpl) {
			var self = this;
			tmpl = tmpl || jQuery(self).html();
			return _tmpl(data, tmpl);
		},
		getName: function(elem) {
			var tagname = "";
			jQuery.each(item, function(i, name) {
				if (jQuery(elem).hasClass("ng-" + name)) {
					tagname = jQuery(elem).attr("ng-" + name);
					return false;
				}
			});
			return tagname;
		}
	});

	kim.fn.model = {};

	kim.tmpl = function(data, tmpl) {
		return _tmpl(data, tmpl);
	};

	kim.modelExtend = function(args) {
		if (typeof args == "undefined") return;
		var bool = false;
		jQuery.each(args, function(name, val) {
			if (!(name in kim.fn.model)) {
				kim.fn.model[name] = val;
			}
		});
		return this;
	}

	jQuery.fn.kim = function(ops) {
		return kim(this, ops);
	};

	if (typeof define === "function" && define.amd) {
		define("kim", [], function() {
			return kim;
		});
	}

	jQuery.kim = kim;
	window.kim = kim;
})()