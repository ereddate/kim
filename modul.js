;
		(function() {
			function _init() {
				var self = this,
					ren = jQuery("html").children();
				ren.each(function(i, obj) {
					if (typeof jQuery(obj).attr("ng-app") != "undefined") {
						self.parent = obj;
						//_initPage.call(self);
						_initObject.call(self, "app", "page");
						return false;
					}
				});
			}

			function _initObject(type, next) {
				var self = this,ren;
				self[type] ? jQuery.each(self[type], function(i, obj) {
					ren = jQuery(obj).children();
					ren.each(function(i, obj) {
						var elem = jQuery(obj);
						if (typeof elem.attr("ng-" + next) != "undefined") {
							if (!self[next]) self[next] = {
								length: 0
							};
							self[next][(elem.attr("ng-" + next) != "" ? elem.attr("ng-" + next) : next + random())] = elem;
							self[next].length += 1;
							_initShow(elem);
						}
					});
					(next == "page" ? _initPage : next == "view" ? _initView : next == "control" ? _initControl : next == "item" ? _initItem : (function() {})).call(self);
				}) : (ren = jQuery(self.parent).children(), ren.each(function(i, obj) {
					var elem = jQuery(obj);
					if (typeof elem.attr("ng-" + next) != "undefined") {
						if (!self[next]) self[next] = {
							length: 0
						};
						self[next][(elem.attr("ng-" + next) != "" ? elem.attr("ng-" + next) : next + random())] = elem;
						self[next].length += 1;
						_initShow(elem);
					}
				}), (next == "page" ? _initPage : next == "view" ? _initView : next == "control" ? _initControl : next == "item" ? _initItem : (function() {})).call(self));
			}

			function _initShow(elem){
				var self = this,
					show = jQuery(elem).attr("ng-show");
				typeof show != "undefined" && jQuery(elem)[show == "show" ? "show" : "hide"]();
			}

			function _initPage() {
				var self = this;
				console.log("page")
				_initObject.call(self, "page", "view");
			}

			function _initView() {
				var self = this;
				console.log("view")
				_initObject.call(self, "view", "control");
			}

			function _initControl() {
				var self = this;
				console.log("control")
				_initObject.call(self, "control", "item");
			}

			function _initItem() {
				var self = this;
				console.log("item")
				self.item && jQuery.each(self.item, function(name, obj) {
					_initShow(obj);
					jQuery.each(["click", "change", "blur", "focus", "contextmenu", "formchange", "forminput", "input", "invalid", "reset", "select", "submit", "keyup", "keydown", "keypress", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mousewheel", "scroll"], function(i, eventname) {
						if (name != "length" && typeof obj.attr("ng-" + eventname) != "undefined") {
							var eventhandle = obj.attr("ng-" + eventname);
							self.handle[eventhandle] && obj.off(eventname).on(eventname, function(e) {
								/click/.test(eventname) && e.preventDefault();
								self.handle[eventhandle].call(this, e, self);
							});
						}
					});
				});
			}
			var modul = function(ops) {
				return new modul.fn.init(ops);
			};
			modul.fn = modul.prototype = {
				init: function(ops) {
					jQuery.extend(this, ops);
					_init.call(this);
					return this;
				},
				clone: function(type, name, clone) {
					return this[type] && this[type][name] && (this[type][name + (this[type].length += 1)] = this[type][name].clone(clone || false));
				}
			};
			modul.fn.init.prototype = modul.fn;

			
			console.log(modul({
				handle: {
					submit_click: function(e, target) {
						console.log("submit_click")
						var parent = jQuery(this).parents("form"),
							control = target.clone("control", jQuery(this).parents("form").attr("ng-control"), true);
						parent.parent().append(control);
					},
					usname_blur: function(e, target) {
						console.log("usname_blur")
					},
					usname_change: function(e, target){
						var val = jQuery(this).val();
						target.item["usname_show"].html(val);
					},
					uspassword_blur: function(e, target) {
						console.log("uspassword_blur")
					},
					uspassword_keyup:function(e, target){
						var val = jQuery(this).val();
						target.item["uspassword_show"].html(val);
					},
					showbbb: function(e, target){
						target.view["bbb"].show();
					},
					nextservice:function(e, target){
						target.page["service"].show();
						target.page["home"].hide();
					},
					closebbb: function(e, target){
						target.view["bbb"].hide();
					},
					gohome: function(e, target){
						target.page["home"].show();
						target.page["service"].hide();
					}
				}
			}));
		})()
