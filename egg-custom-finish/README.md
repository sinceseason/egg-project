# platform_audit

用于主营业务 app 审核相关服务的提供

## 初衷

### app 审核

为 app 市场投放提供更多非主线功能模块（例：学习打卡...）

### 框架

将框架代码和业务代码分离，通过约定规则方式，减少开发人员成本。并以 **egg** 设计模式为基础，改变公司内 Node 项目既有形式。

[点击了解-Egg.js 是什么?](https://eggjs.org/zh-cn/intro/index.html)

### 未来

以渐进式方式设计开发，逐步完善项目核心功能，为公司内 Node 项目技术方向做好基础建设。

如果可以会考虑整合目前量加独立部署的部分接口。

## feature

- 打卡学习
- ssr 支持

## todoList

- [*] mysql sequelize
- [*] swagger inject
- [*] logger
- [ ] pm2
- [ ] ssr 支持

## 约定

### 目录说明

```txt
| app               #代码区
    | controller    #视图层 controller
    -- | foo.js
    -- | boo.js
    | service       #服务层 service
    -- | foo.js
    -- | boo.js
    | model         #持久层 model
    -- | foo.js
    -- | boo.js
    router.js       #路由 router
| config            #配置文件
    | config.xx.js
| core              #核心模块
```

### 环境配置

文件命名：

```js
config.${env}.js
```

默认 **env** 会根据设置的 **process.env.NODE_ENV** 加载对应的配置

- production --> config.prod.js
- development --> config.dev.js

```json
"scripts": {
    "start": "cross-env NODE_ENV=dev node ./app.js"
}
```

也可以通过 **process.env.CONFIG_ENV** 具体制定配置文件

```json
"scripts": {
    "start": "cross-env CONFIG_ENV=sit node ./app.js"
}
```

对应加载 config.sit.js

```txt
| config
-- | config.default.js  # 默认（公共）配置
-- | config.dev.js      # 开发配置
```

### 路由

根据 restful api 约定，定义整个路由。

路由 controller.module 实现均挂载在 app.controller 对象上，并以模块区分。

```js
router.get('/foo', app.controller.foo.index);
router.post('/foo/:id', app.controller.foo.edit);
```

```txt
| controller
-- | foo.js
-- | boo.js
```

针对局部拦截，可在路由中添加单个中间件控制：

```js
router.delete('/foo/:id', app.middleware.checkLogin(app), app.controller.foo.delete);
```

### 持久层

由于此项目会有 mysql 数据库链接，封装 sequelize model 作为持久层控制。

需注意，model 中定义的 curd 方法不能和 sequelize 方法重名：

```js
// 错误写法
Question.findOne = function(id) {
	return this.findOne({ where: { id } });
};
// 需命名不同
Question.queryItem = function(id) {
	return this.findOne({ where: { id } });
};
```

**关于多数据源**

可以设置 config，来配置多数据源：

```js
mysql: {
	datasources: [
		{
			delegate: 'platformAuditReadWrite',
			database: 'platform_audit',
			username: 'root',
			password: 'root',
			host: '192.168.1.60',
			port: '3306',
			dialect: 'mysql',
			logging: data => {
				console.log(`sql`, data);
			},
			timezone: '+08:00'
		}
	];
}
```

在 model 层中，指定数据源作为 sequelize 即可：

```js
app.platformAuditReadWrite.define ...
```
