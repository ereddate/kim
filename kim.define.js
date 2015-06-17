;
(function() {

	function isArray(v) {
		return typeof v != "undefined" && v.constructor == Array ? true : false;
	};

	function isEmpty(v) {
		var a = function(e) {
			var t;
			for (t in e) return !1;
			return !0
		};
		return typeof v == "undefined" || v == null || typeof v == "string" && jQuery.trim(v) == "" || isArray(v) && v.length == 0 || typeof v == "object" && a(v) ? true : false;
	}

	var model = function() {
		return new model.fn.init();
	};

	model.fn = model.prototype = {
		init: function() {
			kim.data.requireCache = {};
			return this;
		},
		use: function(name, callback) {
			var result;
			if (isArray(name) || typeof name == "string" && name.split(' ').length > 1) {
				result = {};
				if (typeof name == "string") name = name.split(' ');
				jQuery.each(name, function(i, str) {
					result[str] = _require(str);
				});
			} else {
				result = _require(name);
			}
			callback && callback(result);
			return this;
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
		var require = jQuery.kim.require,
			options = kim.data.requireCache[name] || false,
			result;
		if (name && options) {
			if (options.status == 3) {
				result = typeof options.exports == "function" && options.exports || options.exports;
			} else if (options.status < 3 && options.status > 0) {
				result = _exec(options);
			}
		}
		return result;
	}

	function _exec(options) {
		var _exprots = {},
			module = {
				exports: {}
			},
			than, result;
		if (options.status == 2) {
			jQuery.each(options.dependencies, function(i, name) {
				_require(name);
			});
		}
		try {
			result = options.factory(_require, _exprots, module),
				than = result || _exprots || "exprots" in module && module.exports,
				options.exports = than,
				options.status = STATUS.executed;
		} catch (e) {
			options.exports = {},
				options.status = STATUS.error;
		}
		return result;
	}

	var STATUS = {
		loaded: 1,
		readed: 2,
		executed: 3,
		error: 4
	};

	function _analyDefine(name, dependencies, factory) {
		var options = {
			name: (!name && ("model_" + Math.random()) || name),
			dependencies: dependencies,
			factory: factory,
			exports: {},
			status: isArray(dependencies) || typeof dependencies != "undefined" ? STATUS.readed : STATUS.loaded
		};
		var ops = _analyRequire(factory);
		jQuery.extend(options, ops);

		jQuery.kim.data.requireCache[options.name] = options;

		_exec(options);
	}

	kim.define = function() {
		var args = arguments,
			len = args.length,
			name, dependencies, factory;
		if (len == 1) {
			factory = args[0];
		} else if (len == 2) {
			name = args[0], factory = args[1];
		} else if (len == 3) {
			name = args[0], dependencies = args[1], factory = args[2];
		}

		_analyDefine((!name && ("model_" + Math.random()) || name), dependencies, factory);
		return this;
	};

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