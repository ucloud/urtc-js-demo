# 1 描述
URTCJs 是UCloud推出的一款适用于 web 平台的实时音视频 SDK，
# 2 功能列表
## 2.1 基本功能
* 基本的音视频通话功能	
* 支持内置音视频采集的常见功能	
* 支持静音关闭视频功能	
* 支持视频尺寸的配置(180P - 1080P)	
* 支持自动重连	
* 支持丰富的消息回调	
* 支持纯音频互动	
* 支持视频的大小窗口切换	
## 2.2 增值功能
* 电子白板
* 终端智能测试（摄像头、麦克风、网络、播放器）
* AI鉴黄
* 视频录制/视频存储
* 视频水印
* 视频直播CDN分发
* 美颜
* 贴纸/滤镜/哈哈镜
* 背景分割
* 手势
* 虚拟形象
* 变声
# 3 方案介绍
## 3.1 方案架构
![](http://urtcwater.cn-bj.ufileos.com/%E5%9B%BE%E7%89%871.png)
## 3.2 方案优势
* 利用边缘节点就近接入
* 可用性99.99%
* 智能链路调度
* 自有骨干专线+Internet传输优化
* 数据报文AES加密传输
* 全API开放调度能力
* 端到端链路质量探测
* 多点接入线路容灾
* 抗丢包视频30% 音频70%
* 国内平均延时低于75ms 国际平均延时低于200ms
# 4 应用场景
## 4.1 主播连麦
支持主播之间连麦一起直播，带来与传统单向直播不一样的体验
48KHz 采样率、全频带编解码以及对音乐场景的特殊优化保证观众可以听到最优质的声音
## 4.2 视频会议
小范围实时音视频互动，提供多种视频通话布局模板，更提供自定义布局方式，保证会议发言者互相之间的实时性，提升普通观众的观看体验
## 4.3 泛文娱
### 4.3.1 一对一社交
客户可以利用UCloud实时音视频云实现 QQ、微信、陌陌等社交应用的一对一视频互动
### 4.3.2 狼人杀游戏
支持15人视频通话，玩家可在游戏中选择只开启语音或同时开启音视频
## 4.4 在线教育
支持自动和手动发布订阅视频流，方便实现课堂虚拟分组概念，同时支持根据角色设置流权限，保证课程秩序
## 4.5 在线客服
线上开展音视频对话，对客户的资信情况进行审核，方便金融科技企业实现用户在线签约、视频开户验证以及呼叫中心等功能
提供云端存储空间及海量数据的处理能力，提供高可用的技术和高稳定的平台

# 5 SDK 使用说明 - 简单步骤

## 5.1 创建一个 URTC Client

有两种方式：

- 使用 npm 安装，并将 sdk 使用 ES6 语法作为模块引入

1) 使用 [npm](https://www.npmjs.com/) 或 [Yarn](https://yarnpkg.com/) 安装 [urtc-sdk](https://github.com/ucloud/urtc-sdk-web):

```
npm install --save urtc-sdk
```

或

```
yarn add urtc-sdk
```

2) 项目中引入并创建 client

```
import { Client } from 'urtc-sdk';

const client = new Client(appId, token); // 默认为直播模式（大班课），若为连麦模式（小班课）时，需要传入第三个参数 { type: 'rtc' }，更多配置见 sdk API 说明
```
>由于浏览器的安全策略对除 127.0.0.1 以外的 HTTP 地址作了限制，Web SDK 仅支持  HTTPS协议  或者 http://localhost（http://127.0.0.1），请勿使用  HTTP协议  部署你的项目。

- 直接在页面中用 script 标签将 sdk 引入，此时会有全局对象 UCloudRTC

1) 直接将 sdk 中 lib 目录下的 index.js 使用 script 标签引入

```
<script type="text/javascript" src="index.js"><script>
```


2）使用全局对象 UCloudRTC 创建 client

```
const client = new UCloudRTC.Client(appId, token);
```

> 注：创建 client 时传的 token 需要使用 AppId 和 AppKey 等数据生成，测试阶段，可临时使用 sdk 提供的 generateToken 方法生成，但为保证 AppKey 不暴露于公网，在生产环境中强烈建议自建服务，由服务器按规则生成 token 供 sdk 使用。

## 5.2 监听流事件

```
client.on('stream-published', (stream) => {
    // 使用 HtmlMediaElement 播放媒体流。将流的 mediaStream 给 Video/Audio 元素的 srcObject 属性，即可播放，注意设置 autoplay 属性以支持视频的自动播放，其他属性请参见 [<video>](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video)
    htmlMediaElement.srcObject = stream.mediaStream;
}); // 监听本地流发布成功事件，在当前用户执行 publish 后，与服务器经多次协商，建立好连接后，会触发此事件

client.on('stream-subscribed', (stream) => {
    // 使用 HtmlMediaElement 播放媒体流
    htmlMediaElement.srcObject = stream.mediaStream;
}); // 监听远端流订阅成功事件，在当前用户执行 subscribe 后，与服务器经多次协商，建立好连接后，会触发此事件

client.on('stream-added', (stream) => {
    client.subscribe(stream.sid);
}); // 监听新增远端流事件，在远端用户新发布流后，服务器会推送此事件的消息。注：当刚进入房间时，若房间已有流，也会收到此事件的通知
```

## 5.3 加入一个房间，然后发布本地流

```
client.joinRoom(roomId, userId, () => {
    client.publish();
}); // 在 joinRoom 的 onSuccess 回调函数中执行 publish 发布本地流
```

## 5.4 取消发布本地流或取消订阅远端流

```
client.unpublish();
client.unsubscibe(streamId);
```

## 5.5 退出房间

```
client.leaveRoom();
```
