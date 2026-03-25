import React from 'react'
import './NavigationBar.css'

const NavigationBar: React.FC = () => {
  return (
    <div className="navigation-bar">
      <div className="nav-left">
        <div className="nav-icon-btn">
          {/* 返回箭头 */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div className="nav-right">
        {/* 搜索图标 */}
        <div className="nav-icon-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="white" strokeWidth="1.6"/>
            <path d="M13.5 13.5L17 17" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
        {/* 下载图标 */}
        <div className="nav-icon-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3V13M10 13L6 9M10 13L14 9" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 15H16" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
        {/* 设置图标 */}
        <div className="nav-icon-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="2.5" stroke="white" strokeWidth="1.5"/>
            <path d="M10 2.5V4.5M10 15.5V17.5M17.5 10H15.5M4.5 10H2.5M15.3 4.7L13.9 6.1M6.1 13.9L4.7 15.3M15.3 15.3L13.9 13.9M6.1 6.1L4.7 4.7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default NavigationBar
