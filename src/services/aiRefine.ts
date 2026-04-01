/**
 * AI 意图凝练服务 v5.0
 * 
 * 基于"高光点播意图识别标准"完整重构：
 * 
 * 一、游戏判定（前置，不走LLM）
 *   - 当前仅支持王者荣耀
 *   - 其他游戏意图 → 提示暂仅支持王者荣耀
 *   - 授权状态前置判断
 *   - 无对局数据 → 提示近7d暂无可生成高光对局
 * 
 * 二、对局识别（5个维度）
 *   1. 开黑 — 是否要和好友开黑的对局
 *   2. 英雄 — 是否指定英雄或分路
 *   3. 时间 — 是否指定时间范围
 *   4. 局外事件 — 连胜/晋级等
 *   5. 局势 — 高KDA/Carry/碾压等
 * 
 * 三、高光片段识别（1个维度）
 *   1. 高光事件 — 王者荣耀全高光事件体系
 * 
 * 对局选取准则：
 *   - 有明确单场意图 → matchCount=1
 *   - 有明确多场意图 → matchCount=5
 *   - 无明确单/多局意图 → 默认1局
 * 
 * System Prompt v5.0 改进：
 *   - 新增结构化维度判定指导（含判定条件表）
 *   - 新增 matchCount 字段约束（1或5）
 *   - 新增字段约束表和枚举值说明
 *   - 新增5个 Few-shot 典型示例覆盖主要场景
 *   - 移除 sentence 凝练规则（不再需要生成描述语）
 *   - editStyle/videoType 使用中文·分隔符统一格式
 */

// ===== 类型定义 =====

/** 对局识别5维度结构 */
export interface MatchDimensions {
  /** 开黑维度 */
  teamplay: {
    hasIntent: boolean         // 是否有开黑意图
    friendName: string | null  // 指定的好友名 (null=不指定/任意好友开黑)
  }
  /** 英雄维度 */
  hero: {
    hasIntent: boolean
    heroNames: string[]        // 指定的英雄名列表
    lanes: string[]            // 指定的分路列表 (上路/中路/下路/打野/辅助)
    side: 'ally' | 'enemy' | 'any'  // 我方/敌方/任意
  }
  /** 时间维度 */
  time: {
    hasIntent: boolean
    description: string        // 时间描述 (如 "昨天"/"本周"/"上周三")
  }
  /** 局外事件维度 */
  outEvent: {
    hasIntent: boolean
    type: 'winStreak' | 'rankUp' | 'loseStreak' | null
    description: string
  }
  /** 局势维度 */
  situation: {
    hasIntent: boolean
    types: string[]            // Carry局/碾压局/翻盘局/膀胱局/高KDA等
  }
}

/** 高光事件识别结构 */
export interface HighlightDimension {
  hasExplicitIntent: boolean   // 用户是否有明确的高光意图
  events: string[]             // 识别到的高光事件列表
}

/** 五大维度结构（v4.0 简化为3层） */
export interface IntentDimensions {
  game: string                 // 1. 游戏：王者荣耀（当前仅支持）
  matchDims: MatchDimensions   // 2. 对局5维度
  highlight: HighlightDimension // 3. 高光片段
  // 以下为 v3 兼容字段（生成链路/UI展示用）
  content: {
    matchSource: string
    matchDetail: string
    clipDetail: string
  }
  videoType: string
  editStyle: string
  effect: string
  match: string
  clip: string
}

export interface RefineResult {
  dimensions: IntentDimensions
  gameAuthRequired?: string    // 需要授权的游戏
  dataWarning?: string         // 数据可用性警告
  otherGameIntent?: string     // 识别到其他游戏意图（暂不支持）
  noMatchData?: boolean        // 近7d无可生成对局
}

// ===== 王者荣耀完整高光事件词典 =====

/** 击杀播报体系 */
const KILL_BROADCAST_EVENTS = [
  '五杀', '四杀', '三杀', '双杀',
  '超神', '暴走', '横扫千军', '势不可挡',
  '大杀特杀', '杀人如麻', '团灭', '第一滴血', '终结',
]

/** 高光操作事件 */
const HIGHLIGHT_OPERATION_EVENTS = [
  // 反杀体系
  '反杀', '极限反杀', '丝血反杀', '绝境反杀', '残血反杀',
  // 1vN
  '1v2', '1v3', '1v4', '1v5', '以少敌多',
  // 关键操作
  '偷家', '偷塔', '偷水晶',
  '抢龙', '抢主宰', '抢暴君', '抢风暴龙王',
  '越塔', '越塔强杀', '塔下反杀',
  '完美开团', '先手控制',
  '瞬杀', '秒杀',
  '闪现击杀', '闪现控制', '闪现连招',
  '群控', '群体控制',
  '换装达人',
  '无敌时刻',
  // gank/蹲人
  'gank', 'gank击杀', '蹲草击杀', '蹲草', '蹲人',
  // 英雄专属
  '月下无限连', '暗夜收割', '百步穿杨',
]

/** 评价/荣誉事件 */
const HONOR_EVENTS = [
  'MVP', '金牌', '银牌', '铜牌', '全场最佳', '顶级',
]

/** 下饭/搞笑事件 */
const FAIL_EVENTS = [
  '送人头', '搞笑失误', '奇葩操作', '离谱操作',
  '脸探草丛', '被偷家', '被反杀', '团战蒸发',
  '下饭', '搞笑', '失误',
]

/** 击杀相关通用词 */
const KILL_GENERIC_EVENTS = [
  '击杀', '死亡', '助攻', '多杀', '连杀',
  'KDA最高', '高KDA',
]

/** 合并成全部高光事件词典 */
export const ALL_HIGHLIGHT_EVENTS = [
  ...KILL_BROADCAST_EVENTS,
  ...HIGHLIGHT_OPERATION_EVENTS,
  ...HONOR_EVENTS,
  ...FAIL_EVENTS,
  ...KILL_GENERIC_EVENTS,
]

// ===== System Prompt v5.0 =====
// 基于"高光点播意图识别标准"完整重构
const SYSTEM_PROMPT = `你是「AI高光点播」功能的意图凝练引擎。你的任务是从用户自然语言输入 + 用户近7天对局数据中，精准提取视频生成的关键维度。

## 一、游戏（前端已前置处理，你只需要关注王者荣耀）
- 当前【仅支持】王者荣耀一款游戏
- 授权状态和对局数据可用性由前端前置判断，你不需要处理
- 你收到的用户数据一定是已授权且有对局数据的王者荣耀玩家

## 二、对局选取 — 5个维度综合判定

你需要结合「用户说的话」和「用户近7天对局数据」对以下5个维度**独立判定**是否有明确意图。每个维度的 hasIntent 只在用户输入中有明确相关表达时才为 true。

### 维度1: 开黑（teamplay）
判断用户是否想要有好友组队的对局。
- **有指定好友**："和lykos开黑" → hasIntent=true, friendName="lykos"
- **泛指开黑**："开黑/双排/五排/三排/四排/组队/组排" → hasIntent=true, friendName=null
- **无相关表述** → hasIntent=false
- ⚠️ friendName 需要结合用户数据中的好友列表做模糊匹配（如用户说"和小明"，数据中有"xiaoming"，应补全为"xiaoming"）

### 维度2: 英雄（hero）
判断用户是否指定了英雄或分路。
- **指定英雄**："李白/貂蝉/孙尚香" 等王者荣耀英雄名 → heroNames 列出
- **指定分路**："上路/中路/打野/辅助/射手/法师" 等 → lanes 列出
- **敌方英雄**："对面XX/敌方XX" → side="enemy"
- **未指定** → 默认 side="ally"
- **无相关表述** → hasIntent=false

### 维度3: 时间（time）
判断用户是否指定了时间范围。
- **具体时间**："今天/昨天/前天/上周三" → description 填具体时间
- **模糊时间**："最近一局/刚刚/刚打的" → description="最近一局"
- **范围时间**："近3天/本周/上周/本月/赛季" → description 填范围
- **无相关表述** → hasIntent=false

### 维度4: 局外事件（outEvent）
判断用户是否提到了局外维度的对局筛选条件。
- **连胜**："连胜/3连胜/连赢" → type="winStreak"
- **连败**："连败/连跪" → type="loseStreak"
- **晋级**："晋级/升星/上分/段位之路" → type="rankUp"
- **无相关表述** → hasIntent=false

### 维度5: 局势（situation）
判断用户是否描述了对局内的局势特征。
| 局势类型 | 触发关键词 |
|---------|-----------|
| Carry局 | carry、带飞、超神、MVP、全场最佳 |
| 碾压局 | 碾压、吊打、虐、一边倒 |
| 翻盘局 | 翻盘、逆袭、逆风、绝境、背水 |
| 膀胱局 | 膀胱、超长、拉锯、焦灼 |
| 速推局 | 速推、快速、一波推 |
| 高KDA局 | 高KDA、低死亡、高输出 |
| 尽力局 | 尽力、虽败犹荣、虽然输了 |
- **无相关表述** → hasIntent=false

## 三、高光片段 — 1个维度判定

### 高光事件词典（王者荣耀完整事件体系）

**击杀播报：** 五杀、四杀、三杀、双杀、超神、暴走、横扫千军、势不可挡、大杀特杀、杀人如麻、团灭、第一滴血、终结

**高光操作：** 极限反杀、丝血反杀、绝境反杀、残血反杀、1v2、1v3、1v4、1v5、以少敌多、偷家、偷塔、偷水晶、抢龙、抢主宰、抢暴君、抢风暴龙王、越塔强杀、塔下反杀、完美开团、先手控制、瞬杀、秒杀、闪现击杀、闪现控制、闪现连招、群控、群体控制、换装达人、无敌时刻、gank击杀、蹲草击杀

**英雄专属：** 月下无限连、暗夜收割、百步穿杨

**评价荣誉：** MVP、金牌、银牌、全场最佳

**下饭/搞笑：** 送人头、搞笑失误、奇葩操作、离谱操作、脸探草丛、被偷家、被反杀、团战蒸发

**通用击杀：** 击杀、死亡、助攻、多杀、连杀、KDA最高、高KDA

### 高光判定规则
- **有明确意图**（用户提到了上述任一事件）→ hasExplicitIntent=true, events 列出具体事件名
- **无明确意图**（用户没有提到任何高光事件）→ hasExplicitIntent=false, events=[]
  - 此时前端会默认从选中对局的高光数据中自动挑选，你不需要填

## 四、对局选取准则

这些规则决定 matchCount 字段的值：
1. 用户有明确**单场**意图（"刚刚那把/上一局/最后一局/那场"）→ matchCount=1
2. 用户有明确**多场**意图（"周报/集锦/合集/总结/连胜"）→ matchCount=5
3. 用户**既没说单场也没说多场** → matchCount=1（默认单场）
4. 若有维度意图但数据中匹配到0条 → 前端会推荐一场，你不需要处理

## 五、输出 JSON 格式（严格遵循）

\`\`\`json
{
  "matchDims": {
    "teamplay": { "hasIntent": false, "friendName": null },
    "hero": { "hasIntent": true, "heroNames": ["李白"], "lanes": [], "side": "ally" },
    "time": { "hasIntent": false, "description": "" },
    "outEvent": { "hasIntent": false, "type": null, "description": "" },
    "situation": { "hasIntent": false, "types": [] }
  },
  "highlight": {
    "hasExplicitIntent": true,
    "events": ["四杀", "极限反杀"]
  },
  "matchCount": 1,
  "videoType": "单场对局",
  "editStyle": "AI匹配"
}
\`\`\`

### 字段约束
| 字段 | 类型 | 约束 |
|------|------|------|
| matchDims.teamplay.friendName | string\\|null | 用户指定→具体名，泛开黑→null |
| matchDims.hero.side | string | "ally"\\|"enemy"\\|"any" |
| matchDims.outEvent.type | string\\|null | "winStreak"\\|"loseStreak"\\|"rankUp"\\|null |
| highlight.events | string[] | 必须来自上方高光事件词典 |
| matchCount | number | 1或5 |
| videoType | string | "单场对局"\\|"多场总结"\\|"多场总结·周报"\\|"多场总结·日报"\\|"多场总结·月报"\\|"多场总结·赛季报"\\|"多场总结·连胜时刻"\\|"多场总结·晋级之路"\\|"AI识别生成" |
| editStyle | string | "纯操作"\\|"剧情流·高燃"\\|"剧情流·搞笑"\\|"剧情流·励志"\\|"剧情流·感动"\\|"剧情流·吐槽"\\|"剧情流·记录"\\|"剧情流·分析"\\|"AI匹配" |

## 六、Few-shot 示例

**示例1**（简单单场）
用户说："帮我剪一下刚打的李白"
\`\`\`json
{
  "matchDims": {
    "teamplay": { "hasIntent": false, "friendName": null },
    "hero": { "hasIntent": true, "heroNames": ["李白"], "lanes": [], "side": "ally" },
    "time": { "hasIntent": true, "description": "最近一局" },
    "outEvent": { "hasIntent": false, "type": null, "description": "" },
    "situation": { "hasIntent": false, "types": [] }
  },
  "highlight": { "hasExplicitIntent": false, "events": [] },
  "matchCount": 1,
  "videoType": "单场对局",
  "editStyle": "AI匹配"
}
\`\`\`

**示例2**（开黑+高光意图）
用户说："和lykos双排那把五杀太帅了，帮我剪"
\`\`\`json
{
  "matchDims": {
    "teamplay": { "hasIntent": true, "friendName": "lykos" },
    "hero": { "hasIntent": false, "heroNames": [], "lanes": [], "side": "any" },
    "time": { "hasIntent": false, "description": "" },
    "outEvent": { "hasIntent": false, "type": null, "description": "" },
    "situation": { "hasIntent": false, "types": [] }
  },
  "highlight": { "hasExplicitIntent": true, "events": ["五杀"] },
  "matchCount": 1,
  "videoType": "单场对局",
  "editStyle": "AI匹配"
}
\`\`\`

**示例3**（多维度+多场）
用户说："最近这周有没有翻盘局，帮我做个集锦"
\`\`\`json
{
  "matchDims": {
    "teamplay": { "hasIntent": false, "friendName": null },
    "hero": { "hasIntent": false, "heroNames": [], "lanes": [], "side": "any" },
    "time": { "hasIntent": true, "description": "本周" },
    "outEvent": { "hasIntent": false, "type": null, "description": "" },
    "situation": { "hasIntent": true, "types": ["翻盘局"] }
  },
  "highlight": { "hasExplicitIntent": false, "events": [] },
  "matchCount": 5,
  "videoType": "多场总结",
  "editStyle": "剧情流·高燃"
}
\`\`\`

**示例4**（搞笑/下饭）
用户说："来点我最近的下饭操作笑一下"
\`\`\`json
{
  "matchDims": {
    "teamplay": { "hasIntent": false, "friendName": null },
    "hero": { "hasIntent": false, "heroNames": [], "lanes": [], "side": "any" },
    "time": { "hasIntent": false, "description": "" },
    "outEvent": { "hasIntent": false, "type": null, "description": "" },
    "situation": { "hasIntent": false, "types": [] }
  },
  "highlight": { "hasExplicitIntent": true, "events": ["搞笑失误", "脸探草丛", "被反杀"] },
  "matchCount": 5,
  "videoType": "多场总结",
  "editStyle": "剧情流·搞笑"
}
\`\`\`

**示例5**（极简输入，无明确意图）
用户说："帮我剪个视频"
\`\`\`json
{
  "matchDims": {
    "teamplay": { "hasIntent": false, "friendName": null },
    "hero": { "hasIntent": false, "heroNames": [], "lanes": [], "side": "any" },
    "time": { "hasIntent": false, "description": "" },
    "outEvent": { "hasIntent": false, "type": null, "description": "" },
    "situation": { "hasIntent": false, "types": [] }
  },
  "highlight": { "hasExplicitIntent": false, "events": [] },
  "matchCount": 1,
  "videoType": "AI识别生成",
  "editStyle": "AI匹配"
}
\`\`\`

## ⚠️ 严格要求
1. **只输出JSON**，不要任何其他文本、解释或 markdown 标记
2. 5个维度**独立判断**，可以多个维度同时 hasIntent=true
3. highlight.events **必须**来自上方高光事件词典中的词
4. matchCount 只有 1 或 5 两种值
5. 结合用户近7天对局数据来辅助判断（如用户说"打野"，数据中常用英雄有"韩信(刺客)"，可以联想填入）`

// ===== 模拟用户数据上下文 =====
const DEFAULT_USER_CONTEXT = `用户数据：
- 已授权：王者荣耀✅
- 最近活跃：王者荣耀
- 近期对局（王者）：
  · 今天14:32 排位·李白 KDA 12/3/5 胜 四杀+MVP+超神
  · 今天13:00 排位·孙尚香 KDA 8/2/6 胜 三杀+极限反杀
  · 昨天22:15 排位·貂蝉 KDA 6/4/8 败 无敌时刻+被偷家
  · 昨天20:30 双排(lykos)·孙尚香 KDA 10/1/7 胜 五杀+MVP+团灭 [Carry局]
  · 前天18:00 五排(xiaoming等)·李白 KDA 5/5/10 胜 抢龙+完美开团 [翻盘局]
- 常用英雄：李白(刺客)、孙尚香(射手)、貂蝉(法师)
- 最近开黑：lykos(昨天双排)、xiaoming(前天五排)
- 当前段位：荣耀王者
- 近7天数据：5局`

// 当前激活的 USER_CONTEXT
let _activeUserContext: string | null = null
let _activePlayerProfile: import('../services/playerProfile').PlayerProfile | null = null

export function setActiveUserContext(ctx: string | null) {
  _activeUserContext = ctx
  console.log('[AI Refine] USER_CONTEXT 已切换:', ctx ? ctx.split('\n')[0] : '默认')
}

export function setActivePlayerProfile(profile: import('../services/playerProfile').PlayerProfile | null) {
  _activePlayerProfile = profile
  console.log('[AI Refine] PlayerProfile 已切换:', profile ? profile.name : '无')
}

function getUserContext(): string {
  return _activeUserContext || DEFAULT_USER_CONTEXT
}

function getActiveProfile(): import('../services/playerProfile').PlayerProfile | null {
  return _activePlayerProfile
}

// ===== API 调用 =====

const API_BASE = import.meta.env.VITE_AI_API_BASE || 'https://open.bigmodel.cn/api/paas/v4'
const API_KEY = import.meta.env.VITE_AI_API_KEY || ''
const MODEL = import.meta.env.VITE_AI_MODEL || 'glm-4-flash'

function getApiEndpoint(): string {
  if (import.meta.env.DEV) {
    return '/ai-api/chat/completions'
  }
  return `${API_BASE}/chat/completions`
}

export async function aiRefine(userInput: string): Promise<RefineResult> {
  if (!API_KEY || API_KEY === 'your-api-key-here') {
    console.warn('[AI Refine v4] 未配置 API Key，使用本地 fallback')
    return localFallbackRefine(userInput)
  }

  try {
    const apiUrl = getApiEndpoint()
    console.log('[AI Refine v4] 调用:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `${getUserContext()}\n\n用户说：${userInput}` },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`API ${response.status}: ${errText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) throw new Error('AI 返回内容为空')

    let jsonStr = content.trim()
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) jsonStr = jsonMatch[1].trim()

    const parsed = JSON.parse(jsonStr)
    return buildRefineResult(userInput, parsed)
  } catch (error) {
    console.error('[AI Refine v4] 降级使用本地 fallback:', error)
    return localFallbackRefine(userInput)
  }
}

/** 将 LLM 解析结果构建为标准 RefineResult */
function buildRefineResult(userInput: string, parsed: Record<string, unknown>): RefineResult {
  const md = parsed.matchDims as Record<string, unknown> || {}
  const hl = parsed.highlight as Record<string, unknown> || {}

  const matchDims: MatchDimensions = {
    teamplay: {
      hasIntent: (md.teamplay as Record<string, unknown>)?.hasIntent as boolean || false,
      friendName: (md.teamplay as Record<string, unknown>)?.friendName as string | null || null,
    },
    hero: {
      hasIntent: (md.hero as Record<string, unknown>)?.hasIntent as boolean || false,
      heroNames: (md.hero as Record<string, unknown>)?.heroNames as string[] || [],
      lanes: (md.hero as Record<string, unknown>)?.lanes as string[] || [],
      side: ((md.hero as Record<string, unknown>)?.side as 'ally' | 'enemy' | 'any') || 'any',
    },
    time: {
      hasIntent: (md.time as Record<string, unknown>)?.hasIntent as boolean || false,
      description: (md.time as Record<string, unknown>)?.description as string || '',
    },
    outEvent: {
      hasIntent: (md.outEvent as Record<string, unknown>)?.hasIntent as boolean || false,
      type: (md.outEvent as Record<string, unknown>)?.type as MatchDimensions['outEvent']['type'] || null,
      description: (md.outEvent as Record<string, unknown>)?.description as string || '',
    },
    situation: {
      hasIntent: (md.situation as Record<string, unknown>)?.hasIntent as boolean || false,
      types: (md.situation as Record<string, unknown>)?.types as string[] || [],
    },
  }

  const highlight: HighlightDimension = {
    hasExplicitIntent: hl.hasExplicitIntent as boolean || false,
    events: hl.events as string[] || [],
  }

  // 生成兼容字段
  const matchDetail = buildMatchDetailText(matchDims)
  const clipDetail = highlight.hasExplicitIntent ? highlight.events.join('+') : '高光时刻'

  // 解析 matchCount（新增字段，LLM 输出 1 或 5）
  const matchCount = typeof parsed.matchCount === 'number' ? parsed.matchCount : 1

  // 根据 matchCount 辅助修正 videoType
  let videoType = parsed.videoType as string || 'AI识别生成'
  if (matchCount === 1 && videoType === 'AI识别生成') videoType = '单场对局'
  if (matchCount > 1 && videoType === 'AI识别生成') videoType = '多场总结'

  return {
    dimensions: {
      game: '王者荣耀',
      matchDims,
      highlight,
      content: {
        matchSource: buildMatchSourceText(matchDims),
        matchDetail,
        clipDetail,
      },
      videoType,
      editStyle: parsed.editStyle as string || 'AI匹配',
      effect: 'AI自动填充',
      match: matchDetail,
      clip: clipDetail,
    },
  }
}

// ===== 授权状态 =====

type GameType = 'wzry' | 'hpjy'

const AUTH_STATE: Record<GameType, boolean> = {
  wzry: true,
  hpjy: false,
}

export function updateAuthState(wzry: boolean, hpjy: boolean) {
  AUTH_STATE.wzry = wzry
  AUTH_STATE.hpjy = hpjy
}

// ===== 王者荣耀英雄名列表 =====
const WZRY_HERO_NAMES = [
  '李白', '貂蝉', '孙尚香', '鲁班', '鲁班七号', '后羿', '妲己', '亚瑟', '诸葛亮', '韩信', '赵云', '露娜',
  '花木兰', '橘右京', '百里守约', '百里玄策', '公孙离', '瑶', '蔡文姬', '大乔', '庄周', '张飞', '牛魔',
  '廉颇', '项羽', '马可波罗', '伽罗', '虞姬', '干将', '甄姬', '嬴政', '武则天', '上官婉儿', '司马懿',
  '墨子', '阿轲', '兰陵王', '娜可露露', '镜', '元歌', '澜', '关羽', '刘备', '杨戬', '夏侯惇', '典韦',
  '曹操', '吕布', '孙悟空', '哪吒', '铠', '苏烈', '孙策', '东皇太一', '太乙真人', '盾山', '程咬金',
  '刘邦', '猪八戒', '蒙恬', '狂铁', '云中君', '马超', '曜', '司空震', '安琪拉', '王昭君', '小乔',
  '芈月', '钟馗', '扁鹊', '张良', '周瑜', '姜子牙', '女娲', '金蝉', '西施', '杨玉环', '沈梦溪',
  '弈星', '高渐离', '米莱狄', '狄仁杰', '成吉思汗', '黄忠', '蒙犽', '鬼谷子', '明世隐', '桑启',
  '不知火舞', '白起', '刘禅', '钟无艳', '宫本武藏', '达摩', '老夫子', '裴擒虎', '梦奇', '雅典娜',
  '李信', '盘古', '暃', '云樱', '夏洛特', '嫦娥', '阿古朵', '艾琳', '戈娅',
]

/** 分路关键词 */
const LANE_KEYWORDS: Record<string, string> = {
  '上路': '上路', '上单': '上路', '对抗路': '上路',
  '中路': '中路', '中单': '中路',
  '下路': '下路', '发育路': '下路',
  '打野': '打野', '野区': '打野',
  '辅助': '辅助', '游走': '辅助',
  '射手': '射手', '法师': '法师', '刺客': '刺客', '战士': '战士', '坦克': '坦克',
}

// ===== 其他游戏检测 =====

function detectOtherGameIntent(input: string): string | null {
  if (/和平精英|吃鸡|绝地求生|空投|毒圈|跑毒|四排|AWM|98[kK]|M416|AKM|淘汰/.test(input)) {
    return '和平精英'
  }
  if (/英雄联盟|LOL|lol|召唤师峡谷|上单|ADC|打野位|中单位/.test(input)) {
    return '英雄联盟'
  }
  if (/原神|提瓦特|树脂|深渊|莫娜|可莉|钟离|胡桃|甘雨|纳西妲/.test(input)) {
    return '原神'
  }
  if (/CSGO|CS2|csgo|cs2|反恐精英|ACE|Rush/.test(input)) {
    return 'CS2'
  }
  if (/PUBG|pubg|绝地求生端游/.test(input)) {
    return 'PUBG'
  }
  return null
}

// ===== 维度1: 开黑识别 =====
function detectTeamplay(input: string): MatchDimensions['teamplay'] {
  // "和XX开黑/一起/双排/组队/五排/三排/四排/玩"
  const friendMatch = input.match(/和\s*(\S+?)\s*(开黑|一起|双排|组队|五排|三排|四排|玩)/)
  if (friendMatch) {
    return { hasIntent: true, friendName: friendMatch[1] }
  }
  // 泛开黑意图（没指定具体好友）
  if (/开黑|双排|五排|三排|四排|组队|组排/.test(input)) {
    return { hasIntent: true, friendName: null }
  }
  return { hasIntent: false, friendName: null }
}

// ===== 维度2: 英雄识别 =====
function detectHero(input: string): MatchDimensions['hero'] {
  const heroNames: string[] = []
  for (const hero of WZRY_HERO_NAMES) {
    if (input.includes(hero)) heroNames.push(hero)
  }

  const lanes: string[] = []
  for (const [keyword, lane] of Object.entries(LANE_KEYWORDS)) {
    if (input.includes(keyword) && !lanes.includes(lane)) {
      lanes.push(lane)
    }
  }

  // 判断是我方还是敌方
  let side: 'ally' | 'enemy' | 'any' = 'any'
  if (/对面|敌方|敌人/.test(input)) side = 'enemy'
  else if (/我的|我方|我用|我玩/.test(input)) side = 'ally'
  else if (heroNames.length > 0 || lanes.length > 0) side = 'ally' // 默认指我方

  if (heroNames.length > 0 || lanes.length > 0) {
    return { hasIntent: true, heroNames, lanes, side }
  }
  return { hasIntent: false, heroNames: [], lanes: [], side: 'any' }
}

// ===== 维度3: 时间识别 =====
function detectTime(input: string): MatchDimensions['time'] {
  if (/刚刚|上一局|刚打|刚才|最近一局|最后一局/.test(input)) {
    return { hasIntent: true, description: '最近一局' }
  }
  if (/今天|今日/.test(input)) return { hasIntent: true, description: '今天' }
  if (/昨天|昨日/.test(input)) return { hasIntent: true, description: '昨天' }
  if (/前天/.test(input)) return { hasIntent: true, description: '前天' }

  const dayMatch = input.match(/最近(\d+)天|近(\d+)天/)
  if (dayMatch) return { hasIntent: true, description: `近${dayMatch[1] || dayMatch[2]}天` }

  const gameMatch = input.match(/最近(\d+)局|近(\d+)局/)
  if (gameMatch) return { hasIntent: true, description: `近${gameMatch[1] || gameMatch[2]}局` }

  if (/本周|这周|一周|周报/.test(input)) return { hasIntent: true, description: '本周' }
  if (/上周/.test(input)) {
    const dayName = input.match(/上周([一二三四五六日天])/)
    return { hasIntent: true, description: dayName ? `上周${dayName[1]}` : '上周' }
  }
  if (/本月|这个月|月报/.test(input)) return { hasIntent: true, description: '本月' }
  if (/赛季|本赛季|赛季报/.test(input)) return { hasIntent: true, description: '本赛季' }
  if (/最近三天|近三天/.test(input)) return { hasIntent: true, description: '近3天' }

  return { hasIntent: false, description: '' }
}

// ===== 维度4: 局外事件识别 =====
function detectOutEvent(input: string): MatchDimensions['outEvent'] {
  if (/连胜/.test(input)) {
    const countMatch = input.match(/(\d+)连胜/)
    return {
      hasIntent: true,
      type: 'winStreak',
      description: countMatch ? `${countMatch[1]}连胜` : '连胜',
    }
  }
  if (/晋级|升星|上分|段位.*之路/.test(input)) {
    const rankMatch = input.match(/晋级(\S+?)(?:[，,。！!]|$)/)
    return {
      hasIntent: true,
      type: 'rankUp',
      description: rankMatch ? `晋级${rankMatch[1]}` : '晋级',
    }
  }
  if (/连败/.test(input)) {
    return { hasIntent: true, type: 'loseStreak', description: '连败' }
  }
  return { hasIntent: false, type: null, description: '' }
}

// ===== 维度5: 局势识别 =====
function detectSituation(input: string): MatchDimensions['situation'] {
  const types: string[] = []
  if (/carry|Carry|超神局|MVP局|带飞|全场最佳/.test(input)) types.push('Carry局')
  if (/碾压|吊打|虐|一边倒/.test(input)) types.push('碾压局')
  if (/翻盘|逆袭|逆风|绝境|背水/.test(input)) types.push('翻盘局')
  if (/膀胱|超长|拉锯|焦灼/.test(input)) types.push('膀胱局')
  if (/速推|快速|一波|推进/.test(input)) types.push('速推局')
  if (/高KDA|高kda|高战损|KDA最高/.test(input)) types.push('高KDA局')
  if (/尽力|虽败犹荣|虽然输了/.test(input)) types.push('尽力局')

  return { hasIntent: types.length > 0, types }
}

// ===== 高光事件识别 =====
function detectHighlight(input: string): HighlightDimension {
  const events: string[] = []

  // 按优先级（长词优先）排序后匹配
  const sortedEvents = [...ALL_HIGHLIGHT_EVENTS].sort((a, b) => b.length - a.length)
  for (const event of sortedEvents) {
    if (input.includes(event)) {
      // 避免重复（如"极限反杀"已匹配，不再匹配"反杀"）
      if (!events.some(e => e.includes(event) || event.includes(e))) {
        events.push(event)
      }
    }
  }

  // 也检查 "有N次击杀"/"N次三杀" 这种模式
  const killCountMatch = input.match(/有?(\S+?)次(击杀|三杀|四杀|五杀|反杀)/)
  if (killCountMatch) {
    const desc = `${killCountMatch[1]}次${killCountMatch[2]}`
    if (!events.some(e => e.includes(killCountMatch[2]))) {
      events.push(desc)
    }
  }

  return {
    hasExplicitIntent: events.length > 0,
    events,
  }
}

// ===== 辅助文本生成 =====

function buildMatchSourceText(dims: MatchDimensions): string {
  const parts: string[] = []
  if (dims.teamplay.hasIntent) parts.push('开黑')
  if (dims.hero.hasIntent) parts.push('英雄指定')
  if (dims.time.hasIntent) parts.push('时间指定')
  if (dims.outEvent.hasIntent) parts.push('局外事件')
  if (dims.situation.hasIntent) parts.push('局势描述')
  return parts.length > 0 ? parts.join('+') : '综合'
}

function buildMatchDetailText(dims: MatchDimensions): string {
  const parts: string[] = []
  if (dims.time.hasIntent) parts.push(dims.time.description)
  if (dims.hero.hasIntent) {
    if (dims.hero.heroNames.length > 0) parts.push(dims.hero.heroNames.join('&'))
    if (dims.hero.lanes.length > 0) parts.push(dims.hero.lanes.join('&'))
  }
  if (dims.teamplay.hasIntent) {
    parts.push(dims.teamplay.friendName ? `和${dims.teamplay.friendName}开黑` : '好友开黑')
  }
  if (dims.outEvent.hasIntent) parts.push(dims.outEvent.description)
  if (dims.situation.hasIntent) parts.push(dims.situation.types.join('&'))
  return parts.length > 0 ? parts.join('·') : '最近对局'
}

// ===== 视频类型判断（与 SYSTEM_PROMPT v5.0 videoType 约束对齐） =====
function detectVideoType(input: string, dims: MatchDimensions): string {
  // 明确多场
  if (/日报/.test(input)) return '多场总结·日报'
  if (/周报/.test(input)) return '多场总结·周报'
  if (/月报/.test(input)) return '多场总结·月报'
  if (/赛季报|赛季总结/.test(input)) return '多场总结·赛季报'
  if (/总结|合集|集锦/.test(input)) return '多场总结'
  if (/晋级.*之路|晋级.*历程/.test(input)) return '多场总结·晋级之路'
  if (dims.outEvent.type === 'winStreak') return '多场总结·连胜时刻'

  // 明确单场
  if (/刚刚|上一局|刚打|刚才|最后一局|最近一局/.test(input)) return '单场对局'
  if (/那一局|那把|那场/.test(input)) return '单场对局'

  // 时间范围暗示多场
  if (/本周|一周|近\d+天|本月|赛季|最近三天/.test(input)) return '多场总结'

  return 'AI识别生成'
}

// ===== 剪辑风格判断（与 SYSTEM_PROMPT v5.0 editStyle 约束对齐） =====
function detectEditStyle(input: string): string {
  if (/纯操作|秀操作|操作集锦|技巧|教学|教程/.test(input)) return '纯操作'
  if (/燃|炫酷|帅|酷|史诗|大片|热血/.test(input)) return '剧情流·高燃'
  if (/励志|坚持|努力|不放弃/.test(input)) return '剧情流·励志'
  if (/感动|温暖|陪伴|友情|回忆/.test(input)) return '剧情流·感动'
  if (/搞笑|沙雕|整活|离谱|笑死|下饭|鬼畜/.test(input)) return '剧情流·搞笑'
  if (/吐槽|毒舌|自嘲/.test(input)) return '剧情流·吐槽'
  if (/记录|留念|日常/.test(input)) return '剧情流·记录'
  if (/分析|复盘|思路/.test(input)) return '剧情流·分析'
  return 'AI匹配'
}

// ===== 数据校验 =====

interface DataValidation {
  friendCheck: { requestedFriend: string | null; matched: boolean; availableFriends: string[] }
  eventCheck: { requestedEvents: string[]; allMatched: boolean; missing: string[]; alternatives: string[] }
  heroCheck: { requestedHeroes: string[]; allMatched: boolean; missing: string[]; availableHeroes: string[] }
  warnings: string[]
}

function validateData(input: string, matchDims: MatchDimensions, highlight: HighlightDimension): DataValidation {
  const profile = getActiveProfile()
  const warnings: string[] = []

  // 好友校验
  let friendCheck: DataValidation['friendCheck'] = { requestedFriend: null, matched: true, availableFriends: [] }
  if (matchDims.teamplay.hasIntent && matchDims.teamplay.friendName && profile) {
    const requested = matchDims.teamplay.friendName
    const available = profile.wzryData.friends?.map(f => f.name) || []
    const matched = available.some(f =>
      f === requested || f.toLowerCase() === requested.toLowerCase() ||
      f.includes(requested) || requested.includes(f)
    )
    friendCheck = { requestedFriend: requested, matched, availableFriends: available }
    if (!matched) {
      if (available.length > 0) {
        warnings.push(`近期暂无和${requested}的开黑记录～你最近和${available.join('、')}有开黑`)
      } else {
        warnings.push(`近期暂无和${requested}的开黑记录`)
      }
    }
  }

  // 高光事件校验
  let eventCheck: DataValidation['eventCheck'] = { requestedEvents: [], allMatched: true, missing: [], alternatives: [] }
  if (highlight.hasExplicitIntent && profile) {
    const events = profile.wzryData.inGameEvents
    const missing: string[] = []
    const alternatives: string[] = []

    // 简化校验：检查事件统计中是否有对应数据
    for (const ev of highlight.events) {
      // 只校验主要事件
      if (ev === '五杀' && events.pentaKill === 0) missing.push('五杀')
      else if (ev === '四杀' && events.quadraKill === 0) missing.push('四杀')
      else if (ev === '三杀' && events.tripleKill === 0) missing.push('三杀')
      else if (ev === '超神' && events.legendary === 0) missing.push('超神')
    }

    if (missing.length > 0) {
      // 找替代
      if (events.tripleKill > 0) alternatives.push(`三杀×${events.tripleKill}`)
      if (events.quadraKill > 0) alternatives.push(`四杀×${events.quadraKill}`)
      if (events.pentaKill > 0) alternatives.push(`五杀×${events.pentaKill}`)
      if (events.counterKill > 0) alternatives.push(`极限反杀×${events.counterKill}`)
      if (events.mvp > 0) alternatives.push(`MVP×${events.mvp}`)

      warnings.push(`近期暂无「${missing.join('、')}」记录～${alternatives.length > 0 ? `不过有：${alternatives.join('、')}` : ''}`)
    }

    eventCheck = {
      requestedEvents: highlight.events,
      allMatched: missing.length === 0,
      missing,
      alternatives,
    }
  }

  // 英雄校验
  let heroCheck: DataValidation['heroCheck'] = { requestedHeroes: [], allMatched: true, missing: [], availableHeroes: [] }
  if (matchDims.hero.hasIntent && matchDims.hero.heroNames.length > 0 && profile) {
    const available = [
      ...(profile.wzryData.heroes || []),
      ...(profile.wzryData.recentMatches || []).map(m => m.hero),
    ]
    const uniqueAvailable = [...new Set(available)]
    const missing: string[] = []

    for (const hero of matchDims.hero.heroNames) {
      if (!uniqueAvailable.some(h => h === hero || h.includes(hero) || hero.includes(h))) {
        missing.push(hero)
      }
    }

    if (missing.length > 0) {
      warnings.push(`近期没有${missing.join('、')}的对局记录～常用：${uniqueAvailable.slice(0, 3).join('、')}`)
    }

    heroCheck = {
      requestedHeroes: matchDims.hero.heroNames,
      allMatched: missing.length === 0,
      missing,
      availableHeroes: uniqueAvailable,
    }
  }

  return { friendCheck, eventCheck, heroCheck, warnings }
}

// ===== 本地 Fallback 主函数 =====

function localFallbackRefine(input: string): RefineResult {
  // ★ 规则一：其他游戏检测
  const otherGame = detectOtherGameIntent(input)
  // 同时检测是否也提到了王者
  const mentionsWzry = /王者|荣耀|峡谷|五杀|四杀|三杀|双杀|超神|暴走|团灭|李白|貂蝉|孙尚香|韩信|露娜|排位|巅峰赛/.test(input)

  if (otherGame && !mentionsWzry) {
    // 纯其他游戏意图
    return {
      dimensions: createEmptyDimensions(),
      otherGameIntent: otherGame,
    }
  }

  // ★ 5维对局识别
  const teamplay = detectTeamplay(input)
  const hero = detectHero(input)
  const time = detectTime(input)
  const outEvent = detectOutEvent(input)
  const situation = detectSituation(input)

  const matchDims: MatchDimensions = { teamplay, hero, time, outEvent, situation }

  // ★ 高光事件识别
  const highlight = detectHighlight(input)

  // ★ 视频类型 & 剪辑风格
  const videoType = detectVideoType(input, matchDims)
  const editStyle = detectEditStyle(input)

  // ★ 数据校验
  const validation = validateData(input, matchDims, highlight)
  const dataWarning = validation.warnings.length > 0 ? validation.warnings.join('；') : undefined

  // 生成兼容字段
  const matchDetail = buildMatchDetailText(matchDims)
  const clipDetail = highlight.hasExplicitIntent ? highlight.events.join('+') : '高光时刻'

  return {
    dimensions: {
      game: '王者荣耀',
      matchDims,
      highlight,
      content: {
        matchSource: buildMatchSourceText(matchDims),
        matchDetail,
        clipDetail,
      },
      videoType,
      editStyle,
      effect: 'AI自动填充',
      match: matchDetail,
      clip: clipDetail,
    },
    dataWarning,
  }
}

/** 创建空维度（用于异常/不支持场景） */
function createEmptyDimensions(): IntentDimensions {
  return {
    game: '王者荣耀',
    matchDims: {
      teamplay: { hasIntent: false, friendName: null },
      hero: { hasIntent: false, heroNames: [], lanes: [], side: 'any' },
      time: { hasIntent: false, description: '' },
      outEvent: { hasIntent: false, type: null, description: '' },
      situation: { hasIntent: false, types: [] },
    },
    highlight: { hasExplicitIntent: false, events: [] },
    content: { matchSource: '综合', matchDetail: '最近对局', clipDetail: '高光时刻' },
    videoType: 'AI识别生成',
    editStyle: 'AI匹配',
    effect: 'AI自动填充',
    match: '最近对局',
    clip: '高光时刻',
  }
}
