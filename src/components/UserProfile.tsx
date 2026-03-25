import React from 'react'
import './UserProfile.css'

const UserProfile: React.FC = () => {
  return (
    <div className="user-profile">
      <div className="profile-main">
        <div className="profile-left">
          {/* 头像 */}
          <div className="avatar-container">
            <div className="avatar-placeholder">
              <span className="avatar-emoji">🐧</span>
            </div>
          </div>
          <div className="profile-info">
            <div className="profile-name-row">
              <div className="profile-name-wrapper">
                <span className="profile-name">奥利奥阿加西</span>
              </div>
              {/* 性别图标 - 男 */}
              <div className="gender-icon male">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="9" r="4.5" stroke="#4A9FFF" strokeWidth="1.5"/>
                  <path d="M10 6L14 2M14 2H10.5M14 2V5.5" stroke="#4A9FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {/* 标签行 */}
            <div className="profile-tags">
              <div className="tag-item tag-level">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9.5L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z" fill="#FFB800"/>
                </svg>
                <span>LV1</span>
              </div>
              <div className="tag-item tag-vip">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" fill="#FF9500" stroke="#FF9500" strokeWidth="0.5"/>
                  <path d="M4 7L6 9L10 5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>游戏贵族Lv2</span>
              </div>
              <div className="tag-more">
                <span>···</span>
              </div>
            </div>
            {/* 切换账号 */}
            <div className="switch-account">
              <span className="account-text">王者荣耀：☎️ 找人CPDD</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4.5 2.5L8 6L4.5 9.5" stroke="#929296" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="profile-right">
          <div className="interaction-count">
            <span className="count-number">32</span>
            <span className="count-label">获得互动</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
