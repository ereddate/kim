kim && kim.define && kim.define(function(require, exports, module) {
	jQuery.kim.modelExtend({
		src: function() {
			var self = this;
			var args = arguments,
				len = args.length,
				elem = args[0];
			if (typeof args[1] != "undefined") {
				var img = jQuery("<img></img>");
				img.attr("src", args[1]).on("load", function() {
					jQuery(elem).attr("src", args[1]);
					img.remove();
				}).on("error", function() {});
			}
			return this;
		}
	});
});