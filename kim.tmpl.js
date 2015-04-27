;
(function() {
	jQuery.kim.modelExtend({
		tmpl: function(elem) {
			var self = this;
			self.config.handle[jQuery(elem).attr("ng-tmpl")].call(self, function(data) {
				var tmpl = jQuery(elem).html();
				jQuery(elem).data("tmpl", tmpl);
				tmpl = jQuery.kim.tmpl(data, tmpl);
				var newitema = jQuery(tmpl);
				jQuery(elem).html(newitema).show();
				self.add(elem);
			}, self);

			return this;
		}
	});
})()
