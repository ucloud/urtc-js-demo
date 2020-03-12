/* eslint-disable */
import React from "react";
import { Button, Icon } from "@ucloud-fe/react-components";
import paramServer from "../../common/js/paramServer";
import { imClient } from "../../common/serve/imServe.js";
import "./index.scss";

let penging = false;

class CallList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      param: null,
      modalHide: false,
      opacity: 1,
      adminList: [],
      userList: []
    };
  }

  componentDidMount() {
    let param = paramServer.getParam();
    if (param.roomId) {
      this.setState({
        param,
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
    if (!penging) {
      penging = true;
    } 
  };

  closeCall = e => {
    if (!penging) {
      penging = true;
    }
  };
  replyCall = type => {
    let res = type ? 'agree' : 'refuse'
    imClient.replyCall(
      this.props.data.UserId,
      res,
      (data) => {
        console.log(data,)
        this.setState({
          modalHide: true
        });
      }
    )

  };

  render() {
    // const param = paramServer.getParam();
    const {
      modalHide
    } = this.state
    const {
      isAdmin,
      data
    } = this.props;
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
                this.props.inRtc ? "callList_status blue" : "callList_status"
              }
            ></span>
          </div>
        </div>

        {/* 一次性显示，是否为老师的权限，是否在线列表 */}
        {(!this.props.inRtc && !modalHide && isAdmin === 2 ) ? (
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
