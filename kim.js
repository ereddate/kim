;
(function() {
	function _init() {
		var self = this,
			ren = jQuery("html").children();
		ren.each(function(i, obj) {
			var elem = jQuery(obj);
			_initApp.call(self, elem);
		});
	}

	var events = ["load", "click", "change", "blur", "focus", "contextmenu", "formchange", "forminput", "input", "invalid", "reset", "select", "submit", "keyup", "keydown", "keypress", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mousewheel", "scroll", "dblclick", "error", "resize", "unload", "abort", "canplay", "canplaythrough", "durationchange", "emptied", "ended", "loadeddata", "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "readystatechange", "seeked", "seeking", "stalled", "suspend", "timeupdate", "volumechange", "waiting", "afterprint", "beforeprint", "beforeunload", "haschange", "message", "offline", "online", "pagehide", "pageshow", "popstate", "redo", "storage", "undo"];

	var item = ["page", "view", "control", "item"];

	function _initApp(elem) {
		var self = this;
		if (typeof elem.attr("ng-app") != "undefined") {
			if (!self.app) self.app = {};
			var name = (elem.attr("ng-app") != "" ? elem.attr("ng-app") : "app" + Math.random());
			if (!self.app[name]) {
				self.app[name] = {
					parent: elem
				};
				elem.addClass("ng-app ng-app-" + name);
				_initTmpl.call(self, elem);
				_initShow(elem);
				_add.call(self, elem);
			}
		} else {
			jQuery(elem).children().each(function(i, obj) {
				_initApp.call(self, jQuery(obj));
			});
		}
	}

	function _initModel(elem) {
		var self = this,
			command, regex, regval;
		jQuery(elem).attr("ng-model") && (command = jQuery(elem).attr("ng-model"), regex = (new RegExp("(" + command.replace(/\)/, ")\\)").replace(/\(/, ")\\(("))), regval = regex.exec(command), regval && self.model && self.model[regval[1]] && self.model[regval[1]].call(self, elem, regval[2] && regval[2].split(','), self));
	}

	function _judgmentType(html) {
		if (/ng\-page/.test(html)) {
			return 0;
		} else if (/ng\-view/.test(html)) {
			return 1;
		} else if (/ng\-control/.test(html)) {
			return 2;
		} else if (/ng\-item/.test(html)) {
			return 3;
		}
	}

	function _initHandle(obj) {
		var self = this;
		jQuery.each(events, function(i, eventname) {
			if (obj && typeof jQuery(obj).attr("ng-" + eventname) != "undefined") {
				var eventhandle = jQuery(obj).attr("ng-" + eventname);
				self.config.handle[eventhandle] && jQuery(obj).off(eventname).on(eventname, function(e) {
					/click/.test(eventname) && e.preventDefault();
					self.config.handle[eventhandle].call(this, e, self);
				});
			}
		});
	}

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

	function _initShow(elem) {
		var self = this,
			show = jQuery(elem).attr("ng-show");
		typeof show != "undefined" && jQuery(elem)[show == "show" ? "show" : "hide"]();
	}

	function _tmpl(data, temp) {
		jQuery.each(data, function(name, val) {
			var regex = new RegExp("\{\{" + name + "\}\}", "gi");
			temp = temp.replace(regex, (typeof val == "string" && val || typeof val == "function" && val() || _stringify(val)));
		});
		return temp;
	}

	function _initTmpl(elem){
		var self = this;
		jQuery(elem).attr("ng-list") && self.config.handle[jQuery(elem).attr("ng-list")].call(self, function(data) {
			var tmpl = jQuery(elem).html(),
				html = [];
			jQuery(elem).data("tmpl", tmpl);
			jQuery.each(data, function(i, obj) {
				var temp = tmpl;
				temp = _tmpl(obj, temp);
				html.push(temp);
			});
			var newitem = jQuery(html.join(''));
			jQuery(elem).html(newitem).show();
			_add.call(self, elem);
		}, self) || jQuery(elem).attr("ng-tmpl") && self.config.handle[jQuery(elem).attr("ng-tmpl")].call(self, function(data) {
			var tmpl = jQuery(elem).html();
			jQuery(elem).data("tmpl", tmpl);
			tmpl = _tmpl(data, tmpl);
			var newitema = jQuery(tmpl);
			jQuery(elem).html(newitema).show();
			_add.call(self, elem);
		}, self);
	}

	function _initData(elem) {
		var self = this;
	}

	function _add(elem, num) {
		var self = this;
		jQuery(elem).children().each(function(i, obj) {
			_initItem.call(self, jQuery(obj), function(obj, n) {
				_add.call(self, obj);
			});
		});
	}

	function _initItem(elem, end) {
		var self = this;
		jQuery.each(item, function(i, type) {
			if (typeof elem.attr("ng-" + type) != "undefined" && !/\{\{/.test(elem.attr("ng-" + type))) {
				var name = (elem.attr("ng-" + type) != "" ? elem.attr("ng-" + type) : type + Math.random());
				elem.addClass("ng-" + type + " ng-" + type + "-" + name);
				var app = elem.parents(".ng-app").attr("ng-app");
				if (self.app[app]) {
					if (!self.app[app][type]) self.app[app][type] = {};
					self.app[app][type][name] = elem;
				}
				//self[next].length += 1;
				_initTmpl.call(self, elem);
				_initShow(elem);
				_initHandle.call(self, elem);
				_initModel.call(self, elem);
			}
		});
		end.call(self, elem);
	}

	var kim = function(ops) {
		return new kim.fn.init(ops);
	};
	kim.fn = kim.prototype = {
		init: function(ops) {
			if (!this.config) this.config = {};
			jQuery.extend(this.config, ops);
			_init.call(this);
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
			_add.call(self, target);
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
		kim.fn["on" + _capitalize(name)] = function(func) {
			var self = this;
			self.active && jQuery(self.active).on(name, function(e) {
				func.call(this, e, self);
			});
			return this;
		};
		kim.fn.off = function(name) {
			var self = this;
			self.active && jQuery(self.active).off(name);
			return this;
		};
		kim.fn.one = function(func) {
			var self = this;
			self.active && jQuery(self.active).off(name).on(name, function(e) {
				func.call(this, e, self);
			});
			return this;
		};
	});

	kim.fn.model = {};

	function _findClassElem(elem, name) {
		return jQuery(elem).parents(".ng-app").find(".ng-page-" + name).length > 0 && jQuery(elem).parents(".ng-app").find(".ng-page-" + name) || jQuery(elem).parents(".ng-app").find(".ng-view-" + name).length > 0 && jQuery(elem).parents(".ng-app").find(".ng-view-" + name) || jQuery(elem).parents(".ng-app").find(".ng-control-" + name).length > 0 && jQuery(elem).parents(".ng-app").find(".ng-control-" + name).length || jQuery(elem).parents(".ng-app").find(".ng-item-" + name).length > 0 && jQuery(elem).parents(".ng-app").find(".ng-item-" + name);
	}

	function func(elem, tip, deftip, callback) {
		var self = this,
			obj;
		typeof tip == "undefined" && (tip = deftip);
		callback && callback in self.config.handle && self.config.handle[callback].call(elem, false, tip, this) || callback && (obj = _findClassElem(elem, callback), obj && obj.each(function(i, a) {
			if (/input|select|textarea/.test(a.tagName.toLowerCase())) jQuery(a).show().val(tip);
			else jQuery(a).show().html(tip);
		}));
	}

	function done(elem, callback) {
		var self = this,
			obj;
		callback && callback in self.config.handle && self.config.handle[callback].call(elem, true, "", this) || callback && (obj = _findClassElem(elem, callback), obj && obj.each(function(i, a) {
			jQuery(a).hide();
		}));
	}

	var validtype = {
		addressmin5: function(elem, val, tip, callback) {
			if (val.length < 5) {
				func.call(this, elem, tip, "地址至少要输入5个字", callback);
				return false;
			}
			return true;
		},
		addressmax64: function(elem, val, tip, callback) {
			if (val.length > 64) {
				func.call(this, elem, tip, "您输入的地址过长", callback);
				return false;
			}
			return true;
		},
		isname: function(elem, val, tip, callback) {
			var len = val.length;
			if (/[^\u4e00-\u9fa5]/.test(val) || len < 2 || len > 5) {
				func.call(this, elem, tip, "姓名长度2-5个汉字", callback);
				return false;
			}
			return true;
		},
		oldtime: function(elem, val, tip, callback) {
			if (Date.parse(new Date(val.replace(/-/gi, "/"))) < Date.parse(new Date())) {
				func.call(this, elem, tip, "装机时间不能小于当前时间", callback);
				return false;
			}
			return true;
		},
		required: function(elem, val, tip, callback) {
			if (val == "") {
				func.call(this, elem, tip, "输入内容不能为空", callback);
				return false;
			}
			return true;
		},
		nocode: function(elem, val, tip, callback) {
			var reg = /^[^\',`~:;!@#$%^&*<>+=\\\][\]\{\}]*$/;
			if (!reg.test(val)) {
				func.call(this, elem, tip, "输入内容包含非法字符", callback);
				return false;
			}
			return true;
		},
		ismobile: function(elem, val, tip, callback) {
			var length = ($.trim(val)).length;
			var tel = /^1[3|4|5|8|7][0-9]\d{8}$/;
			if (!tel.test(val) || length != 11) {
				func.call(this, elem, tip, "请输入正确的手机号码", callback);
				return false;
			}
			return true;
		},
		isphone: function(elem, val, tip, callback) {
			var tel = /^(\d{3,4}-?)?\d{7,9}$/g;
			if (!tel.test(val)) {
				func.call(this, elem, tip, "请输入正确的座机号码", callback);
				return false;
			}
			return true;
		},
		zipcode: function(elem, val, tip, callback) {
			var tel = /^[0-9]{6}$/;
			if (!tel.test(val)) {
				func.call(this, elem, tip, "请输入正确的邮政编码", callback);
				return false;
			}
			return true;
		},
		isemail: function(elem, val, tip, callback) {
			if (!/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(val)) {
				func.call(this, elem, tip, "请输入正确的邮箱地址", callback);
				return false;
			}
			return true;
		},
		ispassword: function(elem, val, tip, callback) {
			if (val.length < 8 || val.length > 16) {
				func.call(this, elem, tip, "密码长度8~16位，数字、字母、字符至少包含两种", callback);
				return false;
			} else if (/[^\x00-\x7f]/.test(val)) {
				func.call(this, elem, tip, "密码长度8~16位，数字、字母、字符至少包含两种", callback);
				return false;
			} else if (/^\d+$/.test(val)) {
				func.call(this, elem, tip, "密码长度8~16位，数字、字母、字符至少包含两种", callback);
				return false;
			} else if (/^[A-Za-z]+$/.test(val)) {
				func.call(this, elem, tip, "密码长度8~16位，数字、字母、字符至少包含两种", callback);
				return false;
			} else if (/^[^A-Za-z0-9]+$/.test(val)) {
				func.call(this, elem, tip, "密码长度8~16位，数字、字母、字符至少包含两种", callback);
				return false;
			}
			return true;
		}
	};

	jQuery.extend(kim.fn.model, {
		valid: function(elem, args, target) {
			var self = this;
			jQuery(elem).on(/select/.test((elem.length && elem[0] || elem).tagName.toLowerCase()) ? "change" : "blur", function() {
				var val = jQuery(elem).val();
				jQuery.each(args, function(i, ops) {
					ops = ops.split(':');
					var type = ops[0],
						tip = ops[1],
						callback = ops[2];
					if (typeof val == "undefined") {
						func.call(self, elem, tip, "输入内容不能为空", callback);
						return false;
					}
					if (validtype && (type in validtype)) {
						var bool = validtype[type].call(self, elem, val, tip, callback);
						if (bool) {
							done.call(self, elem, callback);
						}
					}
				});
			});

			return target;
		}
	});

	jQuery.kim = kim;
})()
