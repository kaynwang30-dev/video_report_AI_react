import React from 'react'
import './GameList.css'

const BASE = import.meta.env.BASE_URL

const gameIcons = [
  { name: '王者荣耀', color: '#FF4444', type: 'app', emoji: '⚔️', icon: `${BASE}icon/wzry.png` },
  { name: '和平精英', color: '#2B2B2B', type: 'app', emoji: '🔫', icon: `${BASE}icon/hpjy.png` },
  { name: '元梦之星', color: '#FF69B4', type: 'app', emoji: '⭐', icon: '' },
  { name: '小游戏1', color: '#4CAF50', type: 'mini', emoji: '🎮', icon: '' },
  { name: '小游戏2', color: '#2196F3', type: 'mini', emoji: '🎯', icon: '' },
]




const GameList: React.FC = () => {
  return (
    <div className="game-list-section">
      {/* 标题行 */}
      <div className="section-header">
        <span className="section-title">全部游戏(105)</span>
        <div className="section-header-right">
          <svg width="8" height="16" viewBox="0 0 8 16" fill="none">
            <path d="M1 1L7 8L1 15" stroke="#929296" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* 游戏图标 - 一行 */}
      <div className="game-icons-row">
        {gameIcons.map((game, index) => (
          <div className="game-icon-item" key={index}>
            <div className={`game-icon-wrapper ${game.type === 'mini' ? 'mini-game' : ''}`}>
              {game.icon ? (
                <img
                  className={`game-icon-img ${game.type === 'mini' ? 'mini-game-img' : ''}`}
                  src={game.icon}
                  alt={game.name}
                />
              ) : (
                <div
                  className={`game-icon-placeholder ${game.type === 'mini' ? 'mini-game-img' : ''}`}
                  style={{ background: game.color }}
                >
                  <span className="game-icon-emoji">{game.emoji}</span>
                </div>
              )}
              {game.type === 'mini' && (
                <div className="mini-game-badge">
                  <div className="mini-badge-circle">
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                      <path d="M3 6L5 8L9 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GameList
