kim && kim.define && kim.define(function(require, exports, module) {
	jQuery.kim.modelExtend({
		form: function() {
			var self = this;
			var args = arguments,
				len = args.length,
				elem = args[0];

			var action = jQuery(elem).attr("action") || "",
				method = jQuery(elem).attr("method") || "post",
				submit = jQuery(elem).find('[type=submit]');

			function _valid(elem) {
				var result = true;
				jQuery(elem).find("[ng-valid]").each(function(i, obj) {
					jQuery(obj)[/select/.test(obj.tagName.toLowerCase()) ? "change" : "blur"]();
					var temp = jQuery(obj).data("result");
					if (temp == false) result = temp;
				});
				return result;
			}

			submit.length > 0 && jQuery(elem).off("submit").on("submit", function(e) {
				e.preventDefault();
				var res = _valid(this),
					name = jQuery(this).attr("ng-form");
				if (res) {
					jQuery(this).attr("action", self.config.form[name] && self.config.form[name][action] || action).off("submit").submit();
				}
			});
		}
	});
});