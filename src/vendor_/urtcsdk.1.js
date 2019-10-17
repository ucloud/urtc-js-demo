/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-19 15:35:03
 * @LastEditTime: 2019-08-19 15:35:03
 * @LastEditors: your name
 */
'use strict';
/* eslint-disable */
import './adapter-latest'
import adapter from './adapter-latest';
import $ from './jquery-3.3.1';
import {
    Base64
} from './base64';

const RPCVersion = 0.1;
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
//stream_type 1 发布流 2 订阅流
const streamTypePub = 1
const streamTypeScb = 2
let t;
let localStream;


// let URtcEngine;
export class UCloudRtcEngine {
    constructor() {
        this.ws = null;
        this.listeners = {};
        // this.scbStreams = {};
        this.videoIds = [];
        this.rpcmap = {};
        this.rpcid = 10000000;
        this.scbMap = {};
        this.pc0 = null;
        this.addEventListener('newPublish', this.getNewPublish);
        this.addEventListener('transportclose', this.getTransportClose);
        this.addEventListener('getTrackst', this.getTrackst);
        this.addEventListener('outTrackst', this.outTrackst);
        this.dataList = {
            rpc_id: '1', //消息标识符
            session: '1', //占位符
            Data_enable: false, //处理数据流，占位符
            // scbStreams:{}//远端视频信息
            videoBandwidth: 400,
            audioBandwidth: 400
        };
        this.localStream;
        this.handlerFunc = [];
    }
    getUrl(obj) {
        console.log(obj)
        let _that = this;
        const reqUrl = 'https://urtc.com.cn/uteach';
        // const reqUrl = 'https://pre.urtc.com.cn/uteach';
        let getData = {};
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: "get",
                url: reqUrl,
                dataType: "jsonp",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    "Action": "rsusergetroomtoken",
                    "rpc_id": _that.dataList.rpc_id,
                    "user_id": obj.user_id,
                    "room_id": obj.room_id,
                    "app_id": obj.app_id
                },
                success: function (data) {
                    if (data.err == 0) {
                        // _that.dataList.token = data.data.access_token;
                        getData.token = data.data.access_token;
                        resolve(data);
                    } else {
                        document.getElementById("roomSwitch").parentNode.style.display = "block";
                        console.log(data.msg)
                        reject('get token error')
                    }

                }
            })
            // resolve();
        }).then(function (data) {
            return new Promise(function (resolve, reject) {
                let wsUrl = '';
                $.ajax({
                    type: "get",
                    url: reqUrl,
                    dataType: "jsonp",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        "Action": "rsugetrtcgateway",
                        "rpc_id": _that.dataList.rpc_id,
                        "user_id": obj.user_id,
                        "room_id": obj.room_id,
                        "app_id": obj.app_id,
                        "token": data.data.access_token
                    },
                    success: function (data) {
                        if (data.err == 0) {
                            const urlArr = JSON.parse(Base64.decode(data.data.access_token));
                            wsUrl = 'wss://' + urlArr[0].singal + ':' + urlArr[0].port + '/ws';
                            _that.dataList.url = wsUrl;
                            getData.wsUrl = wsUrl;
                            resolve(getData);
                        } else {
                            reject('get url error')
                            document.getElementById("roomSwitch").parentNode.style.display = "block";
                        }
                    }
                })
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

                    console.log('###############################');
                    console.log(rsp)
                    console.log(_that)
                    console.log(req)
                    console.log('Send msg : ' + JSON.stringify(req));
                    console.log('Recv msg : ' + evt.data);

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
            u.ws.close();
            // clearInterval(intervalId);
        })

    }
    joinRoom(data) {
        let joinRoomData = {
            rpc_id: this.dataList.rpc_id,
            user_id: this.dataList.user_id,
            room_id: this.dataList.room_id,
            authtoken: data.token,
            sessionid: this.dataList.session,
            app_id: this.dataList.app_id
        }
        // this.send('joinroom', joinRoomData);
        // this.addEventListener('joinroom', this.getRoomJoin);
        const _that = this;
        return new Promise(function (resolve, reject) {
            _that.send('joinroom', joinRoomData)
            _that.addEventListener('joinroomerror', function (e) {
                reject(e.rsp)
            })
            _that.addEventListener('joinroom', function () {
                _that.getRoomJoin();
                resolve('join room success');

            });
        })
    }

    leaveRoom(data) {
        const _that = this;
        return new Promise(function (resolve, reject) {
            _that.send('leaveroom', data)
            _that.addEventListener('leaveroomerror', function (e) {
                reject(e.rsp)
            })
            _that.addEventListener('leaveroom', function (e) {
                _that.getRoomLeave(e);
                for (let k of Object.keys(_that)) {
                    if (k.startsWith('pc')) {
                        _that[k].close();
                    }
                }
                resolve('leave room success');

            });
        })

        // this.send('leaveroom', data);
        // this.addEventListener('leaveroom', this.getRoomLeave);
        // for (let k of Object.keys(this)) {
        //     if (k.startsWith('pc')) {
        //         this[k].close();
        //     }
        // }
    }
    publish(data) {
        console.log(this.ws)
        console.log(data)
        console.log('publish')
        // this.send('publish', data);
        // this.addEventListener('publish', this.getPublish);
        const _that = this;
        return new Promise(function (resolve, reject) {
            _that.send('publish', data)
            _that.addEventListener('publisherror', function (e) {
                reject(e.rsp)
            })
            _that.addEventListener('publish', function (e) {
                _that.getPublish(e);
                resolve(e);

            });
        })
    }

    subscribe(data, obj) {
        console.log('00000000----------')
        console.log(data)
        console.log(obj)
        // this.send('subscribe', {
        //     src: {
        //         user_id: this.dataList.user_id,
        //         audio: obj.audio_enable,
        //         video: obj.video_enable,
        //         data: this.dataList.data_enable
        //     },
        //     dst: {
        //         user_id: data.user_id,
        //         stream_id: data.stream_id,
        //         media_type: data.media_type
        //     }
        // });
        // this.addEventListener('subscribe', this.getSubscribe);

        const _that = this;
        return new Promise(function (resolve, reject) {
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
            _that.addEventListener('subscribeerror', function (e) {
                reject(e.rsp)
            })
            _that.addEventListener('subscribe', function (e) {
                _that.getSubscribe(e);
                resolve(e);

            });
        })
    }

    sdpPub(data) {
        console.log(456)
        console.log(data)
        this.send('sdp', data);
        this.addEventListener('sdpPub', this.getSdppub);
    }

    sdpScb(data) {
        this.send('sdp', data);
        this.addEventListener('sdpScb', this.getSdpscb);
    }

    send(method, data) {
        const _that = this;
        this.waitForConnection(function () {
            let rpcid = _that.rpcid + 1;
            _that.rpcid = rpcid;
            // console.log()
            let req = {
                method: method,
                version: RPCVersion,
                rpc_id: rpcid.toString(),
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


    //////////////
    recvMsgHandler(req, rsp) {
        console.log(1111)
        console.log(req)
        console.log(rsp)
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
            }
        } else {
            switch (req.method) {
                case 'joinroom':
                    try {
                        if (rsp.err === 0) {
                            console.log(this)
                            this.users = rsp.data.users;
                            this.streams = rsp.data.streams;
                            this.dispatchEvent(new Event('joinroom', {
                                'bubbles': true
                            }));
                        } else {
                            console.log(`joinroom error: ${rsp.msg}`);
                            event = new Event('joinroomerror', {
                                'bubbles': true
                            })
                            event.rsp = rsp;
                            this.dispatchEvent(event);
                        }
                    } catch (e) {
                        console.log(`joinroom catch error: ${e}`);
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
                            this.dispatchEvent(new Event('leaveroom', {
                                'bubbles': true
                            }));
                        } else {
                            console.log(`leaveroom error: ${rsp.msg}`);
                            event = new Event('leaveroomerror', {
                                'bubbles': true
                            })
                            event.rsp = rsp;
                            this.dispatchEvent(event);
                        }
                    } catch (e) {
                        console.log(`leaveroom catch error: ${e}`);
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
                            event = new Event('publisherror', {
                                'bubbles': true
                            })
                            event.rsp = rsp;
                            this.dispatchEvent(event);
                        }
                    } catch (e) {
                        console.log(`publish catch error: ${e}`);
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
                            event = new Event('subscribeerror', {
                                'bubbles': true
                            })
                            event.rsp = rsp;
                            this.dispatchEvent(event);
                        }
                    } catch (e) {
                        console.log(`subscribe catch error: ${e}`);
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
                            }
                            console.log(`sdp error: ${rsp.msg}`);
                        }
                    } catch (e) {
                        console.log(`sdp error: ${e}`);
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
                            event = new Event('muteerror', {
                                'bubbles': true
                            })
                            event.rsp = rsp;
                            this.dispatchEvent(event);
                        }
                    } catch (e) {
                        console.log(`mute catch error: ${e}`);
                        event = new Event('muteerror', {
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
        this.dispatchEvent(new Event('userJoin', {
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
            let event = new Event('userLeave', {
                'bubbles': true
            });
            event.videoId = videoId;
            event.closeUserId = closeUserId;
            this.dispatchEvent(event);
        }
    }


    getRoomJoin(data) {
        const _that = this;
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

    async getActiveMute(e) {
        // console.log(e)
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
            console.log(`操作流报错: ${e}`);
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
                            max: 30
                        }
                    };
                    this.dataList.videoBandwidth = 200;
                    this.dataList.audioBandwidth = 200;
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
            }
        }

        const promise = new Promise(function (resolve, reject) {
            // res['frameRate'] = {'max': _that.dataList.frameRate};
            navigator.mediaDevices.getUserMedia({
                audio: _that.dataList.audio_enable,
                video: _that.dataList.video_enable,
                video: _that.dataList.resolution
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
                resolve(e);
            })
        }, function (err) {
            reject(err)
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
                        // console.log(instant);
                        resolve(instant);
                    };

                    let mic = audioContext.createMediaStreamSource(stream);
                    mic.connect(audioScript);
                    // let analyser = audioContext.createAnalyser();//分析器
                    audioScript.connect(audioContext.destination);
                })
            })
        }, function (err) {
            reject(err)
        })
        return volum;
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
            console.log('Created local peer connection object pc0');

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
            // console.log(pc0)
            pc0.offer.sdp = pc0.offer.sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + this.dataList.videoBandwidth + '\r\n');
            pc0.offer.sdp = pc0.offer.sdp.replace(/a=mid:1\r\n/g, 'a=mid:1\r\nb=AS:' + this.dataList.videoBandwidth + '\r\n');
            // console.log('pc0.offer')
            // console.log(pc0.offer)
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

        console.log(`${subId} created local peer connection`);
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

                resolve(e.streams[0]);
                let event = new Event('loadVideo', {
                    'bubbles': true
                });
                event.name = scbStream.dstUserId;
                //box1 idx is 0 so add 1
                event.num = _that.videoIds.length + 1;
                event.stream = e.streams[0];
                _that.dispatchEvent(event);
            }

        }, function (err) {
            reject(err)
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
        let intervalId = setInterval(function () {
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
        if (!(type in this.listeners)) {
            this.listeners[type] = [];
        }
        if (this.listeners[type].length === 0) {
            this.listeners[type].push(callback);
        }
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

}

function randString(l) {
    var S = '0123456789abcdefghijklmnopqrstuvwxyz';
    var s = '';
    for (var n = 0; n < l; ++n) {
        s = s + S.charAt(Math.floor((Math.random() * 100) % 36));
    };
    return s;
}

function randNum(l) {
    let S = '0123456789';
    let s = '';
    for (let n = 0; n < l; ++n) {
        s = s + S.charAt(Math.floor((Math.random() * 100) % 10));
    }
    return s;
}