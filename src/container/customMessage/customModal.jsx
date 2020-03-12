import React from "react";
import "../../common/scss/index.scss";
import "./index.scss";
import {
  Input,
  Form,
  Modal,
  Message,
} from "@ucloud-fe/react-components";
const { Item } = Form;
const itemLayout = {
  labelCol: {
    span: 2
  },
  controllerCol: {
    span: 8
  }
};

/**
 * @description 自定消息配置弹出框 ,主要设置跳转地址，图片地址，文案以及价格， type等图标自定义需要跟客户沟通完善
 * @requires 
 * @returns {
  * show  bool  显示隐藏状态
  * close func  关闭函数
 * }
 */
export default class CustomModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: this.props.show,
      param: {
        jumpUrl:"",
        imgUrl: "",
        price: "",
        text: "", //标题，20字内
        showTime: "" //显示时间 单位秒 默认15sec
      }
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps, prevProps){
    if(prevProps.show !== nextProps.show){
      this.setState({
        visible:nextProps.show
      });
    }
  }

  updataParam(type,value){
    let {param } = this.state
    console.log(value)
    let newParam = Object.assign(param,{})
    newParam[type] = value.target.value
    this.setState({
      param: newParam,
    });
  }

  close = () => {
    this.props.close()
    this.setState({
      visible: false
    });
    
  }

  submit = () => {
    let { param } = this.state;
    if(param.jumpUrl && param.imgUrl && param.price && param.text){
      this.props.sub && this.props.sub(param);
    }else{
      Message.error('参数不全，请补全')
    }
  }

  render() {
    const {
      visible,
      param,
    } = this.state
    return (
      <div className="custom_modal clearfix">
        <Modal
          visible={visible}
          size="md"
          zIndex={100}
          closable={true}
          mask={true}
          maskClosable={true}
          keyboard={true}
          destroyOnClose={false}
          onClose={this.close}
          onOk={this.submit}
          title="配置自定义消息"
        >
          <div className="custom_modal_form_wrapper">
            <Form className="demo-form">
              <Item label="跳转地址" {...itemLayout}>
                <Input
                  onChange={this.updataParam.bind(this, "jumpUrl")}
                  value={param.jumpUrl}
                  size={"lg"}
                  style={{ width: "100%" }}
                  placeholder={"请输入跳转地址"}
                />
              </Item>

              <Item label="图片地址" {...itemLayout}>
                <Input
                  onChange={this.updataParam.bind(this, "imgUrl")}
                  value={param.imgUrl}
                  size={"lg"}
                  style={{ width: "100%" }}
                  placeholder={"请输入图片地址"}
                />
              </Item>

              <Item label="价格" {...itemLayout}>
                <Input
                  onChange={this.updataParam.bind(this, "price")}
                  value={param.price}
                  size={"lg"}
                  style={{ width: "100%" }}
                  placeholder={"请输入价格"}
                />
              </Item>

              <Item label="文案" {...itemLayout}>
                <Input
                  onChange={this.updataParam.bind(this, "text")}
                  value={param.text}
                  size={"lg"}
                  style={{ width: "100%" }}
                  placeholder={"请输入文案"}
                />
              </Item>

              <Item label="显示时长" {...itemLayout}>
                <Input
                  onChange={this.updataParam.bind(this, "showTime")}
                  value={param.showTime}
                  size={"lg"}
                  style={{ width: "100%" }}
                  placeholder={"请输入显示时间（单位秒）"}
                />
              </Item>
            </Form>
          </div>
        </Modal>
      </div>
    );
  }
}
