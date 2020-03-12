const porjectConfig = {
  role_type: 2, //用户权限0 推流 1 拉流 2 全部
  audiooutput: null, //扬声器id
  video: null, //视频设备id
  audiointput: null, //麦克风id
  resolving_power: null //分辨率
}
const formLable = {
  roomId: "房间号",
  name: "名字",
  character: [
    { key: "1", value: "学生", imType: 'default' },
    { key: "2", value: "老师", imType: 'admin' },
    // { key: '2', value: '监查', },
  ],
  submit: "加入",
  crouseType: [
    { key: '0', value: '小班课', },
    { key: "1", value: "大班课" },
  ]
};
export {
    porjectConfig,
    formLable,
    
}