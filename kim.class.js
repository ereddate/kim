;
(function() {
	jQuery.fn.selected = function(bool) {
		var bools = this.data("selected");
		bools && this.removeClass(bools[bool]).addClass(bools[bool]);
		return this;
	};
	jQuery.kim.modelExtend({
		class: function() {
			var self = this;
			var args = arguments,
				len = args.length,
				elem = args[0];
			if (typeof args[1] != "undefined") {
				var reg = new RegExp("(\\{.+\\})", "gi");
				var command = reg.exec(args[1]);
				if (command) {
					jQuery(elem).data("selected", (new Function("return " + command[1]))());
				}
			}
			return this;
		}
	});
})()