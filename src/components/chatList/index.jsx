import React from "react";
import {
  Icon,
  Switch,
  Button,
  Input,
  Loading
} from "@ucloud-fe/react-components";
import paramServer from "../../common/js/paramServer";
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache
} from "react-virtualized";
import CustomModal from "../../container/customMessage/customModal";
import CustomDetail from "../../container/customMessage/customDetail";
import ChatDetail from "../../container/chatDetail/index";
import { imClient } from "../../common/serve/imServe.js";
import "./index.scss";
let num = 0
let chatPending = false;
const cache = new CellMeasurerCache({ defaultHeight: 30, fixedWidth: true });

class ChatList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      param: null,
      messageValue: "",
      chatList: [],
      disableChatBtnStatus: true, //全员禁言 ，false 解除禁言
      roomInfo: null,
      scrolling_pos: 0, //聊天列表定位行数
      customModalVisable: false, //自定义消息编辑弹出框是否显示
      customDetailShow: false, //自定义显示开关
      customDetail: null //自定义详情
    };

    this.chatList = React.createRef();
  }

  componentDidMount() {
    let param = paramServer.getParam();
    let config = this.wsConfig();
    console.log(param, config);
    this.setState({
          loading: false,
    });
    // 绑定消息处理方法
    // imClient.getHistoryChat(0,20,0, data => {
    //   console.log(data)
    //   let arr = data.filter(e => {
    //     return e !== undefined;
    //   });
    //   this.setState({
    //     loading: false,
    //     chatList: arr,
    //     scrolling_pos: arr.length - 1
    //   });
    // });
    // 接收消息
    this.imBindEvent("Msg");
    //接收自定义消息
    this.imBindEvent("CustomContent");
    //用户加入绑定坚挺
    this.imBindEvent("Users");
    if (param !== null) {
      let roomInfo = imClient.getRoomInfo();
      console.log('roomInfo',roomInfo)
      this.setState({
        param: param,
        roomInfo: roomInfo
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
    let tempChatList = [];
    let flag = false;
    return {
      Msg: data => {
        num += 1

        let { chatList } = this.state;
        let arr = chatList;
        arr.push(data);
        console.log("chatList>>>", data, tempChatList, arr, num);
        setTimeout(() => {
          this.setState({
            chatList: arr,
            scrolling_pos: arr.length - 1
          });
        }, 100);
     
      },
      Users: data => {
        this.setState({
            adminList: data.AdminUsers,
            usersList: data.defaultUsers,
        })
      },
      //自定义消息
      CustomContent: data => {
        const detail = JSON.parse(data.content);
        // console.log("detail>>>>:" ,detail)
       if(!detail.jumpUrl){
        return
       }
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
      },
    };
  };

  changeMegValue = e => {
    this.setState({
      messageValue: e.target.value
    });
  };

  // 输入框监听keyup 发送消息
  sendMeg = e => {
    // 暂时没做报错处理
    if (e.keyCode === 13 && this.state.messageValue !== "") {
        imClient.sendMsg(this.state.messageValue, () => {
          this.setState({
            messageValue: ""
          });
        });
    }
  };

  // 按钮发送消息
  sendMessage = () => {
    if(this.state.messageValue){
      imClient.sendMsg(this.state.messageValue, () => {
        this.setState({
          messageValue: ""
        });
      });
    }
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
    imClient.banRoom(
      !flag ? "ban" : "unban", 
      null,
      data => {
      console.log(">>>ban", flag, data);
      this.setState({
        disableChatBtnStatus: !flag
      });
    });
  };

  // 卸载组件
  componentWillUnmount() {

  }

  rowRenderer = ({ key, index, isScrolling, isVisible, style, parent }) => {
    const param = paramServer.getParam();
    const e = this.state.chatList[index];
    console.log(e)
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        <div key={key} style={style}>
          <ChatDetail
            key={index}
            content={e.message}
            userType={e.userType}
            isUser={e.userid === param.userId}
            // time={null}
            id={e.userid}
            name={e.userName}
          />
        </div>
      </CellMeasurer>
    );
  };


  //关闭自定义消息编辑框,获取数据
  subCustomModal = data => {
    console.log(data);
    imClient.sendCustomMsg("Ad", JSON.stringify(data), d => {
      console.log(">>>>closeCustomModal", d);
      this.setState({
        customModalVisable: false
      });
    });
  };
  closeCustomModal = () => {
    this.setState({
        customModalVisable: false
      });
  }

  render() {
    const {
      loading,
      messageValue,
      chatList,
      param,
      disableChatBtnStatus,
      scrolling_pos,
      customModalVisable,
      customDetailShow, //自定义显示开关
      customDetail //自定义详情
    } = this.state;
    const { _className } = this.props
    let iconType = disableChatBtnStatus ? "ban" : "ban-2";
    return (
      <div className={_className ? "chatList " : "chatList top31"}>
        <Loading loading={loading} style={{ height: "100%", width: "100%" }}>
          <div className="mic">
          </div>
          <div className="content">
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  rowCount={chatList.length}
                  rowHeight={cache.rowHeight}
                  overscanRowCount={20}
                  deferredMeasurementCache={cache}
                  scrollToIndex={scrolling_pos}
                  rowRenderer={this.rowRenderer}
                  width={width}
                />
              )}
            </AutoSizer>
          </div>
          <div className="msgWrapper">
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
            <Button
              size="lg"
              className="disChat"
              loading={false}
              icon={"qr-code"}
              styleType="border-gray"
              onClick={() => {
                this.setState({ customModalVisable: true });
              }}
            />
          </div>
        </Loading>

        {/* 自定义消息模块 */}
        <CustomModal show={customModalVisable} sub={this.subCustomModal} close={this.closeCustomModal}/>
        {customDetailShow ? (
          <CustomDetail
            detail={customDetail}
            show={customDetailShow}
            close={() => this.setState({ customDetailShow: false })}
          />
        ) : null}
      </div>
    );
  }
}

export default ChatList;
