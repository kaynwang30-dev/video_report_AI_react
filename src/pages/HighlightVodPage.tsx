import React, { useState, useRef, useEffect, useCallback } from 'react'
import './HighlightVodPage.css'
import { aiRefine, type IntentDimensions } from '../services/aiRefine'
import type { AIVideoItem } from '../App'

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
  { id: 'penta', label: '五杀集锦', icon: '🏆' },
  { id: 'friend', label: '和lykos开黑', icon: '👥' },
  { id: 'lastgame', label: '上一局高光', icon: '🔥' },
  { id: 'mvp', label: 'MVP时刻', icon: '⭐' },
  { id: 'clutch', label: '极限操作', icon: '💥' },
  { id: 'teamfight', label: '团战集锦', icon: '⚔️' },
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

  // 模拟加次数
  const [addCountInput, setAddCountInput] = useState('1')

  // 游戏授权状态（模拟）
  const [authWangzhe, setAuthWangzhe] = useState(true)
  const [authHeping, setAuthHeping] = useState(false)

  // 授权提醒
  const [authAlertGame, setAuthAlertGame] = useState<string | null>(null)

  // 凝练状态（独立于视频任务）
  const [refinePhase, setRefinePhase] = useState<'idle' | 'refining' | 'refined'>('idle')
  const [refinedText, setRefinedText] = useState('')
  const [refinedDimensions, setRefinedDimensions] = useState<IntentDimensions | null>(null)
  const [editingRefined, setEditingRefined] = useState(false)

  // 当前正在展示思维链路的任务ID（null表示没有正在进行的链路展示）
  const [activeThinkingTaskId, setActiveThinkingTaskId] = useState<string | null>(null)

  // 视频任务列表（底部列表）
  const [videoTasks, setVideoTasks] = useState<VideoTask[]>([])

  const contentRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const refinedTextareaRef = useRef<HTMLTextAreaElement>(null)

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

  // ===== AI凝练 =====
  const handleRefine = async () => {
    const prompt = inputValue.trim()
    if (!prompt) return
    setRefinePhase('refining')
    scrollToBottom()

    try {
      const result = await aiRefine(prompt)
      setRefinedDimensions(result.dimensions)
      setRefinedText(result.sentence)
      setRefinePhase('refined')
      scrollToBottom()
    } catch (error) {
      console.error('[AI Refine] 凝练失败:', error)
      // 失败后恢复输入状态
      setRefinePhase('idle')
    }
  }

  // ===== 检查游戏授权 =====
  const checkGameAuth = (prompt: string): boolean => {
    const isHeping = prompt.includes('和平') || prompt.includes('吃鸡') || prompt.includes('绝地')
    const isWangzhe = prompt.includes('王者') || prompt.includes('荣耀') || prompt.includes('峡谷')

    // 如果凝练结果有维度信息，优先用维度中的游戏
    if (refinedDimensions) {
      if (refinedDimensions.game.includes('和平') && !authHeping) {
        setAuthAlertGame('和平精英')
        scrollToBottom()
        return false
      }
      if (refinedDimensions.game.includes('王者') && !authWangzhe) {
        setAuthAlertGame('王者荣耀')
        scrollToBottom()
        return false
      }
      return true
    }

    // fallback: 从文本判断
    if (isHeping && !authHeping) {
      setAuthAlertGame('和平精英')
      scrollToBottom()
      return false
    }
    if (isWangzhe && !authWangzhe) {
      setAuthAlertGame('王者荣耀')
      scrollToBottom()
      return false
    }
    // 默认王者
    if (!isHeping && !isWangzhe && !authWangzhe) {
      setAuthAlertGame('王者荣耀')
      scrollToBottom()
      return false
    }
    return true
  }

  // ===== AI点播：创建视频任务 =====
  const handleGenerate = () => {
    const prompt = refinePhase === 'refined' ? refinedText : inputValue.trim()
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

    // 重置输入区
    setInputValue('')
    setRefinePhase('idle')
    setRefinedText('')
    setRefinedDimensions(null)
    setEditingRefined(false)
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
    setEditingRefined(false)
    handleGenerate()
  }

  // 重置凝练
  const handleResetRefine = () => {
    setRefinePhase('idle')
    setRefinedText('')
    setRefinedDimensions(null)
    setEditingRefined(false)
    setInputValue('')
  }

  // 重新凝练（直接基于输入框文案重新凝练一次）
  const handleReRefine = () => {
    const prompt = inputValue.trim()
    if (!prompt) return
    setRefinedText('')
    setRefinedDimensions(null)
    setEditingRefined(false)
    // 直接发起凝练
    handleRefine()
  }

  // 输入区是否可用（凝练进行中不可用，但视频生成中可继续输入）
  const inputDisabled = refinePhase === 'refining'

  // 当前正在展示思维链路的任务
  const activeThinkingTask = activeThinkingTaskId
    ? videoTasks.find((t) => t.id === activeThinkingTaskId)
    : null

  // 底部任务列表（生成中 + 已完成的任务）
  const bottomTasks = videoTasks.filter((t) => t.status === 'generating' || t.status === 'done')

  return (
    <div className="highlight-vod-page">
      {/* 顶部状态栏 */}
      <div className="vod-status-bar">
        <div className="vod-status-time">9:52</div>
        <div className="vod-status-right">
          <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
            <rect x="0" y="7" width="3" height="4" rx="0.5" fill="#1A1A1A" />
            <rect x="4.5" y="5" width="3" height="6" rx="0.5" fill="#1A1A1A" />
            <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" fill="#1A1A1A" />
            <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="#1A1A1A" />
          </svg>
          <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
            <path d="M7.5 10.5C8.328 10.5 9 9.828 9 9C9 8.172 8.328 7.5 7.5 7.5C6.672 7.5 6 8.172 6 9C6 9.828 6.672 10.5 7.5 10.5Z" fill="#1A1A1A" />
            <path d="M3.75 6.75C4.75 5.5 6 4.75 7.5 4.75C9 4.75 10.25 5.5 11.25 6.75" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M1 3.75C2.75 1.75 5 0.75 7.5 0.75C10 0.75 12.25 1.75 14 3.75" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div className="vod-battery">
            <div className="vod-battery-body">
              <div className="vod-battery-level"></div>
            </div>
            <div className="vod-battery-cap"></div>
          </div>
        </div>
      </div>

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
            <span className="vod-intro-support-game">🎮 王者荣耀</span>
            <span className="vod-intro-support-game">🔫 和平精英</span>
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
            {/* AI凝练按钮 - 输入框右下角 */}
            {refinePhase === 'idle' && (
              <div
                className={`vod-refine-inline-btn ${inputValue.trim() ? 'active' : ''}`}
                onClick={handleRefine}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
                </svg>
                <span>AI凝练</span>
              </div>
            )}
            {/* 重新凝练按钮 - 凝练完成后保留在输入框右下角 */}
            {refinePhase === 'refined' && (
              <div
                className="vod-refine-inline-btn active"
                onClick={handleReRefine}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.51 15A9 9 0 1 0 5.64 5.64L1 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>重新凝练</span>
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

          {/* 4. AI点播按钮 */}
          {refinePhase === 'idle' && (
            <div className="vod-action-btns">
              <div
                className={`vod-action-btn generate ${inputValue.trim() ? '' : 'disabled'}`}
                onClick={handleGenerate}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 3L19 12L5 21V3Z" fill="currentColor" />
                </svg>
                <span>AI 点播</span>
              </div>
            </div>
          )}
        </div>

        {/* ===== 流程展示区域 ===== */}

        {/* AI凝练中 */}
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
                <span className="vod-process-title">GLM5.0 正在思考中...</span>
              </div>
              <div className="vod-refining-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}

        {/* AI凝练完成 - 展示五维度拆解 + 凝练句子 */}
        {refinePhase === 'refined' && refinedDimensions && (
          <div className="vod-process-section">
            <div className="vod-process-card refined">
              <div className="vod-process-header">
                <div className="vod-process-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="vod-process-title">意图凝练完成</span>
              </div>

              {/* 五维度标签 */}
              <div className="vod-dims-grid">
                <div className="vod-dim-tag">
                  <span className="vod-dim-tag-label">🎮 游戏</span>
                  <span className="vod-dim-tag-value">{refinedDimensions.game}</span>
                </div>
                <div className="vod-dim-tag">
                  <span className="vod-dim-tag-label">📅 对局</span>
                  <span className="vod-dim-tag-value">{refinedDimensions.match}</span>
                </div>
                <div className="vod-dim-tag">
                  <span className="vod-dim-tag-label">⚔️ 片段</span>
                  <span className="vod-dim-tag-value">{refinedDimensions.clip}</span>
                </div>
                <div className="vod-dim-tag">
                  <span className="vod-dim-tag-label">🎬 剪辑方式</span>
                  <span className="vod-dim-tag-value">{refinedDimensions.editStyle}</span>
                </div>
                <div className="vod-dim-tag">
                  <span className="vod-dim-tag-label">✨ 特效</span>
                  <span className="vod-dim-tag-value">{refinedDimensions.effect}</span>
                </div>
              </div>

              {/* 凝练后的完整句子 */}
              <div className="vod-refined-sentence-wrap">
                <div className="vod-refined-sentence-label">凝练为：</div>
                <div className="vod-refined-content">
                  {editingRefined ? (
                    <textarea
                      ref={refinedTextareaRef}
                      className="vod-refined-textarea"
                      value={refinedText}
                      onChange={(e) => {
                        setRefinedText(e.target.value)
                        autoResizeTextarea(e.target)
                      }}
                      autoFocus
                    />
                  ) : (
                    <div className="vod-refined-text" onClick={() => setEditingRefined(true)}>
                      {refinedText}
                      <span className="vod-refined-edit-hint">点击编辑</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="vod-refined-actions">
                <div className="vod-refined-btn primary" onClick={handleConfirmRefined}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 3L19 12L5 21V3Z" fill="currentColor" />
                  </svg>
                  <span>AI 点播</span>
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
                    if (authAlertGame.includes('和平')) {
                      setAuthHeping(true)
                    } else {
                      setAuthWangzhe(true)
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

      {/* 底部授权模拟开关面板 */}
      <div className="vod-auth-toggle-panel">
        <div className="vod-auth-toggle-header">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 15V17M6 21H18C19.1 21 20 20.1 20 19V13C20 11.9 19.1 11 18 11H6C4.9 11 4 11.9 4 13V19C4 20.1 4.9 21 6 21ZM16 11V7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7V11H16Z" stroke="#8C8C8C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>模拟控制台</span>
        </div>
        <div className="vod-auth-toggle-list">
          <div className="vod-auth-toggle-item">
            <div className="vod-auth-toggle-game">
              <span className="vod-auth-toggle-game-icon">⚔️</span>
              <span className="vod-auth-toggle-game-name">王者荣耀</span>
            </div>
            <div
              className={`vod-auth-switch ${authWangzhe ? 'on' : ''}`}
              onClick={() => setAuthWangzhe(!authWangzhe)}
            >
              <div className="vod-auth-switch-thumb" />
            </div>
          </div>
          <div className="vod-auth-toggle-item">
            <div className="vod-auth-toggle-game">
              <span className="vod-auth-toggle-game-icon">🔫</span>
              <span className="vod-auth-toggle-game-name">和平精英</span>
            </div>
            <div
              className={`vod-auth-switch ${authHeping ? 'on' : ''}`}
              onClick={() => setAuthHeping(!authHeping)}
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
