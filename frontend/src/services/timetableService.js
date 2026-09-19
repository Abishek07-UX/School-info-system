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

export const timetableService = {
  // Class Timetable
  async getClassTimetable(classId, academicYear = 2026, getToken) {
    return request(`/timetables/classes/${classId}?academicYear=${academicYear}`, { method: 'GET' }, getToken)
  },

  // Teacher Timetable
  async getTeacherSchedule(teacherId, academicYear = 2026, getToken) {
    return request(`/timetables/teachers/${teacherId}?academicYear=${academicYear}`, { method: 'GET' }, getToken)
  },

  // Conflict Checking (Live Validation)
  async checkConflict(payload, getToken) {
    return request('/timetables/check-conflict', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, getToken)
  },

  // Slot Management (Admin Only)
  async createSlot(slotData, getToken) {
    return request('/timetables/slots', {
      method: 'POST',
      body: JSON.stringify(slotData),
    }, getToken)
  },

  async updateSlot(slotId, slotData, getToken) {
    return request(`/timetables/slots/${slotId}`, {
      method: 'PUT',
      body: JSON.stringify(slotData),
    }, getToken)
  },

  async deleteSlot(slotId, getToken) {
    return request(`/timetables/slots/${slotId}`, { method: 'DELETE' }, getToken)
  },

  async clearClassTimetable(classId, academicYear = 2026, getToken) {
    return request(`/timetables/classes/${classId}?academicYear=${academicYear}`, { method: 'DELETE' }, getToken)
  },

  // Auto-Generator (Admin Only)
  async autoGenerateTimetable(classId, academicYear = 2026, getToken) {
    return request('/timetables/generate', {
      method: 'POST',
      body: JSON.stringify({ classId, academicYear }),
    }, getToken)
  },

  // Audit
  async auditSchoolTimetable(academicYear = 2026, getToken) {
    return request(`/timetables/conflicts/audit?academicYear=${academicYear}`, { method: 'GET' }, getToken)
  },

  // Campus Rooms & Teachers Lookups
  async getCampusRooms(getToken) {
    return request('/academic/lookup/rooms', { method: 'GET' }, getToken)
  },

  async getTeachers(getToken) {
    return request('/academic/lookup/teachers', { method: 'GET' }, getToken)
  }
}
