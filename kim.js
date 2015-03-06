/*
	jq-app或自定义属性名：应用父标签
	model属性名：操作对象
	to属性名：结果对象
	注：参数为this时，结果对象为当前标签。

	to: 有指定结果对象的操作。
		to name:[event=function]
	参数：【0】name结果对象名【1】event事件名（自定义事件custom）【2】（可选）function自定义事件
	op：运算。
		op name:[exp,exp,len]
	参数：【0】name结果对象名【1】exp表达式或方法function【2】exp是否显示表达式|结果保存小数点位数（默认2位）【3】（可选）结果保存小数点位数，默认2位。
	ft：格式。
		ft name:[type]
	参数：【0】结果对象名【1】格式类型money\number\card\phone\dateTime

	返回数据为json，并且在结果对象的html中包含{{json对应名称}}，做相关替换。
*/
(function($, win) {
	function findElems(elems, from, ops) {
		if (ops.verify == "this") {
			ops.end(from);
			return;
		}
		var elem = elems.find("[to='" + ops.verify + "']");
		elem && ops.end(elem[0]);
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
					$(from).off(evt).on(evt, function(e) {
						var result = callback && typeof callback == "function" && callback.call(from, e, from, to, self);
						if (!result) {
							switch (evt.toLowerCase()) {
								case "keyup":
								case "change":
									$(to)[/input|select/.test(to.tagName.toLowerCase()) ? "val" : "html"]($(from)[/input|select/.test(from.tagName.toLowerCase()) ? "val" : "html"]());
									break;
							};
						} else {
							setResult(result, to);
						}
					});
				}
				break;
		}
	}

	function dateTimeF(d, pattern) {
		//dateTimeF(d," yyyy年M月d日\n yyyy-MM-dd\n MM-dd-yy\n yyyy-MM-dd hh:mm:ss")
		pattern = pattern || 'yyyy-MM-dd';
		var y = d.getFullYear().toString(),
			o = {
				M: d.getMonth() + 1, //month
				d: d.getDate(), //day
				h: d.getHours(), //hour
				m: d.getMinutes(), //minute
				s: d.getSeconds() //second
			};
		pattern = pattern.replace(/(y+)/ig, function(a, b) {
			return y.substr(4 - Math.min(4, b.length));
		});
		for (var i in o) {
			pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function(a, b) {
				return (o[i] < 10 && b.length > 1) ? '0' + o[i] : o[i];
			});
		}
		return pattern;
	}

	function init(item) {
		var self = this;
		var name = "[" + this.config.base + "]" || "[kim-app]";
		var result = item || $(document).children().find(name);
		if (result) {
			result.each(function(i, target) {
				!self.views && (self.views = {});
				self.views[jQuery(target).attr(name.replace(/\[|\]/gi, ""))] = target;
				$(target).find('[kim-control]').each(function(i, control){
					!self.controls && (self.controls = {});
					self.controls[$(control).attr("kim-control")] = $(control).clone();
				});
				var child = self.children = $(target).children(),
					model_elems = child.find('[model]');
				model_elems.each(function(i, selem) {
					build.call(self, selem);
				});
			});
		}
	}

	function build(selem) {
		var self = this;
		var val = $(selem).attr('model'),
			comm = val.split(' ');
		var options = comm[1] && comm[1].split(':') || [],
			len = options.length,
			args = false;
		len > 0 && (args = (/\[(.+)\]/.exec(options[1])));
		if (args) {
			switch (comm[0]) {
				case "to":
					args = args[1].split('=');
					findElems(self.children, selem, {
						verify: options[0],
						end: function(elem) {
							if (args.length == 1) {
								bind.call(self, comm[0], selem, elem, args[0]);
							} else if (args.length == 2) {
								var evalV;
								var obj = /\./.test(args[1]) ? (evalV = new Function('a', 'return a["' + args[1].split('.').join('"]["') + '"];')(self.config)) : self.config[args[1]];
								bind.call(self, comm[0], selem, elem, args[0], obj);
							}
						}
					});
					break;
				case "op":
					args = args[1].split(',');
					var exp = args[0];
					var exps = exp.split(/\-|\+|\*|\/|\(|\)/gi);
					if (exps.length > 1) {
						$.each(exps, function(i, obj) {
							if (obj != "") {
								var names = obj.split('.'),
									evalV = new Function('a', 'return a["' + names.join('"]["') + '"];')(self.config);
								exp = exp.replace(obj, typeof evalV == "function" ? evalV() : evalV);
							}
						});
					} else if (/\./.test(exps.join(''))) {
						var names = exps.join('').split('.'),
							evalV = new Function('a', 'return a["' + names.join('"]["') + '"];')(self.config);
						exp = typeof evalV == "function" ? evalV() : self.config[evalV]();
					}
					var fval = new Function("return " + exp + ";")();
					setResult((len >= 2 && args[1] == "exp" ? exp + "=" + fval.toFixed(args[2] ? args[2] : 2) : fval.toFixed(args[1] ? args[1] : 2)), selem);
					break;
				case "ft":
					findElems(self.children, selem, {
						verify: options[0],
						end: function(elem) {
							args = args[1];
							switch (args) {
								case "money":
								case "number":
								case "phone":
									var rp = /\{\{([0-9]*)*\}\}/.exec($(elem).html()),
										rpa, temp, n;
									rp && $.each(rp, function(i, arr) {
										if (i > 0) {
											rpa = arr,
												rpa = rpa.split('');
											for (n = rpa.length; n > 0; n--) {
												n % (/(phone)/.test(args) ? 4 : 3) == 0 && rpa.splice(n - 1, 0, (/(phone)/.test(args) ? " " : ","));
											}
											setResult(($(elem).html()).replace("{{" + arr + "}}", rpa.join('')), elem);
										}
									});
									break;
								case "card":
									var rp = /\{\{([0-9]*)*\}\}/.exec($(elem).html());
									rp && $.each(rp, function(i, arr) {
										if (i > 0) {
											setResult(($(elem).html()).replace("{{" + arr + "}}", arr.replace(/(\d{4})(?=\d)/gi, "$1 ")), elem);
										}
									});
									break;
								case "datetime":
									var rp = /\{\{(.+)\}\}/.exec($(elem).html()),
										temp;
									rp && $.each(rp, function(i, arr) {
										if (i > 0) {
											temp = dateTimeF(arr);
											setResult(temp, elem);
										}
									});
									break;
							}
						}
					});
					break;
			}
		}
	}
	var kim = function(ops) {
		return new kim.fn.init(ops);
	};
	kim.fn = kim.prototype = {
		init: function(ops) {
			$.extend((this.config = {}), ops);
			init.call(this);
			return this;
		},
		refresh: function() {
			init.call(this);
			return this;
		},
		buildItem: function(elem) {
			init.call(this, elem);
		}
	};
	kim.fn.init.prototype = kim.fn;

	win.kim = kim;

})(jQuery, window);
