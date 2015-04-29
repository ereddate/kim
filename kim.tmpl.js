;
(function() {
	jQuery.kim.modelExtend({
		tmpl: function() {
			var self = this;
			var args = arguments,
				len = args.length,
				elem = args[0];

			self.config.handle[args[1]] && self.config.handle[args[1]].call(self, function(data) {
				var tmpl = jQuery(elem).html();
				jQuery(elem).data("tmpl", tmpl);
				tmpl = jQuery.kim.tmpl(data, tmpl);
				var newitema = jQuery(tmpl);
				jQuery(elem).html(newitema).show();
				//self.build(elem);
				if (len == 4) args[2] && args[2] != "" && self.config.handle[args[2]] && self.config.handle[args[2]].call(self, elem, self);
			}, self);

			return this;
		}
	});
})()