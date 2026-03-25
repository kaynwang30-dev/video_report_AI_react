import React from 'react'
import './VideoBanner.css'

const VideoBanner: React.FC = () => {
  return (
    <div className="video-banner">
      {/* 视频/图片背景 - 用CSS渐变模拟游戏画面 */}
      <div className="video-bg">
        <div className="video-bg-placeholder">
          <div className="bg-stars"></div>
          <div className="bg-hero"></div>
        </div>
        {/* 底部渐变遮罩 */}
        <div className="video-gradient-overlay"></div>
      </div>

      {/* 播放按钮 */}
      <div className="video-play-btn">
        <div className="play-btn-circle">
          <svg width="17" height="19" viewBox="0 0 17 19" fill="none">
            <path d="M16 8.634a1 1 0 010 1.732l-14.25 8.227a1 1 0 01-1.5-.866V1.273a1 1 0 011.5-.866L16 8.634z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* 轮播指示器 */}
      <div className="banner-indicator">
        <div className="indicator-dot active"></div>
        <div className="indicator-dot active"></div>
        <div className="indicator-dot active"></div>
        <div className="indicator-dot"></div>
        <div className="indicator-dot"></div>
        <div className="indicator-dot"></div>
        <div className="indicator-dot"></div>
        <div className="indicator-dot"></div>
      </div>
    </div>
  )
}

export default VideoBanner
