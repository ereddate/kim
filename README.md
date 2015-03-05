# kim
开发框架

# 说明
	jq-app或自定义属性名：应用父标签
  
	jq-model属性名：操作对象
	
	to: 有指定结果对象的操作。
	
	参数：
	
	【0】结果对象名【1】事件名（自定义事件custom）【2】（可选）自定义事件function
	
	op：运算。
	
	参数：
	
	【0】表达式或方法function【1】exp是否显示表达式
	
	jq-result属性名：结果对象

	返回数据为json，并且在结果对象的html中包含{{json对应名称}}，做相关替换。
