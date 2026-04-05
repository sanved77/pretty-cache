# Mission Control — localStorage schema

Reference for all keys persisted in the browser’s `localStorage`, aligned with export/import ([`src/dev/missionControlStorage.ts`](../src/dev/missionControlStorage.ts)) and app hooks.

## Keys overview

| Key            | Stored as              | Primary types / source |
|----------------|------------------------|-------------------------|
| `projects`     | `JSON.stringify(...)`  | `Project[]` — `useProjects` |
| `tasks`        | `JSON.stringify(...)`  | `Task[]` — `useTasks` |
| `tracked`      | `JSON.stringify(...)`  | `TrackedStorage` — `trackedStorage` |
| `notes`        | `JSON.stringify(...)`  | `{ content: string }` — `useScratchpadNotes` |
| `blockers`     | `JSON.stringify(...)`  | `Blocker[]` — `useBlockers` |
| `questions`    | `JSON.stringify(...)`  | `Question[]` — `useQuestions` |
| `logs`         | `JSON.stringify(...)`  | `LogEntry[]` — `useLogWriter` / LogBoard |
| `parkingLot`   | `JSON.stringify(...)`  | `ParkingItem[]` — `useParkingLot` |
| `today`        | `JSON.stringify(...)`  | `TodayItem[]` — `useToday` |
| `userFullName` | **plain string** (not JSON) | Settings / Today |

Canonical JSON keys for export/import: `projects`, `tasks`, `tracked`, `notes`, `blockers`, `questions`, `logs`, `parkingLot`, `today`, plus envelope fields `userFullName`, `version`, `exportedAt`.

---

## `projects` — `Project[]`

Source: [`src/types/projects.ts`](../src/types/projects.ts), [`src/hooks/useProjects.ts`](../src/hooks/useProjects.ts)

```ts
type ProjectStatus = 'Open' | 'Close' | 'Paused' | 'Blocked'

type LinkObj = {
  id: string
  label: string
  url: string
  type?: string
  visits: number
}

interface Project {
  id: string
  projectName: string
  description: string
  blockers: string[]      // blocker ids (see `blockers` store)
  questions: string[]     // question ids (see `questions` store)
  links: LinkObj[]
  createdOn: number
  deadlineOn?: number
  completedOn?: number
  status?: ProjectStatus
}
```

---

## `tasks` — `Task[]`

Source: [`src/types/projects.ts`](../src/types/projects.ts), [`src/hooks/useTasks.ts`](../src/hooks/useTasks.ts)

```ts
interface Task {
  id: string
  content: string
  createdOn: number
  deadlineOn?: number
  completedOn?: number
  projectID?: string
  subTasks?: string[]     // child task ids (same flat `tasks` array)
  isArchived?: boolean
}
```

---

## `tracked` — `TrackedStorage`

Source: [`src/utils/trackedStorage.ts`](../src/utils/trackedStorage.ts)

Single JSON object (not an array). Older data may have had a `tasks` array; readers migrate the first entry to `task`.

```ts
interface TrackedStorage {
  task: string              // single tracked task id
  projects?: string[]       // tracked project ids
  links?: string[]          // tracked favorite link ids
  recents?: string[]        // recent link ids, max 5, most recent first
}
```

---

## `notes` — scratchpad

Source: [`src/hooks/useScratchpadNotes.ts`](../src/hooks/useScratchpadNotes.ts)

```ts
{ content: string }
```

---

## `blockers` — `Blocker[]`

Source: [`src/types/projects.ts`](../src/types/projects.ts), [`src/hooks/useBlockers.ts`](../src/hooks/useBlockers.ts)

```ts
interface Blocker {
  id: string
  text: string
  projectId: string
  dismissedOn?: number
}
```

---

## `questions` — `Question[]`

Source: [`src/types/projects.ts`](../src/types/projects.ts), [`src/hooks/useQuestions.ts`](../src/hooks/useQuestions.ts)

```ts
interface Question {
  id: string
  text: string
  projectId: string
  resolvedOn?: number
}
```

---

## `logs` — `LogEntry[]`

Source: [`src/types/logs.ts`](../src/types/logs.ts), [`src/hooks/useLogWriter.ts`](../src/hooks/useLogWriter.ts), [`src/components/LogBoard/index.tsx`](../src/components/LogBoard/index.tsx)

```ts
interface LogEntry {
  id: string
  timestamp: number
  action: string
  content: string
}
```

---

## `parkingLot` — `ParkingItem[]`

Source: [`src/types/today.ts`](../src/types/today.ts), [`src/hooks/useParkingLot.ts`](../src/hooks/useParkingLot.ts)

```ts
interface ParkingItem {
  id: string
  content: string
  createdAt: string   // ISO string
  color: string
}
```

---

## `today` — `TodayItem[]`

Source: [`src/types/today.ts`](../src/types/today.ts), [`src/hooks/useToday.ts`](../src/hooks/useToday.ts)

```ts
interface TodayItem {
  id: string
  content: string
  status: 'open' | 'done'
  createdAt: string   // ISO string
}
```

---

## `userFullName`

- Stored as a **raw string**, not `JSON.stringify`.
- Used for the Today greeting and Settings; import writes with `localStorage.setItem('userFullName', string)` ([`missionControlStorage.ts`](../src/dev/missionControlStorage.ts)).

---

## Export envelope (version 1)

Shape produced by [`exportMissionControlStorage`](../src/dev/missionControlStorage.ts):

```ts
type MissionControlStorageExport = {
  version: 1
  exportedAt: number
  userFullName: string
} & Record<
  'projects' | 'tasks' | 'tracked' | 'notes' | 'blockers' | 'questions' | 'logs' | 'parkingLot' | 'today',
  unknown
>
```

Import validation: [`validateMissionControlImport`](../src/dev/missionControlStorage.ts) (requires `version === 1`, all JSON keys present, and basic shape checks per key).

---

## Related code

| Area | File |
|------|------|
| Export/import keys & validation | [`src/dev/missionControlStorage.ts`](../src/dev/missionControlStorage.ts) |
| Dev console API | [`src/main.tsx`](../src/main.tsx) (`window.missionControl`) |

When adding new persisted keys, update `JSON_STORAGE_KEYS`, hooks, and this document.
