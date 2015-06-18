;
(function() {

	var events = ["load", "click", "change", "blur", "focus", "contextmenu", "formchange", "forminput", "input", "invalid", "reset", "select", "submit", "keyup", "keydown", "keypress", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mousewheel", "scroll", "dblclick", "error", "resize", "unload", "abort", "canplay", "canplaythrough", "durationchange", "emptied", "ended", "loadeddata", "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "readystatechange", "seeked", "seeking", "stalled", "suspend", "timeupdate", "volumechange", "waiting", "afterprint", "beforeprint", "beforeunload", "haschange", "message", "offline", "online", "pagehide", "pageshow", "popstate", "redo", "storage", "undo", "tap", "swipe"];
	//, "gesturestart", "gestureend", "gesturechange"

	var item = ["page", "view", "control", "item"],
		prefix = "ng-",
		win = window,
		doc = win.document,
		tmplMark = {
			start: "{{",
			end: "}}"
		};

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
		return _type(obj);
	}

	function _isElement(el) {
		return !!(el && el.nodeType == 1);
	};

	function _has(obj, name) {
		if (_isElement(obj)) {
			var attr = jQuery.trim(jQuery(obj).attr(name));
			return attr != "" && typeof attr != "undefined";
		} else if (jQuery.isPlainObject(obj)) {
			return name in obj;
		} else if (kim.is("array", obj)) {
			return jQuery.inArray(name, obj) > 0 ? true : false;
		} else if (kim.is("string", obj)) {
			return (new RegExp(name, "igm")).test(obj);
		}
	}

	jQuery.fn._has = function(name) {
		var args = arguments,
			len = args.length;
		if (len == 1) {
			return _has(this[0], args[0]);
		}
		if (len == 2) {
			return _has(args[0], args[1]);
		}
	};

	function _type(obj, bool) {
		var type = _getConstructorName(obj).toLowerCase();
		if (bool) return type;
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

	function _tmplFilterVal(val, filterCondition) {
		if (kim.is("function", filterCondition)) {
			return filterCondition(val);
		} else if (kim.is("object", filterCondition)) {
			if (jQuery.isPlainObject(filterCondition)) {
				jQuery.each(filterCondition, function(name, oval) {
					var oreg = new RegExp(oval, "igm");
					if (oreg.test(val)) {
						return val.replace(oreg, "");
					}
				});
			}
		}
		var strRegex = new RegExp(filterCondition, "igm");
		return (val + "").replace(strRegex, "");
	}

	function _date(d, pattern) {
		d = new Date.parse(d);
		pattern = pattern || 'yyyy-MM-dd';
		var y = d.getFullYear().toString(),
			o = {
				M: d.getMonth() + 1, //month
				d: d.getDate(), //day
				h: d.getHours(), //hour
				m: d.getMinutes(), //minute
				s: d.getSeconds() //second
			};
		pattern = pattern.replace(/(y+)/ig, function(a, b) {
			return y.substr(4 - Math.min(4, b.length));
		});
		for (var i in o) {
			pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function(a, b) {
				return (o[i] < 10 && b.length > 1) ? '0' + o[i] : o[i];
			});
		}
		return pattern;
	}

	function _currency(val, symbol) {
		var places, thousand, decimal;
		places = 2;
		symbol = symbol !== undefined ? symbol : "$";
		thousand = ",";
		decimal = ".";
		var number = val,
			negative = number < 0 ? "-" : "",
			i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
			j = (j = i.length) > 3 ? j % 3 : 0;
		return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
	}

	var filter = {
		"filter": function(val, filterCondition) {
			return _tmplFilterVal(val.replace(/(^\")|(\"$)/igm, ""), filterCondition);
		},
		"json": function(val, filterCondition) {
			return _stringify(val);
		},
		"limitTo": function(val, filterCondition) {
			if (kim.is("array", val)) {
				return val.slice(0, parseInt(filterCondition));
			} else if (kim.is("string", val)) {
				return val.substr(0, parseInt(filterCondition));
			}
		},
		"lowercase": function(val, filterCondition) {
			return val.toLowerCase();
		},
		"uppercase": function(val, filterCondition) {
			return val.toUpperCase();
		},
		"orderBy": function(val, filterCondition) {
			if (kim.is("array", val) && /reverse|sort/.test(filterCondition.toLowerCase())) {
				return val[filterCondition.toLowerCase()]();
			}
		},
		"date": function(val, filterCondition) {
			return _date(val);
		},
		"currency": function(val, filterCondition) {
			return _currency(val);
		},
		"empty": function(val, filterCondition) {
			return (typeof val == "string" && jQuery.trim(val) == "" || val == null || typeof val == "undefined" || kim.is("object", val) && jQuery.isEmptyObject(val) || kim.is("array", val) && val.length == 0) && filterCondition;
		},
		"passcard": function(val, filterCondition) {
			var regex = /(\d{4})(\d{4})(\d{4})(\d{4})(\d{0,})/igm.exec(val);
			return regex && regex.join(' ') || val;
		}
	};

	var tmplCommand = new RegExp(tmplMark.start + "(\\$*[\\w\\.]*|\\s*\\$*([\\w\\.]*)\\s*\\|\\s*([\\w\\.]+)\\s*\\:\\s*(\\'*([^\\'])\\'*))" + tmplMark.end),
		tmplDefault = new RegExp(tmplMark.start + "([\\s\\S]*)" + tmplMark.end);

	function _tmpl(data, temp) {
		if (data && temp) {
			if (typeof data == "function")(data = data());
			jQuery.each(data, function(name, val) {
				var regex = new RegExp("\\s*" + name.replace(/\./igm, "\\.").replace(/\*/igm, "\\*").replace(/\s/igm, "\\s*").replace(/\$/igm, "\\$"), "igm");
				//console.log(regex)
				temp = temp.replace(regex, typeof val == "string" ? val : _stringify(val));
			});
			var split = temp.split(tmplMark.start),
				//len = split.length,
				html = [];
			html.push(split[0]);
			//console.log(data)
			jQuery.each(split, function(i, sub) {
				if (i > 0) {
					var str = tmplMark.start + sub;
					var obj = str,
						command = tmplCommand.exec(obj),
						isNull = false;
					command = !command ? (isNull = true, tmplDefault.exec(obj)) : command;
					var str = command[1],
						strA = str.split(' | '),
						val = "";

					if (strA.length > 1) {
						var filterCommand = !isNull ? command[3] : strA[1].split(' : ')[0],
							filterCondition = !isNull ? command[5] : strA[1].split(' : ')[1].replace(/\'/igm, "");
						if (filterCommand in filter) {
							val = !isNull ? filter[filterCommand](strA[0].replace(tmplMark.start, ""), filterCondition) : filter[filterCommand](/\s*[\*\+\-\/]\s*/.test(strA[0]) ? new Function("return " + strA[0].replace(tmplMark.start, ""))() : strA[0].replace(tmplMark.start, ""), filterCondition);
							if (val) {
								obj = obj.replace(command[0], val);
								html.push(obj);
							}
						}
						return true;
					} else {
						obj = !isNull ? obj.replace(command[0], command[1]) : obj.replace(command[0], new Function("return " + command[1])());
					}

					html.push(obj);
				}
			});
			//console.log(html.join(''))
			return html.join('');
		} else {
			return "";
		}
	}

	var support = {
		touch: "ontouchend" in doc
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

	function _validSwipe(coords, direction) {
		if (!this.startCoords) return false;
		var deltaY = Math.abs(coords.y - this.startCoords.y);
		var deltaX = (coords.x - this.startCoords.x) * direction;
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
				if (jQuery(evt).data(type) || !jQuery(evt).data(type) && jQuery(this).data(type)) {
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
								var left = _validSwipe.call(this, coords, -1),
									right = _validSwipe.call(this, coords, 1);
								callback && callback.call(this, left ? "left" : right ? "right" : undefined, coords, e, target);
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

	function _getTmplCustomName(elem) {
		var command = elem.attr("ng-repeat"),
			regIn = new RegExp("\\s*in\\s*", "igm");
		command = typeof command == "string" && regIn.test(command) && command.split(' ') || [];
		return command.length > 0 ? command[0] : false;
	}

	function _tmplFixData(elem, tmpl, data, n) {
		var name = _getTmplCustomName(jQuery(tmpl));
		if (name) {
			var tempData = {
				$index: n || 0
			};
			jQuery.each(data, function(i, sub) {
				var reg = new RegExp(name + "\\." + i, "igm");
				reg.test(tmpl) && (tempData[name + "." + i] = kim.stringify(sub));
			});
			return tempData;
		} else {
			return data;
		}
	}

	function _renderFile(url, data, success, error, build) {
		var self = this;
		if (!url) return;
		jQuery.ajax({
			url: url,
			type: "get",
			dataType: "html",
			data: null,
			beforeSend: function() {},
			success: function(html) {
				var elem = jQuery(html),
					arr = [],
					buildHtml = [];
				jQuery.each(data, function(i, obj) {
					arr.push(_tmplFixData(elem, html, obj, i));
				});
				jQuery.each(arr, function(i, obj) {
					buildHtml.push(_tmpl(obj, html));
				});
				var elem = jQuery(buildHtml.join(''));
				var a = jQuery.Callbacks();
				build && a.add(build(elem));
				success && a.add(success(elem, html));
				a.fire();
			},
			error: function(xhr, status, err) {
				error && error(xhr, status, err);
			}
		}).always(function() {});
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
				target = self.target,
				attr = elem._has(prefix + "app");
			if (attr) {
				if (!target.app) target.app = {};
				var name = (attr ? elem.attr(prefix + "app") : "app" + Math.random());
				if (!target.app[name]) {
					target.app[name] = {
						parent: elem
					};
					var className = prefix + "app " + prefix + "app-" + name;
					elem.addClass(className).data("ngName", {
						name: name,
						className: className,
						type: "app"
					});
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
				var attr = jQuery(elem)._has(prefix + eventname);
				if (elem && attr) {
					var eventhandle = jQuery(elem).attr(prefix + eventname);
					if (target.config.handle[eventhandle]) {
						if (support.touch && /^tap|swipe/.test(eventname)) {
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
				show = jQuery(elem)._has(prefix + "show");
			show && jQuery(elem)[jQuery(elem).attr(prefix + "show") == "show" ? "show" : "hide"]();
			return this;
		},
		_initTmpl: function(elem) {
			var self = this,
				elem = self.elem,
				target = self.target;
			jQuery.each(kim.data.model, function(name, obj) {
				var attr = jQuery(elem)._has(prefix + name)
				if (attr) {
					var command = jQuery(elem).attr(prefix + name);
					if (/\(/.test(command)) {
						var regex = new RegExp("(" + command.replace(/\)/, ")\\\)").replace(/\(/, ")\\\((").replace(/(\_|\-)/igm, "\\$1"));
						//console.log(regex)
						command = regex.exec(command);
						//console.log(command);
					}
					if (typeof command == "string") {
						kim.data.model[name].call(target, elem, command);
						return true;
					} else if (command && kim.is("array", command) && command.length > 0) {
						var args = [elem, command[1]];
						jQuery.each(command[2].split(','), function(i, str) {
							args.push(str);
						});
						target.end = function(args) {
							var len = args.length;
							var callbacks = jQuery.Callbacks();
							jQuery.each(args, function(i, arg) {
								if (i > 1 && i < len - 1) target.config.handle && callbacks.add(target.config.handle[arg]);
							});
							callbacks.fire(elem, target);
						};
						args.push(target);
						kim.data.model[name].apply(target, args);
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
				model(jQuery(obj), target)._initItem();
			});
			return this;
		},
		_storage: function(type) {
			var self = this,
				elem = self.elem,
				target = self.target,
				attr = elem._has(prefix + type),
				name = (attr ? elem.attr(prefix + type) : type + Math.random()),
				className = prefix + type + " " + prefix + type + "-" + name,
				app = elem.addClass(className).data("ngName", {
					name: name,
					className: className,
					type: type
				}).parents("." + prefix + "app").attr(prefix + "app");
			if (app && target.app[app]) {
				if (!target.app[app][type]) target.app[app][type] = {};
				target.app[app][type][name] = elem;
			}
			return this;
		},
		_initChild: function() {
			var self = this,
				elem = self.elem,
				target = self.target;
			jQuery.each(item, function(i, type) {
				var elems = elem.find("[" + prefix + type + "]");
				if (elems.length > 0) {
					jQuery.each(elems, function(i, obj) {
						model(jQuery(obj), target)._storage(type)._initShow()._initTmpl()._initHandle();
					});
				}
			});
			return this;
		},
		_initItem: function(end) {
			var self = this,
				elems = self.elem,
				target = self.target;
			jQuery.each(item, function(i, type) {
				jQuery.each(elems, function(i, elem) {
					var attr = jQuery(elem)._has(prefix + type);
					if (attr) {
						model(jQuery(elem), target)._storage(type)._initShow()._initTmpl()._initHandle();
					}
				});
			});
			self._initChild();
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

	function _find(name) {
		var elem;
		jQuery.each(item, function(i, key) {
			var obj = jQuery("[ng-" + key + "=" + name + "]");
			if (obj.length > 0) {
				elem = obj;
				return false;
			}
		});
		return elem;
	}

	jQuery.extend(kim.fn, {
		tap: function(callback) {
			kim.tap(this, callback);
			return this;
		},
		swipe: function(callback) {
			kim.swipe(this, callback);
			return this;
		},
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
			var obj = jQuery(self).find("." + val.replace(/\./igm, ""));
			if (obj.length == 0) {
				obj = _find(val);
			}
			activeElem.call(self, obj);
			return this;
		},
		get: function(elem) {
			if (typeof elem == "string") {
				if (/ng\-/.test(elem) && (new regExp(item.join('\-|'))).test(elem)) {
					return this.find(elem);
				} else {
					var self = this;
					jQuery.each(item, function(i, name) {
						var obj = self.find(prefix + name + "-" + elem);
						if (obj.length > 0) return false;
					});
					return this;
				}
			}
			activeElem.call(this, elem);
			return this;
		},
		query: function(selector) {
			var elem = jQuery(selector);
			elem.length && activeElem.call(this, elem);
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
			tagname = jQuery(elem).data("ngName");
			if (!tagname || tagname == "")
				jQuery.each(item, function(i, name) {
					if (jQuery(elem).hasClass(prefix + name)) {
						tagname = jQuery(elem).attr(prefix + name);
						return false;
					}
				});
			return tagname;
		},
		buildFile: function(url, data, success, error) {
			var self = this;
			_renderFile(url, data, success, error, function(elem) {
				model(elem, self)._initItem();
			});
			return this;
		}
	});

	kim.data = {
		model: {},
		filter: filter,
		tmplMark: tmplMark
	};

	kim.setTmplMark = function(callback) {
		var mark = {};
		callback && typeof callback == "function" && (jQuery.Callbacks()).add(callback(mark)).add((tmplMark.start = mark.start, tmplMark.end = mark.end)).fire();
		//console.log(tmplMark)
		return this;
	};

	kim.query = function(selector) {
		var obj = jQuery(selector);
		if (obj.length == 0) obj = _find(selector);
		return obj;
	};

	kim.renderFile = function(url, data, success, error) {
		_renderFile(url, data, success, error);
		return this;
	};

	kim.tmpl = function(data, tmpl) {
		return _tmpl(data, tmpl);
	};

	kim.modelExtend = function(args) {
		if (typeof args == "undefined") return;
		jQuery.each(args, function(name, val) {
			if (!(name in kim.data.model)) {
				kim.data.model[name] = val;
			}
		});
		return this;
	};

	kim.filterExtend = function(args) {
		if (typeof args == "undefined") return;
		jQuery.each(args, function(name, val) {
			if (!(name in kim.data.filter)) {
				kim.data.filter[name] = val;
			}
		});
		return this;
	};

	kim.getTmplCustomName = _getTmplCustomName;

	kim.tmplFixData = _tmplFixData;

	kim.data.items = item;

	kim.data.support = support;

	kim.has = _has;

	kim.stringify = _stringify;

	kim.is = function(str, obj) {
		var bool = false;
		bool = /element/.test(str.toLowerCase()) ? _isElement(obj) : _getConstructorName(obj).toLowerCase() === str.toLowerCase();
		return bool;
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
	win.kim = kim;
})()