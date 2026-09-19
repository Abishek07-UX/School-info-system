const BASE_URL = 'http://localhost:8080/api'

async function request(endpoint, options = {}, getToken) {
  let headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (getToken) {
    try {
      const token = await getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } catch (e) {
      console.warn('Could not retrieve auth token:', e)
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMsg = json?.error?.message || json?.message || `Request failed (${response.status})`
    throw new Error(errorMsg)
  }

  return json.data !== undefined ? json.data : json
}

export const examScheduleService = {
  async getExamSchedules(examId, getToken) {
    return request(`/exam-schedules?examId=${examId}`, { method: 'GET' }, getToken)
  },

  async getClassExamDateSheet(classId, examId, getToken) {
    return request(`/exam-schedules/classes/${classId}?examId=${examId}`, { method: 'GET' }, getToken)
  },

  async getInvigilatorDuties(teacherId, getToken) {
    return request(`/exam-schedules/invigilators/${teacherId}`, { method: 'GET' }, getToken)
  },

  async checkConflict(payload, getToken) {
    return request('/exam-schedules/check-conflict', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, getToken)
  },

  async createExamSchedule(data, getToken) {
    return request('/exam-schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    }, getToken)
  },

  async updateExamSchedule(id, data, getToken) {
    return request(`/exam-schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, getToken)
  },

  async deleteExamSchedule(id, getToken) {
    return request(`/exam-schedules/${id}`, { method: 'DELETE' }, getToken)
  }
}
