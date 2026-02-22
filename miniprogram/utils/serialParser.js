/**
 * Apple 序列号解析工具
 * 适用于 2010-2020 年间生产的 12 位序列号
 */

// 工厂代码 → 产地
const factoryCodes = {
  'C02': '中国 广达（上海）',
  'C07': '中国 广达（上海）',
  'C17': '中国 广达',
  'C1M': '中国 富士康（郑州）',
  'C2V': '中国 富士康（郑州）',
  'C39': '中国 富士康（郑州）',
  'C3M': '中国 富士康（郑州）',
  'CK':  '爱尔兰 科克',
  'D25': '中国 富士康（深圳）',
  'D33': '中国 富士康（深圳）',
  'DL':  '中国 富士康（上海）',
  'DM':  '中国 富士康（郑州）',
  'DN':  '中国 富士康（成都）',
  'DP':  '中国 富士康（成都）',
  'DQ':  '中国 富士康（成都）',
  'DY':  '中国',
  'F1':  '中国 富士康',
  'F2':  '中国 富士康',
  'F5K': '中国 富士康（郑州）',
  'F7':  '中国 富士康',
  'FC':  '美国 科罗拉多泉',
  'FK':  '中国 富士康（深圳）',
  'G6':  '中国',
  'G8':  '中国 广达',
  'GQ':  '中国',
  'H':   '中国 深圳',
  'J2':  '日本',
  'J9':  '日本',
  'M':   '马来西亚',
  'MQ':  '中国',
  'PT':  '韩国',
  'QP':  '中国 富士康',
  'QT':  '中国 富士康',
  'RM':  '翻新机',
  'RN':  '墨西哥（翻新）',
  'SG':  '韩国',
  'UV':  '韩国',
  'VM':  '中国 富士康',
  'VR':  '中国 富士康',
  'W8':  '中国 广达（上海）',
  'WQ':  '中国',
  'XB':  '中国',
  'XM':  '中国',
  'YM':  '中国 和硕（上海）',
  'YP':  '中国',
}

// 年份-半年 编码（第 4 位）
const yearCodes = {
  'C': { year: 2010, half: 1 },
  'D': { year: 2010, half: 2 },
  'F': { year: 2011, half: 1 },
  'G': { year: 2011, half: 2 },
  'H': { year: 2012, half: 1 },
  'J': { year: 2012, half: 2 },
  'K': { year: 2013, half: 1 },
  'L': { year: 2013, half: 2 },
  'M': { year: 2014, half: 1 },
  'N': { year: 2014, half: 2 },
  'P': { year: 2015, half: 1 },
  'Q': { year: 2015, half: 2 },
  'R': { year: 2016, half: 1 },
  'S': { year: 2016, half: 2 },
  'T': { year: 2017, half: 1 },
  'V': { year: 2017, half: 2 },
  'W': { year: 2018, half: 1 },
  'X': { year: 2018, half: 2 },
  'Y': { year: 2019, half: 1 },
  'Z': { year: 2019, half: 2 },
  '3': { year: 2020, half: 1 },
  '4': { year: 2020, half: 2 },
}

// 周编码（第 5 位）
const weekCodes = {
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
  '6': 6, '7': 7, '8': 8, '9': 9,
  'C': 10, 'D': 11, 'F': 12, 'G': 13,
  'H': 14, 'J': 15, 'K': 16, 'L': 17,
  'M': 18, 'N': 19, 'P': 20, 'Q': 21,
  'R': 22, 'S': 23, 'T': 24, 'V': 25,
  'W': 26, 'X': 27, 'Y': 28,
}

// 型号编码（后 4 位）→ 产品名称
const modelCodes = {
  // ── iPhone ──
  'DN6H': 'iPhone 5s',
  'F4GT': 'iPhone 6',
  'F4GX': 'iPhone 6 Plus',
  'G5RQ': 'iPhone 6s',
  'G5RR': 'iPhone 6s Plus',
  'GRY1': 'iPhone 7',
  'GRY2': 'iPhone 7',
  'GRY5': 'iPhone 7 Plus',
  'GRY6': 'iPhone 7 Plus',
  'GRRY': 'iPhone 7',
  'HG7J': 'iPhone 7 Plus',
  'JC68': 'iPhone 8',
  'JC69': 'iPhone 8',
  'JC6K': 'iPhone 8 Plus',
  'JC6L': 'iPhone 8 Plus',
  'JC6V': 'iPhone X',
  'JC6W': 'iPhone X',
  'KQC6': 'iPhone XR',
  'KQC7': 'iPhone XR',
  'KQCQ': 'iPhone XR',
  'KQC2': 'iPhone XS',
  'KQC0': 'iPhone XS',
  'KQCC': 'iPhone XS Max',
  'KQCD': 'iPhone XS Max',
  'N70M': 'iPhone 11',
  'N70P': 'iPhone 11',
  'N4GW': 'iPhone 11 Pro',
  'N4GX': 'iPhone 11 Pro',
  'N4GY': 'iPhone 11 Pro Max',
  'N4H0': 'iPhone 11 Pro Max',
  'Q5RM': 'iPhone 12',
  'Q5RN': 'iPhone 12 mini',
  'Q5RP': 'iPhone 12 Pro',
  'Q5RQ': 'iPhone 12 Pro Max',
  'R3GV': 'iPhone SE 2',

  // ── iPad ──
  'DLXM': 'iPad Pro 11 英寸',
  'DLXN': 'iPad Pro 12.9 英寸',
  'DLXQ': 'iPad (第7代)',
  'DMPD': 'iPad Air (第3代)',
  'DK4Q': 'iPad mini (第5代)',
  'FK1H': 'iPad Pro 11 英寸 (第2代)',
  'FK1J': 'iPad Pro 12.9 英寸 (第4代)',
  'FP9X': 'iPad (第8代)',
  'FP9Y': 'iPad (第8代)',
  'GM71': 'iPad Air (第4代)',
  'Q32C': 'iPad (第9代)',

  // ── MacBook ──
  'GTDY': 'MacBook Pro 13 英寸 2017',
  'GVC1': 'MacBook Pro 13 英寸 2017',
  'GVC8': 'MacBook Pro 15 英寸 2017',
  'HV29': 'MacBook Pro 15 英寸 2018',
  'HV2F': 'MacBook Pro 13 英寸 2018',
  'JG5H': 'MacBook Air 2019',
  'JG5J': 'MacBook Air 2019',
  'JG5G': 'MacBook Pro 13 英寸 2019',
  'JK14': 'MacBook Pro 15 英寸 2019',
  'L410': 'MacBook Pro 16 英寸 2019',
  'L411': 'MacBook Pro 16 英寸 2019',
  'LYWF': 'MacBook Air 2020 (M1)',
  'LYW0': 'MacBook Pro 13 英寸 2020 (M1)',
  'N5RY': 'MacBook Pro 14 英寸 2021 (M1 Pro/Max)',
  'N5RX': 'MacBook Pro 16 英寸 2021 (M1 Pro/Max)',

  // ── iMac / Mac ──
  'J1WK': 'iMac 27 英寸 2019',
  'J1WF': 'iMac 21.5 英寸 2019',
  'MMYP': 'iMac 24 英寸 2021 (M1)',
  'L9PM': 'Mac mini 2020 (M1)',
  'L9CG': 'Mac Pro 2019',

  // ── Apple Watch ──
  'HX8V': 'Apple Watch Series 4',
  'HX8X': 'Apple Watch Series 4',
  'LKJ1': 'Apple Watch Series 5',
  'LKJ3': 'Apple Watch Series 5',
  'N0HF': 'Apple Watch Series 6',
  'N0HG': 'Apple Watch SE',
  'R3LY': 'Apple Watch Series 7',

  // ── AirPods ──
  'HN7N': 'AirPods (第2代)',
  'LX31': 'AirPods Pro',
  'V3GC': 'AirPods (第3代)',
  'V3GF': 'AirPods Pro (第2代)',
}

/**
 * 获取工厂产地
 */
function getFactory(serial) {
  const s = serial.toUpperCase()
  // 先匹配 3 位，再 2 位，最后 1 位
  if (factoryCodes[s.substring(0, 3)]) return factoryCodes[s.substring(0, 3)]
  if (factoryCodes[s.substring(0, 2)]) return factoryCodes[s.substring(0, 2)]
  if (factoryCodes[s.substring(0, 1)]) return factoryCodes[s.substring(0, 1)]
  return '未知产地'
}

/**
 * 获取生产日期
 */
function getManufactureDate(serial) {
  const s = serial.toUpperCase()
  const yearCode = s.charAt(3)
  const weekCode = s.charAt(4)

  const yearInfo = yearCodes[yearCode]
  const week = weekCodes[weekCode]

  if (!yearInfo || week === undefined) {
    return { year: '未知', half: '', week: '未知', text: '无法解析' }
  }

  const actualWeek = yearInfo.half === 1 ? week : week + 26
  return {
    year: yearInfo.year,
    half: yearInfo.half === 1 ? '上半年' : '下半年',
    week: actualWeek,
    text: `${yearInfo.year}年 第${actualWeek}周（${yearInfo.half === 1 ? '上半年' : '下半年'}）`
  }
}

/**
 * 获取产品型号
 */
function getModel(serial) {
  const s = serial.toUpperCase()
  const code = s.substring(8, 12)
  return modelCodes[code] || '未知型号（编码: ' + code + '）'
}

/**
 * 判断是否为翻新机
 */
function isRefurbished(serial) {
  const s = serial.toUpperCase()
  return s.startsWith('RM') || s.startsWith('RN')
}

/**
 * 获取产品类型图标
 */
function getProductIcon(modelName) {
  if (modelName.includes('iPhone'))      return 'iphone'
  if (modelName.includes('iPad'))        return 'ipad'
  if (modelName.includes('MacBook'))     return 'macbook'
  if (modelName.includes('iMac'))        return 'imac'
  if (modelName.includes('Mac'))         return 'mac'
  if (modelName.includes('Watch'))       return 'watch'
  if (modelName.includes('AirPods'))     return 'airpods'
  return 'apple'
}

/**
 * 解析序列号（主入口）
 */
function parseSerial(serial) {
  if (!serial) return { success: false, error: '请输入序列号' }

  const s = serial.trim().toUpperCase()

  // 移除空格和横线
  const cleaned = s.replace(/[\s-]/g, '')

  if (cleaned.length === 12) {
    // 经典 12 位序列号
    const factory = getFactory(cleaned)
    const date = getManufactureDate(cleaned)
    const model = getModel(cleaned)
    const refurbished = isRefurbished(cleaned)
    const icon = getProductIcon(model)

    return {
      success: true,
      serial: cleaned,
      type: '12 位经典序列号',
      factory,
      date,
      model,
      refurbished,
      icon,
      uniqueId: cleaned.substring(5, 8),
    }
  }

  if (cleaned.length === 10 || cleaned.length === 11) {
    // 旧款序列号（2010 年前）
    return {
      success: true,
      serial: cleaned,
      type: '旧版序列号',
      factory: '早期产品',
      date: { text: '2010 年之前生产' },
      model: '早期 Apple 产品',
      refurbished: false,
      icon: 'apple',
      uniqueId: '-',
    }
  }

  if (cleaned.length > 12) {
    // 可能是随机序列号（2021 年后）
    return {
      success: true,
      serial: cleaned,
      type: '随机化序列号',
      factory: '无法从序列号解析',
      date: { text: '2021 年或之后生产' },
      model: '新款 Apple 产品（随机序列号无法解码型号）',
      refurbished: false,
      icon: 'apple',
      uniqueId: '-',
      notice: '自 2021 年起，Apple 采用随机化序列号，无法通过序列号解析具体信息。建议前往 Apple 官网查询。',
    }
  }

  return { success: false, error: '序列号格式不正确，请检查后重新输入' }
}

module.exports = {
  parseSerial,
}
