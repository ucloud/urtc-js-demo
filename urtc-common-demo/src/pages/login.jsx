import React from "react";
import "./login.css";
import '@ucloud-fe/react-components/dist/icon.min.css';
import Settings from "../components/settings"
import {randNum} from "../util";
import store from '../store';
import {userLogin} from '../store/actions'
import {
    Form,
    Input,
    Modal
  } from "@ucloud-fe/react-components";
const { Group, Item } = Form;

class Login extends React.Component {
  constructor(props) {
    super(props);
        this.state = {
            loading: false,
            setVisible: false,
            roomIdValue:''
        };
        this.joinIn = this.joinIn.bind(this);
        this.setting = this.setting.bind(this);
        this.setClose = this.setClose.bind(this);
        this.roomId = this.roomId.bind(this);
    }
    
    componentDidMount() {
        // store.dispatch(userLogin('2ds2e23e211'));
        // console.log(store.getState())
    }
    joinIn(){
        let roomId = this.state.roomIdValue;
        this.props.history.push({pathname:'/class',state:{roomId:roomId,userId:randNum(8)}})
    }
    setting(){
        this.setState({
            setVisible: true
        })
    }
    roomId(e){
        this.setState({
            roomIdValue: e.target.value
        })
        console.log(e.target.value)
    }
    setClose(){
        this.setState({
            setVisible: false
        })
    }
    render() {
        const {setVisible} = this.state;
        return (
        <div className="login">
            <div className="login-wrapper">
                
                <input type="text" className="room-id" onChange={this.roomId}/>
                <button className="join-in" onClick={this.joinIn}>加入房间</button>
                <div className="active-btn">
                    <button className="setting" onClick={this.setting}>设置</button>
                    <button className="detecting">检测</button>   
                </div>
            </div>
            <Modal
                visible={setVisible}
                size='md'
                onClose={this.setClose}
                onOk={this.setClose}
            >
                <Settings visible={setVisible}/>
            </Modal>
        </div>
        );
    }
}

export default Login;
