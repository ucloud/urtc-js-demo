import React from "react";
import "./index.scss";
import {
  Loading,
  Input,
  Icon,
  Button,
  Tabs
} from "@ucloud-fe/react-components";
import axios from "axios";
import { Client } from "../../common/js/socket";
import paramServer from "../../common/js/paramServer";
import ChatDetail from "../../container/chatDetail/index";
import StudentItem from "../studentItem/index";
import ApplyCall from "../applyCall";
import CallList from "../callList";
import { getText } from "../../common/dictMap/index";
import {
  closeIM,
  contectWs,
  pushMessage,
  banRoom,
  GetRoomUser,
  ReplyCall,
  GetRoomInfo,
  sendApplyCall
} from "../../common/api/chat";

let wsUrl = "wss://im.urtc.com.cn/sub";
let heartCheck = {
  timeout: 3000, //60ms
  timeoutObj: null,
  reset: function() {
    clearTimeout(this.timeoutObj);
    this.start();
  },
  start: function(fn) {
    this.timeoutObj = setTimeout(function() {}, this.timeout);
  }
};
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
      applyStatus: true, //false 关闭 open 开启
      ReplyUserState: null,
      applyuserid: "",
      callteamlist: [],
      isRtcList: [],
      roomInfo: null,
      tabKey: "1"
    };
    // window.ws = null;
    this.chatList = React.createRef();
    this.userList = React.createRef();
  }

  componentDidMount() {
    let param = paramServer.getParam();
    isUnmount = false;
    let _this = this;
    if (param === null) {
    } else {
      this.setState(
        {
          param: param
        },
        () => {
          // ws
          contectWs().then(res2 => {
            //获取用户列表
            this.setState({
              loading: false
            });
            let param = paramServer.getParam();

            this.getUserList();
            this.getRoomInfo();
            // ws操作
            window.imClient = new Client({
              notify: function(data) {
                let _d = JSON.parse(data);
                // console.error(_d);
                let type = _d.imtype;
                switch (type) {
                  case "IMMsg":
                    _this.wsConfig(_d.msg).IMMsg();
                    break;
                  case "IMBan":
                    break;
                  case "IMUsers":
                    _this.wsConfig(_d.msg).IMUsers();
                    break;
                  case "IMCallAuth":
                    _this.wsConfig(_d.msg).IMCallAuth();
                    break;
                  case "IMCallApply":
                    _this.wsConfig(_d.msg).IMCallApply();
                    break;
                  case "IMCallReply":
                    _this.wsConfig(_d.msg).IMCallReply();
                    break;
                }
              },
              param: {
                ...param
              },
              close: () => {
                !isUnmount && closeIM();
              }
            });
            // paramServer.setParam(Object.assign({ imClient: imClient }, param))
          });
        }
      );
    }
  }

  // 封装ws接受消息处理的方法
  wsConfig = data => {
    return {
      IMMsg: () => {
        let arr = this.state.chatList;
        arr.push(data);
        this.setState(
          {
            chatList: arr
          },
          () => {
            let h = this.chatList.current;
            if (h) {
              h.scrollTop = h.scrollHeight;
            }
          }
        );
      },
      IMBan: () => {},
      IMUsers: () => {
        !isUnmount && this.getUserList();
        this.setState({
          userList: [].concat(data.users)
        });
      },
      IMCallAuth: () => {
        console.error(paramServer.getParam(), this.state.callteamlist);

        if (
          data.operation == "close" &&
          paramServer.getParam().role_type == "1"
        ) {
          // 进行关闭麦克风操作,判断当前是否在麦上
          let arr = paramServer.getParam().rtcList;
          console.log(arr);
          arr.map(e => {
            console.error(e.userId == paramServer.getParam().UserId);
            if (e.userId == paramServer.getParam().UserId) {
              sendApplyCall(paramServer.getParam().teachList[0].UserId, false);
              this.props.urtcInit();
            }
          });
        }
        // if (paramServer.getParam().role_type == '2'){
        //     this.props.urtcInit();
        // }
        this.setState({
          applyStatus: data.operation == "open"
        });
      },
      IMCallApply: () => {
        this.setState({
            tabKey:'2'
        })
        let idList = [];
        let targetId = "";
        let list = data.callteamlist == null ? [] : data.callteamlist;

        let arr = list.map(e => {
          idList.push(e.UserId);
          return {
            UserId: e.UserId,
            UserInfo: JSON.parse(e.UserInfo)
          };
        });

        // 学生主动下麦，判断
        let oldArr = this.state.callteamlist;
        if (
          list.length < oldArr.length &&
          paramServer.getParam().role_type == "1"
        ) {
          // 进行关闭麦克风操作,判断当前是否在麦上
          let target = [];
          let oldIdArr = oldArr.map(e => {
            return e.UserId;
          });
          let newArr = list.map(e => {
            return e.UserId;
          });
          oldArr.map((e, index) => {
            //老数组存在，寻数组不存在，则为下麦的学生id
            if (oldIdArr.includes(e.UserId) && !newArr.includes(e.UserId)) {
              // 判断学生id与当前学生相等
              if (e.UserId == paramServer.getParam().userId) {
                this.props.urtcInit();
              }
            }
          });
        }

        this.setState({
          applyuserid: data.applyuserid,
          callteamlist: arr,
          ReplyUserState: data.replyuserid == paramServer.getParam().userId
        });
      },
      IMCallReply: () => {
        if (
          data.operation == "agree" &&
          data.replyuserid == paramServer.getParam().userId
        ) {
          this.props.changeDataList();
        }
        this.setState({
          ReplyUserState: false
        });
      }
    };
  };

  getRoomInfo = () => {
    !isUnmount &&
      GetRoomInfo().then(data => {
        if (!data.data.Msg.CallTeamList) return;
        let arr = data.data.Msg.CallTeamList.map(e => {
          return {
            UserId: e.UserId,
            UserInfo: JSON.parse(e.UserInfo)
          };
        });
        this.setState({
          callteamlist: arr,
          roomInfo: data.data.Msg,
          applyStatus: data.data.Msg.CallOperation === "open"
        });
      });
  };

  getUserList = () => {
    !isUnmount &&
      GetRoomUser().then(data => {
        if (data.data.Code === 200) {
          let o = paramServer.getParam();
          o.teachList = data.data.Msg.AdminUsers;
          paramServer.setParam(
            Object.assign({ userList: data.data.Msg.TeamUsers }, o)
          );
          this.setState({
            userList: data.data.Msg.TeamUsers,
            teachList: data.data.Msg.AdminUsers
          });
        }
      });
  };

  // 白板 token
  getIMToken = () => {
    axios({
      method: "post",
      url: `https://${getText("im")}/GetToken`,
      data: {
        UserId: this.props.appData.userId,
        RoomId: this.state.param.roomId
      }
    }).then(
      resp => {
        if (resp.data.Code === 200) {
          this.setState({
            imConfig: resp.data.Msg,
            loading: false
          });
        }
      },
      err => {}
    );
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
      !isUnmount && this.sendMsg(this.state.messageValue);
    }
  };
  // 按钮发送消息
  sendMessage = () => {
    !isUnmount && this.sendMsg(this.state.messageValue);
  };

  sendMsg = e => {
    if (chatPending) {
      // 限制发送
    } else {
      chatPending = true;
      pushMessage(e).then(data => {
        chatPending = false;
        if (data.data.Code === 200) {
          this.setState({
            messageValue: ""
          });
        }
      });
    }
  };

  //聊天室禁言
  disableChat = () => {
    let flag = this.state.disableChatBtnStatus;
    !isUnmount &&
      banRoom(flag).then(data => {
        if (data.data.Code === 200) {
          this.setState({
            disableChatBtnStatus: flag ? false : true
          });
        }
      });
  };

  callTeam = e => {
    ReplyCall(e.UserId, true).then(data => {
      console.log(data);
    });
  };

  componentWillUnmount() {
    // window.ws = null;
  }

  changeTabKey = (e) => {
      this.setState({
          tabKey:e
      })
  }

  render() {
    const {
      loading,
      messageValue,
      chatList,
      param,
      disableChatBtnStatus,
      userList,
      applyStatus,
      ReplyUserState,
      applyuserid,
      callteamlist,
      roomInfo,
      tabKey
    } = this.state;
    let iconType = disableChatBtnStatus ? "ban" : "ban-2";
    let rtcList = this.props.loadList.map(e => {
      return e.userId;
    });
    let isRtcLists = [];
    let stuList = [];
    let userInRtc = false;
    callteamlist.map(e => {
      if (e.UserId == paramServer.getParam().userId) {
        userInRtc = true;
      }
      if (rtcList.includes(e.UserId)) {
        isRtcLists.push(e);
      } else {
        stuList.push(e);
      }
    });

    let micFlag = paramServer.getParam().role_type == 1 && applyStatus;
    return (
      <div className="chat_main">
        <Loading loading={loading} style={{ height: "100%", width: "100%" }}>
          <div className="chat_list_wrapper">
            <Tabs
              tabBarPosition={"top"}
              styleType="ink"
              onChange={this.changeTabKey}
              activeKey={tabKey}
              // style={{ backgroundColor:'#1166E4',color:'#ffffff',fontSize:'14px'}}
            >
              <Tabs.Pane key={"1"} tab={"聊天"} style={{ padding: 16 }}>
                <div style={{}}>
                  <div
                    className={
                      (paramServer.getParam().room_type == 1)&&(paramServer.getParam().role_type == 2 || micFlag)
                        ? "chat_list"
                        : "chat_list top31"
                    }
                    ref={this.chatList}
                  >
                    {chatList.map((e, index) => {
                      return (
                        <ChatDetail
                          key={index}
                          content={e.message}
                          userInfo={JSON.parse(e.userinfo)}
                          isUser={e.userid === param.userId}
                          // time={null}
                          id={e.userid}
                          name={JSON.parse(e.userinfo).userName}
                        />
                      );
                    })}
                  </div>

                  <div className="chat_list_content">
                    <p className="input">
                      <Input
                        onChange={this.changeMegValue}
                        onKeyUp={this.sendMeg}
                        value={messageValue}
                        size={"lg"}
                        style={{ width: "100%" }}
                        icon={
                          <Button
                            onClick={this.sendMessage}
                            size="lg"
                            className="sendBtn"
                            styleType="primary"
                          >
                            <Icon type="message" />
                          </Button>
                        }
                      />
                    </p>
                    <Button
                      disabled={param && param.role_type != 2}
                      size="lg"
                      className="disChat"
                      loading={false}
                      icon={iconType}
                      styleType="border-gray"
                      onClick={this.disableChat}
                    />
                  </div>
                </div>
              </Tabs.Pane>
              {paramServer.getParam().room_type == 1?
              <Tabs.Pane
                key={"0"}
                tab={"学生(" + userList.length + ")"}
                style={{ padding: 16 }}
              >
                <div style={{}}>
                  <div
                    className={
                      (paramServer.getParam().room_type == 1)&&(paramServer.getParam().role_type == 2 || micFlag)
                        ? "user_list"
                        : "user_list top31"
                    }
                    ref={this.userList}
                  >
                    {userList.map((e, index) => {
                      return (
                        <StudentItem
                          key={index}
                          data={e}
                          isTeacher={param.role_type === 2}
                          id={e.userid}
                          name={e.userid}
                        />
                      );
                    })}
                  </div>
                </div>
              </Tabs.Pane>
              :null}
              {paramServer.getParam().room_type == 1?
               <Tabs.Pane key={"2"} tab={"连麦"} style={{ padding: 16 }}>
               <div style={{}}>
                 <div
                   className={
                    paramServer.getParam().room_type == 0|| paramServer.getParam().role_type == 2 || micFlag
                       ? "callList"
                       : "callList top31"
                   }
                 >
                   {isRtcLists.length
                     ? isRtcLists.map((e, index) => {
                         return <CallList isRtc={true} key={index} data={e} />;
                       })
                     : null}
                   {stuList.length
                     ? stuList.map((e, index) => {
                         return (
                           <CallList isRtc={false} key={index} data={e} />
                         );
                       })
                     : null}
                 </div>
               </div>
             </Tabs.Pane>
           :
           null
              }
             </Tabs>
          </div>
          {paramServer.getParam().room_type == 1 && (paramServer.getParam().role_type == 2 || micFlag) && (
            <ApplyCall
              applyuserid={applyuserid}
              applyStatus={applyStatus}
              ReplyUserState={ReplyUserState}
              userInRtc={userInRtc}
            />
          )}
        </Loading>
      </div>
    );
  }
}

export default Chat;
