const { parseSerial } = require('../../utils/serialParser')

Page({
  data: {
    result: null,
    serial: '',
  },

  onLoad(options) {
    const serial = options.serial || ''
    const result = parseSerial(serial)
    this.setData({ serial, result })

    if (result.success) {
      wx.setNavigationBarTitle({ title: result.model || '查询结果' })
    }
  },

  // 复制序列号
  onCopySerial() {
    wx.setClipboardData({
      data: this.data.serial,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' })
      },
    })
  },

  // 前往 Apple 官方查询
  onCheckCoverage() {
    wx.setClipboardData({
      data: this.data.serial,
      success: () => {
        wx.showModal({
          title: '序列号已复制',
          content: '请在浏览器中打开 checkcoverage.apple.com 并粘贴序列号进行官方查询。',
          showCancel: false,
          confirmText: '知道了',
        })
      },
    })
  },

  // 返回重新查询
  onBackSearch() {
    wx.navigateBack()
  },
})
