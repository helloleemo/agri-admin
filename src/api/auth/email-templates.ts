import BASE_URL from '../base/apiBaseUrl'
import { API_ENDPOINT } from '../base/apiEndpoint'
import { GET, PATCH } from '../base/apiMethods'

export interface AuthEmailTemplateResponse {
  template_type: number
  subject_template: string | null
  body_template: string | null
}

export interface AuthEmailTemplateUpdatePayload {
  subject_template: string | null
  body_template: string | null
}

export const authEmailTemplatesService = {
  getList: async () => {
    return GET<AuthEmailTemplateResponse[]>(BASE_URL, API_ENDPOINT.AUTH_EMAIL_TEMPLATES)
  },
  update: async (templateType: number, payload: AuthEmailTemplateUpdatePayload) => {
    return PATCH<AuthEmailTemplateResponse>(
      BASE_URL,
      API_ENDPOINT.AUTH_EMAIL_TEMPLATE_BY_TYPE(templateType),
      payload,
    )
  },
}
