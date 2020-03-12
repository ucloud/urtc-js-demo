import React from "react";
import { Icon, Switch } from "@ucloud-fe/react-components";
import paramServer from "../../common/js/paramServer";
import { imClient } from "../../common/serve/imServe.js";

import "./index.scss";

class ReplyButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      param: null,
      modalHide: false,
      applyCallStatu: true,
      userInRtc: false
    };
  }

  componentDidMount() {
    let param = paramServer.getParam();

    imClient.on('CallAuth',(data) => {
      if(data.operation == 'close' && paramServer.getParam().role_type == 1){
       this.setState({
        userInRtc: false,
       })
      }
    })

    if (param.roomId) {
      let flag = param.roomInfo.CallOperation === "open" ? true :false
      this.setState({
        param,
        applyStatus: flag
      });
    }
  }

  applyCall = () => {
    let {userInRtc, param } = this.state;
    imClient.applyCall(param.userId,userInRtc ? "cancel" : "apply", data => {
      if(param.userId,userInRtc){
        this.props.urtcInit()
      }
      this.setState({
        userInRtc: !userInRtc
      });
    });
  };


  render() {
    const param = paramServer.getParam();
    let { show } = this.props;
    let {userInRtc} = this.state;
    return (
      <div
        className="applyCall_main clearfix"
        style={{ display: show ? "block" : "none" }}
      >
        {param && (
          <div className="w100">
            <div className="w100">
              <div onClick={this.applyCall} className="clearfix w100">
                <div className="fl">
                  <span className="icon_wrapper">
                    <Icon type={"microphone"} />
                  </span>
                  <span className="text_wrapper">上麦</span>
                </div>
                <div className="fr" style={{ marginRight: "10px" }}>
                  <Switch checked={userInRtc} size={"sm"} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ReplyButton;
