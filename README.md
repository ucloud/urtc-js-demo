# URTC Web 教育 demo

此 demo 网址：https://demo.urtc.com.cn/

## 步骤 1：使用 npm 引入 SDK

```
npm install
或    
yarn

```

## 步骤 2：启动

```
npm run start 
或
yarn start 
    
```

## 简单步骤
### 1. 获取 token
 [ucloud 控制台获取](https://console.ucloud.cn/urtc/manage) ，然后修改 config 下的 index.js 文件 
### 2. 创建一个 URTC Client

    htmlVideoElement.srcObject = stream.mediaStream;
}); // 监听本地流发布成功事件，此事件在当前用户执行 publish 后，与服务器经多次协商，建立好连接后，会触发此事件

client.on('stream-subscribed', (stream) => {
    htmlVideoElement.srcObject = stream.mediaStream;
}); // 监听远端流订阅成功事件，此事件在当前用户执行 subscribe 后，与服务器经多次协商，建立好连接后，会触发此事件

client.on('stream-added', (stream) => {
    client.subscribe(stream.sid);
}); // 监听新增远端流事件，此事件在远端用户新发布流后，服务器会推送此事件的消息。注：当刚进入房间时，若房间已有流，也会收到此事件的通知 s

```

<<<<<<< HEAD
### 4. 加入一个房间，然后发布本地流并订阅远端流
=======
#### 3. 加入一个房间，然后发布本地流并订阅远端流
>>>>>>> 0f6857940bac035139445c801c13293b8b125099

```
client.joinRoom(roomId, userId, () => {
    client.publish();
}); // 在 joinRoom 的 onSuccess 回调函数中执行 publish 发布本地流
```

<<<<<<< HEAD
### 5. 取消发布本地流或取消订阅远端流
=======
#### 4. 取消发布本地流或取消订阅远端流
>>>>>>> 0f6857940bac035139445c801c13293b8b125099

```
client.unpublish();
client.unsubscibe(streamId);
```

### 6. 退出房间

```
client.leaveRoom();
```
