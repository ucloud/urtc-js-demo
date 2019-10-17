/*
 * @Description: 更改推拉流信息
 * @Author: leif.zhang 16:59:53
 * @LastEditTime: 2019-09-09 16:49:19
 * @LastEditors: Please set LastEditors
 */
'use strict';
import $ from './jquery-3.3.1';
import {
    log,
    error
} from '../common/util/index';
import './adapter-latest';
import adapter from './adapter-latest';

import {
    Base64
} from './base64';
import jsSHA from './sha1';
import { throwError } from 'rxjs';
console.log(process.env.REACT_APP_ENV)
console.log('---------------------')
const RPCVersion = 0.1;
const sdkVersion = '1.0.0';
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
//stream_type 1 发布流 2 订阅流
const streamTypePub = 1
const streamTypeScb = 2
let t;
let localStream;
let intervalId;
let urtcUrl = '';
let logUrl = '';
if(process.env.REACT_APP_ENV == "prod"){
     urtcUrl = 'https://urtc.com.cn';
     logUrl = 'https://log.urtc.com.cn';
}else{
     urtcUrl = 'https://pre.urtc.com.cn';
     logUrl = 'https://logpre.urtc.com.cn';
}
// let URtcEngine;

export class UCloudRtcEngine {
    constructor() {
        this.ws = null;
        this.listeners = {};
        this.scbStreams = {};
        this.videoIds = [];
        this.rpcmap = {};
        this.rpcid = '';
        this.rpcnum = 10000000;
        this.scbMap = {};
        this.pc0 = null;
        this.monitorFlag = true;//监控开关
        this.addEventListener('newPublish', this.getNewPublish);
        this.addEventListener('transportclose', this.getTransportClose);
        this.addEventListener('getTrackst', this.getTrackst);
        this.addEventListener('outTrackst', this.outTrackst);
        this.addEventListener('getUserst', this.getUserst);
        this.dataList = {
            // rpc_id: '1', //消息标识符
            session: '1', //占位符
            data_enable: false, //处理数据流，占位符
            scbStreams:{},//远端视频信息
            videoBandwidth: 400,
            audioBandwidth: 400,
            video_enable: true,
            audio_enable: true,
            recording: false,
            monitor_map: {},
        };
        this.localStream=null;
        this.handlerFunc = [];

        this.localStreamDetailStyle = null; //流信息
    }
    getToken(obj) {
        const _that = this;
        return new Promise(function (resolve, reject) {
            let header = Base64.encode(JSON.stringify(obj));
            let time = Math.round(Date.now() / 1000);
            let randNum = _that.randNum(8);
            let string = obj.user_id + obj.app_id + time + randNum + obj.room_id;
            let shaObj = new jsSHA("SHA-1", 'TEXT');
           console.log(obj.appkey)
           log(obj.appkey)
            shaObj.setHMACKey(obj.appkey, 'TEXT');
            shaObj.update(string)
            let hash = shaObj.getHMAC("HEX");
            let signture = hash + time + randNum;
            let token = header + '.' + signture;
            // _that.getUrl(token);
            resolve(token);
            if (obj.room_id !== undefined) {
                // resolve('get token success');
            } else {
                reject('get token error')
            }
        })
    }
    //获取当前时间 rpcid用
    rpcId(time) {
        let rpcnum = this.rpcnum + 1;
        let date = new Date(time + 8 * 3600000);
        let str = date.toISOString().replace(/:|-|T/g,'');
        str = str.substr(0, str.lastIndexOf('.'));
        let rpcid = 'web_' + navigator.platform + '_' + str + '_' + rpcnum;
        this.rpcnum = rpcnum;
        this.rpcid = rpcid;
        return rpcid;
    };
    getUrl(obj) {
       console.log(obj)
       log(obj)
    //    console.log(this.rpcId(Date.now()))
    //     let a = this.rpcId(Date.now());
    //     console.log(a)
        
       console.log('getUrl+++')
       log('getUrl+++')
        
        let _that = this;
        const reqUrl = urtcUrl + '/uteach';
        // const reqUrl = 'https://apiin.urtc.com.cn:5005';
        let getData = {
            // "Action": "rsugetrtcgateway",
            "rpc_id": this.rpcId(Date.now()),
            "user_id": obj.user_id,
            "room_id": obj.room_id,
            "app_id": obj.app_id,
            "token": obj.token
        };
        if (obj.room_type == 1) {
            getData = Object.assign(getData, {
                "Action": "rsugetlivegateway",
                "role": obj.role_type
            });
        } else if (obj.room_type == 0) {
            getData = Object.assign(getData, {
                "Action": "rsugetrtcgateway",
            });
        }
        return new Promise(function (resolve, reject) {
            let wsUrl = '';
            $.ajax({
                type: "get",
                url: reqUrl,
                dataType: "jsonp",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: getData,
                success: function (data) {
                    if (data.err == 0) {
                        const urlArr = JSON.parse(Base64.decode(data.data.access_token));
                        wsUrl = 'wss://' + urlArr[0].singal + ':' + urlArr[0].port + '/ws';
                        _that.dataList.url = wsUrl;
                        getData.wsUrl = wsUrl;
                        resolve(getData);
                    } else {
                        reject('get url error');
                        // document.getElementById("roomSwitch").parentNode.style.display = "block";
                    }
                }
            })

        })

    }
    
    init(obj) {
        const initData = obj;
        this.dataList = Object.assign(this.dataList, obj);
        const _that = this;
        return new Promise(function (resolve, reject) {
            _that.getUrl(obj).then(function (data) {
                _that.ws = new WebSocket(data.wsUrl);
                _that.ws.onmessage = function (evt) {
                    let rsp = JSON.parse(evt.data);
                    let req = _that.rpcmap[rsp.rpc_id];

                    // 老师离开，删除视频流
                    // let targetObj = JSON.parse(evt.data);
                    // $(`#${targetObj.data.user_id}`).remove();

                   console.log('###############################');
                   console.log(rsp)
                   console.log(_that)
                   console.log(req)
                   console.log(evt)
                   console.log('Send msg : ' + JSON.stringify(req));
                   console.log('Recv msg : ' + evt.data);
                   log('###############################');
                   log(rsp)
                   log(_that)
                   log(req)
                   log(evt)
                   log('Send msg : ' + JSON.stringify(req));
                   log('Recv msg : ' + evt.data);
                    _that.recvMsgHandler(req, rsp);
                };
                resolve(data)
            }, function (err) {
                reject(err)
            })
        })
        // this.localVideo = localVideo;
        // for (let id of videoIds) {
        //     let idstatus = {id: id, status: 'init'};
        //     this.videoIds.push(idstatus);
        // }

        // this.resolution = rs;
        // this.frameRate = fps;        
        window.addEventListener('beforeunload', function (e) {
            this.leaveRoom({
                room_id: this.dataList.room_id
            });
            _that.ws.close();
            clearInterval(intervalId);
        })

    }
    joinRoom(data,time) {
        let joinRoomData = {
            rpc_id: this.rpcId(Date.now()),
            user_id: this.dataList.user_id,
            room_id: this.dataList.room_id,
            authtoken: data.token,
            sessionid: this.dataList.session,
            app_id: this.dataList.app_id,
        }
        this.dataList.role_type = data.role_type;
        this.dataList.room_type = data.room_type;
        if (data.room_type == 1) {
            joinRoomData = Object.assign(joinRoomData, {
                role_type: data.role_type, //用户权限0 推流 1 拉流 2 全部
                room_type: data.room_type, //房间类型 0 rtc小班课 1 rtc 大班课
                devinfo: Base64.encode(JSON.stringify({
                    sdkv: '',
                    agent: 'web'
                }))
            });
        }
        // this.send('joinroom', joinRoomData);
        // this.addEventListener('joinroom', this.getRoomJoin);
        let p = new Date();
        const _that = this;
        return new Promise(function (resolve, reject) {
            _that.send('joinroom', joinRoomData)
            // 上报加入房间的日志
            _that.reportRoomLog('joinRoom')
            _that.reportOperationLog('joinRoom');
            _that.addEventListener('joinroomerror', function (e) {
                // 上报加入房间的异常日志
                _that.reportExceptionLog('joinRoom');
                reject(e.rsp)
            })
            
            _that.addEventListener('joinroom', function () {
                resolve('join room success');
                _that.getRoomJoin();
            });

        })
    }

    leaveRoom(data) {
        const _that = this;
        const promise = new Promise(function (resolve, reject) {
            _that.send('leaveroom', data);
            // 上报离开房间的日志
            _that.reportRoomLog('leaveRoom')
            _that.reportOperationLog('leaveRoom');
            for (let k of Object.keys(_that)) {
                if (k.startsWith('pc')&&_that[k]!==null) {
                    console.log(_that[k])
                    _that[k].close();
                }else if (k==='scbMap') {
                    console.log('scbMap',_that)
                    for (let i in _that[k]) {
                        _that[k][i].pc.close();
                        delete _that[k][i];
                    }
                }
            }
            _that.ws.close()
        })
        _that.removeEventListener('joinroom');
        _that.addEventListener('leaveroomerror', function (e) {
            // 上报加入房间的异常日志
            _that.reportExceptionLog('leaveRoom');
            console.log('leaveroomerror',e)
        })
        
        console.log('leaveRoom')
        console.log(_that)
        _that.addEventListener('leaveroom', function (e) {

            // _that.getRoomLeave(e);
            // _that.ws.onclose()= function () {
            //     console.log('server ws closed');
            // };
            // _that.ws.close()
            // console.log(1)
            // for (let k of Object.keys(_that)) {
            //     if (k.startsWith('pc')&&_that[k]!==null) {
            //         console.log(k.startsWith('pc'))
            //         console.log(_that[k])
            //         _that[k].close();
            //         console.log(2)
            //     }else if (k==='scbMap') {
            //         console.log(_that[k])
            //         console.log(3)
            //         for (let i in _that[k]) {
            //             _that[k][i].pc.close();
            //             delete _that[k][i];
            //         }
            //         // this.scbMap[req.data.src.stream_id].pc.close();
            //         // _that[k].close();
            //         console.log(_that)
            //     }
            // }
            console.log('leave room success');

        });
        return Promise;
    }
    publish(data) {
       console.log(this)
       console.log(data)
       console.log('publish')
       log(this)
       log(data)
       log('publish')
        // this.send('publish', data);
        // this.addEventListener('publish', this.getPublish);
        const _that = this;
        let role_type = this.dataList.role_type;
        return new Promise(function (resolve, reject) {
            if (role_type == 0 || role_type == 2) {
                _that.send('publish', data)
                // 上报发布流的操作日志
                _that.reportOperationLog('publish');
                _that.addEventListener('publisherror', function (e) {
                    // 上报发布流的异常日志
                    _that.reportExceptionLog('publish');
                    reject(e.rsp)
                })
                _that.addEventListener('publish', function (e) {
                    _that.getPublish(e);
                    resolve(e);
                });
            } else if (role_type == 1) {
                reject('not allow publish');
            }

        })
    }

    subscribe(data, obj) {
       console.log(data)
       console.log(obj)
       log(data)
       log(obj)
        const _that = this;
        let role_type = this.dataList.role_type;
        return new Promise(function (resolve, reject) {
            if (role_type == 1 || role_type == 2) {
                _that.send('subscribe', {
                    src: {
                        user_id: _that.dataList.user_id,
                        audio: obj.audio_enable,
                        video: obj.video_enable,
                        data: _that.dataList.data_enable
                    },
                    dst: {
                        user_id: data.user_id,
                        stream_id: data.stream_id,
                        media_type: data.media_type
                    }
                });
                // 上报订阅流的操作日志
                _that.reportOperationLog('subscribe', {streamId: data.stream_id, userId: data.user_id});
                _that.addEventListener('subscribeerror', function (e) {
                    // 上报订阅流的异常日志
                    _that.reportExceptionLog('subscribe', {streamId: data.stream_id, userId: data.user_id});
                    reject(e.rsp)
                })
                _that.addEventListener('subscribe', function (e) {
                    _that.getSubscribe(e);
                    resolve(e);

                });
            } else if (role_type == 0) {
                reject('not allow subscribe')
            }

        })
    }

    sdpPub(data) {
        this.send('sdp', data);
        this.addEventListener('sdpPub', this.getSdppub);
    }

    sdpScb(data) {
        this.send('sdp', data);
        this.addEventListener('sdpScb', this.getSdpscb);
    }
    getUserst(data) {
        let userstData = data.rsp.data;
        const _that = this;
        if (userstData.cmdtype == 1) {
            let event = new Event('userJoin', {
                'bubbles': true
            });
            // event.videoId = videoId;
            // event.closeUserId = closeUserId;
            event.userId = userstData.user_id;
            this.dispatchEvent(event);
        } else if (userstData.cmdtype == 2) {

            let event = new Event('userLeave', {
                'bubbles': true
            });
            // event.videoId = videoId;
            event.userId = userstData.user_id;
            this.dispatchEvent(event);

            // for (let k of Object.keys(_that)) {
            //     if (k==='scbMap') {
            //         console.log(_that[k])
            //         for (let i in _that[k]) {
            //             _that[k][i].pc.close();
            //             delete _that[k][i];
            //         }
            //         // this.scbMap[req.data.src.stream_id].pc.close();
            //         // _that[k].close();
            //     }
            // }
        }

    }

    send(method, data) {
        const _that = this;
        this.waitForConnection(function () {
            //console.log()
            let rpcid = _that.rpcId(Date.now());
            let req = {
                method: method,
                version: RPCVersion,
                userAgent:navigator.userAgent,
                rpc_id: rpcid,
                data: data
            }
            _that.rpcmap[rpcid] = req

            let msg = JSON.stringify(req);
            _that.ws.send(msg);

        }, 1000);
    }

    waitForConnection(callback, interval) {
        if (this.ws.readyState === 1) {
            callback();
        } else {
            let that = this;
            // optional: implement backoff for interval here
            setTimeout(function () {
                that.waitForConnection(callback, interval);
            }, interval);
        }
    }

    //心跳
    keepalive() {
        this.send('ping', {});
    }
    //本地流
    activeMute(data) {
        // this.send('mute', data);
        // this.addEventListener('mute', this.getActiveMute);
        const _that = this;
        return new Promise(function (resolve, reject) {
            _that.send('mute', data)
            _that.addEventListener('muteerror', function (e) {
                reject(e.rsp)
            })
            _that.addEventListener('mute', function (e) {
                _that.getActiveMute(e);
                resolve('mute success');

            });
        })
    }

    //录制
    startRecord(config){
        const _that = this;
        this.dataList.recording = true;
        let data = {
            room_id: this.dataList.room_id,
            app_id: this.dataList.app_id,
            user_id: this.dataList.user_id,
            config: config
        }
        return new Promise(function (resolve, reject) {
            _that.send('startrecord', data)
            // 上报开始录制的操作日志
            _that.reportOperationLog('startRecord');
            _that.addEventListener('startrecorderror', function (e) {
                // 上报录制转码失败的异常日志
                _that.reportExceptionLog('startRecord error');
                reject(e.rsp)
            })
            _that.addEventListener('startrecord', function (e) {
                // _that.getStartRecord(e);
                resolve(e.rsp);
                // resolve('start recording...');

            });
        })
    }
    getStartRecord(e){
        console.log('getActiveRecord',e)
        log('getActiveRecord',e)
    }
    //录制
    stopRecord(){
        const _that = this;
        this.dataList.recording = false;
        let data = {
            room_id: this.dataList.room_id,
            app_id: this.dataList.app_id,
            user_id: this.dataList.user_id
        }
        return new Promise(function (resolve, reject) {
            _that.send('stoprecord', data)
            // 上报开始录制的操作日志
            _that.reportOperationLog('stopRecord');
            _that.addEventListener('stoprecorderror', function (e) {
                // 上报录制转码失败的异常日志
                _that.reportExceptionLog('stopRecord error');
                reject(e.rsp)
            })
            _that.addEventListener('stoprecord', function (e) {
                // _that.getStartRecord(e);
                resolve('stop recording');

            });
        })
    }
    //////////////
    recvMsgHandler(req, rsp) {
       console.log('recvMsgHandlerreq',req)
       console.log('recvMsgHandlerrsp',rsp)
        let event = null;
        if (req === undefined) {
            switch (rsp.method) {
                case 'streamst':
                    // completed
                    if (rsp.data.cmdtype === 1) {
                        event = new Event('newPublish', {
                            'bubbles': true
                        })
                        event.rsp = rsp;
                        this.dispatchEvent(event);
                    }
                    //disconnected
                    if (rsp.data.cmdtype === 2) {
                        event = new Event('unPublish', {
                            'bubbles': true
                        })
                        event.rsp = rsp;
                        this.dispatchEvent(event);
                    }
                    break
                case 'transportclose':
                    event = new Event('transportclose', {
                        'bubbles': true
                    })
                    event.rsp = rsp;
                    this.dispatchEvent(event);
                    break;
                case 'trackst':
                    if (rsp.data.mute === true) {
                        event = new Event('getTrackst', {
                            'bubbles': true
                        })
                        event.rsp = rsp;
                        this.dispatchEvent(event);
                    } else {
                        event = new Event('outTrackst', {
                            'bubbles': true
                        })
                        event.rsp = rsp;
                        this.dispatchEvent(event);
                    }
                    break;
                case 'userst':
                    event = new Event('getUserst', {
                        'bubbles': true
                    })
                    event.rsp = rsp;
                    this.dispatchEvent(event);
                    break;
            }
        } else {
            switch (req.method) {
                case 'joinroom':
                    try {
                        if (rsp.err === 0) {
                           console.log(this)
                           log(this)
                            this.users = rsp.data.users;
                            this.streams = rsp.data.streams;
                            this.dispatchEvent(new Event('joinroom', {
                                'bubbles': true
                            }));
                        } else {
                           console.log(`joinroom error: ${rsp.msg}`);
                           log(`joinroom error: ${rsp.msg}`);
                            event = new Event('joinroomerror', {
                                'bubbles': true
                            })
                            event.rsp = rsp;
                            this.dispatchEvent(event);
                        }
                    } catch (e) {
                       console.log(`joinroom catch error: ${e}`);
                       log(`joinroom catch error: ${e}`);
                        event = new Event('joinroomerror', {
                            'bubbles': true
                        }) 
                        event.rsp = e;
                        this.dispatchEvent(event);
                    }
                    break;
                case 'leaveroom':
                    try {
                        if (rsp.err === 0) {
                            console.log('leaveroom1')
                            this.dispatchEvent(new Event('leaveroom', {
                                'bubbles': true
                            }));
                        } else {
                           console.log(`leaveroom error: ${rsp.msg}`);
                           log(`leaveroom error: ${rsp.msg}`);
                            event = new Event('leaveroomerror', {
                                'bubbles': true
                            })
                            event.rsp = rsp;
                            this.dispatchEvent(event);
                        }
                    } catch (e) {
                       console.log(`leaveroom catch error: ${e}`);
                       log(`leaveroom catch error: ${e}`);
                        event = new Event('leaveroomerror', {
                            'bubbles': true
                        })
                        event.rsp = e;
                        this.dispatchEvent(event);
                    }
                    break;
                case 'publish':
                    try {
                        if (rsp.err === 0) {
                            this.dataList.stream_id = rsp.data.stream_id;
                            this.dispatchEvent(new Event('publish', {
                                'bubbles': true
                            }));
                        } else {
                           console.log(`publish error: ${rsp.msg}`);
                           log(`publish error: ${rsp.msg}`);
                            event = new Event('publisherror', {
                                'bubbles': true
                            })
                            event.rsp = rsp;
                            this.dispatchEvent(event);
                        }
                    } catch (e) {
                       console.log(`publish catch error: ${e}`);
                       log(`publish catch error: ${e}`);
                        event = new Event('publisherror', {
                            'bubbles': true
                        })
                        event.rsp = e;
                        this.dispatchEvent(event);
                    }
                    break;
                case 'subscribe':
                    try {
                        if (rsp.err === 0) {
                            event = new Event('subscribe', {
                                'bubbles': true
                            });
                            event.req = req;
                            event.rsp = rsp;
                            this.dispatchEvent(event);
                        } else {
                           console.log(`subscribe error: ${rsp.msg}`);
                           log(`subscribe error: ${rsp.msg}`);
                            event = new Event('subscribeerror', {
                                'bubbles': true
                            })
                            event.rsp = rsp;
                            this.dispatchEvent(event);
                        }
                    } catch (e) {
                       console.log(`subscribe catch error: ${e}`);
                       log(`subscribe catch error: ${e}`);
                        event = new Event('subscribeerror', {
                            'bubbles': true
                        })
                        event.rsp = e;
                        this.dispatchEvent(event);
                    }
                    break;
                case 'sdp':
                    //stream_type 1 发布流 2 订阅流
                    // const streamTypePub = 1
                    // const streamTypeScb = 2
                    try {
                        let streamType = req.data.src.stream_type;
                        if (rsp.err === 0) {
                            let event = null;
                            switch (streamType) {
                                case streamTypePub:
                                    event = new Event('sdpPub', {
                                        'bubbles': true
                                    });
                                    event.pubAnswer = rsp.data.sdp.sdpcontent;
                                    this.dispatchEvent(event);
                                    break
                                case streamTypeScb:
                                    event = new Event('sdpScb', {
                                        'bubbles': true
                                    });
                                    event.scbAnswer = rsp.data.sdp.sdpcontent;
                                    event.scbStreamId = req.data.src.stream_id;
                                    this.dispatchEvent(event);
                                    break
                            }
                        } else {
                            if (streamType === streamTypeScb) {
                                this.scbMap[req.data.src.stream_id].pc.close();
                               console.log(`${req.data.src.stream_id} local peer connection close`)
                               log(`${req.data.src.stream_id} local peer connection close`)
                            }
                           console.log(`sdp error: ${rsp.msg}`);
                           log(`sdp error: ${rsp.msg}`);
                        }
                    } catch (e) {
                       console.log(`sdp error: ${e}`);
                       log(`sdp error: ${e}`);
                    }
                    break;
                case 'mute':
                    try {
                        if (rsp.err === 0) {
                            event = new Event('mute', {
                                'bubbles': true
                            });
                            event.req = req;
                            event.rsp = rsp;
                            this.dispatchEvent(event);

                        } else {
                           console.log(`mute error: ${rsp.msg}`);
                           log(`mute error: ${rsp.msg}`);
                            event = new Event('muteerror', {
                                'bubbles': true
                            })
                            event.rsp = rsp;
                            this.dispatchEvent(event);
                        }
                    } catch (e) {
                       console.log(`mute catch error: ${e}`);
                       log(`mute catch error: ${e}`);
                        event = new Event('muteerror', {
                            'bubbles': true
                        })
                        event.rsp = e;
                        this.dispatchEvent(event);
                    }
                    break;
                    case 'startrecord':
                        try {
                            if (rsp.err === 0) {
                                event = new Event('startrecord', {
                                    'bubbles': true
                                });
                                event.req = req;
                                event.rsp = rsp;
                                this.dispatchEvent(event);
    
                            } else {
                               console.log(`startrecord error: ${rsp.msg}`);
                               log(`startrecord error: ${rsp.msg}`);
                                event = new Event('startrecorderror', {
                                    'bubbles': true
                                })
                                event.rsp = rsp;
                                this.dispatchEvent(event);
                            }
                        } catch (e) {
                           console.log(`startrecord catch error: ${e}`);
                           log(`startrecord catch error: ${e}`);
                            event = new Event('startrecorderror', {
                                'bubbles': true
                            })
                            event.rsp = e;
                            this.dispatchEvent(event);
                        }
                        break;
                        case 'stoprecord':
                            try {
                                if (rsp.err === 0) {
                                    event = new Event('stoprecord', {
                                        'bubbles': true
                                    });
                                    event.req = req;
                                    event.rsp = rsp;
                                    this.dispatchEvent(event);
        
                                } else {
                                   console.log(`stoprecord error: ${rsp.msg}`);
                                   log(`stoprecord error: ${rsp.msg}`);
                                    event = new Event('stoprecorderror', {
                                        'bubbles': true
                                    })
                                    event.rsp = rsp;
                                    this.dispatchEvent(event);
                                }
                            } catch (e) {
                               console.log(`stoprecord catch error: ${e}`);
                               log(`stoprecord catch error: ${e}`);
                                event = new Event('stoprecorderror', {
                                    'bubbles': true
                                })
                                event.rsp = e;
                                this.dispatchEvent(event);
                            }
                            break;
            }
        }
    }


    getNewPublish(e) {
        let stream = e.rsp.data.stream;
        // this.subscribe({
        //     src: {
        //         user_id: this.dataList.user_id,
        //         audio: stream.audio,
        //         video: stream.video,
        //         data: stream.data
        //     },
        //     dst: {
        //         user_id: e.rsp.data.user_id,
        //         stream_id: stream.sid,
        //         media_type: stream.media_type
        //     }
        // })
        this.subscribe({
            user_id: e.rsp.data.user_id,
            stream_id: stream.sid,
            media_type: stream.media_type
        }, {
            audio_enable: stream.audio,
            video_enable: stream.video,
        })
        this.dispatchEvent(new Event('streamJoin', {
            'bubbles': true
        }));
    }


    getTransportClose(e) {
        let closeUserId = e.rsp.data.user_id;
        let videoId;
        let subId;
       console.log('getTransportClose')
       console.log(e)
       console.log(this.scbMap)
        for (let sid in this.scbMap) {
            let stream = this.scbMap[sid];
            if (stream.dstUserId === closeUserId) {
                videoId = stream.videoId;
                subId = stream.subId;
            }
        }

        if (subId != undefined) {
            delete this.scbMap[subId];
        }

        if (videoId !== undefined) {
            for (let vid of this.videoIds) {
                if (vid.id === videoId) {
                    vid.status = 'init';
                }
            }
            // document.getElementById(videoId).querySelector('video').srcObject = null;
            // document.getElementById(videoId).style.display = 'none';
            let event = new Event('streamLeave', {
                'bubbles': true
            });
            event.videoId = videoId;
            event.closeUserId = closeUserId;
            this.dispatchEvent(event);
        }
    }


    getRoomJoin(data) {
        const _that = this;
        console.log(this)
        
        this.publish({
            user_id: this.dataList.user_id,
            media_type: this.dataList.media_type,
            audio: this.dataList.audio_enable,
            video: this.dataList.video_enable,
            data: this.dataList.data_enable
        })
        return new Promise(function (resolve, reject) {
            if (_that.users && _that.users.length === 0) {
               console.log('only me in this room', _that.dataList.room_id);
               log('only me in this room', _that.dataList.room_id);
            } else if (_that.streams) {
                for (let stream of _that.streams) {
                    _that.subscribe({
                        user_id: stream.uid,
                        stream_id: stream.sid,
                        media_type: stream.media_type
                    }, {
                        audio_enable: _that.dataList.audio_enable,
                        video_enable: _that.dataList.video_enable,
                    })
                }
            }
        })


    }

    getActiveMute(e) {
        //console.log(e)
        const trackType = e.rsp.data.track_type;
        let trackKind;

        switch (trackType) {
            case 1:
                trackKind = 'audio';
                break
            case 2:
                trackKind = 'video';
                break
        }
        // this.videoEnable = false;
        if (trackType === 1) {
            this.dataList.audio_enable = !e.rsp.data.mute;
        } else if (trackType === 2) {
            this.dataList.video_enable = !e.rsp.data.mute;
        }
       console.log(this.pc0)
        try {
            this.pc0._shimmedLocalStreams[this.localStream.id].map(e => {
                if (e.track && e.track.kind === trackKind) {
                    e.track.enabled = !e.track.enabled;
                }
            })
        } catch (e) {
           console.log(`stream error: ${e}`);
        }
    }
    getTrackst(e) {
       console.log(this)
    }
    outTrackst(e) {
       console.log(this)
    }
    getLocalStream(obj) {
        const _that = this;

        if (Object.keys(obj).lenght !== 0) {
            this.dataList.video_enable = obj.video_enable;
            this.dataList.audio_enable = obj.audio_enable;
            this.dataList.media_type = obj.media_type;
            switch (obj.media_data) {
                case 'videoProfile240*180':
                    this.dataList.resolution = {
                        width: {
                            ideal: 240
                        },
                        height: {
                            ideal: 180
                        },
                        frameRate: {
                            max: 20
                        }
                    };
                    this.dataList.videoBandwidth = 200;
                    this.dataList.audioBandwidth = 200;
                    break;
                case 'videoProfile480*360':
                    this.dataList.resolution = {
                        width: {
                            ideal: 480
                        },
                        height: {
                            ideal: 360
                        },
                        frameRate: {
                            max: 20
                        }
                    };
                    this.dataList.videoBandwidth = 400;
                    this.dataList.audioBandwidth = 400;
                    break;
                case 'videoProfile640*360':
                    this.dataList.resolution = {
                        width: {
                            ideal: 640
                        },
                        height: {
                            ideal: 360
                        },
                        frameRate: {
                            max: 20
                        }
                    };
                    this.dataList.videoBandwidth = 400;
                    this.dataList.audioBandwidth = 400;
                    break;
                case 'videoProfile640*480':
                    this.dataList.resolution = {
                        width: {
                            ideal: 640
                        },
                        height: {
                            ideal: 480
                        },
                        frameRate: {
                            max: 20
                        }
                    };
                    this.dataList.videoBandwidth = 400;
                    this.dataList.audioBandwidth = 400;
                    break;
                case 'videoProfile1280*720':
                    this.dataList.resolution = {
                        width: {
                            ideal: 1280
                        },
                        height: {
                            ideal: 720
                        },
                        frameRate: {
                            max: 20
                        }
                    };
                    this.dataList.videoBandwidth = 400;
                    this.dataList.audioBandwidth = 400;
                    break;
                case 'videoProfile1280*720':
                    this.dataList.resolution = {
                        width: {
                            ideal: 1280
                        },
                        height: {
                            ideal: 720
                        },
                        frameRate: {
                            max: 20
                        }
                    };
                    this.dataList.videoBandwidth = 1000;
                    this.dataList.audioBandwidth = 1000;
                    break;
                case 'videoProfile1920*1080':
                    this.dataList.resolution = {
                        width: {
                            ideal: 1920
                        },
                        height: {
                            ideal: 1080
                        },
                        frameRate: {
                            max: 20
                        }
                    };
                    this.dataList.videoBandwidth = 400;
                    this.dataList.audioBandwidth = 400;
                    break;
            }
        }

        const promise = new Promise(function (resolve, reject) {
            // res['frameRate'] = {'max': _that.dataList.frameRate};
            navigator.mediaDevices.getUserMedia({
                audio: _that.dataList.audio_enable,
                video: _that.dataList.video_enable,
                video: _that.dataList.resolution,
                video: {deviceId: _that.dataList.deviceId ? {exact: _that.dataList.deviceId} : undefined}
            }).then(function (stream) {
                resolve(stream);
                _that.localStream = stream;
               console.log('Received local stream', stream);
                // let event = new Event('loadVideo', {'bubbles': true});
                // event.user_id = _that.dataList.user_id;
                // // event.num = 0;
                // _that.dispatchEvent(event);
            }).catch(function (e) {
               console.log('getLocalStreamError')
               console.log(e)
               console.log(e.name)
               console.log(e.message)
               console.log(e.code)
                reject(e)
            })
        })
        return promise;
    }

    getLocalDevices() {
        // let enumerateDevices = navigator.mediaDevices.enumerateDevices();
        const enumerateDevices = new Promise(function (resolve, reject) {
            navigator.mediaDevices.enumerateDevices().then(function (e) {
               console.log(e);
                resolve(e);
            })
        })
        return enumerateDevices;
    }

    getAudioVolum() {
        const volum = new Promise(function (resolve, reject) {
            navigator.mediaDevices.enumerateDevices().then(function (e) {
                navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false
                }).then(function (stream) {
                    let audioContext = new AudioContext();
                    let audioScript = audioContext.createScriptProcessor(2048, 1, 1);
                    let instant = 0.0;
                    const that = this;
                    audioScript.onaudioprocess = function (event) {
                        const input = event.inputBuffer.getChannelData(0);
                        let i;
                        let sum = 0.0;
                        let clipcount = 0;
                        for (i = 0; i < input.length; ++i) {
                            sum += input[i] * input[i];
                            if (Math.abs(input[i]) > 0.99) {
                                clipcount += 1;
                            }
                        }
                        instant = Math.sqrt(sum / input.length);
                        //console.log(instant);
                        resolve(instant);
                    };

                    let mic = audioContext.createMediaStreamSource(stream);
                    mic.connect(audioScript);
                    // let analyser = audioContext.createAnalyser();//分析器
                    audioScript.connect(audioContext.destination);
                })
            })
        })
        return volum;
    }
    //获取实时track数据
    getTStatus() {
        let myPeerConnection = this.pc0;
        const _that = this;
        const statePromise = new Promise(function (resolve, reject) {
            if (myPeerConnection) {
                myPeerConnection.getStats(null).then(results => {
                    const statsString = dumpOldStats(results);
                    console.log(statsString);
                    _that.streamInfo = statsString;
                    _that.localStreamDetailStyle = statsString
                    resolve(statsString)
                })
            } else {
                reject('stream is none');
            }
        })
        return statePromise

    }
    async getPublish() {
       console.log('Requesting local stream resolution', JSON.stringify(this.dataList.resolution));
        try {
            // let localStream;
            // // let localStream = Promise.resolve(this.getLocalStream({}));
            // this.getLocalStream({}).then(function(data){
            //     localStream = data;
            // })
            const _that = this;
            let pc0 = new RTCPeerConnection({
                sdpSemantics: "plan-b"
            });
            this.pc0 = pc0;

            // 获取pc0同时载入详情
            this.getLocalStreamDetail();
            log('Created local peer connection object pc0');

            pc0.addEventListener('iceconnectionstatechange', e => this.onIceStateChange(pc0, e));
            this.localStream.getTracks().forEach(track => pc0.addTrack(track, this.localStream));
           console.log('Added local stream to pc0');
           console.log('createOffer start');
            pc0.offer = await pc0.createOffer(offerOptions);

            // let modifier = 'AS';
            // let videoBandwidth = this.dataList.videoBandwidth;
            // if (adapter.browserDetails.browser === 'firefox') {
            //     videoBandwidth = (videoBandwidth >>> 0) * 1000;
            //     modifier = 'TIAS';
            // }
            // if (pc0.offer.sdp.indexOf('b=' + modifier + ':') === -1) {
            //     // insert b= after c= line.
            //     pc0.offer.sdp = pc0.offer.sdp.replace(/c=IN (.*)\r\n/, 'c=IN $1\r\nb=' + modifier + ':' + videoBandwidth + '\r\n');
            // } else {
            //     pc0.offer.sdp = pc0.offer.sdp.replace(new RegExp('b=' + modifier + ':.*\r\n'), 'b=' + modifier + ':' + videoBandwidth + '\r\n');
            // }
            //console.log(pc0)
            pc0.offer.sdp = pc0.offer.sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + this.dataList.videoBandwidth + '\r\n');
            pc0.offer.sdp = pc0.offer.sdp.replace(/a=mid:1\r\n/g, 'a=mid:1\r\nb=AS:' + this.dataList.videoBandwidth + '\r\n');
            //console.log('pc0.offer')
            //console.log(pc0.offer)
            await _that.onCreateOfferSuccess(pc0, 'publish');
            // pc0.createOffer(offerOptions).then(function(data){
            //     pc0.offer = data;
            //     pc0.offer.sdp = pc0.offer.sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + _that.dataList.videoBandwidth + '\r\n');
            //     pc0.offer.sdp = pc0.offer.sdp.replace(/a=mid:1\r\n/g, 'a=mid:1\r\nb=AS:' + _that.dataList.videoBandwidth + '\r\n');
            //     _that.onCreateOfferSuccess(pc0, 'publish');
            // })
        } catch (e) {
           console.log(`getPublish error: ${e}`);
        }
    }


    async getSubscribe(e) {
        let subId = e.rsp.data.streamsub_id;
        let pc = new RTCPeerConnection({
            sdpSemantics: "plan-b"
        })
        let scbStream = {
            pc: pc,
            dstUserId: e.req.data.dst.user_id,
            dstStreamId: e.req.data.dst.stream_id,
            dstMediaType: e.req.data.dst.media_type,
            subId: subId
        }
        this.scbMap[subId] = scbStream;
        
        //拉流详情信息
        this.getPullStreamDetail();
        log(`${subId} created local peer connection`);
        pc.addEventListener('iceconnectionstatechange', e => this.onIceStateChange(pc, e));
        pc.addEventListener('track', e => {
            this.getRemoteStream(subId, e)
        });

        try {
           console.log('createOffer start');
            pc.offer = await pc.createOffer(offerOptions);

            // pc.offer.sdp = pc.offer.sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + this.dataList.videoBandwidth + '\r\n');
            // pc.offer.sdp = pc.offer.sdp.replace(/a=mid:1\r\n/g, 'a=mid:1\r\nb=AS:' + this.dataList.videoBandwidth + '\r\n');
            await this.onCreateOfferSuccess(pc, 'subscribe', e.rsp);
        } catch (e) {
            this.onCreateSessionDescriptionError(e);
        }
    }


    getRemoteStream(subId, e) {
        const _that = this;
        let videosId = [];
        
        const promise = new Promise(function (resolve, reject) {
            let scbStream = _that.scbMap[subId];
            if (scbStream.videoId === undefined) {
                for (let i in _that.videoIds) {
                    _that.videoIds.push({
                        id: scbStream.subId
                    });
                }
               console.log(scbStream.subId)
                scbStream.videoId = scbStream.subId;
                _that.scbStreams[subId] = e;
                resolve(e.streams[0]);
                let event = new Event('loadVideo', {
                    'bubbles': true
                });
                event.userId = scbStream.dstUserId;
                //box1 idx is 0 so add 1
                event.num = _that.videoIds.length + 1;
                event.stream = e.streams[0];
                _that.dispatchEvent(event);
            }

        })
        return promise;
    }


    onCreateOfferSuccess(pc, streamType, rsp) {
        const _that = this;
        Promise.resolve(pc.offer).then(function (data) {
            pc.offer = data;
            if (pc.offer === undefined) {
                return;
            }
            try {
                pc.setLocalDescription(pc.offer);
                _that.onSetLocalSuccess(pc);
            } catch (e) {
                _that.onSetSessionDescriptionError();
            }
           console.log(streamType)
           console.log(234)
            if (streamType === 'publish') {
                _that.sdpPub({
                    src: {
                        user_id: _that.dataList.user_id,
                        stream_id: _that.dataList.stream_id,
                        stream_type: streamTypePub,
                        media_type: _that.dataList.media_type
                    },
                    sdp: {
                        type: 'offer',
                        sdpcontent: pc.offer.sdp
                    }
                });
            }

            if (streamType === 'subscribe') {
                _that.sdpScb({
                    src: {
                        user_id: rsp.data.user_id,
                        stream_id: rsp.data.streamsub_id,
                        stream_type: streamTypeScb,
                        media_type: rsp.data.media_type
                    },
                    sdp: {
                        type: 'offer',
                        sdpcontent: pc.offer.sdp
                    }
                });
            }
        });
    }

    getSdppub(e) {
        this.getAnswer(e.pubAnswer, this.pc0, 'pc0')
    }

    getSdpscb(e) {
        let pc = this.scbMap[e.scbStreamId].pc
        this.getAnswer(e.scbAnswer, pc, e.scbStreamId)
    }


    getAnswer(sdp, pc, pcname) {
        let answer = new RTCSessionDescription();
        answer.type = 'answer';
        answer.sdp = sdp;
        answer.sdp = answer.sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + this.dataList.videoBandwidth + '\r\n');
        answer.sdp = answer.sdp.replace(/a=mid:1\r\n/g, 'a=mid:1\r\nb=AS:' + this.dataList.videoBandwidth + '\r\n');
       console.log(`setRemoteDescription start`, answer);
        try {
            pc.setRemoteDescription(answer);
            this.onSetRemoteSuccess(pcname);
        } catch (e) {
            this.onSetSessionDescriptionError(e);
        }
    }


    onSetRemoteSuccess(pc) {
       console.log(`setRemoteDescription complete`);
        const _that = this;
        intervalId = setInterval(function () {
            _that.keepalive();
        }, 1000 * 60 * 3);
    }

    onSetSessionDescriptionError(error) {
       console.log(`Failed to set session description:`, error);
    }

    onCreateSessionDescriptionError(error) {
       console.log('Failed to create session description :', error);
    }

    onSetLocalSuccess(pc) {
       console.log(`setLocalDescription complete`);
    }

    onSetSessionDescriptionError(error) {
       console.log(`Failed to set session description:`, error);
    }

    onIceStateChange(pc, event) {
        if (pc) {
           console.log(`ICE state: ${pc.iceConnectionState}`);
           console.log('ICE state change event: ', event);
        }
    }


    addEventListener(type, callback) {
        this.listeners[type] = [];
        this.listeners[type].push(callback);
        // if (!(type in this.listeners)) {
        //     this.listeners[type] = [];
        // }
        // if (this.listeners[type].length === 0) {
        //     this.listeners[type].push(callback);
        // }
    };

    removeEventListener(type, callback) {
        if (!(type in this.listeners)) {
            return;
        }
        var stack = this.listeners[type];
        for (var i = 0, l = stack.length; i < l; i++) {
            if (stack[i] === callback) {
                stack.splice(i, 1);
                return;
            }
        }
    };

    dispatchEvent(event) {
        if (!(event.type in this.listeners)) {
            return true;
        }
        var stack = this.listeners[event.type].slice();
        for (var i = 0, l = stack.length; i < l; i++) {
            stack[i].call(this, event);
        }
        return !event.defaultPrevented;
    };

    randNum(l) {
        let S = '0123456789abcdef';
        let s = '';
        for (let n = 0; n < l; ++n) {
            s = s + S.charAt(Math.floor((Math.random() * 100) % 16));
        }
        return s;
    };

    getPullStreamDetail() {
        let old_stream = {};
        let _that = this;
        const list = this.scbMap;
        const scbMapDetail = {};

        setInterval(function () {
            if (_that.monitorFlag) {
                let newData = {};
                let arr = Object.keys(list);
                arr.map((key, index) => {
                    list[key].pc.getStats(results => {
                        let config;
                        const statsString = dumpOldStats(results);
                        newData[key] = statsString;
                        if (old_stream.hasOwnProperty(key)) {
                            config = stramDataTransDisplay(old_stream[key], statsString, 'pull');
                        } else {
                            config = stramDataTransDisplay([], statsString, 'pull');
                        }
                        scbMapDetail[key] = config;
                        // 拉流信息
                        _that.dataList.monitor_map[key] = config
                        // _that.sendLogsHistory(config, list[key].dstStreamId, list[key].dstUserId);
                        _that.reportStatusLog(list[key].dstStreamId, 2, config,{userId: list[key].dstUserId}); // 上报订阅流的状态日志
                        old_stream[key] = statsString;
                        if (index == arr.length - 1) {
                            return scbMapDetail
                            // fn(scbMapDetail);
                        }
                    })
                })
            } else {
                // console.error('暂无流信息')
            }
        }, 3000)
    }

    getLocalStreamDetail() {
        let old_stream = null;
        let _that = this;
        setInterval(function () {
            if (_that.monitorFlag) {
                let newData = null;
                _that.pc0.getStats(results => {
                    const statsString = dumpOldStats(results);
                    newData = statsString;
                    let config = stramDataTransDisplay(old_stream, newData, 'push');
                    // _that.sendLogsHistory(config, _that.dataList.stream_id, _that.dataList.user_id);
                    _that.reportStatusLog(_that.dataList.stream_id, 1, config); // 上报发布流的状态日志
                    // 监控本地流数据赋值
                    _that.dataList.monitor_map.local = config
                    old_stream = newData;
                })
            } else {
                // console.error('暂无流信息')
            }
        }, 3000)
    }

    getMonitor(streamId){
        let obj = this.dataList.monitor_map;
        let id = streamId || 'local';
        if (obj[id]) {
            return obj[id]
        } else {
            // console.error('strem not ready')
        }
    }

    // sendLogsHistory(data, streamId, userId) {
    //     let temp = {
    //         "method": "logup",
    //         "version": "3.9",
    //         "rpc_id": this.rpcId(Date.now()),
    //         "mtype": 1,
    //         "type": 1,
    //         "stype": 1,
    //         "ts": 111,
    //         "aid": "aid1",
    //         "rid": "rid1",
    //         "sid": "sid1",

    //         "uid": userId,
    //         "streamid": streamId,
    //         "data": {
    //             "rtt": data.rtt,
    //             "delay": data.delay,
    //             "audio": {
    //                 "br": data.audio.br ? data.audio.br : 0,
    //                 "lostpre": data.audio.lostpre ? data.audio.lostpre : 0,
    //                 "vol": 0,
    //                 "mime": "opus"
    //             },
    //             "video": {
    //                 "br": data.video.br ? data.video.br : 0,
    //                 "lostpre": data.video.lostpre ? data.video.lostpre : 0,
    //                 "frt": data.video.frt,
    //                 "w": data.video.w ? data.video.w : 0,
    //                 "h": data.video.h ? data.video.h : 0,
    //                 "mime": "opus"
    //             }
    //         }
    //     }
    //     let url = 'https://log.urtc.com.cn/api/rtcClinetLog';
    //     postData(url, temp);
    // }
    // 日志上报
    // 加入/离开房间的日志上报
    reportRoomLog(type) {
        let _type = 0;
        let _streamId = '';
        let _stype = -1;
        let _mtype = -1;
        switch (type) {
            case 'joinRoom':
                _type = 1;
                _streamId = '';
                _stype = -1;
                _mtype = -1;
                break;
            case 'leaveRoom':
                _type = 3;
                _streamId = '';
                _stype = -1;
                _mtype = -1;
                break;
            default:
                console.warn('unknown action type ', type)
                return;
        }

        let logData = {
            version: '1.0',
            method: 'logup',
            rpc_id: this.rpcId(Date.now()),
            type: _type, // 1 通话开始，2 通话状态，3 通话结束
            ts: Math.round(Date.now() / 1000), // UNIX timestamp
            aid: 'developer1', // ?? 开发者ID
            rid: this.dataList.room_id,
            sid: 'sid', // ?? todo - 通话标识
            uid: this.dataList.user_id,
            streamid: _streamId, // 流的标识
            stype: _stype, // 1: 发布流，2: 订阅流
            mtype: _mtype, // 1: 摄像头，2: 桌面流
            data: {
                sdkv: sdkVersion,
                agent: `web_${getBrowserName()}`,
                device: '',
                system: navigator.platform,
                network: '',
                cpu: '', // navigator.oscpu
                mem: navigator.deviceMemory || 0,
                micphone: 1,
                speaker: 1,
                video: 1
            }
        }
        let url = logUrl + `/api/rtcJoinLeaveClientLog`;
        postData(url, logData);
    }
    // 流状态日志上报
    // userId 被订阅的用户标识 只针对订阅流有效
    reportStatusLog(streamId, stype, data, opts) {
        try{
              const {
                  userId
              } = opts || {};
              let mtype = 1; // 默认 摄像头
              let logData = {
                  version: '1.0',
                  method: 'logup',
                  rpc_id: this.rpcId(Date.now()),
                  type: 2, // 1 通话开始，2 通话状态，3 通话结束
                  ts: Math.round(Date.now() / 1000), // UNIX timestamp
                  aid: 'developer1', // ?? 开发者ID
                  rid: this.dataList.room_id,
                  sid: 'sid', // ?? todo - 通话标识
                  uid: this.dataList.user_id,
                  streamid: streamId || '', // 流的标识
                  stype: stype, // 1: 发布流，2: 订阅流
                  mtype: mtype, // 1: 摄像头，2: 桌面流
                  data: {
                      userid: stype === 2 ? userId || '' : '',
                      streamid: stype === 2 ? streamId || '' : '',
                      rtt: parseInt(data.rtt ? data.rtt : 0, 10),
                      delay: parseInt(data.delay ? data.delay : 0, 10),
                      audio: {
                          br: parseInt(data.audio.br ? data.audio.br : 0, 10),
                          lostpre: parseInt(data.audio.lostpre ? data.audio.lostpre : 0, 10),
                          vol: 0, // todo ??
                          mime: "opus"
                      },
                      video: {
                          br: parseInt(data.video.br ? data.video.br : 0, 10),
                          lostpre: parseInt(data.video.lostpre ? data.video.lostpre : 0, 10),
                          frt: parseInt(data.video.frt ? data.video.frt : 0, 10),
                          w: parseInt(data.video.w ? data.video.w : 0, 10),
                          h: parseInt(data.video.h ? data.video.h : 0, 10),
                          mime: "vp8"
                      },
                      cpu: 0,
                      memory: 0
                  }
              }
              let url = logUrl + `/api/rtcClinetLog`;
              postData(url, logData);
        }catch(error){
            console.error(error)
        }
    }
    // 错误日志上报
    // userId 被订阅的用户标识 只针对订阅流有效
    reportExceptionLog(errType, opts) {
        const {
            streamId,
            userId
        } = opts || {};
        const errorTypeMap = {
            publish: 1, // 推流失败
            subscribe: 2, // 拉流失败
            getCameras: 3, // 获取摄像头失败
            getMicrophones: 4, // 获取麦克风失败
            getLoudspeakers: 5, // 获取扬声器失败
            highCPU: 6, // 高CPU占用率（超过90%）- 占位
            highLoss: 7, // 高丢包（30%）
            highDelay: 8, // 高延迟（1秒）
            record: 9, // 录制转码失败
            storage: 10, // 录制存储失败
            im: 11, // IM服务不可用
            whiteboard: 12, // 白板服务不可用
            others: 13, // 其他错误
        }
        const types = Object.keys(errorTypeMap);
        let errorType = 13;
        if(types.includes(errType)) {
            errorType = errorTypeMap[errType];
        }

        let stype = -1;
        let mtype = 1; // 默认 摄像头

        let logData = {
            version: '1.0',
            method: 'logup',
            rpc_id: this.rpcId(Date.now()),
            type: 4, // 1 通话开始，2 通话状态，3 通话结束
            ts: Math.round(Date.now() / 1000), // UNIX timestamp
            aid: 'developer1', // ?? 开发者ID
            rid: this.dataList.room_id,
            sid: 'sid', // ?? todo - 通话标识
            uid: this.dataList.user_id,
            streamid: streamId || '', // 流的标识
            stype: stype, // 1: 发布流，2: 订阅流
            mtype: mtype, // 1: 摄像头，2: 桌面流
            data: {
                errorType: errorType,
                userid: errorType === 2 ? userId || '' : '',
                streamid: errorType === 2 ? streamId || '' : ''
            }
        }
        let url = logUrl + `/api/exceptionLog`;
        postData(url, logData);
    }
    // 操作日志上报
    reportOperationLog(operType, opts) {
        const {
            streamId,
            userId,
            recordId
        } = opts || {};
        const operationTypeMap = {
            joinRoom: 1, // 加入房间
            leaveRoom: 2, // 离开房间
            publish: 3, // 开始推流(音频、视频、音视频）
            unpublish: 4, // 结束推流(音频、视频、音视频）
            subscribe: 5, // 开始拉流(音频、视频、音视频）
            unsubscribe: 6, // 结束拉流(音频、视频、音视频）
            unmuteVideo: 7, // 打开摄像头
            muteVideo: 8, // 关闭摄像头
            unmuteAudio: 9, // 打开麦克风
            muteAudio: 10, // 关闭麦克风
            startRecord: 11, // 开启录制
            stopRecord: 12, // 结束录制
        }

        const types = Object.keys(operationTypeMap);
        let operationType;
        if (types.includes(operType)) {
            operationType = operationTypeMap[operType];
        } else {
            return;
        }

        let stype = -1;
        let mtype = 1; // 默认 摄像头


        const needAddUserIdTypes = [ 5,6,7,8,9,10 ];
        const needAddStreamIdTypes = [ 5,6,7,8,9,10 ];
        const needAddRecordIdTypes = [ 11, 12 ];

        let logData = {
            version: '1.0',
            method: 'logup',
            rpc_id: this.rpcId(Date.now()),
            type: 5, // 1 通话开始，2 通话状态，3 通话结束
            ts: Math.round(Date.now() / 1000), // UNIX timestamp
            aid: 'developer1', // ?? 开发者ID
            rid: this.dataList.room_id,
            sid: 'sid', // ?? todo - 通话标识
            uid: this.dataList.user_id,
            streamid: streamId || '', // 流的标识
            stype: stype, // 1: 发布流，2: 订阅流
            mtype: mtype, // 1: 摄像头，2: 桌面流
            data: {
                opertionType: operationType,
                userid: needAddUserIdTypes.includes(operationType) ? userId || '' : '',
                streamid: needAddStreamIdTypes.includes(operationType) ? streamId || '' : '',
                recordid: needAddRecordIdTypes.includes(operationType) ? recordId || '' : ''
            }
        }
        let url = logUrl + `/api/opertionLog`;
        postData(url, logData);
    }
}

function randString(l) {
    var S = '0123456789abcdefghijklmnopqrstuvwxyz';
    var s = '';
    for (var n = 0; n < l; ++n) {
        s = s + S.charAt(Math.floor((Math.random() * 100) % 36));
    };
    return s;
}

function dumpOldStats(results) {
    let statsString = [];
    results.result().forEach((res, index) => {
        let type = {
            type: res.type,
        }
        res.names().forEach(k => {
            type[k] = res.stat(k);
        });
        statsString.push(type);
    });
    return statsString;
}

function stramDataTransDisplay(oldData, newData, type) {
    try{
        let flag = type == 'pull' ? true : false;
        let o = oldData ? filterTargetData(oldData) : {};
        let n = filterTargetData(newData);
        let temp = {
            "rtt": n.googCandidatePair.googRtt,
            "delay": n.VideoBwe.googBucketDelay,
            "audio": {
                "br": 0,
                "lostpre": n.audio.packetsLost / n.audio.packetsReceived,
                "vol": 1,
                "mime": "opus"
            },
            "video": {
                "br": 0,
                "lostpre": n.video.packetsLost / n.video.packetsReceived,
                "frt": n.video.googFrameRateReceived,
                "w": n.video.googFrameWidthReceived,
                "h": n.video.googFrameHeightReceived,
                "mime": "opus"
            }
        };
        if (flag) {
            if (o.video == undefined) {
                return temp;
            } else {
                temp = {
                    "rtt": n.googCandidatePair.googRtt,
                    "delay": n.VideoBwe.googBucketDelay,
                    "audio": {
                        "br": Math.floor((n.audio.bytesReceived  - o.audio.bytesReceived) * 8 / 3000),
                        "lostpre": (n.audio.packetsLost  - o.audio.packetsLost) / (n.audio.packetsReceived  - o.audio.packetsReceived),
                        "vol": 1,
                        "mime": "opus"
                    },
                    "video": {
                        "br": Math.floor((n.video.bytesReceived - o.video.bytesReceived ) * 8 / 3000),
                        "lostpre": (n.video.packetsLost  - o.video.packetsLost) / (n.video.packetsReceived  - o.video.packetsReceived),
                        "frt": n.video.googFrameRateReceived,
                        "w": n.video.googFrameWidthReceived,
                        "h": n.video.googFrameHeightReceived,
                        "mime": "opus"
                    }
                };
                return temp;
            }
        } else {
            // 推流
            if (o.video == undefined) {
                return temp;
            } else {
                // 推流 

                temp = {
                    "rtt": n.googCandidatePair.googRtt,
                    "delay":  n.VideoBwe.googBucketDelay,
                    "audio": {
                        "br": Math.floor((n.audio.bytesSent  - o.audio.bytesSent) * 8 / 3000),
                        "lostpre": n.audio.packetsLost / n.audio.packetsSent,
                        "vol": 1,
                        "mime": "opus"
                    },
                    "video": {
                        "br": Math.floor((n.video.bytesSent - o.video.bytesSent ) * 8 / 3000),
                        "lostpre": n.video.packetsLost / n.video.packetsSent,
                        "frt": n.video.googFrameRateSent,
                        "w": n.video.googFrameWidthSent,
                        "h": n.video.googFrameHeightSent,
                        "mime": "opus"
                    }
                };
                return temp;
            }
        }
    } catch (error) {
        throwError('监控异常');
    }
}

function filterTargetData(data, key) {
    let obj = {}
    data.map((item, index) => {
        if (item.type == 'ssrc' && item.mediaType == 'video') {
            obj.video = item
        }
        if (item.type == 'ssrc' && item.mediaType == 'audio') {
            obj.audio = item
        }
        if (item.type == 'googCandidatePair' && item.googActiveConnection) {
            obj.googCandidatePair = item
        }
        if (item.type == 'VideoBwe') {
            obj.VideoBwe = item
        }
    })
    return obj;
}

// function filterTargetData(data, key) {
//     let type = 'inbound-rtp'
//     let obj = {},
//         stramInfo;
//     data.map((e) => {
//         if (e.type == "stream") {
//             stramInfo = e
//         }
//         if (e.type == "candidate-pair") {
//             obj.candidate = e
//         }
//         // 判断pull流还是push流
//         if (e.type == "inbound-rtp") {
//             type = 'inbound-rtp'
//             obj.type = 'inbound-rtp'
//         } else if (type == "outbound-rtp") {
//             type = 'outbound-rtp'
//             obj.type = 'outbound-rtp'
//         }
//     })
//     if (data.length == 0) {
//         return null
//     }

//     stramInfo.trackIds.map((e) => {
//         let d = data.filter((item) => {
//             return item.id == e
//         })[0];
//         let trackData = data.filter((item) => {
//             return item.trackId == e
//         })[0];
//         let codecId = trackData.codecId

//        console.log(trackData, d);
//         if (d.kind == 'audio') {
//             obj.audioStream = d;
//             obj.audioTrack = trackData;
//             // obj.audioType = typeInfo;

//         } else if (d.kind == 'video') {
//             obj.videoStream = d;
//             obj.videoTrack = trackData;
//             // obj.videoType = typeInfo;

//         }
//     })
//     return obj;
// }

function postData(url, data) {
    return fetch(url, {
            body: JSON.stringify(data), // must match 'Content-Type' header
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            headers: {
                'content-type': 'application/json'
            },
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // *client, no-referrer
        })
        .then(response => response.json()) // parses response to JSON
}

function getBrowserName() {
    var browserName = navigator.userAgent.toLowerCase();
    if (/msie/i.test(browserName) && !/opera/.test(browserName)) {
        return "IE";
    } else if (/firefox/i.test(browserName)) {
        return "Firefox";
    } else if (/chrome/i.test(browserName) && /webkit/i.test(browserName) && /mozilla/i.test(browserName)) {
        return "Chrome";
    } else if (/opera/i.test(browserName)) {
        return "Opera";
    } else if (/webkit/i.test(browserName) && !(/chrome/i.test(browserName) && /webkit/i.test(browserName) && /mozilla/i.test(browserName))) {
        return "Safari";
    } else {
        return "unKnow";
    }
}