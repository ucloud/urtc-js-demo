/* eslint-disable */
import React from 'react';
import {
    Row, Col, Icon
} from '@ucloud-fe/react-components';
import {
   withRouter
} from 'react-router-dom';
import { randNum } from '../../common/util/index';
import paramServer from '../../common/js/paramServer';

import './index.scss';

class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            param:null,
        };
        this.isWatching = false;
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
        if (nextProps.client && !this.isWatching) {
            nextProps.client.on('network-quality', this.getNetworkQuality);
            this.isWatching = true;
        }
    }

    componentWillUnmount() {
        const { client } = this.props;
        if (client) {
            client.off('network-quality', this.getNetworkQuality);
            this.isWatching = false;
        }
        clearInterval(this.timer);
    }

    getNetworkQuality = (quality) => {
        this.setState({
            networkQuality: quality
        });
    }

    getMonitorData = (client, role) => {
        this.timer = setInterval(() => {
            let stream;
            if (role === 'pull') {
                stream = client.getRemoteStreams()[0];
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
    }

    goUcloud = () => {
        window.open('http://www.ucloud.cn');
    }

    renderVideoStats(videoStats) {
        const { br = 0, lostpre = 0 } = videoStats;

        const p = (br / 1000).toFixed(2);

        return <span>当前速率: { p }kb/s, 丢包率: {lostpre}%, </span>
    }
    renderNetworkStats(networkStats) {
        return <span>延迟: { networkStats.rtt }ms</span>
    }

    renderSignal(quality) {
        let color = '#bbbbbb';
        let tip = '质量未知';
        switch (quality) {
            case '0':
                color = '#bbbbbb';
                tip = '质量未知';
                break;
            case '1':
                color = '#4cd964';
                tip = '质量优秀';
                break;
            case '2':
                color = '#0cd964';
                tip = '质量良好';
                break;
            case '3':
                color = '#f9ce1d';
                tip = '质量一般';
                break;
            case '4':
                color = '#fc946a';
                tip = '质量较差';
                break;
            case '5':
                color = '#f0946a';
                tip = '质量糟糕';
                break;
            case '6':
                color = '#f44336';
                tip = '连接断开';
                break;
            default:
        }
        return (
            <span style={{marginLeft: '10px'}}>网络：
                <span title={tip} className="icon icon__signal" style={{fontSize: '16px', color: color}}></span>
            </span>
        );
    }

    render() {
        const { param} = this.state;
        const { videoStats = {}, networkStats = {}, networkQuality = {} } = this.state;
        const { uplink = '0' } = networkQuality;

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
                                    {/* this.renderVideoStats(videoStats) */}
                                    { this.renderNetworkStats(networkStats) }
                                    { this.renderSignal(uplink) }
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
