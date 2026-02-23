/**
 * Apple 官方保修查询 API
 * 接入 checkcoverage.apple.com
 */

const BASE_URL = 'https://checkcoverage.apple.com'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/16.5 Safari/605.1.15'

/**
 * 获取认证令牌
 */
function getAuthToken() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL,
      method: 'GET',
      header: { 'User-Agent': USER_AGENT },
      success: (res) => {
        const token =
          res.header['X-APPLE-AUTH-TOKEN'] ||
          res.header['x-apple-auth-token'] ||
          res.header['X-Apple-Auth-Token']
        if (token) {
          resolve(token)
        } else {
          reject(new Error('无法获取认证令牌，可能被限流'))
        }
      },
      fail: (err) => {
        reject(new Error('网络请求失败: ' + (err.errMsg || '')))
      },
    })
  })
}

/**
 * 获取验证码图片
 * @param {string} authToken - 认证令牌
 * @returns {Promise<string>} 验证码图片临时文件路径
 */
function getCaptcha(authToken) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/api/v1/facade/captcha?type=image`,
      method: 'GET',
      header: {
        'X-Apple-Auth-Token': authToken,
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
      success: (res) => {
        if (res.data && res.data.binaryValue) {
          // 将 base64 写入临时文件供 <image> 显示
          const fs = wx.getFileSystemManager()
          const filePath = `${wx.env.USER_DATA_PATH}/captcha_${Date.now()}.png`
          fs.writeFile({
            filePath,
            data: res.data.binaryValue,
            encoding: 'base64',
            success: () => resolve(filePath),
            fail: () => reject(new Error('验证码图片保存失败')),
          })
        } else {
          reject(new Error('无法获取验证码'))
        }
      },
      fail: (err) => {
        reject(new Error('获取验证码失败: ' + (err.errMsg || '')))
      },
    })
  })
}

/**
 * 提交保修查询
 * @param {string} serialNumber - 序列号
 * @param {string} captchaAnswer - 验证码答案
 * @param {string} authToken - 认证令牌
 * @returns {Promise<Object>} 查询结果
 */
function checkCoverage(serialNumber, captchaAnswer, authToken) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/api/v1/facade/coverage`,
      method: 'POST',
      header: {
        'X-Apple-Auth-Token': authToken,
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/json',
      },
      data: {
        captchaAnswer,
        captchaType: 'image',
        serialNumber,
      },
      success: (res) => {
        resolve(parseCoverageResponse(res.data))
      },
      fail: (err) => {
        reject(new Error('查询请求失败: ' + (err.errMsg || '')))
      },
    })
  })
}

/**
 * 解析 Apple 返回的保修响应
 */
function parseCoverageResponse(data) {
  const html = typeof data === 'string' ? data : JSON.stringify(data)

  // 验证码错误
  if (html.includes('The code you entered does not match')) {
    return {
      success: false,
      errorType: 'captcha_invalid',
      message: '验证码错误，请重新输入',
    }
  }

  // 无效序列号
  if (html.includes('Please enter a valid serial number')) {
    return {
      success: false,
      errorType: 'invalid_serial',
      message: '无效的序列号，请检查后重试',
    }
  }

  // 频率限制
  if (
    html.includes('process your request') ||
    html.includes('currently unable to process')
  ) {
    return {
      success: false,
      errorType: 'rate_limit',
      message: '请求过于频繁，请稍后再试',
    }
  }

  // 需要验证购买日期
  if (html.includes('Sign in to update purchase date')) {
    return {
      success: true,
      status: 'needs_verification',
      statusText: '需要验证购买日期',
      statusDesc: '请登录 Apple 账号验证购买日期',
      ...extractCoverageDetails(html),
    }
  }

  // 保修已过期
  if (html.includes('Coverage Expired')) {
    return {
      success: true,
      status: 'expired',
      statusText: '保修已过期',
      statusDesc: '您的设备保修期已结束',
      ...extractCoverageDetails(html),
    }
  }

  // 保修有效
  if (
    html.includes('Your coverage includes') ||
    html.includes('Apple coverage for your product')
  ) {
    return {
      success: true,
      status: 'active',
      statusText: '保修有效',
      statusDesc: '您的设备在保修期内',
      ...extractCoverageDetails(html),
    }
  }

  // 能识别到产品但状态不明确
  if (html.includes('AppleCare') || html.includes('warranty')) {
    return {
      success: true,
      status: 'unknown',
      statusText: '已查询到信息',
      statusDesc: '',
      ...extractCoverageDetails(html),
    }
  }

  return {
    success: false,
    errorType: 'unknown',
    message: '查询失败，请稍后再试',
  }
}

/**
 * 从 HTML 中提取保修详情
 */
function extractCoverageDetails(html) {
  const details = {
    productName: '',
    coverageItems: [],
  }

  // 提取产品名称 - 匹配各种 Apple 产品
  const productPatterns = [
    /(?:MacBook|iMac|Mac)\s+[^<\n]*?(?:\([^)]*\))/i,
    /iPhone\s+\d+[^<\n]*/i,
    /iPad\s+[^<\n]*/i,
    /Apple\s+Watch\s+[^<\n]*/i,
    /AirPods\s+[^<\n]*/i,
  ]

  for (const pattern of productPatterns) {
    const match = html.match(pattern)
    if (match) {
      details.productName = match[0].trim()
      break
    }
  }

  // 提取保修到期日期
  const expiryMatch = html.match(/Expires?\s*(?:on)?\s*:\s*([^<"]+)/i)
  if (expiryMatch) {
    details.coverageItems.push({
      label: '保修到期',
      value: expiryMatch[1].trim(),
      active: true,
    })
  }

  // 提取购买日期
  const purchaseMatch = html.match(
    /(?:Purchase|Purchased)\s*(?:Date|on)?\s*:\s*([^<"]+)/i
  )
  if (purchaseMatch) {
    details.coverageItems.push({
      label: '购买日期',
      value: purchaseMatch[1].trim(),
      active: true,
    })
  }

  // 检测硬件保修
  if (html.includes('Hardware Coverage') || html.includes('Repairs and Service')) {
    const isActive =
      !html.includes('Coverage Expired') ||
      html.includes('Your coverage includes')
    details.coverageItems.push({
      label: '硬件保修',
      value: isActive ? '有效' : '已过期',
      active: isActive,
    })
  }

  // 检测电话技术支持
  if (html.includes('Technical Support') || html.includes('Phone Support')) {
    const supportActive = html.includes('Active') || html.includes('Eligible')
    details.coverageItems.push({
      label: '电话技术支持',
      value: supportActive ? '有效' : '已过期',
      active: supportActive,
    })
  }

  // 检测 AppleCare+
  if (html.includes('AppleCare+') || html.includes('AppleCare Plus')) {
    details.coverageItems.push({
      label: 'AppleCare+',
      value: '已购买',
      active: true,
    })
  }

  // 检测意外损坏保修
  if (html.includes('Accidental Damage')) {
    details.coverageItems.push({
      label: '意外损坏保修',
      value: '已覆盖',
      active: true,
    })
  }

  return details
}

module.exports = {
  getAuthToken,
  getCaptcha,
  checkCoverage,
}
