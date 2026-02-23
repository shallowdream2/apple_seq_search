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

  // 前往 Apple 官方保修查询
  onCheckCoverage() {
    wx.navigateTo({
      url: `/pages/warranty/index?serial=${this.data.serial}`,
    })
  },

  // 返回重新查询
  onBackSearch() {
    wx.navigateBack()
  },
})
