/* eslint-disable */
import React from "react";
import "./index.scss";
import {
  Loading,
  Input,
  Icon,
  Button,
  Tabs,
} from "@ucloud-fe/react-components";
import paramServer from "../../common/js/paramServer";
import StudentItem from "../studentItem/index";
import CallList from '../callList'
import ApplyCall from '../applyCall/index'
import ReplyButton from '../applyCall/applyButton'
import ChatList from "../chatList/index";
import { imClient } from "../../common/serve/imServe.js";

let chatPending = false;
let isUnmount = false;

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      param: null,
      imConfig: null,
      imInfo: null,
      contectConfig: null,
      messageValue: "",
      chatList: [],
      disableChatBtnStatus: true, //全员禁言 ，false 解除禁言
      userList: [],
      teachList: [],
      applyShow: true, // 教师连麦哦部分 现实隐藏
      ReplyUserState: null,
      replyShow: false, //学生上麦按钮显示
      applyuserid: "",
      callteamlist: [],
      roomInfo: null,
      tabKey: "1",
      scrolling_pos: 0, //聊天列表定位行数
      customDetailShow: false, //自定义显示开关
      customDetail: null, //自定义详情

    };
    // window.ws = null;
    this.chatClient = null;
    this.userList = React.createRef();
  }

  componentDidMount() {
    let param = paramServer.getParam();
    isUnmount = false;
    imClient.on("Users", obj => {
      console.log(obj)
      this.setState({
        userList: obj.defaultUsers
      });
    });
    // 更新连麦列表
    imClient.on("CallApply", array => {
      console.log('CallApply',array)
      this.setState({
        callteamlist: array,
        roomInfo:imClient.getRoomInfo(),
      });
      if(paramServer.getParam().role_type == 2){
        //大班课教师，收到消息到条连麦列表
        this.setState({
          tabKey:"2",
        });
      }
    });

    imClient.on('CallAuth',(data) => {
      if(data.operation == 'close' && paramServer.getParam().role_type == 1 ){
       this.setState({
        replyShow: false,
       })
      }else if(data.operation == 'open' && paramServer.getParam().role_type == 1){
        this.setState({
          replyShow: true,
         })
      }
    })

    imClient.on("CallReply", (data) => {
      console.log(data)
      this.setState({
        roomInfo:imClient.getRoomInfo(),
      });
    });
    
    if (param !== null) {
      let {role_type, room_type } = param
      console.log('param >>>>',param)
      //操作房间连麦权限部分判断
      let _s = this.state.applyShow
      let _rShow = this.state.replyShow
      let flag = param.roomInfo.CallOperation === "open" ? true :false

      //房间上麦权限判断
      if((room_type == 1 && role_type == 1) || room_type == 0){
        _s = false
      } else {
        _s = true
      }

      //学生上麦开关权限
      if(room_type == 1 && flag && role_type == 1){
        _rShow = true
      } else {
        _rShow = false
      }
    
      this.setState({
        param: param,
        userList:param.adminList,
        applyShow: _s,
        applyStatus: flag,
        replyShow: _rShow,
      });
    }
  }

  imBindEvent = type => {
    imClient.on(type, data => {
      this.wsConfig()[type](data);
    });
  };
  unbindEvent = type => {
    imClient.off(type);
  };
  // 封装ws接受消息处理的方法
  wsConfig = () => {
    return {
      Msg: data => {
        let arr = [...this.state.chatList, data];
        this.setState({
          chatList: arr,
          scrolling_pos: arr.length
        });
      },
      Users: data => {},
      //自定义消息
      CustomContent: data => {
        const detail = JSON.parse(data.content);
        this.setState({
          customDetailShow: true,
          customDetail: detail
        });

        if (detail.showTime) {
          setTimeout(() => {
            this.setState({
              customDetailShow: false
            });
          }, detail.showTime * 1000);
        }
      }
    };
  };

  // 卸载组件
  componentWillUnmount() {
    isUnmount = true;
  }

  changeMegValue = e => {
    this.setState({
      messageValue: e.target.value
    });
  };
  // 输入框监听keyup 发送消息
  sendMeg = e => {
    // 暂时没做报错处理
    if (e.keyCode === 13 && this.state.messageValue !== "") {
      !isUnmount &&
        imClient.sendMsg(this.state.messageValue, () => {
          this.setState({
            messageValue: ""
          });
        });
    }
  };
  // 按钮发送消息
  sendMessage = () => {
    !isUnmount &&
      imClient.sendMsg(this.state.messageValue, () => {
        this.setState({
          messageValue: ""
        });
      });
  };

  sendMsg = e => {
    // 限制发送
    if (!chatPending) {
      chatPending = true;
      imClient.sendMsg(this.state.messageValue, () => {
        this.setState({
          messageValue: ""
        });
      });
    }
  };

  //聊天室禁言
  disableChat = () => {
    let flag = this.state.disableChatBtnStatus;
    imClient.banRoom(flag ? "ban" : "unban", data => {
      console.log(">>>ban", flag);
      this.setState({
        disableChatBtnStatus: !flag
      });
    });
  };

  componentWillUnmount() {}

  changeTabKey = e => {
    this.setState({
      tabKey: e
    });
  };

  renderCallteamlist = (arr) => {
    console.log('renderCallteamlist', arr)
    if(arr && arr.length > 0 ){
      return (
        arr.map((e, index) => {
          return <CallList 
          inRtc={false} 
          isAdmin={this.state.param.role_type}
          key={index}
           data={e} />;
        })
      )
    } else {
      return []
    }
   
  }

  render() {
    const {
      userList,
      callteamlist,
      applyShow,
      tabKey,
      replyShow,
    } = this.state;
    console.log('imClient.getRoomInfo()',imClient.getRoomInfo());
    console.log('replyShow>>> ',replyShow)
    let class_top = applyShow || replyShow
    return (
      <div className="chat_main">
        <div className="chat_list_wrapper">
          <ApplyCall
            show={ applyShow }
            urtcInit = {this.props.urtcInit}
          />
          <ReplyButton 
            urtcInit = {this.props.urtcInit}
            show = { replyShow } 
          />
          <Tabs
            tabBarPosition={"top"}
            styleType="ink"
            onChange={this.changeTabKey}
            activeKey={tabKey}
            // style={{ backgroundColor:'#1166E4',color:'#ffffff',fontSize:'14px'}}
          >
            <Tabs.Pane key={"1"} tab={"聊天"} style={{ padding: 16 }}>
              <ChatList _className ={class_top}/>
            </Tabs.Pane>
            {paramServer.getParam().room_type === 1 ? (
              <Tabs.Pane
                key={"0"}
                tab={"学生(" + userList.length + ")"}
                style={{ padding: 16 }}
              >
                <div style={{}}>
                  <div className={class_top  ? "user_list" : "user_list top31"} ref={this.userList}>
                    {userList.map((e, index) => {
                      return (
                        <StudentItem
                          key={index}
                          data={e}
                          isTeacher={
                            paramServer.getParam().role_type == 2
                          }
                          id={e.UserId}
                          name={e.UserName}
                        />
                      );
                    })}
                  </div>
                </div>
              </Tabs.Pane>
            ) : null}
            {paramServer.getParam().room_type == 1 ? (
              <Tabs.Pane key={"2"} tab={"连麦"} style={{ padding: 16 }}>
                  <div className={class_top  ? "user_list" : "user_list top31"}>
                    {this.renderCallteamlist(callteamlist)}
                  </div>
              </Tabs.Pane>
            ) : null}
          </Tabs>
        </div>
      </div>
    );
  }
}
export default Chat;
