import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { ordersService } from '@/api'
import type { OrderResponse, OrderUpdatePayload } from '@/api'
import { ConfirmActionDialog, DeleteConfirmDialog } from '@/components/dialogs'

type EditableOrderItem = {
  id: string
  product_id: string
  unit_id: string | null
  unit: string
  unit_price: number
  quantity: string
  product_name: string | null
}

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

const statusColorMap: Record<
  number,
  'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
> = {
  [ORDER_STATUS_CODE.ORDER_CREATED]: 'primary',
  [ORDER_STATUS_CODE.ORDER_CONFIRMED_AND_PENDING_PAYMENT]: 'warning',
  [ORDER_STATUS_CODE.PAID_AND_PREPARING]: 'info',
  [ORDER_STATUS_CODE.SHIPPING]: 'secondary',
  [ORDER_STATUS_CODE.DELIVERED]: 'success',
  [ORDER_STATUS_CODE.CANCELED]: 'error',
  [ORDER_STATUS_CODE.REFUNDED]: 'warning',
  [ORDER_STATUS_CODE.OTHER]: 'default',
}

const currencyFormatter = new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
})

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-TW')
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | number>('all')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [editingOrder, setEditingOrder] = useState<OrderResponse | null>(null)
  const [viewingOrder, setViewingOrder] = useState<OrderResponse | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [nextStatusCode, setNextStatusCode] = useState<number>(ORDER_STATUS_CODE.ORDER_CREATED)
  const [editingDiscount, setEditingDiscount] = useState('0')
  const [editingShippingFee, setEditingShippingFee] = useState('0')
  const [editingManualAdjustment, setEditingManualAdjustment] = useState('0')
  const [editingItems, setEditingItems] = useState<EditableOrderItem[]>([])
  const [saveLoading, setSaveLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OrderResponse | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await ordersService.getList({ skip: 0, limit: 100 })
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入訂單資料失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadOrders = async () => {
      await fetchOrders()
    }

    void loadOrders()
  }, [refreshVersion])

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [orders],
  )

  const statusCounts = useMemo(() => {
    const counts = new Map<number, number>()
    sortedOrders.forEach((order) => {
      counts.set(order.order_status_code, (counts.get(order.order_status_code) ?? 0) + 1)
    })
    return counts
  }, [sortedOrders])

  const filteredOrders = useMemo(() => {
    const sourceOrders =
      statusFilter === 'all'
        ? sortedOrders
        : sortedOrders.filter((order) => order.order_status_code === statusFilter)

    const normalizedKeyword = keyword.trim().toLowerCase()
    if (!normalizedKeyword) {
      return sourceOrders
    }

    return sourceOrders.filter((order) => {
      const searchableText = [
        order.order_no,
        order.customer_name,
        order.user_name,
        order.customer_email,
        order.orderer_name,
        order.order_status_name,
      ]
        .filter((value): value is string => Boolean(value))
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedKeyword)
    })
  }, [keyword, sortedOrders, statusFilter])

  const openEditDialog = (order: OrderResponse) => {
    setEditingOrder(order)
    setNextStatusCode(order.order_status_code)
    setEditingDiscount(String(order.discount_amount))
    setEditingShippingFee(String(order.shipping_fee ?? 0))
    setEditingManualAdjustment(String(order.manual_adjustment_amount ?? 0))
    setEditingItems(
      order.items.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        unit_id: item.unit_id ?? null,
        unit: item.unit ?? '',
        unit_price: item.unit_price ?? 0,
        quantity: String(item.quantity),
        product_name: item.product_name ?? null,
      })),
    )
    setAdminNote(order.admin_note ?? '')
    setActionError('')
  }

  const closeEditDialog = () => {
    setEditingOrder(null)
    setActionError('')
    setAdminNote('')
    setEditingManualAdjustment('0')
    setEditingItems([])
    setConfirmOpen(false)
    setSaveLoading(false)
  }

  const openViewDialog = async (orderId: string) => {
    setViewOpen(true)
    setViewLoading(true)
    setViewError('')

    try {
      const data = await ordersService.getById(orderId)
      setViewingOrder(data)
    } catch (err) {
      setViewingOrder(null)
      setViewError(err instanceof Error ? err.message : '載入訂單詳細資訊失敗')
    } finally {
      setViewLoading(false)
    }
  }

  const closeViewDialog = () => {
    setViewOpen(false)
    setViewingOrder(null)
    setViewError('')
  }

  const statusChanged = Boolean(editingOrder) && nextStatusCode !== (editingOrder?.order_status_code ?? nextStatusCode)

  const requestSaveOrder = () => {
    if (!editingOrder) {
      return
    }

    if (statusChanged) {
      setConfirmOpen(true)
    } else {
      void handleSaveOrder()
    }
  }

  const parseNonNegativeInt = (value: string, label: string): number => {
    const normalized = value.trim()
    if (!normalized) {
      throw new Error(`${label} 不能為空`)
    }

    const parsed = Number(normalized)
    if (!Number.isInteger(parsed) || parsed < 0) {
      throw new Error(`${label} 需為 0 或正整數`)
    }

    return parsed
  }

  const parseInteger = (value: string, label: string): number => {
    const normalized = value.trim()
    if (!normalized) {
      throw new Error(`${label} 不能為空`)
    }

    const parsed = Number(normalized)
    if (!Number.isInteger(parsed)) {
      throw new Error(`${label} 需為整數`)
    }

    return parsed
  }

  const editingSubtotal = useMemo(
    () =>
      editingItems.reduce((sum, item) => {
        const quantity = Number(item.quantity)
        if (!Number.isInteger(quantity) || quantity < 1) {
          return sum
        }
        return sum + item.unit_price * quantity
      }, 0),
    [editingItems],
  )

  const editingTotal = useMemo(() => {
    const discount = Number(editingDiscount)
    const shippingFee = Number(editingShippingFee)
    const manualAdjustment = Number(editingManualAdjustment)

    if (!Number.isFinite(discount) || !Number.isFinite(shippingFee) || !Number.isFinite(manualAdjustment)) {
      return 0
    }

    return Math.max(0, editingSubtotal - discount + shippingFee + manualAdjustment)
  }, [editingDiscount, editingManualAdjustment, editingShippingFee, editingSubtotal])

  const handleItemChange = (index: number, key: 'quantity', value: string) => {
    setEditingItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item
        }
        return { ...item, [key]: value }
      }),
    )
  }

  const handleSaveOrder = async () => {
    if (!editingOrder) {
      return
    }

    try {
      setSaveLoading(true)
      setActionError('')

      const discountAmount = parseNonNegativeInt(editingDiscount, '折扣')
      const shippingFee = parseNonNegativeInt(editingShippingFee, '運費')
      const manualAdjustmentAmount = parseInteger(editingManualAdjustment, '人工調整金額')

      if (!editingItems.length) {
        throw new Error('訂單至少需要 1 筆品項')
      }

      const items = editingItems.map((item, index) => {
        const unit = item.unit.trim()
        if (!unit) {
          throw new Error(`第 ${index + 1} 筆品項的單位不可為空`)
        }

        const quantity = Number(item.quantity)
        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new Error(`第 ${index + 1} 筆品項數量需為正整數`)
        }

        return {
          id: item.id,
          product_id: item.product_id,
          unit_id: item.unit_id?.trim() ? item.unit_id.trim() : null,
          unit,
          quantity,
        }
      })

      const payload: OrderUpdatePayload = {
        order_status_code: nextStatusCode,
        discount_amount: discountAmount,
        shipping_fee: shippingFee,
        manual_adjustment_amount: manualAdjustmentAmount,
        items,
      }

      const updatedOrder = await ordersService.update(editingOrder.id, payload)
      const nextNote = adminNote.trim() || null
      const currentNote = editingOrder.admin_note ?? null
      if (nextNote !== currentNote) {
        await ordersService.updateAdminNote(editingOrder.id, nextNote)
      }

      setEditingOrder(updatedOrder)
      setNotice('訂單已更新')
      setRefreshVersion((prev) => prev + 1)
      closeEditDialog()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '儲存訂單失敗')
      setConfirmOpen(false)
    } finally {
      setSaveLoading(false)
    }
  }


  const handleDeleteOrder = async () => {    if (!deleteTarget) {
      return
    }

    try {
      setActionLoading(true)
      setActionError('')
      await ordersService.delete(deleteTarget.id)
      setNotice('訂單已刪除')
      setDeleteTarget(null)
      setRefreshVersion((prev) => prev + 1)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '刪除訂單失敗')
    } finally {
      setActionLoading(false)
    }
  }

  const columns: GridColDef<OrderResponse>[] = [
    {
      field: 'order_no',
      headerName: '訂單編號',
      minWidth: 160,
      valueGetter: (_, row) => row.order_no || row.id.slice(0, 8),
    },
    {
      field: 'customer_name',
      headerName: '客戶',
      minWidth: 150,
      valueGetter: (_, row) => row.customer_name || row.user_name || '-',
    },
    {
      field: 'customer_email',
      headerName: 'Email',
      minWidth: 220,
      flex: 1,
      valueGetter: (_, row) => row.customer_email || '-',
    },
    {
      field: 'total_amount',
      headerName: '總金額',
      minWidth: 130,
      valueGetter: (_, row) => currencyFormatter.format(row.total_amount),
    },
    {
      field: 'item_count',
      headerName: '商品數',
      minWidth: 100,
      valueGetter: (_, row) => row.items.length,
    },
    {
      field: 'order_status_code',
      headerName: '訂單狀態',
      minWidth: 140,
      renderCell: (params) => (
        <Chip
          label={params.row.order_status_name || statusLabelMap[params.row.order_status_code] || `狀態 ${params.row.order_status_code}`}
          size="small"
          color={statusColorMap[params.row.order_status_code] || 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'bank_transfer_last5',
      headerName: '匯款後五碼',
      minWidth: 120,
      valueGetter: (_, row) => row.bank_transfer_last5 || '-',
    },
    {
      field: 'admin_note',
      headerName: '備註',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'center',
      headerAlign: 'center',
      width: 84,
      renderCell: (params) => {
        const note = params.row.admin_note?.trim() ?? ''
        const hasNote = Boolean(note)

        return (
          <Tooltip title={hasNote ? note : ''} arrow enterDelay={300}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <StickyNote2OutlinedIcon
                fontSize="small"
                sx={{ color: hasNote ? 'warning.main' : 'text.disabled' }}
              />
            </Box>
          </Tooltip>
        )
      },
    },
    {
      field: 'created_at',
      headerName: '建立時間',
      minWidth: 180,
      valueGetter: (_, row) => formatDateTime(row.created_at),
    },
    {
      field: 'updated_at',
      headerName: '最後更新時間',
      minWidth: 180,
      valueGetter: (_, row) => formatDateTime(row.updated_at),
    },
    {
      field: 'actions',
      headerName: '操作',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      minWidth: 170,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} sx={{ height: '100%', alignItems: 'center' }}>
          <IconButton size="small" color="primary" onClick={() => void openViewDialog(params.row.id)}>
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="primary" onClick={() => openEditDialog(params.row)}>
            <EditRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteTarget(params.row)}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    }
  ]

  const currentStatusLabel =
    editingOrder?.order_status_name || (editingOrder ? statusLabelMap[editingOrder.order_status_code] : '')
  const nextStatusLabel = statusLabelMap[nextStatusCode] || `狀態 ${nextStatusCode}`

  return (
    <Paper sx={{ p: 2.4 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ mb: 2.4, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}
      >
        <Box>
          <Stack direction="row" spacing={1} sx={{ mb: 0.6, alignItems: 'center' }}>
            <LocalShippingRoundedIcon color="primary" />
            <Typography variant="h5">訂單管理</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            查詢訂單資訊並管理訂單狀態流程。
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
          <TextField
            size="small"
            placeholder="搜尋訂單編號、客戶或 Email"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            slotProps={{
              input: {
                startAdornment: <SearchRoundedIcon fontSize="small" />,
              },
            }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => setRefreshVersion((prev) => prev + 1)}
          >
            重新整理
          </Button>
        </Stack>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert> : null}

      {notice ? (
        <Alert severity="success" sx={{ mb: 1.5 }} onClose={() => setNotice('')}>
          {notice}
        </Alert>
      ) : null}

      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
        <Chip
          label={`全部 (${sortedOrders.length})`}
          clickable
          color={statusFilter === 'all' ? 'primary' : 'default'}
          variant={statusFilter === 'all' ? 'filled' : 'outlined'}
          onClick={() => setStatusFilter('all')}
        />
        {statusOptions.map((option) => {
          const selected = statusFilter === option.value
          const count = statusCounts.get(option.value) ?? 0

          return (
            <Chip
              key={option.value}
              label={`${option.label} (${count})`}
              clickable
              color={selected ? statusColorMap[option.value] || 'default' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              onClick={() => setStatusFilter(option.value)}
            />
          )
        })}
      </Stack>

      <DataGrid
        autoHeight
        rows={filteredOrders}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'grey.50',
          },
          '& .MuiDataGrid-row:hover': {
            bgcolor: 'rgba(31, 109, 87, 0.04)',
          },
        }}
      />

      <Dialog open={Boolean(editingOrder)} onClose={saveLoading ? undefined : closeEditDialog} fullWidth maxWidth="md">
        <DialogTitle>編輯訂單狀態</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              訂單編號：{editingOrder?.order_no || editingOrder?.id.slice(0, 8)}
            </Typography>
            <TextField
              label="訂單狀態"
              select
              value={nextStatusCode}
              onChange={(event) => setNextStatusCode(Number(event.target.value))}
              fullWidth
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="管理員備注"
              multiline
              minRows={3}
              maxRows={6}
              fullWidth
              placeholder="輸入僅管理員可見的備注..."
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
            />
            <Typography variant="body2" color="text.secondary">
              訂單項目調整（僅可編輯數量）
            </Typography>
            <Stack spacing={1.2}>
              {editingItems.map((item, index) => (
                <Paper key={`${item.product_id}-${index}`} variant="outlined" sx={{ p: 1.4 }}>
                  <Stack spacing={1.1}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {item.product_name || item.product_id}
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                      <TextField
                        label="單位"
                        fullWidth
                        value={item.unit}
                        disabled
                      />
                      <TextField
                        label="數量"
                        type="number"
                        fullWidth
                        value={item.quantity}
                        onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
                        slotProps={{ htmlInput: { min: 1, step: 1 } }}
                      />
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
            <Typography variant="subtitle2" sx={{ pt: 1 }}>
              訂單金額與項目調整（管理員）
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
              <TextField
                label="商品小計"
                type="number"
                fullWidth
                value={editingSubtotal}
                disabled
                slotProps={{ input: { readOnly: true }, htmlInput: { readOnly: true } }}
                helperText="依訂單品項與數量自動重算"
              />
              <TextField
                label="折扣"
                type="number"
                fullWidth
                value={editingDiscount}
                onChange={(event) => setEditingDiscount(event.target.value)}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
              <TextField
                label="運費"
                type="number"
                fullWidth
                value={editingShippingFee}
                onChange={(event) => setEditingShippingFee(event.target.value)}
              />
              <TextField
                label="人工調整金額"
                type="number"
                fullWidth
                value={editingManualAdjustment}
                onChange={(event) => setEditingManualAdjustment(event.target.value)}
                helperText="可輸入正數或負數，例如補差額或折讓"
              />
            </Stack>

            <TextField
              label="總計"
              type="number"
              fullWidth
              value={editingTotal}
              disabled
              slotProps={{ input: { readOnly: true }, htmlInput: { readOnly: true } }}
              helperText="依 小計 - 折扣 + 運費 + 人工調整金額 自動計算"
            />

            <Typography variant="body2" color="text.secondary">
              每筆品項單價以訂單當前商品規格價格計算，小計與總計不可直接修改。
            </Typography>



            {actionError ? <Alert severity="error">{actionError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} disabled={saveLoading}>取消</Button>
          <Button onClick={requestSaveOrder} variant="contained" disabled={saveLoading}>
            {saveLoading ? '儲存中...' : '儲存'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmActionDialog
        open={confirmOpen}
        title="確認更新訂單狀態？"
        description={`此操作會把訂單狀態由「${currentStatusLabel || '-'}」更新為「${nextStatusLabel}」。`}
        confirmText="確認更新"
        cancelText="取消"
        confirmColor="warning"
        loading={saveLoading}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void handleSaveOrder()}
      />

      <Dialog open={viewOpen} onClose={viewLoading ? undefined : closeViewDialog} fullWidth maxWidth="md">
        <DialogTitle>訂單詳細資訊</DialogTitle>
        <DialogContent dividers>
          {viewLoading ? (
            <Stack sx={{ py: 3, alignItems: 'center' }}>
              <CircularProgress size={28} />
            </Stack>
          ) : null}

          {!viewLoading && viewError ? <Alert severity="error">{viewError}</Alert> : null}

          {!viewLoading && !viewError && viewingOrder ? (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    訂單編號
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{viewingOrder.order_no || viewingOrder.id.slice(0, 8)}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    訂單狀態
                  </Typography>
                  <Typography>
                    {viewingOrder.order_status_name ||
                      statusLabelMap[viewingOrder.order_status_code] ||
                      `狀態 ${viewingOrder.order_status_code}`}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    客戶名稱
                  </Typography>
                  <Typography>{viewingOrder.customer_name || viewingOrder.user_name || '-'}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    客戶 Email
                  </Typography>
                  <Typography>{viewingOrder.customer_email || '-'}</Typography>
                </Box>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    下單人姓名
                  </Typography>
                  <Typography>{viewingOrder.orderer_name || '-'}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    下單人電話
                  </Typography>
                  <Typography>{viewingOrder.orderer_phone || '-'}</Typography>
                </Box>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    配送方式
                  </Typography>
                  <Typography>{viewingOrder.delivery_method_label || '-'}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    付款方式
                  </Typography>
                  <Typography>{viewingOrder.payment_method_label || '-'}</Typography>
                </Box>
              </Stack>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  收件地址
                </Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{viewingOrder.address || '-'}</Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    建立時間
                  </Typography>
                  <Typography>{formatDateTime(viewingOrder.created_at)}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    更新時間
                  </Typography>
                  <Typography>{formatDateTime(viewingOrder.updated_at)}</Typography>
                </Box>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    小計
                  </Typography>
                  <Typography>{currencyFormatter.format(viewingOrder.subtotal_amount)}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    折扣
                  </Typography>
                  <Typography>{currencyFormatter.format(viewingOrder.discount_amount)}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    運費
                  </Typography>
                  <Typography>{currencyFormatter.format(viewingOrder.shipping_fee)}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    人工調整金額
                  </Typography>
                  <Typography>{currencyFormatter.format(viewingOrder.manual_adjustment_amount ?? 0)}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    總計
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{currencyFormatter.format(viewingOrder.total_amount)}</Typography>
                </Box>
              </Stack>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  匯款後五碼
                </Typography>
                <Typography>{viewingOrder.bank_transfer_last5 || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  訂單品項
                </Typography>
                <Stack spacing={1}>
                  {viewingOrder.items.length ? (
                    viewingOrder.items.map((item) => (
                      <Paper key={item.id} variant="outlined" sx={{ p: 1.5 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between' }}>
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>{item.product_name || item.product_id}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              單位：{item.unit || '-'}
                            </Typography>
                          </Box>
                          <Typography>數量：{item.quantity}</Typography>
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Typography color="text.secondary">此訂單目前沒有品項資料</Typography>
                  )}
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  管理員備注
                </Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {viewingOrder.admin_note || '-'}
                </Typography>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeViewDialog} disabled={viewLoading}>關閉</Button>
        </DialogActions>
      </Dialog>

        <DeleteConfirmDialog
          open={Boolean(deleteTarget)}
          title="刪除訂單"
          targetName={deleteTarget?.order_no || deleteTarget?.id.slice(0, 8) || ''}
          description="確定要刪除這筆訂單嗎？刪除後資料將不會出現在列表。"
          error={actionError}
          loading={actionLoading}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => void handleDeleteOrder()}
        />
    </Paper>
  )
}

export default OrdersPage
