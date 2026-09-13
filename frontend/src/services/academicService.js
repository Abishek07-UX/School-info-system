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

export const academicService = {
  // Examinations
  async getExams({ academicYear, term, classId, status } = {}, getToken) {
    const params = new URLSearchParams()
    if (academicYear) params.append('academicYear', academicYear)
    if (term) params.append('term', term)
    if (classId) params.append('classId', classId)
    if (status) params.append('status', status)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return request(`/exams${queryString}`, { method: 'GET' }, getToken)
  },

  async getExamById(id, getToken) {
    return request(`/exams/${id}`, { method: 'GET' }, getToken)
  },

  async getExamsForClass(classId, academicYear, getToken) {
    const query = academicYear ? `?academicYear=${academicYear}` : ''
    return request(`/exams/class/${classId}${query}`, { method: 'GET' }, getToken)
  },

  async createExam(data, getToken) {
    return request('/exams', {
      method: 'POST',
      body: JSON.stringify(data),
    }, getToken)
  },

  async createExamWithTimetable(data, getToken) {
    return request('/exams/with-timetable', {
      method: 'POST',
      body: JSON.stringify(data),
    }, getToken)
  },

  async updateExam(id, data, getToken) {
    return request(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, getToken)
  },

  async deleteExam(id, getToken) {
    return request(`/exams/${id}`, { method: 'DELETE' }, getToken)
  },

  // Marks
  async enterSingleMark(data, getToken) {
    return request('/marks', {
      method: 'POST',
      body: JSON.stringify(data),
    }, getToken)
  },

  async enterBatchMarks(data, getToken) {
    return request('/marks/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    }, getToken)
  },

  async getMarksForExamAndSubject(examId, subjectId, getToken) {
    return request(`/marks?examId=${examId}&subjectId=${subjectId}`, { method: 'GET' }, getToken)
  },

  async getMarksForExam(examId, getToken) {
    return request(`/marks?examId=${examId}`, { method: 'GET' }, getToken)
  },

  // Report Cards & Rankings
  async getReportCard(studentId, examId, getToken) {
    return request(`/report-cards/${studentId}?examId=${examId}`, { method: 'GET' }, getToken)
  },

  async getAnnualProgress(studentId, academicYear, classId, getToken) {
    const classParam = classId ? `&classId=${classId}` : ''
    return request(`/report-cards/${studentId}/annual?academicYear=${academicYear}${classParam}`, { method: 'GET' }, getToken)
  },

  async getClassLeaderboard(classId, examId, getToken) {
    return request(`/report-cards/class/${classId}/exam/${examId}`, { method: 'GET' }, getToken)
  },

  // Performance Analytics
  async getStudentProgressTrend(studentId, getToken) {
    return request(`/performance/student/${studentId}`, { method: 'GET' }, getToken)
  },

  async getClassPerformanceAnalytics(classId, examId, getToken) {
    return request(`/performance/class/${classId}/exam/${examId}`, { method: 'GET' }, getToken)
  },

  // Lookups
  async getClasses(getToken) {
    return request('/academic/lookup/classes', { method: 'GET' }, getToken)
  },

  async getSubjectsForClass(classId, getToken) {
    return request(`/academic/lookup/classes/${classId}/subjects`, { method: 'GET' }, getToken)
  },

  async getStudentsForClass(classId, getToken) {
    return request(`/academic/lookup/classes/${classId}/students`, { method: 'GET' }, getToken)
  },

  async getAllSubjects(getToken) {
    return request('/academic/lookup/subjects', { method: 'GET' }, getToken)
  },

  async getSubjectsForGrade(gradeLevel, getToken) {
    return request(`/academic/lookup/grades/${gradeLevel}/subjects`, { method: 'GET' }, getToken)
  },

  async getClassesForGrade(gradeLevel, getToken) {
    return request(`/academic/lookup/grades/${gradeLevel}/classes`, { method: 'GET' }, getToken)
  }
}
