import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

export const getHabits = () => api.get('/habits/').then(r => r.data)
export const createHabit = (habit) => api.post('/habits/', habit).then(r => r.data)
export const deleteHabit = (id) => api.delete(`/habits/${id}`).then(r => r.data)
export const completeHabit = (id, date) =>
  api.post(`/habits/${id}/complete`, { date }).then(r => r.data)
export const undoCompletion = (id, date) =>
  api.delete(`/habits/${id}/completions/${date}`).then(r => r.data)
export const getCompletions = (id) =>
  api.get(`/habits/${id}/completions`).then(r => r.data)