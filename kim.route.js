kim && kim.define && kim.define(function(require, exports, module) {
	jQuery.kim.modelExtend({
		route: function() {
			var self = this;
			var args = arguments,
				len = args.length,
				elem = args[0];

			var finds = ["ng-app", "ng-page"];

			var location = window.location;
			//history = window.history;

			function _getHash(url) {
				var match = (url || location.href).match(/(.*)#(.*)$/);
				//console.log(match)
				return match ? match[2] : '';
			}

			function _find(n, id) {
				var active = jQuery("[" + finds[n] + "=" + id + "]");
				if (active.length > 0) {
					jQuery("[" + finds[n] + "]").hide().attr("ng-show", "hide");
					active.show().attr("ng-show", "show");
					if (n > 0) {
						jQuery("body").find(".ng-app").hide().attr("ng-show", "hide");
						active.parents(".ng-app").show().attr("ng-show", "show");
					} else {
						active.find("[" + finds[n + 1] + "]").hide().attr("ng-show", "hide").eq(0).show().attr("ng-show", "show");
					}
					_hashActiveInit(active, id);
				} else {
					n += 1;
					if (n >= finds.length) return;
					_find(n, id);
				}
			}

			var id = _getHash();
			if (id == "") {
				jQuery("[ng-app]").hide().attr("ng-show", "hide").eq(0).show().attr("ng-show", "show").find("[ng-page]").hide().attr("ng-show", "hide").eq(0).show().attr("ng-show", "show");
				_hashActiveInit(jQuery("[ng-app]").eq(0), id);
			} else if (!/^\//.test(id)) {
				_find(0, id);
			}

			var root = self.config.route.root || "./";

			jQuery.each(self.config.route.config, function(name, obj) {
				kim.query(obj.control).find("a").on("click", function(e) {
					var reg = new RegExp(name.replace(/\:/, "#"), "gi"),
						href = jQuery(this).attr("href"),
						url,
						isReg = reg.test((!/^#.*/.test(href) && href.replace(/(#)(.*)/gi, "$1id") || href));
					if (/#.*/.test(href) && isReg) {
						e.preventDefault();
						var hash = _getHash(href);
						if (!/^\//.test(hash)) {
							url = root + obj.guide + "#" + hash;
							location.href = url;
							return;
						} else if (isReg && !/^\//.test(obj.guide)) {
							_hashActiveInit(obj.guide, this);
							return;
						} else {
							location.href = href;
							return;
						}
					} else if (isReg) {
						e.preventDefault();
						location.href = root + obj.guide;
					}
				});
			});

			jQuery(window).off("hashchange").on("hashchange", function() {
				var id = _getHash();
				!/^\//.test(id) && _find(0, id);
			});

			function _hashActiveInit(obj, id) {
				var name = typeof obj == "string" && obj || jQuery(elem).attr("ng-route");
				self.config.route.handle[name] && self.config.route.handle[name].call(self, obj, id, self);
			}

		}
	});
});