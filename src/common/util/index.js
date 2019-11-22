/* eslint-disable */
/*
 * @Description: 通用方法函数
 * @Author: leif
 * @Date: 2019-08-20 10:31:20
 * @LastEditTime: 2019-08-29 11:52:27
 * @LastEditors: Please set LastEditors
 */

// if (window.sumNum) {

// } else {
//     window.sumNum = 1
//     $('body').append(`<div class="logInfo hide"><div id="logInfo"><div></div>`);
// }
import _ from 'lodash';

const log = function (e) {
    // console.log(e);
    // $('#logInfo').append(`
    // <p class="log_item">
    //     ${JSON.stringify(e)}
    // </p>`)
}
const error = function () {}
function randNum(l) {
    let S = "0123456789abcdefghijklmnopqrstuvwxyz";
    let s = "";
    for (let n = 0; n < l; ++n) {
        s = s + S.charAt(Math.floor((Math.random() * 360) % 36));
    };
    return s;
}

const clone = (obj) => {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null === obj || "object" !== typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

function isHasUndefined(obj){
    for( let name in obj ){
        if (typeof obj[name] == 'object') {
            isHasUndefined(obj[name])()
        }else{
            return _.isUndefined(obj[name]);
        }
    }
}

//html 预处理
function escape(str) {
    return str.replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--');
}


export {
    randNum, 
    log,
    error, 
    clone,
    isHasUndefined,
    escape
}