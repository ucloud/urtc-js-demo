/*
 * @Description: chat IM 相关api
 * @Author: 张继哲
 * @Date: 2019-08-27 13:33:22
 * @LastEditTime: 2019-09-09 17:14:56
 * @LastEditors: Please set LastEditors
 */
import axios from 'axios';
import paramServer from '../js/paramServer';
import {
    getText
} from '../dictMap/index'

function closeIM (){
    return axios({
        method: 'post',
        url: `https://${getText("im")}/IM/Disconnect`,
        data: {
            UserId: paramServer.getParam().userId,
            RoomId: paramServer.getParam().roomId,
        },
    })
} 

function contectWs (){
    return axios({
        method: 'post',
        url: `https://${getText("im")}/IM/Connect`,
        data: {
            UserId: paramServer.getParam().userId,
            RoomId: paramServer.getParam().roomId,
            // Uuid: this.state.param.characterValue,
            ConnectType: paramServer.getParam().role_type == 2 ? 'Create' : '', //学生不填
        },
    })
}

function pushMessage(msg){
    return axios({
        method: 'post',
        url: `https://${getText("im")}/IM/PushRoom`,
        data: {
            UserId: paramServer.getParam().userId,
            RoomId: paramServer.getParam().roomId,
            Msg: msg
        },
    })
}

// 禁言，type true 禁言，false 解除禁言；num空是禁言全体房间，传入userID禁言个人
function banRoom(type,num) {
    
    return axios({
        method: 'post',
        url: `https://${getText("im")}/IM/BanRoom`,
        data: {
            UserId: num,
            RoomId: paramServer.getParam().roomId,
            BanType:!!type ? 'ban':'unban'
        },
    })
}
function GetRoomUser(type) {
    return axios({
        method: 'post',
        url: `https://${getText("im")}/IM/GetRoomUser`,
        data: {
            RoomId: paramServer.getParam().roomId,
        },
    })
   
}

// 开启/关闭连麦全县，限制老师使用
function AuthCall(open) {
    let flag = open? 'open' : 'close';
    return axios({
        method: 'post',
        url: `https://${getText("im")}/Call/AuthCall`,
        data: {
            RoomId: paramServer.getParam().roomId,
            UserId: paramServer.getParam().userId,
            Operation: flag,
        },
    })

}

// 申请上麦
function sendApplyCall(ReplyUserId, status) {
    console.error(status)
    let flag = status ? 'apply' : 'cancel';
    return axios({
        method: 'post',
        url: `https://${getText("im")}/Call/ApplyCall`,
        data: {
            RoomId: paramServer.getParam().roomId,
            ApplyUserId: paramServer.getParam().userId,
            ReplyUserId, //连麦接收人
            Operation: flag //apply:申请；cancel:取消

        },
    })
}

// 申请上麦
function ReplyCall(ReplyUserId, status) {
    let flag = status ? 'agree' : 'refuse';
    return axios({
        method: 'post',
        url: `https://${getText("im")}/Call/ReplyCall`,
        data: {
            RoomId: paramServer.getParam().roomId,
            ReplyUserId, //连麦接收人
            Operation: flag //apply:申请；cancel:取消
        },
    })
}

//获取房间信息
function GetRoomInfo() {
    return axios({
        method: 'post',
        url: `https://${getText("im")}/GetRoomInfo`,
        data: {
            RoomId: paramServer.getParam().roomId,
        },
    })
}




export {
    closeIM,
    contectWs,
    pushMessage,
    banRoom,
    GetRoomUser,
    sendApplyCall,
    AuthCall,
    ReplyCall,
    GetRoomInfo,
}