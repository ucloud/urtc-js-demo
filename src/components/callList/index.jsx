import React from "react";
import { Button, Tooltip, Icon, Badge } from "@ucloud-fe/react-components";
import paramServer from "../../common/js/paramServer";
import { AuthCall, sendApplyCall, ReplyCall } from "../../common/api/chat";
import "./index.scss";

let penging = false;

class CallList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      param: null,
      modalHide: false,
      opacity: 1
    };
  }

  componentDidMount() {
    let param = paramServer.getParam();
    if (param.roomId) {
      this.setState({
        param
      });
    }
    let num = 0;
    this.timer = setInterval(
      function() {
        var opacity = this.state.opacity;
        opacity -= 0.05;
        if (opacity < 0.1) {
          opacity = 1.0;
          num++;
        }
        this.setState({
          opacity: opacity
        });
        if(num > 5){
            clearInterval(this.timer)
        }
      }.bind(this),
      30
    );
  }

  openCall = e => {
    if (penging) {
    } else {
      penging = true;
    }
    AuthCall(true).then(data => {
      penging = false;
    });
  };

  closeCall = e => {
    if (penging) {
    } else {
      penging = true;
    }
    AuthCall(false).then(data => {});
  };

  checkTeach() {
    const param = paramServer.getParam();
    if (param == null || !param.hasOwnProperty("teachList")) {
      return false;
    }
    let arr = param.teachList.map(e => {
      return e.UserId;
    });
    let id = param.UserId;

    return arr.includes(id);
  }

  replyCall = type => {
    ReplyCall(this.props.data.UserId, type).then(data => {
      this.setState({
        modalHide: true
      });
    });
  };

  render() {
    const param = paramServer.getParam();
    const { modalHide } = this.state;
    let data = this.props.data;
    let isTeach = this.checkTeach();
    return (
      <div className="callList_main">
        <div className="callList_content fl">
          <div className="callList_head">
            <span
              className="callList_head_bg"
              style={{ backgroundColor: this.state.color }}
            ></span>
            <span className="callList_head_name">
              {data.UserInfo.userName ? data.UserInfo.userName : data.UserId}
            </span>
            <span
              style={{ opacity: this.state.opacity }}
              className={
                this.props.isRtc ? "callList_status blue" : "callList_status"
              }
            ></span>
          </div>
        </div>

        {/* 一次性显示，是否为老师的权限，是否在线列表 */}
        {this.props.isRtc ? null : isTeach ? (
          <div className="fr btn_wrapper">
            <Button
              onClick={this.replyCall.bind(this, true)}
              style={{ marginRight: "5px" }}
              shape="circle"
              styleType="border"
              size="sm"
            >
              <Icon type={"check"} style={{ color: "#3860f4" }} />
              {/* 禁言 */}
            </Button>
            <Button
              onClick={this.replyCall.bind(this, false)}
              shape="circle"
              styleType="border"
              size="sm"
            >
              <Icon type={"cross"} style={{ color: "#5a6776" }} />
              {/* 禁言 */}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }
}

export default CallList;
