# URTC Web 教育demo

### 使用`npm`引入SDK

将 sdk 使用 ES6 语法作为模块引入。使用该方法需要先安装 `npm`，详见 [npm快速入门](https://www.npmjs.cn/getting-started/installing-node/)。

1）使用`npm`或 [`Yarn`](https://yarnpkg.com/) 集成 WEB SDK:
```
npm install --save urtc-sdk
或    
yarn add urtc-sdk
```
2）项目中引入SDK并创建 client

```
import { Client } from 'urtc-sdk';
```
更多内容，参考[URTC Web集成指南](https://docs.ucloud.cn/urtc/sdk/VideoStart)。

## URTC Web 简易demo

除了集成教育demo，还可以集成简易版DEMO。

[urtc-sdk-web](https://git.ucloudadmin.com/urtc/sdk/urtc-sdk-web) 使用示例

启动

```
    npm run start or yarn start 
```

### 简单步骤

#### 1. 创建一个 URTC Client

```
import { Client } from 'sdk';

const client = new Client(appId, appKey); // 默认为直播模式（大班课），若为连麦模式（小班课）时，需要传入第三个参数 { type: 'rtc' }，更多配置见 sdk API 说明
```

#### 2. 监听流事件

```
client.on('stream-published', (stream) => {
    htmlVideoElement.srcObject = stream.mediaStream;
}); // 监听本地流发布成功事件，此事件在当前用户执行 publish 后，与服务器经多次协商，建立好连接后，会触发此事件

client.on('stream-subscribed', (stream) => {
    htmlVideoElement.srcObject = stream.mediaStream;
}); // 监听远端流订阅成功事件，此事件在当前用户执行 subscribe 后，与服务器经多次协商，建立好连接后，会触发此事件

client.on('stream-added', (stream) => {
    client.subscribe(stream.sid);
}); // 监听新增远端流事件，此事件在远端用户新发布流后，服务器会推送此事件的消息。注：当刚进入房间时，若房间已有流，也会收到此事件的通知s

```

#### 3. 加入一个房间，然后发布本地流并订阅远端流

```
client.joinRoom(roomId, userId, () => {
    client.publish();
}); // 在 joinRoom 的 onSuccess 回调函数中执行 publish 发布本地流
```

#### 4. 取消发布本地流或取消订阅远端流

```
client.unpublish();
client.unsubscibe(streamId);
```

### 5. 退出房间

```
client.leaveRoom();
```
