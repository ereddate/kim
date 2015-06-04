;
(function() {
	jQuery.kim.modelExtend({
		list: function() {
			var self = this;
			var args = arguments,
				len = args.length,
				elem = args[0];

			function _render(tmplElem, command) {
				var data = tmplElem.data("data"),
					tmpl = tmplElem.data("tmpl"),
					html = [];
				jQuery.each(data, function(i, obj) {
					var temp = tmpl,
						tempData = {};
					command && (jQuery.each(obj, function(name, sub) {
							var reg = new RegExp("\\{\\{" + command + "." + name + "\\s*", "gi");
							reg.test(temp) && (tempData[command + "." + name] = sub);
						}),
						temp = jQuery.kim.tmpl(tempData, temp),
						html.push(temp)) || (temp = jQuery.kim.tmpl(obj, temp),
						html.push(temp));
				});
				command && tmplElem.prop("outerHTML", html.join('')) || tmplElem.html(html.join(''));
			}

			self.config.handle[args[1]] && self.config.handle[args[1]].call(self, function(data) {
				var tmplElem = jQuery(elem).find("[ng-repeat]"),
					tmpl = tmplElem.length > 0 && tmplElem.prop("outerHTML") || (tmplElem = elem, tmplElem.html());
				jQuery(tmplElem).data("tmpl", tmpl).data("data", data);
				var command = tmplElem.attr("ng-repeat"),
					regIn = new RegExp("\\s*in\\s*","gi");
				command = typeof command == "string" && regIn.test(command) && command.split(' ') || [];

				command.length > 0 && _render(tmplElem, command[0]) || _render(tmplElem);

				self.end(args);
			}, self);

			return this;
		}
	})
})()