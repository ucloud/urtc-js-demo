import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'unique-classnames';
import {
  Icon,
  Modal,
  Radio,
  Input,
} from "@ucloud-fe/react-components";
import './index.scss';

export default class extends Component {
  static propTypes = {
    client: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      isRecording: false,
      // recordId: '',
      filename: '',
      type: 'record', // relay, record, relay-and-record
      pushURL: [],   //
      showEditModal: false,
      showResultModal: false,
    };
    this.bucket = "urtc-test";
    this.region = "cn-bj";
  }

  startRecord = () => {
    const { client } = this.props;
    if (!client) {
      return;
    }
    const { type, pushURL } = this.state;
    let param = { };
    if (client.startMix) {
      switch (type) {
        case 'relay':
          param.type = 'relay';
          param.pushURL = pushURL;
          break;
        case 'relay-and-record':
          param.type = 'relay-and-record';
          param.bucket = this.bucket;
          param.region = this.region;
          param.pushURL = pushURL;
          break;
        case 'record':
        default:
          param.type = 'record';
          param.bucket = this.bucket;
          param.region = this.region;
      }

      client.startMix(param, (err, mix) => {
        if (err) {
          alert(`录制转推失败 ${err}`);
          return;
        }
        this.setState({
          isRecording: true,
          filename: mix.FileName,
        });
        console.log('start mix ', mix);
      });
    } else {
      if (type === 'relay-and-record') {
        param.relay = {
          fragment: 60
        }
      }
      param.bucket = this.bucket;
      param.region = this.region;

      client.startRecording(param, record => {
        console.log('start recording ', record);
        this.setState({
          isRecording: true,
          filename: record.FileName,
        });
      }, err => {
        alert(`录制转推失败 ${err}`);
      });
    }
  }

  stopRecord = () => {
    const { client } = this.props;
    if (!client) {
      return;
    }
    if (client.stopMix) {
      const { type } = this.state;
      client.stopMix({
        type
      }, (err, mix) => {
        if (err) {
          alert(`录制转推失败 ${err}`);
          return;
        }
        console.log('stop mix ', mix);
        this.setState({
          isRecording: false,
          showResultModal: true,
        });
      });
    } else {
      client.stopRecording(record => {
        console.log('stop recording ', record);
        this.setState({
          isRecording: false,
          showResultModal: true,
        });
      }, err => {
        alert(`录制转推失败 ${err}`);
      });
    }
  }

  toggleRecord = () => {
    const { isRecording } = this.state;
    if (isRecording) {
      this.stopRecord();
    } else {
      this.setState({
        showEditModal: true
      });
    }
  }

  isMix() {
    const { client } = this.props;
    return !!(client && client.startMix);
  }

  renderTxt() {
    const { isRecording } = this.state;
    return isRecording ? '结束录制/转推' : '开启录制/转推';
  }
  renderAddress() {
    const { filename } = this.state;
    return `http://${this.bucket}.${this.region}.ufileos.com/${filename}.mp4`;
  }

  handleChangeType = type => {
    this.setState({ type });
  }
  handleAddPushURL = () => {
    let { pushURL } = this.state;
    pushURL.push("");
    this.setState({ pushURL });
  }
  handleRemovePushURL = index => {
    let { pushURL } = this.state;
    pushURL.splice(index, 1);
    this.setState({ pushURL });
  }
  handlePushURL = (e, index) => {
    const val = e.target.value.trim();
    let { pushURL } = this.state;
    pushURL[index] = val;
    this.setState({ pushURL });
  }

  renderPushURL = () => {
    const { type, pushURL } = this.state;
    const isRelay = type === 'relay' || type === 'relay-and-record';
    if (!isRelay) {
      return null;
    }
    return (
      <div className="form-row device-id">
        <span style={{ display: "inline-block", width: "80px"}}>
          推流地址
        </span>
        <div className="push-url-container">
          {
            pushURL.map((url, idx) => {
              return (
                <div key={`${idx}`}>
                  <Input
                    onChange={e => {
                      this.handlePushURL(e, idx)
                    }}
                    style={{minWidth: '300px'}}
                    size="lg"
                    value={url}
                    placeholder="rtmp://xxx.xxx/xxx"
                  />
                  <Icon className="remove-btn" onClick={() => this.handleRemovePushURL(idx)} type="minus"/>
                </div>
              )
            })
          }
          <Icon className="add-btn" onClick={this.handleAddPushURL} type="plus"/>
        </div>
      </div>
    );
  }

  renderType = () => {
    const { type } = this.state;
    let types;
    if (this.isMix()) {
      types = ['record', 'relay', 'relay-and-record'];
    } else {
      types = ['record', 'relay-and-record'];
    }
    function convert(type) {
      let result;
      switch (type) {
        case 'relay':
          result = '转推';
          break;
        case 'relay-and-record':
          result = '录制并转推';
          break;
        case 'record':
        default:
          result = '录制';
      }
      return result;
    }
    return (
      <div className="form-row device-id">
        <span style={{ display: "inline-block", width: "80px" }}>
          录制/转推类型
        </span>
        <div style={{ display: "inline-block" }}>
          <Radio.Group
            onChange={this.handleChangeType}
            size="md"
            value={type}
            disabled={false}
          >
            {
              types.map(item => {
                return (
                  <Radio key={item} value={item}>
                    {convert(item)}
                  </Radio>
                )
              })
            }
            {/* <Radio key='update' value='update'>
              更新配置
            </Radio> */}
          </Radio.Group>
        </div>
      </div>
    );
  }

  renderEditModal = () => {
    const { showEditModal } = this.state;
    return (
        <Modal
          visible={showEditModal}
          onClose={() => {
            this.setState({
              showEditModal: false
            });
          }}
          onOk={() => {
            this.setState({
              showEditModal: false
            }, () => {
              this.startRecord();
            });
          }}
          isAutoClose={false}
          size={"md"}
          title="设置录制/转推参数"
        >
          { this.renderType() }
          { this.renderPushURL() }
        </Modal>
    )
  }

  renderResultModal = () => {
    const { showResultModal, type, pushURL } = this.state;
    let isRelay = type === 'relay' || type === 'relay-and-record';
    let isRecord = type === 'record' || type === 'relay-and-record';

    return (
      <Modal
        visible={showResultModal}
        onClose={() =>
          this.setState({
            showResultModal: false
          })
        }
        onOk={() =>
          this.setState({
            showResultModal: false
          })
        }
        isAutoClose={false}
        size={"sm"}
        title="录制/转推结束"
      >
        <div className="form-row device-id">
          <div className="push-url-container">
            {
              isRelay
                ? pushURL.map((url, idx) => <p className="push-url" key={idx}>{url}</p>)
                : null
            }
          </div>
          <div>
            {
              isRecord
                ? (
                  <a href={this.renderAddress()} target="_blank" rel="noopener noreferrer">
                    回看地址
                  </a>
                ) : null
            }
          </div>
        </div>
      </Modal>
    )
  }

  render() {
    const { isRecording } = this.state;
    const classes = classnames({'recording': isRecording});

    return (
      <div className="recording-video fr" style={{ display: 'inline-block', right: '180px' }}>
        <div onClick={this.toggleRecord}>
          <Icon className={classes} type="sxt"/>
          { this.renderTxt() }
        </div>

        <div style={{position: 'relative'}}>
          { this.renderEditModal() }
          { this.renderResultModal() }
        </div>
      </div>
    );
  }
}