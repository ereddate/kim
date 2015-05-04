# kim

依托jQuery的依赖注入型的前端模板开发框架，适用于中小型移动端网站开发。核心：语义化标签、依赖注入、数据绑定等等。
	
#引入及使用
	<div ng-app="test" ng-show="show">
		<div ng-page="home" ng-show="show">
			<div ng-view="headera">
				<div ng-control="nava" ng-list="getData(callback_name)" ng-filter="obj.id == 1">
					<div ng-item="list_tmpl_{{id}}">
						<p>{{decoration}}</p>
						<a href="#" ng-item="testclick" ng-click="test_click" data-id="{{id}}">删除</a>
					</div>
				</div>
				<div ng-control="bbba" ng-tmpl="getData">
					<p data-id="{{id}}">{{decoration}}</p>
				</div>
				<div ng-control="cccb">
					<select ng-item="select" name="select" ng-list="getselect_get" ng-change="select_change" ng-valid="required:不能为空:selecterror"><option value="{{value}}">{{title}}</option></select>
					<span ng-item="selectval"></span>
					<span ng-item="selecterror"></span>
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
			}
		});
		
		//使用KIM
		define(function(require, exports, module){
			var init = require("init");
			init();

			//可以这样写jQuery.kim({...}) 或者 jQuery(".main").kim({...}) 或者 kim({...})
			//jQuery.kim.require写法可以是 jQuery.kim.require(["a", "b"], function(){...}) 或者 jQuery.kim.require("a", function(){...}) 或者 jQuery.kim.require("a b", function(){...})
			jQuery.kim.require.use(["a", "b"], function(result){
				var a = result["a"],
					b = result["b"];
				jQuery.kim({
					initialization: function(){
						//初始页面
						this.app["test"].item["gohomea"].click();
					},
					handle:{
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

#公共属性

ng-[app|page|view|control|item]="name" 对象名称

ng-show="show|hide" 是否显示

ng-插件名

	valid 表单测证 ng-valid="验证类型:错误提示:提示元素或回调"
	
	list 数据列表 ng-list="导入数据的方法名([导入后的回调])"

		ng-filter="过滤表达式" 私有过滤属性
	
	tmpl 数据模板 ng-tmpl="导入数据的方法名([导入后的回调])"

		ng-filter="过滤表达式" 私有过滤属性
	
#方法

jQuery.kim.modelExtend({...}); 插件扩展

jQuery.kim.require.use(["a", "b"], function(){...}); 引入依赖

或者 jQuery.kim.require.use("a", function(){...}); 引入依赖

或者 jQuery.kim.require.use("a b", function(){...}); 引入依赖

define(["module name"[, ["module dependencies", ...]], ] function(require, exports, module){...}); 模块化开发。

	可以使用nodejs grunt工具按情况配置合并、压缩、发布等。

