import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import { useEffect, useMemo, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { authEmailTemplatesService, ordersService } from '@/api'
import type { AuthEmailTemplateResponse, OrderStatusResponse } from '@/api'

const ORDER_STATUS_CODE = {
  ORDER_CREATED: 1,
  ORDER_CONFIRMED_AND_PENDING_PAYMENT: 2,
  PAID_AND_PREPARING: 3,
  SHIPPING: 4,
  DELIVERED: 5,
  CANCELED: 6,
  REFUNDED: 7,
  OTHER: 99,
} as const

const AUTH_TEMPLATE_TYPE = {
  REGISTRATION_VERIFICATION: 1,
} as const

const statusLabelMap: Record<number, string> = {
  [ORDER_STATUS_CODE.ORDER_CREATED]: '訂單成立',
  [ORDER_STATUS_CODE.ORDER_CONFIRMED_AND_PENDING_PAYMENT]: '確認訂單待付款',
  [ORDER_STATUS_CODE.PAID_AND_PREPARING]: '已付款備貨中',
  [ORDER_STATUS_CODE.SHIPPING]: '配送中',
  [ORDER_STATUS_CODE.DELIVERED]: '已送達',
  [ORDER_STATUS_CODE.CANCELED]: '訂單已取消',
  [ORDER_STATUS_CODE.REFUNDED]: '已退款',
  [ORDER_STATUS_CODE.OTHER]: '其他',
}

const statusOptions = Object.entries(statusLabelMap).map(([value, label]) => ({
  value: Number(value),
  label,
}))

const ORDER_TEMPLATE_FALLBACKS: Record<
  number,
  {
    customerSubject: string
    customerBody: string
    adminSubject: string
    adminBody: string
  }
> = {
  [ORDER_STATUS_CODE.ORDER_CREATED]: {
    customerSubject: 'Mekarang訂購通知！訂單 {order_no} 已建立',
    customerBody: '我們已收到您的訂單，待訂單確認後將發送繳費明細，請耐心等候。',
    adminSubject: '[Admin] 新訂單 {order_no}',
    adminBody: '系統收到新訂單，請確認後續處理流程。',
  },
  [ORDER_STATUS_CODE.ORDER_CONFIRMED_AND_PENDING_PAYMENT]: {
    customerSubject: 'Mekarang訂購通知！訂單 {order_no} 已確認，請完成付款',
    customerBody:
      '您的訂單已確認，後續將依流程安排出貨。\n繳費明細會包含訂單編號、收件人、聯絡信箱與總金額。\n請於 7 天內完成付款，逾期訂單將自動取消。',
    adminSubject: '[Admin] 訂單 {order_no} 已確認待付款',
    adminBody: '訂單目前待付款，請視需要追蹤付款狀況。',
  },
  [ORDER_STATUS_CODE.PAID_AND_PREPARING]: {
    customerSubject: '訂單 {order_no} 備貨中',
    customerBody: '我們已收到您的付款，訂單正在備貨中，完成後會通知您出貨。',
    adminSubject: '[Admin] 訂單 {order_no} 備貨中',
    adminBody: '訂單已完成付款並進入備貨流程。',
  },
  [ORDER_STATUS_CODE.SHIPPING]: {
    customerSubject: '訂單 {order_no} 已出貨',
    customerBody: '您的訂單已出貨，請留意收件。',
    adminSubject: '[Admin] 訂單 {order_no} 已出貨',
    adminBody: '訂單已出貨，請追蹤物流與送達狀態。',
  },
  [ORDER_STATUS_CODE.DELIVERED]: {
    customerSubject: '訂單 {order_no} 已送達',
    customerBody: '您的訂單已送達，感謝您的訂購。',
    adminSubject: '[Admin] 訂單 {order_no} 已送達',
    adminBody: '訂單已送達，可視需要進行結案追蹤。',
  },
  [ORDER_STATUS_CODE.CANCELED]: {
    customerSubject: '訂單 {order_no} 已取消',
    customerBody: '您的訂單已取消；若這不是您預期的結果，請聯繫客服。',
    adminSubject: '[Admin] 訂單 {order_no} 已取消',
    adminBody: '訂單已取消，請確認是否需要後續退款或庫存調整。',
  },
  [ORDER_STATUS_CODE.REFUNDED]: {
    customerSubject: '訂單 {order_no} 已退款',
    customerBody:
      '您的退款已處理完成，款項將依原付款方式返還，請留意帳戶入帳。',
    adminSubject: '[Admin] 訂單 {order_no} 已退款',
    adminBody: '訂單退款已處理，請確認退款金額與方式是否正確。',
  },
  [ORDER_STATUS_CODE.OTHER]: {
    customerSubject: '訂單 {order_no} 狀態更新',
    customerBody: '您的訂單狀態已更新，如有疑問請聯繫客服。',
    adminSubject: '[Admin] 訂單 {order_no} 狀態更新（其他）',
    adminBody: '訂單狀態已被標記為其他，請確認處理情況。',
  },
}

const REGISTRATION_FALLBACK = {
  subject: '農產品交易平台 - 驗證您的電子郵件',
  body:
    '歡迎使用農產品交易平台。\n\n'
    + '請通過打開此連結來驗證您的電子郵件:\n{verification_link}\n\n'
    + '如果您無法點擊連結，請將以上網址複製並貼到瀏覽器中。\n\n'
    + '如果您沒有註冊過農產品交易平台，請忽略這封郵件。\n\n'
    + '若連結失效，您可以在登入頁面點擊「重新發送驗證郵件」來獲取新的驗證連結。\n\n'
    + '此連結在 {expires_minutes} 分鐘後過期。',
}

const EmailTemplatesPage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [orderStatusTemplates, setOrderStatusTemplates] = useState<OrderStatusResponse[]>([])
  const [templateStatusCode, setTemplateStatusCode] = useState<number>(ORDER_STATUS_CODE.ORDER_CREATED)
  const [templateCustomerSubject, setTemplateCustomerSubject] = useState('')
  const [templateCustomerBody, setTemplateCustomerBody] = useState('')
  const [templateAdminSubject, setTemplateAdminSubject] = useState('')
  const [templateAdminBody, setTemplateAdminBody] = useState('')
  const [orderTemplateSaving, setOrderTemplateSaving] = useState(false)

  const [authTemplates, setAuthTemplates] = useState<AuthEmailTemplateResponse[]>([])
  const [registrationSubject, setRegistrationSubject] = useState('')
  const [registrationBody, setRegistrationBody] = useState('')
  const [authTemplateSaving, setAuthTemplateSaving] = useState(false)

  const selectedOrderFallback =
    ORDER_TEMPLATE_FALLBACKS[templateStatusCode] ?? ORDER_TEMPLATE_FALLBACKS[ORDER_STATUS_CODE.OTHER]

  const registrationTemplate = useMemo(
    () => authTemplates.find((item) => item.template_type === AUTH_TEMPLATE_TYPE.REGISTRATION_VERIFICATION),
    [authTemplates],
  )

  const applyOrderTemplateFromCode = (code: number, templates: OrderStatusResponse[]) => {
    const matched = templates.find((status) => status.code === code)
    if (!matched) {
      return
    }

    setTemplateStatusCode(code)
    setTemplateCustomerSubject(matched.customer_email_subject_template ?? '')
    setTemplateCustomerBody(matched.customer_email_body_template ?? '')
    setTemplateAdminSubject(matched.admin_email_subject_template ?? '')
    setTemplateAdminBody(matched.admin_email_body_template ?? '')
  }

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError('')
      const [orderStatuses, authEmailTemplates] = await Promise.all([
        ordersService.listOrderStatuses(),
        authEmailTemplatesService.getList(),
      ])

      setOrderStatusTemplates(orderStatuses)
      const firstOrderTemplate =
        orderStatuses.find((status) => status.code === templateStatusCode) ?? orderStatuses[0]
      if (firstOrderTemplate) {
        applyOrderTemplateFromCode(firstOrderTemplate.code, orderStatuses)
      }

      setAuthTemplates(authEmailTemplates)
      const registration = authEmailTemplates.find(
        (item) => item.template_type === AUTH_TEMPLATE_TYPE.REGISTRATION_VERIFICATION,
      )
      setRegistrationSubject(registration?.subject_template ?? '')
      setRegistrationBody(registration?.body_template ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入 Email 範本失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTemplates()
  }, [])

  const handleSaveOrderTemplate = async () => {
    try {
      setOrderTemplateSaving(true)
      setError('')
      const updated = await ordersService.updateOrderStatusEmailTemplate(templateStatusCode, {
        customer_email_subject_template: templateCustomerSubject.trim() || null,
        customer_email_body_template: templateCustomerBody.trim() || null,
        admin_email_subject_template: templateAdminSubject.trim() || null,
        admin_email_body_template: templateAdminBody.trim() || null,
      })

      setOrderStatusTemplates((prev) =>
        prev.map((status) => (status.code === updated.code ? updated : status)),
      )
      setNotice('訂單狀態 Email 範本已儲存')
    } catch (err) {
      setError(err instanceof Error ? err.message : '儲存訂單狀態 Email 範本失敗')
    } finally {
      setOrderTemplateSaving(false)
    }
  }

  const handleSaveRegistrationTemplate = async () => {
    try {
      setAuthTemplateSaving(true)
      setError('')
      const updated = await authEmailTemplatesService.update(
        AUTH_TEMPLATE_TYPE.REGISTRATION_VERIFICATION,
        {
          subject_template: registrationSubject.trim() || null,
          body_template: registrationBody.trim() || null,
        },
      )

      setAuthTemplates((prev) => {
        const found = prev.some((item) => item.template_type === updated.template_type)
        if (found) {
          return prev.map((item) => (item.template_type === updated.template_type ? updated : item))
        }
        return [...prev, updated]
      })
      setNotice('註冊驗證信 Email 範本已儲存')
    } catch (err) {
      setError(err instanceof Error ? err.message : '儲存註冊驗證信 Email 範本失敗')
    } finally {
      setAuthTemplateSaving(false)
    }
  }

  return (
    <Paper sx={{ p: 2.4 }}>
      <Stack spacing={2}>
        <Box>
          <Stack direction="row" spacing={1} sx={{ mb: 0.6, alignItems: 'center' }}>
            <EmailRoundedIcon color="primary" />
            <Typography variant="h5">Email 範本設定</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            設定訂單狀態通知信與註冊驗證信範本。欄位留空時，系統會改用預設範本。
          </Typography>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {notice ? (
          <Alert severity="success" onClose={() => setNotice('')}>
            {notice}
          </Alert>
        ) : null}

        {loading ? (
          <Stack sx={{ py: 4, alignItems: 'center' }}>
            <CircularProgress size={30} />
          </Stack>
        ) : null}

        {!loading ? (
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 1.8 }}>
              <Stack spacing={1.4}>
                <Typography variant="h6">訂單狀態通知信</Typography>

                <TextField
                  label="訂單狀態"
                  select
                  value={templateStatusCode}
                  onChange={(event) => applyOrderTemplateFromCode(Number(event.target.value), orderStatusTemplates)}
                  fullWidth
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Typography variant="body2" color="text.secondary">
                  可用變數：{'{order_no}'}, {'{status_name}'}, {'{status_code}'}, {'{customer_name}'}, {'{customer_email}'}, {'{orderer_name}'}, {'{orderer_email}'}, {'{orderer_phone}'}, {'{address}'}, {'{coupon_code}'}, {'{delivery_method_label}'}, {'{payment_method_label}'}, {'{subtotal_amount}'}, {'{discount_amount}'}, {'{shipping_fee}'}, {'{total_amount}'}, {'{bank_transfer_last5}'}, {'{items_count}'}, {'{items_summary}'}, {'{created_at}'}, {'{updated_at}'}
                </Typography>

                <TextField
                  label="顧客信件主旨"
                  fullWidth
                  value={templateCustomerSubject}
                  onChange={(event) => setTemplateCustomerSubject(event.target.value)}
                />
                <TextField
                  label="顧客信件內容"
                  multiline
                  minRows={5}
                  fullWidth
                  value={templateCustomerBody}
                  onChange={(event) => setTemplateCustomerBody(event.target.value)}
                />
                <TextField
                  label="管理員信件主旨"
                  fullWidth
                  value={templateAdminSubject}
                  onChange={(event) => setTemplateAdminSubject(event.target.value)}
                />
                <TextField
                  label="管理員信件內容"
                  multiline
                  minRows={5}
                  fullWidth
                  value={templateAdminBody}
                  onChange={(event) => setTemplateAdminBody(event.target.value)}
                />

                <Accordion disableGutters sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                    <Typography variant="subtitle2">
                      系統預設（{statusLabelMap[templateStatusCode] || `狀態 ${templateStatusCode}`}）
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: 'grey.50' }}>
                    <Typography variant="caption" color="text.secondary">
                      顧客主旨
                    </Typography>
                    <Typography sx={{ mb: 1.2 }}>{selectedOrderFallback.customerSubject}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      顧客內容
                    </Typography>
                    <Typography sx={{ mb: 1.2, whiteSpace: 'pre-wrap' }}>
                      {selectedOrderFallback.customerBody}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      管理員主旨
                    </Typography>
                    <Typography sx={{ mb: 1.2 }}>{selectedOrderFallback.adminSubject}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      管理員內容
                    </Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selectedOrderFallback.adminBody}</Typography>
                  </AccordionDetails>
                </Accordion>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    onClick={() => void handleSaveOrderTemplate()}
                    disabled={orderTemplateSaving}
                  >
                    {orderTemplateSaving ? '儲存中...' : '儲存訂單狀態範本'}
                  </Button>
                </Box>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.8 }}>
              <Stack spacing={1.4}>
                <Typography variant="h6">註冊驗證信範本</Typography>
                <Typography variant="body2" color="text.secondary">
                  可用變數：{'{verification_link}'}, {'{expires_minutes}'}, {'{token}'}, {'{email}'}
                </Typography>

                <TextField
                  label="信件主旨"
                  fullWidth
                  value={registrationSubject}
                  onChange={(event) => setRegistrationSubject(event.target.value)}
                />
                <TextField
                  label="信件內容"
                  multiline
                  minRows={8}
                  fullWidth
                  value={registrationBody}
                  onChange={(event) => setRegistrationBody(event.target.value)}
                />

                <Accordion disableGutters sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                    <Typography variant="subtitle2">系統預設（註冊驗證信）</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: 'grey.50' }}>
                    <Typography variant="caption" color="text.secondary">
                      主旨
                    </Typography>
                    <Typography sx={{ mb: 1.2 }}>{REGISTRATION_FALLBACK.subject}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      內容
                    </Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{REGISTRATION_FALLBACK.body}</Typography>
                  </AccordionDetails>
                </Accordion>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    onClick={() => void handleSaveRegistrationTemplate()}
                    disabled={authTemplateSaving}
                  >
                    {authTemplateSaving ? '儲存中...' : '儲存註冊驗證範本'}
                  </Button>
                </Box>

                {registrationTemplate && registrationTemplate.subject_template === null && registrationTemplate.body_template === null ? (
                  <Typography variant="caption" color="text.secondary">
                    目前此範本為空，寄信時會使用系統預設內容。
                  </Typography>
                ) : null}
              </Stack>
            </Paper>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  )
}

export default EmailTemplatesPage
