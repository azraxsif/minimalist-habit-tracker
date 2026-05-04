import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getHabits, completeHabit, undoCompletion, deleteHabit } from '../../lib/api'
import { format } from 'date-fns'

export default function HabitList({ onSelectHabit }) {
  const queryClient = useQueryClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: getHabits
  })

  const completeMutation = useMutation({
    mutationFn: ({ id, date }) => completeHabit(id, date),
    onSuccess: () => queryClient.invalidateQueries(['habits'])
  })

  const undoMutation = useMutation({
    mutationFn: ({ id, date }) => undoCompletion(id, date),
    onSuccess: () => queryClient.invalidateQueries(['habits'])
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteHabit(id),
    onSuccess: () => queryClient.invalidateQueries(['habits'])
  })

  if (isLoading) return (
    <div className="text-center py-12 text-sm text-gray-300">loading...</div>
  )

  if (habits.length === 0) return (
    <div className="text-center py-12 text-sm text-gray-300">
      no habits yet — add one above
    </div>
  )

  return (
    <div className="space-y-3">
      {habits.map(habit => (
        <div
          key={habit.id}
          className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 group"
        >
          <button
            onClick={() => {
              if (habit.completed_today) {
                undoMutation.mutate({ id: habit.id, date: today })
              } else {
                completeMutation.mutate({ id: habit.id, date: today })
              }
            }}
            className="w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
            style={{
              borderColor: habit.color,
              backgroundColor: habit.completed_today ? habit.color : 'transparent'
            }}
          >
            {habit.completed_today && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <div
            className="flex-1 cursor-pointer"
            onClick={() => onSelectHabit(habit.id)}
          >
            <p className={`text-sm font-medium ${habit.completed_today ? 'line-through text-gray-300' : 'text-gray-800'}`}>
              {habit.name}
            </p>
            {habit.description && (
              <p className="text-xs text-gray-400 mt-0.5">{habit.description}</p>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold text-gray-800">{habit.streak}d</p>
            <p className="text-xs text-gray-300">{habit.completion_rate}%</p>
          </div>

          <button
            onClick={() => deleteMutation.mutate(habit.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-200 hover:text-red-400 transition-all text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}