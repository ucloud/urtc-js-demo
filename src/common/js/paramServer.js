/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-22 10:34:17
 * @LastEditTime: 2019-09-03 14:48:04
 * @LastEditors: Please set LastEditors
 */
import {clone} from '../util';
let _user = null;

export default {
    setParam: (user) => {
        _user = user;
    },
    getParam: () => {
        return clone(_user);
    },
    updateParam: ({
        key = '',
        value = ''
    }) => {
        let fields = [];
        if (fields.includes(key)) {
            _user[key] = value;
        }
    }
}