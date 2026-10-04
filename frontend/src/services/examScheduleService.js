import { request } from './apiRequest'

export const examScheduleService = {
  async getExamSchedules(examId, getToken) {
    return request(`/exam-schedules?examId=${examId}`, { method: 'GET' }, getToken)
  },

  async getExamSchedulesBatch(examIds, getToken) {
    const ids = examIds.map((id) => encodeURIComponent(id)).join(',')
    try {
      return await request(`/exam-schedules/batch?examIds=${ids}`, { method: 'GET' }, getToken)
    } catch (error) {
      if (error.status !== 404) throw error
      const schedules = await Promise.all(examIds.map((id) => this.getExamSchedules(id, getToken)))
      return schedules.flat()
    }
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
