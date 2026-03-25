import React from 'react'
import './WeeklyReport.css'

const WeeklyReport: React.FC = () => {
  return (
    <div className="weekly-report-section">
      {/* 标题 */}
      <div className="section-header">
        <span className="section-title">游戏周报</span>
      </div>

      {/* 周报卡片 */}
      <div className="weekly-card-container">
        <div className="weekly-card">
          {/* 左侧文本 */}
          <div className="weekly-text">
            <div className="weekly-date-row">
              <span className="weekly-date-label">10天前</span>
            </div>
            <div className="weekly-title-group">
              <div className="weekly-main-title">王者周报已送达</div>
              <div className="weekly-sub-title">02.25-03.06</div>
            </div>
          </div>

          {/* 右侧勋章 */}
          <div className="weekly-badge">
            <div className="weekly-badge-bg"></div>
            <div className="weekly-badge-content">
              <div className="weekly-badge-icon">稳</div>
            </div>
          </div>

          {/* 数据行 */}
          <div className="weekly-stats">
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-label">对局场次</span>
                <span className="stat-value stat-value-number">12</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">平均胜率</span>
                <span className="stat-value stat-value-number">58.3%</span>
              </div>
            </div>

            <div className="weekly-divider"></div>

            <div className="weekly-bottom-row">
              <div className="weekly-bottom-text">
                <span className="bottom-desc">不问胜负 "佛系一下"</span>
              </div>
              <div className="weekly-action-btn">去炫耀</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyReport
