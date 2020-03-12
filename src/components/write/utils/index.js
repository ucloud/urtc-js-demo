/* eslint-disable */
const getOS = function() {
    const e = window.navigator.userAgent;
    const t = window.navigator.platform;
    let n = "";
    return -1 !== ["Macintosh", "MacIntel", "MacPPC", "Mac68K"].indexOf(t) ? n = "Mac OS" : -1 !== ["iPhone", "iPad", "iPod"].indexOf(t) ? n = "iOS" : -1 !== ["Win32", "Win64", "Windows", "WinCE"].indexOf(t) ? n = "Windows" : /Android/.test(e) ? n = "Android" : !n && /Linux/.test(t) && (n = "Linux"), n;
}
const isMacTouchpadTwoFingerZoom = function(e) {
    return -1 !== navigator.platform.indexOf("Mac") && e.ctrlKey;
}
const isZoom = function(e) {
    return e.ctrlKey;
}
const isHorizontalMove = function(e) {
    return e.shiftKey;
}
const isMacTouchpadTwoFingerScroll = function(e) {
    return -1 !== navigator.platform.indexOf("Mac") && (e.wheelDelta % 120 != 0 || 0 !== e.movementX || 0 !== e.deltaX);
}

const SCALE = {
    safariScaleNumber: 10,
    minScaleStep: -40,
    scaleRate: .02
}
const adjustScale = function(e) {
    return Math.max(e, SCALE.minScaleStep) * SCALE.scaleRate;
}

const getOffsetPointAndScale = function(e) {
    const n = e.deltaX;
    const r = e.deltaY;
    let a = Math.sqrt(n * n + r * r);
    let o = 0;
    let i = 0;
    if ("Windows" === getOS()) {
        a = -a;
    }
    if (n + r < 0)  {
        a = -a;
    }
    // "Windows" === l.binder.getOS() && (a = -a), n + r < 0 && (a = -a), l.isMacTouchpadTwoFingerZoom(e) ? a = .5 * -a : l.isMacTouchpadTwoFingerScroll(e) ? (o = -n, i = -r, a = 0) : a *= .035;
    if(isZoom(e)) {
        a = .5 * -a;
    } else if ("Windows" === getOS() && isHorizontalMove(e)) {
        o = -r;
        i = -n;
        a = 0;
    } else {
        o = -n;
        i = -r;
        a = 0;
    }

    return {
        offsetPoint: {
            x: o,
            y: i
        },
        scale: adjustScale(a),
    }
}

module.exports = {
    getOffsetPointAndScale
}
