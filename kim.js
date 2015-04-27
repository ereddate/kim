;
(function() {

	var events = ["load", "click", "change", "blur", "focus", "contextmenu", "formchange", "forminput", "input", "invalid", "reset", "select", "submit", "keyup", "keydown", "keypress", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mousewheel", "scroll", "dblclick", "error", "resize", "unload", "abort", "canplay", "canplaythrough", "durationchange", "emptied", "ended", "loadeddata", "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "readystatechange", "seeked", "seeking", "stalled", "suspend", "timeupdate", "volumechange", "waiting", "afterprint", "beforeprint", "beforeunload", "haschange", "message", "offline", "online", "pagehide", "pageshow", "popstate", "redo", "storage", "undo"];

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
		jQuery.each(data, function(name, val) {
			var regex = new RegExp("\{\{" + name + "\}\}", "gi");
			temp = temp.replace(regex, (typeof val == "string" && val || typeof val == "function" && val() || _stringify(val)));
		});
		return temp;
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
					target.config.handle[eventhandle] && jQuery(elem).on(eventname, function(e) {
						/click/.test(eventname) && e.preventDefault();
						target.config.handle[eventhandle].call(this, e, target);
					});
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
				typeof jQuery(elem).attr("ng-" + name) != "undefined" && target.model[name].call(target, elem);
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
					model(elem, target)._initTmpl()._initShow()._initHandle();
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
			this.config.initialization.call(this);
			return this;
		},
		clone: function(app, type, name, clone) {
			return this.app[app] && this.app[app][type] && this.app[app][type][name] && (this.app[app][type][name + (this[type].length += 1)] = this.app[app][type][name].clone(clone || false));
		}
	};
	kim.fn.init.prototype = kim.fn;

	jQuery.extend(kim.fn, {
		toggle: function(app, type, val) {
			var self = this,
				elem;
			jQuery.each(self.app[app][type], function(name, obj) {
				if (name == val) elem = jQuery(obj).show().attr("ng-show", "show");
				else jQuery(obj).hide().attr("ng-show", "hide");
			});
			this.active = elem;
			return this;
		},
		eq: function(val) {
			var self = this;
			typeof val == "string" ? self.active.each(function(i, elem) {
				if (jQuery(elem).hasClass(val)) {
					self.active = jQuery(elem);
					return false;
				}
			}) : (self.active = self.active.eq(val));
			return this;
		},
		find: function(val) {
			var self = this;
			self.active = self.active.find("." + val.replace(/\./gi, ""));
			return this;
		},
		toggleClass: function(val, bool) {
			var self = this;
			self.active = typeof bool != "undefined" && self.active.hasClass(val) == bool || self.active.hasClass(val) ? self.active.removeClass(val) : self.active.addClass(val);
			return this;
		},
		add: function(elem) {
			var self = this,
				target = elem || self.active;
			model(target, self)._add();
			return this;
		},
		tmpl: function(data, tmpl) {
			var self = this;
			tmpl = tmpl || jQuery(self.active).html();
			return _tmpl(data, tmpl);
		}
	});

	jQuery.each(item, function(i, name) {
		kim.fn["toggle" + _capitalize(name)] = function(app, val) {
			return this.toggle(app, name, val);
		};
	});
	jQuery.each(events, function(i, name) {
		kim.fn["on" + _capitalize(name)] = function(elem, func) {
			var self = this;
			var args = arguments,
				len = args.length;
			if (len == 1)(func = elem, elem = false);
			(elem || self.active) && jQuery(self.active).on(name, function(e) {
				func.call(this, e, self);
			});
			return this;
		};
	});

	kim.fn.one = function(elem, name, func) {
		var self = this;
		var args = arguments,
			len = args.length;
		if (len <= 1) {
			return this;
		}
		if (len == 2)(func = name, name = elem, elem = false);
		(elem || self.active) && jQuery(self.active).off(name).on(name, function(e) {
			func.call(this, e, self);
		});
		return this;
	};

	kim.fn.off = function(elem, name) {
		var self = this;
		var args = arguments,
			len = args.length;
		if (len == 1)(name = elem, elem = false);
		(elem || self.active) && jQuery(self.active).off(name);
		return this;
	};

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

	jQuery.kim = kim;
	window.kim = kim;
})()
