;
(function() {
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
	jQuery.kim.getTmplCustomName = function(elem) {
		var tmplElem = elem.data("tmplElem");
		tmplElem.length == 0 && (tmplElem = elem);
		var command = tmplElem.attr("ng-repeat"),
			regIn = new RegExp("\\s*in\\s*", "gi");
		command = typeof command == "string" && regIn.test(command) && command.split(' ') || [];
		return command.length > 0 ? command[0] : false;
	};
	jQuery.kim.tmplFixData = function(elem, tmpl, data, n) {
		var name = jQuery.kim.getTmplCustomName(elem);
		if (name) {
			var tempData = {
				$index: n || 0
			};
			jQuery.each(data, function(i, sub) {
				var reg = new RegExp(name + "\\." + i, "gi");
				reg.test(tmpl) && (tempData[name + "." + i] = kim.stringify(sub));
			});
			return tempData;
		} else {
			return data;
		}
	};
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
				var command = tmplElem.attr("ng-repeat"),
					regIn = new RegExp("\\s*in\\s*", "gi");
				command = typeof command == "string" && regIn.test(command) && command.split(' ') || [];
				if (command.length > 0) _render(elem, tmplElem, "a", command[0]);
				else _render(elem, tmplElem, "b");

				self.end(args);
			}, self);

			return this;
		}
	})
})()