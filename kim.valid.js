;
(function() {
	function _findClassElem(elem, name) {
		return jQuery(elem).parents(".ng-app").find(".ng-page-" + name).length > 0 && jQuery(elem).parents(".ng-app").find(".ng-page-" + name) || jQuery(elem).parents(".ng-app").find(".ng-view-" + name).length > 0 && jQuery(elem).parents(".ng-app").find(".ng-view-" + name) || jQuery(elem).parents(".ng-app").find(".ng-control-" + name).length > 0 && jQuery(elem).parents(".ng-app").find(".ng-control-" + name).length || jQuery(elem).parents(".ng-app").find(".ng-item-" + name).length > 0 && jQuery(elem).parents(".ng-app").find(".ng-item-" + name);
	}

	function func(elem, tip, deftip, callback) {
		var self = this,
			obj;
		typeof tip == "undefined" && (tip = deftip);
		callback && callback in self.config.handle && self.config.handle[callback].call(elem, false, tip, this) || callback && (obj = _findClassElem(elem, callback), obj && obj.each(function(i, a) {
			if (/input|select|textarea/.test(a.tagName.toLowerCase())) jQuery(a).show().val(tip);
			else jQuery(a).show().html(tip);
		}));
	}

	function done(elem, callback) {
		var self = this,
			obj;
		callback && callback in self.config.handle && self.config.handle[callback].call(elem, true, "", this) || callback && (obj = _findClassElem(elem, callback), obj && obj.each(function(i, a) {
			jQuery(a).hide();
		}));
	}

	jQuery.kim.validType = {
		addressmin5: function(elem, val, tip, callback) {
			if (val.length < 5) {
				func.call(this, elem, tip, "地址至少要输入5个字", callback);
				return false;
			}
			return true;
		},
		addressmax64: function(elem, val, tip, callback) {
			if (val.length > 64) {
				func.call(this, elem, tip, "您输入的地址过长", callback);
				return false;
			}
			return true;
		},
		isname: function(elem, val, tip, callback) {
			var len = val.length;
			if (/[^\u4e00-\u9fa5]/.test(val) || len < 2 || len > 5) {
				func.call(this, elem, tip, "姓名长度2-5个汉字", callback);
				return false;
			}
			return true;
		},
		oldtime: function(elem, val, tip, callback) {
			if (Date.parse(new Date(val.replace(/-/gi, "/"))) < Date.parse(new Date())) {
				func.call(this, elem, tip, "装机时间不能小于当前时间", callback);
				return false;
			}
			return true;
		},
		required: function(elem, val, tip, callback) {
			if (val == "") {
				func.call(this, elem, tip, "输入内容不能为空", callback);
				return false;
			}
			return true;
		},
		nocode: function(elem, val, tip, callback) {
			var reg = /^[^\',`~:;!@#$%^&*<>+=\\\][\]\{\}]*$/;
			if (!reg.test(val)) {
				func.call(this, elem, tip, "输入内容包含非法字符", callback);
				return false;
			}
			return true;
		},
		ismobile: function(elem, val, tip, callback) {
			var length = ($.trim(val)).length;
			var tel = /^1[3|4|5|8|7][0-9]\d{8}$/;
			if (!tel.test(val) || length != 11) {
				func.call(this, elem, tip, "请输入正确的手机号码", callback);
				return false;
			}
			return true;
		},
		isphone: function(elem, val, tip, callback) {
			var tel = /^(\d{3,4}-?)?\d{7,9}$/g;
			if (!tel.test(val)) {
				func.call(this, elem, tip, "请输入正确的座机号码", callback);
				return false;
			}
			return true;
		},
		zipcode: function(elem, val, tip, callback) {
			var tel = /^[0-9]{6}$/;
			if (!tel.test(val)) {
				func.call(this, elem, tip, "请输入正确的邮政编码", callback);
				return false;
			}
			return true;
		},
		isemail: function(elem, val, tip, callback) {
			if (!/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(val)) {
				func.call(this, elem, tip, "请输入正确的邮箱地址", callback);
				return false;
			}
			return true;
		},
		ispassword: function(elem, val, tip, callback) {
			if (val.length < 8 || val.length > 16) {
				func.call(this, elem, tip, "密码长度8~16位，数字、字母、字符至少包含两种", callback);
				return false;
			} else if (/[^\x00-\x7f]/.test(val)) {
				func.call(this, elem, tip, "密码长度8~16位，数字、字母、字符至少包含两种", callback);
				return false;
			} else if (/^\d+$/.test(val)) {
				func.call(this, elem, tip, "密码长度8~16位，数字、字母、字符至少包含两种", callback);
				return false;
			} else if (/^[A-Za-z]+$/.test(val)) {
				func.call(this, elem, tip, "密码长度8~16位，数字、字母、字符至少包含两种", callback);
				return false;
			} else if (/^[^A-Za-z0-9]+$/.test(val)) {
				func.call(this, elem, tip, "密码长度8~16位，数字、字母、字符至少包含两种", callback);
				return false;
			}
			return true;
		}
	};

	jQuery.kim.modelExtend({
		valid: function(elem) {
			var self = this,
				command, regex, regval, args;
			if (jQuery(elem).attr("ng-valid")) {
				command = jQuery(elem).attr("ng-valid");
				args = command.split(',');
				jQuery(elem).on(/select/.test((elem.length && elem[0] || elem).tagName.toLowerCase()) ? "change" : "blur", function() {
					var val = jQuery(elem).val();
					jQuery.each(args, function(i, ops) {
						ops = ops.split(':');
						var type = ops[0],
							tip = ops[1],
							callback = ops[2];
						if (typeof val == "undefined") {
							func.call(self, elem, tip, "输入内容不能为空", callback);
							return false;
						}
						if (jQuery.kim.validType && (type in jQuery.kim.validType)) {
							var bool = jQuery.kim.validType[type].call(self, elem, val, tip, callback);
							if (bool) {
								done.call(self, elem, callback);
							}
						}
					});
				});
			}

			return this;
		}
	});
})()