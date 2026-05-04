import { useState } from 'react'
import HabitList from './features/habits/HabitList'
import AddHabitForm from './features/habits/AddHabitForm'
import CalendarView from './features/calendar/CalendarView'

export default function App() {
  const [selectedHabitId, setSelectedHabitId] = useState(null)
  const [view, setView] = useState('habits')

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">minimalist habits</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView('habits')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                view === 'habits'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              habits
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                view === 'calendar'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              calendar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {view === 'habits' ? (
          <>
            <AddHabitForm />
            <HabitList
              onSelectHabit={(id) => {
                setSelectedHabitId(id)
                setView('calendar')
              }}
            />
          </>
        ) : (
          <CalendarView
            habitId={selectedHabitId}
            onBack={() => setView('habits')}
          />
        )}
      </main>
    </div>
  )
}