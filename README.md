# kim
开发框架

2015-4-19 新思路 start

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

ng-datalist 可循环的数据列表

ng-datatmpl 不可循环的数据模板

ng-model 插件

	valid 表单测证 valid(验证类型:错误提示:提示元素或回调)

2015-4-19 新思路 end

# 说明
	kim-app = name view名称或自定义属性名：应用父标签 

	kim-control属性标注为kim控件 = name 控件名称

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
