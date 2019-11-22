import moment from 'moment'
import {
    GetRoomMsg
} from '../api/chat'

/**
 * @description 封装聊天历史记录方法，主要功能缓存历史数组
 * @param obj
 * @param obj.duration  分段请求时间间隔，默认15， 单位 min分钟
 */
export default class ChatHistory {
    constructor(param){
        this.joinTime = moment(new Date()).unix() //保存加入房间时间
        this.TIME_LENGTH = param.duration || 15 //每次请求时间范围 min
        this.totalTimeLength = 0
        this.historyChat = [] //聊天记录数组
    }
 
    //添加聊天记录
    addHistory(chatItem){
        if (Array.isArray(chatItem)){
            this.historyChat = this.historyChat.concat(chatItem)
        }else{
            this.historyChat.push(chatItem)
        }
    }

    // 获取聊天记录
    getHistory(){
        return this.historyChat
    }

    //发送请求
    getMesList = (param = this.changeStartTime()) => {
        return new Promise((resolve, reject) => {
            GetRoomMsg(param).then((data) => {
                if (data.data.Code === 200) {
                    // 过滤空消息数组
                    let arr = data.data.Msg.map((e) => {
                      
                        if (JSON.parse(e.Msg).msg){
                            return {
                                ...JSON.parse(e.Msg).msg,
                            }
                        }
                       
                    }).filter((e) => {
                        return !!e.message && e.userinfo !== ""
                    })
                    console.log(arr)
                    this.addHistory(arr)
                    resolve(arr)
                } else {
                    reject('error')
                }

            }, (error) => {
                reject(error)
            })
        })
    }

    //获取全部聊天记录
    getAllMes = () => {
        return this.getMesList(0)
    }

    //返回时间戳，更改startTime
    changeStartTime(TIME_LENGTH = this.TIME_LENGTH){
        const initTime = this.joinTime
        let min = (this.totalTimeLength + TIME_LENGTH)
        this.totalTimeLength = min
        return initTime - min * 60
    }

    //设置时长
    setDuration(num){
        this.TIME_LENGTH = num
        this.startTime = this.changeStartTime(num)
    }
}
