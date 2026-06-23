import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { useEffect, useState } from 'react'
import { Alert, Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Paper, Stack, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { DeleteConfirmDialog } from '@/components/dialogs'
import {
  couponsService,
  type CouponResponse,
  type CouponCreatePayload,
  type CouponUpdatePayload,
} from '@/api'
import PageToolbar from '@/components/layout/PageToolbar'

const statusOptions = [
  { value: 1, label: '啟用', color: 'success' as const },
  { value: 2, label: '停用', color: 'warning' as const },
//   { value: 3, label: '刪除', color: 'default' as const },
]

const discountTypeOptions = [
  { value: 1, label: '固定金額', color: 'info' as const },
  { value: 2, label: '百分比', color: 'success' as const },
]

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-TW')
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(value)
}

interface CouponFormState {
  code: string
  name: string
  discount_type: 1 | 2
  discount_value: string
  min_order_amount: string
  max_discount_amount: string
  usage_limit: string
  starts_at: string
  ends_at: string
  status_code: number
}

const createEmptyForm = (): CouponFormState => ({
  code: '',
  name: '',
  discount_type: 1,
  discount_value: '',
  min_order_amount: '',
  max_discount_amount: '',
  usage_limit: '',
  starts_at: '',
  ends_at: '',
  status_code: 1,
})

const buildFormState = (coupon: CouponResponse): CouponFormState => ({
  code: coupon.code,
  name: coupon.name,
  discount_type: coupon.discount_type,
  discount_value: String(coupon.discount_value),
  min_order_amount: coupon.min_order_amount ? String(coupon.min_order_amount) : '',
  max_discount_amount: coupon.max_discount_amount ? String(coupon.max_discount_amount) : '',
  usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
  starts_at: coupon.starts_at ? coupon.starts_at.split('T')[0] : '',
  ends_at: coupon.ends_at ? coupon.ends_at.split('T')[0] : '',
  status_code: coupon.status_code,
})

const CouponsPage = () => {
  const [coupons, setCoupons] = useState<CouponResponse[]>([])
  const [keyword, setKeyword] = useState('')
  const [isOpenForm, setIsOpenForm] = useState(false)
  const [formState, setFormState] = useState<CouponFormState>(createEmptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // Load coupons
  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    try {
      setLoading(true)
      const data = await couponsService.list()
      setCoupons(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (coupon?: CouponResponse) => {
    if (coupon) {
      setFormState(buildFormState(coupon))
      setEditingId(coupon.id)
    } else {
      setFormState(createEmptyForm())
      setEditingId(null)
    }
    setIsOpenForm(true)
  }

  const handleCloseForm = () => {
    setIsOpenForm(false)
    setFormState(createEmptyForm())
    setEditingId(null)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const payload: CouponCreatePayload | CouponUpdatePayload = {
        name: formState.name.trim(),
        discount_type: formState.discount_type,
        discount_value: parseInt(formState.discount_value) || 0,
        min_order_amount: formState.min_order_amount ? parseInt(formState.min_order_amount) : null,
        max_discount_amount: formState.max_discount_amount ? parseInt(formState.max_discount_amount) : null,
        usage_limit: formState.usage_limit ? parseInt(formState.usage_limit) : null,
        starts_at: formState.starts_at ? new Date(formState.starts_at).toISOString() : null,
        ends_at: formState.ends_at ? new Date(formState.ends_at).toISOString() : null,
        status_code: formState.status_code,
      }

      if (editingId) {
        await couponsService.update(editingId, payload as CouponUpdatePayload)
      } else {
        const createPayload = payload as CouponCreatePayload
        createPayload.code = formState.code.trim()
        await couponsService.create(createPayload)
      }

      await loadCoupons()
      handleCloseForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    try {
      setLoading(true)
      await couponsService.delete(deleteTarget)
      await loadCoupons()
      setDeleteTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除失敗')
    } finally {
      setLoading(false)
    }
  }

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(keyword.toLowerCase()) ||
      coupon.name.toLowerCase().includes(keyword.toLowerCase()),
  )

  const columns: GridColDef[] = [
    { field: 'code', headerName: '優惠券代碼', width: 120 },
    { field: 'name', headerName: '名稱', width: 180 },
    {
      field: 'discount_type',
      headerName: '優惠類型',
      width: 100,
      renderCell: ({ value }) => {
        const option = discountTypeOptions.find((opt) => opt.value === value)
        return <Chip label={option?.label || '-'} color={option?.color} size="small" />
      },
    },
    {
      field: 'discount_value',
      headerName: '優惠值',
      width: 100,
      renderCell: ({ row }) => {
        const value = row.discount_value
        return row.discount_type === 1 ? formatCurrency(value) : `${value}%`
      },
    },
    {
      field: 'min_order_amount',
      headerName: '最低消費',
      width: 100,
      renderCell: ({ value }) => formatCurrency(value),
    },
    {
      field: 'max_discount_amount',
      headerName: '最高折扣',
      width: 100,
      renderCell: ({ value }) => formatCurrency(value),
    },
    {
      field: 'usage_limit',
      headerName: '使用次數上限',
      width: 120,
      renderCell: ({ value }) => value || '無限制',
    },
    {
      field: 'used_count',
      headerName: '已使用',
      width: 80,
    },
    {
      field: 'status_code',
      headerName: '狀態',
      width: 80,
      renderCell: ({ value }) => {
        const option = statusOptions.find((opt) => opt.value === value)
        return <Chip label={option?.label || '-'} color={option?.color} size="small" />
      },
    },
    { field: 'created_at', headerName: '建立時間', width: 180, renderCell: ({ value }) => formatDateTime(value) },
    {
      field: 'actions',
      headerName: '操作',
      width: 100,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5} sx={{ height: '100%', alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => handleOpenForm(row)}
            title="編輯"
          >
            <EditRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(row.id)}
            title="刪除"
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ]

  return (
    <Stack spacing={2}>
      <PageToolbar
        title="優惠券管理"
        keyword={keyword}
        onKeywordChange={setKeyword}
        onAdd={() => handleOpenForm()}
        addLabel="新增優惠券"
        onRefresh={() => void loadCoupons()}
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <DataGrid
          rows={filteredCoupons}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          sx={{ height: 600 }}
        />
      </Paper>

      {/* Form Dialog */}
      {isOpenForm && (
        <CouponFormDialog
          open={isOpenForm}
          onClose={handleCloseForm}
          formState={formState}
          onFormStateChange={setFormState}
          onSubmit={handleSubmit}
          loading={loading}
          isEditing={!!editingId}
          isCodeDisabled={!!editingId}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
          loading={loading}
        />
      )}
    </Stack>
  )
}

// Coupon Form Dialog Component
interface CouponFormDialogProps {
  open: boolean
  onClose: () => void
  formState: CouponFormState
  onFormStateChange: (state: CouponFormState) => void
  onSubmit: () => Promise<void>
  loading: boolean
  isEditing: boolean
  isCodeDisabled: boolean
}

function CouponFormDialog({
  open,
  onClose,
  formState,
  onFormStateChange,
  onSubmit,
  loading,
  isEditing,
  isCodeDisabled,
}: CouponFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? '編輯優惠券' : '新增優惠券'}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="優惠券代碼"
            value={formState.code}
            onChange={(e: any) => onFormStateChange({ ...formState, code: e.target.value })}
            disabled={isCodeDisabled}
            required
            fullWidth
          />
          <TextField
            label="名稱"
            value={formState.name}
            onChange={(e: any) => onFormStateChange({ ...formState, name: e.target.value })}
            required
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>優惠類型</InputLabel>
            <Select
              value={formState.discount_type}
              onChange={(e: any) => onFormStateChange({ ...formState, discount_type: e.target.value })}
              label="優惠類型"
            >
              <MenuItem value={1}>固定金額</MenuItem>
              <MenuItem value={2}>百分比</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label={formState.discount_type === 1 ? '優惠金額 (元)' : '優惠百分比 (%)'}
            type="number"
            value={formState.discount_value}
            onChange={(e: any) => onFormStateChange({ ...formState, discount_value: e.target.value })}
            slotProps={{ htmlInput: { min: 0 } }}
            required
            fullWidth
          />
          <TextField
            label="最低消費金額 (元)"
            type="number"
            value={formState.min_order_amount}
            onChange={(e: any) => onFormStateChange({ ...formState, min_order_amount: e.target.value })}
            slotProps={{ htmlInput: { min: 0 } }}
            fullWidth
          />
          <TextField
            label="最高折扣金額 (元)"
            type="number"
            value={formState.max_discount_amount}
            onChange={(e: any) => onFormStateChange({ ...formState, max_discount_amount: e.target.value })}
            slotProps={{ htmlInput: { min: 0 } }}
            fullWidth
          />
          <TextField
            label="使用次數上限"
            type="number"
            value={formState.usage_limit}
            onChange={(e: any) => onFormStateChange({ ...formState, usage_limit: e.target.value })}
            slotProps={{ htmlInput: { min: 1 } }}
            fullWidth
          />
          <TextField
            label="開始日期"
            type="date"
            value={formState.starts_at}
            onChange={(e: any) => onFormStateChange({ ...formState, starts_at: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            label="結束日期"
            type="date"
            value={formState.ends_at}
            onChange={(e: any) => onFormStateChange({ ...formState, ends_at: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>狀態</InputLabel>
            <Select
              value={formState.status_code}
              onChange={(e: any) => onFormStateChange({ ...formState, status_code: e.target.value })}
              label="狀態"
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={loading || !formState.code || !formState.name || !formState.discount_value}>
          {loading ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CouponsPage
