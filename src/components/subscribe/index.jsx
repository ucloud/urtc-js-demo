import React from "react";
import { Button } from "@ucloud-fe/react-components";
import "./index.scss";
import ReactPlayer from "react-player";
import { withRouter } from "react-router-dom";
import paramServer from "../../common/js/paramServer";

class SubscribeVideo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currActive: ""
    };
    // this.online = this.online.bind(this);
  }
  componentWillReceiveProps() {
    this.data = this.props;
  }
  // 根据流提供ID，从学生列表里获取学生姓名
  getUserInfoName = id => {
    let arr = paramServer
      .getParam()
      .userList.concat(paramServer.getParam().teachList);
    let name = "";
    arr.map(data => {
      if (data.UserId == id) {
        let n = JSON.parse(data.UserInfo).userName;
        name = n;
      }
    });
    return name ? name : id;
  };

  renderStream(stream) {
    if (!stream.mediaStream) return;
    const name = this.getUserInfoName(stream.uid);
    console.log(stream.muteAudio);
    return (
      <div
        className="video_wrapper"
        style={{ display: "inline-block", marginRight: "5px" }}
        key={stream.sid}
      >
        <ReactPlayer
          width="160px"
          height="120px"
          volume={null}
          url={stream.mediaStream}
          playing
          muted={false}
        />
        <div className="video_userInfo">
          <span
            className="head_bg"
            style={{ backgroundColor: this.state.color }}
          ></span>
          <span className="head_name">{name}</span>
        </div>
      </div>
    );
  }

  render() {
    const { streams = [], isTeacther, localStream } = this.props;
    console.log("render streams ", streams);
    return (
      <div className={"subscribe "}>
        {/* <Button onClick={this.online}>上麦</Button> */}
        {!isTeacther && localStream != undefined && (
          <div
            className="video_wrapper"
            style={{ display: "inline-block", marginRight: "5px" }}
            key={localStream && localStream.sid}
          >
            <ReactPlayer
              width="160px"
              height="120px"
              volume={null}
              url={localStream && localStream.mediaStream}
              playing
              muted={true}
            />
            <div className="video_userInfo">
              <span
                className="head_bg"
                style={{ backgroundColor: this.state.color }}
              ></span>
              <span className="head_name">
                {localStream && this.getUserInfoName(localStream.uid)}
              </span>
            </div>
          </div>
        )}

        <div className="subscribe_content">
          {streams.map((stream, index) => {
            if (!isTeacther && index == 0) {
            } else {
              return this.renderStream(stream);
            }
          })}
        </div>
      </div>
    );
  }
}

export default SubscribeVideo;
