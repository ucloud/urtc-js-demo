/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-26 17:12:40
 * @LastEditTime: 2019-09-04 14:14:35
 * @LastEditors: Please set LastEditors
 */
import {
    getText
} from '../dictMap/index';
import paramServer from './paramServer'

const rawHeaderLen = 16;
const packetOffset = 0;
const headerOffset = 4;
const verOffset = 6;
const opOffset = 8;
const seqOffset = 12;
var Client = function (options) {
    var MAX_CONNECT_TIMES = 10;
    var DELAY = 15000;
    this.options = options || {};
    this.ws = null;
    this.createConnect(MAX_CONNECT_TIMES, DELAY);
}

var appendMsg = function (text) {
    //   var span = document.createElement("SPAN");
    //   var text = document.createTextNode(text);
    //   span.appendChild(text);
    //   document.getElementById("box").appendChild(span);
}

Client.prototype.createConnect = function (max, delay) {
    var self = this;
    if (max === 0) {
        return;
    }
    connect();

    var textDecoder = new TextDecoder();
    var textEncoder = new TextEncoder();
    var heartbeatInterval;

    function connect() {
        self.ws = new WebSocket(`wss://${getText("im")}/sub`);
        //var ws = new WebSocket('ws://127.0.0.1:3102/sub');
        self.ws.binaryType = 'arraybuffer';
        self.ws.onopen = function () {
            auth();
        }

        self.ws.onmessage = function (evt) {
            var notify = self.options.notify;
            var data = evt.data;
            var dataView = new DataView(data, 0);
            var packetLen = dataView.getInt32(packetOffset);
            var headerLen = dataView.getInt16(headerOffset);
            var ver = dataView.getInt16(verOffset);
            var op = dataView.getInt32(opOffset);
            var seq = dataView.getInt32(seqOffset);
            switch (op) {
                case 8:
                    // auth reply ok
                    //  document.getElementById("status").innerHTML = "<color style='color:green'>ok<color>";
                    appendMsg("receive: auth reply");
                    // send a heartbeat to server
                    heartbeat();
                    heartbeatInterval = setInterval(heartbeat, 30 * 1000);
                    break;
                case 3:
                    // receive a heartbeat from server
                    appendMsg("receive: heartbeat reply");
                    break;
                case 9:
                    // batch message
                    for (var offset = rawHeaderLen; offset < data.byteLength; offset += packetLen) {
                        // parse
                        var packetLen = dataView.getInt32(offset);
                        var headerLen = dataView.getInt16(offset + headerOffset);
                        var ver = dataView.getInt16(offset + verOffset);
                        var op = dataView.getInt32(offset + opOffset);
                        var seq = dataView.getInt32(offset + seqOffset);
                        var msgBody = textDecoder.decode(data.slice(offset + headerLen, offset + packetLen));
                        // callback
                        messageReceived(ver, msgBody);
                        appendMsg("receive: ver=" + ver + " op=" + op + " seq=" + seq + " message=" + msgBody);
                    }
                    break;
                default:
                    var msgBody = textDecoder.decode(data.slice(headerLen, packetLen));
                    messageReceived(ver, msgBody);
                    appendMsg("receive: ver=" + ver + " op=" + op + " seq=" + seq + " message=" + msgBody);
                    break
            }
        }

        self.ws.onclose = function () {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            self.options.close();
            setTimeout(reConnect, delay);

            //   document.getElementById("status").innerHTML = "<color style='color:red'>failed<color>";
        }


        function heartbeat() {
            var headerBuf = new ArrayBuffer(rawHeaderLen);
            var headerView = new DataView(headerBuf, 0);
            headerView.setInt32(packetOffset, rawHeaderLen);
            headerView.setInt16(headerOffset, rawHeaderLen);
            headerView.setInt16(verOffset, 1);
            headerView.setInt32(opOffset, 2);
            headerView.setInt32(seqOffset, 1);
            self.ws.send(headerBuf);
            appendMsg("send: heartbeat");
        }

        function auth() {
            let _d = self.options.param;
            var token = `{"mid":${_d.MId}, "room_id":"live://${paramServer.getParam().appId +_d.RoomId}", "platform":"web", "accepts":[1000,1001,1002]}`;
            // var token = `{"mid":${_d.MId}, "room_id":"live://${_d.RoomId}", "platform":"web", "accepts":[1000,1001,1002]}`;
            // var token = '{"mid":123, "room_id":"live://1000", "platform":"web", "accepts":[1000,1001,1002]}'
            console.log(token)
            var headerBuf = new ArrayBuffer(rawHeaderLen);
            var headerView = new DataView(headerBuf, 0);
            var bodyBuf = textEncoder.encode(token);
            headerView.setInt32(packetOffset, rawHeaderLen + bodyBuf.byteLength);
            headerView.setInt16(headerOffset, rawHeaderLen);
            headerView.setInt16(verOffset, 1);
            headerView.setInt32(opOffset, 7);
            headerView.setInt32(seqOffset, 1);
            self.ws.send(mergeArrayBuffer(headerBuf, bodyBuf));

            appendMsg("send: auth token: " + token);
        }

        function messageReceived(ver, body) {
            var notify = self.options.notify;
            if (notify) notify(body);
        }

        function mergeArrayBuffer(ab1, ab2) {
            var u81 = new Uint8Array(ab1),
                u82 = new Uint8Array(ab2),
                res = new Uint8Array(ab1.byteLength + ab2.byteLength);
            res.set(u81, 0);
            res.set(u82, ab1.byteLength);
            return res.buffer;
        }

        function char2ab(str) {
            var buf = new ArrayBuffer(str.length);
            var bufView = new Uint8Array(buf);
            for (var i = 0; i < str.length; i++) {
                bufView[i] = str[i];
            }
            return buf;
        }
    }

    function reConnect() {
        self.createConnect(--max, delay * 2);
    }
}

export {
    Client
}