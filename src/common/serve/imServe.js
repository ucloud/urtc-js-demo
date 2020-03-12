import publishedSDK from "urtc-im";
import unpublishedSDK from "@/imsdk";
// import unpublishedSDK from "../../../../im-test-demo/src/im-sdk-web/lib/index";


let sdk = publishedSDK;
if (process.env.REACT_APP_ENV == "pre") {
  // pre 环境中使用未发布的 sdk，用于测试 sdk 的新功能
  // sdk = unpublishedSDK;
  sdk.setServers({
    api: "https://pre.urtc.com.cn",
    wssUrl:'impre.urtc.com.cn:3103'
  });
}
const { Client, Logger,ExamClient } = sdk;
console.log('imsdk version ', sdk.version);
let  imClient = null 
let examClient = null

function createClient (appId){
    imClient = new Client(appId)
    examClient = new ExamClient(appId);

}


export{
    createClient,
    imClient,
    examClient
}