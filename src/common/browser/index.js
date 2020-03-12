export function isIOS() {
  return /.*iphone.*/i.test(navigator.userAgent);
}