import React from 'react'
import './ContentTabs.css'

interface ContentTabsProps {
  activeTab: number
  onTabChange: (index: number) => void
}

const tabs = ['高光', '战绩', '帖子']

const ContentTabs: React.FC<ContentTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="content-tabs-wrapper">
      {/* 分隔条 */}
      <div className="tab-separator"></div>
      {/* 页签 */}
      <div className="content-tabs">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`content-tab-item ${activeTab === index ? 'active' : ''}`}
            onClick={() => onTabChange(index)}
          >
            <span className="tab-text">{tab}</span>
            <div className={`tab-indicator ${activeTab === index ? 'active' : ''}`}></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContentTabs
