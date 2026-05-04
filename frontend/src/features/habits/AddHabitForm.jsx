import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createHabit } from '../../lib/api'

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

export default function AddHabitForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries(['habits'])
      setName('')
      setDescription('')
      setColor('#6366f1')
      setOpen(false)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    mutation.mutate({ name, description, color })
  }

  return (
    <div className="mb-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
        >
          + add a new habit
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <input
            autoFocus
            type="text"
            placeholder="habit name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full text-sm outline-none border-b border-gray-100 pb-2 placeholder-gray-300"
          />
          <input
            type="text"
            placeholder="description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full text-sm outline-none border-b border-gray-100 pb-2 placeholder-gray-300"
          />
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  outline: color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: '2px'
                }}
              />
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              {mutation.isPending ? 'saving...' : 'save'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}