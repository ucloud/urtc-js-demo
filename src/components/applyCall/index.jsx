import React from 'react';
import {
    Icon, Switch
} from '@ucloud-fe/react-components';
import paramServer from '../../common/js/paramServer';
import {
    AuthCall, sendApplyCall, ReplyCall
} from '../../common/api/chat';
import './index.scss';

let penging = false;
class ApplyCall extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            param: null,
            modalHide:false,
            applyCallStatu:true,
        };
    }

    componentDidMount() {
        let param = paramServer.getParam();
        if (param.roomId) {
            this.setState({
                param,
            })
        }
    }

    openCall = e => {
        if (penging){
        }else{
            penging = true;
        }
        AuthCall(true).then((data) => {
            penging = false
        })
    }

    closeCall = e => {
        if (penging) {

        } else {
            penging = true;
           
        }
        AuthCall(false).then((data) => {
        })
    }
    
    checkTeach() {
        const param = paramServer.getParam()
        if (param == null || !param.hasOwnProperty('teachList')){
            return false
        }
        let arr = param.teachList.map((e) => {return e.UserId});
        let id = param.UserId 
        
        return arr.includes(id)
    }

    applyCall = () => {
        if (paramServer.getParam().teachList.length){
            let flag = this.state.applyCallStatu;
            sendApplyCall(paramServer.getParam().teachList[0].UserId, flag)
                .then((e) => {
                    this.setState({
                        applyCallStatu: !flag,
                    })
                })
        }
    }

    replyCall = (type) => {
        ReplyCall(this.props.applyuserid,type).then((data) => {
            this.setState({
                modalHide:true,
            })
        })
    }

    render() {
        const  param = paramServer.getParam()
        let { ReplyUserState, applyStatus, userInRtc} =  this.props;
        let isTeach = this.checkTeach();
        return (
            <div className="applyCall_main clearfix">
                {param && 
                    <div className="w100">
                        {/* 老师学生不同逻辑。老师负责开关。学生控制是否显示 */}
                        {isTeach ?
                        <div className="w100">
                                {!applyStatus ?
                                    <div onClick={this.openCall} className="clearfix w100">
                                        <div className="fl">
                                            <span className="icon_wrapper">
                                                <Icon type="microphone" />
                                            </span>
                                            <span className="text_wrapper">
                                                开放上麦
                                            </span>
                                        </div>
                                        <div className="fr" style={{marginRight:'10px'}}>
                                            <Switch checked={applyStatus} size={'sm'} />
                                        </div>
                                    </div>
                                    :
                                    <div onClick={this.closeCall} className="clearfix w100">
                                        <div className="fl">
                                            <span className="icon_wrapper">
                                                <Icon type="microphone" />
                                            </span>
                                            <span className="text_wrapper">
                                                关闭上麦
                                            </span>
                                        </div>
                                        <div className="fr" style={{ marginRight: '10px' }}>
                                            <Switch checked={applyStatus} size={'sm'}/>
                                        </div>
                                    </div>
                                }
                            </div>
                            :
                            <div className="w100">
                                {applyStatus ?
                                    <div onClick={this.applyCall} className="clearfix w100">
                                        <div className="fl">
                                            <span className="icon_wrapper">
                                                <Icon type={"microphone"} />
                                            </span>
                                            <span className="text_wrapper">
                                                上麦
                                            </span>
                                        </div>
                                        <div className="fr" style={{ marginRight: '10px' }}>
                                            <Switch checked={userInRtc} 
                                            // disabled={userInRtc} 
                                            size={'sm'} />
                                        </div>
                                    </div>
                                    :
                                    null
                                }
                            </div>
                        }
                    </div>
                }
            </div>
        );
    }
}

export default ApplyCall;
