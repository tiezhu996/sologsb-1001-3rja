export type CueStatus = 'draft' | 'reviewed' | 'issue'
export type Locale = 'zh-CN' | 'en-US' | 'ja-JP'

export interface Cue {
  id: string
  start: number
  end: number
  source: string
  target: string
  actorId: string
  speed: number
  termIds: string[]
  status: CueStatus
  locked: boolean
}

export interface Actor {
  id: string
  name: string
  color: string
  localeHint: string
  /** 基准语速：正常播报时每秒可完成的语音单位数（中/日文按字、英文按词） */
  rate: number
}

export interface TimingEstimate {
  /** 字幕窗口可用时长（秒） */
  available: number
  /** 译文语音单位数（无译文时回退到原文） */
  units: number
  /** 译文是否为空（回退到了原文） */
  targetEmpty: boolean
  /** 按当前语速估算的实际口播时长（秒） */
  spoken: number
  /** 窗口剩余秒数，负数表示超时 */
  slack: number
  /** 当前语速下建议采用的语速倍率 */
  suggested: number
  /** 建议语速是否在允许范围内（超出则只标风险，不写入） */
  suggestionInRange: boolean
  /** 估算状态：超时、剩余或刚好 */
  status: 'over' | 'spare' | 'fit'
}

export interface BatchTimingResult {
  adopted: number
  skipped: number
  risk: number
}

export interface Term {
  id: string
  source: string
  target: string
  note: string
}

export interface Snapshot {
  id: string
  name: string
  createdAt: number
  cues: Cue[]
}

export interface EditorDocument {
  id: string
  title: string
  language: Locale
  cues: Cue[]
  actors: Actor[]
  terms: Term[]
  snapshots: Snapshot[]
  updatedAt: number
  revision: number
  lastWriter: string
}

export interface CueConflict {
  cueId: string
  type: 'actor' | 'tone' | 'address'
  message: string
}

export interface HistoryEntry {
  label: string
  cues: Cue[]
  selectedCueId: string | null
}
