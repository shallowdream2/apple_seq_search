const { parseSerial } = require('../../utils/serialParser')

Page({
  data: {
    serialInput: '',
    history: [],
    showClearConfirm: false,
  },

  onLoad() {
    this.loadHistory()
  },

  onShow() {
    this.loadHistory()
  },

  loadHistory() {
    const history = wx.getStorageSync('search_history') || []
    this.setData({ history })
  },

  saveHistory(serial, model) {
    let history = wx.getStorageSync('search_history') || []
    history = history.filter(item => item.serial !== serial)
    history.unshift({
      serial,
      model,
      time: new Date().toLocaleString(),
    })
    if (history.length > 20) history = history.slice(0, 20)
    wx.setStorageSync('search_history', history)
  },

  onInput(e) {
    this.setData({ serialInput: e.detail.value })
  },

  onClearInput() {
    this.setData({ serialInput: '' })
  },

  onSearch() {
    const serial = this.data.serialInput.trim()
    if (!serial) {
      wx.showToast({ title: '请输入序列号', icon: 'none' })
      return
    }
    this.doSearch(serial)
  },

  doSearch(serial) {
    const result = parseSerial(serial)
    if (!result.success) {
      wx.showToast({ title: result.error, icon: 'none' })
      return
    }
    this.saveHistory(result.serial, result.model)
    wx.navigateTo({
      url: `/pages/result/index?serial=${result.serial}`,
    })
  },

  onTapHistory(e) {
    const serial = e.currentTarget.dataset.serial
    this.setData({ serialInput: serial })
    this.doSearch(serial)
  },

  onDeleteHistory(e) {
    const serial = e.currentTarget.dataset.serial
    let history = wx.getStorageSync('search_history') || []
    history = history.filter(item => item.serial !== serial)
    wx.setStorageSync('search_history', history)
    this.setData({ history })
  },

  onClearHistory() {
    this.setData({ showClearConfirm: true })
  },

  onConfirmClear() {
    wx.removeStorageSync('search_history')
    this.setData({ history: [], showClearConfirm: false })
  },

  onCancelClear() {
    this.setData({ showClearConfirm: false })
  },

  onPaste() {
    wx.getClipboardData({
      success: (res) => {
        if (res.data) {
          this.setData({ serialInput: res.data.trim() })
        }
      }
    })
  },
})
