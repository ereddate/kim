# kim

依托jQuery的依赖注入型的前端模板开发框架，适用于中小型移动端网站开发。核心：语义化标签、依赖注入、数据绑定等等。
	
#引入及使用
	<div ng-app="test" ng-show="show" ng-route="routefunc">
		<div ng-page="home" ng-show="show">
			<div ng-view="headera" ng-class="{true:'on', false:'off'}">
				<img ng-item="img" ng-src="http://www.aaa.com/logo.jpg" src="http://www.aaa.com/blank.jpg" />
				<div ng-control="nava" ng-list="getData(callback_name)" ng-swipe="swipetest">
					<div ng-item="list_tmpl_{{id}}">
						<p>{{decoration | filter : 'a'}}</p>
						<a href="#" ng-item="testclick" ng-click="test_click" data-id="{{id}}" ng-tap="taptest">删除</a>
					</div>
				</div>
				<div ng-control="bbba" ng-tmpl="getData">
					<p data-id="{{id | test : 1}}">{{decoration}}</p>
				</div>
				<div ng-control="cccb">
					<select ng-item="select" name="select" ng-list="getselect_get" ng-change="select_change" ng-valid="required:不能为空:selecterror"><option value="{{value}}">{{title}}</option></select>
					<span ng-item="selectval"></span>
					<span ng-item="selecterror"></span>
				</div>
			</div>
			<div ng-view="waterfall">
				<div ng-control="waterfall" ng-list="getData" ng-waterfall="waterfall_callback">
					<div ng-item="waterfall_item" class="cell">{{code}}</div>
				</div>
			</div>
		</div>
	</div>
	<script src="kim.js"></script>
	<script>
		//define定义模块
		define("init", function(require, exports, module){
			return function(){
				//扩展KIM.MODEL自定义语义
				jQuery.kim.modelExtend({
					test: function(elem){
						var self = this;
						jQuery(elem).html("test");
						return this;
					}
				});
				
				jQuery.kim.filterExtend({
					test: function(data, name, filterCondition){
						var val = data[name];
						//过滤代码
						...
						return val;
					}
				})
			}
		});
		
		//使用KIM
		define(function(require, exports, module){
			var init = require("init");
			init();

			//可以这样写jQuery.kim({...}) 或者 jQuery(".main").kim({...}) 或者 kim({...})
			//jQuery.kim.require写法可以是 jQuery.kim.require.use(["a", "b"], function(){...})
			//或者 jQuery.kim.require.use("a", function(){...})
			//或者 jQuery.kim.require.use("a b", function(){...})
			jQuery.kim.require.use(["a", "b"], function(result){
				var a = result["a"],
					b = result["b"];
				jQuery.kim({
					initialization: function(){
						//初始页面
						this.app["test"].item["gohomea"].click().selected(true);
					},
					handle:{
						waterfall_callback: function(options, callback){
							jQuery.extend(options, {
								column_width: 230,
								column_space: 10,
								getColumnItems: function(index, type, render) {
									//获取列子元素
									//type暂未用到
									//index是添加数据次数，也就是翻了几页。这里可以对页数做一些控制...
									if (index>=4) return;
									... //获取数据，返回data
									var tmpl = jQuery(this).data("tmpl"),
										html = [];
									jQuery.each(data, function(i, obj){
										html.push(kim.tmpl(obj, tmpl));
									});
									//render参数为拼装后的DOM集
									render(jQuery(html.join('')), function(elem){
										self.build(elem);
									});
								},
								onRefresh: function() {

								},
								itemInit: function(elem) {

								}
							});
							callback(options);
						},
						swipetest: function(direction, offset, e, target){
							if (direction == "left"){
								left...
							}else{
								right...
							}
						},
						taptest: function(offset, e, target){
							console.log("tap")
						},
						test_click: function(e, target){
							//事件
							//页面元素的内部调用及操作
							target.app["test"].item["test_result"].html(jQuery(this).val());
						},
						getData: function(render, target){
							//数据注入模板
							var data = [
								{
									decoration: "aaa",
									id:1
								},
								{
									decoration: "bbb",
									id:2
								}
							]
							render(data);
						},
						callback_name: function(elem, target){
							//数据注入后回调
						},
						...
					}
				});
			});
		});		
	</script>

# 结构
结构由以下内容组成：

ng-app 应用（支持多应用)

ng-page 页

ng-view 层

ng-control 控件

ng-item 元素

	属性：ng-[click|blur|change|...]="function name" 事件对应的程序名

	属性增加 ng-swipe 和 ng-tap 事件支持

#公共属性

ng-[app|page|view|control|item]="name" 对象名称

ng-show="show|hide" 是否显示

ng-class="{状态1:'className', 状态2:'className'}" 按状态控制className，jQuery(selector).selected(状态);

ng-src="真实的图片地址" 图片容错加载

ng-插件名

	valid 表单测证 ng-valid="验证类型:错误提示:提示元素或回调"
	
	list 数据列表 ng-list="导入数据的方法名([导入后的回调])"

		//ng-filter="过滤表达式" 私有过滤属性 2015-5-11 删除
	
	tmpl 数据模板 ng-tmpl="导入数据的方法名([导入后的回调])"

		//ng-filter="过滤表达式" 私有过滤属性 2015-5-11 删除

	waterfall 瀑布流

	route 路由，目前只导航ng-app ng-page，会与ng-show ng-click产生冲突，尽量不要一起使用

#模板数据过滤，命令：

filter: 过滤字符串 data | filter : "a" 或 {name: "1"}
	
json：json转换为字符串 data | json
	
limitTo：限制数组长度或字符串长度 data | limitTo : 2
	
lowercase：全部转换为小写 data | lowercase
	
uppercase：全部转换为大写 data | uppercase
	
orderBy：排序，reverse倒序sort正序 data | orderBy : reverse
	
date：日期转换，默认yyyy-MM-dd data | date : yyyy-MM-dd
	
currency：货币处理 data | currency : '$'

empty：为空时替换为指定值 data | empty : 'http://www.xxx.com/empty.jpg'

passcard：银行卡号转换 data | passcard
	
#模板数据过滤，书写：
	<div>{{data | 命令 : 过滤内容}}</div>
	
	//无过滤
	<div>{{data}}</div>
	
#模板数据过滤扩展

	jQuery.kim.filterExtend({
		test: function(data, name, filterCondition){
			var val = data[name];
			//过滤代码
			...
			return val;
		}
	});

#route路由

ng-route="路由初始方法"，目前只对目标内的A标签服务。

	<div ng-route="routeInit"><a href="/list">导航</a></div>
	<script>
	jQuery(".main").kim({
		...,
		route:{
			root: ".", //默认路径
			config:{ //路由对应的地址 :id 相当于 #anchor
				"/list": {
					guide: "/bbb/list.html", //导向地址
					control: "nava" //目标控件
				},
				"/list:id": {
					guide: "/ccc/list.html",
					control: "navb"
				}
			}
		},
		handle:{
			routeInit: function(elem, id){
				...
			}
		}
		...
	</script>

#ng-插件，如何快速自定义标签属性？

	jQuery.kim.modelExtend({
		
		//name是ng-name
		name: function(){
			var self = this;
			var args = arguments,
				len = args.length,

				//args[0] 是当前具备ng-name的标签
				elem = args[0]; 

			//args[1] 是ng-name="args[1]"
			//arguments 是返回 args[1] 方法的参数
			code ...
			return this;
		}
	});
	
#方法

kim.fn

	tap .tap(function(offset, e, target){...}) tap事件，返回当前对象

	swipe .swipe(function(direction, offset, e, target){...}) swipe事件，返回当前对象

	eq	.eq("ng-item-name") || .eq(0) 查找dom，返回当前对象

	find .find("ng-item") 查找dom，返回当前对象

	get .get("appname") || .get("ng-app-name") 获取dom，返回当前对象

	query .query("#id") || .query(".classname") 选择器，返回当前对象

	build .build(element) 解析dom，返回当前对象

	tmpl .tmpl(数据, 模板) 生成模板，返回String

	getName .getName(element) 获取dom内部名，返回String

kim

	query .query("#id") || .query(".classname") 选择器，返回jquery对象

	tap .tap(element, function(offset, e, target){...}) tap事件，返回kim

	swipe .swipe(element, function(direction, offset, e, target){...}) swipe事件，返回kim

	tmpl .tmpl(数据, 模板) 生成模板，返回String

	modelExtend .modelExtend({...}) 插件扩展，返回kim

	filterExtend .filterExtend({...}) 模板数据过滤扩展，返回kim
	
	isArguments(object)或is['Function', 'String', 'Number', 'Date', 'RegExp', 'Error', "Boolean", "Array", "Object"] 类型判断，返回true或false

#DOM的操作

	.get(name)  .find(name)  .query(selector)  eq(number|name)  或者像kim提供的demo.html里写的那样 target.app[name].controls[name].html(); ,也可以用jQuery(selector)的方法获取。

	因为kim是基于jQuery开发的，其他的dom操作还是和jQuery一样的。

#依赖

jQuery.kim.require.use(["a", "b"], function(){...}); 引入依赖

或者 jQuery.kim.require.use("a", function(){...}); 引入依赖

或者 jQuery.kim.require.use("a b", function(){...}); 引入依赖

define(["module name"[, ["module dependencies", ...]], ] function(require, exports, module){...}); 模块化开发。

	可以使用nodejs grunt工具按情况配置合并、压缩、发布等。

