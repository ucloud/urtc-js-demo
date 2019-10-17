let dict = {
  default: {
    pre: "demopre.urtc.com.cn",
    prod: "demo.urtc.com.cn"
  },
  im: {
    pre: "impre.urtc.com.cn",
    prod: "im.urtc.com.cn"
  },
  urtc: {
    pre: "pre.urtc.com.cn",
    prod: "urtc.com.cn"
  },
  log: {
    pre: "pre.log.urtc.com.cn",
    prod: "log.urtc.com.cn"
  }
};

function getText(key) {
  if (process.env.REACT_APP_ENV == "prod") {
    // 线上正是环境
    return dict[key].prod;
  } else if (process.env.REACT_APP_ENV == "pre") {
    // 线上pre环境
    return dict[key].pre;
  }
}
export { getText };
