kim && kim.define && kim.define(function(require, exports, module) {
	function _render(elem, tmplElem, type, command) {
		var data = elem.data("data"),
			tmpl = elem.data("tmpl"),
			html = [];
		jQuery.each(data, function(i, obj) {
			var temp = tmpl,
				tempData = {
					$index: i
				};
			command && (jQuery.each(obj, function(name, sub) {
					var reg = new RegExp(command + "\\." + name, "gi");
					reg.test(temp) && (tempData[command + "." + name] = kim.stringify(sub));
				}),
				temp = jQuery.kim.tmpl(tempData, temp),
				html.push(temp)) || (temp = jQuery.kim.tmpl(obj, temp),
				html.push(temp));
		});
		command && tmplElem.prop("outerHTML", html.join('')) || tmplElem.html(html.join(''));
	}
	jQuery.kim.modelExtend({
		tmpl: function() {
			var self = this;
			var args = arguments,
				len = args.length,
				elem = args[0];

			self.config.handle[args[1]] && self.config.handle[args[1]].call(self, function(data) {
				var tmplElem = jQuery(elem).find("[ng-repeat]"),
					tmpl = tmplElem.length > 0 && tmplElem.prop("outerHTML") || (tmplElem = elem, tmplElem[/select|input/.test(tmplElem[0].tagName.toLowerCase()) ? "val" : "html"]());
				jQuery(elem).data("tmpl", tmpl).data("data", data).data("tmplElem", tmplElem);
				var name = jQuery.kim.getTmplCustomName(tmplElem);
				if (name) _render(elem, tmplElem, "a", name);
				else _render(elem, tmplElem, "b");

				self.end(args);
			}, self);

			return this;
		}
	})
});