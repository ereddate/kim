/*
	jq-app或自定义属性名：应用父标签
	jq-model属性名：操作对象
	to: 有指定结果对象的操作。
	参数：【0】结果对象名【1】事件名（自定义事件custom）【2】（可选）自定义事件function
	op：运算。
	参数：【0】表达式或方法function【1】exp是否显示表达式
	jq-result属性名：结果对象

	返回数据为json，并且在结果对象的html中包含{{json对应名称}}，做相关替换。
*/
(function($, win) {
	function findElems(elems, ops) {
		elems.each(function(i, elem) {
			var result = ops.verify(elem);
			if (result) {
				ops.end(elem);
				return false;
			}
		});
	}

	function setResult(result, to) {
		var evt = /input|select/.test(to.tagName.toLowerCase()) ? "val" : "html";
		if ($.isPlainObject(result) && typeof result != "undefined") {
			$.each(result, function(name, val) {
				var exp = new RegExp("\{\{" + name + "\}\}", "gi");
				$(to)[evt](($(to)[evt]()).replace(exp, val));
			});
		} else if (typeof result != "undefined") {
			$(to)[evt](result);
		}
	}

	function bind(type, from, to, evt, callback) {
		var self = this;
		switch (type) {
			case "to":
				if (evt == "custom") {
					var result = callback && typeof callback == "function" && callback.call(from, undefined, from, to, self) || typeof callback != "undefined" && $.isPlainObject(callback) && callback;
					setResult(result, to);
				} else {
					$(from).on(evt, function(e) {
						var result = callback && typeof callback == "function" && callback.call(from, e, from, to, self);
						if (!result) {
							switch (evt.toLowerCase()) {
								case "keyup":
								case "change":
									$(to)[/input|select/.test(to.tagName.toLowerCase()) ? "val" : "html"]($(from)[/input|select/.test(from.tagName.toLowerCase()) ? "val" : "html"]());
									break;
							};
						}else{
							setResult(result, to);
						}
					});
				}
				break;
		}
	}
	var kim = function(ops) {
		return new kim.fn.init(ops);
	};
	kim.fn = kim.prototype = {
		init: function(ops) {
			$.extend((this.config = {}), ops);
			var result = $(document).children().find("[" + this.config.base + "]" || "[jq-app]");
			var self = this;
			self.baseItems = {};
			result.length > 0 && (self.ngapp = result);
			if (self.ngapp) {
				self.ngapp.each(function(i, target) {
					var child = $(target).children(),
						model_elems = child.find('[jq-model]'),
						result_elems = child.find('[jq-result]');
					model_elems.each(function(i, selem) {
						var val = $(selem).attr('jq-model'),
							comm = val.split(' ');
						switch (comm[0]) {
							case "to":
								var options = comm[1] && comm[1].split(':') || [],
									len = options.length;
								findElems(result_elems, {
									verify: function(elem) {
										return len >= 2 && $(elem).attr('jq-result') == options[0];
									},
									end: function(elem) {
										if (len == 2) {
											bind.call(self, comm[0], selem, elem, options[1]);
										} else if (len == 3) {
											bind.call(self, comm[0], selem, elem, options[1], /\./.test(options[2]) ? new Function('a', 'return a["' + options[2].split('.').join('"]["') + '"];')(self.config) : self.config[options[2]]);
										}
									}
								});
								break;
							case "op":
								var options = comm[1] && comm[1].split(':') || [],
									len = options.length;
								var exp = options[0];
								var exps = exp.split(/\-|\+|\*|\/|\(|\)/gi);
								if (exps.length > 1) {
									$.each(exps, function(i, obj) {
										if (obj!=""){
											var names = obj.split('.');
											exp = exp.replace(obj, new Function('a', 'return a["' + names.join('"]["') + '"];')(self.config));
										}
									});
								} else if (typeof self.config[exps.join('')] == "function") {
									exp = self.config[exps.join('')]();
								}
								var fval = new Function("return " + exp + ";")();
								setResult((len == 2 && options[1] == "exp" ? exp + "=" + fval : fval), selem);
								break;
						}
					});
					//console.log(model_elems);
					//console.log(result_elems);
				});
			}
			return this;
		}
	};
	kim.fn.init.prototype = kim.fn;

	win.kim = kim;

})(jQuery, window);
