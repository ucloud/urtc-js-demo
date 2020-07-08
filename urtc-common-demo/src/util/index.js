function randNum(l) {
    let S = "0123456789abcdefghijklmnopqrstuvwxyz";
    let s = "";
    for (let n = 0; n < l; ++n) {
        s = s + S.charAt(Math.floor((Math.random() * 360) % 36));
    };
    return s;
}

export{
    randNum
}