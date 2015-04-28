;
(function() {
	jQuery.kim.modelExtend({
		list: function(elem) {
			var self = this;
			self.config.handle[jQuery(elem).attr("ng-list")].call(self, function(data) {
				var tmpl = jQuery(elem).html(),
					html = [];
				jQuery(elem).data("tmpl", tmpl);
				jQuery.each(data, function(i, obj) {
					var temp = tmpl;
					temp = jQuery.kim.tmpl(obj, temp);
					html.push(temp);
				});
				var newitem = jQuery(html.join(''));
				jQuery(elem).html(newitem).show();
				self.build(elem);
			}, self);

			return this;
		}
	})
})()