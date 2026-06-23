import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { useEffect, useMemo, useState } from 'react'
import { inventoriesService, productService, type InventoryBalanceResponse, type InventoryLedgerResponse, type ProductResponse } from '@/api'
import PageToolbar from '@/components/layout/PageToolbar'

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-TW')
}

const InventoriesPage = () => {
  const [balances, setBalances] = useState<InventoryBalanceResponse[]>([])
  const [ledger, setLedger] = useState<InventoryLedgerResponse[]>([])
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjustError, setAdjustError] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [deltaInput, setDeltaInput] = useState('')
  const [note, setNote] = useState('')

  const description = () => {
    return (
      <>
      <Typography variant="body2" color="text.secondary">
        訂單成立、確認訂單待付款、已付款備貨中、配送中，會影響「保留庫存」，直到訂單已送達或取消。
      </Typography>      
      <Typography variant="body2" color="text.secondary">
          實際庫存 = 初始庫存 + 手動增減累計
        </Typography>
        <Typography variant="body2" color="text.secondary">
          可用庫存 = 實際庫存 - 保留庫存（可於下方查看完整調整流水）
        </Typography>
        </>
    )
  }
  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      const [balanceData, ledgerData, productData] = await Promise.all([
        inventoriesService.getBalances({ skip: 0, limit: 100 }),
        inventoriesService.getLedger({ skip: 0, limit: 100 }),
        productService.getList({ skip: 0, limit: 100 }),
      ])
      setBalances(balanceData)
      setLedger(ledgerData)
      setProducts(productData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入庫存資料失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchData()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [])

  const productOptions = useMemo(() => {
    const map = new Map<string, string>()
    balances.forEach((item) => {
      if (!map.has(item.product_id)) {
        map.set(item.product_id, item.product_name || item.product_id.slice(0, 8))
      }
    })
    products.forEach((product) => {
      if (!map.has(product.id)) {
        map.set(product.id, product.name)
      }
    })
    return [...map.entries()].map(([id, name]) => ({ id, name }))
  }, [balances, products])

  const unitOptions = useMemo(() => {
    if (!selectedProductId) {
      return []
    }
    return balances
      .filter((item) => item.product_id === selectedProductId)
      .map((item) => ({ id: item.unit_id, name: item.unit_name || item.unit_id.slice(0, 8) }))
  }, [balances, selectedProductId])

  const filteredBalances = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    if (!normalized) {
      return balances
    }

    return balances.filter((item) => {
      const searchable = [item.product_name, item.unit_name, item.product_id, item.unit_id]
        .filter((value): value is string => Boolean(value))
        .join(' ')
        .toLowerCase()
      return searchable.includes(normalized)
    })
  }, [balances, keyword])

  const resetAdjustForm = () => {
    setSelectedProductId('')
    setSelectedUnitId('')
    setDeltaInput('')
    setNote('')
    setAdjustError('')
  }

  const openAdjustDialog = () => {
    resetAdjustForm()
    setAdjustOpen(true)
  }

  const closeAdjustDialog = () => {
    resetAdjustForm()
    setAdjustOpen(false)
  }

  const submitAdjustment = async () => {
    const delta = Number(deltaInput)
    if (!selectedProductId) {
      setAdjustError('請選擇商品')
      return
    }
    if (!selectedUnitId) {
      setAdjustError('請選擇規格')
      return
    }
    if (!Number.isInteger(delta) || delta === 0) {
      setAdjustError('調整數量需為非 0 整數')
      return
    }

    try {
      setActionLoading(true)
      setAdjustError('')
      await inventoriesService.createAdjustment({
        product_id: selectedProductId,
        unit_id: selectedUnitId,
        delta,
        note: note.trim() || null,
      })
      setNotice('庫存調整成功')
      closeAdjustDialog()
      await fetchData()
    } catch (err) {
      setAdjustError(err instanceof Error ? err.message : '庫存調整失敗')
    } finally {
      setActionLoading(false)
    }
  }

  const balanceColumns: GridColDef<InventoryBalanceResponse>[] = [
    {
      field: 'product_name',
      headerName: '商品',
      minWidth: 220,
      flex: 1,
      valueGetter: (_, row) => row.product_name || row.product_id,
    },
    {
      field: 'unit_name',
      headerName: '規格',
      minWidth: 140,
      valueGetter: (_, row) => row.unit_name || row.unit_id,
    },
    { field: 'initial_stock', headerName: '初始庫存', minWidth: 90 },
    { field: 'actual_stock', headerName: '實際庫存', minWidth: 90 },
    { field: 'reserved_stock', headerName: '保留庫存', minWidth: 90 },
    {
      field: 'available_stock',
      headerName: '可用庫存',
      minWidth: 90,
      renderCell: (params) => {
        const value = params.row.available_stock
        return (
          <Chip
            size="small"
            label={String(value)}
            color={value <= 5 ? 'warning' : 'success'}
            variant={value <= 5 ? 'filled' : 'outlined'}
          />
        )
      },
    },
    {
      field: 'manual_adjustment_stock',
      headerName: '手動增減累計',
      minWidth: 130,
      cellClassName: 'manual-adjustment-cell',
      renderCell: (params) => {
        const value = Number(params.row.manual_adjustment_stock)
        const display = value > 0 ? `+${value}` : String(value)

        return (
          <Typography
            variant="body2"
            sx={{
              color: value > 0 ? 'success.main' : value < 0 ? 'error.main' : 'text.secondary',
            }}
          >
            {display}
          </Typography>
        )
      },
    },
    {
      field: 'updated_at',
      headerName: '更新時間',
      minWidth: 170,
      valueGetter: (_, row) => formatDateTime(row.updated_at),
    },
  ]

  const ledgerColumns: GridColDef<InventoryLedgerResponse>[] = [
    {
      field: 'created_at',
      headerName: '時間',
      minWidth: 170,
      valueGetter: (_, row) => formatDateTime(row.created_at),
    },
    {
      field: 'product_name',
      headerName: '商品',
      minWidth: 180,
      flex: 1,
      valueGetter: (_, row) => row.product_name || row.product_id,
    },
    {
      field: 'unit_name',
      headerName: '規格',
      minWidth: 120,
      valueGetter: (_, row) => row.unit_name || row.unit_id,
    },
    { field: 'action', headerName: '動作', minWidth: 130 },
    { field: 'quantity', headerName: '數量', minWidth: 90 },
    {
      field: 'delta_actual',
      headerName: '實際變化',
      cellClassName: 'manual-adjustment-cell',
      minWidth: 100,
      renderCell: (params) => {
        const value = Number(params.row.delta_actual)
        const display = value > 0 ? `+${value}` : String(value)

        return (
          <Typography
            variant="body2"
            sx={{
              color: value > 0 ? 'success.main' : value < 0 ? 'error.main' : 'text.secondary',
            }}
          >
            {display}
          </Typography>
        )
      },
    },
    {
      field: 'delta_reserved',
      headerName: '保留變化',
      minWidth: 100,
      cellClassName: 'manual-adjustment-cell',
      renderCell: (params) => {
        const value = Number(params.row.delta_reserved)
        const display = value > 0 ? `+${value}` : String(value)

        return (
          <Typography
            variant="body2"
            sx={{
              color: value > 0 ? 'success.main' : value < 0 ? 'error.main' : 'text.secondary',
            }}
          >
            {display}
          </Typography>
        )
      },
    },
    { field: 'available_after', headerName: '變更後可用', minWidth: 110 },
    {
      field: 'note',
      headerName: '備註',
      minWidth: 220,
      flex: 1,
      valueGetter: (_, row) => row.note || '-',
    },
  ]

  return (
    <Paper sx={{ p: 2.4 }}>
      <PageToolbar
        title="庫存調整"
        titleIcon={<InventoryRoundedIcon color="primary" />}
        description={description()}
        keyword={keyword}
        searchPlaceholder="搜尋商品或規格"
        onKeywordChange={setKeyword}
        addLabel="手動調整"
        onAdd={openAdjustDialog}
        onRefresh={() => void fetchData()}
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      ) : null}

      {notice ? (
        <Alert severity="success" sx={{ mb: 1.5 }} onClose={() => setNotice('')}>
          {notice}
        </Alert>
      ) : null}

      <Stack spacing={2.4}>
        <Box>
          <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
            <InventoryRoundedIcon fontSize="small" color="action" />
            <Typography variant="h6">庫存平衡</Typography>
          </Stack>
          <DataGrid
            autoHeight
            rows={filteredBalances}
            columns={balanceColumns}
            loading={loading}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
              '& .manual-adjustment-cell': {
                display: 'flex',
                alignItems: 'center',
              },
            }}
          />
        </Box>

        <Box>
          <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
            <HistoryRoundedIcon fontSize="small" color="action" />
            <Typography variant="h6">庫存流水</Typography>
          </Stack>
          <DataGrid
            autoHeight
            rows={ledger}
            columns={ledgerColumns}
            loading={loading}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
              '& .manual-adjustment-cell': {
                display: 'flex',
                alignItems: 'center',
              },
            }}
          />
        </Box>
      </Stack>

      <Dialog open={adjustOpen} onClose={closeAdjustDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <TuneRoundedIcon fontSize="small" />
            <Typography variant="h6">手動調整庫存</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {adjustError ? <Alert severity="error">{adjustError}</Alert> : null}
            <TextField
              select
              label="商品"
              value={selectedProductId}
              onChange={(event) => {
                setSelectedProductId(event.target.value)
                setSelectedUnitId('')
              }}
              fullWidth
            >
              {productOptions.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="規格"
              value={selectedUnitId}
              onChange={(event) => setSelectedUnitId(event.target.value)}
              fullWidth
              disabled={!selectedProductId}
            >
              {unitOptions.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="調整數量（可負數）"
              value={deltaInput}
              onChange={(event) => setDeltaInput(event.target.value)}
              fullWidth
              helperText="例如 +10 請輸入 10；扣減 3 請輸入 -3"
            />
            <TextField
              label="備註"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAdjustDialog}>取消</Button>
          <Button onClick={() => void submitAdjustment()} variant="contained" disabled={actionLoading}>
            {actionLoading ? '調整中...' : '確認調整'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default InventoriesPage
