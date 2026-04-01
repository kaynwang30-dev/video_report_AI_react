/**
 * 玩家人设数据模型 & 管理服务 v2.0
 * 
 * 基于全网数据整合，覆盖王者荣耀 & 和平精英完整事件体系：
 * 
 * 【王者荣耀 局内事件体系】
 * ├── 击杀类（击杀播报体系）
 * │   ├── 五杀 Penta Kill
 * │   ├── 四杀 Quadra Kill
 * │   ├── 三杀 Triple Kill
 * │   ├── 双杀 Double Kill
 * │   ├── 第一滴血 First Blood
 * │   ├── 大杀特杀 Killing Spree（连续击杀3人）
 * │   ├── 杀人如麻 Rampage（连续击杀4人）
 * │   ├── 势不可挡 Unstoppable（连续击杀5人）
 * │   ├── 横扫千军 Godlike（连续击杀6人）
 * │   ├── 超神 Legendary（连续击杀7人+）
 * │   ├── 团灭 Aced
 * │   └── 终结 Shutdown
 * ├── 高光类（官方高光时刻体系 + KPL经典事件）
 * │   ├── 1vN极限操作（1v2/1v3/1v4/1v5）
 * │   ├── 抢龙（抢主宰/抢暴君/抢风暴龙王）
 * │   ├── 越塔强杀 / 塔下反杀
 * │   ├── 偷家（偷水晶/主宰先锋偷家/大乔传送偷家）
 * │   ├── 完美开团（先手控制）
 * │   ├── 反杀（丝血反杀/极限反杀/绝境反杀）
 * │   ├── 瞬杀（秒杀对方）
 * │   ├── 闪现击杀 / 闪现控制
 * │   ├── 群体控制（多人控制）
 * │   ├── 关键抢夺（抢主宰/暴君）
 * │   ├── 关键输出（团战核心输出）
 * │   ├── 关键承伤（团战肉盾承伤）
 * │   ├── 多重抵抗（为队友挡技能/解除控制）
 * │   ├── 换装达人（快速换装后击杀）
 * │   ├── 无敌时刻（貂蝉等丝血闪避致命伤害）
 * │   ├── MVP / 全场最佳
 * │   ├── 金牌/银牌/铜牌（评分系统）
 * │   └── 英雄专属播报（月下无限连/暗夜收割者/等）
 * ├── 下饭类
 * │   ├── 送人头（连续被击杀）
 * │   ├── 搞笑失误（技能空放/闪现进塔/走错路）
 * │   ├── 奇葩操作（离谱走位/队友误伤/自杀式冲塔）
 * │   ├── 被反杀（优势被翻盘）
 * │   ├── 被偷家（水晶被偷）
 * │   ├── 脸探草丛（盲探草丛送人头）
 * │   ├── 泉水挂机/送/演
 * │   └── 团战蒸发（被瞬秒）
 * └── 操作类（技术维度）
 *     ├── 意识操作（预判走位/卡视野）
 *     ├── 连招操作（完美连招/无限连/闪现衔接）
 *     └── 极限操作（丝血操作/闪避/走位）
 *
 * 【和平精英 局内事件体系】
 * ├── 击杀类
 * │   ├── 吃鸡（第一名）
 * │   ├── 淘汰数（总淘汰/单局最高）
 * │   ├── 连续淘汰（连杀）
 * │   ├── 爆头击倒
 * │   ├── 远距离击杀（百米狙/最远击杀距离）
 * │   ├── 手雷击杀 / 一雷多杀
 * │   ├── 载具击杀（撞人）
 * │   ├── 拳头击杀（落地拳击）
 * │   ├── 平底锅击杀
 * │   └── 团灭敌方小队
 * ├── 高光类
 * │   ├── 精准狙杀（98K/AWM/M24 爆头）
 * │   ├── 一穿多（1v2/1v3/1v4）
 * │   ├── 决赛圈吃鸡
 * │   ├── 空投争夺（抢到空投并击杀争夺者）
 * │   ├── 钢枪对决（正面对枪获胜）
 * │   ├── 极限反杀（残血反杀）
 * │   ├── 绝地求生（毒圈边缘求生）
 * │   ├── 载具飞车操作
 * │   ├── 烟雾弹妙用（烟雾拉人/烟雾阴人）
 * │   ├── 高伤害输出（单局高伤害）
 * │   ├── 长时间生存
 * │   └── 精准压枪（远距离压枪击倒）
 * ├── 下饭类
 * │   ├── 落地成盒（开局即死）
 * │   ├── 被队友误伤/撞倒
 * │   ├── 舔包被阴（捡装备时被杀）
 * │   ├── 跑毒失败（被毒圈淘汰）
 * │   ├── 载具翻车/爆炸
 * │   ├── 手雷炸自己
 * │   ├── 伏地魔被发现
 * │   ├── 搞笑走位/操作
 * │   └── 落地找不到枪
 * └── 战术类
 *     ├── 攻楼战术（手雷开路/烟雾掩护）
 *     ├── 堵桥战术
 *     └── 转圈走位（近距离对枪走位）
 */

// ===== 常量：完整游戏数据字典 =====

/** 王者荣耀段位列表（由低到高） */
export const WZRY_RANKS = [
  '倔强青铜', '秩序白银', '荣耀黄金1', '荣耀黄金2', '荣耀黄金3', '荣耀黄金4',
  '尊贵铂金1', '尊贵铂金2', '尊贵铂金3', '尊贵铂金4',
  '永恒钻石1', '永恒钻石2', '永恒钻石3', '永恒钻石4', '永恒钻石5',
  '至尊星耀1', '至尊星耀2', '至尊星耀3', '至尊星耀4', '至尊星耀5',
  '最强王者', '非凡王者', '无双王者', '绝世王者', '至圣王者', '荣耀王者', '传奇王者',
]

/** 和平精英段位列表（由低到高） */
export const HPJY_RANKS = [
  '热血青铜V', '热血青铜IV', '热血青铜III', '热血青铜II', '热血青铜I',
  '不屈白银V', '不屈白银IV', '不屈白银III', '不屈白银II', '不屈白银I',
  '英勇黄金V', '英勇黄金IV', '英勇黄金III', '英勇黄金II', '英勇黄金I',
  '坚韧铂金V', '坚韧铂金IV', '坚韧铂金III', '坚韧铂金II', '坚韧铂金I',
  '不朽星钻V', '不朽星钻IV', '不朽星钻III', '不朽星钻II', '不朽星钻I',
  '荣耀皇冠V', '荣耀皇冠IV', '荣耀皇冠III', '荣耀皇冠II', '荣耀皇冠I',
  '超级王牌', '无敌战神',
]

/** 王者荣耀全英雄列表（按分路） */
export const WZRY_HEROES: Record<string, string[]> = {
  '坦克': ['白起', '嫦娥', '程咬金', '东皇太一', '盾山', '铠', '廉颇', '刘邦', '刘禅', '吕布', '芈月', '牛魔', '苏烈', '孙策', '太乙真人', '夏侯惇', '项羽', '亚瑟', '张飞', '钟无艳', '猪八戒', '庄周', '蒙恬', '阿古朵'],
  '战士': ['曹操', '典韦', '花木兰', '橘右京', '狂铁', '老夫子', '露娜', '马超', '梦奇', '裴擒虎', '孙悟空', '赵云', '宫本武藏', '达摩', '关羽', '刘备', '杨戬', '哪吒', '雅典娜', '云中君', '李信', '曜', '盘古', '暃', '司空震', '云樱', '夏洛特'],
  '刺客': ['阿轲', '百里玄策', '韩信', '镜', '兰陵王', '娜可露露', '上官婉儿', '元歌', '李白', '司马懿', '澜'],
  '法师': ['安琪拉', '扁鹊', '不知火舞', '妲己', '貂蝉', '干将莫邪', '高渐离', '姜子牙', '米莱狄', '墨子', '沈梦溪', '王昭君', '西施', '小乔', '杨玉环', '弈星', '张良', '甄姬', '钟馗', '周瑜', '嬴政', '女娲', '诸葛亮', '武则天', '金蝉'],
  '射手': ['百里守约', '成吉思汗', '狄仁杰', '公孙离', '后羿', '黄忠', '伽罗', '鲁班七号', '马可波罗', '孙尚香', '虞姬', '蒙犽', '艾琳', '戈娅'],
  '辅助': ['瑶', '蔡文姬', '大乔', '鬼谷子', '刘邦', '孙膑', '明世隐', '桑启'],
}

/** 和平精英武器列表（按类型） */
export const HPJY_WEAPONS: Record<string, string[]> = {
  '突击步枪': ['M416', 'AKM', 'M16A4', 'SCAR-L', 'GROZA', 'AUG', 'QBZ', 'M762', 'Mk47', 'G36C'],
  '射手步枪': ['VSS', 'SKS', 'MK14', 'Mini14', 'SLR', 'QBU', 'MK12'],
  '狙击枪': ['AWM', 'Kar98k', 'M24', 'Win94', '莫辛纳甘'],
  '冲锋枪': ['UZI', '汤姆逊', 'UMP45', 'Vector', '野牛', 'P90', 'MP5K'],
  '霰弹枪': ['S12K', 'S1897', 'S686', 'DBS'],
  '机枪': ['M249', 'DP-28', 'MG3'],
}

/** 王者荣耀对局模式 */
export const WZRY_MODES = ['排位', '匹配', '巅峰赛', '大乱斗', '克隆大作战', '五军对决', '契约之战', '火焰山', '自定义']

/** 和平精英对局模式 */
export const HPJY_MODES = ['经典-海岛', '经典-沙漠', '经典-雨林', '经典-雪地', '极速对决', '团队竞技', '娱乐模式']

/** 王者荣耀 - 击杀类事件完整列表（击杀播报体系） */
export const WZRY_KILL_EVENTS = [
  { key: 'pentaKill', label: '五杀 Penta Kill', desc: '一波连续击杀5人' },
  { key: 'quadraKill', label: '四杀 Quadra Kill', desc: '一波连续击杀4人' },
  { key: 'tripleKill', label: '三杀 Triple Kill', desc: '一波连续击杀3人' },
  { key: 'doubleKill', label: '双杀 Double Kill', desc: '短时间连续击杀2人' },
  { key: 'firstBlood', label: '第一滴血 First Blood', desc: '全场第一个击杀' },
  { key: 'killingSpree', label: '大杀特杀 Killing Spree', desc: '不死连续击杀3人' },
  { key: 'rampage', label: '杀人如麻 Rampage', desc: '不死连续击杀4人' },
  { key: 'unstoppable', label: '势不可挡 Unstoppable', desc: '不死连续击杀5人' },
  { key: 'godlike', label: '横扫千军 Godlike', desc: '不死连续击杀6人' },
  { key: 'legendary', label: '超神 Legendary', desc: '不死连续击杀7人+' },
  { key: 'aced', label: '团灭 Aced', desc: '己方团灭对面5人' },
  { key: 'shutdown', label: '终结 Shutdown', desc: '终结对方连杀' },
] as const

/** 王者荣耀 - 高光类事件完整列表 */
export const WZRY_HIGHLIGHT_EVENTS = [
  { key: 'oneVsMany', label: '1vN极限操作', desc: '以少敌多获胜(1v2/1v3/1v4/1v5)' },
  { key: 'stealBaron', label: '抢龙', desc: '抢主宰/暴君/风暴龙王' },
  { key: 'towerDive', label: '越塔强杀', desc: '越塔击杀对方英雄' },
  { key: 'towerCounterKill', label: '塔下反杀', desc: '利用防御塔反杀敌方' },
  { key: 'stealBase', label: '偷家', desc: '偷推水晶/主宰先锋偷家' },
  { key: 'counterKill', label: '极限反杀', desc: '丝血/绝境/残血反杀' },
  { key: 'perfectInitiate', label: '完美开团', desc: '先手控制/完美开团' },
  { key: 'instantKill', label: '瞬杀', desc: '技能或普攻瞬间秒杀' },
  { key: 'flashKill', label: '闪现击杀', desc: '技能衔接闪现击杀' },
  { key: 'flashControl', label: '闪现控制', desc: '闪现衔接控制创造击杀' },
  { key: 'groupControl', label: '群体控制', desc: '单技能控制3人+' },
  { key: 'keyOutput', label: '关键输出', desc: '团战核心输出者' },
  { key: 'keyTank', label: '关键承伤', desc: '团战承受大量伤害' },
  { key: 'multiResist', label: '多重抵抗', desc: '为队友挡伤/解除控制' },
  { key: 'equipSwap', label: '换装达人', desc: '快速换装后击杀' },
  { key: 'invincible', label: '无敌时刻', desc: '丝血闪避致命伤害(貂蝉等)' },
  { key: 'mvp', label: 'MVP', desc: '全场最佳表现' },
  { key: 'goldMedal', label: '金牌', desc: '获得金牌评价' },
  { key: 'heroSpecial', label: '英雄专属播报', desc: '如月下无限连/暗夜收割者等' },
] as const

/** 王者荣耀 - 下饭类事件完整列表 */
export const WZRY_FAIL_EVENTS = [
  { key: 'feedKills', label: '送人头', desc: '频繁被击杀/连续死亡' },
  { key: 'funnyFails', label: '搞笑失误', desc: '技能空放/闪现进塔/走错路' },
  { key: 'absurdPlays', label: '奇葩操作', desc: '离谱走位/自杀式冲塔' },
  { key: 'gotCounterKilled', label: '被反杀', desc: '优势局面被翻盘' },
  { key: 'baseStolen', label: '被偷家', desc: '水晶被对方偷推' },
  { key: 'bushCheck', label: '脸探草丛', desc: '盲探草丛送人头' },
  { key: 'afkOrTroll', label: '挂机/演', desc: '泉水挂机或故意送' },
  { key: 'instantDeath', label: '团战蒸发', desc: '被瞬秒/开团即死' },
] as const

/** 和平精英 - 击杀类事件完整列表 */
export const HPJY_KILL_EVENTS = [
  { key: 'chickenDinner', label: '吃鸡', desc: '第一名获胜' },
  { key: 'highElimination', label: '高淘汰', desc: '单局淘汰数≥10' },
  { key: 'killStreak', label: '连续淘汰', desc: '短时间连续淘汰多人' },
  { key: 'headshot', label: '爆头击倒', desc: '一枪爆头击倒' },
  { key: 'longRangeKill', label: '远距离击杀', desc: '百米+狙击击杀' },
  { key: 'grenadeKill', label: '手雷击杀', desc: '手雷/投掷物击杀' },
  { key: 'grenadeMultiKill', label: '一雷多杀', desc: '单颗手雷击倒多人' },
  { key: 'vehicleKill', label: '载具击杀', desc: '开车/撞人击杀' },
  { key: 'meleeKill', label: '近战击杀', desc: '拳头/平底锅击杀' },
  { key: 'squadWipe', label: '团灭敌方小队', desc: '独自或团队团灭整队' },
] as const

/** 和平精英 - 高光类事件完整列表 */
export const HPJY_HIGHLIGHT_EVENTS = [
  { key: 'sniperKill', label: '精准狙杀', desc: 'AWM/98K/M24精准击杀' },
  { key: 'oneVsSquad', label: '一穿多', desc: '以少敌多灭队(1v2/1v3/1v4)' },
  { key: 'finalCircleWin', label: '决赛圈吃鸡', desc: '决赛圈获胜' },
  { key: 'airdropFight', label: '空投争夺', desc: '抢到空投并击杀争夺者' },
  { key: 'headOnFight', label: '钢枪对决', desc: '正面硬刚获胜' },
  { key: 'clutchKill', label: '极限反杀', desc: '残血反杀对方' },
  { key: 'zoneEdgeSurvive', label: '绝地求生', desc: '毒圈边缘极限求生' },
  { key: 'vehicleStunt', label: '载具飞车', desc: '高难度载具操作' },
  { key: 'smokePlay', label: '烟雾弹妙用', desc: '烟雾掩护/烟中击杀' },
  { key: 'highDamage', label: '高伤害输出', desc: '单局伤害量极高(2000+)' },
  { key: 'longSurvival', label: '长时间生存', desc: '生存时间极长' },
  { key: 'sprayControl', label: '精准压枪', desc: '远距离压枪击倒' },
] as const

/** 和平精英 - 下饭类事件完整列表 */
export const HPJY_FAIL_EVENTS = [
  { key: 'hotDrop', label: '落地成盒', desc: '开局即被淘汰' },
  { key: 'teamKill', label: '队友误伤', desc: '被队友撞倒/炸到' },
  { key: 'lootDeath', label: '舔包被阴', desc: '捡装备时被击杀' },
  { key: 'zoneDeath', label: '跑毒失败', desc: '被毒圈淘汰' },
  { key: 'vehicleCrash', label: '载具翻车', desc: '载具翻车/爆炸自杀' },
  { key: 'selfGrenade', label: '手雷炸自己', desc: '被自己的手雷击倒' },
  { key: 'proneFound', label: '伏地魔暴露', desc: '趴地被发现并击杀' },
  { key: 'funnyMoment', label: '搞笑操作', desc: '离谱走位/搞笑时刻' },
  { key: 'noGunDeath', label: '落地找不到枪', desc: '落地无武器被淘汰' },
] as const

// ===== 类型定义 =====

/** 单场对局记录 */
export interface MatchRecord {
  id: string
  date: string              // 如 "今天14:32"
  mode: string              // 对局模式
  hero: string              // 英雄名/武器名
  kda: string               // 如 "8/2/6" 或 "击杀/淘汰"
  result: '胜' | '败'
  highlights: string[]      // 高光事件标签列表
  teammates: string[]       // 一起开黑的好友名
  situation: string         // 局势描述
  duration: number          // 对局时长(分钟)
}

/** 开黑好友 */
export interface FriendInfo {
  name: string
  lastPlayDate: string      // 最近一起玩时间
  playMode: string          // 双排/三排/四排/五排
}

/** 王者荣耀局内事件统计（完整版） */
export interface WzryInGameEvents {
  // ── 击杀类（击杀播报体系） ──
  pentaKill: number         // 五杀
  quadraKill: number        // 四杀
  tripleKill: number        // 三杀
  doubleKill: number        // 双杀
  firstBlood: number        // 第一滴血
  killingSpree: number      // 大杀特杀（不死连续击杀3人）
  rampage: number           // 杀人如麻（不死连续击杀4人）
  unstoppable: number       // 势不可挡（不死连续击杀5人）
  godlike: number           // 横扫千军（不死连续击杀6人）
  legendary: number         // 超神（不死连续击杀7人+）
  aced: number              // 团灭
  shutdown: number          // 终结
  // ── 高光类（官方高光系统 + KPL级事件） ──
  oneVsMany: number         // 1vN极限操作
  stealBaron: number        // 抢龙（主宰/暴君/风暴龙王）
  towerDive: number         // 越塔强杀
  towerCounterKill: number  // 塔下反杀
  stealBase: number         // 偷家
  counterKill: number       // 极限反杀
  perfectInitiate: number   // 完美开团
  instantKill: number       // 瞬杀
  flashKill: number         // 闪现击杀
  flashControl: number      // 闪现控制
  groupControl: number      // 群体控制
  keyOutput: number         // 关键输出
  keyTank: number           // 关键承伤
  multiResist: number       // 多重抵抗
  equipSwap: number         // 换装达人
  invincible: number        // 无敌时刻
  mvp: number               // MVP
  goldMedal: number         // 金牌
  heroSpecial: number       // 英雄专属播报
  // ── 下饭类 ──
  feedKills: number         // 送人头
  funnyFails: number        // 搞笑失误
  absurdPlays: number       // 奇葩操作
  gotCounterKilled: number  // 被反杀
  baseStolen: number        // 被偷家
  bushCheck: number         // 脸探草丛
  afkOrTroll: number        // 挂机/演
  instantDeath: number      // 团战蒸发
}

/** 和平精英局内事件统计（完整版） */
export interface HpjyInGameEvents {
  // ── 击杀类 ──
  chickenDinner: number     // 吃鸡次数
  highElimination: number   // 高淘汰（单局≥10）
  killStreak: number        // 连续淘汰
  headshot: number          // 爆头击倒
  longRangeKill: number     // 远距离击杀
  grenadeKill: number       // 手雷击杀
  grenadeMultiKill: number  // 一雷多杀
  vehicleKill: number       // 载具击杀
  meleeKill: number         // 近战击杀
  squadWipe: number         // 团灭敌方小队
  // ── 高光类 ──
  sniperKill: number        // 精准狙杀
  oneVsSquad: number        // 一穿多
  finalCircleWin: number    // 决赛圈吃鸡
  airdropFight: number      // 空投争夺
  headOnFight: number       // 钢枪对决
  clutchKill: number        // 极限反杀
  zoneEdgeSurvive: number   // 绝地求生
  vehicleStunt: number      // 载具飞车
  smokePlay: number         // 烟雾弹妙用
  highDamage: number        // 高伤害输出
  longSurvival: number      // 长时间生存
  sprayControl: number      // 精准压枪
  // ── 下饭类 ──
  hotDrop: number           // 落地成盒
  teamKill: number          // 队友误伤
  lootDeath: number         // 舔包被阴
  zoneDeath: number         // 跑毒失败
  vehicleCrash: number      // 载具翻车
  selfGrenade: number       // 手雷炸自己
  proneFound: number        // 伏地魔暴露
  funnyMoment: number       // 搞笑操作
  noGunDeath: number        // 落地找不到枪
}

/** 局外事件 */
export interface OutGameEvents {
  hasRankUp: boolean        // 近期有无晋级
  rankUpDetail: string      // 如 "钻石→星耀"
  hasWinStreak: boolean     // 近期有无连胜
  winStreakCount: number    // 最大连胜场次
  hasLoseStreak: boolean    // 近期有无连败
  loseStreakCount: number   // 最大连败场次
  seasonBest: string        // 赛季最佳段位
}

/** 局势分布 */
export interface SituationStats {
  carryCount: number        // Carry局
  comebackCount: number     // 翻盘局
  bladderCount: number      // 膀胱局 (>25分钟)
  stompCount: number        // 速推局 (<12分钟)
  tryHardCount: number      // 尽力局 (输但数据好)
  cliffhangerCount: number  // 惊险局 (比分交替/反复拉锯)
}

/** 王者荣耀游戏数据 */
export interface WzryGameData {
  authorized: boolean
  hasRecentMatches: boolean
  totalMatches: number
  recentMatches: MatchRecord[]
  heroes: string[]
  currentRank: string
  inGameEvents: WzryInGameEvents
  outGameEvents: OutGameEvents
  situationStats: SituationStats
  friends: FriendInfo[]
}

/** 和平精英游戏数据 */
export interface HpjyGameData {
  authorized: boolean
  hasRecentMatches: boolean
  totalMatches: number
  recentMatches: MatchRecord[]
  heroes: string[]            // 常用武器
  currentRank: string
  inGameEvents: HpjyInGameEvents
  outGameEvents: OutGameEvents
  situationStats: SituationStats
  friends: FriendInfo[]
}

/** 完整玩家人设 */
export interface PlayerProfile {
  id: string
  name: string
  avatar: string
  createdAt: number
  wzryData: WzryGameData
  hpjyData: HpjyGameData
}

// 兼容旧的 GameData 联合类型
export type GameData = WzryGameData | HpjyGameData

// ===== 默认值工厂 =====

export function createDefaultWzryEvents(): WzryInGameEvents {
  return {
    pentaKill: 0, quadraKill: 0, tripleKill: 0, doubleKill: 0, firstBlood: 0,
    killingSpree: 0, rampage: 0, unstoppable: 0, godlike: 0, legendary: 0,
    aced: 0, shutdown: 0,
    oneVsMany: 0, stealBaron: 0, towerDive: 0, towerCounterKill: 0, stealBase: 0,
    counterKill: 0, perfectInitiate: 0, instantKill: 0, flashKill: 0, flashControl: 0,
    groupControl: 0, keyOutput: 0, keyTank: 0, multiResist: 0, equipSwap: 0,
    invincible: 0, mvp: 0, goldMedal: 0, heroSpecial: 0,
    feedKills: 0, funnyFails: 0, absurdPlays: 0, gotCounterKilled: 0,
    baseStolen: 0, bushCheck: 0, afkOrTroll: 0, instantDeath: 0,
  }
}

export function createDefaultHpjyEvents(): HpjyInGameEvents {
  return {
    chickenDinner: 0, highElimination: 0, killStreak: 0, headshot: 0,
    longRangeKill: 0, grenadeKill: 0, grenadeMultiKill: 0, vehicleKill: 0,
    meleeKill: 0, squadWipe: 0,
    sniperKill: 0, oneVsSquad: 0, finalCircleWin: 0, airdropFight: 0,
    headOnFight: 0, clutchKill: 0, zoneEdgeSurvive: 0, vehicleStunt: 0,
    smokePlay: 0, highDamage: 0, longSurvival: 0, sprayControl: 0,
    hotDrop: 0, teamKill: 0, lootDeath: 0, zoneDeath: 0, vehicleCrash: 0,
    selfGrenade: 0, proneFound: 0, funnyMoment: 0, noGunDeath: 0,
  }
}

export function createDefaultOutGameEvents(): OutGameEvents {
  return {
    hasRankUp: false, rankUpDetail: '', hasWinStreak: false, winStreakCount: 0,
    hasLoseStreak: false, loseStreakCount: 0, seasonBest: '',
  }
}

export function createDefaultSituationStats(): SituationStats {
  return { carryCount: 0, comebackCount: 0, bladderCount: 0, stompCount: 0, tryHardCount: 0, cliffhangerCount: 0 }
}

export function createDefaultWzryData(authorized = false): WzryGameData {
  return {
    authorized,
    hasRecentMatches: false,
    totalMatches: 0,
    recentMatches: [],
    heroes: [],
    currentRank: '',
    inGameEvents: createDefaultWzryEvents(),
    outGameEvents: createDefaultOutGameEvents(),
    situationStats: createDefaultSituationStats(),
    friends: [],
  }
}

export function createDefaultHpjyData(authorized = false): HpjyGameData {
  return {
    authorized,
    hasRecentMatches: false,
    totalMatches: 0,
    recentMatches: [],
    heroes: [],
    currentRank: '',
    inGameEvents: createDefaultHpjyEvents(),
    outGameEvents: createDefaultOutGameEvents(),
    situationStats: createDefaultSituationStats(),
    friends: [],
  }
}

export function createDefaultProfile(name = '新玩家'): PlayerProfile {
  return {
    id: `player_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    avatar: pickRandomAvatar(),
    createdAt: Date.now(),
    wzryData: createDefaultWzryData(true),
    hpjyData: createDefaultHpjyData(false),
  }
}

const AVATARS = ['🎮', '🕹️', '👾', '🤖', '🦸', '🧙', '🥷', '👨‍🚀', '🐉', '🦊', '🐺', '🦁', '🦅', '⚡', '🔥', '💎']

function pickRandomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)]
}

// ===== 对局编辑器使用的高光事件选项（完整版） =====

/** 王者荣耀对局可选高光标签 */
export const WZRY_MATCH_HIGHLIGHT_OPTIONS = [
  // 击杀类
  '五杀', '四杀', '三杀', '双杀', '第一滴血',
  '大杀特杀', '杀人如麻', '势不可挡', '横扫千军', '超神',
  '团灭', '终结',
  // 高光类
  '1vN', '抢龙', '越塔强杀', '塔下反杀', '偷家',
  '极限反杀', '完美开团', '瞬杀', '闪现击杀', '闪现控制',
  '群体控制', '关键输出', '关键承伤', '多重抵抗', '换装达人', '无敌时刻',
  'MVP', '金牌', '英雄专属播报',
  // 下饭类
  '送人头', '搞笑失误', '奇葩操作', '被反杀', '被偷家', '脸探草丛', '团战蒸发',
]

/** 和平精英对局可选高光标签 */
export const HPJY_MATCH_HIGHLIGHT_OPTIONS = [
  // 击杀类
  '吃鸡', '高淘汰', '连续淘汰', '爆头击倒', '远距离击杀',
  '手雷击杀', '一雷多杀', '载具击杀', '近战击杀', '团灭敌方小队',
  // 高光类
  '精准狙杀', '一穿多', '决赛圈吃鸡', '空投争夺', '钢枪对决',
  '极限反杀', '绝地求生', '载具飞车', '烟雾弹妙用', '高伤害输出', '精准压枪',
  // 下饭类
  '落地成盒', '舔包被阴', '跑毒失败', '载具翻车', '手雷炸自己', '伏地魔暴露', '搞笑操作',
]

/** 局势选项 */
export const SITUATION_OPTIONS = ['普通', 'Carry局', '翻盘局', '膀胱局', '速推局', '尽力局', '惊险局']

// ===== 预设人设模板 =====

export const PRESET_PROFILES: Record<string, () => PlayerProfile> = {
  '王者大佬': () => {
    const p = createDefaultProfile('王者大佬')
    p.avatar = '👑'
    p.wzryData = {
      authorized: true,
      hasRecentMatches: true,
      totalMatches: 203,
      heroes: ['李白', '韩信', '露娜', '花木兰', '公孙离'],
      currentRank: '荣耀王者',
      inGameEvents: {
        pentaKill: 3, quadraKill: 8, tripleKill: 25, doubleKill: 60, firstBlood: 30,
        killingSpree: 20, rampage: 10, unstoppable: 5, godlike: 3, legendary: 2,
        aced: 5, shutdown: 8,
        oneVsMany: 6, stealBaron: 4, towerDive: 12, towerCounterKill: 5, stealBase: 2,
        counterKill: 15, perfectInitiate: 8, instantKill: 10, flashKill: 6, flashControl: 4,
        groupControl: 3, keyOutput: 20, keyTank: 0, multiResist: 0, equipSwap: 1,
        invincible: 2, mvp: 45, goldMedal: 60, heroSpecial: 8,
        feedKills: 2, funnyFails: 1, absurdPlays: 1, gotCounterKilled: 3,
        baseStolen: 1, bushCheck: 0, afkOrTroll: 0, instantDeath: 2,
      },
      outGameEvents: { hasRankUp: true, rankUpDetail: '至尊星耀→荣耀王者', hasWinStreak: true, winStreakCount: 8, hasLoseStreak: false, loseStreakCount: 0, seasonBest: '荣耀王者' },
      situationStats: { carryCount: 35, comebackCount: 12, bladderCount: 5, stompCount: 18, tryHardCount: 8, cliffhangerCount: 6 },
      friends: [
        { name: 'lykos', lastPlayDate: '昨天', playMode: '双排' },
        { name: 'xiaoming', lastPlayDate: '前天', playMode: '五排' },
        { name: 'Aimee', lastPlayDate: '3天前', playMode: '三排' },
      ],
      recentMatches: [
        { id: 'm1', date: '今天14:32', mode: '排位', hero: '李白', kda: '12/3/5', result: '胜', highlights: ['四杀', 'MVP', '超神'], teammates: [], situation: 'Carry局', duration: 18 },
        { id: 'm2', date: '今天13:00', mode: '排位', hero: '孙尚香', kda: '8/2/6', result: '胜', highlights: ['三杀', '极限反杀'], teammates: [], situation: '普通', duration: 15 },
        { id: 'm3', date: '昨天22:15', mode: '排位', hero: '貂蝉', kda: '6/4/8', result: '败', highlights: ['无敌时刻', '被偷家'], teammates: [], situation: '尽力局', duration: 22 },
        { id: 'm4', date: '昨天20:30', mode: '排位', hero: '孙尚香', kda: '10/1/7', result: '胜', highlights: ['五杀', 'MVP', '团灭'], teammates: ['lykos'], situation: 'Carry局', duration: 16 },
        { id: 'm5', date: '前天18:00', mode: '排位', hero: '李白', kda: '5/5/10', result: '胜', highlights: ['抢龙', '完美开团'], teammates: ['xiaoming', '队友A', '队友B', '队友C'], situation: '翻盘局', duration: 28 },
      ],
    }
    p.hpjyData = createDefaultHpjyData(false)
    return p
  },

  '双游戏玩家': () => {
    const p = createDefaultProfile('双游戏玩家')
    p.avatar = '🎮'
    p.wzryData = {
      authorized: true,
      hasRecentMatches: true,
      totalMatches: 85,
      heroes: ['孙尚香', '鲁班七号', '后羿'],
      currentRank: '至尊星耀3',
      inGameEvents: {
        ...createDefaultWzryEvents(),
        quadraKill: 2, tripleKill: 8, doubleKill: 20, firstBlood: 10,
        killingSpree: 5, rampage: 2,
        oneVsMany: 2, stealBaron: 1, towerDive: 3, counterKill: 5,
        perfectInitiate: 2, mvp: 12, goldMedal: 20,
        funnyFails: 5, feedKills: 8, absurdPlays: 3,
      },
      outGameEvents: { hasRankUp: false, rankUpDetail: '', hasWinStreak: true, winStreakCount: 4, hasLoseStreak: false, loseStreakCount: 0, seasonBest: '至尊星耀3' },
      situationStats: { carryCount: 8, comebackCount: 5, bladderCount: 3, stompCount: 6, tryHardCount: 10, cliffhangerCount: 4 },
      friends: [{ name: 'Tom', lastPlayDate: '昨天', playMode: '双排' }],
      recentMatches: [
        { id: 'm1', date: '今天', mode: '排位', hero: '孙尚香', kda: '6/3/8', result: '胜', highlights: ['三杀', '金牌'], teammates: ['Tom'], situation: '普通', duration: 17 },
        { id: 'm2', date: '昨天', mode: '排位', hero: '鲁班七号', kda: '2/7/3', result: '败', highlights: ['送人头', '团战蒸发'], teammates: [], situation: '尽力局', duration: 14 },
      ],
    }
    p.hpjyData = {
      authorized: true,
      hasRecentMatches: true,
      totalMatches: 60,
      heroes: ['M416', 'AWM', 'Kar98k'],
      currentRank: '不朽星钻II',
      inGameEvents: {
        ...createDefaultHpjyEvents(),
        chickenDinner: 8, highElimination: 3, killStreak: 5, headshot: 15,
        longRangeKill: 6, grenadeKill: 4, vehicleKill: 2,
        sniperKill: 10, oneVsSquad: 2, finalCircleWin: 5, headOnFight: 8,
        clutchKill: 3, sprayControl: 6,
        hotDrop: 5, lootDeath: 3, funnyMoment: 2,
      },
      outGameEvents: { hasRankUp: true, rankUpDetail: '坚韧铂金I→不朽星钻II', hasWinStreak: false, winStreakCount: 0, hasLoseStreak: false, loseStreakCount: 0, seasonBest: '不朽星钻II' },
      situationStats: { carryCount: 5, comebackCount: 3, bladderCount: 2, stompCount: 4, tryHardCount: 6, cliffhangerCount: 3 },
      friends: [{ name: 'Jerry', lastPlayDate: '3天前', playMode: '四排' }],
      recentMatches: [
        { id: 'h1', date: '今天', mode: '经典-海岛', hero: 'M416', kda: '8/0', result: '胜', highlights: ['吃鸡', '高淘汰', '钢枪对决'], teammates: ['Jerry'], situation: 'Carry局', duration: 25 },
      ],
    }
    return p
  },

  '休闲新手': () => {
    const p = createDefaultProfile('休闲新手')
    p.avatar = '🌱'
    p.wzryData = {
      authorized: true,
      hasRecentMatches: true,
      totalMatches: 15,
      heroes: ['亚瑟', '妲己'],
      currentRank: '荣耀黄金2',
      inGameEvents: {
        ...createDefaultWzryEvents(),
        tripleKill: 1, doubleKill: 3, firstBlood: 2,
        counterKill: 1,
        funnyFails: 8, feedKills: 12, absurdPlays: 5,
        bushCheck: 4, instantDeath: 6,
      },
      outGameEvents: { hasRankUp: false, rankUpDetail: '', hasWinStreak: false, winStreakCount: 0, hasLoseStreak: true, loseStreakCount: 5, seasonBest: '荣耀黄金2' },
      situationStats: { carryCount: 1, comebackCount: 1, bladderCount: 0, stompCount: 2, tryHardCount: 6, cliffhangerCount: 1 },
      friends: [],
      recentMatches: [
        { id: 'm1', date: '今天', mode: '匹配', hero: '亚瑟', kda: '3/5/4', result: '败', highlights: ['搞笑失误', '脸探草丛'], teammates: [], situation: '普通', duration: 16 },
      ],
    }
    p.hpjyData = createDefaultHpjyData(false)
    return p
  },

  '数据空白': () => {
    const p = createDefaultProfile('数据空白')
    p.avatar = '❓'
    p.wzryData = createDefaultWzryData(true)
    p.wzryData.hasRecentMatches = false
    p.hpjyData = createDefaultHpjyData(true)
    p.hpjyData.hasRecentMatches = false
    return p
  },

  '下饭玩家': () => {
    const p = createDefaultProfile('下饭玩家')
    p.avatar = '🍚'
    p.wzryData = {
      authorized: true,
      hasRecentMatches: true,
      totalMatches: 120,
      heroes: ['鲁班七号', '后羿', '蔡文姬'],
      currentRank: '尊贵铂金1',
      inGameEvents: {
        ...createDefaultWzryEvents(),
        tripleKill: 2, doubleKill: 8,
        oneVsMany: 1, towerDive: 1, counterKill: 3,
        feedKills: 40, funnyFails: 25, absurdPlays: 15,
        gotCounterKilled: 10, baseStolen: 5, bushCheck: 8,
        instantDeath: 20,
      },
      outGameEvents: { hasRankUp: false, rankUpDetail: '', hasWinStreak: false, winStreakCount: 0, hasLoseStreak: true, loseStreakCount: 7, seasonBest: '尊贵铂金1' },
      situationStats: { carryCount: 3, comebackCount: 2, bladderCount: 8, stompCount: 4, tryHardCount: 20, cliffhangerCount: 5 },
      friends: [{ name: '难兄难弟', lastPlayDate: '今天', playMode: '双排' }],
      recentMatches: [
        { id: 'm1', date: '今天', mode: '排位', hero: '鲁班七号', kda: '1/8/3', result: '败', highlights: ['送人头', '搞笑失误', '团战蒸发'], teammates: ['难兄难弟'], situation: '尽力局', duration: 22 },
        { id: 'm2', date: '昨天', mode: '排位', hero: '后羿', kda: '0/9/2', result: '败', highlights: ['奇葩操作', '送人头', '被偷家'], teammates: [], situation: '尽力局', duration: 18 },
        { id: 'm3', date: '昨天', mode: '匹配', hero: '蔡文姬', kda: '2/3/15', result: '胜', highlights: ['三杀', '关键承伤'], teammates: ['难兄难弟'], situation: '膀胱局', duration: 28 },
      ],
    }
    p.hpjyData = createDefaultHpjyData(false)
    return p
  },

  '和平精英大神': () => {
    const p = createDefaultProfile('和平精英大神')
    p.avatar = '🔫'
    p.wzryData = createDefaultWzryData(false)
    p.hpjyData = {
      authorized: true,
      hasRecentMatches: true,
      totalMatches: 180,
      heroes: ['AWM', 'M416', 'Kar98k', 'SKS'],
      currentRank: '无敌战神',
      inGameEvents: {
        chickenDinner: 35, highElimination: 20, killStreak: 15, headshot: 60,
        longRangeKill: 25, grenadeKill: 12, grenadeMultiKill: 4, vehicleKill: 6,
        meleeKill: 3, squadWipe: 10,
        sniperKill: 40, oneVsSquad: 8, finalCircleWin: 20, airdropFight: 10,
        headOnFight: 30, clutchKill: 12, zoneEdgeSurvive: 5, vehicleStunt: 3,
        smokePlay: 8, highDamage: 15, longSurvival: 10, sprayControl: 20,
        hotDrop: 8, teamKill: 1, lootDeath: 3, zoneDeath: 2, vehicleCrash: 4,
        selfGrenade: 1, proneFound: 2, funnyMoment: 5, noGunDeath: 3,
      },
      outGameEvents: { hasRankUp: true, rankUpDetail: '超级王牌→无敌战神', hasWinStreak: true, winStreakCount: 6, hasLoseStreak: false, loseStreakCount: 0, seasonBest: '无敌战神' },
      situationStats: { carryCount: 25, comebackCount: 10, bladderCount: 8, stompCount: 15, tryHardCount: 5, cliffhangerCount: 12 },
      friends: [
        { name: '狙神小A', lastPlayDate: '今天', playMode: '四排' },
        { name: '突击手B', lastPlayDate: '昨天', playMode: '双排' },
      ],
      recentMatches: [
        { id: 'h1', date: '今天15:00', mode: '经典-海岛', hero: 'AWM', kda: '12/0', result: '胜', highlights: ['吃鸡', '高淘汰', '精准狙杀', '一穿多'], teammates: ['狙神小A'], situation: 'Carry局', duration: 28 },
        { id: 'h2', date: '今天12:30', mode: '经典-沙漠', hero: 'M416', kda: '8/0', result: '胜', highlights: ['吃鸡', '钢枪对决', '决赛圈吃鸡'], teammates: ['狙神小A', '突击手B'], situation: '惊险局', duration: 25 },
        { id: 'h3', date: '昨天21:00', mode: '经典-雨林', hero: 'Kar98k', kda: '5/1', result: '败', highlights: ['远距离击杀', '极限反杀', '跑毒失败'], teammates: [], situation: '尽力局', duration: 20 },
      ],
    }
    return p
  },
}

// ===== 将 PlayerProfile 转化为 aiRefine 的 USER_CONTEXT 字符串 =====

export function profileToUserContext(profile: PlayerProfile): string {
  const lines: string[] = [`用户数据（玩家：${profile.name}）：`]

  // 授权状态
  lines.push(`- 已授权：王者荣耀${profile.wzryData.authorized ? '✅' : '❌'} | 和平精英${profile.hpjyData.authorized ? '✅' : '❌'}`)

  // 最近活跃
  const wzActive = profile.wzryData.hasRecentMatches
  const hpActive = profile.hpjyData.hasRecentMatches
  if (wzActive && hpActive) lines.push('- 最近活跃：王者荣耀、和平精英')
  else if (wzActive) lines.push('- 最近活跃：王者荣耀')
  else if (hpActive) lines.push('- 最近活跃：和平精英')
  else lines.push('- 最近活跃：无（90天内无对局）')

  // 王者荣耀详情
  renderWzryData(profile.wzryData, lines)
  // 和平精英详情
  renderHpjyData(profile.hpjyData, lines)

  return lines.join('\n')
}

function renderWzryData(data: WzryGameData, lines: string[]) {
  if (!data.authorized) {
    lines.push('- 王者荣耀：未授权')
    return
  }
  if (!data.hasRecentMatches) {
    lines.push('- 王者荣耀：已授权但90天内无对局数据')
    return
  }

  lines.push(`- 王者荣耀（${data.totalMatches}局/90天）：`)
  if (data.currentRank) lines.push(`  · 当前段位：${data.currentRank}`)
  if (data.heroes.length > 0) lines.push(`  · 常用英雄：${data.heroes.join('、')}`)

  // 对局记录
  if (data.recentMatches.length > 0) {
    lines.push('  · 近期对局：')
    data.recentMatches.forEach(m => {
      const tmStr = m.teammates.length > 0 ? `(${m.teammates.join(',')})` : ''
      const hlStr = m.highlights.length > 0 ? ` ${m.highlights.join(' ')}` : ''
      const sitStr = m.situation !== '普通' ? ` [${m.situation}]` : ''
      lines.push(`    - ${m.date} ${m.mode}${tmStr}·${m.hero} KDA ${m.kda} ${m.result}${hlStr}${sitStr} ${m.duration}min`)
    })
  }

  // 开黑好友
  if (data.friends.length > 0) {
    lines.push(`  · 开黑好友：${data.friends.map(f => `${f.name}(${f.lastPlayDate}${f.playMode})`).join('、')}`)
  }

  // 局内事件 - 击杀类
  const ev = data.inGameEvents
  const killParts: string[] = []
  if (ev.pentaKill > 0) killParts.push(`五杀×${ev.pentaKill}`)
  if (ev.quadraKill > 0) killParts.push(`四杀×${ev.quadraKill}`)
  if (ev.tripleKill > 0) killParts.push(`三杀×${ev.tripleKill}`)
  if (ev.doubleKill > 0) killParts.push(`双杀×${ev.doubleKill}`)
  if (ev.legendary > 0) killParts.push(`超神×${ev.legendary}`)
  if (ev.godlike > 0) killParts.push(`横扫千军×${ev.godlike}`)
  if (ev.unstoppable > 0) killParts.push(`势不可挡×${ev.unstoppable}`)
  if (ev.rampage > 0) killParts.push(`杀人如麻×${ev.rampage}`)
  if (ev.killingSpree > 0) killParts.push(`大杀特杀×${ev.killingSpree}`)
  if (ev.aced > 0) killParts.push(`团灭×${ev.aced}`)
  if (ev.shutdown > 0) killParts.push(`终结×${ev.shutdown}`)
  if (ev.firstBlood > 0) killParts.push(`第一滴血×${ev.firstBlood}`)
  if (killParts.length > 0) lines.push(`  · 击杀事件：${killParts.join('、')}`)

  // 局内事件 - 高光类
  const hlParts: string[] = []
  if (ev.oneVsMany > 0) hlParts.push(`1vN×${ev.oneVsMany}`)
  if (ev.stealBaron > 0) hlParts.push(`抢龙×${ev.stealBaron}`)
  if (ev.towerDive > 0) hlParts.push(`越塔强杀×${ev.towerDive}`)
  if (ev.towerCounterKill > 0) hlParts.push(`塔下反杀×${ev.towerCounterKill}`)
  if (ev.stealBase > 0) hlParts.push(`偷家×${ev.stealBase}`)
  if (ev.counterKill > 0) hlParts.push(`极限反杀×${ev.counterKill}`)
  if (ev.perfectInitiate > 0) hlParts.push(`完美开团×${ev.perfectInitiate}`)
  if (ev.instantKill > 0) hlParts.push(`瞬杀×${ev.instantKill}`)
  if (ev.flashKill > 0) hlParts.push(`闪现击杀×${ev.flashKill}`)
  if (ev.flashControl > 0) hlParts.push(`闪现控制×${ev.flashControl}`)
  if (ev.groupControl > 0) hlParts.push(`群体控制×${ev.groupControl}`)
  if (ev.keyOutput > 0) hlParts.push(`关键输出×${ev.keyOutput}`)
  if (ev.keyTank > 0) hlParts.push(`关键承伤×${ev.keyTank}`)
  if (ev.multiResist > 0) hlParts.push(`多重抵抗×${ev.multiResist}`)
  if (ev.equipSwap > 0) hlParts.push(`换装达人×${ev.equipSwap}`)
  if (ev.invincible > 0) hlParts.push(`无敌时刻×${ev.invincible}`)
  if (ev.mvp > 0) hlParts.push(`MVP×${ev.mvp}`)
  if (ev.goldMedal > 0) hlParts.push(`金牌×${ev.goldMedal}`)
  if (ev.heroSpecial > 0) hlParts.push(`英雄专属播报×${ev.heroSpecial}`)
  if (hlParts.length > 0) lines.push(`  · 高光事件：${hlParts.join('、')}`)

  // 局内事件 - 下饭类
  const failParts: string[] = []
  if (ev.feedKills > 0) failParts.push(`送人头×${ev.feedKills}`)
  if (ev.funnyFails > 0) failParts.push(`搞笑失误×${ev.funnyFails}`)
  if (ev.absurdPlays > 0) failParts.push(`奇葩操作×${ev.absurdPlays}`)
  if (ev.gotCounterKilled > 0) failParts.push(`被反杀×${ev.gotCounterKilled}`)
  if (ev.baseStolen > 0) failParts.push(`被偷家×${ev.baseStolen}`)
  if (ev.bushCheck > 0) failParts.push(`脸探草丛×${ev.bushCheck}`)
  if (ev.afkOrTroll > 0) failParts.push(`挂机/演×${ev.afkOrTroll}`)
  if (ev.instantDeath > 0) failParts.push(`团战蒸发×${ev.instantDeath}`)
  if (failParts.length > 0) lines.push(`  · 下饭事件：${failParts.join('、')}`)

  // 局外事件
  const oe = data.outGameEvents
  const oeParts: string[] = []
  if (oe.hasRankUp) oeParts.push(`晋级(${oe.rankUpDetail})`)
  if (oe.hasWinStreak) oeParts.push(`${oe.winStreakCount}连胜`)
  if (oe.hasLoseStreak) oeParts.push(`${oe.loseStreakCount}连败`)
  if (oe.seasonBest) oeParts.push(`赛季最佳:${oe.seasonBest}`)
  if (oeParts.length > 0) lines.push(`  · 局外事件：${oeParts.join('、')}`)

  // 局势分布
  const ss = data.situationStats
  const ssParts: string[] = []
  if (ss.carryCount > 0) ssParts.push(`Carry局×${ss.carryCount}`)
  if (ss.comebackCount > 0) ssParts.push(`翻盘局×${ss.comebackCount}`)
  if (ss.bladderCount > 0) ssParts.push(`膀胱局×${ss.bladderCount}`)
  if (ss.stompCount > 0) ssParts.push(`速推局×${ss.stompCount}`)
  if (ss.tryHardCount > 0) ssParts.push(`尽力局×${ss.tryHardCount}`)
  if (ss.cliffhangerCount > 0) ssParts.push(`惊险局×${ss.cliffhangerCount}`)
  if (ssParts.length > 0) lines.push(`  · 局势分布：${ssParts.join('、')}`)
}

function renderHpjyData(data: HpjyGameData, lines: string[]) {
  if (!data.authorized) {
    lines.push('- 和平精英：未授权')
    return
  }
  if (!data.hasRecentMatches) {
    lines.push('- 和平精英：已授权但90天内无对局数据')
    return
  }

  lines.push(`- 和平精英（${data.totalMatches}局/90天）：`)
  if (data.currentRank) lines.push(`  · 当前段位：${data.currentRank}`)
  if (data.heroes.length > 0) lines.push(`  · 常用武器：${data.heroes.join('、')}`)

  // 对局记录
  if (data.recentMatches.length > 0) {
    lines.push('  · 近期对局：')
    data.recentMatches.forEach(m => {
      const tmStr = m.teammates.length > 0 ? `(${m.teammates.join(',')})` : ''
      const hlStr = m.highlights.length > 0 ? ` ${m.highlights.join(' ')}` : ''
      const sitStr = m.situation !== '普通' ? ` [${m.situation}]` : ''
      lines.push(`    - ${m.date} ${m.mode}${tmStr}·${m.hero} 淘汰${m.kda} ${m.result}${hlStr}${sitStr} ${m.duration}min`)
    })
  }

  // 开黑好友
  if (data.friends.length > 0) {
    lines.push(`  · 开黑好友：${data.friends.map(f => `${f.name}(${f.lastPlayDate}${f.playMode})`).join('、')}`)
  }

  // 局内事件 - 击杀类
  const ev = data.inGameEvents
  const killParts: string[] = []
  if (ev.chickenDinner > 0) killParts.push(`吃鸡×${ev.chickenDinner}`)
  if (ev.highElimination > 0) killParts.push(`高淘汰×${ev.highElimination}`)
  if (ev.killStreak > 0) killParts.push(`连续淘汰×${ev.killStreak}`)
  if (ev.headshot > 0) killParts.push(`爆头击倒×${ev.headshot}`)
  if (ev.longRangeKill > 0) killParts.push(`远距离击杀×${ev.longRangeKill}`)
  if (ev.grenadeKill > 0) killParts.push(`手雷击杀×${ev.grenadeKill}`)
  if (ev.grenadeMultiKill > 0) killParts.push(`一雷多杀×${ev.grenadeMultiKill}`)
  if (ev.vehicleKill > 0) killParts.push(`载具击杀×${ev.vehicleKill}`)
  if (ev.meleeKill > 0) killParts.push(`近战击杀×${ev.meleeKill}`)
  if (ev.squadWipe > 0) killParts.push(`团灭敌方小队×${ev.squadWipe}`)
  if (killParts.length > 0) lines.push(`  · 击杀事件：${killParts.join('、')}`)

  // 局内事件 - 高光类
  const hlParts: string[] = []
  if (ev.sniperKill > 0) hlParts.push(`精准狙杀×${ev.sniperKill}`)
  if (ev.oneVsSquad > 0) hlParts.push(`一穿多×${ev.oneVsSquad}`)
  if (ev.finalCircleWin > 0) hlParts.push(`决赛圈吃鸡×${ev.finalCircleWin}`)
  if (ev.airdropFight > 0) hlParts.push(`空投争夺×${ev.airdropFight}`)
  if (ev.headOnFight > 0) hlParts.push(`钢枪对决×${ev.headOnFight}`)
  if (ev.clutchKill > 0) hlParts.push(`极限反杀×${ev.clutchKill}`)
  if (ev.zoneEdgeSurvive > 0) hlParts.push(`绝地求生×${ev.zoneEdgeSurvive}`)
  if (ev.vehicleStunt > 0) hlParts.push(`载具飞车×${ev.vehicleStunt}`)
  if (ev.smokePlay > 0) hlParts.push(`烟雾弹妙用×${ev.smokePlay}`)
  if (ev.highDamage > 0) hlParts.push(`高伤害输出×${ev.highDamage}`)
  if (ev.longSurvival > 0) hlParts.push(`长时间生存×${ev.longSurvival}`)
  if (ev.sprayControl > 0) hlParts.push(`精准压枪×${ev.sprayControl}`)
  if (hlParts.length > 0) lines.push(`  · 高光事件：${hlParts.join('、')}`)

  // 局内事件 - 下饭类
  const failParts: string[] = []
  if (ev.hotDrop > 0) failParts.push(`落地成盒×${ev.hotDrop}`)
  if (ev.teamKill > 0) failParts.push(`队友误伤×${ev.teamKill}`)
  if (ev.lootDeath > 0) failParts.push(`舔包被阴×${ev.lootDeath}`)
  if (ev.zoneDeath > 0) failParts.push(`跑毒失败×${ev.zoneDeath}`)
  if (ev.vehicleCrash > 0) failParts.push(`载具翻车×${ev.vehicleCrash}`)
  if (ev.selfGrenade > 0) failParts.push(`手雷炸自己×${ev.selfGrenade}`)
  if (ev.proneFound > 0) failParts.push(`伏地魔暴露×${ev.proneFound}`)
  if (ev.funnyMoment > 0) failParts.push(`搞笑操作×${ev.funnyMoment}`)
  if (ev.noGunDeath > 0) failParts.push(`落地找不到枪×${ev.noGunDeath}`)
  if (failParts.length > 0) lines.push(`  · 下饭事件：${failParts.join('、')}`)

  // 局外事件
  const oe = data.outGameEvents
  const oeParts: string[] = []
  if (oe.hasRankUp) oeParts.push(`晋级(${oe.rankUpDetail})`)
  if (oe.hasWinStreak) oeParts.push(`${oe.winStreakCount}连胜`)
  if (oe.hasLoseStreak) oeParts.push(`${oe.loseStreakCount}连败`)
  if (oe.seasonBest) oeParts.push(`赛季最佳:${oe.seasonBest}`)
  if (oeParts.length > 0) lines.push(`  · 局外事件：${oeParts.join('、')}`)

  // 局势分布
  const ss = data.situationStats
  const ssParts: string[] = []
  if (ss.carryCount > 0) ssParts.push(`Carry局×${ss.carryCount}`)
  if (ss.comebackCount > 0) ssParts.push(`翻盘局×${ss.comebackCount}`)
  if (ss.bladderCount > 0) ssParts.push(`膀胱局×${ss.bladderCount}`)
  if (ss.stompCount > 0) ssParts.push(`速推局×${ss.stompCount}`)
  if (ss.tryHardCount > 0) ssParts.push(`尽力局×${ss.tryHardCount}`)
  if (ss.cliffhangerCount > 0) ssParts.push(`惊险局×${ss.cliffhangerCount}`)
  if (ssParts.length > 0) lines.push(`  · 局势分布：${ssParts.join('、')}`)
}
