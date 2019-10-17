import * as React from "react";
import { Tooltip } from '@ucloud-fe/react-components';

import "./BottomRight.scss";

class WhiteboardBottomRight extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hotkeyTooltipDisplay: false,
            annexBoxTooltipDisplay: false,
            isVisible: false,
            isRecord: false,
        };
    }

    componentDidMount() {
    }
    
    renderAnnexBox = () => {
        const {roomState, room} = this.props;
        if (!roomState.sceneState) return null;
        const activeIndex = roomState.sceneState.index;
        const scenes = roomState.sceneState.scenes;
        return (
            <div>
                {scenes.length > 1 ?
                    <div className="whiteboard-annex-box">
                        <div
                            onClick={() => room.pptPreviousStep()}
                            className="whiteboard-annex-arrow-left iconfont icon-left">
                        </div>
                        <Tooltip theme='dark' placement="top" popup={"附件资料"} visible={this.state.annexBoxTooltipDisplay}>
                            <div
                                onMouseEnter={() => {
                                    this.setState({
                                        annexBoxTooltipDisplay: true,
                                    });
                                }}
                                onMouseLeave={() => {
                                    this.setState({
                                        annexBoxTooltipDisplay: false,
                                    });
                                }}
                                onClick={this.props.handleAnnexBoxMenuState}
                                className="whiteboard-annex-arrow-mid">
                                <div className="whiteboard-annex-img-box iconfont icon-attachment">
                                </div>
                                <div className="whiteboard-annex-arrow-page">
                                    {activeIndex + 1} / {scenes.length}
                                </div>
                            </div>
                        </Tooltip>
                        <div
                            onClick={() => room.pptNextStep()}
                            className="whiteboard-annex-arrow-right iconfont icon-right">
                        </div>
                    </div> :
                    <Tooltip theme='dark' placement="topLeft" popup={"附件资料"} visible={this.state.annexBoxTooltipDisplay}>
                        <div
                            onMouseEnter={() => {
                                this.setState({
                                    annexBoxTooltipDisplay: true,
                                });
                            }}
                            onMouseLeave={() => {
                                this.setState({
                                    annexBoxTooltipDisplay: false,
                                });
                            }}
                            onClick={this.props.handleAnnexBoxMenuState}
                            className="whiteboard-bottom-right-cell iconfont icon-attachment">
                        </div>
                    </Tooltip>}
            </div>
        );
    }

    render() {
        return (
            <div style={{display: this.props.isReadOnly ? "none" : "flex"}} className="whiteboard-box-bottom-right">
                <div className="whiteboard-box-bottom-right-mid">
                    {this.renderAnnexBox()}
                </div>
            </div>
        );
    }
}

export default WhiteboardBottomRight;

