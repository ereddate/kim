;
(function() {
	/* waterfall */
	var setting = {
			column_width: 204, //列宽
			column_className: 'waterfall_column', //列的类名
			column_space: 10, //列间距
			cell_selector: '.cell', //要排列的砖块的选择器，context为整个外部容器
			img_selector: 'img', //要加载的图片的选择器
			auto_imgHeight: true, //是否需要自动计算图片的高度
			fadein: true, //是否渐显载入
			fadein_speed: 600, //渐显速率，单位毫秒
			insert_type: 1, //单元格插入方式，1为插入最短那列，2为按序轮流插入
			getColumnItems: function(index) {}, //获取动态资源函数,必须返回一个砖块元素集合,传入参数为加载的次数
			onRefresh: function() {}, //重排后重置
			//getNavItems: function(type, eventFunc) {}, //获取导航内元素
			createColumn: function(data, column_num) {} //创建列中单元
		},
		waterfall = jQuery.waterfall = {}, //对外信息对象
		$container = null; //容器
	waterfall.load_index = 0, //加载次数
		jQuery.fn.extend({
			waterfall: function(opt) {
				opt = opt || {};
				setting = jQuery.extend(setting, opt);
				$container = waterfall.$container = $(this);
				/*setting.getNavItems && setting.getNavItems(setting.type, function(dom, callback) {
					public_render(dom, callback);
				}, function(nav) {
					if (nav) {
						var navs = jQuery(setting.nav).html(nav).find("a");
						navs.click(function(e) {
							e.preventDefault();
							var type = jQuery(this).attr("href");
							type = type.replace(siteHost.home + "/", "");
							navs.removeClass("active");
							jQuery(this).addClass("active");
							var channel = jQuery(this).attr("data-parentType");
							jQuery.cookie("channelpath", channel + "_" + type);
							//$container.empty();
							jQuery.waterfall.load_index = -1;
							loadData(type);
							setting.onRefresh();
						});
					}
				});*/
				if (jQuery(setting.cell_selector, $container).length == 0 && waterfall.$columns) { //判断容器中是否有ITEM
					loadData(setting.type || "1");
				} else {
					waterfall.$columns = creatColumn();
					render($(this).find(setting.cell_selector).detach(), false); //重排已存在元素时强制不渐显
				}
				waterfall._scrollTimer2 = null;
				$(window).bind('scroll', function() {
					clearTimeout(waterfall._scrollTimer2);
					waterfall._scrollTimer2 = setTimeout(function() {
						onScroll();
						//setting.onRefresh();
					}, 300);
				});
				waterfall._scrollTimer3 = null;
				$(window).bind('resize', function() {
					clearTimeout(waterfall._scrollTimer3);
					waterfall._scrollTimer3 = setTimeout(function() {
						onResize();
						setting.onRefresh();
					}, 300);
				});
			}
		});

	function loadData(type) {
		setting.type = type;
		getElements(type, function(dom, func) {
			waterfall.$container.empty();
			waterfall.$columns.remove();
			waterfall.$columns = creatColumn();
			render(dom, true, func);
			//if (setting.onRefresh) setting.onRefresh();
		});
	}

	function creatColumn() { //创建列
		waterfall.column_num = calculateColumns(); //列数
		var html = setting.createColumn(setting, waterfall.column_num);
		$container.prepend(html); //插入列
		return $("." + setting.column_className, $container); //列集合
	}

	function calculateColumns() { //计算需要的列数
		var num = Math.floor(($container.innerWidth()) / (setting.column_width + setting.column_space));
		if (num < 1) {
			num = 1;
		} //保证至少有一列
		return num;
	}

	function render(elements, fadein, callback) { //渲染元素
		if (!$(elements).length) return; //没有元素
		var $columns = waterfall.$columns;
		$(elements).each(function(i) {
			if (!setting.auto_imgHeight || setting.insert_type == 2) { //如果给出了图片高度，或者是按顺序插入，则不必等图片加载完就能计算列的高度了
				if (setting.insert_type == 1) {
					insert($(elements).eq(i), setting.fadein && fadein); //插入元素
				} else if (setting.insert_type == 2) {
					insert2($(elements).eq(i), i, setting.fadein && fadein); //插入元素	 
				}
				return true; //continue
			}
			if ($(this)[0].nodeName.toLowerCase() == 'img' || $(this).find(setting.img_selector).length > 0) { //本身是图片或含有图片
				var image = new Image;
				var src = $(this)[0].nodeName.toLowerCase() == 'img' ? $(this).attr('src') : $(this).find(setting.img_selector).attr('src');
				image.onload = function() { //图片加载后才能自动计算出尺寸
					image.onreadystatechange = null;
					if (setting.insert_type == 1) {
						insert($(elements).eq(i), setting.fadein && fadein); //插入元素
					} else if (setting.insert_type == 2) {
						insert2($(elements).eq(i), i, setting.fadein && fadein); //插入元素	 
					}
					image = null;
				}
				image.onreadystatechange = function() { //处理IE等浏览器的缓存问题：图片缓存后不会再触发onload事件
					if (image.readyState == "complete") {
						image.onload = null;
						if (setting.insert_type == 1) {
							insert($(elements).eq(i), setting.fadein && fadein); //插入元素
						} else if (setting.insert_type == 2) {
							insert2($(elements).eq(i), i, setting.fadein && fadein); //插入元素	 
						}
						image = null;
					}
				}
				image.src = src;
			} //不用考虑图片加载
			if (setting.insert_type == 1) {
				insert($(elements).eq(i), setting.fadein && fadein); //插入元素
			} else if (setting.insert_type == 2) {
				insert2($(elements).eq(i), i, setting.fadein && fadein); //插入元素	 
			}

		});
		if (callback) callback();
	}

	function public_render(elems, callback) { //ajax得到元素的渲染接口
		render(elems, true, callback);
	}

	function insert($element, fadein) { //把元素插入最短列
		if (fadein) { //渐显
			$element.css("opacity", 0).appendTo(waterfall.$columns.eq(calculateLowest())).animate({
				opacity: 1
			});
		} else { //不渐显
			$element.appendTo(waterfall.$columns.eq(calculateLowest()));
		}
		setting.itemInit($element);
	}

	function insert2($element, i, fadein) { //按序轮流插入元素
		if (fadein) { //渐显
			$element.css("opacity", 0).appendTo(waterfall.$columns.eq(i % waterfall.column_num)).animate({
				opacity: 1
			});
		} else { //不渐显
			$element.appendTo(waterfall.$columns.eq(i % waterfall.column_num));
		}
		setting.itemInit($element);
	}

	function calculateLowest() { //计算最短的那列的索引
		var min = waterfall.$columns.eq(0).outerHeight(),
			min_key = 0;
		waterfall.$columns.each(function(i) {
			if ($(this).outerHeight() < min) {
				min = $(this).outerHeight();
				min_key = i;
			}
		});
		return min_key;
	}

	function getElements(type, callback) { //获取资源
		jQuery.waterfall.load_index++;
		return setting.getColumnItems.call($container, jQuery.waterfall.load_index, type, callback);
	}
	waterfall._scrollTimer = null; //延迟滚动加载计时器
	function onScroll() { //滚动加载
		clearTimeout(waterfall._scrollTimer);
		waterfall._scrollTimer = setTimeout(function() {
			var $lowest_column = waterfall.$columns.eq(calculateLowest()); //最短列
			var bottom = $lowest_column.offset().top + $lowest_column.outerHeight(); //最短列底部距离浏览器窗口顶部的距离
			var scrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0; //滚动条距离
			var windowHeight = document.documentElement.clientHeight || document.body.clientHeight || 0; //窗口高度
			if (scrollTop >= bottom - windowHeight + 100) {
				getElements(setting.type, function(dom, func) {
					render(dom, true, func);
				});
			}
		}, 100);
	}

	function onResize() { //窗口缩放时重新排列
		if (calculateColumns() == waterfall.column_num) return; //列数未改变，不需要重排
		var $cells = waterfall.$container.find(setting.cell_selector);
		waterfall.$columns.remove();
		waterfall.$columns = creatColumn();
		render($cells, false); //重排已有元素时强制不渐显
		//jQuery.waterfall.load_index = -1;
		//loadData(setting.type);
	}

	jQuery.kim.modelExtend({
		waterfall: function() {
			var self = this;
			var args = arguments,
				len = args.length,
				elem = args[0];

			self.config.handle[args[1]] && self.config.handle[args[1]].call(self, {
				column_width: 230,
				column_space: 10,
				createColumn: function(data, column_num) {
					//循环创建列
					var html = [];
					for (var i = 0; i < column_num; i++) {
						html.push('<div class="' + data.column_className + '" style="width:' + data.column_width + 'px; display:inline-block; *display:inline;zoom:1; margin-left:' + data.column_space / 2 + 'px;margin-right:' + data.column_space / 2 + 'px; vertical-align:top; overflow:hidden"></div>');
					}
					return html.join('');
				},
				getColumnItems: function(index, render) {},
				onRefresh: function() {},
				itemInit: function(elem) {}
			}, function(ops) {
				var options = ops;

				//console.log(options)

				jQuery(elem).waterfall(options);

				var callbacks = jQuery.Callbacks();

				jQuery.each(args, function(i, arg) {
					if (i > 1 && i < len - 1) self.config.handle && callbacks.add(self.config.handle[arg]);
				});
				callbacks.fire(elem, self);

			}, self);

			return this;
		}
	});

})()