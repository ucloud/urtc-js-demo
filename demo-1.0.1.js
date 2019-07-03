import './style/urtcdemo.css'
import {URtcEngine} from './vendor/urtcsdk';

// import adapter from 'webrtc-adapter';

let appData = {
    appId: 'URtc-h4r1txxy',
    userId:randNum(3),
    mediaType:'1'//桌面和摄像头采集类型
};

// let UserId = randNum(3);
function roomElement(){
    const element = document.createElement('div');
    const roomInput = document.createElement('input');
    const roomBtn = document.createElement('button');
    roomInput.setAttribute('id','roomId');
    roomInput.setAttribute('type','text');
    roomInput.setAttribute('placeholder','房间号');
    roomBtn.setAttribute('id','roomSwitch');
    roomBtn.innerHTML = '进入房间';
    element.className = 'room-wrapper';
    element.appendChild(roomInput);
    element.appendChild(roomBtn);
    return element;
}
document.body.appendChild(roomElement());

function videoElement(){
    const videos = document.createElement('div');
    videos.className = 'videos';
    videos.setAttribute('id','videos');
    // const videoWrapper = document.createElement('div');
    // const videoElement = document.createElement('video');
    // videoWrapper.className = 'video-wrapper current';
    // videos.appendChild(videoWrapper);
    videos.innerHTML = '<div class="video-wrapper current" id="localVideo">'+
    '<div class="audio-volum"><meter max="1" value="0" id="audioVolum" class="volum-value"></meter></div>'+
    '<video autoplay muted playsinline class="thumbCommon"></video>'+
    '<span class="video-id boxLabel"></span>'+
    '<div class="video-operation">'+
    '<span class="activeAudio iconfont icon-yuyin"></span>'+
    '<span class="activeVideo iconfont icon-shipin"></span>'+
    '<span class="outRoom iconfont icon-084tuichu"></span>'+
    '</div>'+
    '</div>';
    return videos;
}
document.body.appendChild(videoElement());

function joinRoom(){
    document.getElementById("roomSwitch").onclick = function(){
        const roomId = document.getElementById("roomId");
        this.parentNode.style.display = "none";
        appData.roomId = roomId.value;
        appInit();
    }

    document.getElementById("localVideo").querySelector('.activeAudio').onclick = function(){
        if(URtcDemo.dataList.audio_enable == true){
            this.innerHTML = '<span class="iconfont icon-jinyong"></span>';
        }else{
            this.innerHTML = '';
        }
        URtcDemo.activeMute({
            stream_id: URtcDemo.dataList.stream_id,
            stream_type: 1,
            user_id: URtcDemo.dataList.user_id,
            track_type: 1,
            mute: URtcDemo.dataList.audio_enable
        }).then(function(e){
            console.log(e)
        },function(err){
            console.log(err)
        });
    }
    document.getElementById("localVideo").querySelector('.activeVideo').onclick = function(){
        if(URtcDemo.dataList.video_enable == true){
            this.innerHTML = '<span class="iconfont icon-jinyong"></span>';
        }else{
            this.innerHTML = '';
        }
        URtcDemo.activeMute({
            stream_id: URtcDemo.dataList.stream_id,
            stream_type: 1,
            user_id: URtcDemo.dataList.user_id,
            track_type: 2,
            mute: URtcDemo.dataList.video_enable
        });
    }
    document.getElementById("localVideo").querySelector('.outRoom').onclick = function(){
        URtcDemo.leaveRoom({
            room_id: URtcDemo.dataList.room_id
        }).then(function(e){
            console.log(e)
        },function(err){
            console.log(err)
        });
        // u.ws.close();
        window.location.reload();
    }
}
joinRoom(); 
let URtcDemo = new UCloudRtcEngine();
URtcDemo.getLocalDevices().then(function(e){
    console.log('test audio')
    console.log(e)
},function(err){
    console.log(err)
})

function appInit(){
    console.log('初始化')
    
    // URtcEngine.init()
    // URtcDemo.init(appData.url, appData.mediaType, appData.localVideo, ['box1', 'box2', 'box3', 'box4', 'box5'], {width: {ideal: 1280}, height: {ideal: 640}}, 12);
    
    URtcDemo.init({
        app_id: appData.appId,
        room_id: appData.roomId,
        user_id: appData.userId,
    }).then(function(data){
        let getToken = data.token;

        URtcDemo.getLocalStream({
            media_data:'videoProfile640*360',
            video_enable:true,
            audio_enable:true,
            media_type:1 //MediaType 1 cam 2 desktop
        }).then(function(data){
            let videoElement = document.getElementById('localVideo');
            let video = videoElement.querySelector('video')
            videoElement.style.display = 'block';
            video.srcObject = data;
        },function(e){
            console.log('getLocalStreamerror')
            console.log(e)
        })
        
        setInterval(() => {
            URtcDemo.getAudioVolum().then(function(data){
                let volum = data*100;
                document.getElementById("audioVolum").value = volum;

            })
          }, 1000);

        URtcDemo.joinRoom({
            token: getToken
        }).then(function(e){
            console.log(e)
        },function(err){
            console.log(err)
        })

    },function(error){
        console.log('init',error)
    })
    
    URtcDemo.addEventListener('userJoin', userJoin);
    URtcDemo.addEventListener('userLeave', userLeave);
    URtcDemo.addEventListener('loadVideo', loadVideo);
    URtcDemo.addEventListener('unloadVideo', unloadVideo);
    
}   
function userJoin(e) {
    console.log('userJoin')
    console.log(e)
}
function userLeave(e) {
    console.log('userLeave')
    console.log(e.closeUserId)
    const closeId = document.getElementById(e.closeUserId);
    closeId.parentNode.removeChild(closeId)
}

function unloadVideo(e) {
    console.log('unloadVideo')
    console.log(e)
    
}


function loadVideo(e) {
    console.log('loadVideo')
    console.log(e)
    const videos = document.getElementById('videos');
    const scbVideo = document.createElement('div');
    scbVideo.className = 'video-wrapper';
    scbVideo.setAttribute('id',e.name);
    scbVideo.innerHTML = '<video autoplay playsinline class="thumbCommon"></video>'+
    '<span class="video-id boxLabel"></span>';
    videos.appendChild(scbVideo);
    const videoElement = scbVideo.querySelector('video');
    videoElement.srcObject = e.stream;
        
    
}

function removeLabel(videoId) {
    console.log('removeLabel')
}

function setLabel(name, num) {
    console.log('setLabel')
}
function randNum(l) {
    let S = "0123456789";
    let s = "";
    for (let n = 0; n < l; ++n) {
        s = s + S.charAt(Math.floor((Math.random() * 100) % 10));
    }
    ;
    return s;
}