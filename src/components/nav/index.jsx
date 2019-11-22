import React from 'react';
import {
    Row, Col, Icon
} from '@ucloud-fe/react-components';
import {
   withRouter
} from 'react-router-dom';
import { randNum } from '../../common/util/index';

import { isHasUndefined} from '../../common/util/index.js';
import paramServer from '../../common/js/paramServer';
import {
    closeIM
} from '../../common/api/chat';
import './index.scss';


class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            param:null,
        };
    }

    componentDidMount() {
       let param = paramServer.getParam();
        this.setState({
            param,
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.client && !this.timer) {
            this.getMonitorData(nextProps.client, nextProps.role);
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    getMonitorData = (client, role) => {
        this.timer = setInterval(() => {
            let stream;
            if (role === 'pull') {
                stream = client.getStreams()[0];
            } else {
                stream = client.getStream();
            }
            if (stream) {
                client.getNetworkStats(stream.sid, (stats) => {
                    this.setState({
                        networkStats: stats
                    })
                });
                client.getVideoStats(stream.sid, (stats) => {
                    this.setState({
                        videoStats: stats
                    })
                });
            }
        }, 3000);
    };


    outRoom = () => {
        window.onbeforeunload = function (e) {
            return '确定离开此页吗？';
        }
        window.location.reload();
        return 
        closeIM().then((e) => {
            if(e.data.Code === 200){
                window.imClient.ws.close();
                delete window.imClient;
                paramServer.setParam({
                    appId: 'URtc-h4r1txxy',
                    userId: randNum(3),
                    // userId: '333',
                    mediaType: '1', //桌面和摄像头采集类型
                    appkey: '9129304dbf8c5c4bf68d70824462409f',
                })
                this.props.history.push({ pathname: `/` })
            }
        })
    }

    goUcloud = () => {
        window.open('http://www.ucloud.cn');
    }

    renderVideoStats(videoStats) {
        const { br = 0, lostpre = 0 } = videoStats;

        const p = (br / 1000).toFixed(2);
        const x = (lostpre * 100).toFixed(2);

        return <span>当前速率: { p }kb/s, 丢包率: {x}%, </span>
    }
    renderNetworkStats(networkStats) {
        return <span>延迟: { networkStats.rtt }ms</span>
    }

    render() {
        const { param} = this.state;
        const { videoStats = {}, networkStats = {}} = this.state;

        return (
            <div className="nav_main">
                <Row 
                    gutter={0}
                    style={{ padding:'0',}}>
                    <Col span={10}>
                        <div className="nav_title clearfix">
                            <p className="">
                                <span className='icon_wrapper ' onClick={this.goUcloud}>
                                    <span className="icon_wrapper_contain">

                                    </span>
                                </span>
                                <Icon type="file-video" />

                                <span className="name_wrapper">
                                    {param && <b>{param.userId + ' / ' + param.roomId}</b>}
                                </span>
                                <span className="monitor_wrapper">
                                    { this.renderVideoStats(videoStats) }
                                    { this.renderNetworkStats(networkStats) }
                                </span>
                            </p>
                            <p className="fr">
                            </p>
                        </div>
                    </Col>
                    <Col span={2}>
                        <div className="out_btn_wrapper clearfix">
                            <span className="nav_btn fr" onClick={this.outRoom}>
                                <b><Icon type='power'/> </b>
                                    退出
                            </span>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default withRouter(Nav);
