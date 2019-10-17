import React from 'react';
import {
    Button
} from '@ucloud-fe/react-components';
import './index.scss';
import ReactPlayer from 'react-player';
import {
    withRouter
} from 'react-router-dom';
import paramServer from '../../common/js/paramServer';

class SubscribeVideo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currActive:''
        };
        // this.online = this.online.bind(this);
    }
    componentWillReceiveProps() {
        this.data = this.props;
    } 
    // 根据流提供ID，从学生列表里获取学生姓名
    getUserInfoName = (e) => {
        let arr = paramServer.getParam().userList.concat(paramServer.getParam().teachList);
        let id = e.userId;
        let name = '';
        arr.map((data) => {
            if (data.UserId == id){
                let n = JSON.parse(data.UserInfo).userName;
                name = n 
            }
        })
        return name ? name : id
    }
    
    render() {
        return (
            <div className={'subscribe '}>
                {/* <Button onClick={this.online}>上麦</Button> */}
                <div className="subscribe_content">
                    {this.props.data.map((e,v)=>{
                        let name = this.getUserInfoName(e)
                        return(
                            <div className="video_wrapper" style={{ display: 'inline-block',marginRight:'5px'}} key={e.time}>
                                <ReactPlayer width="160px" height="120px" url={e.stream} playing 
                                    muted={e.curr}
                                />
                                <div className="video_userInfo">
                                    <span className="head_bg" style={{ backgroundColor: this.state.color }}>
                                    </span>
                                    <span className="head_name">
                                        {name}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }
}

export default SubscribeVideo;
