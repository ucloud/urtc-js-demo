import React from 'react';
import {
   
} from '@ucloud-fe/react-components';
import './index.scss';


class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,


        };
    }

    componentDidMount() {
    }

    render() {

        return (
            <div className="sidebar_main">
                侧边栏
            </div>
        );
    }
}

export default Sidebar;
