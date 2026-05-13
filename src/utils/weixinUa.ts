/** 是否微信内置浏览器（X5 / WKWebView），内嵌 PDF、blob 视频能力与普通浏览器差异大 */
export function isWeixinBrowser(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }
  return /MicroMessenger/i.test(navigator.userAgent)
}
