import React from 'react'
import './HighlightMoment.css'

const HighlightMoment: React.FC = () => {
  return (
    <div className="highlight-section">
      {/* 标题 */}
      <div className="section-header">
        <span className="section-title">高光时刻</span>
      </div>

      {/* 高光卡片 */}
      <div className="highlight-card-container">
        <div className="highlight-card">
          {/* 左侧文本信息 */}
          <div className="highlight-text">
            <div className="highlight-date">今天</div>
            <div className="highlight-title-group">
              <div className="highlight-main-title">晋级最强王者</div>
              <div className="highlight-sub-title">本命英雄 镜</div>
            </div>
          </div>

          {/* 右侧勋章图标 */}
          <div className="highlight-badge">
            <div className="badge-bg">
              <svg width="150" height="150" viewBox="0 0 150 150" fill="none">
                <path d="M75 10L90 45H115L95 65L105 100L75 80L45 100L55 65L35 45H60L75 10Z" fill="rgba(255,255,255,0.15)"/>
              </svg>
            </div>
            <div className="badge-image">
              <div className="badge-placeholder">
                <div className="badge-crown">👑</div>
                <div className="badge-rank-text">最强王者</div>
              </div>
            </div>
          </div>

          {/* 底部数据 */}
          <div className="highlight-stats">
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-label">晋级场次</span>
                <span className="stat-value stat-value-number">21</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">晋级胜率</span>
                <span className="stat-value stat-value-number">58.3%</span>
              </div>
            </div>

            <div className="highlight-divider"></div>

            <div className="highlight-bottom-row">
              <div className="highlight-bottom-text">
                <span className="bottom-desc">巅峰之路，此刻启程</span>
              </div>
              <div className="highlight-action-btn">去炫耀</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HighlightMoment
