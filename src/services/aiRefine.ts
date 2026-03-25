/**
 * AI 意图凝练服务
 * 调用大模型 API，将用户自然语言拆解为五维度结构化意图
 */

export interface IntentDimensions {
  game: string       // 游戏
  match: string      // 对局
  clip: string       // 片段
  editStyle: string  // 剪辑方式
  effect: string     // 特效
}

export interface RefineResult {
  dimensions: IntentDimensions
  sentence: string   // 凝练后的一句话
}

// ===== System Prompt：五维度意图拆解 + 情感识别 =====
const SYSTEM_PROMPT = `你是一个游戏高光视频AI剪辑师的意图理解引擎。

你的任务是：
1. **识别用户的情感/语气**
2. 将用户的自然语言需求，拆解凝练为包含5个维度的结构化意图
3. 基于情感语气，输出一句风格匹配的凝练话

## 第一步：情感识别

你需要先从用户的输入中识别出情感基调（mood），这将影响后续所有维度的选择：

| mood | 描述 | 触发特征 |
|------|------|---------|
| epic | 史诗高燃 | 默认情感；用户想要炫酷、震撼、高光 |
| funny | 搞笑沙雕 | 搞笑、沙雕、整活、离谱、笑死、哈哈、鬼畜 |
| revenge | 翻盘复仇 | 翻盘、逆袭、反杀、丝血、绝境、背水一战 |
| nostalgic | 怀旧回忆 | 回忆、怀念、纪念、青春、留念、时光 |
| pro | 专业分析 | 教学、复盘、分析、技巧、攻略、打法 |
| wholesome | 温馨友情 | 开黑、兄弟、好友、一起、队友、闺蜜、陪伴 |
| chill | 佛系轻松 | 随便、简单、轻松、日常、休闲、短一点 |

## 第二步：五个维度

根据识别出的 mood，从以下每个维度的选项中选择最适配的值。**不要总是选默认值**，要根据 mood 主动推荐有创意的组合。

### 1. 游戏（game）
- 可选值：王者荣耀、和平精英
- 如果用户未提及，根据上下文推断，默认"王者荣耀"

### 2. 对局（match）—— ⚠️ 必须区分游戏类型

**王者荣耀（MOBA）对局类型**：
- 精彩对局：KDA高的对局、连胜局、晋级赛、高分对局
- 开黑对局：双排/三排/五排对局、和指定好友的开黑对局
- 英雄对局：用某英雄打的对局（如李白、貂蝉、孙尚香）
- 局势对局：逆风翻盘的对局、有五杀/四杀的对局
- 精准对局：刚刚的对局、上一局、最近一周所有对局

**和平精英（FPS/吃鸡）对局类型**：
- 吃鸡对局：成功吃鸡的对局、前三名的对局
- 开黑对局：双排/四排组队对局、和指定好友的开黑对局
- 高淘汰对局：淘汰数高的对局、连续淘汰的对局
- 模式对局：经典模式、娱乐模式、团队竞技对局
- 精准对局：刚刚的对局、上一局、最近一周所有对局

如果用户未提及，默认"最近一局排位赛"

### 3. 片段（clip）—— ⚠️ 必须根据游戏选择匹配的片段，严禁跨游戏混用

**王者荣耀专属片段**：
- 击杀类：五杀、四杀、三杀、踏草击杀、塔下反杀、越塔强杀
- 策略类：极限偷家、关键抢龙/抢主宰/抢暴君、完美开团
- 辅助类：关键控制、群体控制、关键治疗
- 综合类：综合高光时刻、MVP全场最佳、1v多极限操作

**和平精英专属片段**：
- 射击类：精准狙杀、连续淘汰、爆头集锦、远距离击倒
- 策略类：决赛圈吃鸡、空投争夺战、毒圈极限跑毒、载具飞车击杀
- 生存类：绝境求生、丝血逃生、钢枪对决
- 综合类：综合高光时刻、全场最佳淘汰、落地刚枪名场面

**⛔ 绝对禁止的跨游戏错误**：
- 和平精英中不能出现：五杀、团战、偷家、偷塔、抢龙、抢主宰、抢暴君、越塔、塔下反杀、英雄
- 王者荣耀中不能出现：吃鸡、空投、毒圈、狙杀、淘汰、决赛圈、载具、跑毒、爆头

**mood 适配示例（需同时匹配游戏）**：

王者荣耀：
  - epic → "综合高光时刻""最高连杀+关键团战""MVP全场最佳"
  - funny → "搞笑翻车名场面""离谱送人头合集""沙雕操作大赏"
  - revenge → "绝境反杀集锦""逆风翻盘关键团战""丝血极限操作"
  - pro → "关键决策与走位""团战操作细节拆解""意识流精彩片段"
  - wholesome → "开黑默契配合""友情高光时刻""完美团队协作"

和平精英：
  - epic → "综合高光时刻""连续淘汰集锦""决赛圈吃鸡名场面"
  - funny → "搞笑翻车名场面""离谱落地成盒合集""载具整活大赏"
  - revenge → "绝境求生集锦""决赛圈丝血吃鸡""钢枪逆转淘汰"
  - pro → "战术走位分析""枪法操作细节拆解""决赛圈策略复盘"
  - wholesome → "开黑默契配合""队友救援高光""组排吃鸡名场面"

- 如果用户明确提到了具体片段，优先用用户的

### 4. 剪辑方式（editStyle）—— 根据 mood 选择风格匹配的剪辑方式
可选值及 mood 匹配（两款游戏通用）：
- epic: "带剧情（正向高燃）"、"快节奏燃向剪辑"、"电影级史诗叙事"
- funny: "带剧情（搞笑吐槽）"、"鬼畜节奏混剪"、"综艺感反差叙事"
- chill: "简洁流畅剪辑"、"轻快节奏Vlog风"、"纯净无解说慢镜头"
- revenge: "带剧情（逆风翻盘）"、"先抑后扬悬念剪辑"、"低谷到高潮递进叙事"
- nostalgic: "时间线回顾剪辑"、"图文混排怀旧风"、"慢节奏感性叙事"
- pro: "纯操作集锦"、"分段复盘解析式"、"教学向逐帧剪辑"
- wholesome: "温馨友情叙事"、"多视角开黑混剪"、"欢快派对风剪辑"
- **请从对应 mood 的选项中选择，不要总选第一个，注意多样化**

### 5. 特效（effect）—— 根据 mood 和游戏选择风格匹配的特效组合

**两款游戏通用特效**：
- epic: "AI解说（热血激昂）+ 机甲科技动效"、"AI解说（史诗语气）+ 炫彩渐变动效"、"震屏+慢动作 + 热血BGM"
- funny: "AI解说（搞笑吐槽）+ 表情包弹幕"、"AI解说（毒舌点评）+ 鬼畜音效"、"综艺字幕特效 + 搞笑音效"
- chill: "轻音乐BGM + 默认动效"、"无解说 + 清新滤镜动效"、"AI解说（轻松语气）+ 简约动效"
- revenge: "AI解说（热血语气）+ 震屏慢放"、"紧张BGM + 心跳音效动效"、"AI解说（燃向解说）+ 高光闪回"
- nostalgic: "怀旧滤镜 + 钢琴BGM"、"AI解说（温柔回忆语气）+ 胶片动效"、"老照片转场 + 感性旁白"
- pro: "AI解说（专业分析）+ 数据标注动效"、"操作回放慢镜头 + 战术标线"、"AI解说（教练语气）+ 局势图动效"
- wholesome: "AI解说（欢快语气）+ 默认动效"、"友情BGM + 弹幕互动特效"、"AI解说（温暖语气）+ 彩色粒子动效"

**和平精英额外适配**：
- 和平精英的 AI 解说风格应更偏向 FPS 战术风，如"AI解说（战术分析）""AI解说（战地记者风）"
- 和平精英可搭配的特效包括：击杀数弹窗、淘汰击杀特写慢放、瞄准镜视角切换动效
- **请从对应 mood 的选项中选择，注意搭配的创意性和多样性**

## 输出要求

你必须严格输出以下 JSON 格式，不要输出其他任何内容：

\`\`\`json
{
  "mood": "epic",
  "dimensions": {
    "game": "王者荣耀",
    "match": "和lykos的开黑对局",
    "clip": "综合高光时刻",
    "editStyle": "快节奏燃向剪辑",
    "effect": "AI解说（史诗语气）+ 炫彩渐变动效"
  },
  "sentence": "用快节奏燃向剪辑把你和lykos在王者荣耀里的高光时刻打造成一部燃爆全场的操作大片，搭配史诗AI解说和炫彩渐变动效"
}
\`\`\`

## 凝练句子（sentence）要求
- sentence 必须体现 mood 的情感基调，不同 mood 的句子风格要有明显差异
- 要读起来通顺、有感染力、像人说的话
- 不要机械拼接维度值，要用自然的语言表达
- 保持一句话，但可以略长以体现风格

### 不同 mood 的句子风格参考：
- **epic**: 高燃、激情、"燃爆""炸裂""操作秀翻全场"
- **funny**: 轻松幽默、"快乐源泉""笑到停不下来""离谱操作大赏"
- **revenge**: 热血、悬念、"绝境翻盘""心跳加速""逆天改命"
- **nostalgic**: 温情、回忆、"致我们的游戏时光""那些年的高光瞬间"
- **pro**: 冷静、专业、"教科书级别""每一帧都是学问""操作解析"
- **wholesome**: 温暖、快乐、"开黑就是快乐""最好的队友最好的时光"
- **chill**: 随性、轻松、"简简单单""记录一下""轻松日常"

## 重要规则
- **最高优先级规则：所有维度值必须与识别出的游戏匹配，绝不能出现跨游戏术语混用**
  - 王者荣耀绝不能出现：吃鸡、空投、毒圈、狙杀、淘汰、决赛圈、载具、跑毒、爆头
  - 和平精英绝不能出现：五杀、四杀、三杀、团战、偷家、偷塔、抢龙、抢主宰、抢暴君、越塔、塔下反杀
- **核心规则：根据 mood 适配所有维度，不要总是输出默认组合**
- 用户没说的维度你要根据 mood、游戏类型和语境合理推荐（而非总用默认值）
- 同一个 mood 下的多次请求，应尽量给出不同的组合（多样化）
- sentence 中的用语也必须匹配游戏类型（如和平精英说"淘汰"不说"击杀"，说"吃鸡"不说"胜利"）
- 保持维度值简洁明了，不要过长
- 只输出 JSON，不要输出解释、markdown标记或其他文字
- mood 字段必须是以下之一：epic, funny, chill, revenge, nostalgic, pro, wholesome`

// ===== 模拟用户数据上下文（实际应从用户数据服务获取） =====
const USER_CONTEXT = `用户最近的游戏数据摘要：
- 最近活跃游戏：王者荣耀
- 最近一局：今天 14:32 排位赛，使用孙尚香，KDA 8/2/6，胜利
- 常用英雄：孙尚香、李白、貂蝉
- 最近好友开黑：lykos（昨天双排）、xiaoming（今天五排）
- 最近亮点：昨天一局有四杀，今天有一次丝血反杀`

// ===== API 调用 =====

const API_BASE = import.meta.env.VITE_AI_API_BASE || 'https://open.bigmodel.cn/api/paas/v4'
const API_KEY = import.meta.env.VITE_AI_API_KEY || ''
const MODEL = import.meta.env.VITE_AI_MODEL || 'glm-4-flash'

/**
 * 调用大模型 API 进行意图凝练
 */
export async function aiRefine(userInput: string): Promise<RefineResult> {
  // 如果没有配置 API Key，使用本地 fallback
  if (!API_KEY || API_KEY === 'your-api-key-here') {
    console.warn('[AI Refine] 未配置 API Key，使用本地 fallback')
    return localFallbackRefine(userInput)
  }

  try {
    const response = await fetch(`/ai-api/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `${USER_CONTEXT}\n\n用户说：${userInput}` },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`API 请求失败: ${response.status} ${response.statusText} - ${errText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('AI 返回内容为空')
    }

    // 提取 JSON（AI 可能用 ```json ... ``` 包裹）
    let jsonStr = content.trim()
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    // 解析 JSON
    const parsed = JSON.parse(jsonStr)

    // 校验字段完整性
    if (!parsed.dimensions || !parsed.sentence) {
      throw new Error('AI 返回格式不完整')
    }

    const dims = parsed.dimensions
    if (!dims.game || !dims.match || !dims.clip || !dims.editStyle || !dims.effect) {
      throw new Error('AI 返回维度不完整')
    }

    // 提取标准 RefineResult（去掉额外的 mood 字段）
    const result: RefineResult = {
      dimensions: dims,
      sentence: parsed.sentence,
    }

    console.log('[AI Refine] 识别情感:', parsed.mood || 'unknown', '| 结果:', result)

    return result
  } catch (error) {
    console.error('[AI Refine] AI 调用失败，降级使用本地 fallback:', error)
    return localFallbackRefine(userInput)
  }
}

// ===== 情感/语气识别 =====

type Mood = 'epic' | 'funny' | 'chill' | 'revenge' | 'nostalgic' | 'pro' | 'wholesome'

function detectMood(input: string): Mood {
  // 搞笑/沙雕
  if (/搞笑|沙雕|整活|离谱|逆天|笑死|哈哈|乐|鬼畜|抽象|6|666|hhh|哈/.test(input)) return 'funny'
  // 复仇/翻盘
  if (/翻盘|逆袭|逆风|复仇|雪耻|反杀|丝血|绝境|绝地反击|背水一战/.test(input)) return 'revenge'
  // 怀旧/回忆
  if (/回忆|怀念|以前|曾经|那时|青春|纪念|记录|留念|时光/.test(input)) return 'nostalgic'
  // 专业/教学
  if (/教学|教程|分析|复盘|思路|打法|意识|操作细节|技巧|攻略/.test(input)) return 'pro'
  // 温馨/开黑/友情
  if (/开黑|兄弟|好友|一起|队友|陪伴|双排|五排|闺蜜|基友|朋友/.test(input)) return 'wholesome'
  // 佛系/轻松
  if (/随便|简单|轻松|日常|休闲|快速|短一点|简短/.test(input)) return 'chill'
  // 史诗/高燃（默认）
  return 'epic'
}

// ===== 基于情感 + 游戏类型 的多元化回答映射 =====

type GameType = 'wzry' | 'hpjy'  // 王者荣耀 | 和平精英

// ---- 片段（按游戏区分） ----
const CLIP_MAP_WZRY: Record<Mood, string[]> = {
  epic:      ['综合高光时刻', '最高连杀 + 关键团战', 'MVP全场最佳操作'],
  funny:     ['搞笑翻车名场面', '离谱送人头合集 + 队友整活', '沙雕操作大赏'],
  chill:     ['轻松击杀片段', '日常精彩瞬间', '休闲高光合辑'],
  revenge:   ['绝境反杀集锦', '逆风翻盘关键团战', '丝血极限操作'],
  nostalgic: ['经典对局回顾', '精选名场面回忆录', '高光历程记录'],
  pro:       ['关键决策与走位', '团战操作细节拆解', '意识流精彩片段'],
  wholesome: ['开黑默契配合', '友情高光时刻', '完美团队协作'],
}

const CLIP_MAP_HPJY: Record<Mood, string[]> = {
  epic:      ['综合高光时刻', '连续淘汰集锦', '决赛圈吃鸡名场面'],
  funny:     ['搞笑翻车名场面', '离谱落地成盒合集', '载具整活大赏'],
  chill:     ['轻松淘汰片段', '日常精彩瞬间', '休闲吃鸡合辑'],
  revenge:   ['绝境求生集锦', '决赛圈丝血吃鸡', '钢枪逆转淘汰'],
  nostalgic: ['经典对局回顾', '精选名场面回忆录', '吃鸡历程记录'],
  pro:       ['战术走位分析', '枪法操作细节拆解', '决赛圈策略复盘'],
  wholesome: ['开黑默契配合', '队友救援高光', '组排吃鸡名场面'],
}

// ---- 剪辑方式（两款游戏通用） ----
const EDIT_STYLE_MAP: Record<Mood, string[]> = {
  epic:      ['带剧情（正向高燃）', '快节奏燃向剪辑', '电影级史诗叙事'],
  funny:     ['带剧情（搞笑吐槽）', '鬼畜节奏混剪', '综艺感反差叙事'],
  chill:     ['简洁流畅剪辑', '轻快节奏 Vlog风', '纯净无解说慢镜头'],
  revenge:   ['带剧情（逆风翻盘）', '先抑后扬悬念剪辑', '低谷到高潮递进叙事'],
  nostalgic: ['时间线回顾剪辑', '图文混排怀旧风', '慢节奏感性叙事'],
  pro:       ['纯操作集锦', '分段复盘解析式', '教学向逐帧剪辑'],
  wholesome: ['温馨友情叙事', '多视角开黑混剪', '欢快派对风剪辑'],
}

// ---- 特效（按游戏区分） ----
const EFFECT_MAP_WZRY: Record<Mood, string[]> = {
  epic:      ['AI解说（热血激昂）+ 机甲科技动效', 'AI解说（史诗语气）+ 炫彩渐变动效', '震屏+慢动作 + 热血BGM'],
  funny:     ['AI解说（搞笑吐槽）+ 表情包弹幕', 'AI解说（毒舌点评）+ 鬼畜音效', '综艺字幕特效 + 搞笑音效'],
  chill:     ['轻音乐BGM + 默认动效', '无解说 + 清新滤镜动效', 'AI解说（轻松语气）+ 简约动效'],
  revenge:   ['AI解说（热血语气）+ 震屏慢放', '紧张BGM + 心跳音效动效', 'AI解说（燃向解说）+ 高光闪回'],
  nostalgic: ['怀旧滤镜 + 钢琴BGM', 'AI解说（温柔回忆语气）+ 胶片动效', '老照片转场 + 感性旁白'],
  pro:       ['AI解说（专业分析）+ 数据标注动效', '操作回放慢镜头 + 战术标线', 'AI解说（教练语气）+ 局势图动效'],
  wholesome: ['AI解说（欢快语气）+ 默认动效', '友情BGM + 弹幕互动特效', 'AI解说（温暖语气）+ 彩色粒子动效'],
}

const EFFECT_MAP_HPJY: Record<Mood, string[]> = {
  epic:      ['AI解说（热血激昂）+ 击杀数弹窗动效', 'AI解说（战地记者风）+ 炫彩渐变动效', '震屏+狙击慢放 + 热血BGM'],
  funny:     ['AI解说（搞笑吐槽）+ 表情包弹幕', 'AI解说（毒舌点评）+ 鬼畜音效', '综艺字幕特效 + 搞笑音效'],
  chill:     ['轻音乐BGM + 默认动效', '无解说 + 清新滤镜动效', 'AI解说（轻松语气）+ 简约动效'],
  revenge:   ['AI解说（战术分析）+ 震屏慢放', '紧张BGM + 心跳音效动效', 'AI解说（燃向解说）+ 淘汰特写闪回'],
  nostalgic: ['怀旧滤镜 + 钢琴BGM', 'AI解说（温柔回忆语气）+ 胶片动效', '老照片转场 + 感性旁白'],
  pro:       ['AI解说（战术分析）+ 弹道标注动效', '操作回放慢镜头 + 瞄准镜视角切换', 'AI解说（教练语气）+ 地图走位标注动效'],
  wholesome: ['AI解说（欢快语气）+ 默认动效', '友情BGM + 弹幕互动特效', 'AI解说（温暖语气）+ 彩色粒子动效'],
}

// 凝练句子模板（根据情感 + 游戏类型）
const SENTENCE_WZRY: Record<Mood, (g: string, m: string, c: string, e: string, ef: string) => string> = {
  epic:      (g, m, c, e, ef) => `用${e}剪一部${g}的燃向大片：从${m}中提取${c}，搭配${ef}，让你的操作燃爆全场`,
  funny:     (g, m, c, e, ef) => `把${g}${m}里的${c}剪成一期快乐源泉，${e}，配上${ef}，笑到停不下来`,
  chill:     (g, m, c, e, ef) => `轻松记录${g}${m}中的${c}，${e}，${ef}，简简单单享受游戏`,
  revenge:   (g, m, c, e, ef) => `${g}${m}绝境翻盘实录：聚焦${c}，${e}，用${ef}还原那一刻的心跳`,
  nostalgic: (g, m, c, e, ef) => `回顾${g}${m}中那些难忘的${c}，${e}，配上${ef}，致我们的游戏时光`,
  pro:       (g, m, c, e, ef) => `拆解${g}${m}中的${c}，${e}，搭配${ef}，每一帧都是教科书`,
  wholesome: (g, m, c, e, ef) => `记录和好友在${g}${m}里的${c}，${e}，加上${ef}，开黑就是快乐`,
}

const SENTENCE_HPJY: Record<Mood, (g: string, m: string, c: string, e: string, ef: string) => string> = {
  epic:      (g, m, c, e, ef) => `用${e}剪一部${g}的战场大片：从${m}中提取${c}，搭配${ef}，让你的枪法炸裂全场`,
  funny:     (g, m, c, e, ef) => `把${g}${m}里的${c}剪成一期快乐源泉，${e}，配上${ef}，笑到停不下来`,
  chill:     (g, m, c, e, ef) => `轻松记录${g}${m}中的${c}，${e}，${ef}，简简单单享受吃鸡`,
  revenge:   (g, m, c, e, ef) => `${g}${m}绝境求生实录：聚焦${c}，${e}，用${ef}还原那一刻的心跳`,
  nostalgic: (g, m, c, e, ef) => `回顾${g}${m}中那些难忘的${c}，${e}，配上${ef}，致我们的战场时光`,
  pro:       (g, m, c, e, ef) => `拆解${g}${m}中的${c}，${e}，搭配${ef}，每一枪都是教科书`,
  wholesome: (g, m, c, e, ef) => `记录和好友在${g}${m}里的${c}，${e}，加上${ef}，组排就是快乐`,
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ===== 本地 Fallback（当 AI 不可用时） =====

function detectGame(input: string): GameType {
  // 和平精英关键词（优先检测，因为王者荣耀是默认）
  if (/和平|吃鸡|绝地|空投|毒圈|落地|淘汰|决赛圈|跑毒|载具|狙|98[kK]|[mM]4|枪|刚枪|钢枪|伏地魔|舔包|跳伞|信号枪|平底锅/.test(input)) {
    return 'hpjy'
  }
  return 'wzry'
}

function localFallbackRefine(input: string): RefineResult {
  const mood = detectMood(input)
  const gameType = detectGame(input)

  // 1. 游戏名
  const game = gameType === 'hpjy' ? '和平精英' : '王者荣耀'

  // 2. 对局 —— 按游戏区分
  let match = '最近一局排位赛'
  const friendMatch = input.match(/和\s*(\S+?)\s*(开黑|一起|双排|组队|五排|三排|四排)/)

  if (gameType === 'wzry') {
    // ---- 王者荣耀对局 ----
    if (friendMatch) {
      match = `和${friendMatch[1]}的开黑对局`
    } else if (/开黑|双排|五排|三排|组队/.test(input)) {
      match = '好友开黑对局'
    } else if (/刚刚|上一局|刚打|刚才/.test(input)) {
      match = '刚刚结束的对局'
    } else if (/最近|近期|一周|这几天/.test(input)) {
      match = '最近一周的对局'
    } else if (/翻盘|逆风|逆袭/.test(input)) {
      match = '逆风翻盘的对局'
    } else if (/五杀|penta/.test(input)) {
      match = '有五杀的对局'
    } else if (/四杀/.test(input)) {
      match = '有四杀的对局'
    } else if (/MVP|mvp/.test(input)) {
      match = 'MVP对局'
    } else if (/连胜|连赢/.test(input)) {
      match = '连胜对局'
    } else if (/晋级|升星|上分/.test(input)) {
      match = '晋级赛对局'
    }
  } else {
    // ---- 和平精英对局 ----
    if (friendMatch) {
      match = `和${friendMatch[1]}的组排对局`
    } else if (/开黑|双排|四排|组队/.test(input)) {
      match = '好友组排对局'
    } else if (/刚刚|上一局|刚打|刚才/.test(input)) {
      match = '刚刚结束的对局'
    } else if (/最近|近期|一周|这几天/.test(input)) {
      match = '最近一周的对局'
    } else if (/吃鸡|第一/.test(input)) {
      match = '成功吃鸡的对局'
    } else if (/淘汰.*多|高淘汰|杀人多/.test(input)) {
      match = '高淘汰数对局'
    } else if (/决赛圈/.test(input)) {
      match = '进入决赛圈的对局'
    } else if (/连胜|连赢|连续吃鸡/.test(input)) {
      match = '连续吃鸡对局'
    } else if (/娱乐|团队竞技/.test(input)) {
      match = '娱乐模式对局'
    }
  }

  // 3. 片段 —— 严格按游戏区分，禁止跨游戏术语
  let clip: string

  if (gameType === 'wzry') {
    // ---- 王者荣耀片段 ----
    if (/五杀|penta/.test(input)) clip = '五杀高光时刻'
    else if (/四杀/.test(input)) clip = '四杀精彩集锦'
    else if (/三杀|triple/.test(input)) clip = '三杀连击片段'
    else if (/反杀|丝血/.test(input)) clip = '极限反杀瞬间'
    else if (/团战/.test(input)) clip = '关键团战决胜时刻'
    else if (/MVP|mvp/.test(input)) clip = 'MVP全场最佳操作'
    else if (/塔下|越塔/.test(input)) clip = '越塔强杀名场面'
    else if (/偷家|偷塔|偷水晶/.test(input)) clip = '极限偷家高光'
    else if (/抢龙|抢主宰|抢暴君/.test(input)) clip = '关键抢龙瞬间'
    else if (/1v[2-5]|一打[二三四五多]/.test(input)) clip = '以少胜多极限操作'
    else if (/开团|先手/.test(input)) clip = '完美开团时刻'
    else clip = pickRandom(CLIP_MAP_WZRY[mood])
  } else {
    // ---- 和平精英片段 ----
    if (/狙|98[kK]|[aA][wW][mM]|倍镜/.test(input)) clip = '精准狙杀集锦'
    else if (/爆头/.test(input)) clip = '爆头击倒集锦'
    else if (/连续淘汰|连杀|多杀/.test(input)) clip = '连续淘汰集锦'
    else if (/决赛圈|吃鸡/.test(input)) clip = '决赛圈吃鸡名场面'
    else if (/空投/.test(input)) clip = '空投争夺战'
    else if (/跑毒|毒圈/.test(input)) clip = '极限跑毒求生'
    else if (/载具|车|飞车/.test(input)) clip = '载具飞车击杀'
    else if (/丝血|绝境|求生/.test(input)) clip = '绝境求生瞬间'
    else if (/刚枪|钢枪|对枪/.test(input)) clip = '钢枪对决名场面'
    else if (/落地/.test(input)) clip = '落地刚枪名场面'
    else if (/远距离|远程/.test(input)) clip = '远距离击倒集锦'
    else if (/1v[2-5]|一打[二三四五多]/.test(input)) clip = '以少胜多极限操作'
    else clip = pickRandom(CLIP_MAP_HPJY[mood])
  }

  // 4. 剪辑方式 —— 两款游戏通用
  let editStyle: string
  if (/纯操作|秀操作|纯集锦/.test(input)) editStyle = '纯操作集锦'
  else if (/电影|大片|史诗/.test(input)) editStyle = '电影级史诗叙事'
  else if (/vlog|日记|记录/.test(input)) editStyle = '轻快节奏 Vlog风'
  else if (/鬼畜|混剪/.test(input)) editStyle = '鬼畜节奏混剪'
  else editStyle = pickRandom(EDIT_STYLE_MAP[mood])

  // 5. 特效 —— 按游戏区分
  const effectMap = gameType === 'wzry' ? EFFECT_MAP_WZRY : EFFECT_MAP_HPJY
  let effect: string
  if (/机甲|科技/.test(input)) effect = gameType === 'wzry' ? 'AI解说（热血激昂）+ 机甲科技动效' : 'AI解说（热血激昂）+ 击杀数弹窗动效'
  else if (/炫彩|渐变|彩色/.test(input)) effect = 'AI解说（热血语气）+ 炫彩渐变动效'
  else if (/复古|怀旧|胶片/.test(input)) effect = '怀旧滤镜 + 胶片动效'
  else if (/不要解说|无解说|去掉解说/.test(input)) effect = '无解说 + 默认动效'
  else if (/毒舌|吐槽/.test(input)) effect = 'AI解说（毒舌点评）+ 鬼畜音效'
  else if (/专业|分析/.test(input)) effect = gameType === 'wzry' ? 'AI解说（专业分析）+ 数据标注动效' : 'AI解说（战术分析）+ 弹道标注动效'
  else effect = pickRandom(effectMap[mood])

  const dimensions: IntentDimensions = { game, match, clip, editStyle, effect }

  // 生成自然语言句子（按游戏选模板）
  const templates = gameType === 'wzry' ? SENTENCE_WZRY : SENTENCE_HPJY
  const templateFn = templates[mood]
  const sentence = templateFn(game, match, clip, editStyle, effect)

  return { dimensions, sentence }
}
