import React, { useState, useRef, useEffect, useCallback } from 'react'
import './HighlightVodPage.css'
import { aiRefine, setActiveUserContext, setActivePlayerProfile, updateAuthState, type IntentDimensions } from '../services/aiRefine'
import type { AIVideoItem } from '../App'
import PlayerProfilePanel from '../components/PlayerProfilePanel'
import type { PlayerProfile, MatchRecord } from '../services/playerProfile'
import { profileToUserContext, PRESET_PROFILES } from '../services/playerProfile'

// ===== 类型定义 =====

// 思维链路节点
interface ThinkingNode {
  id: string
  label: string
  detail: string
  status: 'pending' | 'running' | 'done'
}

// 视频任务
interface VideoTask {
  id: string
  prompt: string
  status: 'thinking' | 'generating' | 'done'
  thinkingNodes: ThinkingNode[]
  createdAt: number
}

interface HighlightVodPageProps {
  onBack: () => void
  initPrompt?: string
  onVideoGenerated?: (video: AIVideoItem) => void
}

// ===== 快捷标签 =====
const quickPrompts = [
  { id: 'recent-highlight', label: '剪个王者周报视频', icon: '🔥' },
  { id: 'friend-lykos', label: '剪个和lykos开黑的视频', icon: '👥' },
  { id: 'last-match', label: '最近一场对局的高光时刻', icon: '🎯' },
  { id: 'penta', label: '五杀集锦', icon: '🏆' },
  { id: 'mvp', label: '最近三天MVP时刻合集', icon: '⭐' },
  { id: 'clutch', label: '极限操作1v3反杀集锦', icon: '💥' },
  { id: 'rank-up', label: '刚晋级王者，剪个晋级之路', icon: '👑' },
  { id: 'teamfight', label: '近期最精彩的团战瞬间', icon: '⚔️' },
]

// ===== 生成思维链路节点 =====
const generateThinkingNodes = (input: string): ThinkingNode[] => {
  const isHeping = input.includes('和平') || input.includes('吃鸡')
  const gameName = isHeping ? '和平精英' : '王者荣耀'

  return [
    { id: 'intent', label: '意图解析', detail: '正在理解你的创作需求，识别关键意图...', status: 'pending' },
    { id: 'match', label: '对局匹配', detail: `正在检索你的${gameName}对局记录...`, status: 'pending' },
    { id: 'data', label: '盘面数据提取', detail: '正在提取对局盘面数据文件，解析每秒事件（击杀、技能释放、走位等）...', status: 'pending' },
    { id: 'highlight', label: '高光事件筛选', detail: '正在基于盘面数据筛选高光事件（多杀、丝血操作、关键团战等）...', status: 'pending' },
    { id: 'script', label: '剪辑脚本生成', detail: '正在根据叙事风格生成剪辑脚本，规划镜头切换和节奏...', status: 'pending' },
    { id: 'render', label: '视频渲染', detail: '正在合成视频、添加特效和字幕...', status: 'pending' },
  ]
}

// ===== 主组件 =====
const HighlightVodPage: React.FC<HighlightVodPageProps> = ({ onBack, initPrompt }) => {
  // 输入状态
  const [inputValue, setInputValue] = useState(initPrompt || '')
  const [remainCount, setRemainCount] = useState(1)
  const [showCountDetail, setShowCountDetail] = useState(false)
  const [showSharePanel, setShowSharePanel] = useState(false)

  // Toast 提示
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 模拟控制台折叠
  const [consoleCollapsed, setConsoleCollapsed] = useState(true)

  // 模拟加次数
  const [addCountInput, setAddCountInput] = useState('1')

  // 游戏授权状态（模拟）
  const [authWangzhe, setAuthWangzhe] = useState(true)
  const [authHeping, setAuthHeping] = useState(false)

  // 玩家人设管理
  const [playerProfiles, setPlayerProfiles] = useState<PlayerProfile[]>(() => {
    const factory = PRESET_PROFILES['王者大佬']
    if (factory) {
      const p = factory()
      // 将 id 固定以便 activeProfileId 对齐
      p.id = 'default_preset'
      return [p]
    }
    return []
  })
  const [activeProfileId, setActiveProfileId] = useState<string | null>('default_preset')

  // 授权提醒
  const [authAlertGame, setAuthAlertGame] = useState<string | null>(null)

  // 空数据提醒（已授权但近7天无可生成对局）
  const [emptyDataAlert, setEmptyDataAlert] = useState<{ game: string; gameName: string } | null>(null)

  // 其他游戏意图提醒（暂仅支持王者荣耀）
  const [otherGameAlert, setOtherGameAlert] = useState<string | null>(null)

  // 凝练状态（独立于视频任务）
  const [refinePhase, setRefinePhase] = useState<'idle' | 'refining' | 'refined'>('idle')
  const [refinedDimensions, setRefinedDimensions] = useState<IntentDimensions | null>(null)
  const [dataWarning, setDataWarning] = useState<string | null>(null)
  const [matchedRecords, setMatchedRecords] = useState<MatchRecord[]>([])
  const [noMatchInfo, setNoMatchInfo] = useState<{ noMatch: boolean; recommended: MatchRecord | null }>({ noMatch: false, recommended: null })

  /** 根据凝练结果从当前人设中匹配对局记录 — v4.0 基于5维度综合匹配引擎 */
  const getMatchedRecords = (dims: IntentDimensions, currentInput?: string): { records: MatchRecord[]; noMatch: boolean; recommended: MatchRecord | null } => {
    const profile = playerProfiles.find(p => p.id === activeProfileId)
    console.log('[getMatchedRecords v4] profile:', profile?.name, 'activeProfileId:', activeProfileId)
    if (!profile) return { records: [], noMatch: false, recommended: null }

    // 当前仅支持王者荣耀
    const gameData = profile.wzryData
    console.log('[getMatchedRecords v4] recentMatches count:', gameData.recentMatches?.length)
    if (!gameData.recentMatches || gameData.recentMatches.length === 0) return { records: [], noMatch: false, recommended: null }

    const textToCheck = currentInput || inputValue
    const md = dims.matchDims

    // 判断是否为单场意图
    const isSingleMatch = dims.videoType?.includes('单场') ||
      /刚刚|上一局|刚打|刚才|最近一局|最后一局/.test(textToCheck)

    // 检查是否有任何维度有意图
    const hasAnyIntent = md.teamplay.hasIntent || md.hero.hasIntent || md.time.hasIntent || md.outEvent.hasIntent || md.situation.hasIntent
    console.log('[getMatchedRecords v4] hasAnyIntent:', hasAnyIntent, 'isSingleMatch:', isSingleMatch)

    // ★ 五维度综合过滤函数
    const matchFilter = (m: MatchRecord): boolean => {
      // 维度1: 开黑过滤
      if (md.teamplay.hasIntent) {
        if (md.teamplay.friendName) {
          // 指定好友
          const friendName = md.teamplay.friendName
          if (!m.teammates.some(t =>
            t === friendName || t.toLowerCase() === friendName.toLowerCase() ||
            t.includes(friendName) || friendName.includes(t)
          )) return false
        } else {
          // 任意开黑
          if (m.teammates.length === 0) return false
        }
      }

      // 维度2: 英雄过滤
      if (md.hero.hasIntent) {
        if (md.hero.heroNames.length > 0) {
          if (!md.hero.heroNames.some(h => m.hero.includes(h) || h.includes(m.hero))) return false
        }
        // 分路过滤暂不做（需要英雄→分路映射表，当前对局数据中没有分路字段）
      }

      // 维度3: 时间过滤 — 简化实现
      if (md.time.hasIntent) {
        const desc = md.time.description
        if (desc === '今天' && !m.date.includes('今天') && !m.date.includes('今日')) return false
        if (desc === '昨天' && !m.date.includes('昨天') && !m.date.includes('昨日')) return false
        if (desc === '前天' && !m.date.includes('前天')) return false
        if (desc === '最近一局') return true // 最近一局直接取第一条
      }

      // 维度4: 局外事件过滤
      if (md.outEvent.hasIntent) {
        if (md.outEvent.type === 'winStreak' && m.result !== '胜') return false
        // 连败情况下，只筛败局
        if (md.outEvent.type === 'loseStreak' && m.result !== '败') return false
        // 晋级：暂无直接字段，跳过
      }

      // 维度5: 局势过滤
      if (md.situation.hasIntent && md.situation.types.length > 0) {
        if (!md.situation.types.some(t => m.situation.includes(t) || t.includes(m.situation))) return false
      }

      return true
    }

    // 如果没有任何维度有意图，返回最近的对局
    if (!hasAnyIntent) {
      if (isSingleMatch) {
        return { records: [gameData.recentMatches[0]], noMatch: false, recommended: null }
      }
      return { records: gameData.recentMatches.slice(0, 5), noMatch: false, recommended: null }
    }

    // 有明确意图 → 5维过滤
    const filtered = gameData.recentMatches.filter(matchFilter)
    console.log('[getMatchedRecords v4] filtered count:', filtered.length)

    if (filtered.length > 0) {
      if (isSingleMatch || md.time.description === '最近一局') {
        return { records: [filtered[0]], noMatch: false, recommended: null }
      }
      return { records: filtered.slice(0, 5), noMatch: false, recommended: null }
    }

    // ★ 没有匹配的对局 → 推荐一场最佳对局
    const recommended = findBestRecommendedMatch(gameData.recentMatches)
    return { records: [], noMatch: true, recommended }
  }

  /** 从对局列表中挑选一场最佳推荐对局（胜利 > 高KDA > 多高光标签） */
  const findBestRecommendedMatch = (matches: MatchRecord[]): MatchRecord | null => {
    if (matches.length === 0) return null
    // 简单评分：胜利+3，每个高光+1，KDA比越高越好
    let best = matches[0]
    let bestScore = -1
    for (const m of matches) {
      let score = 0
      if (m.result === '胜') score += 3
      score += m.highlights.length
      const parts = m.kda.split('/')
      const kills = parseInt(parts[0]) || 0
      const deaths = parseInt(parts[1]) || 1
      score += kills / deaths
      if (score > bestScore) { bestScore = score; best = m }
    }
    return best
  }

  /** 获取对局的评级标签 */
  const getMatchBadge = (record: MatchRecord): { label: string; type: 'gold' | 'silver' | 'mvp' | 'top' | 'normal' } => {
    if (record.highlights.includes('MVP')) return { label: 'MVP', type: 'mvp' }
    if (record.highlights.includes('五杀') || record.highlights.includes('超神')) return { label: '顶级', type: 'top' }
    if (record.highlights.includes('金牌') || record.highlights.includes('四杀') || record.situation === 'Carry局') return { label: '金牌', type: 'gold' }
    if (record.highlights.includes('三杀') || record.highlights.includes('极限反杀') || record.highlights.includes('吃鸡')) return { label: '银牌', type: 'silver' }
    return { label: '', type: 'normal' }
  }

  /** 获取高光片段描述 — v4.0 直接读取 highlight 维度 */
  const getHighlightDesc = (dims: IntentDimensions): { hasIntent: boolean; intents: string[] } => {
    const hl = dims.highlight
    
    // 优先使用新版 highlight 维度
    if (hl && hl.hasExplicitIntent && hl.events.length > 0) {
      return { hasIntent: true, intents: hl.events }
    }

    // fallback: 从 clipDetail 兼容字段中提取
    const clipDetail = dims.content?.clipDetail || dims.clip || ''
    if (clipDetail && clipDetail !== '高光时刻' && clipDetail !== '高光操作' && clipDetail !== '精彩操作' && clipDetail !== 'AI精选高光片段') {
      const parts = clipDetail.split(/[+&、，,]/).map(s => s.trim()).filter(Boolean)
      if (parts.length > 0) {
        return { hasIntent: true, intents: parts }
      }
    }

    // 无明确意图
    return { hasIntent: false, intents: [] }
  }

  // 当前正在展示思维链路的任务ID（null表示没有正在进行的链路展示）
  const [activeThinkingTaskId, setActiveThinkingTaskId] = useState<string | null>(null)

  // 视频任务列表（底部列表）
  const [videoTasks, setVideoTasks] = useState<VideoTask[]>([])

  const contentRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      contentRef.current?.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }, 100)
  }, [])

  // Toast 提示
  const showToast = useCallback((msg: string, duration = 2500) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastMsg(msg)
    setToastVisible(true)
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false)
    }, duration)
  }, [])

  // textarea 自动高度
  const autoResizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  useEffect(() => {
    if (textareaRef.current && inputValue) {
      autoResizeTextarea(textareaRef.current)
    }
  }, [inputValue])

  // 同步玩家人设 → aiRefine 的 USER_CONTEXT + 授权开关
  useEffect(() => {
    const activeProfile = playerProfiles.find(p => p.id === activeProfileId)
    if (activeProfile) {
      const ctx = profileToUserContext(activeProfile)
      setActiveUserContext(ctx)
      setActivePlayerProfile(activeProfile)
      // 同步授权开关状态
      setAuthWangzhe(activeProfile.wzryData.authorized)
      setAuthHeping(activeProfile.hpjyData.authorized)
      // 同步到 aiRefine 本地 fallback
      updateAuthState(activeProfile.wzryData.authorized, activeProfile.hpjyData.authorized)
    } else {
      setActiveUserContext(null)
      setActivePlayerProfile(null)
      updateAuthState(authWangzhe, authHeping)
    }
  }, [activeProfileId, playerProfiles])

  // 快捷标签点击 → 填入对话框（已有内容则逗号追加）
  const handleQuickPrompt = (text: string) => {
    setInputValue((prev) => {
      const trimmed = prev.trim()
      if (!trimmed) return text
      return trimmed + '，' + text
    })
    // 聚焦输入框
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        autoResizeTextarea(textareaRef.current)
      }
    }, 50)
  }

  // ===== 前置检查：其他游戏 → 王者授权 → 王者对局数据 =====
  const preflightCheck = (prompt: string): { pass: boolean } => {
    // ★ 规则一：其他游戏意图检测（前置，不走LLM）
    const otherGamePatterns: [RegExp, string][] = [
      [/和平精英|吃鸡|绝地求生|空投|毒圈|跑毒|AWM|98[kK]|M416|AKM|淘汰/, '和平精英'],
      [/英雄联盟|LOL|lol|召唤师峡谷|ADC/, '英雄联盟'],
      [/原神|提瓦特|树脂|深渊/, '原神'],
      [/CSGO|CS2|csgo|cs2|反恐精英/, 'CS2'],
    ]
    const mentionsWzry = /王者|荣耀|峡谷|五杀|四杀|三杀|双杀|超神|暴走|团灭|李白|貂蝉|孙尚香|韩信|露娜|排位|巅峰赛/.test(prompt)
    
    for (const [pattern, gameName] of otherGamePatterns) {
      if (pattern.test(prompt) && !mentionsWzry) {
        setOtherGameAlert(gameName)
        scrollToBottom()
        return { pass: false }
      }
    }

    const profile = playerProfiles.find(p => p.id === activeProfileId)
    if (!profile) return { pass: true } // 无人设则跳过前置检查

    // ★ 规则二：王者荣耀授权检查
    if (!profile.wzryData.authorized) {
      setAuthAlertGame('王者荣耀')
      scrollToBottom()
      return { pass: false }
    }

    // ★ 规则三：已授权但近7天无可生成对局
    if (!profile.wzryData.hasRecentMatches || profile.wzryData.recentMatches.length === 0) {
      setEmptyDataAlert({ game: 'wzry', gameName: '王者荣耀' })
      scrollToBottom()
      return { pass: false }
    }

    return { pass: true }
  }

  // ===== AI凝练 =====
  const handleRefine = async () => {
    const prompt = inputValue.trim()
    if (!prompt) return

    // 清除之前的提醒状态
    setAuthAlertGame(null)
    setEmptyDataAlert(null)
    setOtherGameAlert(null)

    // ★ 前置检查：其他游戏 → 授权 → 对局数据
    const { pass } = preflightCheck(prompt)
    if (!pass) return

    setRefinePhase('refining')
    scrollToBottom()

    try {
      const result = await aiRefine(prompt)

      // ★ 如果凝练结果识别到其他游戏意图
      if (result.otherGameIntent) {
        setOtherGameAlert(result.otherGameIntent)
        setRefinePhase('idle')
        scrollToBottom()
        return
      }

      // ★ 如果凝练结果要求授权，先展示授权提醒
      if (result.gameAuthRequired) {
        setAuthAlertGame(result.gameAuthRequired)
        setRefinePhase('idle')
        scrollToBottom()
        return
      }

      // ★ 如果近7天无可生成对局
      if (result.noMatchData) {
        setEmptyDataAlert({ game: 'wzry', gameName: '王者荣耀' })
        setRefinePhase('idle')
        scrollToBottom()
        return
      }

      setRefinedDimensions(result.dimensions)
      setDataWarning(result.dataWarning || null)
      const matchResult = getMatchedRecords(result.dimensions, inputValue)
      setMatchedRecords(matchResult.records)
      setNoMatchInfo({ noMatch: matchResult.noMatch, recommended: matchResult.recommended })
      setRefinePhase('refined')
      scrollToBottom()
    } catch (error) {
      console.error('[AI Refine] 凝练失败:', error)
      setRefinePhase('idle')
    }
  }

  // ===== 检查王者荣耀授权 =====
  const checkGameAuth = (_prompt: string): boolean => {
    if (!authWangzhe) {
      setAuthAlertGame('王者荣耀')
      scrollToBottom()
      return false
    }
    return true
  }

  // ===== AI点播：创建视频任务 =====
  const handleGenerate = () => {
    const prompt = inputValue.trim()
    if (!prompt) return

    // 检查点播次数
    if (remainCount <= 0) {
      showToast('点播次数不足，分享给好友可获取更多次数')
      setShowSharePanel(true)
      return
    }

    // 检查授权
    if (!checkGameAuth(prompt)) return

    // 扣减次数
    setRemainCount((prev) => prev - 1)

    // 创建新任务
    const taskId = `task_${Date.now()}`
    const nodes = generateThinkingNodes(prompt)
    const newTask: VideoTask = {
      id: taskId,
      prompt,
      status: 'thinking',
      thinkingNodes: nodes,
      createdAt: Date.now(),
    }

    setVideoTasks((prev) => [...prev, newTask])
    setActiveThinkingTaskId(taskId)

    // 重置凝练状态，但保留原始输入文案以便用户微调后再次使用
    setRefinePhase('idle')
    setRefinedDimensions(null)
    setDataWarning(null)
    setMatchedRecords([])
    setNoMatchInfo({ noMatch: false, recommended: null })
    scrollToBottom()

    // 逐步推进思维链路
    let nodeIdx = 0
    const advanceNode = () => {
      if (nodeIdx < nodes.length) {
        setVideoTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  thinkingNodes: t.thinkingNodes.map((n, i) => ({
                    ...n,
                    status: i < nodeIdx ? 'done' as const : i === nodeIdx ? 'running' as const : 'pending' as const,
                  })),
                }
              : t
          )
        )
        scrollToBottom()
        nodeIdx++

        const delay = nodeIdx === nodes.length ? 2500 : 1000 + Math.random() * 600
        setTimeout(() => {
          // 标记当前节点完成
          setVideoTasks((prev) =>
            prev.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    thinkingNodes: t.thinkingNodes.map((n, i) => ({
                      ...n,
                      status: i <= nodeIdx - 1 ? 'done' as const : n.status,
                    })),
                  }
                : t
            )
          )

          if (nodeIdx === nodes.length) {
            // 思维链路全部完成 → 隐藏链路，进入视频生成
            setActiveThinkingTaskId(null)
            setVideoTasks((prev) =>
              prev.map((t) => (t.id === taskId ? { ...t, status: 'generating' as const } : t))
            )
            scrollToBottom()

            // 模拟生成完毕
            setTimeout(() => {
              setVideoTasks((prev) =>
                prev.map((t) => (t.id === taskId ? { ...t, status: 'done' as const } : t))
              )
              scrollToBottom()
            }, 5000)
          } else {
            advanceNode()
          }
        }, delay)
      }
    }

    setTimeout(() => advanceNode(), 800)
  }

  // 确认凝练结果并开始生成
  const handleConfirmRefined = () => {
    handleGenerate()
  }

  // 重置凝练
  const handleResetRefine = () => {
    setRefinePhase('idle')
    setRefinedDimensions(null)
    setDataWarning(null)
    setMatchedRecords([])
    setNoMatchInfo({ noMatch: false, recommended: null })
    setInputValue('')
    setAuthAlertGame(null)
    setEmptyDataAlert(null)
    setOtherGameAlert(null)
  }



  // ★ 输入区禁用：点击AI点播(refining) / 出现需求核对信息(refined) / 正在生成视频时 禁用
  const inputDisabled = refinePhase === 'refining' || refinePhase === 'refined' || activeThinkingTaskId !== null || videoTasks.some(t => t.status === 'generating')

  // 当前正在展示思维链路的任务
  const activeThinkingTask = activeThinkingTaskId
    ? videoTasks.find((t) => t.id === activeThinkingTaskId)
    : null

  // 底部任务列表（生成中 + 已完成的任务）
  const bottomTasks = videoTasks.filter((t) => t.status === 'generating' || t.status === 'done')

  return (
    <div className="highlight-vod-page">
      {/* 导航栏 */}
      <div className="vod-nav-bar">
        <div className="vod-nav-back" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="vod-nav-title">高光点播</span>
        <div className="vod-nav-info">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9.5" stroke="#1A1A1A" strokeWidth="1.5" />
            <path d="M11 10V15" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="11" cy="7.5" r="0.75" fill="#1A1A1A" />
          </svg>
        </div>
      </div>

      {/* 剩余点播次数 */}
      <div className="vod-quota-section">
        <div className="vod-quota-row">
          <div className="vod-quota-left" onClick={() => setShowCountDetail(!showCountDetail)}>
            <span className="vod-quota-label">剩余点播次数：</span>
            <span className="vod-quota-count">{remainCount}次</span>
            <svg
              className={`vod-quota-arrow ${showCountDetail ? 'expanded' : ''}`}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path d="M4 6L8 10L12 6" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="vod-quota-get" onClick={() => setShowSharePanel(true)}>获得次数</span>
        </div>
        <div className="vod-quota-hint">每次点播耗时约15分钟，不消耗流量</div>

        {/* 明细面板 */}
        <div className={`vod-quota-detail ${showCountDetail ? 'show' : ''}`}>
          <div className="vod-quota-detail-inner">
            <div className="vod-detail-title">明细</div>
            <div className="vod-detail-row">
              <span className="vod-detail-row-label">今日获得：0/3 次</span>
              <span className="vod-detail-row-tag">今日有效</span>
            </div>
            <div className="vod-detail-row">
              <span className="vod-detail-row-label">平台发放：1次</span>
              <span className="vod-detail-row-tag">今日有效</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 主内容区 ===== */}
      <div className="vod-main-content" ref={contentRef}>

        {/* 1. 功能说明区 */}
        <div className="vod-intro-section">
          <div className="vod-intro-icon-row">
            <div className="vod-intro-ai-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#intro-grad)" />
                <path d="M19 2L19.8 4.2L22 5L19.8 5.8L19 8L18.2 5.8L16 5L18.2 4.2L19 2Z" fill="url(#intro-grad2)" opacity="0.6" />
                <defs>
                  <linearGradient id="intro-grad" x1="2" y1="2" x2="22" y2="22">
                    <stop stopColor="#7C5CFC" />
                    <stop offset="1" stopColor="#4D9EFF" />
                  </linearGradient>
                  <linearGradient id="intro-grad2" x1="16" y1="2" x2="22" y2="8">
                    <stop stopColor="#7C5CFC" />
                    <stop offset="1" stopColor="#4D9EFF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <h2 className="vod-intro-title">AI高光剪辑师</h2>
          <p className="vod-intro-desc">
            告诉我你想要什么样的游戏高光视频，我会智能理解你的需求，从你的对局数据中筛选精彩瞬间，自动剪辑生成专属高光视频。
          </p>
          <div className="vod-intro-support">
            <span className="vod-intro-support-label">当前支持：</span>
            <span className="vod-intro-support-game"><img className="vod-game-icon" src={`${import.meta.env.BASE_URL}icon/wzry.png`} alt="王者荣耀" /> 王者荣耀</span>
            <span className="vod-intro-support-game coming-soon"><img className="vod-game-icon" src={`${import.meta.env.BASE_URL}icon/hpjy.png`} alt="和平精英" /> 和平精英 <span className="coming-soon-tag">即将支持</span></span>
          </div>
        </div>

        {/* 2. 大输入框区域 */}
        <div className="vod-input-section">
          <div className={`vod-textarea-wrap ${inputDisabled ? 'disabled' : ''}`}>
            <textarea
              ref={textareaRef}
              className="vod-textarea"
              placeholder="描述你想要的高光视频，例如：帮我剪一个最近一局的五杀集锦，要炫酷一点的风格..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                autoResizeTextarea(e.target)
              }}
              disabled={inputDisabled}
              rows={3}
            />
            {inputValue && !inputDisabled && (
              <div className="vod-textarea-clear" onClick={() => setInputValue('')}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="#C0C0C4" />
                  <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}

          </div>

          {/* 3. 快捷标签区域 — 点击直接填入输入框 */}
          {refinePhase === 'idle' && (
            <div className="vod-tags-section">
              <div className="vod-tags-list">
                {quickPrompts.map((item) => (
                  <div
                    key={item.id}
                    className="vod-quick-tag"
                    onClick={() => handleQuickPrompt(item.label)}
                  >
                    <span className="vod-quick-tag-icon">{item.icon}</span>
                    <span className="vod-quick-tag-text">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. AI点播按钮 - 点击后先触发AI凝练意图理解 */}
          {refinePhase === 'idle' && (
            <div className="vod-action-btns">
              <div
                className={`vod-action-btn generate ${inputValue.trim() ? '' : 'disabled'}`}
                onClick={handleRefine}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
                </svg>
                <span>AI 点播</span>
              </div>
            </div>
          )}
        </div>

        {/* ===== 流程展示区域 ===== */}

        {/* AI凝练中 - 点播流程第一步：理解用户意图 */}
        {refinePhase === 'refining' && (
          <div className="vod-process-section">
            <div className="vod-process-card">
              <div className="vod-process-header">
                <div className="vod-process-icon spinning">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#refine-grad)" />
                    <defs>
                      <linearGradient id="refine-grad" x1="2" y1="2" x2="22" y2="22">
                        <stop stopColor="#7C5CFC" />
                        <stop offset="1" stopColor="#4D9EFF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="vod-process-title">正在理解你的需求...</span>
              </div>
              <p className="vod-refining-hint">AI正在凝练你的意图，确认要挑选哪款游戏、哪场对局来生成视频</p>
              <div className="vod-refining-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}

        {/* AI凝练完成 - 展示意图理解结果，用户确认后再生成 */}
        {refinePhase === 'refined' && refinedDimensions && (
          <div className="vod-process-section">
            <div className="vod-process-card refined">
              <div className="vod-process-header">
                <div className="vod-process-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="vod-process-title">已理解你的需求，请确认以下信息</span>
              </div>

              {/* 数据校验警告 - 置顶显示 */}
              {dataWarning && (
                <div className="vod-data-warning">
                  <div className="vod-data-warning-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#FF9500" strokeWidth="2" />
                      <path d="M12 8V13" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="12" cy="16.5" r="1" fill="#FF9500" />
                    </svg>
                  </div>
                  <span className="vod-data-warning-text">{dataWarning}</span>
                </div>
              )}

              {/* (1) 游戏 */}
              <div className="vod-confirm-section-label">
                <span className="vod-confirm-section-num">1</span>
                <span>游戏</span>
              </div>
              <div className="vod-confirm-game-tag">
                <img
                  className="vod-game-icon"
                  src={`${import.meta.env.BASE_URL}icon/wzry.png`}
                  alt={refinedDimensions.game}
                />
                <span>{refinedDimensions.game}</span>
              </div>

              {/* (2) 识别到的对局 */}
              <div className="vod-confirm-section-label">
                <span className="vod-confirm-section-num">2</span>
                <span>
                  {noMatchInfo.noMatch
                    ? '暂未找到符合条件的对局'
                    : matchedRecords.length === 0
                    ? '对局匹配'
                    : matchedRecords.length === 1
                    ? '识别到 1 场符合条件的对局'
                    : `识别到 ${matchedRecords.length} 场符合条件的对局`
                  }
                </span>
              </div>

              {/* 维度标签（展示有意图的维度） */}
              {refinedDimensions.matchDims && (() => {
                const md = refinedDimensions.matchDims
                const tags: { label: string; value: string }[] = []
                if (md.teamplay.hasIntent) tags.push({ label: '开黑', value: md.teamplay.friendName ? `和${md.teamplay.friendName}` : '好友开黑' })
                if (md.hero.hasIntent) tags.push({ label: '英雄', value: md.hero.heroNames.length > 0 ? md.hero.heroNames.join('&') : md.hero.lanes.join('&') })
                if (md.time.hasIntent) tags.push({ label: '时间', value: md.time.description })
                if (md.outEvent.hasIntent) tags.push({ label: '局外事件', value: md.outEvent.description })
                if (md.situation.hasIntent) tags.push({ label: '局势', value: md.situation.types.join('&') })
                return tags.length > 0 ? (
                  <div className="vod-match-dim-tags">
                    {tags.map((tag, idx) => (
                      <span key={idx} className="vod-match-dim-tag">
                        <span className="vod-match-dim-tag-label">{tag.label}</span>
                        <span className="vod-match-dim-tag-value">{tag.value}</span>
                      </span>
                    ))}
                  </div>
                ) : null
              })()}

              {/* 未匹配到对局时的提示 */}
              {noMatchInfo.noMatch && (
                <div className="vod-no-match-hint">
                  <div className="vod-no-match-hint-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#FF9500" strokeWidth="2" />
                      <path d="M12 8V13" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="12" cy="16.5" r="1" fill="#FF9500" />
                    </svg>
                  </div>
                  <span className="vod-no-match-hint-text">未找到符合条件的开黑对局，为你推荐以下对局：</span>
                </div>
              )}

              <div className="vod-match-cards">
                {/* 正常匹配到的对局 */}
                {matchedRecords.map((record) => {
                  const badge = getMatchBadge(record)
                  const [kills, deaths, assists] = record.kda.split('/')
                  return (
                    <div key={record.id} className="vod-match-card">
                      <div className="vod-match-card-left">
                        <div className="vod-match-hero-avatar">
                          <span className="vod-match-hero-emoji">⚔️</span>
                        </div>
                        {badge.label && (
                          <span className={`vod-match-badge ${badge.type}`}>{badge.label}</span>
                        )}
                      </div>
                      <div className="vod-match-card-body">
                        <div className="vod-match-card-row1">
                          <span className="vod-match-hero-name">{record.hero}</span>
                          <span className={`vod-match-result ${record.result === '胜' ? 'win' : 'lose'}`}>
                            {record.result}
                          </span>
                        </div>
                        <div className="vod-match-card-row2">
                          <span className="vod-match-kda">
                            <span className="vod-kda-kill">{kills}</span>
                            <span className="vod-kda-sep">/</span>
                            <span className="vod-kda-death">{deaths}</span>
                            {assists && (
                              <>
                                <span className="vod-kda-sep">/</span>
                                <span className="vod-kda-assist">{assists}</span>
                              </>
                            )}
                          </span>
                          <span className="vod-match-mode">{record.mode}</span>
                          <span className="vod-match-date">{record.date}</span>
                        </div>
                        {record.teammates.length > 0 && (
                          <div className="vod-match-card-teammates">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M16 21V19C16 16.79 14.21 15 12 15H5C2.79 15 1 16.79 1 19V21" stroke="#ACACAC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx="8.5" cy="7" r="4" stroke="#ACACAC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M20 8V14M23 11H17" stroke="#ACACAC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="vod-match-teammates-label">开黑：</span>
                            {record.teammates.map((name, idx) => (
                              <span key={idx} className="vod-match-teammate-name">{name}</span>
                            ))}
                          </div>
                        )}
                        {record.highlights.length > 0 && (
                          <div className="vod-match-card-row3">
                            {record.highlights.slice(0, 4).map((hl, idx) => (
                              <span key={idx} className="vod-match-hl-tag">{hl}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* ★ 未匹配到好友对局时，推荐一场对局 */}
                {noMatchInfo.noMatch && noMatchInfo.recommended && (() => {
                  const record = noMatchInfo.recommended
                  const badge = getMatchBadge(record)
                  const [kills, deaths, assists] = record.kda.split('/')
                  return (
                    <div className="vod-match-card recommended">
                      <div className="vod-match-card-recommend-tag">推荐</div>
                      <div className="vod-match-card-left">
                        <div className="vod-match-hero-avatar">
                          <span className="vod-match-hero-emoji">⚔️</span>
                        </div>
                        {badge.label && (
                          <span className={`vod-match-badge ${badge.type}`}>{badge.label}</span>
                        )}
                      </div>
                      <div className="vod-match-card-body">
                        <div className="vod-match-card-row1">
                          <span className="vod-match-hero-name">{record.hero}</span>
                          <span className={`vod-match-result ${record.result === '胜' ? 'win' : 'lose'}`}>
                            {record.result}
                          </span>
                        </div>
                        <div className="vod-match-card-row2">
                          <span className="vod-match-kda">
                            <span className="vod-kda-kill">{kills}</span>
                            <span className="vod-kda-sep">/</span>
                            <span className="vod-kda-death">{deaths}</span>
                            {assists && (
                              <>
                                <span className="vod-kda-sep">/</span>
                                <span className="vod-kda-assist">{assists}</span>
                              </>
                            )}
                          </span>
                          <span className="vod-match-mode">{record.mode}</span>
                          <span className="vod-match-date">{record.date}</span>
                        </div>
                        {record.teammates.length > 0 && (
                          <div className="vod-match-card-teammates">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M16 21V19C16 16.79 14.21 15 12 15H5C2.79 15 1 16.79 1 19V21" stroke="#ACACAC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx="8.5" cy="7" r="4" stroke="#ACACAC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M20 8V14M23 11H17" stroke="#ACACAC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="vod-match-teammates-label">开黑：</span>
                            {record.teammates.map((name, idx) => (
                              <span key={idx} className="vod-match-teammate-name">{name}</span>
                            ))}
                          </div>
                        )}
                        {record.highlights.length > 0 && (
                          <div className="vod-match-card-row3">
                            {record.highlights.slice(0, 4).map((hl, idx) => (
                              <span key={idx} className="vod-match-hl-tag">{hl}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {matchedRecords.length === 0 && !noMatchInfo.noMatch && (
                  <div className="vod-match-empty">暂无匹配的对局记录</div>
                )}
              </div>

              {/* (3) 高光片段 */}
              <div className="vod-confirm-section-label">
                <span className="vod-confirm-section-num">3</span>
                <span>高光片段</span>
              </div>
              <div className="vod-confirm-highlight-desc">
                {(() => {
                  const { hasIntent, intents } = getHighlightDesc(refinedDimensions)
                  if (!hasIntent) {
                    return (
                      <p className="vod-highlight-auto">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#7C5CFC" />
                        </svg>
                        <span>将为你从当前选中对局挑选精彩高光片段</span>
                      </p>
                    )
                  }
                  return (
                    <p className="vod-highlight-intent">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#7C5CFC" />
                      </svg>
                      <span>
                        将为你从当前选中对局挑选
                        {intents.map((intent, idx) => (
                          <span key={idx} className="vod-highlight-intent-tag">
                            {intent}
                            {idx < intents.length - 1 && '、'}
                          </span>
                        ))}
                        等精彩高光片段
                      </span>
                    </p>
                  )
                })()}
              </div>

              {/* 确认/重新描述 操作区 */}
              <div className="vod-refined-actions">
                <div className="vod-refined-btn secondary" onClick={handleResetRefine}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>重新描述</span>
                </div>
                <div className="vod-refined-btn primary" onClick={handleConfirmRefined}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 3L19 12L5 21V3Z" fill="currentColor" />
                  </svg>
                  <span>确认生成</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 授权提醒卡片 */}
        {authAlertGame && (
          <div className="vod-process-section">
            <div className="vod-auth-alert-card">
              <div className="vod-auth-alert-icon">
                <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" fill="#FFF3E0" stroke="#FFB74D" strokeWidth="1.5" />
                  <path d="M24 14V27" stroke="#FF9800" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="24" cy="33" r="2" fill="#FF9800" />
                </svg>
              </div>
              <div className="vod-auth-alert-title">
                {authAlertGame}尚未授权
              </div>
              <div className="vod-auth-alert-desc">
                检测到你想要生成<strong>{authAlertGame}</strong>的高光视频，但该游戏数据尚未授权。请先开启授权，允许我们读取你的对局数据，才能为你剪辑精彩瞬间。
              </div>
              <div className="vod-auth-alert-actions">
                <div
                  className="vod-auth-alert-btn secondary"
                  onClick={() => setAuthAlertGame(null)}
                >
                  返回修改
                </div>
                <div
                  className="vod-auth-alert-btn primary"
                  onClick={() => {
                    // 模拟开启授权
                    const isHeping = authAlertGame!.includes('和平')
                    if (isHeping) {
                      setAuthHeping(true)
                      updateAuthState(authWangzhe, true)
                    } else {
                      setAuthWangzhe(true)
                      updateAuthState(true, authHeping)
                    }
                    // ★ 同步更新 playerProfiles 中当前人设的授权状态
                    if (activeProfileId) {
                      setPlayerProfiles(prev => prev.map(p =>
                        p.id === activeProfileId
                          ? isHeping
                            ? { ...p, hpjyData: { ...p.hpjyData, authorized: true } }
                            : { ...p, wzryData: { ...p.wzryData, authorized: true } }
                          : p
                      ))
                    }
                    setAuthAlertGame(null)
                  }}
                >
                  立即授权
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 空数据提醒卡片（已授权但近7天无可生成对局） */}
        {emptyDataAlert && (
          <div className="vod-process-section">
            <div className="vod-empty-data-card">
              <div className="vod-empty-data-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" fill="#F0F5FF" stroke="#B0C4FF" strokeWidth="1.5" />
                  <path d="M16 28C16 28 19 32 24 32C29 32 32 28 32 28" stroke="#7C5CFC" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="18" cy="20" r="2" fill="#7C5CFC" />
                  <circle cx="30" cy="20" r="2" fill="#7C5CFC" />
                  <path d="M14 15L20 17" stroke="#7C5CFC" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M34 15L28 17" stroke="#7C5CFC" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="vod-empty-data-title">
                近7天暂无可生成的对局
              </div>
              <div className="vod-empty-data-desc">
                <strong>{emptyDataAlert.gameName}</strong>已授权，但近7天内暂无对局记录。快去打几把精彩的对局，回来让AI为你剪辑高光视频吧！
              </div>
              <div className="vod-empty-data-tips">
                <div className="vod-empty-data-tip-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#7C5CFC" />
                  </svg>
                  <span>打完对局后数据会自动同步</span>
                </div>
                <div className="vod-empty-data-tip-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#7C5CFC" />
                  </svg>
                  <span>支持排位、匹配等多种模式</span>
                </div>
              </div>
              <div className="vod-empty-data-actions">
                <div
                  className="vod-empty-data-btn secondary"
                  onClick={() => setEmptyDataAlert(null)}
                >
                  我知道了
                </div>
                <div
                  className="vod-empty-data-btn primary"
                  onClick={() => {
                    setEmptyDataAlert(null)
                    showToast('快去打几把精彩的对局吧！🎮')
                  }}
                >
                  <img
                    className="vod-game-icon"
                    src={`${import.meta.env.BASE_URL}icon/${emptyDataAlert.game === 'hpjy' ? 'hpjy' : 'wzry'}.png`}
                    alt={emptyDataAlert.gameName}
                  />
                  去玩{emptyDataAlert.gameName}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ★ 其他游戏意图提醒卡片 — 暂仅支持王者荣耀 */}
        {otherGameAlert && (
          <div className="vod-process-section">
            <div className="vod-other-game-card">
              <div className="vod-other-game-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" fill="#FFF8E1" stroke="#FFD54F" strokeWidth="1.5" />
                  <path d="M16 18H32M16 24H28M16 30H24" stroke="#FF9800" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="35" cy="30" r="6" fill="#FF9800" opacity="0.15" />
                  <path d="M33 30H37M35 28V32" stroke="#FF9800" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="vod-other-game-title">
                暂仅支持王者荣耀
              </div>
              <div className="vod-other-game-desc">
                检测到你想生成<strong>{otherGameAlert}</strong>的高光视频，但目前仅支持王者荣耀的对局视频生成哦～{otherGameAlert}的支持正在开发中，敬请期待！
              </div>
              <div className="vod-other-game-actions">
                <div
                  className="vod-other-game-btn secondary"
                  onClick={() => setOtherGameAlert(null)}
                >
                  我知道了
                </div>
                <div
                  className="vod-other-game-btn primary"
                  onClick={() => {
                    setOtherGameAlert(null)
                    setInputValue('')
                  }}
                >
                  <img className="vod-game-icon" src={`${import.meta.env.BASE_URL}icon/wzry.png`} alt="王者荣耀" />
                  换成王者荣耀
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 思维链路（仅在 thinking 阶段展示，进入 generating 后消失） */}
        {activeThinkingTask && (
          <div className="vod-process-section">
            <div className="vod-thinking-chain">
              <div className="vod-thinking-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="#7C5CFC" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>生成链路</span>
              </div>
              <div className="vod-thinking-prompt-tag">
                <span className="vod-thinking-prompt-text">{activeThinkingTask.prompt}</span>
              </div>
              <div className="vod-thinking-nodes">
                {activeThinkingTask.thinkingNodes.map((node, index) => (
                  <div
                    key={node.id}
                    className={`vod-thinking-node ${node.status}`}
                  >
                    <div className="vod-thinking-node-line">
                      <div className="vod-thinking-node-dot">
                        {node.status === 'done' && (
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <path d="M13 5L6.5 11.5L3 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {node.status === 'running' && (
                          <div className="vod-node-spinner"></div>
                        )}
                      </div>
                      {index < activeThinkingTask.thinkingNodes.length - 1 && (
                        <div className={`vod-thinking-node-connector ${node.status === 'done' ? 'active' : ''}`}></div>
                      )}
                    </div>
                    <div className="vod-thinking-node-content">
                      <span className="vod-thinking-node-label">{node.label}</span>
                      {(node.status === 'running' || node.status === 'done') && (
                        <span className="vod-thinking-node-detail">{node.detail}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== 底部视频任务列表 ===== */}
        {bottomTasks.length > 0 && (
          <div className="vod-task-list-section">
            <div className="vod-task-list-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#7C5CFC" strokeWidth="1.8" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#7C5CFC" strokeWidth="1.8" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#7C5CFC" strokeWidth="1.8" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#7C5CFC" strokeWidth="1.8" />
              </svg>
              <span>视频任务</span>
              <span className="vod-task-list-count">{bottomTasks.length}个</span>
            </div>
            <div className="vod-task-list">
              {bottomTasks.map((task) => (
                <div key={task.id} className={`vod-task-card ${task.status}`}>
                  <div className="vod-task-card-cover">
                    <div className="vod-task-card-overlay">
                      {task.status === 'generating' ? (
                        <>
                          <div className="vod-task-pulse"></div>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" />
                          </svg>
                        </>
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="11" fill="rgba(52, 199, 89, 0.9)" />
                          <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="vod-task-card-info">
                    <div className="vod-task-card-prompt">{task.prompt}</div>
                    <div className={`vod-task-card-status ${task.status}`}>
                      {task.status === 'generating' && (
                        <>
                          <div className="vod-task-status-dot generating"></div>
                          <span>生成中，完成后将以服务通知提醒你</span>
                        </>
                      )}
                      {task.status === 'done' && (
                        <>
                          <div className="vod-task-status-dot done"></div>
                          <span>已生成完成</span>
                        </>
                      )}
                    </div>
                    {task.status === 'generating' && (
                      <div className="vod-task-progress-bar">
                        <div className="vod-task-progress-fill"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部授权模拟开关面板（可折叠） */}
      <div className={`vod-auth-toggle-panel ${consoleCollapsed ? 'collapsed' : ''}`}>
        <div
          className="vod-auth-toggle-header"
          onClick={() => setConsoleCollapsed(!consoleCollapsed)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 15V17M6 21H18C19.1 21 20 20.1 20 19V13C20 11.9 19.1 11 18 11H6C4.9 11 4 11.9 4 13V19C4 20.1 4.9 21 6 21ZM16 11V7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7V11H16Z" stroke="#8C8C8C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>模拟控制台</span>
          <svg
            className={`vod-console-arrow ${consoleCollapsed ? '' : 'expanded'}`}
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path d="M4 10L8 6L12 10" stroke="#ACACAC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="vod-console-body">
          <div className="vod-auth-toggle-list">
            <div className="vod-auth-toggle-item">
              <div className="vod-auth-toggle-game">
                <img className="vod-game-icon" src={`${import.meta.env.BASE_URL}icon/wzry.png`} alt="王者荣耀" />
                <span className="vod-auth-toggle-game-name">王者荣耀</span>
              </div>
              <div
                className={`vod-auth-switch ${authWangzhe ? 'on' : ''}`}
                onClick={() => {
                  const newVal = !authWangzhe
                  setAuthWangzhe(newVal)
                  updateAuthState(newVal, authHeping)
                  // ★ 同步更新 playerProfiles 中当前人设的授权状态
                  if (activeProfileId) {
                    setPlayerProfiles(prev => prev.map(p =>
                      p.id === activeProfileId
                        ? { ...p, wzryData: { ...p.wzryData, authorized: newVal } }
                        : p
                    ))
                  }
                }}
              >
                <div className="vod-auth-switch-thumb" />
              </div>
            </div>
            <div className="vod-auth-toggle-item">
              <div className="vod-auth-toggle-game">
                <img className="vod-game-icon" src={`${import.meta.env.BASE_URL}icon/hpjy.png`} alt="和平精英" />
                <span className="vod-auth-toggle-game-name">和平精英</span>
              </div>
              <div
                className={`vod-auth-switch ${authHeping ? 'on' : ''}`}
                onClick={() => {
                  const newVal = !authHeping
                  setAuthHeping(newVal)
                  updateAuthState(authWangzhe, newVal)
                  // ★ 同步更新 playerProfiles 中当前人设的授权状态
                  if (activeProfileId) {
                    setPlayerProfiles(prev => prev.map(p =>
                      p.id === activeProfileId
                        ? { ...p, hpjyData: { ...p.hpjyData, authorized: newVal } }
                        : p
                    ))
                  }
                }}
              >
                <div className="vod-auth-switch-thumb" />
              </div>
            </div>
          </div>
          {/* 模拟加次数 */}
          <div className="vod-sim-quota-row">
            <div className="vod-sim-quota-label">
              <span className="vod-auth-toggle-game-icon">🎫</span>
              <span className="vod-auth-toggle-game-name">点播次数</span>
              <span className="vod-sim-quota-current">{remainCount}次</span>
            </div>
            <div className="vod-sim-quota-controls">
              <input
                type="number"
                className="vod-sim-quota-input"
                value={addCountInput}
                onChange={(e) => setAddCountInput(e.target.value)}
                min="1"
                max="99"
              />
              <div
                className="vod-sim-quota-btn"
                onClick={() => {
                  const num = parseInt(addCountInput) || 0
                  if (num > 0) {
                    setRemainCount((prev) => prev + num)
                    showToast(`已增加 ${num} 次点播次数`)
                  }
                }}
              >
                +加次数
              </div>
            </div>
          </div>

          {/* 玩家人设管理 */}
          <PlayerProfilePanel
            profiles={playerProfiles}
            activeProfileId={activeProfileId}
            onProfilesChange={setPlayerProfiles}
            onActiveChange={setActiveProfileId}
          />
        </div>
      </div>

      {/* 分享功能获点播次数 - 底部弹窗 */}
      <div
        className={`vod-share-overlay ${showSharePanel ? 'show' : ''}`}
        onClick={() => setShowSharePanel(false)}
      >
        <div className="vod-share-panel" onClick={(e) => e.stopPropagation()}>
          <div className="vod-share-close" onClick={() => setShowSharePanel(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="vod-share-content">
            <h2 className="vod-share-title">分享功能获点播次数</h2>
            <p className="vod-share-desc">
              邀请好友体验点播功能，成功分享后即可获得 1 次点播次数，每天至多获得 3 次，仅当日有效。
            </p>
            <div className="vod-share-today">
              <span className="vod-share-today-label">今日已获得：</span>
              <span className="vod-share-today-count">0</span>
              <span className="vod-share-today-unit">次</span>
            </div>
          </div>
          <div className="vod-share-btn-wrap">
            <div className="vod-share-btn">立即分享</div>
          </div>
        </div>
      </div>

      {/* Toast 提示 */}
      <div className={`vod-toast ${toastVisible ? 'show' : ''}`}>
        <span>{toastMsg}</span>
      </div>
    </div>
  )
}

export default HighlightVodPage
