import React, { useState } from 'react'
import MyTabPage from './pages/MyTabPage'
import GameDetailPage from './pages/GameDetailPage'
import HighlightVodPage from './pages/HighlightVodPage'

// AI生成视频数据结构
export interface AIVideoItem {
  id: string
  hero: string
  kda: string
  label: string  // 如 "AI视频"
  time: string
  prompt: string
  videoUrl: string
  coverImg: string
}

type PageType = 'home' | 'detail' | 'highlightVod'

interface PageState {
  current: PageType
  detailHasVideo: boolean
  vodInitPrompt?: string
}

const App: React.FC = () => {
  const [pageState, setPageState] = useState<PageState>({
    current: 'home',
    detailHasVideo: false,
  })

  // AI 生成视频列表（跨页面共享）
  const [aiVideos, setAiVideos] = useState<AIVideoItem[]>([])

  const addAiVideo = (video: AIVideoItem) => {
    setAiVideos((prev) => [video, ...prev])
  }

  const openDetail = (hasVideo: boolean) => {
    setPageState({ current: 'detail', detailHasVideo: hasVideo })
  }

  const openHighlightVod = (initPrompt?: string) => {
    setPageState({ current: 'highlightVod', detailHasVideo: false, vodInitPrompt: initPrompt })
  }

  const goHome = () => {
    setPageState({ current: 'home', detailHasVideo: false })
  }

  if (pageState.current === 'detail') {
    return (
      <GameDetailPage
        hasVideo={pageState.detailHasVideo}
        onBack={goHome}
      />
    )
  }

  if (pageState.current === 'highlightVod') {
    return (
      <HighlightVodPage
        onBack={goHome}
        initPrompt={pageState.vodInitPrompt}
        onVideoGenerated={addAiVideo}
      />
    )
  }

  return (
    <MyTabPage
      onOpenDetail={openDetail}
      onOpenHighlightVod={openHighlightVod}
      aiVideos={aiVideos}
    />
  )
}

export default App
