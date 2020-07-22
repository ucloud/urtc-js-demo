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

## 简单步骤
### 1. 获取 token
 [ucloud 控制台获取](https://console.ucloud.cn/urtc/manage)， 得到 appId 和 appKey。然后修改 config 下的 index.js 文件 
### 2. 创建一个 URTC Client
```
import { Client } from 'sdk';
const client = new Client(appId, appKey); // 默认为直播模式（大班课），若为连麦模式（小班课）时，需要传入第三个参数 { type: 'rtc' }，更多配置见 sdk API 说明

```
### 3. 监听流事件

```
client.on('stream-published', (stream) => {
    htmlVideoElement.srcObject = stream.mediaStream;
}); // 监听本地流发布成功事件，此事件在当前用户执行 publish 后，与服务器经多次协商，建立好连接后，会触发此事件

client.on('stream-subscribed', (stream) => {
    htmlVideoElement.srcObject = stream.mediaStream;
}); // 监听远端流订阅成功事件，此事件在当前用户执行 subscribe 后，与服务器经多次协商，建立好连接后，会触发此事件

client.on('stream-added', (stream) => {
    client.subscribe(stream.sid);
}); // 监听新增远端流事件，此事件在远端用户新发布流后，服务器会推送此事件的消息。注：当刚进入房间时，若房间已有流，也会收到此事件的通知 s

```

### 4. 加入一个房间，然后发布本地流并订阅远端流

```
client.joinRoom(roomId, userId, () => {
    client.publish();
}); // 在 joinRoom 的 onSuccess 回调函数中执行 publish 发布本地流
```

### 5. 取消发布本地流或取消订阅远端流

```
client.unpublish();
client.unsubscibe(streamId);
```

### 6. 退出房间

```
client.leaveRoom();
```
