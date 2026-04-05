import { useState, useEffect, useCallback } from 'react'
import type { Question } from '../types/projects'
import { storageEvents } from '../utils/storageEvents'

const STORAGE_KEY = 'questions'

function readQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (q): q is Question =>
        q != null &&
        typeof q === 'object' &&
        typeof (q as Record<string, unknown>).id === 'string' &&
        typeof (q as Record<string, unknown>).text === 'string' &&
        typeof (q as Record<string, unknown>).projectId === 'string',
    )
  } catch {
    return []
  }
}

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>(readQuestions)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
  }, [questions])

  const getQuestionsForProject = useCallback(
    (projectId: string): Question[] =>
      questions.filter((q) => q.projectId === projectId),
    [questions],
  )

  const addQuestion = useCallback((projectId: string, text: string): string => {
    const id = crypto.randomUUID()
    const question: Question = { id, text: text.trim(), projectId }
    setQuestions((prev) => [...prev, question])
    storageEvents.publish({ type: 'question-added', content: { id, contentType: 'question' }, timestamp: Date.now(), contentText: text.trim() })
    return id
  }, [])

  const resolveQuestion = useCallback((questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, resolvedOn: Date.now() } : q,
      ),
    )
    storageEvents.publish({ type: 'question-resolved', content: { id: questionId, contentType: 'question' }, timestamp: Date.now() })
  }, [])

  const unresolveQuestion = useCallback((questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q
        const { resolvedOn: _, ...rest } = q
        return rest
      }),
    )
  }, [])

  const removeQuestionsForProject = useCallback((projectId: string) => {
    setQuestions((prev) => prev.filter((q) => q.projectId !== projectId))
  }, [])

  return {
    questions,
    getQuestionsForProject,
    addQuestion,
    resolveQuestion,
    unresolveQuestion,
    removeQuestionsForProject,
  }
}
