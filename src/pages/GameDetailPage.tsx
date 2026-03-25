import React from 'react'
import './GameDetailPage.css'

interface PlayerInfo {
  avatar: string
  name: string
  isMvp: boolean
  level: number
  rating: number
  ratingColor: string
  kda: string
  gender: 'male' | 'female' | null
  rankIcon: boolean
  heroIcon: string
  equipments: string[]
  heroDamage?: string
  heroTaken?: string
  teamfight?: string
}

interface GameDetailProps {
  hasVideo: boolean
  onBack: () => void
}

const winPlayers: PlayerInfo[] = [
  {
    avatar: '',
    name: '游子身上劈い',
    isMvp: true,
    level: 15,
    rating: 10.6,
    ratingColor: '#FF6B00',
    kda: '7/3/9',
    gender: 'male',
    rankIcon: true,
    heroIcon: '',
    equipments: ['⚔️', '🛡️', '👢', '💎', '🔮', '📿', '🧪'],
    heroDamage: '27.20%',
    heroTaken: '15.10%',
    teamfight: '59.30%',
  },
  {
    avatar: '',
    name: 'RandomL',
    isMvp: false,
    level: 15,
    rating: 8.6,
    ratingColor: '#FF6B00',
    kda: '8/6/7',
    gender: 'male',
    rankIcon: true,
    heroIcon: '',
    equipments: ['⚔️', '🛡️', '👢', '💎', '🔮', '📿', '🧪'],
  },
  {
    avatar: '',
    name: '风中追风者',
    isMvp: false,
    level: 14,
    rating: 7.8,
    ratingColor: '#FF6B00',
    kda: '5/4/11',
    gender: null,
    rankIcon: true,
    heroIcon: '',
    equipments: ['⚔️', '🛡️', '👢', '💎', '🔮', '📿', '🧪'],
  },
  {
    avatar: '',
    name: '夜色如墨',
    isMvp: false,
    level: 14,
    rating: 6.9,
    ratingColor: '#FF6B00',
    kda: '4/5/8',
    gender: 'female',
    rankIcon: true,
    heroIcon: '',
    equipments: ['⚔️', '🛡️', '👢', '💎', '🔮', '📿', '🧪'],
  },
  {
    avatar: '',
    name: '大乔带你飞',
    isMvp: false,
    level: 13,
    rating: 6.2,
    ratingColor: '#4CAF50',
    kda: '3/6/12',
    gender: 'female',
    rankIcon: false,
    heroIcon: '',
    equipments: ['⚔️', '🛡️', '👢', '💎', '🔮', '📿', '🧪'],
  },
]

const losePlayers: PlayerInfo[] = [
  {
    avatar: '',
    name: '摸鱼小少年',
    isMvp: true,
    level: 15,
    rating: 9.8,
    ratingColor: '#FF6B00',
    kda: '6/1/4',
    gender: null,
    rankIcon: true,
    heroIcon: '',
    equipments: ['⚔️', '🛡️', '👢', '💎', '🔮', '📿', '🧪'],
  },
  {
    avatar: '',
    name: '姑奶奶是大坑',
    isMvp: false,
    level: 14,
    rating: 7.1,
    ratingColor: '#FF6B00',
    kda: '1/3/7',
    gender: 'female',
    rankIcon: true,
    heroIcon: '',
    equipments: ['⚔️', '🛡️', '👢', '💎', '🔮', '📿', '🧪'],
  },
  {
    avatar: '',
    name: '金枪鱼罐头bb',
    isMvp: false,
    level: 14,
    rating: 6.5,
    ratingColor: '#FF6B00',
    kda: '3/1/3',
    gender: 'female',
    rankIcon: true,
    heroIcon: '',
    equipments: ['⚔️', '🛡️', '👢', '💎', '🔮', '📿', '🧪'],
  },
  {
    avatar: '',
    name: 'RandomL',
    isMvp: false,
    level: 14,
    rating: 5.6,
    ratingColor: '#4CAF50',
    kda: '0/5/4',
    gender: 'male',
    rankIcon: true,
    heroIcon: '',
    equipments: ['⚔️', '🛡️', '👢', '💎', '🔮', '📿', '🧪'],
  },
  {
    avatar: '',
    name: '小鲁班在隔壁',
    isMvp: false,
    level: 14,
    rating: 5.2,
    ratingColor: '#4CAF50',
    kda: '2/5/3',
    gender: 'male',
    rankIcon: true,
    heroIcon: '',
    equipments: ['⚔️', '🛡️', '👢', '💎', '🔮', '📿', '🧪'],
  },
]

// 英雄头像颜色（模拟）
const heroColors = [
  '#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400',
  '#16a085', '#2c3e50', '#f39c12', '#e74c3c', '#3498db',
]

const GameDetailPage: React.FC<GameDetailProps> = ({ hasVideo, onBack }) => {
  const isWin = hasVideo
  const players = isWin ? winPlayers : losePlayers

  return (
    <div className="game-detail-page">
      {/* 顶部英雄背景区 */}
      <div className={`detail-hero-banner ${isWin ? 'win' : 'lose'}`}>
        {/* 背景装饰 */}
        <div className="banner-bg-decoration">
          <div className="banner-bg-circle-1"></div>
          <div className="banner-bg-circle-2"></div>
          <div className="banner-bg-pattern"></div>
        </div>

        {/* 状态栏占位 */}
        <div className="detail-status-bar"></div>

        {/* 导航栏 */}
        <div className="detail-nav-bar">
          <div className="detail-back-btn" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="detail-share-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16,6 12,2 8,6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="2" x2="12" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* 用户信息 */}
        <div className="detail-user-info">
          <div className="detail-user-avatar">
            <div className="avatar-placeholder">
              <span>👤</span>
            </div>
            <div className="avatar-gender-badge male">♂</div>
          </div>
          <div className="detail-user-text">
            <span className="detail-username">RandomL</span>
            <span className="detail-kda-text">
              {isWin ? '8杀/6死/7助' : '0杀/5死/4助'}
            </span>
            {isWin && (
              <span className="detail-rank-badge">铜牌发育路</span>
            )}
          </div>
          <div className={`detail-result-badge ${isWin ? 'win' : 'lose'}`}>
            <span className="result-text">{isWin ? '胜利' : '失败'}</span>
            <span className="result-type">排位赛</span>
          </div>
        </div>
      </div>

      {/* 可滚动内容 */}
      <div className="detail-scroll-content">
        {/* 高光视频区域 - 仅有视频时显示 */}
        {hasVideo && (
          <div className="detail-highlight-section">
            <div className="highlight-section-header">
              <span className="highlight-section-title">本局共有1个高光视频</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#1A1A1A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="highlight-video-preview">
              <div className="video-preview-cover">
                <div className="video-preview-bg">
                  <div className="preview-decoration">
                    <div className="preview-deco-1"></div>
                    <div className="preview-deco-2"></div>
                  </div>
                  {/* 我的标签 */}
                  <div className="video-my-tag">我的</div>
                  {/* 日期标签 */}
                  <div className="video-date-tag">2026.03.17</div>
                  {/* 中间大字 */}
                  <div className="video-center-text">
                    <span className="video-big-title">精彩击杀</span>
                    <span className="video-sub-info">至尊星耀III KDA: 8/6/7</span>
                  </div>
                  {/* 底部播放按钮 */}
                  <div className="video-preview-play">
                    <svg width="16" height="18" viewBox="0 0 20 22" fill="none">
                      <path d="M19 10.134a1 1 0 010 1.732L2.75 19.66a1 1 0 01-1.5-.866V2.206a1 1 0 011.5-.866L19 10.134z" fill="white"/>
                    </svg>
                  </div>
                  {/* 底部文字 */}
                  <div className="video-preview-bottom-gradient"></div>
                  <div className="video-preview-desc">跟着我节奏大杀特杀！</div>
                  <div className="video-preview-author">RandomL</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 比赛信息行 */}
        <div className="detail-match-info">
          <span className="match-info-text">
            排位赛 · {isWin ? '03-17 19:16' : '03-09 19:23'} · {isWin ? '18分钟' : '15分钟'}
          </span>
          <div className="match-data-toggle">
            <span className="data-toggle-text">显示数据</span>
            <div className={`data-toggle-circle ${isWin ? 'active' : ''}`}>
              {isWin && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* 比分区域 */}
        <div className={`detail-score-bar ${isWin ? 'win' : 'lose'}`}>
          <div className="score-left">
            <span className="score-result">{isWin ? '我方胜利' : '我方失败'}</span>
            <span className="score-number">{isWin ? '27' : '12'}</span>
          </div>
          <span className="score-economy">总经济: {isWin ? '6.01万' : '4.36万'}</span>
        </div>

        {/* 玩家列表 */}
        <div className="detail-player-list">
          {players.map((player, index) => (
            <div className="player-row" key={index}>
              {/* 英雄头像 */}
              <div className="player-hero-avatar">
                <div
                  className="hero-avatar-img"
                  style={{ background: heroColors[index % heroColors.length] }}
                >
                  <span className="hero-avatar-emoji">🎭</span>
                </div>
                {player.isMvp && (
                  <div className="mvp-badge">
                    <span>MVP</span>
                  </div>
                )}
                <div className="hero-level-badge">
                  <span>{player.level}</span>
                </div>
                <div
                  className="hero-rating-badge"
                  style={{ background: player.rating >= 7 ? '#FF6B00' : '#4CAF50' }}
                >
                  <span>{player.rating}</span>
                </div>
              </div>

              {/* 玩家信息 */}
              <div className="player-info-col">
                <div className="player-name-row">
                  <span className="player-rank-emoji">🏅</span>
                  <span className="player-name">{player.name}</span>
                  {player.gender === 'male' && <span className="gender-icon male">♂</span>}
                  {player.gender === 'female' && <span className="gender-icon female">♀</span>}
                  {player.rankIcon && <span className="player-rank-icon">👑</span>}
                </div>
                <div className="player-equip-row">
                  {player.equipments.map((eq, i) => (
                    <span
                      key={i}
                      className="equip-icon"
                      style={{
                        background: heroColors[(index + i + 3) % heroColors.length],
                      }}
                    ></span>
                  ))}
                </div>
                {/* MVP 玩家显示额外数据 */}
                {player.isMvp && isWin && (
                  <div className="player-stats-row">
                    <div className="stat-item">
                      <span className="stat-label">英雄伤害</span>
                      <div className="stat-bar-wrap">
                        <div className="stat-bar" style={{ width: '27.20%', background: '#2196F3' }}></div>
                      </div>
                      <span className="stat-value">27.20%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">英雄承伤</span>
                      <div className="stat-bar-wrap">
                        <div className="stat-bar" style={{ width: '15.10%', background: '#2196F3' }}></div>
                      </div>
                      <span className="stat-value">15.10%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">参团率</span>
                      <div className="stat-bar-wrap">
                        <div className="stat-bar" style={{ width: '59.30%', background: '#2196F3' }}></div>
                      </div>
                      <span className="stat-value">59.30%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* KDA */}
              <span className="player-kda">{player.kda}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 底部固定按钮 */}
      <div className="detail-bottom-btn">
        <div className="yuanbao-btn">
          <span className="yuanbao-icon">💰</span>
          <span className="yuanbao-text">元宝锐评本局战绩</span>
        </div>
      </div>
    </div>
  )
}

export default GameDetailPage
