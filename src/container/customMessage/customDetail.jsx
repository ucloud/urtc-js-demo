import React from "react";
// import { CSSTransitionGroup } from "react-transition-group";
import {
  Icon,
} from "@ucloud-fe/react-components";
import "../../common/scss/index.scss";
import "./index.scss";

/**
 * @props show   显示状态
 * @props detail 详情，展示数据
 * @param jumpUrl
 * @param imgUrl
 * @param text
 * @param price
 */
export default class CustomDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      show:true,
    };
  }

  componentDidMount(){
    console.log('>>>><<<<>>>><<<<')
  }

  close = () => {
    this.props.close();
  }

  jump = (url) => {
    window.open(url)
  }

  render() {
    const { detail, show } = this.props;
    console.log(detail)
    return (
      // <CSSTransitionGroup
      //   transitionName="custom_detail"
      //   transitionEnterTimeout={500}
      //   transitionLeaveTimeout={300}
      //   unmountOnExit
      // >
      <div
        className="custom_detail clearfix"
        style={{ display: show ? "block" : "none" }}
      >
        <div
          className="custom_detail_content clearfix"
          onClick={() => this.jump(detail.jumpUrl)}
        >
          <div className="customDetail_left">
            <img src={detail.imgUrl} alt="" />
          </div>
          <div className="customDetail_right">
            <p className="text">{detail.text}</p>
            <p className="price">¥{" " + detail.price}</p>
          </div>
        </div>
        <div onClick={this.close} className="custom_detail_close_btn">
          <Icon type="cross"></Icon>
        </div>
      </div>
      // </CSSTransitionGroup>
    );
  }
}
