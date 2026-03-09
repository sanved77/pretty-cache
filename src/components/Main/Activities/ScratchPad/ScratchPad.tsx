import { useState } from 'react'
import { Box } from '@mui/material'
import { useScratchpadNotes } from '../../../../hooks/useScratchpadNotes'
import Toolbar from './Toolbar'
import ScratchPadEditor from './Editor'
import Footer from './Footer'

function getWordCount(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter(Boolean).length
}

export default function ScratchPad() {
  const { content, setContent } = useScratchpadNotes()
  const [wordWrap, setWordWrap] = useState(false)
  const characterCount = content.length
  const wordCount = getWordCount(content)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
  }
  const handleClear = () => {
    setContent('')
  }
  const handleWordWrapToggle = () => {
    setWordWrap((w) => !w)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--scratchpad-editor-bg)',
        color: 'var(--scratchpad-text)',
        overflow: 'hidden',
      }}
    >
      <Toolbar
        onCopy={handleCopy}
        onClear={handleClear}
        onWordWrapToggle={handleWordWrapToggle}
        wordWrap={wordWrap}
      />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ScratchPadEditor value={content} onChange={setContent} wordWrap={wordWrap} />
      </Box>
      <Footer wordCount={wordCount} characterCount={characterCount} />
    </Box>
  )
}
