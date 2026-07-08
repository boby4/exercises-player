/**
 * 完整数据加载器（分包专用）
 * exercises-detail.json 使用单字母键名 + 去除冗余字段以压缩体积
 */
import type { Exercise } from '@/types/exercise'
import detailRaw from '@/assets/data/exercises-detail.json'

interface RawDetail {
  id: string
  n: string // name
  b: string // body_part
  q: string // equipment
  t: string // target
  m: string // media_id
  s: string[] // instruction_steps zh
  i: string // instructions zh
}

const detailMap = new Map<string, Exercise>()
;(detailRaw as RawDetail[]).forEach((item) => {
  detailMap.set(item.id, {
    id: item.id,
    name: item.n,
    body_part: item.b,
    equipment: item.q,
    target: item.t,
    media_id: item.m || null,
    secondary_muscles: [],
    instruction_steps: { zh: item.s, en: [] } as any,
    instructions: { zh: item.i } as any,
    gif_url: null,
    image: null,
    category: '',
    muscle_group: '',
    created_at: '',
  })
})

export function getFullExerciseById(id: string): Exercise | undefined {
  return detailMap.get(id)
}

export function getFullExercisesByIds(ids: string[]): Exercise[] {
  return ids.map((id) => detailMap.get(id)).filter(Boolean) as Exercise[]
}
