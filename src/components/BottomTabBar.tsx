import React from 'react'
import './BottomTabBar.css'

const BottomTabBar: React.FC = () => {
  return (
    <div className="bottom-tab-bar">
      <div className="tab-bar-items">
        {/* 游戏 */}
        <div className="tab-bar-item">
          <div className="tab-bar-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="#2F3033" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M8 12H16M12 8V16" stroke="#2F3033" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M16 2L22 2L22 8" stroke="#2F3033" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="tab-bar-label">游戏</span>
        </div>

        {/* 攻略 */}
        <div className="tab-bar-item">
          <div className="tab-bar-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="9.5" cy="9.5" r="5.5" stroke="#2F3033" strokeWidth="1.8"/>
              <circle cx="14.5" cy="14.5" r="5.5" stroke="#2F3033" strokeWidth="1.8"/>
              <line x1="18" y1="18" x2="22" y2="22" stroke="#2F3033" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="tab-bar-label">攻略</span>
        </div>

        {/* 搭子 */}
        <div className="tab-bar-item">
          <div className="tab-bar-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="8" r="3.5" stroke="#1A1A1A" strokeWidth="1.8"/>
              <circle cx="15" cy="8" r="3.5" stroke="#1A1A1A" strokeWidth="1.8"/>
              <path d="M3 20C3 16.13 6.13 13 10 13H14C17.87 13 21 16.13 21 20" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="tab-bar-label">搭子</span>
        </div>

        {/* 我的 - 选中态 */}
        <div className="tab-bar-item active">
          <div className="tab-bar-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#0099FF"/>
              <path d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20" fill="#0099FF"/>
              <rect x="10" y="14" width="4" height="2" rx="1" fill="white"/>
              <rect x="10.5" y="15.5" width="3" height="3" rx="0.5" fill="white"/>
            </svg>
          </div>
          <span className="tab-bar-label active">我的</span>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="home-indicator">
        <div className="home-indicator-bar"></div>
      </div>
    </div>
  )
}

export default BottomTabBar
