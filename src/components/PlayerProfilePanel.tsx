import React, { useState } from 'react'
import './PlayerProfilePanel.css'
import type {
  PlayerProfile,
  WzryGameData,
  HpjyGameData,
  MatchRecord,
  FriendInfo,
  WzryInGameEvents,
  HpjyInGameEvents,
} from '../services/playerProfile'
import {
  createDefaultProfile,
  createDefaultWzryData,
  createDefaultHpjyData,
  PRESET_PROFILES,
  WZRY_RANKS,
  HPJY_RANKS,
  WZRY_MODES,
  HPJY_MODES,
  WZRY_KILL_EVENTS,
  WZRY_HIGHLIGHT_EVENTS,
  WZRY_FAIL_EVENTS,
  HPJY_KILL_EVENTS,
  HPJY_HIGHLIGHT_EVENTS,
  HPJY_FAIL_EVENTS,
  WZRY_MATCH_HIGHLIGHT_OPTIONS,
  HPJY_MATCH_HIGHLIGHT_OPTIONS,
  SITUATION_OPTIONS,
} from '../services/playerProfile'

interface PlayerProfilePanelProps {
  profiles: PlayerProfile[]
  activeProfileId: string | null
  onProfilesChange: (profiles: PlayerProfile[]) => void
  onActiveChange: (id: string | null) => void
}

type EditTab = 'wzry' | 'hpjy'
type EditSection = 'basic' | 'matches' | 'events' | 'friends'

const PlayerProfilePanel: React.FC<PlayerProfilePanelProps> = ({
  profiles,
  activeProfileId,
  onProfilesChange,
  onActiveChange,
}) => {
  const [showEditor, setShowEditor] = useState(false)
  const [editingProfile, setEditingProfile] = useState<PlayerProfile | null>(null)
  const [editTab, setEditTab] = useState<EditTab>('wzry')
  const [editSection, setEditSection] = useState<EditSection>('basic')
  const [showPresets, setShowPresets] = useState(false)
  const [showMatchEditor, setShowMatchEditor] = useState(false)
  const [editingMatch, setEditingMatch] = useState<MatchRecord | null>(null)
  const [editingMatchGameTab, setEditingMatchGameTab] = useState<EditTab>('wzry')
  const [showFriendEditor, setShowFriendEditor] = useState(false)
  const [editingFriend, setEditingFriend] = useState<FriendInfo | null>(null)
  const [editingFriendGameTab, setEditingFriendGameTab] = useState<EditTab>('wzry')

  // ===== 角色操作 =====
  const handleCreateNew = () => {
    const p = createDefaultProfile()
    setEditingProfile(p)
    setEditTab('wzry')
    setEditSection('basic')
    setShowEditor(true)
  }

  const handleCreateFromPreset = (presetKey: string) => {
    const factory = PRESET_PROFILES[presetKey]
    if (factory) {
      const p = factory()
      setEditingProfile(p)
      setEditTab('wzry')
      setEditSection('basic')
      setShowPresets(false)
      setShowEditor(true)
    }
  }

  const handleEditProfile = (profile: PlayerProfile) => {
    setEditingProfile(JSON.parse(JSON.stringify(profile)))
    setEditTab('wzry')
    setEditSection('basic')
    setShowEditor(true)
  }

  const handleDeleteProfile = (id: string) => {
    const newProfiles = profiles.filter(p => p.id !== id)
    onProfilesChange(newProfiles)
    if (activeProfileId === id) {
      onActiveChange(newProfiles.length > 0 ? newProfiles[0].id : null)
    }
  }

  const handleSaveProfile = () => {
    if (!editingProfile) return
    const idx = profiles.findIndex(p => p.id === editingProfile.id)
    let newProfiles: PlayerProfile[]
    if (idx >= 0) {
      newProfiles = [...profiles]
      newProfiles[idx] = editingProfile
    } else {
      newProfiles = [...profiles, editingProfile]
    }
    onProfilesChange(newProfiles)
    if (!activeProfileId) onActiveChange(editingProfile.id)
    setShowEditor(false)
    setEditingProfile(null)
  }

  const handleSelectProfile = (id: string) => {
    onActiveChange(activeProfileId === id ? null : id)
  }

  // ===== 编辑器辅助 =====
  const currentWzryData = (): WzryGameData => {
    if (!editingProfile) return createDefaultWzryData()
    return editingProfile.wzryData
  }

  const currentHpjyData = (): HpjyGameData => {
    if (!editingProfile) return createDefaultHpjyData()
    return editingProfile.hpjyData
  }

  const updateWzryData = (updater: (data: WzryGameData) => WzryGameData) => {
    if (!editingProfile) return
    setEditingProfile({
      ...editingProfile,
      wzryData: updater({ ...editingProfile.wzryData }),
    })
  }

  const updateHpjyData = (updater: (data: HpjyGameData) => HpjyGameData) => {
    if (!editingProfile) return
    setEditingProfile({
      ...editingProfile,
      hpjyData: updater({ ...editingProfile.hpjyData }),
    })
  }

  // 通用更新：根据当前 editTab 自动选择
  const updateCurrentGameField = <K extends string, V>(field: K, value: V) => {
    if (!editingProfile) return
    if (editTab === 'wzry') {
      setEditingProfile({
        ...editingProfile,
        wzryData: { ...editingProfile.wzryData, [field]: value } as WzryGameData,
      })
    } else {
      setEditingProfile({
        ...editingProfile,
        hpjyData: { ...editingProfile.hpjyData, [field]: value } as HpjyGameData,
      })
    }
  }

  // ===== 对局编辑 =====
  const handleAddMatch = (gameTab: EditTab) => {
    setEditingMatch({
      id: `match_${Date.now()}`,
      date: '今天',
      mode: gameTab === 'wzry' ? '排位' : '经典-海岛',
      hero: '',
      kda: '0/0/0',
      result: '胜',
      highlights: [],
      teammates: [],
      situation: '普通',
      duration: 15,
    })
    setEditingMatchGameTab(gameTab)
    setShowMatchEditor(true)
  }

  const handleEditMatch = (match: MatchRecord, gameTab: EditTab) => {
    setEditingMatch(JSON.parse(JSON.stringify(match)))
    setEditingMatchGameTab(gameTab)
    setShowMatchEditor(true)
  }

  const handleSaveMatch = () => {
    if (!editingMatch || !editingProfile) return
    if (editingMatchGameTab === 'wzry') {
      const gd = { ...editingProfile.wzryData }
      const idx = gd.recentMatches.findIndex(m => m.id === editingMatch.id)
      if (idx >= 0) {
        gd.recentMatches = [...gd.recentMatches]
        gd.recentMatches[idx] = editingMatch
      } else {
        gd.recentMatches = [...gd.recentMatches, editingMatch]
      }
      gd.hasRecentMatches = gd.recentMatches.length > 0
      setEditingProfile({ ...editingProfile, wzryData: gd })
    } else {
      const gd = { ...editingProfile.hpjyData }
      const idx = gd.recentMatches.findIndex(m => m.id === editingMatch.id)
      if (idx >= 0) {
        gd.recentMatches = [...gd.recentMatches]
        gd.recentMatches[idx] = editingMatch
      } else {
        gd.recentMatches = [...gd.recentMatches, editingMatch]
      }
      gd.hasRecentMatches = gd.recentMatches.length > 0
      setEditingProfile({ ...editingProfile, hpjyData: gd })
    }
    setShowMatchEditor(false)
    setEditingMatch(null)
  }

  const handleDeleteMatch = (matchId: string) => {
    if (!editingProfile) return
    if (editTab === 'wzry') {
      const gd = { ...editingProfile.wzryData }
      gd.recentMatches = gd.recentMatches.filter(m => m.id !== matchId)
      gd.hasRecentMatches = gd.recentMatches.length > 0
      setEditingProfile({ ...editingProfile, wzryData: gd })
    } else {
      const gd = { ...editingProfile.hpjyData }
      gd.recentMatches = gd.recentMatches.filter(m => m.id !== matchId)
      gd.hasRecentMatches = gd.recentMatches.length > 0
      setEditingProfile({ ...editingProfile, hpjyData: gd })
    }
  }

  // ===== 好友编辑 =====
  const handleAddFriend = (gameTab: EditTab) => {
    setEditingFriend({ name: '', lastPlayDate: '今天', playMode: '双排' })
    setEditingFriendGameTab(gameTab)
    setShowFriendEditor(true)
  }

  const handleSaveFriend = () => {
    if (!editingFriend || !editingProfile || !editingFriend.name.trim()) return
    if (editingFriendGameTab === 'wzry') {
      const gd = { ...editingProfile.wzryData }
      const idx = gd.friends.findIndex(f => f.name === editingFriend.name)
      if (idx >= 0) {
        gd.friends = [...gd.friends]
        gd.friends[idx] = editingFriend
      } else {
        gd.friends = [...gd.friends, editingFriend]
      }
      setEditingProfile({ ...editingProfile, wzryData: gd })
    } else {
      const gd = { ...editingProfile.hpjyData }
      const idx = gd.friends.findIndex(f => f.name === editingFriend.name)
      if (idx >= 0) {
        gd.friends = [...gd.friends]
        gd.friends[idx] = editingFriend
      } else {
        gd.friends = [...gd.friends, editingFriend]
      }
      setEditingProfile({ ...editingProfile, hpjyData: gd })
    }
    setShowFriendEditor(false)
    setEditingFriend(null)
  }

  const handleDeleteFriend = (friendName: string) => {
    if (!editingProfile) return
    if (editTab === 'wzry') {
      const gd = { ...editingProfile.wzryData }
      gd.friends = gd.friends.filter(f => f.name !== friendName)
      setEditingProfile({ ...editingProfile, wzryData: gd })
    } else {
      const gd = { ...editingProfile.hpjyData }
      gd.friends = gd.friends.filter(f => f.name !== friendName)
      setEditingProfile({ ...editingProfile, hpjyData: gd })
    }
  }

  // ===== 渲染 =====

  const renderProfileList = () => (
    <div className="pp-profile-list">
      {profiles.map(p => (
        <div
          key={p.id}
          className={`pp-profile-card ${activeProfileId === p.id ? 'active' : ''}`}
          onClick={() => handleSelectProfile(p.id)}
        >
          <span className="pp-profile-avatar">{p.avatar}</span>
          <div className="pp-profile-info">
            <span className="pp-profile-name">{p.name}</span>
            <span className="pp-profile-meta">
              王者{p.wzryData.authorized ? '✅' : '❌'}
              和平{p.hpjyData.authorized ? '✅' : '❌'}
              {p.wzryData.totalMatches + p.hpjyData.totalMatches > 0 &&
                ` · ${p.wzryData.totalMatches + p.hpjyData.totalMatches}局`}
            </span>
          </div>
          <div className="pp-profile-actions">
            <div className="pp-icon-btn" onClick={(e) => { e.stopPropagation(); handleEditProfile(p) }} title="编辑">✏️</div>
            <div className="pp-icon-btn danger" onClick={(e) => { e.stopPropagation(); handleDeleteProfile(p.id) }} title="删除">🗑️</div>
          </div>
        </div>
      ))}
      <div className="pp-create-row">
        <div className="pp-create-btn" onClick={handleCreateNew}>
          <span>+</span> 新建角色
        </div>
        <div className="pp-create-btn preset" onClick={() => setShowPresets(!showPresets)}>
          <span>🎭</span> 预设模板
        </div>
      </div>
      {showPresets && (
        <div className="pp-presets">
          {Object.keys(PRESET_PROFILES).map(key => (
            <div key={key} className="pp-preset-item" onClick={() => handleCreateFromPreset(key)}>
              <span className="pp-preset-label">{key}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // 基本信息编辑器
  const renderBasicEditor = () => {
    if (!editingProfile) return null
    const isWzry = editTab === 'wzry'
    const gd = isWzry ? currentWzryData() : currentHpjyData()
    const ranks = isWzry ? WZRY_RANKS : HPJY_RANKS

    return (
      <div className="pp-edit-section">
        <div className="pp-field-group">
          <label className="pp-field-label">昵称</label>
          <input className="pp-field-input" value={editingProfile.name} onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })} />
        </div>
        <div className="pp-field-group">
          <label className="pp-field-label">头像</label>
          <div className="pp-avatar-picker">
            {['🎮', '🕹️', '👾', '🤖', '🦸', '🧙', '🥷', '👨‍🚀', '🐉', '🦊', '👑', '🍚', '🌱', '💎', '⚡', '🔥', '❓', '🎭', '🔫'].map(a => (
              <span key={a} className={`pp-avatar-opt ${editingProfile.avatar === a ? 'selected' : ''}`} onClick={() => setEditingProfile({ ...editingProfile, avatar: a })}>{a}</span>
            ))}
          </div>
        </div>

        <div className="pp-section-title">{isWzry ? '🎯 王者荣耀' : '🔫 和平精英'} — 基础配置</div>

        <div className="pp-field-row">
          <div className="pp-field-group half">
            <label className="pp-field-label">已授权</label>
            <div className={`pp-switch ${gd.authorized ? 'on' : ''}`} onClick={() => updateCurrentGameField('authorized', !gd.authorized)}>
              <div className="pp-switch-thumb" />
            </div>
          </div>
          <div className="pp-field-group half">
            <label className="pp-field-label">90天有对局</label>
            <div className={`pp-switch ${gd.hasRecentMatches ? 'on' : ''}`} onClick={() => updateCurrentGameField('hasRecentMatches', !gd.hasRecentMatches)}>
              <div className="pp-switch-thumb" />
            </div>
          </div>
        </div>

        <div className="pp-field-row">
          <div className="pp-field-group half">
            <label className="pp-field-label">总对局数</label>
            <input className="pp-field-input sm" type="number" value={gd.totalMatches} onChange={(e) => updateCurrentGameField('totalMatches', parseInt(e.target.value) || 0)} />
          </div>
          <div className="pp-field-group half">
            <label className="pp-field-label">当前段位</label>
            <select className="pp-field-input sm" value={gd.currentRank} onChange={(e) => updateCurrentGameField('currentRank', e.target.value)}>
              <option value="">选择段位...</option>
              {ranks.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="pp-field-group">
          <label className="pp-field-label">{isWzry ? '常用英雄' : '常用武器'}（逗号分隔）</label>
          <input
            className="pp-field-input"
            value={gd.heroes.join('、')}
            placeholder={isWzry ? '如：李白、韩信、露娜' : '如：M416、AWM、Kar98k'}
            onChange={(e) => updateCurrentGameField('heroes', e.target.value.split(/[、,，]/).map(s => s.trim()).filter(Boolean))}
          />
        </div>
      </div>
    )
  }

  // 对局列表编辑器
  const renderMatchesEditor = () => {
    if (!editingProfile) return null
    const isWzry = editTab === 'wzry'
    const gd = isWzry ? currentWzryData() : currentHpjyData()
    return (
      <div className="pp-edit-section">
        <div className="pp-section-title">{isWzry ? '🎯 王者荣耀' : '🔫 和平精英'} — 对局记录</div>
        {gd.recentMatches.length === 0 ? (
          <div className="pp-empty-hint">暂无对局记录</div>
        ) : (
          <div className="pp-match-list">
            {gd.recentMatches.map(m => (
              <div key={m.id} className="pp-match-item">
                <div className="pp-match-main">
                  <span className={`pp-match-result ${m.result === '胜' ? 'win' : 'lose'}`}>{m.result}</span>
                  <span className="pp-match-hero">{m.hero}</span>
                  <span className="pp-match-kda">{m.kda}</span>
                  <span className="pp-match-mode">{m.mode}</span>
                  <span className="pp-match-date">{m.date}</span>
                </div>
                <div className="pp-match-tags">
                  {m.highlights.map((h, i) => <span key={i} className="pp-mini-tag">{h}</span>)}
                  {m.situation !== '普通' && <span className="pp-mini-tag sit">{m.situation}</span>}
                  {m.teammates.length > 0 && <span className="pp-mini-tag team">开黑:{m.teammates.join(',')}</span>}
                </div>
                <div className="pp-match-actions">
                  <span className="pp-text-btn" onClick={() => handleEditMatch(m, editTab)}>编辑</span>
                  <span className="pp-text-btn danger" onClick={() => handleDeleteMatch(m.id)}>删除</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="pp-add-btn" onClick={() => handleAddMatch(editTab)}>+ 添加对局</div>
      </div>
    )
  }

  // 事件统计编辑器
  const renderEventsEditor = () => {
    if (!editingProfile) return null
    const isWzry = editTab === 'wzry'

    const numField = (label: string, value: number, onChange: (v: number) => void, desc?: string) => (
      <div className="pp-num-field" key={label} title={desc}>
        <span className="pp-num-label">{label}</span>
        <div className="pp-num-controls">
          <span className="pp-num-btn" onClick={() => onChange(Math.max(0, value - 1))}>-</span>
          <span className="pp-num-value">{value}</span>
          <span className="pp-num-btn" onClick={() => onChange(value + 1)}>+</span>
        </div>
      </div>
    )

    if (isWzry) {
      const ev = currentWzryData().inGameEvents
      const oe = currentWzryData().outGameEvents
      const ss = currentWzryData().situationStats

      const updateWzryEv = (key: keyof WzryInGameEvents, v: number) =>
        updateWzryData(d => ({ ...d, inGameEvents: { ...d.inGameEvents, [key]: v } }))

      return (
        <div className="pp-edit-section">
          <div className="pp-section-title">🎯 王者荣耀 — 事件 & 局势</div>

          {/* 击杀类 */}
          <div className="pp-sub-title">⚔️ 击杀播报体系</div>
          <div className="pp-num-grid">
            {WZRY_KILL_EVENTS.map(e => numField(e.label.split(' ')[0], ev[e.key as keyof WzryInGameEvents], v => updateWzryEv(e.key as keyof WzryInGameEvents, v), e.desc))}
          </div>

          {/* 高光类 */}
          <div className="pp-sub-title">✨ 高光事件体系</div>
          <div className="pp-num-grid">
            {WZRY_HIGHLIGHT_EVENTS.map(e => numField(e.label, ev[e.key as keyof WzryInGameEvents], v => updateWzryEv(e.key as keyof WzryInGameEvents, v), e.desc))}
          </div>

          {/* 下饭类 */}
          <div className="pp-sub-title">🍚 下饭事件体系</div>
          <div className="pp-num-grid">
            {WZRY_FAIL_EVENTS.map(e => numField(e.label, ev[e.key as keyof WzryInGameEvents], v => updateWzryEv(e.key as keyof WzryInGameEvents, v), e.desc))}
          </div>

          {/* 局外事件 */}
          <div className="pp-sub-title">🏆 局外事件</div>
          <div className="pp-field-row">
            <div className="pp-field-group half">
              <label className="pp-field-label">近期晋级</label>
              <div className="pp-switch-row">
                <div className={`pp-switch ${oe.hasRankUp ? 'on' : ''}`} onClick={() => updateWzryData(d => ({ ...d, outGameEvents: { ...d.outGameEvents, hasRankUp: !d.outGameEvents.hasRankUp } }))}>
                  <div className="pp-switch-thumb" />
                </div>
                {oe.hasRankUp && (
                  <input className="pp-field-input sm" value={oe.rankUpDetail} placeholder="如：星耀→王者" onChange={(e) => updateWzryData(d => ({ ...d, outGameEvents: { ...d.outGameEvents, rankUpDetail: e.target.value } }))} />
                )}
              </div>
            </div>
            <div className="pp-field-group half">
              <label className="pp-field-label">赛季最佳</label>
              <input className="pp-field-input sm" value={oe.seasonBest} placeholder="如：荣耀王者" onChange={(e) => updateWzryData(d => ({ ...d, outGameEvents: { ...d.outGameEvents, seasonBest: e.target.value } }))} />
            </div>
          </div>
          <div className="pp-field-row">
            <div className="pp-field-group half">
              <label className="pp-field-label">连胜</label>
              <div className="pp-switch-row">
                <div className={`pp-switch ${oe.hasWinStreak ? 'on' : ''}`} onClick={() => updateWzryData(d => ({ ...d, outGameEvents: { ...d.outGameEvents, hasWinStreak: !d.outGameEvents.hasWinStreak } }))}>
                  <div className="pp-switch-thumb" />
                </div>
                {oe.hasWinStreak && (
                  <input className="pp-field-input sm" type="number" value={oe.winStreakCount} onChange={(e) => updateWzryData(d => ({ ...d, outGameEvents: { ...d.outGameEvents, winStreakCount: parseInt(e.target.value) || 0 } }))} style={{ width: 50 }} />
                )}
              </div>
            </div>
            <div className="pp-field-group half">
              <label className="pp-field-label">连败</label>
              <div className="pp-switch-row">
                <div className={`pp-switch ${oe.hasLoseStreak ? 'on' : ''}`} onClick={() => updateWzryData(d => ({ ...d, outGameEvents: { ...d.outGameEvents, hasLoseStreak: !d.outGameEvents.hasLoseStreak } }))}>
                  <div className="pp-switch-thumb" />
                </div>
                {oe.hasLoseStreak && (
                  <input className="pp-field-input sm" type="number" value={oe.loseStreakCount} onChange={(e) => updateWzryData(d => ({ ...d, outGameEvents: { ...d.outGameEvents, loseStreakCount: parseInt(e.target.value) || 0 } }))} style={{ width: 50 }} />
                )}
              </div>
            </div>
          </div>

          {/* 局势分布 */}
          <div className="pp-sub-title">📊 局势分布</div>
          <div className="pp-num-grid">
            {numField('Carry局', ss.carryCount, v => updateWzryData(d => ({ ...d, situationStats: { ...d.situationStats, carryCount: v } })))}
            {numField('翻盘局', ss.comebackCount, v => updateWzryData(d => ({ ...d, situationStats: { ...d.situationStats, comebackCount: v } })))}
            {numField('膀胱局', ss.bladderCount, v => updateWzryData(d => ({ ...d, situationStats: { ...d.situationStats, bladderCount: v } })))}
            {numField('速推局', ss.stompCount, v => updateWzryData(d => ({ ...d, situationStats: { ...d.situationStats, stompCount: v } })))}
            {numField('尽力局', ss.tryHardCount, v => updateWzryData(d => ({ ...d, situationStats: { ...d.situationStats, tryHardCount: v } })))}
            {numField('惊险局', ss.cliffhangerCount, v => updateWzryData(d => ({ ...d, situationStats: { ...d.situationStats, cliffhangerCount: v } })))}
          </div>
        </div>
      )
    } else {
      // 和平精英
      const ev = currentHpjyData().inGameEvents
      const oe = currentHpjyData().outGameEvents
      const ss = currentHpjyData().situationStats

      const updateHpjyEv = (key: keyof HpjyInGameEvents, v: number) =>
        updateHpjyData(d => ({ ...d, inGameEvents: { ...d.inGameEvents, [key]: v } }))

      return (
        <div className="pp-edit-section">
          <div className="pp-section-title">🔫 和平精英 — 事件 & 局势</div>

          {/* 击杀类 */}
          <div className="pp-sub-title">⚔️ 击杀事件</div>
          <div className="pp-num-grid">
            {HPJY_KILL_EVENTS.map(e => numField(e.label, ev[e.key as keyof HpjyInGameEvents], v => updateHpjyEv(e.key as keyof HpjyInGameEvents, v), e.desc))}
          </div>

          {/* 高光类 */}
          <div className="pp-sub-title">✨ 高光事件</div>
          <div className="pp-num-grid">
            {HPJY_HIGHLIGHT_EVENTS.map(e => numField(e.label, ev[e.key as keyof HpjyInGameEvents], v => updateHpjyEv(e.key as keyof HpjyInGameEvents, v), e.desc))}
          </div>

          {/* 下饭类 */}
          <div className="pp-sub-title">🍚 下饭事件</div>
          <div className="pp-num-grid">
            {HPJY_FAIL_EVENTS.map(e => numField(e.label, ev[e.key as keyof HpjyInGameEvents], v => updateHpjyEv(e.key as keyof HpjyInGameEvents, v), e.desc))}
          </div>

          {/* 局外事件 */}
          <div className="pp-sub-title">🏆 局外事件</div>
          <div className="pp-field-row">
            <div className="pp-field-group half">
              <label className="pp-field-label">近期晋级</label>
              <div className="pp-switch-row">
                <div className={`pp-switch ${oe.hasRankUp ? 'on' : ''}`} onClick={() => updateHpjyData(d => ({ ...d, outGameEvents: { ...d.outGameEvents, hasRankUp: !d.outGameEvents.hasRankUp } }))}>
                  <div className="pp-switch-thumb" />
                </div>
                {oe.hasRankUp && (
                  <input className="pp-field-input sm" value={oe.rankUpDetail} placeholder="如：皇冠→王牌" onChange={(e) => updateHpjyData(d => ({ ...d, outGameEvents: { ...d.outGameEvents, rankUpDetail: e.target.value } }))} />
                )}
              </div>
            </div>
            <div className="pp-field-group half">
              <label className="pp-field-label">赛季最佳</label>
              <input className="pp-field-input sm" value={oe.seasonBest} placeholder="如：无敌战神" onChange={(e) => updateHpjyData(d => ({ ...d, outGameEvents: { ...d.outGameEvents, seasonBest: e.target.value } }))} />
            </div>
          </div>
          <div className="pp-field-row">
            <div className="pp-field-group half">
              <label className="pp-field-label">连胜（连吃鸡）</label>
              <div className="pp-switch-row">
                <div className={`pp-switch ${oe.hasWinStreak ? 'on' : ''}`} onClick={() => updateHpjyData(d => ({ ...d, outGameEvents: { ...d.outGameEvents, hasWinStreak: !d.outGameEvents.hasWinStreak } }))}>
                  <div className="pp-switch-thumb" />
                </div>
                {oe.hasWinStreak && (
                  <input className="pp-field-input sm" type="number" value={oe.winStreakCount} onChange={(e) => updateHpjyData(d => ({ ...d, outGameEvents: { ...d.outGameEvents, winStreakCount: parseInt(e.target.value) || 0 } }))} style={{ width: 50 }} />
                )}
              </div>
            </div>
            <div className="pp-field-group half">
              <label className="pp-field-label">连败</label>
              <div className="pp-switch-row">
                <div className={`pp-switch ${oe.hasLoseStreak ? 'on' : ''}`} onClick={() => updateHpjyData(d => ({ ...d, outGameEvents: { ...d.outGameEvents, hasLoseStreak: !d.outGameEvents.hasLoseStreak } }))}>
                  <div className="pp-switch-thumb" />
                </div>
                {oe.hasLoseStreak && (
                  <input className="pp-field-input sm" type="number" value={oe.loseStreakCount} onChange={(e) => updateHpjyData(d => ({ ...d, outGameEvents: { ...d.outGameEvents, loseStreakCount: parseInt(e.target.value) || 0 } }))} style={{ width: 50 }} />
                )}
              </div>
            </div>
          </div>

          {/* 局势分布 */}
          <div className="pp-sub-title">📊 局势分布</div>
          <div className="pp-num-grid">
            {numField('Carry局', ss.carryCount, v => updateHpjyData(d => ({ ...d, situationStats: { ...d.situationStats, carryCount: v } })))}
            {numField('翻盘局', ss.comebackCount, v => updateHpjyData(d => ({ ...d, situationStats: { ...d.situationStats, comebackCount: v } })))}
            {numField('膀胱局', ss.bladderCount, v => updateHpjyData(d => ({ ...d, situationStats: { ...d.situationStats, bladderCount: v } })))}
            {numField('速推局', ss.stompCount, v => updateHpjyData(d => ({ ...d, situationStats: { ...d.situationStats, stompCount: v } })))}
            {numField('尽力局', ss.tryHardCount, v => updateHpjyData(d => ({ ...d, situationStats: { ...d.situationStats, tryHardCount: v } })))}
            {numField('惊险局', ss.cliffhangerCount, v => updateHpjyData(d => ({ ...d, situationStats: { ...d.situationStats, cliffhangerCount: v } })))}
          </div>
        </div>
      )
    }
  }

  // 好友管理编辑器
  const renderFriendsEditor = () => {
    if (!editingProfile) return null
    const isWzry = editTab === 'wzry'
    const gd = isWzry ? currentWzryData() : currentHpjyData()
    return (
      <div className="pp-edit-section">
        <div className="pp-section-title">{isWzry ? '🎯 王者荣耀' : '🔫 和平精英'} — 开黑好友</div>
        {gd.friends.length === 0 ? (
          <div className="pp-empty-hint">暂无开黑好友</div>
        ) : (
          <div className="pp-friend-list">
            {gd.friends.map(f => (
              <div key={f.name} className="pp-friend-item">
                <span className="pp-friend-name">👤 {f.name}</span>
                <span className="pp-friend-meta">{f.lastPlayDate} · {f.playMode}</span>
                <span className="pp-text-btn danger" onClick={() => handleDeleteFriend(f.name)}>删除</span>
              </div>
            ))}
          </div>
        )}
        <div className="pp-add-btn" onClick={() => handleAddFriend(editTab)}>+ 添加好友</div>
      </div>
    )
  }

  // 对局编辑弹窗
  const renderMatchEditorModal = () => {
    if (!showMatchEditor || !editingMatch) return null
    const isWzry = editingMatchGameTab === 'wzry'
    const HIGHLIGHT_OPTIONS = isWzry ? WZRY_MATCH_HIGHLIGHT_OPTIONS : HPJY_MATCH_HIGHLIGHT_OPTIONS
    const MODE_OPTIONS = isWzry ? WZRY_MODES : HPJY_MODES

    const toggleHighlight = (h: string) => {
      if (!editingMatch) return
      const hl = editingMatch.highlights.includes(h)
        ? editingMatch.highlights.filter(x => x !== h)
        : [...editingMatch.highlights, h]
      setEditingMatch({ ...editingMatch, highlights: hl })
    }

    return (
      <div className="pp-modal-overlay" onClick={() => setShowMatchEditor(false)}>
        <div className="pp-modal" onClick={e => e.stopPropagation()}>
          <div className="pp-modal-header">
            <span>编辑对局（{isWzry ? '王者' : '和平'}）</span>
            <span className="pp-modal-close" onClick={() => setShowMatchEditor(false)}>✕</span>
          </div>
          <div className="pp-modal-body">
            <div className="pp-field-row">
              <div className="pp-field-group half">
                <label className="pp-field-label">时间</label>
                <input className="pp-field-input sm" value={editingMatch.date} onChange={e => setEditingMatch({ ...editingMatch, date: e.target.value })} placeholder="如：今天14:32" />
              </div>
              <div className="pp-field-group half">
                <label className="pp-field-label">模式</label>
                <select className="pp-field-input sm" value={editingMatch.mode} onChange={e => setEditingMatch({ ...editingMatch, mode: e.target.value })}>
                  {MODE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="pp-field-row">
              <div className="pp-field-group half">
                <label className="pp-field-label">{isWzry ? '英雄' : '武器'}</label>
                <input className="pp-field-input sm" value={editingMatch.hero} onChange={e => setEditingMatch({ ...editingMatch, hero: e.target.value })} placeholder={isWzry ? '如：李白' : '如：M416'} />
              </div>
              <div className="pp-field-group half">
                <label className="pp-field-label">{isWzry ? 'KDA' : '淘汰/排名'}</label>
                <input className="pp-field-input sm" value={editingMatch.kda} onChange={e => setEditingMatch({ ...editingMatch, kda: e.target.value })} placeholder={isWzry ? '如：8/2/6' : '如：12/0'} />
              </div>
            </div>
            <div className="pp-field-row">
              <div className="pp-field-group half">
                <label className="pp-field-label">结果</label>
                <div className="pp-chip-row">
                  <span className={`pp-chip ${editingMatch.result === '胜' ? 'active win' : ''}`} onClick={() => setEditingMatch({ ...editingMatch, result: '胜' })}>{isWzry ? '胜' : '吃鸡/前5'}</span>
                  <span className={`pp-chip ${editingMatch.result === '败' ? 'active lose' : ''}`} onClick={() => setEditingMatch({ ...editingMatch, result: '败' })}>{isWzry ? '败' : '未吃鸡'}</span>
                </div>
              </div>
              <div className="pp-field-group half">
                <label className="pp-field-label">时长(分钟)</label>
                <input className="pp-field-input sm" type="number" value={editingMatch.duration} onChange={e => setEditingMatch({ ...editingMatch, duration: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="pp-field-group">
              <label className="pp-field-label">局势</label>
              <div className="pp-chip-row wrap">
                {SITUATION_OPTIONS.map(s => (
                  <span key={s} className={`pp-chip ${editingMatch.situation === s ? 'active' : ''}`} onClick={() => setEditingMatch({ ...editingMatch, situation: s })}>{s}</span>
                ))}
              </div>
            </div>
            <div className="pp-field-group">
              <label className="pp-field-label">事件标签（多选，覆盖全部击杀/高光/下饭事件）</label>
              <div className="pp-chip-row wrap">
                {HIGHLIGHT_OPTIONS.map(h => (
                  <span key={h} className={`pp-chip ${editingMatch.highlights.includes(h) ? 'active' : ''}`} onClick={() => toggleHighlight(h)}>{h}</span>
                ))}
              </div>
            </div>
            <div className="pp-field-group">
              <label className="pp-field-label">开黑队友（逗号分隔）</label>
              <input className="pp-field-input" value={editingMatch.teammates.join('、')} onChange={e => setEditingMatch({ ...editingMatch, teammates: e.target.value.split(/[、,，]/).map(s => s.trim()).filter(Boolean) })} placeholder="如：lykos、xiaoming" />
            </div>
          </div>
          <div className="pp-modal-footer">
            <div className="pp-modal-btn cancel" onClick={() => setShowMatchEditor(false)}>取消</div>
            <div className="pp-modal-btn save" onClick={handleSaveMatch}>保存</div>
          </div>
        </div>
      </div>
    )
  }

  // 好友编辑弹窗
  const renderFriendEditorModal = () => {
    if (!showFriendEditor || !editingFriend) return null
    return (
      <div className="pp-modal-overlay" onClick={() => setShowFriendEditor(false)}>
        <div className="pp-modal small" onClick={e => e.stopPropagation()}>
          <div className="pp-modal-header">
            <span>添加开黑好友</span>
            <span className="pp-modal-close" onClick={() => setShowFriendEditor(false)}>✕</span>
          </div>
          <div className="pp-modal-body">
            <div className="pp-field-group">
              <label className="pp-field-label">好友昵称</label>
              <input className="pp-field-input" value={editingFriend.name} onChange={e => setEditingFriend({ ...editingFriend, name: e.target.value })} placeholder="如：lykos" />
            </div>
            <div className="pp-field-row">
              <div className="pp-field-group half">
                <label className="pp-field-label">最近开黑</label>
                <input className="pp-field-input sm" value={editingFriend.lastPlayDate} onChange={e => setEditingFriend({ ...editingFriend, lastPlayDate: e.target.value })} placeholder="如：昨天" />
              </div>
              <div className="pp-field-group half">
                <label className="pp-field-label">模式</label>
                <div className="pp-chip-row">
                  {['双排', '三排', '四排', '五排'].map(m => (
                    <span key={m} className={`pp-chip ${editingFriend.playMode === m ? 'active' : ''}`} onClick={() => setEditingFriend({ ...editingFriend, playMode: m })}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="pp-modal-footer">
            <div className="pp-modal-btn cancel" onClick={() => setShowFriendEditor(false)}>取消</div>
            <div className="pp-modal-btn save" onClick={handleSaveFriend}>保存</div>
          </div>
        </div>
      </div>
    )
  }

  // 完整编辑器面板
  const renderEditor = () => {
    if (!showEditor || !editingProfile) return null
    return (
      <div className="pp-editor-overlay" onClick={() => { setShowEditor(false); setEditingProfile(null) }}>
        <div className="pp-editor" onClick={e => e.stopPropagation()}>
          <div className="pp-editor-header">
            <span className="pp-editor-title">{editingProfile.avatar} {profiles.find(p => p.id === editingProfile.id) ? '编辑角色' : '新建角色'}</span>
            <span className="pp-editor-close" onClick={() => { setShowEditor(false); setEditingProfile(null) }}>✕</span>
          </div>
          <div className="pp-game-tabs">
            <div className={`pp-game-tab ${editTab === 'wzry' ? 'active' : ''}`} onClick={() => setEditTab('wzry')}>🎯 王者荣耀</div>
            <div className={`pp-game-tab ${editTab === 'hpjy' ? 'active' : ''}`} onClick={() => setEditTab('hpjy')}>🔫 和平精英</div>
          </div>
          <div className="pp-section-tabs">
            <div className={`pp-section-tab ${editSection === 'basic' ? 'active' : ''}`} onClick={() => setEditSection('basic')}>基础</div>
            <div className={`pp-section-tab ${editSection === 'matches' ? 'active' : ''}`} onClick={() => setEditSection('matches')}>对局</div>
            <div className={`pp-section-tab ${editSection === 'events' ? 'active' : ''}`} onClick={() => setEditSection('events')}>事件</div>
            <div className={`pp-section-tab ${editSection === 'friends' ? 'active' : ''}`} onClick={() => setEditSection('friends')}>好友</div>
          </div>
          <div className="pp-editor-body">
            {editSection === 'basic' && renderBasicEditor()}
            {editSection === 'matches' && renderMatchesEditor()}
            {editSection === 'events' && renderEventsEditor()}
            {editSection === 'friends' && renderFriendsEditor()}
          </div>
          <div className="pp-editor-footer">
            <div className="pp-save-btn" onClick={handleSaveProfile}>✅ 保存角色</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pp-panel">
      <div className="pp-panel-title">
        <span>🎭</span>
        <span>玩家人设</span>
        {activeProfileId && (
          <span className="pp-active-badge">
            已选：{profiles.find(p => p.id === activeProfileId)?.name}
          </span>
        )}
      </div>
      {renderProfileList()}
      {renderEditor()}
      {renderMatchEditorModal()}
      {renderFriendEditorModal()}
    </div>
  )
}

export default PlayerProfilePanel
