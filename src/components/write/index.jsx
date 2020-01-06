import React from 'react';
import { Loading } from '@ucloud-fe/react-components';
import classnames from 'unique-classnames';
import {
    WhiteWebSdk,
    RoomWhiteboard,
    DeviceType,
    RoomPhase
} from 'white-react-sdk';
import {
    withRouter
} from 'react-router-dom';

import paramServer from '../../common/js/paramServer';
import {PPTProgressPhase} from "./tools/upload/UploadManager";
import UploadBtn from "./tools/upload/UploadBtn";
import WhiteboardBottomRight from "./tools/ppt/BottomRight";
import MenuAnnexBox from "./menu/AnnexBox";

import '@/src/assets/iconfont/iconfont.css';
import './index.scss';
import {ossConfigObj} from "../../tokens.json";
import { getOffsetPointAndScale } from './utils';


const MenuInnerType = {
    HotKey: "HotKey",
    AnnexBox: "AnnexBox",
    PPTBox: "PPTBox",
    DocSet: "DocSet",
}

class Write extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currActive:'',
            phase: RoomPhase.Connecting,
            menuInnerState: MenuInnerType.HotKey,
            isMenuVisible: false,
        };
        this.didLeavePage = false;
    }

    componentWillMount() {
        window.addEventListener("resize", this.onWindowResize);
    }

    async componentDidMount() {
        await this.joinWhite();
    }

    componentWillUnmount() {
        this.didLeavePage = true;
        window.removeEventListener("resize", this.onWindowResize);
    }

    renderMenuInner = () => {
        switch (this.state.menuInnerState) {
            // case MenuInnerType.HotKey:
            //     return <MenuHotKey handleHotKeyMenuState={this.handleHotKeyMenuState}/>;
            case MenuInnerType.AnnexBox:
                if (!this.state.roomState || !this.state.roomState.sceneState) return null;
                return <MenuAnnexBox
                    isMenuOpen={this.state.isMenuVisible}
                    room={this.state.room}
                    roomState={this.state.roomState}
                    handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}/>;
            // case MenuInnerType.PPTBox:
            //     return <MenuPPTDoc
            //         room={this.state.room!}/>;
            default:
                return null;
        }
    }

    renderWhiteboard() {
        if (this.state.room) {
            return <RoomWhiteboard room={this.state.room} style={{ width: "100%", height: "100%" }} />;
        } else {
            return null;
        }
    }
    // getWhite(obj) {
    //     let param = paramServer.getParam();
    //     console.log(111)
    //     let _that = this;
    //     let role_type = 0;
    //     const sdkToken = param.Token;
    //     let url = 'https://cloudcapiv4.herewhite.com/room?token=' + sdkToken;
    //     const requestInit = {
    //         method: 'POST',
    //         headers: {
    //             "content-type": "application/json",
    //         },
    //         body: JSON.stringify({
    //             name: ' White room',
    //             limit: 100, // 房间人数限制
    //         }),
    //     };
    //     return new Promise(function (resolve, reject) {
    //         if (role_type === 0) {
    //                 fetch(url, requestInit).then(function (response) {
    //                     return response.json();
    //                 }).then(function (json) {
    //                     console.log(111)
    //                     console.log(json)
    //                     let whiteWebSdk = new WhiteWebSdk({
    //                         zoomMaxScale: 3,
    //                         zoomMinScale: 0.3,
    //                         urlInterrupter: url => url,
    //                     });
    //                     // _that.whiteid = json.msg.room.uuid;
    //                     return whiteWebSdk.joinRoom({
    //                         uuid: json.msg.room.uuid,
    //                         roomToken: json.msg.roomToken,
    //                     });
    //                 }).then(function (room) {
    //                     // Step3: 加入成功后想白板绑定到指定的 dom 中
    //                     // bind(room);
    //                     resolve('build white success');
    //                     const element = document.createElement('div');
    //                     element.setAttribute('id', 'whiteboard');
    //                     element.className = "white-board";
    //                     document.getElementById('whiteboard_wrapper').appendChild(element);
                        
    //                     room.bindHtmlElement(element);
    //                     _that.roomWhite = room;
    //                 }).catch(function (err) {
    //                     reject(err);
    //                 });
    //         } else {
    //             resolve('not allow create white,you can join in it');
    //         }

    //     })
    // }
    setWhiteboardLayerDownRef = (whiteboardLayerDownRef) => {
        this.setState({whiteboardLayerDownRef: whiteboardLayerDownRef});
    }

    onWindowResize = () => {
        if (this.state.room) {
            this.state.room.refreshViewSize();
        }
    }
 
    joinWhite = async () => {
        let whiteWebSdk = new WhiteWebSdk({ deviceType: DeviceType.Desktop, preloadDynamicPPT: true});
        let param = paramServer.getParam();
        const room = await whiteWebSdk.joinRoom({
            uuid: param.Uuid,
            roomToken: param.Token,
        }, {
            onPhaseChanged: phase => {
                if (!this.didLeavePage) {
                    this.setState({phase});
                }
            },
            onRoomStateChanged: modifyState => {
                // if (modifyState.roomMembers) {
                //     this.cursor.setColorAndAppliance(modifyState.roomMembers);
                // }
                this.setState({
                    roomState: {...this.state.roomState, ...modifyState},
                });
            },
        });
        room.setViewMode("broadcaster");

        const D_Width = 1200;
        const D_Height = 675;
        const { width, height } = this.state.whiteboardLayerDownRef.getBoundingClientRect();
        const scale1 = width / D_Width;
        const scale2 = height / D_Height;
        const scale = scale1 < scale2 ? scale1 : scale2;
        room.moveCameraToContain({
            originX: - D_Width/2,
            originY: - D_Height/2,
            width: D_Width,
            height: D_Height,
            animationMode: "immediately",
        });
        room.moveCamera({
            scale: scale,
        });

        room.refreshViewSize();

        // hack - 去除鼠标滚轮缩放画布，改为拖放画布行为
        const onMouseWheel = room.cameraman.onMouseWheel.bind(room.cameraman);
        room.cameraman.onMouseWheel = function(e) {
            const { scale, offsetPoint } = getOffsetPointAndScale(e.nativeEvent);
            e.scale = scale;
            e.offsetPoint = offsetPoint;
            onMouseWheel(e);
        }

        this.setState({
            uuid: param.Uuid,
            roomToken: param.Token,
            room,
            roomState: room.state
        });
    }
    //画笔
    writeActive(e,v){
        this.state.room.setMemberState({
            currentApplianceName: e
        })
        this.setState({
            currActive: e
        })
    }
    //选择
    viewActive(e){
        const { roomState } = this.state;
        let scale = roomState.zoomScale
        if(e === 'enlarge'){
            scale = scale * 1.1;
        }else{
            scale = scale * 0.9;
        }
        this.state.room.moveCamera({scale: scale});
        // this.state.room.moveCamera({
        //     // 均为可选参数
        //     // 视角中心，x，y 坐标原点为初始页面的额重点，xy 正方向分别为右侧，下侧。
        //     centerX: 50, // 视角中心坐标的 x 坐标
        //     centerY: 50, // 视角中心坐标的 y 坐标
        //     scale: this.scale, // 放缩比例
        //     animationMode: "immediately" // 2.2.2 新增 API，continuous:连续动画（默认），immediately: 瞬间完成
        // });
    }

    setMemberState = (modifyState) => {
        if (this.state.room) {
            this.state.room.setMemberState(modifyState);
        }
    }

    progress = (phase, percent) => {
        switch (phase) {
            case PPTProgressPhase.Uploading: {
                this.setState({ossPercent: percent * 100});
                break;
            }
            case PPTProgressPhase.Converting: {
                this.setState({converterPercent: percent * 100});
                break;
            }
            default:
                this.setState({ossPercent: 0});
                this.setState({converterPercent: 0});
        }
    }

    // handleHotKeyMenuState = () => {
    //     this.setState({
    //         isMenuVisible: !this.state.isMenuVisible,
    //         menuInnerState: MenuInnerType.HotKey,
    //         isMenuLeft: false,
    //     });
    // }
    handleAnnexBoxMenuState = () => {
        this.setState({
            isMenuVisible: !this.state.isMenuVisible,
            menuInnerState: MenuInnerType.AnnexBox,
            isMenuLeft: false,
        });
    }

    // handlePPtBoxMenuState = () => {
    //     if (this.state.isMenuVisible) {
    //         this.setState({
    //             isMenuVisible: !this.state.isMenuVisible,
    //         });
    //     } else {
    //         this.setState({
    //             isMenuVisible: !this.state.isMenuVisible,
    //             menuInnerState: MenuInnerType.PPTBox,
    //             isMenuLeft: true,
    //         });
    //     }
    // }

    render() {
        const { className } = this.props;

        const classes = classnames('write_main', className);
        return (
            <div className={classes}>
                {/*
                <div style={{position:'absolute',top:0,left:0,zIndex:999}}>{this.state.roomState && this.state.roomState.zoomScale}</div>
                */}
                {
                    this.state.isMenuVisible
                        ? <div className="menu-box">
                                {this.renderMenuInner()}
                            </div>
                        : null
                }
                <div className="write_active">
                    <span onClick={this.writeActive.bind(this,'selector')} className={`iconfont icon-mouse-pointer ${this.state.currActive ==='selector'?'active':''}`}></span>
                    <span onClick={this.writeActive.bind(this,'pencil')} className={`iconfont icon-edit ${this.state.currActive ==='pencil'?'active':''}`}></span>
                    <span onClick={this.writeActive.bind(this,'ellipse')} className={`iconfont icon-circle ${this.state.currActive ==='ellipse'?'active':''}`}></span>
                    <span onClick={this.writeActive.bind(this,'rectangle')} className={`iconfont icon-border ${this.state.currActive ==='rectangle'?'active':''}`}></span>
                    <span onClick={this.writeActive.bind(this,'text')} className={`iconfont icon-text ${this.state.currActive ==='text'?'active':''}`}></span>
                    <span onClick={this.writeActive.bind(this,'eraser')} className={`iconfont icon-eraser ${this.state.currActive ==='eraser'?'active':''}`}></span>
                    <span onClick={this.viewActive.bind(this,'enlarge')} className={`iconfont icon-zoomin ${this.state.currActive ==='enlarge'?'active':''}`}></span>
                    <span onClick={this.viewActive.bind(this,'reduce')} className={`iconfont icon-zoomout ${this.state.currActive ==='reduce'?'active':''}`}></span>
                    <UploadBtn
                        oss={ossConfigObj}
                        room={this.state.room}
                        roomToken={this.state.roomToken}
                        onProgress={this.progress}
                        whiteboardRef={this.state.whiteboardLayerDownRef}
                    />
                </div>
                <div id="whiteboard" className="white-board" ref={this.setWhiteboardLayerDownRef}>
                    {this.renderWhiteboard()}
                </div>
                {
                  this.state.roomState
                    ?
                        <WhiteboardBottomRight
                            roomState={this.state.roomState}
                            handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}
                            // handleHotKeyMenuState={this.handleHotKeyMenuState}
                            room={this.state.room}/>
                    : null
                }
            </div>
        );
    }
}

export default withRouter(Write);
