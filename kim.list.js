;
(function() {
	jQuery.kim.modelExtend({
		list: function() {
			var self = this;
			var args = arguments,
				len = args.length,
				elem = args[0];

			self.config.handle[args[1]] && self.config.handle[args[1]].call(self, function(data) {
				//var filter = jQuery(elem).attr("ng-filter"),
					//filterfunc = filter && new Function("item", "return " + filter + " && item;");
				var tmpl = jQuery(elem).html(),
					html = [];
				jQuery(elem).data("tmpl", tmpl).data("data", data);
				jQuery.each(data, function(i, obj) {
					//var result = filterfunc && filterfunc(obj);
					//if (!result) {
						var temp = tmpl;
						temp = jQuery.kim.tmpl(obj, temp);
						html.push(temp);
					//}
				});
				var newitem = jQuery(html.join(''));
				jQuery(elem).html(newitem).show();
				//self.build(elem);
				self.end(args);
				/*var callbacks = jQuery.Callbacks();

				jQuery.each(args, function(i, arg) {
					if (i > 1 && i < len - 1) self.config.handle && callbacks.add(self.config.handle[arg]);
				});
				callbacks.fire(elem, self);*/
			}, self);

			return this;
		}
	})
})()