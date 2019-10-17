/*
 * @Description: 配置路由
 * @Author: zhangjizhe
 * @Date: 2019-08-20 11:48:01
 * @LastEditTime: 2019-08-20 11:52:50
 * @LastEditors: Please set LastEditors
 */
import React from 'react'
import { render } from 'react-dom'
import { browserHistory, Router, Route, IndexRoute } from 'react-router'

import Login from './pages/login'

render(
  <Router history={browserHistory}>
    <Route path='/' component={Login}></Route>
  </Router>,
  document.getElementById('app')
)