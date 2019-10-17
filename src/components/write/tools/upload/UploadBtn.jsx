import * as React from "react";
import { Popover } from '@ucloud-fe/react-components';
import * as OSS from "ali-oss";
import Upload from 'rc-upload';
import {PptKind, WhiteWebSdk} from "white-react-sdk";

import {UploadManager} from "./UploadManager";

import "./UploadBtn.scss";
import image from "@/assets/images/pic.png";
import doc_to_image from "@/assets/images/ppt2s.png";
import doc_to_web from "@/assets/images/ppt2d.png";
// import * as upload from "../images/image.svg";

export const FileUploadStatic = "application/pdf, " +
    "application/vnd.openxmlformats-officedocument.presentationml.presentation, " +
    "application/vnd.ms-powerpoint, " +
    "application/msword, " +
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default class UploadBtn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: false,
        };
        this.client = new OSS({
            accessKeyId: props.oss.accessKeyId,
            accessKeySecret: props.oss.accessKeySecret,
            region: props.oss.region,
            bucket: props.oss.bucket,
        });
    }

    uploadStatic = (event) => {
        const uploadManager = new UploadManager(this.client, this.props.room);
        const whiteWebSdk = new WhiteWebSdk({ preloadDynamicPPT: true });
        const pptConverter = whiteWebSdk.pptConverter(this.props.roomToken);
        uploadManager.convertFile(
            event.file,
            pptConverter,
            PptKind.Static,
            this.props.onProgress).catch(error => alert("upload file error" + error));
    }

    uploadDynamic = (event) => {
        const uploadManager = new UploadManager(this.client, this.props.room);
        const whiteWebSdk = new WhiteWebSdk({ preloadDynamicPPT: true });
        const pptConverter = whiteWebSdk.pptConverter(this.props.roomToken);
        uploadManager.convertFile(
            event.file,
            pptConverter,
            PptKind.Dynamic,
            this.props.onProgress).catch(error => alert("upload file error" + error));
    }

    uploadImage = (event) => {
        const uploadFileArray = [];
        uploadFileArray.push(event.file);
        const uploadManager = new UploadManager(this.client, this.props.room);
        if (this.props.whiteboardRef) {
            const {clientWidth, clientHeight} = this.props.whiteboardRef;
            uploadManager.uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2, this.props.onProgress)
                .catch(error => alert("upload file error" + error));
        } else {
            const clientWidth = window.innerWidth;
            const clientHeight = window.innerHeight;
            uploadManager.uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2, this.props.onProgress)
                .catch(error => alert("upload file error" + error));
        }
    }

    renderPopoverContent = () => {
        return <div className="popover-box">
            <Upload
                style={{display:'inline-block'}}
                disabled={!this.props.roomToken}
                accept={FileUploadStatic}
                showUploadList={false}
                customRequest={this.uploadStatic}>
                <div className="popover-box-cell">
                    <div className="popover-box-cell-img-box">
                        <img src={doc_to_image} style={{height: '28px'}}/>
                    </div>
                    <div className="popover-box-cell-title">
                        资料转图片
                    </div>
                    <div className="popover-box-cell-script">支持 pdf、ppt、pptx、word</div>
                </div>
            </Upload>
            {/*
            <Upload
                style={{display:'inline-block'}}
                disabled={!this.props.roomToken}
                accept={"application/vnd.openxmlformats-officedocument.presentationml.presentation"}
                showUploadList={false}
                customRequest={this.uploadDynamic}>
                <div className="popover-box-cell">
                    <div className="popover-box-cell-img-box">
                        <img src={doc_to_web} style={{height: '28px'}}/>
                    </div>
                    <div className="popover-box-cell-title">
                        资料转网页
                    </div>
                    <div className="popover-box-cell-script">支持 pptx</div>
                </div>
            </Upload>
            */}
            <Upload
                style={{display:'inline-block'}}
                accept={"image/*"}
                showUploadList={false}
                customRequest={this.uploadImage}>
                <div className="popover-box-cell">
                    <div className="popover-box-cell-img-box">
                        <img src={image} style={{height: '28px'}}/>
                    </div>
                    <div className="popover-box-cell-title">
                        上传图片
                    </div>
                    <div className="popover-box-cell-script">支持常见图片格式</div>
                </div>
            </Upload>
        </div>;
    }

    render() {
        return (
            <Popover popup={this.renderPopoverContent()} placement="right">
                <div
                    onMouseEnter={() => this.setState({active: true})}
                    onMouseLeave={() => this.setState({active: false})}
                    className={`iconfont icon-folder-add ${this.state.active ? 'active': ''}`}>
                </div>
            </Popover>
        );
    }
}
