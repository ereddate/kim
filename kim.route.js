;
(function() {
	jQuery.kim.modelExtend({
		route: function() {
			var self = this;
			var args = arguments,
				len = args.length,
				elem = args[0];

			var finds = ["ng-app", "ng-page"];

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

			var location = window.location,
				id = location.hash.replace("#", "");
			if (id == "") {
				jQuery("[ng-app]").hide().attr("ng-show", "hide").eq(0).show().attr("ng-show", "show").find("[ng-page]").hide().attr("ng-show", "hide").eq(0).show().attr("ng-show", "show");
				_hashActiveInit(jQuery("[ng-app]").eq(0), id);
			} else {
				_find(0, id);
			}

			jQuery(window).off("hashchange").on("hashchange", function() {
				var id = location.hash.replace("#", "");
				_find(0, id);
			});

			function _hashActiveInit(obj, id) {
				var name = jQuery(elem).attr("ng-route");
				self.config.handle[name] && self.config.handle[name].call(self, obj, id, self);
			}

		}
	});
})()