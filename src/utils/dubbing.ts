import type { Cue } from '../types'

/** 语速 1.0 时的基准口播速度（字/秒），按中文纪录片配音经验取值 */
export const BASE_UNITS_PER_SECOND = 4.2
/** 允许写入的语速范围，与检查器输入框保持一致 */
export const MIN_SPEED = 0.5
export const MAX_SPEED = 1.8
/** 小于该差值（秒）视为口播时长与字幕窗口匹配 */
export const FIT_TOLERANCE = 0.2

/** 口播计量长度：中日韩字符逐字计，连续拉丁字母/数字按一个口语词计 */
export const spokenUnits = (text: string): number => {
  const cjk = (text.match(/[぀-ヿ㐀-䶿一-鿿豈-﫿가-힯]/g) ?? []).length
  const latinWords = (text.match(/[A-Za-z0-9]+/g) ?? []).length
  return cjk + latinWords
}

const dubbingText = (cue: Cue): string => cue.target || cue.source

/** 按当前语速估算口播所需秒数 */
export const estimateDuration = (cue: Cue): number => {
  const units = spokenUnits(dubbingText(cue))
  if (!units) return 0
  const speed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, cue.speed || 1))
  return units / (BASE_UNITS_PER_SECOND * speed)
}

/** 台词可用的字幕窗口秒数 */
export const availableWindow = (cue: Cue): number => Math.max(0, cue.end - cue.start)

/** 预计口播时长 - 字幕窗口；正数为超出，负数为剩余 */
export const fitDelta = (cue: Cue): number => estimateDuration(cue) - availableWindow(cue)

/** 让译文恰好填满字幕窗口所需的语速 */
export const suggestedSpeed = (cue: Cue): number => {
  const units = spokenUnits(dubbingText(cue))
  const window = availableWindow(cue)
  if (!units || window <= 0) return 1
  return units / (BASE_UNITS_PER_SECOND * window)
}

export const isSpeedInRange = (speed: number): boolean => speed >= MIN_SPEED && speed <= MAX_SPEED

/** 建议语速超出允许范围：只标风险，不写入 */
export const isSpeedRisk = (cue: Cue): boolean => !isSpeedInRange(Number(suggestedSpeed(cue).toFixed(2)))
