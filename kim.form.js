kim && kim.define && kim.define(function(require, exports, module) {
	jQuery.kim.modelExtend({
		form: function() {
			var self = this;
			var args = arguments,
				len = args.length,
				elem = args[0];

			var action = jQuery(elem).attr("action") || "",
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
				var form = jQuery(this),
					res = _valid(this),
					name = form.attr("ng-form"),
					type = form.attr("ng-type"),
					data = form.attr("ng-data"),
					callback = self.config.handle[form.attr("ng-form-success")] || window[form.attr("ng-form-success")],
					error = self.config.handle[form.attr("ng-form-error")] || window[form.attr("ng-form-error")],
					method = form.attr("method") || "post";
				if (res) {
					form.attr("action", self.config.form[name] && self.config.form[name][action] || action);
					if (type.toLowerCase() != "ajax") {
						form.off("submit").submit();
					} else {
						jQuery[method](form.attr("action") + "?" + form.serialize(), function(data) {
							callback.call(form, data);
						}, data).error(function(err) {
							error.call(form, err);
						});
					}
				}
			});
		}
	});
});