const { getAuthToken, getCaptcha, checkCoverage } = require('../../utils/appleApi')

Page({
  data: {
    serial: '',
    // 状态：loading / captcha / submitting / result / error
    step: 'loading',
    captchaImage: '',
    captchaInput: '',
    authToken: '',
    // 查询结果
    result: null,
    errorMsg: '',
  },

  onLoad(options) {
    this.setData({ serial: options.serial || '' })
    this.initSession()
  },

  // 初始化会话，获取 token 和验证码
  async initSession() {
    this.setData({ step: 'loading', errorMsg: '' })
    try {
      const authToken = await getAuthToken()
      this.setData({ authToken })
      await this.loadCaptcha()
    } catch (e) {
      this.setData({
        step: 'error',
        errorMsg: e.message || '初始化失败，请重试',
      })
    }
  },

  // 加载验证码
  async loadCaptcha() {
    try {
      const captchaImage = await getCaptcha(this.data.authToken)
      this.setData({
        step: 'captcha',
        captchaImage,
        captchaInput: '',
      })
    } catch (e) {
      this.setData({
        step: 'error',
        errorMsg: e.message || '获取验证码失败',
      })
    }
  },

  // 刷新验证码
  async onRefreshCaptcha() {
    this.setData({ step: 'loading' })
    try {
      // 重新获取 token 和验证码
      const authToken = await getAuthToken()
      this.setData({ authToken })
      await this.loadCaptcha()
    } catch (e) {
      this.setData({
        step: 'error',
        errorMsg: e.message || '刷新验证码失败',
      })
    }
  },

  // 输入验证码
  onCaptchaInput(e) {
    this.setData({ captchaInput: e.detail.value })
  },

  // 提交查询
  async onSubmit() {
    const { captchaInput, serial, authToken } = this.data
    if (!captchaInput.trim()) {
      wx.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }

    this.setData({ step: 'submitting' })

    try {
      const result = await checkCoverage(serial, captchaInput.trim(), authToken)

      if (!result.success) {
        if (result.errorType === 'captcha_invalid') {
          // 验证码错误，刷新验证码重试
          wx.showToast({ title: result.message, icon: 'none' })
          await this.onRefreshCaptcha()
          return
        }
        this.setData({
          step: 'error',
          errorMsg: result.message,
        })
        return
      }

      this.setData({
        step: 'result',
        result,
      })
    } catch (e) {
      this.setData({
        step: 'error',
        errorMsg: e.message || '查询失败，请重试',
      })
    }
  },

  // 重新查询
  onRetry() {
    this.setData({ result: null, captchaInput: '' })
    this.initSession()
  },

  // 返回
  onBack() {
    wx.navigateBack()
  },
})
