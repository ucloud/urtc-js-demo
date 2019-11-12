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
  Select
} from "@ucloud-fe/react-components";
import { randNum } from "../../common/util/index";
import axios from "axios";
import { getText } from "../../common/dictMap/index";
import paramServer from "../../common/js/paramServer";

const { Item } = Form;
const verticalLayout = {};
const formLable = {
  roomId: "房间号",
  name: "名字",
  character: [
    { key: "1", value: "学生" },
    { key: "2", value: "老师" },
    // { key: '2', value: '监查', },
  ],
  submit: "加入",
  crouseType: [
    { key: '0', value: '小班课', },
    { key: "1", value: "大班课" },
  ]
};
let appData = {};
// paramServer.setParam( appData);

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      size: "md",
      disabled: false,
      role_type: formLable.character[1].key,
      roomId: "",
      name: "",
      room_type: 0,
      userTypeStyle:'none'
    };
  }

  componentDidMount() {}

  changeCharacter = e => {
    this.setState({
      role_type: e
    });
  };
  // 加入房间

  changName = e => {
    this.setState({
      name: e.target.value
    });
  };

  changRoomId = e => {
    this.setState({
      roomId: e.target.value
    });
  };

  joinRoom = () => {
    appData = {
      appId: "URtc-h4r1txxy",
      userId: randNum(8),
      // userId: '333',

      mediaType: "1", //桌面和摄像头采集类型
      appkey: "9129304dbf8c5c4bf68d70824462409f"
    };
    const { role_type, roomId, name, room_type } = this.state;
    this.setState({
      loading: true
    });
    let param = {
      room_type: room_type - 0,
      role_type: role_type - 0,
      roomId,
      name,
      ...appData
    };
    paramServer.setParam();
    paramServer.setParam(param);
    axios({
      method: "post",
      url: `https://${getText("im")}/JoinRoom`,
      data: {
        UserId: appData.userId,
        RoomId: roomId,
        Uuid: "",
        UserInfo: { userName: name, userType: role_type },
        UserType: role_type == 2 ? "admin" : "default"
      }
    }).then(data => {
      paramServer.setParam();
      paramServer.setParam(Object.assign(param, { ...data.data.Msg }));
      this.setState({
        loading: false
      });
      this.props.history.push({ pathname: `/class` });
    });
  };

  changeRoomtype = e => {
    this.setState({
      room_type: e
    });
    if(e == 0){
      this.setState({
        userTypeStyle: 'none',
        role_type:'2'
      });
    }else{
      this.setState({
        userTypeStyle: 'block',
        role_type:'1'
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

                    <Item label="">
                      <Radio.Group
                        onChange={this.changeCharacter}
                        value={role_type}
                        style={{display:this.state.userTypeStyle}}
                      >
                        {formLable.character.map((v, index) => (
                          <Radio key={index} value={v.key}>
                            {v.value}
                          </Radio>
                        ))}
                      </Radio.Group>
                    </Item>
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
