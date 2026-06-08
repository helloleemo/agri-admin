import BASE_URL from '../base/apiBaseUrl'
import { API_ENDPOINT } from '../base/apiEndpoint'
import { DELETE, GET, PUT } from '../base/apiMethods'
import { createHeader, handleResponse } from '../base/apiMethods'
import type { CreateImagePayload, ImageResponse, ImageUpdatePayload } from '../types/image'

interface DeletedData {
  id: string
}

export const imagesService = {
  getListByProductId: async (productId: string) => {
    return GET<ImageResponse[]>(BASE_URL, API_ENDPOINT.IMAGES_PRODUCT_ID(productId))
  },
  create: async (payload: CreateImagePayload) => {
    const form = new FormData()
    form.append('product_id', payload.product_id)
    form.append('file', payload.file)
    form.append('is_primary', String(payload.is_primary ?? false))
    form.append('sort_order', String(payload.sort_order ?? 0))

    const headers = createHeader()
    delete headers['Content-Type']

    const res = await fetch(`${BASE_URL}/images`, {
      method: 'POST',
      headers,
      body: form,
    })

    return handleResponse<ImageResponse>(res)
  },
  update: async (imageId: string, payload: ImageUpdatePayload) => {
    return PUT<ImageResponse>(BASE_URL, API_ENDPOINT.IMAGES_ID(imageId), payload)
  },
  delete: async (imageId: string) => {
    return DELETE<DeletedData>(BASE_URL, API_ENDPOINT.IMAGES_ID(imageId))
  },
}
