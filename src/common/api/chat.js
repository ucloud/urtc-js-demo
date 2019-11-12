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

/**
 * @description 推送广播
 * @param RoomId string  房间ID
 * @param UserId string 用户id
 * @param Msg str  消息
 */
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

/**
 * @description 禁言， num空是禁言全体房间， 传入userID禁言个人
 * @param RoomId string  房间ID
 * @param UserId string 用户id
 * @param BanType bool type ban 禁言， unban 解除禁言；
 */
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

/**
 * @description 获取房间用户列表
 * @param RoomId string  房间ID
 */
function GetRoomUser(type) {
    return axios({
        method: 'post',
        url: `https://${getText("im")}/IM/GetRoomUser`,
        data: {
            RoomId: paramServer.getParam().roomId,
        },
    })
   
}

/**
 * @description 开启 / 关闭连麦全县， 限制老师使用
 * @param RoomId string  房间ID
 * @param UserId string 用户id
 * @param Operation bool 开启/关闭
 */
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

/**
 * @description 申请上麦
 * @param RoomId string  房间ID
 * @param ReplyUserId 连麦接收人
 * @param ApplyUserId 连麦接收人
 * @param Operation bool apply: 申请； cancel: 取消
 */
function sendApplyCall(ReplyUserId, status) {
    let flag = status ? 'apply' : 'cancel';
    return axios({
        method: 'post',
        url: `https://${getText("im")}/Call/ApplyCall`,
        data: {
            RoomId: paramServer.getParam().roomId,
            ApplyUserId: paramServer.getParam().userId,
            ReplyUserId, 
            Operation: flag

        },
    })
}

/**
 * @description 申请上麦，老师确认
 * @param RoomId string  房间ID
 * @param ReplyUserId 连麦接收人
 * @param Operation bool apply: 申请； cancel: 取消
 */
function ReplyCall(ReplyUserId, status) {
    let flag = status ? 'agree' : 'refuse';
    return axios({
        method: 'post',
        url: `https://${getText("im")}/Call/ReplyCall`,
        data: {
            RoomId: paramServer.getParam().roomId,
            ReplyUserId,
            Operation: flag 
        },
    })
}

/**
 * @description 获取房间信息
 * @param RoomId string  房间ID
 * @param StartTime int64 开始获取记录时间戳；0：获取全部
 * @param EndTime int64 结束时间 （暂无）
 */
function GetRoomInfo() {
    return axios({
        method: 'post',
        url: `https://${getText("im")}/GetRoomInfo`,
        data: {
            RoomId: paramServer.getParam().roomId,
        },
    })
}

/**
 * @description 获取历史消息记录
 * @param RoomId string  房间ID
 * @param StartTime int64 开始获取记录时间戳；0：获取全部
 * @param EndTime int64 结束时间 （暂无）
 */
function GetRoomMsg(StartTime = 0) {
    return axios({
        method: 'post',
        url: `https://${getText("im")}/GetRoomMsg`,
        data: {
            RoomId: paramServer.getParam().roomId,
            StartTime
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
    GetRoomMsg,
}