import React from "react";
import ReactPlayer from "react-player"
import "./classRoom.css";
import sdk, { Client } from "urtc-sdk";
import config from "../config";
import {
  Icon,
} from "@ucloud-fe/react-components";
class ClassRoom extends React.Component {
  constructor(props) {
    super(props);
        this.state = {
          loading: false,
          localStream: null,
          remoteStreams: [],
          videoMute: false,
          audioMute: false
        };
        this.videoMute = this.videoMute.bind(this);
        this.audioMute = this.audioMute.bind(this);
    }
  componentDidMount() {
    console.log(this.props)
    let locationState = this.props.location.state;
    if(!locationState){
      this.props.history.push('/')
    }
    this.initURtc(locationState);
  }
  initURtc(data){
    console.log(data)
    let roomId = data.roomId;
    let userId = data.userId;
    let token = sdk.generateToken(config.AppId,config.AppKey, roomId, userId)
    this.Client = new Client(config.AppId, token);
    this.Client.joinRoom(roomId, userId,(e,s)=>{
      console.log(e)
      console.log(s)
      this.Client.setVideoProfile({
        profile:'1280*720'
      })
      this.Client.publish({
        audio:true,
        video:true
      })
    })
    this.Client.on('stream-published',(stream)=>{
      console.log(stream)
      if (stream.mediaType === 'camera') {
        this.setState({
          localStream: stream
        });
      }
    })
    this.Client.on("stream-added", stream => {
      console.log(stream)
      this.Client.subscribe(stream.sid, e => {
        console.log("subscribe failure ", e);
      });
    });
    this.Client.on('stream-subscribed',(stream)=>{
      console.log(stream)
      const { remoteStreams = [] } = this.state;
      remoteStreams.push(stream);
      this.setState({
        remoteStreams,
        // videoList: this.client.getRemoteStreams()
      });
    })
    this.Client.on("stream-removed", stream => {
      console.log("stream-removed ", stream);

      const { remoteStreams = [] } = this.state;
      const idx = remoteStreams.findIndex(item => stream.sid === item.sid);
      if (idx !== -1) {
        remoteStreams.splice(idx, 1);
      }
      this.setState({ remoteStreams });
    });
  }
  videoMute(){
    const {videoMute,localStream} = this.state;
    this.setState({
      videoMute:!videoMute
    })
    if(!videoMute){
      this.Client.muteVideo(localStream.sid)
    }else{
      this.Client.unmuteVideo(localStream.sid)
    }

    
  }
  audioMute(){
    const {audioMute,localStream} = this.state;
    this.setState({
      audioMute:!audioMute
    })
    if(!audioMute){
      this.Client.muteAudio(localStream.sid)
    }else{
      this.Client.unmuteAudio(localStream.sid)
    }
  }
  render() {
    
    const {localStream,
            remoteStreams,
            videoMute,
            audioMute} = this.state;
    console.log(localStream&&localStream.mediaStream)
    console.log(remoteStreams)
    return (
      <div className="room_main">
        {remoteStreams.map((stream,key)=>(
          <div className="remote-video" key={key}>
            <ReactPlayer 
              width="100%"
              height="100%"
              url={stream&&stream.mediaStream}
              playing
              playsinline
              />
          </div>
          
        ))}
        <ReactPlayer 
          width="73%"
          height="auto"
          className="local-video"
          url={localStream&&localStream.mediaStream}
          playing
          playsinline
          />
          <div className="operation-video">
            <div className={`operation-item ${videoMute ?'video-mute' :'' }`} onClick={this.videoMute} title="视频">
              <Icon type='video'/>
            </div>
            <div className={`operation-item ${audioMute ?'audio-mute' :'' }`} onClick={this.audioMute} title="麦克风">
              <Icon type='microphone'/>
            </div>
            <div className={`operation-item ${'volumeChange' ?'volume-change' :'' }`}  title="声音">
              <Icon type='volume'/>
            </div>
            <div className="operation-item" title="录制">
              <Icon type='sxt'/>
            </div>
            <div className="operation-item" title="屏幕分享">
              <Icon type='dashboard'/>
            </div>
            <div className="operation-item" title="离开房间">
              <Icon className="leave-room" type='cbox-01'/>
            </div>
            <div className="seetings-item" title="设置">
              <Icon className="settings-icon" type='ellipsis-verticle'/>
            </div>
          </div>
          <div className="network">
            <Icon className="network-icon" type='signal'/>
          </div>
          <div className="network-data">
            <Icon className="network-bar" type='bar-graph'/>
          </div>
      </div>
    );
  }
}

export default ClassRoom;
