/*
 * @Description: In User Settings Edit
 * @Author: 路由配置信息
 * @Date: 2019-09-03 14:57:06
 * @LastEditTime: 2019-09-03 15:08:53
 * @LastEditors: Please set LastEditors
 */
import  Login from '../pages/login/index';
import ClassRoom from '../pages/class/index';

export const routerConfig = [{
    path: '/', 
    component: Login,
    auth: false, //是否开启鉴权
}, {
    path: '/class',
    component: ClassRoom,
    auth: true,
}
];