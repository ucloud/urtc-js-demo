import React from "react";
import sdk, { Client } from "urtc-sdk";
import "./settings.css";
import '@ucloud-fe/react-components/dist/icon.min.css';

import {Button,Input,Form,Select} from "@ucloud-fe/react-components";
const { Group, Item } = Form;
const { Option } = Select;
const itemLayout = {
    labelCol: {
        span: 2
    },
    controllerCol: {
        span: 10
    }
};
class Settings extends React.Component {
  constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: true,
            initData:{
                roomType:'',//房间类型
                userRole:'',//用户角色
                userName:'',//用户名
                videoInput:'',//摄像头
                audioInput:'',//麦克风
                audioOutput:''//扬声器
            },
            videoInputList:[],
            audioInputList:[],
            audioOutputList:[],
            videoProlieList:[],
            videoCodecList:[]
        };

    }
    componentDidMount() {
        this.getDeviceData();
        this.getSupportProfile();
        this.getSupportedCodec();
    }
    // componentWillUpdate(prevProps,prevState){
    //     console.log(prevProps)
    //     this.setState({
    //         settingsVisible: prevProps.visible
    //     })
    // }
    getSupportedCodec(){
        sdk.getSupportedCodec((e)=>{
            this.setState({
                videoCodecList:e.video
            })
        })
    }
    getSupportProfile(){
        console.log(sdk.getSupportProfileNames())
        this.setState({
            videoProlieList: sdk.getSupportProfileNames()
        })
    }
    getDeviceData(){
        let _this = this;
        let videoinput = [];
        let audioinput = [];
        let audiooutput = [];
        sdk.getDevices(function(e){
            console.log(e)
            e.forEach(function(data){
                if(data.kind === 'videoinput'){
                    videoinput.push(data)
                    console.log(data)
                }else if(data.kind === 'audioinput'){
                    audioinput.push(data)
                }else if(data.kind === 'audiooutput'){
                    audiooutput.push(data)
                }
            })
            _this.setState({
                videoInputList: videoinput,
                audioInputList: audioinput,
                audioOutputList: audiooutput
            })
        })
    }
    render() {
        const {videoInputList,
            audioInputList,
            audioOutputList,
            videoProlieList,
            videoCodecList} = this.state;
        return (
                <Form className="settings">
                    <Item label="房间类型：" {...itemLayout}>
                        <Select defaultValue={1} onChange={v => console.log(v)}>
                            <Option value={1}>小班课</Option>
                            <Option value={2}>大班课</Option>
                        </Select>
                    </Item>
                    <Item label="用户角色：" {...itemLayout}>
                        <Select defaultValue={1} onChange={v => console.log(v)}>
                            <Option value={1}>推流+拉流</Option>
                            <Option value={2}>推流</Option>
                            <Option value={3}>拉流</Option>
                        </Select>
                    </Item>
                    <Item label="用户名：" {...itemLayout}>
                        <Input />
                    </Item>
                    <Item label="摄像头：" {...itemLayout}>
                        <Select onChange={v => console.log(v)}>
                            {videoInputList.map((v,i)=>(
                                <Option key={i} value={v.deviceId}>
                                    {v.label}
                                </Option>
                            ))}
                        </Select>
                    </Item>
                    <Item label="麦克风：" {...itemLayout}>
                        <Select onChange={v => console.log(v)}>
                            {audioInputList.map((v,i)=>(
                                <Option key={i} value={v.deviceId}>
                                    {v.label}
                                </Option>
                            ))}
                        </Select>
                    </Item>
                    <Item label="扬声器：" {...itemLayout}>
                        <Select onChange={v => console.log(v)}>
                            {audioOutputList.map((v,i)=>(
                                <Option key={i} value={v.deviceId}>
                                    {v.label}
                                </Option>
                            ))}
                        </Select>
                    </Item>
                    <Item label="分辨率：" {...itemLayout}>
                        <Select onChange={v => console.log(v)}>
                            {videoProlieList.map((v,i)=>(
                                <Option key={i} value={v}>
                                    {v}
                                </Option>
                            ))}
                        </Select>
                    </Item>
                    <Item label="视频格式：" {...itemLayout}>
                        <Select onChange={v => console.log(v)}>
                            {videoCodecList.map((v,i)=>(
                                <Option key={i} value={v}>
                                    {v}
                                </Option>
                            ))}
                        </Select>
                    </Item>
                </Form>
            
        );
    }
}

export default Settings;
