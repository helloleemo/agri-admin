import BASE_URL from '../base/apiBaseUrl'
import { API_ENDPOINT } from '../base/apiEndpoint'
import { GET, PATCH, createHeader, handleResponse } from '../base/apiMethods'

export interface HomePageContent {
  hero: {
    title: string
    description: string
    button_text: string
    button_link: string
    image_url: string
  }
  showcase_blocks: Array<{
    title: string
    description: string
    image_url: string
  }>
  flow: {
    title: string
    items: Array<{
      title: string
      description: string
    }>
  }
  bottom_cta: {
    title: string
    description: string
    button_text: string
    button_link: string
    image_url: string
  }
  mekarang: {
    banner_image_url: string
  }
  orders_query: {
    description: string
    image_url: string
  }
  footer: {
    title: string
    button_text: string
    description: string
    social_links: {
      facebook: string
      instagram: string
      youtube: string
    }
  }
}

export interface SiteContentResponse<T = Record<string, unknown>> {
  id: string
  page_key: string
  content_data: T
  created_at: string
  updated_at: string
}

export interface PageAssetUploadResponse {
  bucket: string
  object_path: string
  public_url: string
}

export const siteContentService = {
  getByPageKey: async <T = Record<string, unknown>>(pageKey: string) => {
    return GET<SiteContentResponse<T>>(BASE_URL, API_ENDPOINT.SITE_CONTENTS_BY_PAGE(pageKey))
  },
  updateByPageKey: async <T = Record<string, unknown>>(pageKey: string, contentData: T) => {
    return PATCH<SiteContentResponse<T>>(BASE_URL, API_ENDPOINT.SITE_CONTENTS_BY_PAGE(pageKey), {
      content_data: contentData,
    })
  },
  uploadAsset: async (pageKey: string, assetKey: string, file: File) => {
    const form = new FormData()
    form.append('asset_key', assetKey)
    form.append('file', file)

    const headers = createHeader()
    delete headers['Content-Type']

    const res = await fetch(`${BASE_URL}${API_ENDPOINT.SITE_CONTENTS_ASSETS(pageKey)}`, {
      method: 'POST',
      headers,
      body: form,
    })

    return handleResponse<PageAssetUploadResponse>(res)
  },
}
