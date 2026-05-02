import { api } from 'services'
import { ComponentDraft, ListData, ListFilter } from 'types'

export const getComponentDrafts = async (
  filter: ListFilter
): Promise<ListData<ComponentDraft>> => {
  const response = await api.get<ListData<ComponentDraft>>(
    `/component-drafts`,
    {
      params: {
        page: filter.page,
        limit: filter.limit,
        search: filter.search?.trim(),
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
      },
    }
  )

  return {
    results: response.data.results,
    total: response.data.total,
    meta: response.data.meta,
  }
}

export const getComponentDraftByCode = async (
  componentCode: string
): Promise<ComponentDraft> => {
  const response = await api.get<ComponentDraft>(
    `/component-drafts/${componentCode}`
  )

  return response.data
}

export const putComponentDraft = async (
  componentDraftId: string,
  data: Partial<ComponentDraft>
): Promise<ComponentDraft> => {
  const response = await api.put(`/component-drafts/${componentDraftId}`, {
    code: data.code,
    name: data.name,
    department: data.department,
    semester: data.semester,
    modality: data.modality,
    program: data.program,
    objective: data.objective,
    syllabus: data.syllabus,
    methodology: data.methodology,
    learningAssessment: data.learningAssessment,
    bibliography: data.bibliography,
    prerequeriments: data.prerequeriments,
    workload: {
      studentTheory: data.workload?.studentTheory,
      studentPractice: data.workload?.studentPractice,
      studentTheoryPractice: data.workload?.studentTheoryPractice,
      studentInternship: data.workload?.studentInternship,
      studentPracticeInternship: data.workload?.studentPracticeInternship,

      teacherTheory: data.workload?.teacherTheory,
      teacherPractice: data.workload?.teacherPractice,
      teacherTheoryPractice: data.workload?.teacherTheoryPractice,
      teacherInternship: data.workload?.teacherInternship,
      teacherPracticeInternship: data.workload?.teacherPracticeInternship,

      moduleTheory: data.workload?.moduleTheory,
      modulePractice: data.workload?.modulePractice,
      moduleTheoryPractice: data.workload?.moduleTheoryPractice,
      moduleInternship: data.workload?.moduleInternship,
      modulePracticeInternship: data.workload?.modulePracticeInternship,
    },
  })

  return response.data
}

export const approveComponentDraft = async (
  componentDraftId: string,
  data: { agreementDate: Date; agreementNumber: string }
) => {
  await api.post(`/component-drafts/${componentDraftId}/approve`, {
    agreementDate: data.agreementDate.toISOString(),
    agreementNumber: data.agreementNumber,
  })
}
