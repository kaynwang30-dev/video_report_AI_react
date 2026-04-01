import React, { useState, useEffect } from 'react'
import NavigationBar from '../components/NavigationBar'
import VideoBanner from '../components/VideoBanner'
import UserProfile from '../components/UserProfile'
import GameList from '../components/GameList'
import ContentTabs from '../components/ContentTabs'
import VideoReport from '../components/VideoReport'
import BottomTabBar from '../components/BottomTabBar'
import './MyTabPage.css'

const vodPrompts = [
  '生成最近一局的高光视频',
  '剪个我和好友的开黑时刻',
  '刚晋级王者，剪个晋级之路吧',
]

interface MyTabPageProps {
  onOpenDetail: (hasVideo: boolean) => void
  onOpenHighlightVod: (initPrompt?: string) => void
}

const MyTabPage: React.FC<MyTabPageProps> = ({ onOpenDetail, onOpenHighlightVod }) => {
  const [activeContentTab, setActiveContentTab] = useState(0)
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentPromptIndex((prev) => (prev + 1) % vodPrompts.length)
        setIsAnimating(false)
      }, 300)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="my-tab-page">
      {/* 顶部导航栏 - 固定定位（去掉状态栏时间行） */}
      <div className="top-fixed">
        <NavigationBar />
      </div>

      {/* 可滚动内容区域 */}
      <div className="scroll-content">
        {/* 视频轮播 */}
        <VideoBanner />

        {/* 白色背景内容区域 */}
        <div className="white-content">
          {/* 用户资料 */}
          <UserProfile />

          {/* 玩过的游戏 */}
          <GameList />

          {/* 内容页签 */}
          <ContentTabs
            activeTab={activeContentTab}
            onTabChange={setActiveContentTab}
          />

          {/* 内容区域 */}
          <div className="content-area">
            {/* 高光内容 */}
            {activeContentTab === 0 && (
              <>
                {/* 游戏筛选器 */}
                <div className="game-selector">
                  <div className="game-selector-left">
                    <img
                      className="game-selector-icon"
                      src={`${import.meta.env.BASE_URL}icon/wzry.png`}
                      alt="王者荣耀"
                    />
                    <span className="game-selector-name">王者荣耀</span>
                    <svg className="transfer-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3.5 5L8 2L12.5 5" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.5 11L8 14L12.5 11" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* 高光点播入口 - 横条样式 */}
                <div className="vod-entry-bar" onClick={() => onOpenHighlightVod(vodPrompts[currentPromptIndex])}>
                  <div className="vod-entry-left">
                    <div className="vod-ai-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#ai-gradient)" />
                        <path d="M19 2L19.8 4.2L22 5L19.8 5.8L19 8L18.2 5.8L16 5L18.2 4.2L19 2Z" fill="url(#ai-gradient2)" opacity="0.7" />
                        <defs>
                          <linearGradient id="ai-gradient" x1="2" y1="2" x2="22" y2="22">
                            <stop stopColor="#7C5CFC" />
                            <stop offset="1" stopColor="#4D9EFF" />
                          </linearGradient>
                          <linearGradient id="ai-gradient2" x1="16" y1="2" x2="22" y2="8">
                            <stop stopColor="#7C5CFC" />
                            <stop offset="1" stopColor="#4D9EFF" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <span className="vod-entry-title">高光点播</span>
                  </div>
                  <div className="vod-entry-right">
                    <div className="vod-prompt-scroll">
                      <span className={`vod-prompt-text ${isAnimating ? 'slide-out' : 'slide-in'}`}>
                        {vodPrompts[currentPromptIndex]}
                      </span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="vod-entry-arrow">
                      <path d="M6 4L10 8L6 12" stroke="#C0C0C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                <VideoReport onOpenDetail={onOpenDetail} />
              </>
            )}
          </div>

          {/* 底部加载状态 */}
          <div className="bottom-status">
            <span className="bottom-text">已触碰到底线了</span>
          </div>
        </div>
      </div>

      {/* 底部 TabBar */}
      <BottomTabBar />
    </div>
  )
}

export default MyTabPage
