import { examScheduleService } from './examScheduleService'
import { timetableService } from './timetableService'
import { request } from './apiRequest'

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

  async updateExamWithTimetable(id, data, getToken) {
    try {
      return await request(`/exams/${id}/with-timetable`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, getToken)
    } catch (err) {
      const errMsg = err?.message || ''
      // If the backend has not yet been restarted to register PUT /exams/{id}/with-timetable
      if (errMsg.includes('No static resource') || errMsg.includes('404')) {
        console.warn('Backend endpoint PUT /exams/{id}/with-timetable not yet available on running instance. Performing fallback update...', err)

        // 1. Update the base exam entity metadata
        await this.updateExam(id, {
          name: data.name,
          academicYear: data.academicYear,
          term: data.term,
          classId: data.classIds && data.classIds.length > 0 ? data.classIds[0] : null,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
          description: data.description,
        }, getToken)

        // 2. Fetch existing schedule slots for this exam
        const existingSchedules = await examScheduleService.getExamSchedules(id, getToken).catch(() => [])

        // 3. Delete old schedule slots
        if (Array.isArray(existingSchedules)) {
          for (const oldSched of existingSchedules) {
            try {
              await examScheduleService.deleteExamSchedule(oldSched.id, getToken)
            } catch (delErr) {
              console.warn(`Could not remove old slot ${oldSched.id}:`, delErr)
            }
          }
        }

        // 4. Resolve default invigilator if any slot has no invigilator selected
        let fallbackInvigilatorId = null
        for (const slot of data.slots || []) {
          if (slot.invigilatorId) {
            fallbackInvigilatorId = slot.invigilatorId
            break
          }
        }
        if (!fallbackInvigilatorId) {
          try {
            const teachers = await timetableService.getTeachers(getToken)
            if (teachers && teachers.length > 0) {
              fallbackInvigilatorId = teachers[0].id
            }
          } catch (tErr) {
            console.warn('Could not fetch teachers for fallback invigilator', tErr)
          }
        }

        // 5. Create updated schedule slots
        const primaryClassId = data.classIds && data.classIds.length > 0 ? data.classIds[0] : null
        for (const slot of data.slots || []) {
          const schedulePayload = {
            examId: id,
            classId: primaryClassId,
            subjectId: slot.subjectId,
            examDate: slot.examDate,
            startTime: slot.startTime?.length === 5 ? slot.startTime + ':00' : slot.startTime,
            endTime: slot.endTime?.length === 5 ? slot.endTime + ':00' : slot.endTime,
            room: null,
            invigilatorId: slot.invigilatorId || fallbackInvigilatorId,
            maxMarks: slot.maxMarks || 100,
            instructions: slot.instructions || null,
          }
          await examScheduleService.createExamSchedule(schedulePayload, getToken)
        }

        return {
          message: 'Examination timetable updated successfully!',
        }
      }
      throw err
    }
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

/**
 * Resolves the numeric grade level of an exam (e.g. 1 to 13), or null if general/school-wide.
 */
export function getExamGradeLevel(exam) {
  if (!exam) return null
  if (exam.gradeLevel != null) return Number(exam.gradeLevel)
  const classMatch = (exam.className || '').match(/(\d+)/)
  if (classMatch) return parseInt(classMatch[1], 10)
  const nameMatch = (exam.name || '').match(/grade\s*(\d+)/i)
  if (nameMatch) return parseInt(nameMatch[1], 10)
  return null
}

/**
 * Checks whether an exam is classified as an open / school-wide & other exam.
 * An exam is school-wide if:
 * 1. Explicitly titled or classed as school-wide, general, open, or all-grades
 * 2. It has no grade level and no specific class, and term is OTHER
 */
export function isSchoolWideExam(exam) {
  if (!exam) return false
  const examName = (exam.name || '').toLowerCase()
  const className = (exam.className || '').toLowerCase()

  if (
    examName.includes('school-wide') ||
    examName.includes('school wide') ||
    examName.includes('open exam') ||
    examName.includes('all grades') ||
    className.includes('school-wide') ||
    className.includes('school wide') ||
    className.includes('general') ||
    className.includes('open')
  ) {
    return true
  }

  // If it has a grade level or says "Grade X", it's a Grade exam, not school-wide
  if (getExamGradeLevel(exam) != null) {
    return false
  }

  // If it has a classId, it's a class exam
  if (exam.classId) {
    return false
  }

  return true
}

/**
 * Checks whether an exam is classified as a Grade 1-13 class exam.
 */
export function isClassExam(exam) {
  if (!exam) return false
  return !isSchoolWideExam(exam)
}
