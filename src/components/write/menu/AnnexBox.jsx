/* eslint-disable */
import * as React from "react";
import TweenOne from "rc-tween-one";
import "./AnnexBox.scss";

class MenuAnnexBox extends React.Component {

    // ref: HTMLDivElement | null = null;

    constructor(props) {
        super(props);
        this.state = {
            isFocus: false,
            hoverCellIndex: null,
        };
    }

    arrowControllerHotKey = (evt) => {
    }

    removeScene(scenePath) {
        const {room} = this.props;
        room.removeScenes(`${scenePath}`);
        this.forceUpdate();
    }
    setScenePath = (newActiveIndex) => {
        const {room} = this.props;
        if (newActiveIndex >= room.state.sceneState.scenes.length) {
            return
        }
        room.setSceneIndex(newActiveIndex);
        this.forceUpdate();
    }
    pathName = (path) => {
        const reg = /\/([^\/]*)\//g;
        reg.exec(path);
        return RegExp.$1;
    }

    componentDidMount() {
        document.body.addEventListener("keydown", this.arrowControllerHotKey);
    }

    componentWillUnmount() {
        document.body.removeEventListener("keydown", this.arrowControllerHotKey);
    }

    renderClose = (index, isActive, scenePath) => {
        if (index === this.state.hoverCellIndex || isActive) {
            return (
                <TweenOne
                    animation={[
                        {
                            scale: 1,
                            duration: 200,
                            ease: "easeInOutQuart",
                        },
                    ]}
                    style={{
                        transform: "scale(0)",
                    }}
                    className="page-box-inner-index-delete" onClick={() => this.removeScene(scenePath)}>
                    <span className="menu-title-close-icon iconfont icon-delete"/>
                </TweenOne>
            );
        } else {
            return null;
        }
    }

    render() {
        const {roomState} = this.props;
        const scenes = roomState.sceneState.scenes;
        const sceneDir = roomState.sceneState.scenePath.split("/");
        sceneDir.pop();
        const activeIndex = roomState.sceneState.index;
        const renderPages = scenes.map((scene, index) => {
            const scenePath = sceneDir.concat(scene.name).join("/");
            const isActive = index === activeIndex;
            return (
                    <div
                        key={`${scene.name}${index}`}
                        className={isActive ? "page-out-box-active" : "page-out-box"}
                        onMouseEnter={() => this.setState({hoverCellIndex: index})}
                        onMouseLeave={() => this.setState({hoverCellIndex: null})}
                        >
                        <div className="page-box-inner-index-left">{index + 1}</div>
                        <div
                            onFocus={() => this.setState({isFocus: true})}
                            onBlur={() => this.setState({isFocus: false})}
                            onClick={() => {
                            this.setScenePath(index);
                        }} className="page-mid-box">
                            <div className="page-box">
                                <PageImage isActive={isActive} isMenuOpen={this.props.isMenuOpen} scene={scene} room={this.props.room} path={scenePath}/>
                            </div>
                        </div>
                        <div className="page-box-inner-index-delete-box">
                            {this.renderClose(index, isActive, scenePath)}
                        </div>
                    </div>

            );
        });

        return (
            <div
                ref={ref => this.ref = ref} className="menu-annex-box">
                <div className="menu-title-line">
                    <div className="menu-title-text-box">
                        PPT
                    </div>
                    <div className="menu-close-btn" onClick={this.props.handleAnnexBoxMenuState}>
                        <span className="menu-title-close-icon iconfont icon-close"/>
                    </div>
                </div>
                <div style={{height: 42}}/>
                {renderPages}
                <div style={{height: 42}}/>
                <div className="menu-under-btn">
                    <div
                        className="menu-under-btn-inner"
                        onClick={() => {
                            const {room, roomState} = this.props;
                            const newSceneIndex = activeIndex + 1;
                            const scenePath = roomState.sceneState.scenePath;
                            const pathName = this.pathName(scenePath);
                            room.putScenes(`/${pathName}`, [{}], newSceneIndex);
                            this.setScenePath(newSceneIndex);
                        }}
                    >
                        <span className="iconfont icon-plus"/>
                        <div>
                            新增一页
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class PageImage extends React.Component {
    // constructor(props) {
    //     super(props);
    // }
    componentWillReceiveProps(nextProps) {
        const ref = this.ref;
        if (nextProps.isMenuOpen !== this.props.isMenuOpen && nextProps.isMenuOpen && ref) {
            this.props.room.scenePreview(this.props.path, ref, 192, 112.5);
        }
    }
    setupDivRef = (ref) => {
        if (ref) {
            this.ref = ref;
            this.props.room.scenePreview(this.props.path, ref, 192, 112.5);
        }
    }

    render() {
        return <div className="ppt-image" ref={this.setupDivRef}/>;
    }
}

export default MenuAnnexBox;
