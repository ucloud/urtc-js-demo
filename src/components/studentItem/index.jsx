/* 
    聊天室学生列表item组件
    props:{

    }
*/

import React from 'react';
import {
    Button, Icon
} from '@ucloud-fe/react-components';

import paramServer from '../../common/js/paramServer';
import { banRoom} from '../../common/api/chat'
import './index.scss';
function ranColor() {
    let r = Math.floor(Math.random() * 255),
        g = Math.floor(Math.random() * 255),
        b = Math.floor(Math.random() * 255);
    return 'rgba(' + r + ',' + g + ',' + b + ',0.8)';
}

class StudentItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            param: null,
            color: ranColor(),
            isDisable: false,
        };
    }

    componentDidMount() {
        let param = paramServer.getParam();
        this.setState({
            param,
        })
    }

    outUser = () => {
        let flag = this.state.isDisable;
        banRoom(!flag, this.props.data.UserId).then(e => {
            if(e.data.Code === 200){
                this.setState({
                    isDisable: !flag,
                })
            }
        })
    }

    render() {
        const { param, isDisable } = this.state;
        let userInfo = JSON.parse(this.props.data.UserInfo)
        return (
            <div className="studentItem_main clearfix" >
                <div className="studentItem_content fl">
                    <p className="studentItem_head">
                        <span className="studentItem_head_bg" style={{ backgroundColor: this.state.color}}>
                        </span>
                        <span className="studentItem_head_name">
                            {userInfo.userName}
                        </span>
                    </p>
                </div>
                {param !== null && this.props.isTeacher?
                    <div className="fr btn_wrapper">
                        <Button shape="circle"  
                        onClick={this.outUser} 
                        disabled={!this.props.isTeacher} 
                        style={{ borderWidth: isDisable ? '0px' : '1px'}}
                        styleType="border" size="sm">
                            <Icon type={isDisable ?'ban':'microphone'} style={{color:'#000000'}} />
                            {/* 禁言 */}
                        </Button>
                    </div>
                    :
                    null
                }
            </div>
        );
    }
}

export default StudentItem;
