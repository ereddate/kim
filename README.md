# kim
	依赖注入型的前端模板开发框架，适用于中小型移动端网站开发。核心：语义化标签、依赖注入、数据绑定等等。

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

ng-list 可循环的数据列表

ng-tmpl 不可循环的数据模板

ng-model 插件

	valid 表单测证 valid(验证类型:错误提示:提示元素或回调)

