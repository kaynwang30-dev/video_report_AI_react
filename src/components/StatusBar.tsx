import React from 'react'
import './StatusBar.css'

const StatusBar: React.FC = () => {
  return (
    <div className="status-bar">
      <div className="status-bar-time">9:00</div>
      <div className="status-bar-right">
        {/* 信号 */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0" y="7" width="3" height="4" rx="0.5" fill="white"/>
          <rect x="4.5" y="5" width="3" height="6" rx="0.5" fill="white"/>
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" fill="white"/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="white"/>
        </svg>
        {/* Wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <path d="M7.5 10.5C8.328 10.5 9 9.828 9 9C9 8.172 8.328 7.5 7.5 7.5C6.672 7.5 6 8.172 6 9C6 9.828 6.672 10.5 7.5 10.5Z" fill="white"/>
          <path d="M3.75 6.75C4.75 5.5 6 4.75 7.5 4.75C9 4.75 10.25 5.5 11.25 6.75" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M1 3.75C2.75 1.75 5 0.75 7.5 0.75C10 0.75 12.25 1.75 14 3.75" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {/* 电池 */}
        <div className="battery">
          <div className="battery-body">
            <div className="battery-level"></div>
          </div>
          <div className="battery-cap"></div>
        </div>
      </div>
    </div>
  )
}

export default StatusBar
