# URTC Web 教育 demo

此 demo 网址：https://demo.urtc.com.cn/

## 步骤 1：使用 yarn 引入 SDK  (npm 在windows环境可能会安装依赖失败)

### 安装  yarn [下载安装包](https://yarn.bootcss.com/docs/install),或者通过npm 安装
```
npm install -g yarn --registry=https://registry.npm.taobao.org

```
然后配置源
```
yarn config set registry https://registry.npm.taobao.org -g

yarn config set sass_binary_site http://cdn.npm.taobao.org/dist/node-sass -g

```
### 然后执行
```
yarn

```

## 步骤 2：启动

```
yarn start 
```

修改 config 下的 index.js 文件，配置 AppId 和 AppKey。
 
 > 注：
>
> 1. AppId 和 AppKey 可从 URTC 产品中获取，可以参考 https://docs.ucloud.cn/urtc/quick 。
> 2. AppKey 不可暴露于公网，建议生产环境时，由后端进行保存并由前端调 API 获取
> 3. 白板相关信息点击跳转 [这里](http://herewhite.com/zh-CN/)
> 4. 由于浏览器的安全策略对除 127.0.0.1 以外的 HTTP 地址作了限制，Web SDK 仅支持 HTTPS 协议 或者 http://localhost（http://127.0.0.1）, 请勿使用 HTTP 协议 部署你的项目。
