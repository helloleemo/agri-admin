import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import type { RoleCode } from '@/api/types/shared'
import type { OrderResponse } from '@/api/types/order'
import type { UserResponse } from '@/api/types/user'

export type UserFormState = {
  email: string
  user_name: string
  password: string
  role_code: RoleCode
}

type UserFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  actionError: string
  actionLoading: boolean
  verificationLoading: boolean
  formState: UserFormState
  selectedUserVerified: boolean
  sendVerificationOnCreate: boolean
  markVerifiedOnCreate: boolean
  onClose: () => void
  onSubmit: () => void
  onUserNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onRoleChange: (value: RoleCode) => void
  onToggleMarkVerifiedOnCreate: (checked: boolean) => void
  onToggleSendVerificationOnCreate: (checked: boolean) => void
  onAdminVerify: () => void
  onResendVerification: () => void
}

export const UserFormDialog = ({
  open,
  mode,
  actionError,
  actionLoading,
  verificationLoading,
  formState,
  selectedUserVerified,
  sendVerificationOnCreate,
  markVerifiedOnCreate,
  onClose,
  onSubmit,
  onUserNameChange,
  onEmailChange,
  onPasswordChange,
  onRoleChange,
  onToggleMarkVerifiedOnCreate,
  onToggleSendVerificationOnCreate,
  onAdminVerify,
  onResendVerification,
}: UserFormDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'create' ? '新增使用者' : '編輯使用者'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {actionError ? <Alert severity="error">{actionError}</Alert> : null}
          <TextField label="姓名" value={formState.user_name} onChange={(event) => onUserNameChange(event.target.value)} fullWidth required />
          <TextField label="Email" type="email" value={formState.email} onChange={(event) => onEmailChange(event.target.value)} fullWidth required />
          <TextField
            label={mode === 'create' ? '密碼' : '新密碼（選填）'}
            type="password"
            value={formState.password}
            onChange={(event) => onPasswordChange(event.target.value)}
            fullWidth
            required={mode === 'create'}
            helperText={mode === 'edit' ? '留空代表不更新密碼' : undefined}
          />
          <TextField
            select
            label="角色"
            value={formState.role_code}
            onChange={(event) => onRoleChange(Number(event.target.value) as RoleCode)}
            fullWidth
          >
            <MenuItem value={1}>管理員</MenuItem>
            <MenuItem value={2}>員工</MenuItem>
            <MenuItem value={3}>會員</MenuItem>
          </TextField>

          {mode === 'create' ? (
            <Stack spacing={0.5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={markVerifiedOnCreate}
                    onChange={(event) => onToggleMarkVerifiedOnCreate(event.target.checked)}
                  />
                }
                label="直接驗證（無需寄驗證信）"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={sendVerificationOnCreate}
                    disabled={markVerifiedOnCreate}
                    onChange={(event) => onToggleSendVerificationOnCreate(event.target.checked)}
                  />
                }
                label="建立後寄送驗證信"
              />
            </Stack>
          ) : null}

          {mode === 'edit' ? (
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="success"
                onClick={onAdminVerify}
                disabled={selectedUserVerified || verificationLoading || actionLoading}
              >
                {verificationLoading ? '處理中...' : selectedUserVerified ? '已驗證' : '管理員直接驗證'}
              </Button>
              <Button variant="outlined" onClick={onResendVerification} disabled={verificationLoading || actionLoading}>
                {verificationLoading ? '寄送中...' : '重寄驗證信'}
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={onSubmit} variant="contained" disabled={actionLoading}>
          {actionLoading ? '儲存中...' : '儲存'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

type UserViewDialogProps = {
  open: boolean
  user: UserResponse | null
  roleLabelMap: Record<number, string>
  statusLabelMap: Record<number, string>
  formatDateTime: (value: string) => string
  onOpenOrderDetail: (orderId: string) => void
  onClose: () => void
}

export const UserViewDialog = ({
  open,
  user,
  roleLabelMap,
  statusLabelMap,
  formatDateTime,
  onOpenOrderDetail,
  onClose,
}: UserViewDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>使用者詳情</DialogTitle>
      <DialogContent dividers>
        {user ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Avatar>{user.user_name.slice(0, 1)}</Avatar>
              <Box>
                <Typography variant="h6">{user.user_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  角色
                </Typography>
                <Typography>{roleLabelMap[user.role_code] || `角色 ${user.role_code}`}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  狀態
                </Typography>
                <Typography>{statusLabelMap[user.status_code] || `狀態 ${user.status_code}`}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Email 驗證
                </Typography>
                <Typography>{user.email_verified_at ? '已驗證' : '未驗證'}</Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  建立時間
                </Typography>
                <Typography>{formatDateTime(user.created_at)}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  更新時間
                </Typography>
                <Typography>{formatDateTime(user.updated_at)}</Typography>
              </Box>
            </Stack>

            <Box>
              <Typography variant="caption" color="text.secondary">
                訂單數量
              </Typography>
              <Typography>{user.orders.length}</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {user.orders.length ? (
                  user.orders.map((order) => (
                    <Box key={order.order_id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        訂單編號：{order.order_no}
                      </Typography>
                      <Button size="small" variant="outlined" onClick={() => onOpenOrderDetail(order.order_id)}>
                        查看訂單詳情
                      </Button>
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">目前沒有訂單資料</Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>關閉</Button>
      </DialogActions>
    </Dialog>
  )
}

type UserOrderDetailDialogProps = {
  open: boolean
  loading: boolean
  error: string
  order: OrderResponse | null
  formatDateTime: (value: string) => string
  currencyFormatter: Intl.NumberFormat
  onClose: () => void
}

export const UserOrderDetailDialog = ({
  open,
  loading,
  error,
  order,
  formatDateTime,
  currencyFormatter,
  onClose,
}: UserOrderDetailDialogProps) => {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>訂單詳情</DialogTitle>
      <DialogContent dividers>
        {loading ? <Typography>載入中...</Typography> : null}
        {!loading && error ? <Alert severity="error">{error}</Alert> : null}

        {!loading && !error && order ? (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  訂單編號
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{order.order_no || order.id.slice(0, 8)}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  訂單狀態
                </Typography>
                <Typography>{order.order_status_name || `狀態 ${order.order_status_code}`}</Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  客戶姓名
                </Typography>
                <Typography>{order.customer_name || order.user_name || '-'}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  客戶 Email
                </Typography>
                <Typography>{order.customer_email}</Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  建立時間
                </Typography>
                <Typography>{formatDateTime(order.created_at)}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  更新時間
                </Typography>
                <Typography>{formatDateTime(order.updated_at)}</Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  小計
                </Typography>
                <Typography>{currencyFormatter.format(order.subtotal_amount)}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  折扣
                </Typography>
                <Typography>{currencyFormatter.format(order.discount_amount)}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  運費
                </Typography>
                <Typography>{currencyFormatter.format(order.shipping_fee)}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  總計
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{currencyFormatter.format(order.total_amount)}</Typography>
              </Box>
            </Stack>

            <Box>
              <Typography variant="caption" color="text.secondary">
                匯款後五碼
              </Typography>
              <Typography>{order.bank_transfer_last5 || '-'}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                訂單品項
              </Typography>
              <Stack spacing={1}>
                {order.items.length ? (
                  order.items.map((item) => (
                    <Box key={item.id} sx={{ p: 1.2, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                      <Typography sx={{ fontWeight: 700 }}>{item.product_name || item.product_id}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        單位：{item.unit || '-'}，數量：{item.quantity}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">此訂單目前沒有品項</Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>關閉</Button>
      </DialogActions>
    </Dialog>
  )
}
