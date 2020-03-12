import React from "react";
import { Icon, Switch } from "@ucloud-fe/react-components";
import paramServer from "../../common/js/paramServer";
import { imClient } from "../../common/serve/imServe.js";
import "./index.scss";

let penging = false;
class ApplyCall extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      param: null,
      modalHide: false,
      applyCallStatu: true,
      applyStatus: true
    };
  }

  componentDidMount() {
    let param = paramServer.getParam();

    if (param.roomId) {
      let flag = param.roomInfo.CallOperation === "open" ? true : false;
      this.setState({
        param,
        applyStatus: flag
      });
    }
  }

  openCall = e => {
    let { param, applyStatus } = this.state;
    console.log(param);
    imClient.authCall(applyStatus ? "close" : "open", data => {
      this.setState({
        applyStatus: !applyStatus
      });
    });
  };

  render() {
    let { show } = this.props;
    let { applyStatus } = this.state;
    console.log("applyStatus", applyStatus);
    return (
      <div
        className="applyCall_main clearfix"
        style={{ display: show ? "block" : "none" }}
      >
        <div className="w100">
          <div className="w100">
            <div onClick={this.openCall} className="clearfix w100">
              <div className="fl">
                <span className="icon_wrapper">
                  <Icon type="microphone" />
                </span>
                <span className="text_wrapper">
                  {!applyStatus ? "开放上麦" : "关闭上麦"}
                </span>
              </div>
              <div className="fr" style={{ marginRight: "10px" }}>
                <Switch checked={applyStatus} size={"sm"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default ApplyCall;
