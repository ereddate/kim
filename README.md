# kim

依托jQuery的依赖注入型的前端模板开发框架，适用于中小型移动端网站开发。核心：语义化标签、依赖注入、数据绑定、路由、模块化、按需加载等等。
	
#引入及使用
	<div ng-app="test" ng-show="show" ng-route="routefunc">
		<div ng-page="home" ng-show="show">
			<div ng-view="headera" ng-class="{true:'on', false:'off'}">
				<img ng-item="img" ng-src="http://www.aaa.com/logo.jpg" src="http://www.aaa.com/blank.jpg" />
				<div ng-control="nava" ng-tmpl="getData | handle : [callback_name]" ng-swipe="swipetest">
					<div ng-item="list_tmpl_{{id}}" ng-repeat="item in items">
						<p>{{item.decoration | filter : 'a'}}</p>
						<a href="#" ng-item="testclick" ng-click="test_click" data-id="{{item.id}}" ng-tap="taptest">删除</a>
					</div>
				</div>
				<div ng-control="bbba" ng-tmpl="getData">
					<p data-id="{{id | test : 1}}">{{decoration}}</p>
				</div>
				<form ng-control="ngform" ng-form="ngform" action="/post" method="post">
					<select ng-item="select" name="select" ng-tmpl="getselect_get" ng-change="select_change" ng-valid="required:不能为空:selecterror"><option value="{{value}}">{{title}}</option></select>
					<span ng-item="selectval"></span>
					<span ng-item="selecterror"></span>
					<button type="submit" ng-item="formsubmit">提交</button>
				</form>
			</div>
			<div ng-view="waterfall">
				<div ng-control="waterfall" ng-tmpl="getData" ng-waterfall="waterfall_callback">
					<div ng-item="waterfall_item" class="cell">{{code}}</div>
				</div>
			</div>
			<div ng-view="footer" ng-include="footer.html | data : includefooter">
				//footer.html 代码如下
				//<span ng-tmpl="footer_content">{{$time}}</span>
			</div>
		</div>
	</div>
	<script src="kim.js"></script>
	<script>
		//define定义模块
		kim.define("init", function(require, exports, module){
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
		}).define("includefooter", function(){
			return {
				time: "2015"
			};
		});
		
		//使用KIM
		kim.define(function(require, exports, module){
			var init = require("init");
			init();
			
			//设置模板语法边界符$mark.start, $mark.end，名称不能变
			kim.setTmplMark(function($mark){
				$mark.start = "{{";
				$mark.end = "}}";
			});

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
					form:{
						ngform:{
							"/post": "aaa"
						}
					},
					handle:{
						includefooter: function(){
							return require("includefooter");
						},
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
									console.log(jQuery(elem)._has("title"));
									console.log(kim.has(elem[0], "title"));
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

ng-valid 表单测证 ng-valid="验证类型:错误提示:提示元素或回调"

ng-tmpl 数据模板 ng-tmpl="导入数据的方法名 | handle : [导入后的回调]"
	
	ng-repeat 表示具有此属性的标签为模板，未加此属性具有ng-tmpl属性的标签内HTML为模板。
	ng-repeat="数据 in 数据集"，例如下：
	<div ng-control="name" ng-tmpl="callback">
		<div ng-item="name" ng-repeat="item in items">
			<span>{{item.id}}{{item.a + item.b | currency : '$'}}</span>
		</div>
	</div>
	
ng-route 路由，目前只导航ng-app ng-page，会与ng-show ng-click产生冲突，尽量不要一起使用

ng-form form是valid的延伸，只提供form提交不提供ajax提交，详细使用请查看demo.html

	ng-formr提供form表单和ajax两种提交方式（ng-type="form|ajax"），ajax提交需提供如下：
	
	ng-data 数据类型
	
	ng-form-success 成功回调 ng-form-error 错误回调

ng-include 引入模板并编译 ng-include="页面地址 | data : 数据获取方法"

ng-插件名

	waterfall 瀑布流

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
			},
			handle:{
				routeInit: function(elem, id){
					...
				}	
			}
		},
		handle:{
			...	
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
	
#touch环境的支持

事件：tap和swipe

head标签：kim.setup([...]);

	kim.setup({
		statusBarStyle: "black",
		icon: {
			57: 'resources/icons/Icon.png',
			72: 'resources/icons/Icon~ipad.png',
			114: 'resources/icons/Icon@2x.png',
			144: 'resources/icons/Icon~ipad@2x.png'
		} 或 icon: "resources/icons/Icon.png",
		startupImage: {
			'320x460': 'resources/startup/320x460.jpg',
			'640x920': 'resources/startup/640x920.png',
			'640x1096': 'resources/startup/640x1096.png',
			'768x1004': 'resources/startup/768x1004.png',
			'748x1024': 'resources/startup/748x1024.png',
			'1536x2008': 'resources/startup/1536x2008.png',
			'1496x2048': 'resources/startup/1496x2048.png'
		}
	}[, function(){...}]);
	
设备： kim.data.support

	touch 返回true或false
	
	isPhone 返回true或false
	
	isTablet 返回true或false
	
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
	
	buildFile .buildFile(url, data, success, error) 读取外部模板文件，向模板导入数据并解析，返回当前对象

kim

	query .query("#id") || .query(".classname") 选择器，返回jquery对象

	tap .tap(element, function(offset, e, target){...}) tap事件，返回kim

	swipe .swipe(element, function(direction, offset, e, target){...}) swipe事件，返回kim

	tmpl .tmpl(数据, 模板) 生成模板，返回String

	modelExtend .modelExtend({...}) 插件扩展，返回kim

	filterExtend .filterExtend({...}) 模板数据过滤扩展，返回kim
	
	is .is("arguments", object), 目前支持['Function', 'String', 'Number', 'Date', 'RegExp', 'Error', "Boolean", "Array", "Object", "Element"] 类型判断，返回true或false
	
	has 判断是否包含， 可以判断标签属性、字符串字符、数组字段、对象字段，返回true 或 false，jQuery可以使用_has
	
	stringify 类型转换字符串
	
	setup 对于touch环境提供viewport、apple-mobile-web-app-capable、apple-touch-fullscreen、apple-mobile-web-app-status-bar-style支持，引用 kim.setup([{statusBarStyle:"blank"}[,function(){...}]] 或 function(){...});
	
	renderFile 读取外部模板文件，并返回dom标签。kim.renderFile(文件, 数据, 成功后的回调, 错误后的回调);
	
	setTmplMark 设置模板语法边界符$mark.start, $mark.end，名称不能变;

#DOM的操作

	.get(name)  .find(name)  .query(selector)  eq(number|name)  或者像kim提供的demo.html里写的那样 target.app[name].controls[name].html(); ,也可以用jQuery(selector)的方法获取。

	因为kim是基于jQuery开发的，其他的dom操作还是和jQuery一样的。

#依赖

jQuery.kim.require.use(["a", "b"], function(){...}); 引入依赖

或者 jQuery.kim.require.use("a", function(){...}); 引入依赖

或者 jQuery.kim.require.use("a b", function(){...}); 引入依赖

kim.define(["module name"[, ["module dependencies", ...]], ] function(require, exports, module){...}); 模块化开发。

	可以使用nodejs grunt工具按情况配置合并、压缩、发布等。

