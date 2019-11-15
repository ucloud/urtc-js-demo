let dict = {
  default: {
    prod: "demo.urtc.com.cn"
  },
  im: {
    prod: "im.urtc.com.cn"
  },
  urtc: {
    prod: "urtc.com.cn"
  },
  log: {
    prod: "log.urtc.com.cn"
  }
};

function getText(key) {
  return dict[key].prod;
}
export { getText };
