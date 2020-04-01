import publishedSDK from "urtc-im";
import unpublishedSDK from "@/imsdk";
// import unpublishedSDK from "../../../../im-test-demo/src/im-sdk-web/lib/index";


let sdk = publishedSDK;
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