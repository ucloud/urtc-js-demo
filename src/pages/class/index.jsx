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
import sdk, { Client, Logger } from "urtc-sdk";
import { UCloudRtcEngine } from "ucloud-rtc-sdk";
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
// const config = {
//   role_type: 2, //用户权限0 推流 1 拉流 2 全部
//   audiooutput: null, //扬声器id
//   video: null, //视频设备id
//   audiointput: null, //麦克风id
//   resolving_power: null //分辨率
// };
let URtcDemo = new UCloudRtcEngine();

Logger.setLogLevel("debug");


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
      videoIdArr: [],
      deviceId: 0,
      settingVisible: false,
      recording: false,
      recordUrlVisible: false,
      recordUrl: "",
      recordText: "开始录制",
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
    this.desktop = this.desktop.bind(this);
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
        this.urtcInit(this.state.params.role_type);
      }
    );

    window.addEventListener("beforeunload", this.leaveRoom);
  }

  leaveRoom = () => {
    this.client.leaveRoom();
  };

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.leaveRoom);
  }

  // 下麦操作，im消息过来后，退出重新加入房间
  downMic = () => {
    const appData = paramServer.getParam();
    this.setState({
      remoteStreams: []
    });
    this.client.leaveRoom(() => {
      this.urtcInit(1);
    });
  };

  urtcInit = role_type => {
    const appData = paramServer.getParam();
    const token = sdk.generateToken(
      appData.appId,
      appData.appkey,
      appData.roomId,
      appData.userId
    );
    window.p = this.client = new Client(appData.appId, token, {
      type: appData.room_type === 0 ? "rtc" : "live",
      role:
        role_type === 0 ? "push" : role_type === 2 ? "push-and-pull" : "pull"
    });

    this.client.on("stream-published", stream => {
      console.log("stream-published ", stream);
      this.setState({
        localStream: stream
      });
    });

    this.client.on("stream-subscribed", stream => {
      console.log("stream-subscribed ", stream);

      const { remoteStreams = [] } = this.state;
      const idx = remoteStreams.findIndex(item => stream.sid === item.sid);
      if (idx !== -1) {
        remoteStreams.splice(idx, 1, stream);
      }
      this.setState({ remoteStreams });
    });

    this.client.on("stream-added", stream => {
      console.log("stream-added ", stream);

      this.client.subscribe(
        stream.sid,
        p => {
          console.log("subscribe success ", p);

          //老师id数组
          let teacherIdArr = paramServer.getParam().teachList.map(e => {
            return e.UserId;
          });
          const { remoteStreams = [] } = this.state;
          remoteStreams.push(stream);
          this.updateRtcList(this.client.getStreams());
          this.setState({
            remoteStreams,
            videoList: this.client.getStreams()
          });
        },
        e => {
          console.log("subscribe failure ", e);
        }
      );
    });

    this.client.on("stream-removed", stream => {
      console.log("stream-removed ", stream);

      const { remoteStreams = [] } = this.state;
      const idx = remoteStreams.findIndex(item => stream.sid === item.sid);
      if (idx !== -1) {
        remoteStreams.splice(idx, 1);
      }
      this.setState({ remoteStreams });
    });

    this.client.joinRoom(appData.roomId, appData.userId, user => {
      // this.client.setVideoProfile('1280*720');

      this.client.publish(
        {
          audio: true,
          video: true,
          screen: false
        },
        p => {
          console.log("publish success ", p);

          // this.getMonitorData();
        },
        e => {
          console.log("publish failure ", e);
        }
      );
    });
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
      this.videoList.forEach(function(val, index) {
        if (val.userId == e.userId) {
          _this.videoList.splice(index, 1);
        }
      });
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

  /**
   * @description 学生上麦操作，推出房间，更改房间类型并重新加入
   */
  online = () => {
    // let URtcDemo = this.props.URtcDemo;
    const appData = paramServer.getParam();
    this.setState({
      remoteStreams: []
    });
    const user_id = appData.userId;
    this.client.leaveRoom(() => {
      this.urtcInit(2);
    });
    // console.log(paramServer.getParam())
  };

  updateRtcList(arr) {
    let o = paramServer.getParam();
    paramServer.setParam(Object.assign(o, { rtcList: arr }));
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
    this.setState({
      settingVisible: true
    });

    this.client.getCameras(
      cameras => {
        console.log("get cameras success ", cameras);
        this.setState({
          videoIdArr: cameras
        });
      },
      e => {
        console.log("get cameras failure ", e);
      }
    );
  }

  changeOk() {
    this.setState({
      settingVisible: false
    });

    this.client.switchDevice(
      "video",
      this.state.deviceId,
      p => {
        console.log("switch camera success ", p);
      },
      e => {
        console.log("switch camera failure ", e);
      }
    );
  }

  recording() {
    const appData = paramServer.getParam();

    if (this.state.recording == false) {
      const bucket = "urtc-test";
      const region = "cn-bj";

      this.client.startRecording(
        {
          waterMarkPosition: "left-top",
          bucket: bucket,
          region: region
        },
        record => {
          console.log("start recording success ", record);
          const url = `http://${bucket}.${region}.ufileos.com/${record.FileName}`;
          // console.error(url);

          this.setState({
            recordUrl: url,
            recordText: "结束录制"
          });
        }
      );
      this.setState({
        recording: true
      });
    } else {
      this.client.stopRecording(
        p => {
          console.log("stop recording success ", p);

          this.setState({
            recordUrlVisible: true,
            recordText: "开始录制"
          });
        },
        e => {
          console.log("stop recording failure ", e);
        }
      );
      this.setState({
        recording: false
      });
    }
  }

  filterSubTeacher = () => {
    const { remoteStreams = [] } = this.state;
    if (paramServer.getParam().teachList) {
      const { teachList = [] } = paramServer.getParam();
      const idArr = teachList.map(e => {
        return e.UserId;
      });
      console.log(idArr, paramServer.getParam());
      let targetArr = remoteStreams.filter(e => {
        console.log(e);
        return idArr.includes(e.uid);
      });

      return targetArr.length ? targetArr[0] : [];
    } else {
      return [];
    }
  };
  desktop() {
    this.client.unpublish(
      p => {
        console.log("unpublish success ", p);
        // this.getMonitorData();
        this.client.publish(
          {
            audio: true,
            video: false,
            screen: true
          },
          p => {
            console.log("publish success ", p);
            // this.getMonitorData();
          },
          e => {
            console.log("publish failure ", e);
          }
        );
      },
      e => {
        console.log("publish failure ", e);
      }
    );
  }
  render() {
    const { params, localStream, remoteStreams = [], videoList } = this.state;
    const subTeacher = this.filterSubTeacher();
    console.log(localStream, remoteStreams);
    return (
      <div className="classroom_main">
        {/* <div className="start-video fr" onClick={this.startVideo}>
            <b><Icon type='video'/> </b>
                开启视频
        </div> */}

        <div className="recording-video fr " onClick={this.recording}>
          <Icon
            className={this.state.recording ? "recording" : ""}
            type="sxt"
          />
          {this.state.recordText}
        </div>
        <div className="act-top fr" onClick={this.setting}>
          <Icon type="cog" />
          切换摄像头
        </div>
        <div className="desktop fr" onClick={this.desktop}>
          <Icon className="stack" type="stack" />
          屏幕共享
        </div>
        <Nav client={this.client} />
        <div className="classroom_layout clearfix">
          {/* <Sidebar></Sidebar> */}
          <Row
            style={{ height: "100%", width: "100%", padding: "0" }}
            gutter={0}
            type="flex"
          >
            <Col className="classroom_left" span={10}>
              <SubscribeVideo
                isTeacther={
                  params &&
                  (params.room_type == 0 ||
                    (params.room_type == 1 && params.role_type == 2))
                }
                localStream={localStream}
                streams={remoteStreams || []}
              />
              <Write appData={this.state.appData}></Write>
            </Col>
            <Col span={2}>
              {/* <Localvideo></Localvideo> */}
              {params && (
                <div className="localvideo_main">
                  {params.room_type == 0 ||
                  (params.room_type == 1 && params.role_type == 2) ? (
                    //小班课显示本地
                    <ReactPlayer
                      key={localStream && localStream.sid}
                      width="256px"
                      height="100%"
                      volume={null}
                      url={localStream && localStream.mediaStream}
                      muted={true}
                      playing
                      playsinline
                    />
                  ) : (
                    //大班课验证身份是否为老师显示
                    <ReactPlayer
                      key={subTeacher && subTeacher.sid}
                      width="256px"
                      height="100%"
                      volume={null}
                      url={subTeacher && subTeacher.mediaStream}
                      muted={false}
                      playing
                      playsinline
                    />
                  )}
                </div>
              )}
              <Chat
                loadList={videoList || []}
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
            })
          }
          isAutoClose={false}
          size={"sm"}
          title="录制结束"
        >
          <div className="form-row device-id">
            <a href={this.state.recordUrl} target="_blank">
              回看地址
            </a>
            {/* 录制结束，请到本地服务录制目录查看 */}
          </div>
        </Modal>
      </div>
    );
  }
}

export default ClassRoom;
