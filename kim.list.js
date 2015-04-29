;
(function() {
	jQuery.kim.modelExtend({
		list: function() {
			var self = this;
			var args = arguments,
				len = args.length,
				elem = args[0];

			self.config.handle[args[1]] && self.config.handle[args[1]].call(self, function(data) {
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
				//self.build(elem);
				if (len == 4) args[2] && args[2] != "" && self.config.handle[args[2]] && self.config.handle[args[2]].call(self, elem, self);
			}, self);

			return this;
		}
	})
})()