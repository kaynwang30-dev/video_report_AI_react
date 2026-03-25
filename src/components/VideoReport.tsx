import React, { useState, useRef } from 'react'
import './VideoReport.css'

interface VideoItem {
  source: string
  description: string
  hero: string
  kda: string
  highlight: string
  time: string
  hasVideo: boolean
  videoUrl: string
  coverImg: string
}

interface VideoReportProps {
  onOpenDetail: (hasVideo: boolean) => void
}

const videoList: VideoItem[] = [
  {
    source: '手Q321区-一夫当关',
    description: 'Triple Kill！枪枪到肉，爽感十足！',
    hero: '孙权',
    kda: '8/1/12',
    highlight: '斩获三杀',
    time: '39分钟前',
    hasVideo: true,
    videoUrl: 'https://img.gamecenter.qq.com/qgame/videos/highlight/defeat%20%2810%29.mp4',
    coverImg: 'https://img.gamecenter.qq.com/qgame/videos/highlight/defeat%20%2810%29.mp4',
  },
  {
    source: '手Q321区-一夫当关',
    description: 'Triple Kill！枪枪到肉，爽感十足！',
    hero: '孙权',
    kda: '12/4/12',
    highlight: '斩获四杀',
    time: '15小时前',
    hasVideo: true,
    videoUrl: 'https://img.gamecenter.qq.com/qgame/videos/highlight/defeat%20%2810%29.mp4',
    coverImg: 'https://img.gamecenter.qq.com/qgame/videos/highlight/defeat%20%2810%29.mp4',
  },
  {
    source: '手Q321区-一夫当关',
    description: '四杀！Quadra Kill！',
    hero: '马可波罗',
    kda: '3/8/9',
    highlight: '',
    time: '21小时前',
    hasVideo: false,
    videoUrl: 'https://img.gamecenter.qq.com/qgame/videos/highlight/defeat%20%2810%29.mp4',
    coverImg: 'https://img.gamecenter.qq.com/qgame/videos/highlight/defeat%20%2810%29.mp4',
  },
]

const VideoReport: React.FC<VideoReportProps> = ({ onOpenDetail }) => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const handlePlay = (index: number) => {
    // 如果当前有其他视频在播放，先暂停
    if (playingIndex !== null && playingIndex !== index) {
      const prevVideo = videoRefs.current[playingIndex]
      if (prevVideo) {
        prevVideo.pause()
      }
    }

    const video = videoRefs.current[index]
    if (video) {
      if (playingIndex === index) {
        // 当前视频正在播放，暂停它
        video.pause()
        setPlayingIndex(null)
      } else {
        // 播放新视频
        video.play()
        setPlayingIndex(index)
      }
    }
  }

  const handleVideoEnded = (index: number) => {
    if (playingIndex === index) {
      setPlayingIndex(null)
    }
  }

  const handleVideoPause = (index: number) => {
    if (playingIndex === index) {
      setPlayingIndex(null)
    }
  }

  return (
    <div className="highlight-video-list">
      {videoList.map((video, index) => (
        <div className="highlight-video-item" key={index}>
          {/* 卡片上方信息行 - 可点击跳转详情 */}
          <div
            className="highlight-video-meta clickable"
            onClick={() => onOpenDetail(video.hasVideo)}
          >
            <div className="meta-left">
              <span className="meta-hero">{video.hero}</span>
              <span className="meta-dot">·</span>
              <span className="meta-kda">{video.kda}</span>
              {video.highlight && (
                <>
                  <span className="meta-dot">·</span>
                  <span className="meta-highlight">{video.highlight}</span>
                </>
              )}
            </div>
            <span className="meta-time">{video.time}</span>
          </div>

          {/* 视频卡片 */}
          <div className="highlight-video-card">
            {/* 视频元素 */}
            <video
              ref={(el) => { videoRefs.current[index] = el }}
              className={`highlight-video-player ${playingIndex === index ? 'playing' : ''}`}
              src={video.videoUrl}
              playsInline
              preload="metadata"
              onEnded={() => handleVideoEnded(index)}
              onPause={() => handleVideoPause(index)}
              onClick={() => handlePlay(index)}
            />

            {/* 封面层 - 使用视频第一帧作为封面，播放时隐藏 */}
            <div
              className={`highlight-video-cover ${playingIndex === index ? 'hidden' : ''}`}
            >
              {/* 封面图 - 取视频第一帧 */}
              <video
                className="highlight-cover-img"
                src={video.coverImg + '#t=0.1'}
                preload="metadata"
                muted
              />

              {/* 左上角来源标签 */}
              <div className="highlight-source-tag">
                <span className="source-tag-new">新</span>
                <span>{video.source}</span>
              </div>

              {/* 中间播放按钮 */}
              <div className="highlight-play-btn" onClick={(e) => { e.stopPropagation(); handlePlay(index) }}>
                <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                  <path d="M19 10.134a1 1 0 010 1.732L2.75 19.66a1 1 0 01-1.5-.866V2.206a1 1 0 011.5-.866L19 10.134z" fill="white"/>
                </svg>
              </div>

              {/* 底部渐变遮罩 */}
              <div className="highlight-card-gradient"></div>

              {/* 底部文字描述 */}
              <div className="highlight-card-bottom">
                <span className="highlight-card-desc">{video.description}</span>
                {/* 右下角操作区 */}
                <div className="highlight-card-actions">
                  <div className="highlight-action-btns">
                    <span className="action-label">回城</span>
                    <span className="action-label">恢复</span>
                    <span className="action-label">弱化</span>
                  </div>
                  <div className="highlight-share-btn">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="16,6 12,2 8,6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="2" x2="12" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 播放时的暂停按钮覆盖层 */}
            {playingIndex === index && (
              <div className="highlight-video-pause-overlay" onClick={() => handlePlay(index)}>
                <div className="highlight-source-tag playing-source-tag">
                  <span className="source-tag-new">新</span>
                  <span>{video.source}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default VideoReport
