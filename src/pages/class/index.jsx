import React from "react";
import {
  Row,
  Col,
  Button,
  Icon,
  Select,
  Modal
} from "@ucloud-fe/react-components";
import { log } from "../../common/util/index";
// import { UCloudRtcEngine } from "../../vendor/urtcsdk";
import {
  UCloudRtcEngine
} from 'ucloud-rtc-sdk';
import { getText } from "../../common/dictMap/index";
import { randNum } from "../../common/util/index";
// component组件
import Nav from "../../components/nav/index";
import Write from "../../components/write/index";
import Chat from "../../components/chat/index";
import ReactPlayer from "react-player";
import SubscribeVideo from "../../components/subscribe/index";
import { closeIM } from "../../common/api/chat";
import "./index.scss";
import paramServer from "../../common/js/paramServer";
const { Option, Size } = Select;

window.addEventListener("unload", closeIM, false);
const config = {
  role_type: 0, //用户权限0 推流 1 拉流 2 全部
  audiooutput: null, //扬声器id
  video: null, //视频设备id
  audiointput: null, //麦克风id
  resolving_power: null //分辨率
};
let URtcDemo = new UCloudRtcEngine();

class ClassRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      devicesList: [],
      token: null,
      roomId: null,
      params: null,
      monitorData: null,
      videoSrcObject: null,
      videoCurr: false,
      videoSrcObjectId: "",
      loadList: [],
      videoIdArr:[],
      deviceId:0,
      settingVisible:false,
      recording:false,
      recordUrlVisible:false,
      recordUrl:'',
      recordText:'开始录制',
      appData: {
        appId: paramServer.getParam().appId,
        userId: paramServer.getParam().userId,
        mediaType: paramServer.getParam().mediaType, //桌面和摄像头采集类型
        appkey: paramServer.getParam().appkey
      }
    };
    this.videoList = [];
    this.loadVideo = this.loadVideo.bind(this);
    this.userLeave = this.userLeave.bind(this);
    this.leaveLocalRoom = this.leaveLocalRoom.bind(this);
    this.removeArrValue = this.removeArrValue.bind(this);
    this.online = this.online.bind(this);
    this.deviceIdChange = this.deviceIdChange.bind(this);
    this.setting = this.setting.bind(this);
    this.changeOk = this.changeOk.bind(this);
    // this.startVideo = this.startVideo.bind(this);
    this.recording = this.recording.bind(this);
  }

  componentDidMount() {
    // 从缓存拿参数，退出清空
    let param = paramServer.getParam();
    this.setState(
      {
        params: param
      },
      () => {
        this.urtcInit();
      }
    );
  }

  downMic() {
    console.log(">>>>reset RTC");
    const appData = this.state.params;
    URtcDemo.leaveRoom({
      room_id: appData.roomId
    });
    let _this = this;
    let token = null;

    URtcDemo.getToken({
      app_id: appData.appId,
      room_id: appData.roomId,
      user_id: appData.userId,
      appkey: appData.appkey
    }).then(function(data) {
      token = data;
      let o = paramServer.getParam();
      paramServer.setParam(Object.assign({ rtcToken: data }, o));
      // console.log(_this.state.params)
      URtcDemo.init({
        app_id: appData.appId,
        room_id: appData.roomId,
        user_id: appData.userId,
        token: data,
        role_type: appData.role_type, //用户权限0 推流 1 拉流 2 全部
        room_type: appData.room_type //房间类型 0 rtc小班课 1 rtc 大班课
      }).then(function(data) {
        console.log(data);
        // if (appData.role_type === 0 || appData.role_type === 2) {
        //     URtcDemo.getLocalStream({
        //         media_data: 'videoProfile1280*720',
        //         video_enable: true,
        //         audio_enable: true,
        //         media_type: 1 //MediaType 1 cam 2 desktop
        //     }).then(function (data) {
        //         console.log(113)
        //         console.log(data)
        //         _this.setState({
        //             videoSrcObject: data,
        //             videoSrcObjectId: appData.userId
        //         });
        //     })
        // }
        URtcDemo.joinRoom({
          token: token,
          role_type: appData.role_type, //用户权限0 推流 1 拉流 2 全部
          room_type: appData.room_type //房间类型 0 rtc小班课 1 rtc 大班课
        }).then(
          e => {
            console.log(e);
            console.log();
            _this.videoList.length = 0;
            console.log("videoList123", _this.videoList);
            // console.log(_this.videoList)
            _this.updateRtcList(_this.videoList);
            // // let arr = [...loadList]
            _this.setState({
              loadList: _this.videoList
            });
          },
          function(err) {
            console.log(err);
          }
        );
      });
    });
  }
  urtcInit() {
    const appData = this.state.params;
    let _this = this;
    let token = null;
    console.log("urtcInit");
    console.log(this.videoList);
    URtcDemo.getToken({
      app_id: appData.appId,
      room_id: appData.roomId,
      user_id: appData.userId,
      appkey: appData.appkey
    }).then(function(data) {
      token = data;
      let o = paramServer.getParam();
      paramServer.setParam(Object.assign({ rtcToken: data }, o));
      // console.log(_this.state.params)
      URtcDemo.init({
        app_id: appData.appId,
        room_id: appData.roomId,
        user_id: appData.userId,
        token: data,
        deviceId: _this.state.deviceId,
        role_type: appData.role_type, //用户权限0 推流 1 拉流 2 全部
        room_type: appData.room_type //房间类型 0 rtc小班课 1 rtc 大班课
      }).then(
        function(data) {
          console.log(data);
          if (appData.role_type === 0 || appData.role_type === 2) {
            URtcDemo.getLocalStream({
              media_data: "videoProfile1280*720",
              video_enable: true,
              audio_enable: true,
              media_type: 1 //MediaType 1 cam 2 desktop
            }).then(function(data) {
              console.log(113);
              console.log(data);
              _this.setState({
                videoSrcObject: data,
                videoSrcObjectId: appData.userId,
                videoCurr: true
              });
              URtcDemo.joinRoom({
                token: token,
                role_type: appData.role_type, //用户权限0 推流 1 拉流 2 全部
                room_type: appData.room_type //房间类型 0 rtc小班课 1 rtc 大班课
              }).then(
                e => {
                  // 定时获取监控
                  _this.getMonitorData();
                },
                function(err) {
                  console.log(err);
                }
              );
            });
          } else {
            URtcDemo.joinRoom({
              token: token,
              role_type: appData.role_type, //用户权限0 推流 1 拉流 2 全部
              room_type: appData.room_type //房间类型 0 rtc小班课 1 rtc 大班课
            }).then(
              e => {
                // 定时获取监控
                _this.getMonitorData();
              },
              function(err) {
                console.log(err);
              }
            );
          }
        },
        function(error) {
          console.log("init", error);
        }
      );
    });
    console.log(2000);
    URtcDemo.addEventListener("loadVideo", this.loadVideo);
    URtcDemo.addEventListener("userLeave", this.userLeave);
    // URtcDemo.addEventListener('leaveroom', this.leaveLocalRoom);
  }

  getMonitorData = () => {
    setInterval(() => {
      //不再订阅流中，就为本地流
      let flag = Object.keys(URtcDemo.scbMap)[0] == "local";
      let d = null;
      if (flag) {
        d = URtcDemo.getMonitor();
      } else {
        d = URtcDemo.getMonitor(Object.keys(URtcDemo.scbMap)[0]);
      }
      if (d) {
        this.setState({
          monitorData: d
        });
      }
    }, 3000);
  };

  loadVideo(e) {
    let appData = this.state.params;
    console.log("loadVideo");
    console.log(appData.room_type == 1);
    console.log(this.videoList);
    const _this = this;
    let teacher = paramServer.getParam().teachList[0].UserId;
    console.log(e);
    console.log(URtcDemo);
    if (e.userId == teacher && appData.room_type == 1) {
      this.setState({
        videoSrcObject: e.stream,
        videoSrcObjectId: e.userId,
        videoCurr: false
      });
      // this.videoSrcObject = e.stream;
    } else {
      let tmp = {};
      tmp.stream = e.stream;
      tmp.userId = e.userId;
      tmp.curr = false;
      tmp.time = new Date().getTime();
      this.videoList.forEach(function(val,index){
        if(val.userId == e.userId){
          _this.videoList.splice(index, 1);
        }
      })
      this.videoList.push(tmp);
      this.updateRtcList(this.videoList);
      // let arr = [...loadList]
      this.setState({
        loadList: this.videoList
      });
    }
  }

  userLeave(e) {
    if (paramServer.getParam().teachList !== null) {
      console.log(e);
      let id = e.userId; //rtc userid
      let teacher = paramServer.getParam().teachList[0].UserId;
      let idList = this.videoList.map(e => {
        return e.userId;
      });
      if (e.userId != teacher && idList.includes(id)) {
        let newVideoList = this.videoList.filter(e => {
          return e.userId != id;
        });
        this.videoList.length = 0;
        this.videoList = newVideoList;
        this.updateRtcList(newVideoList);
        this.setState({
          loadList: newVideoList
        });
      }
    }
  }

  leaveLocalRoom(e) {
    // loadList.splice(loadList.indexOf(paramServer.getParam().userId),1);
    // this.updateRtcList(loadList)
    // this.setState({
    //     loadList: loadList,
    // })
  }

  online() {
    // let URtcDemo = this.props.URtcDemo;
    const appData = paramServer.getParam();
    const user_id = appData.userId;
    const _this = this;
    URtcDemo.leaveRoom({
      room_id: appData.roomId
    });
    URtcDemo.getToken({
      app_id: appData.appId,
      room_id: appData.roomId,
      user_id: user_id,
      appkey: appData.appkey
    }).then(function(data) {
      let rtcToken = data;
      URtcDemo.init({
        app_id: appData.appId,
        room_id: appData.roomId,
        user_id: user_id,
        token: rtcToken,
        role_type: appData.role_type, //用户权限0 推流 1 拉流 2 全部
        room_type: appData.room_type //房间类型 0 rtc小班课 1 rtc 大班课
      }).then(function(data) {
        URtcDemo.getLocalStream({
          media_data: "videoProfile1280*720",
          video_enable: true,
          audio_enable: true,
          media_type: 1 //MediaType 1 cam 2 desktop
        }).then(function(data) {
          console.log("getLocalStream", _this.videoList);
          console.log(_this.videoList.length);
          _this.removeArrValue(_this.videoList, "userId", user_id);
          console.log(_this.videoList.length);
          // console.log(_this.videoList)
          let tmp = {};
          tmp.stream = data;
          tmp.userId = user_id;
          tmp.curr = true;
          tmp.time = new Date().getTime();
          _this.videoList.push(tmp);
          // console.log(_this.videoList)
          _this.updateRtcList(_this.videoList);
          // // let arr = [...loadList]
          _this.setState({
            loadList: _this.videoList
          });
          URtcDemo.joinRoom({
            token: rtcToken,
            role_type: 2, //用户权限0 推流 1 拉流 2 全部
            room_type: appData.room_type //房间类型 0 rtc小班课 1 rtc 大班课
          }).then(function(e) {
            console.log(e);
            console.log("online2");
          });
        });
      });
    });

    // console.log(paramServer.getParam())
  }

  updateRtcList(arr) {
    let o = paramServer.getParam();
    paramServer.setParam(Object.assign(o, { rtcList: arr }));
    // console.error(paramServer.getParam())
  }

  removeArrValue(arr, attr, val) {
    let index = 0;
    for (let i in arr) {
      if (arr[i][attr] === val) {
        index = i;
        break;
      }
    }
    arr.splice(index, 1);
  }
  deviceIdChange(e) {
    console.log(e);
    this.setState({
      deviceId: e
    });
  }
  setting() {
    // getLocalDevices
    let _that = this;
    let videoArr = [];
    this.setState({
      settingVisible: true
    });
    URtcDemo.getLocalDevices().then(function(e) {
      e.forEach(val => {
        if (val.kind === "videoinput") {
          videoArr.push(val);
        }
      });
      _that.setState({
        videoIdArr: videoArr
      });
      // <Button onClick={_that.changeOk}>切换</Button>
    });
  }
  changeOk() {
    console.log(this.state.deviceId);
    this.setState({
      settingVisible: false
    });
    const appData = paramServer.getParam();
    URtcDemo.leaveRoom({
      room_id: appData.roomId
    });
    this.urtcInit();
  }
  recording(){
    const appData = paramServer.getParam();
    const _this = this;
      if (this.state.recording == false) {
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
            // _that.style.color = '#e03737';
            let url = 'http://urtc-test.cn-bj.ufileos.com/' + e.data.FileName
            console.log(e)
            _this.setState({
              recordUrl:url,
              recordText:'结束录制'
            })
        }).catch(function(err){
          console.log(err)
          
        })
        this.setState({
          recording:true
        })
    }else{
        URtcDemo.stopRecord().then(function (e) {
            // _that.style.color = '#fff';
            console.log(e)
            _this.setState({
              recordUrlVisible:true,
              recordText:'开始录制'
            })
        }).catch(function(err){
          console.log(err)
        })
        _this.setState({
          recording:false,
        })
    }    
  }
  render() {
    const { params, monitorData } = this.state;
    return (
      <div className="classroom_main">
        {/* <div className="start-video fr" onClick={this.startVideo}>
            <b><Icon type='video'/> </b>
                开启视频
        </div> */}
        <div className="recording-video fr " onClick={this.recording}>
            <Icon className={this.state.recording?'recording':''} type='sxt'/>
                {this.state.recordText}
        </div>
        <div className="act-top fr" onClick={this.setting}>
            <Icon type='cog'/>
                切换摄像头
        </div>
        <Nav monitorData={monitorData}></Nav>
        <div className="classroom_layout clearfix">
          {/* <Sidebar></Sidebar> */}
          <Row
            style={{ height: "100%", width: "100%", padding: "0" }}
            gutter={0}
            type="flex"
          >
            <Col className="classroom_left" span={10}>
              <SubscribeVideo data={this.state.loadList} />
              {/* <div className="subscribe">
                                <video src=""></video>
                                <video src=""></video>
                            </div> */}
              <Write appData={this.state.appData}></Write>
            </Col>
            <Col span={2}>
              {/* <Localvideo></Localvideo> */}
              <div className="localvideo_main">
                <ReactPlayer
                  key={
                    this.state.videoSrcObject && this.state.videoSrcObject.id
                  }
                  width="256px"
                  height="100%"
                  url={this.state.videoSrcObject}
                  muted={this.state.videoCurr}
                  playing
                  playsinline
                />
              </div>
              <Chat
                loadList={this.videoList}
                changeDataList={() => this.online()}
                params={params}
                urtcInit={() => this.downMic()}
                appData={this.state.appData}
              />
            </Col>
          </Row>
        </div>
        <Modal
          visible={this.state.settingVisible}
          onClose={() =>
            this.setState({
              settingVisible: false
            })
          }
          onOk={this.changeOk}
          size={"sm"}
          title="切换摄像头"
        >
          <div className="form-row device-id">
            摄像头
            <Select
              size="md"
              onChange={this.deviceIdChange}
              className="device-id_seclect"
            >
              {this.state.videoIdArr.map(i => (
                <Option value={i.deviceId} key={i.deviceId}>
                  <span>{i.label}</span>
                </Option>
              ))}
            </Select>
          </div>
        </Modal>
        <Modal
            visible={this.state.recordUrlVisible}
            onClose={() =>
                this.setState({
                  recordUrlVisible: false
                })
            }
            onOk={() =>
              this.setState({
                recordUrlVisible: false
              })}
            isAutoClose={false}
            size={'sm'}
            title="录制结束"
        >
            <div className="form-row device-id">
              <a href={this.state.recordUrl} target="_blank">
                回看地址
              </a>
            
            </div>
        </Modal>
      </div>
    );
  }
}

export default ClassRoom;
