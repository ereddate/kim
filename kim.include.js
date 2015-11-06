kim && kim.define && kim.define(function(require, exports, module) {
	jQuery.kim.modelExtend({
		include: function() {
			var self = this;
			var args = arguments,
				len = args.length,
				parent = args[0];
			var commands = args[1].split(/\s*\|\s*/),
				url = commands[0],
				command = commands[1].split(/\s*\:\s*/);
			var data = window[command[1]] || this.config && this.config.handle[command[1]]();

			this.buildFile(url, data, function(elem, html) {
				parent.html(html);
			}, function() {

			});
		}
	});
});
