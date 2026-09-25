import type { Actor, Cue, TimingEstimate } from '../types'

/** 语速倍率允许范围；建议超出该区间时只标风险，不写入语速 */
export const SPEED_MIN = 0.7
export const SPEED_MAX = 1.5
/** 判定剩余时长的阈值（秒） */
export const SPARE_EPSILON = 0.15

const isLatinLocale = (localeHint = '') => /^en/i.test(localeHint)

/**
 * 统计配音文本的语音单位数：中/日文按字符计，拉丁字符语言按单词计；
 * 数字、标点和空白不计入。
 */
export function speechUnits(text: string, latin: boolean): number {
  const value = text.trim()
  if (!value) return 0
  if (latin) {
    const words = value.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g)
    return words ? words.length : 0
  }
  const chars = value.match(/[㐀-鿿぀-ヿ가-힯\w]/g)
  return chars ? chars.length : 0
}

/** 按“可用时长 / 角色基准语速 / 译文长度”估算单条台词的口播时长 */
export function estimateTiming(cue: Cue, actor: Actor | undefined): TimingEstimate {
  const rate = actor?.rate && actor.rate > 0 ? actor.rate : 4.5
  const latin = isLatinLocale(actor?.localeHint)
  const targetEmpty = !cue.target.trim()
  const units = speechUnits(targetEmpty ? cue.source : cue.target, latin)
  const available = Math.max(0, cue.end - cue.start)
  const spoken = cue.speed > 0 ? units / (rate * cue.speed) : 0
  const slack = available - spoken
  // 要在窗口内读完所需的语速倍率
  const suggested = available > 0 && rate > 0 ? units / (rate * available) : 1
  const inRange = suggested >= SPEED_MIN && suggested <= SPEED_MAX
  const status: TimingEstimate['status'] =
    slack < -SPARE_EPSILON ? 'over' : slack > SPARE_EPSILON ? 'spare' : 'fit'
  return { available, units, targetEmpty, spoken, slack, suggested, suggestionInRange: inRange, status }
}

export const formatDelta = (seconds: number): string => {
  const rounded = Math.round(Math.abs(seconds) * 10) / 10
  const sign = seconds < -SPARE_EPSILON ? '+' : seconds > SPARE_EPSILON ? '−' : '±'
  return `${sign}${rounded.toFixed(1)}s`
}
