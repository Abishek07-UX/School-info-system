import { request } from './apiRequest'

export const timetableService = {
  async getClassTimetableBootstrap(academicYear = 2026, preferredTeacherId, getToken) {
    const params = new URLSearchParams({ academicYear: String(academicYear) })
    if (preferredTeacherId) params.set('preferredTeacherId', String(preferredTeacherId))
    return request(`/timetables/bootstrap?${params}`, { method: 'GET' }, getToken)
  },

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
