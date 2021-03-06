import React from "react";
import "./index.scss";
import {
  Form,
  Input,
  Row,
  Col,
  Radio,
  Button,
  Loading,
  Select,
} from "@ucloud-fe/react-components";
import { randNum } from "../../common/util/index";
import paramServer from "../../common/js/paramServer";
import { createClient, imClient } from "../../common/serve/imServe.js";
import { formLable } from "../../common/config/project";
import config from "../../../config";
const { Item } = Form;
const verticalLayout = {};

let appData = {};
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      size: "md",
      disabled: false,
      role_type: formLable.character[0].key,
      roomId: "",
      name: "",
      room_type: 0,
      userTypeStyle: "none",
    };

    if (window.location.protocol !== "https:") {
      const { location } = window;
      if (!["localhost", "127.0.0.1"].includes(location.hostname)) {
        alert("http 的站点不支持 WebRTC，将跳转到 https 的站点");
        window.open(
          `https://${location.host}${location.pathname}${location.search}`,
          "_self"
        );
      }
    }
  }

  componentDidMount() {}

  changeCharacter = (e) => {
    this.setState({
      role_type: e,
    });
  };
  // 加入房间

  changName = (e) => {
    this.setState({
      name: e.target.value,
    });
  };

  changRoomId = (e) => {
    this.setState({
      roomId: e.target.value,
    });
  };

  joinRoom = () => {
    if (!config.appId || !config.appkey) {
      alert("请填写appId 或 appkey");
      return;
    }
    appData = {
      appId: config.appId,
      userId: randNum(8),
      mediaType: "1", //桌面和摄像头采集类型
      appkey: config.appkey,
    };
    const { role_type, roomId, name, room_type } = this.state;
    this.setState({
      loading: true,
    });
    let param = {
      room_type: room_type - 0,
      role_type: room_type == 0 ? 2 : role_type - 0,
      roomId,
      name,
      ...appData,
    };
    this.joinIM(param);
  };

  //加入im房间
  joinIM(param) {
    createClient(appData.appId);
    let type = "admin";
    if (param.room_type == 1) {
      //大班课
      type = param.role_type == 2 ? "admin" : "default";
    }
    imClient.joinRoom(param.roomId, param.userId, type, param.name, (data) => {
      imClient.createWhite((whiteData) => {
        let { uuid, token } = whiteData;
        paramServer.setParam(
          Object.assign(
            {
              defaultList: data.defaultUsers,
              adminList: data.adminUsers,
              roomInfo: data.roomInfo,
              Token: token,
              Uuid: uuid,
            },
            param
          )
        );
        this.setState({
          loading: false,
        });
        this.props.history.push({ pathname: `/class` });
      });
    });
  }
  changeRoomtype = (e) => {
    this.setState({
      room_type: e,
    });
    if (e === 0) {
      this.setState({
        userTypeStyle: "none",
        role_type: "2",
      });
    } else {
      this.setState({
        userTypeStyle: "block",
        role_type: "1",
      });
    }
  };

  goUcloud = () => {
    window.open("www.ucloud.cn");
  };
  render() {
    const { size, role_type, roomId, name, loading, room_type } = this.state;
    return (
      <div className="login_main">
        <div className="content clearfix">
          <Loading
            loading={loading}
            tip={"joining..."}
            style={{ height: "100%", width: "100%" }}
          >
            <a
              href="https://www.ucloud.cn/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={this.goUcloud}
            >
              <p className="bg_img_content"></p>
            </a>
            <div className="form_wrapper">
              <p className="u_icon_company"></p>
              <Row>
                <Col span={8}>
                  <Form size={size} style={{ textAlign: "left" }}>
                    <Item label="课程类型">
                      <Select
                        className="input"
                        defaultValue={room_type + ""}
                        onChange={this.changeRoomtype}
                      >
                        {formLable.crouseType.map((v, index) => (
                          <Select.Option
                            key={index}
                            value={v.key}
                            style={{ width: "151px" }}
                          >
                            {v.value}
                          </Select.Option>
                        ))}
                      </Select>
                    </Item>
                    <Item label={formLable.roomId} {...verticalLayout}>
                      <Input
                        value={roomId}
                        size={size}
                        className="input"
                        placeholder="请输入房间号"
                        onChange={this.changRoomId}
                      />
                    </Item>
                    <Item label={formLable.name} {...verticalLayout}>
                      <Input
                        size={size}
                        className="input"
                        placeholder="请输入姓名"
                        value={name}
                        onChange={this.changName}
                      />
                    </Item>

                    {room_type == 1 ? (
                      <Item label="">
                        <Radio.Group
                          onChange={this.changeCharacter}
                          value={role_type}
                          style={{ display: this.state.userTypeStyle }}
                        >
                          {formLable.character.map((v, index) => (
                            <Radio key={index} value={v.key}>
                              {v.value}
                            </Radio>
                          ))}
                        </Radio.Group>
                      </Item>
                    ) : null}
                  </Form>
                  <Button className="submit_btn" onClick={this.joinRoom}>
                    <span className="text">{formLable.submit}</span>
                  </Button>
                </Col>
              </Row>
            </div>
          </Loading>
        </div>
      </div>
    );
  }
}

export default Login;
