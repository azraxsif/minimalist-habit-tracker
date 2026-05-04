import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getHabits, getCompletions, completeHabit, undoCompletion } from '../../lib/api'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns'
import { useState } from 'react'

export default function CalendarView({ habitId, onBack }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const queryClient = useQueryClient()

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: getHabits
  })

  const selectedHabit = habits.find(h => h.id === habitId) || habits[0]

  const { data: completions = [] } = useQuery({
    queryKey: ['completions', selectedHabit?.id],
    queryFn: () => getCompletions(selectedHabit.id),
    enabled: !!selectedHabit
  })

  const completedDates = new Set(completions.map(c => c.date))

  const completeMutation = useMutation({
    mutationFn: ({ id, date }) => completeHabit(id, date),
    onSuccess: () => {
      queryClient.invalidateQueries(['completions', selectedHabit?.id])
      queryClient.invalidateQueries(['habits'])
    }
  })

  const undoMutation = useMutation({
    mutationFn: ({ id, date }) => undoCompletion(id, date),
    onSuccess: () => {
      queryClient.invalidateQueries(['completions', selectedHabit?.id])
      queryClient.invalidateQueries(['habits'])
    }
  })

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  const toggleDay = (day) => {
    if (!selectedHabit) return
    const dateStr = format(day, 'yyyy-MM-dd')
    if (completedDates.has(dateStr)) {
      undoMutation.mutate({ id: selectedHabit.id, date: dateStr })
    } else {
      completeMutation.mutate({ id: selectedHabit.id, date: dateStr })
    }
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1 transition-colors"
      >
        ← back
      </button>

      {habits.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {habits.map(h => (
            <button
              key={h.id}
              className="px-3 py-1 rounded-full text-xs border transition-colors"
              style={{
                borderColor: h.id === selectedHabit?.id ? h.color : '#e5e7eb',
                color: h.id === selectedHabit?.id ? h.color : '#9ca3af'
              }}
            >
              {h.name}
            </button>
          ))}
        </div>
      )}

      {selectedHabit && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-medium text-gray-800">{selectedHabit.name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedHabit.streak}d streak · {selectedHabit.completion_rate}% completion
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}
                className="text-gray-300 hover:text-gray-600 transition-colors"
              >
                ←
              </button>
              <span className="text-sm text-gray-500 min-w-24 text-center">
                {format(currentMonth, 'MMM yyyy')}
              </span>
              <button
                onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}
                className="text-gray-300 hover:text-gray-600 transition-colors"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="text-center text-xs text-gray-300 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array(startOfMonth(currentMonth).getDay()).fill(null).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const completed = completedDates.has(dateStr)
              const today = isToday(day)

              return (
                <button
                  key={dateStr}
                  onClick={() => toggleDay(day)}
                  className="aspect-square rounded-lg flex items-center justify-center text-xs transition-all hover:scale-105"
                  style={{
                    backgroundColor: completed ? selectedHabit.color : today ? '#f9fafb' : 'transparent',
                    color: completed ? 'white' : today ? '#111827' : '#9ca3af',
                    fontWeight: today ? '600' : '400',
                    border: today && !completed ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}