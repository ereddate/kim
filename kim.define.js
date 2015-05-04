;
(function() {

	function isArray(v) {
		return typeof v != "undefined" && v.constructor == Array ? true : false;
	};

	var model = function() {
		return new model.fn.init();
	};

	model.fn = model.prototype = {
		init: function() {
			this.cache = {};
			return this;
		},
		use: function(name, callback) {
			var result;
			if (isArray(name)) {
				result = {};
				jQuery.each(name, function(i, str) {
					result[str] = _require(str);
				});
			} else {
				result = _require(name);
			}
			callback && callback(result);
		}
	};

	model.fn.init.prototype = model.fn;

	jQuery.kim.require = model();

	function _analyRequire(func) {
		var funContext = func.toString(),
			fixContext = jQuery.trim(funContext.replace(/(\r|\n)/gi, ""));
		var require = []
		fixContext.replace(/\s*require\s*\(\s*[\"|\'](.+?)[\"|\']\s*\)\s*/gi, function(a, b) {
			require.push(b);
		});
		return {
			dependencies: require
		};
	}

	function _require(name) {
		var require = jQuery.kim.require;
		var result = name && require.cache[name] && require.cache[name].exports && (typeof require.cache[name].exports == "function" && require.cache[name].exports || require.cache[name].exports);
		return result;
	}

	var define = function() {
		var args = arguments,
			len = args.length,
			name, dependencies, callback;
		if (len == 1) {
			callback = args[0];
		} else if (len == 2) {
			name = args[0], callback = args[1];
		} else if (len == 3) {
			name = args[0], dependencies = args[1], callback = args[2];
		}
		var options = {
			name: (!name && ("model_" + Math.random()) || name),
			dependencies: dependencies,
			callback: callback,
			exports: {},
			status: 0
		};
		//console.log("name: "+options.name)
		var ops = _analyRequire(callback);
		jQuery.extend(options, ops);
		var _exprots = {},
			module = {
				exports: {}
			};
		var result = callback(_require, _exprots, module);
		var than = result || _exprots || "exprots" in module && module.exports;
		options.exports = than;
		jQuery.kim.require.cache[options.name] = options;
		//console.log(require.cache)
	};

	window.define = define;

})()

/*define("d", function(require, exports, module) {
	window.a = 1;
});

define("c", function(require, exports, module) {
	exports.a = function() {
		return 2;
	};
});

define("b", ["d"], function(require, exports, module) {
	return function() {
		return window.a;
	};
});

define("a", function(require, exports, module) {
	var b = require("c");
	var a = require("b");
	exports.a = a() + b.a();
});

define(function(require, exports, module) {
	var a = require("a").a;
	console.log("define console: " + a)
});*/