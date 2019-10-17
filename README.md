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

# 5 Demo运行
```
npm install //安装依赖
npm run start //运行Demo
npm run build //打包Demo
``` 

# 6 实现流程
以下是简单的SDK调用流程，详细API接口请参考接口文档

## 1，引入SDK
```
import {URtcDemo} from 'UCloudRtcEngine';
``` 

## 2，初始化
``` 
const URtcDemo = new UCloudRtcEngine();  
```
## 3，获取token
``` 
const URtcDemo = new UCloudRtcEngine();  
URtcDemo.getToken({
    app_id: appId,//控制台创建项目获取到的appkey
    room_id: roomId,//房间号
    user_id: userId,//用户id
    appkey: appkey//控制台创建项目获取到的appkey
}).then(function(data) {
    //返回当前用户的token 
}).catch(function(err){
    //报错信息 
})
``` 

## 4，建立链接
``` 
URtcDemo.init({  
    app_id: appId,//控制台创建项目获取到的appkey
    room_id: roomId,//房间号
    user_id: user_id,//用户id
    token: token,//getToken()获取到的token
    role_type: role_type, //用户权限0 推流 1 拉流 2 全部
    room_type: room_type //房间类型 0 rtc小班课 1 rtc 大班课 
}).then(function(data){  
//返回链接url 
}).catch(function(err){
    //报错信息 
}) 
``` 

## 5，开启本地媒体设备
``` 
URtcDemo.getLocalStream({
    media_data: "videoProfile1280*720",//设置视频分辨率
    video_enable: true,//是否开始摄像头true/false
    audio_enable: true,//是否开启音频设备true/false
    media_type: 1 //采集类型 1 摄像头 2 桌面
}).then(function(data) {
    //加入媒体流
}.catch(function(err){
    //报错信息 
}) 
```

## 6，加入房间
``` 
URtcDemo.joinRoom({
    token: token, //getToken()获取到的token
    role_type: 2, //用户权限0 推流 1 拉流 2 全部
    room_type: room_type //房间类型 0 rtc小班课 1 rtc 大班课
}).then(function(e) {
    //房间信息
}).catch(function(err){
    //报错信息 
}) 
```

## 7，发布本地流
``` 
URtcDemo.publish({  
	user_id:user_id,//用户id  
	media_type:1,//发布的流类型 1 摄像头 2桌面  
	audio: true,//是否包含音频流 true/false
	video:true,//是否包含视频流 true/false
	data:false//是否包含数据流 true/false
}).then(function(e){  
    //发布信息 
}).catch(function(err){
    //报错信息 
});  
```

## 8,订阅远端流 
``` 
URtcDemo.subscribe({  
	media_type: 1,//订阅的流类型 1 摄像头 2桌面  
	stream_id: “stream_id”,//订阅流id  
	user_id: “user_id",//订阅用户id  
},{  
	audio_enable: true,//是否包含音频流 true/false
	video_enable: true//是否包含数据流 true/false
}).then(function(e){  
    //订阅信息  
}).catch(function(err){
    //报错信息 
}) 
```

## 9，获取本地音量数据
``` 
URtcDemo.getAudioVolum().then(function(e){  
     //音量数据  
 }).catch(function(err){
    //报错信息 
});
```

## 10，打开/关闭本地音视频
``` 
URtcDemo.activeMute({  
    stream_id: stream_id,//媒流id   
    stream_type: 1,//1 发布流 2 订阅流  
    user_id: user_id,//用户id  
    track_type: 2,//1 视频 2音频  
    mute: video_enable//true 禁用 false 开启  
}).then(function(e){  
    //操作成功  
}).catch(function(err){
    //报错信息 
});
```  

## 11，枚举本地媒体设备
``` 
URtcDemo.getLocalDevices().then(function(e){  
    //成功输出本地设备数据  
  	//microphones 音频输入设备列表	  
	//speakers 音频输出设备列表  
	//cameras 视频输输入设备列表  
	//设备列表中的每一个元素类型相同（label：设备名称，deviceId：设备Id）  	
}).catch(function(err){
    //报错信息 
});
``` 

## 12，离开房间
``` 
URtcDemo.leaveRoom({  
    room_id: room_id//房间id  
}).then(function(e){  
    //退出成功  
},function(err){  
     //退出失败  
}); 
``` 

## 13，开始录制
``` 
URtcDemo.startRecord({
    "mimetype": 3,//1 音频 2 视频 3 音频+视频
    "mainviewuid": appData.userId,//主窗口位置用户id
    "mainviewtype": 1,//主窗口的媒体类型 1 摄像头 2 桌面
    "width": 1280,//320~1920之间
    "height": 720,//320~1920之间
    "watermarkpos": 1, //1 左上 2 左下 3 右上 4 右下,
    "bucket": "urtc-test",
    "region": 'cn-bj' //所在区域,
}).then(function (e) {
    //返回录制文件名
    //观看录制地址规则 'http://'+ bucket + '.'+ region +'.ufileos.com/' + e.data.FileName  
}).catch(function(err){
    //错误信息
})
``` 

## 14，结束录制
``` 
URtcDemo.stopRecord().then(function (e) {
    //录制成功  
}).catch(function(err){
    //错误信息
})
``` 
