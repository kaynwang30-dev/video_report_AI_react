import React, { useState, useRef, useCallback, useEffect } from 'react'
import './HighlightReviewPage.css'

/* ---------- mock 数据 ---------- */
interface CardData {
  id: number
  avatarUrl: string
  result: '胜利' | '失败'
  kda: string
  tags: string[]
  isMvp: boolean
  videoCover: string
  badgeText: string
  videoTitle: string
  commentUser: { avatar: string; name: string }
  commentText: string
  likeCount: number
}

const MOCK_CARDS: CardData[] = [
  {
    id: 1,
    avatarUrl: 'https://picsum.photos/seed/avatar1/100/100',
    result: '胜利',
    kda: '13杀/2死/6助',
    tags: ['四杀', '超神'],
    isMvp: true,
    videoCover: 'https://picsum.photos/seed/game1/800/500',
    badgeText: '我的作品 · QQ28区',
    videoTitle: '视频标题视频标题视频标题',
    commentUser: {
      avatar: 'https://picsum.photos/seed/cu1/80/80',
      name: '灰豆',
    },
    commentText: '这个操作真是开了眼了！！！这个操作真是开了眼了！！！',
    likeCount: 3,
  },
  {
    id: 2,
    avatarUrl: 'https://picsum.photos/seed/avatar2/100/100',
    result: '胜利',
    kda: '8杀/1死/12助',
    tags: ['三杀', '破塔'],
    isMvp: false,
    videoCover: 'https://picsum.photos/seed/game2/800/500',
    badgeText: '精选作品 · QQ15区',
    videoTitle: '绝地翻盘五杀团灭对面',
    commentUser: {
      avatar: 'https://picsum.photos/seed/cu2/80/80',
      name: '小明同学',
    },
    commentText: '这波团战节奏把握太好了，关键时刻C位输出拉满！',
    likeCount: 12,
  },
  {
    id: 3,
    avatarUrl: 'https://picsum.photos/seed/avatar3/100/100',
    result: '失败',
    kda: '5杀/7死/3助',
    tags: ['逆风翻盘'],
    isMvp: false,
    videoCover: 'https://picsum.photos/seed/game3/800/500',
    badgeText: '每日精选',
    videoTitle: '虽败犹荣的极限操作合集',
    commentUser: {
      avatar: 'https://picsum.photos/seed/cu3/80/80',
      name: '峡谷评论家',
    },
    commentText: '虽然输了但是这个操作确实可以，意识到位了只是队友不给力',
    likeCount: 7,
  },
]

const VOTES = [
  { emoji: '🤨', text: '一般般' },
  { emoji: '😋', text: '真下饭' },
  { emoji: '🤩', text: '太牛了' },
]

/* ---------- 组件 ---------- */
interface Props {
  onBack?: () => void
}

const HighlightReviewPage: React.FC<Props> = ({ onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animClass, setAnimClass] = useState('')

  // swipe 相关
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchDeltaX = useRef(0)
  const isSwiping = useRef(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const total = MOCK_CARDS.length

  const goTo = useCallback(
    (idx: number, direction: 'left' | 'right') => {
      if (idx < 0 || idx >= total) return
      setAnimClass(direction === 'right' ? 'hr-card-enter-right' : 'hr-card-enter-left')
      setCurrentIndex(idx)
      setTimeout(() => setAnimClass(''), 400)
    },
    [total],
  )

  /* ---- touch handlers ---- */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchDeltaX.current = 0
    isSwiping.current = false
    setIsDragging(false)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    // 判断是否是水平滑动
    if (!isSwiping.current) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        isSwiping.current = true
        setIsDragging(true)
      } else if (Math.abs(dy) > 8) {
        return // 垂直滚动，不处理
      } else {
        return
      }
    }

    touchDeltaX.current = dx
    setDragOffset(dx)
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!isSwiping.current) {
      setDragOffset(0)
      setIsDragging(false)
      return
    }

    const threshold = 60
    if (touchDeltaX.current < -threshold && currentIndex < total - 1) {
      // 左滑 → 下一张
      goTo(currentIndex + 1, 'right')
    } else if (touchDeltaX.current > threshold && currentIndex > 0) {
      // 右滑 → 上一张
      goTo(currentIndex - 1, 'left')
    }

    setDragOffset(0)
    setIsDragging(false)
    isSwiping.current = false
  }, [currentIndex, total, goTo])

  /* ---- mouse handlers（桌面端调试） ---- */
  const mouseDown = useRef(false)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    mouseDown.current = true
    touchStartX.current = e.clientX
    touchStartY.current = e.clientY
    touchDeltaX.current = 0
    isSwiping.current = false
    setIsDragging(false)
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mouseDown.current) return
    const dx = e.clientX - touchStartX.current
    const dy = e.clientY - touchStartY.current

    if (!isSwiping.current) {
      if (Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        isSwiping.current = true
        setIsDragging(true)
      } else {
        return
      }
    }
    touchDeltaX.current = dx
    setDragOffset(dx)
  }, [])

  const onMouseUp = useCallback(() => {
    if (!mouseDown.current) return
    mouseDown.current = false

    if (!isSwiping.current) {
      setDragOffset(0)
      setIsDragging(false)
      return
    }

    const threshold = 60
    if (touchDeltaX.current < -threshold && currentIndex < total - 1) {
      goTo(currentIndex + 1, 'right')
    } else if (touchDeltaX.current > threshold && currentIndex > 0) {
      goTo(currentIndex - 1, 'left')
    }

    setDragOffset(0)
    setIsDragging(false)
    isSwiping.current = false
  }, [currentIndex, total, goTo])

  useEffect(() => {
    const handler = () => {
      if (mouseDown.current) {
        mouseDown.current = false
        setDragOffset(0)
        setIsDragging(false)
      }
    }
    window.addEventListener('mouseup', handler)
    return () => window.removeEventListener('mouseup', handler)
  }, [])

  // 计算 track 偏移
  const trackTransform = `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`

  return (
    <div className="hr-page">
      {/* 状态栏 */}
      <div className="hr-statusbar">
        <span className="hr-statusbar-time">9:00</span>
        <div className="hr-statusbar-icons">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 17h2v5H2zm4-4h2v9H6zm4-4h2v13h-2zm4-4h2v17h-2z" />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
          </svg>
        </div>
      </div>

      {/* 导航栏 */}
      <div className="hr-navbar">
        <div className="hr-nav-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
        <span className="hr-nav-title">视频高光鉴赏团</span>
        <span className="hr-nav-right">我的参评</span>
      </div>

      {/* 标题区 */}
      <div className="hr-header">
        <h1 className="hr-title">Pick你心中的最佳操作！</h1>
        <div className="hr-subtitle">
          <span>1123人正在鉴赏</span>
          <svg className="hr-refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 4v6h6" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </div>
      </div>

      {/* 卡片滑动区 */}
      <div
        className="hr-swiper-wrapper"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <div
          ref={trackRef}
          className={`hr-swiper-track${isDragging ? ' swiping' : ''}`}
          style={{ transform: trackTransform }}
        >
          {MOCK_CARDS.map((card, idx) => (
            <div className="hr-swiper-slide" key={card.id}>
              <div className={`hr-card ${idx === currentIndex ? animClass : ''}`}>
                {/* 卡片头 */}
                <div className="hr-card-header">
                  <img className="hr-avatar" src={card.avatarUrl} alt="" />
                  <div className="hr-player-info">
                    <div className={`hr-player-result${card.result === '失败' ? ' defeat' : ''}`}>
                      {card.result}
                    </div>
                    <div className="hr-player-kda">{card.kda}</div>
                  </div>
                  <div className="hr-card-tags">
                    {card.tags.map((t) => (
                      <span className="hr-tag" key={t}>{t}</span>
                    ))}
                    {card.isMvp && (
                      <span className="hr-tag hr-tag-mvp">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        MVP
                      </span>
                    )}
                  </div>
                </div>

                {/* 视频封面 */}
                <div className="hr-video-area">
                  <img className="hr-video-cover" src={card.videoCover} alt="" />
                  <div className="hr-video-badge">
                    <span>{card.badgeText.split(' · ')[0]}</span>
                    <span className="hr-video-badge-dot" />
                    <span>{card.badgeText.split(' · ')[1] || ''}</span>
                  </div>
                  <div className="hr-video-share">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div className="hr-play-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="6,3 20,12 6,21" />
                    </svg>
                  </div>
                  <div className="hr-video-title">{card.videoTitle}</div>
                </div>

                {/* 甄选锐评 */}
                <div className="hr-comment-section">
                  <div className="hr-comment-header">
                    <span className="hr-comment-title">甄选锐评</span>
                    <span className="hr-comment-add">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                      我也说句
                    </span>
                  </div>
                  <div className="hr-comment-item">
                    <img className="hr-comment-avatar" src={card.commentUser.avatar} alt="" />
                    <div className="hr-comment-body">
                      <div className="hr-comment-name">{card.commentUser.name}</div>
                      <div className="hr-comment-text">{card.commentText}</div>
                    </div>
                    <div className="hr-comment-like">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                      <span className="hr-comment-like-count">{card.likeCount}</span>
                    </div>
                  </div>
                </div>

                {/* 投票 */}
                <div className="hr-vote-section">
                  {VOTES.map((v) => (
                    <button className="hr-vote-btn" key={v.text}>
                      <span className="hr-vote-emoji">{v.emoji}</span>
                      <span>{v.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 指示器 */}
      <div className="hr-dots">
        {MOCK_CARDS.map((_, i) => (
          <span className={`hr-dot${i === currentIndex ? ' active' : ''}`} key={i} />
        ))}
      </div>

      {/* 底部榜单入口 */}
      <div className="hr-bottom-bar">
        <div className="hr-bottom-left">
          <svg className="hr-bottom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="hr-bottom-text">昨日榜单已出炉</span>
        </div>
        <div className="hr-bottom-right">
          <span>你有 1 个视频上榜啦</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      <div className="hr-safe-bottom" />
    </div>
  )
}

export default HighlightReviewPage
