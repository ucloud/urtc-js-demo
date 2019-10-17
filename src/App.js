/*
 * @Description: 布局文件
 * @Author:zhangjizhe
 * @LastEditTime: 2019-09-06 17:20:00
 * @LastEditors:
 */
import React from 'react';
import {
  BrowserRouter,
  Switch
} from 'react-router-dom';
import './App.scss';
import '@ucloud-fe/react-components/dist/icon.min.css';
import {routerConfig} from './router/routerConfig'
import {
  FrontendAuth
} from './router/frontendAuth';

// 判断是否支持 HTML5 history API
const supportsHistory = !('pushState' in window.history)

function App() {
  return (
     <div className="App">
        <BrowserRouter
            forceRefresh={supportsHistory} // false: 不刷新 true: 刷新
            keyLength={12} // location.key长度为12
        >
          <Switch> 
             <FrontendAuth config = {
               routerConfig
             }
             />
          </Switch>
        </BrowserRouter>
      </div>
  );
}

export default App;
