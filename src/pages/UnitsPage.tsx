import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { productService, unitsService, type ProductResponse, type UnitCreatePayload, type UnitResponse, type UnitUpdatePayload } from '@/api'
import { DeleteConfirmDialog } from '@/components/dialogs'
import PageToolbar from '@/components/layout/PageToolbar'

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-TW')
}

type UnitFormState = {
  name: string
}

type UnitRow = UnitResponse & {
  product_count: number
  price_min: number | null
  price_max: number | null
  stock_total: number
}

const createEmptyForm = (): UnitFormState => ({
  name: '',
})

const buildFormFromUnit = (unit: UnitResponse): UnitFormState => ({
  name: unit.name,
})

const UnitsPage = () => {
  const [units, setUnits] = useState<UnitResponse[]>([])
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [pageError, setPageError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view' | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<UnitResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UnitResponse | null>(null)
  const [formState, setFormState] = useState<UnitFormState>(createEmptyForm())

  const fetchData = async () => {
    try {
      setLoading(true)
      setPageError('')

      const [unitData, productData] = await Promise.all([
        unitsService.getList({ skip: 0, limit: 100 }),
        productService.getList({ skip: 0, limit: 100 }),
      ])

      setUnits(unitData)
      setProducts(productData)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '載入單位資料失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchData()
  }, [])

  const unitStats = useMemo(() => {
    const stats = new Map<string, { product_count: number; price_min: number; price_max: number; stock_total: number }>()

    products.forEach((product) => {
      product.units.forEach((unit) => {
        const current = stats.get(unit.unit_id)
        if (current) {
          current.product_count += 1
          current.price_min = Math.min(current.price_min, unit.price)
          current.price_max = Math.max(current.price_max, unit.price)
          current.stock_total += unit.stock
          return
        }

        stats.set(unit.unit_id, {
          product_count: 1,
          price_min: unit.price,
          price_max: unit.price,
          stock_total: unit.stock,
        })
      })
    })

    return stats
  }, [products])

  const unitRows = useMemo<UnitRow[]>(() => {
    return units.map((unit) => {
      const stat = unitStats.get(unit.id)
      return {
        ...unit,
        product_count: stat?.product_count ?? 0,
        price_min: stat?.price_min ?? null,
        price_max: stat?.price_max ?? null,
        stock_total: stat?.stock_total ?? 0,
      }
    })
  }, [units, unitStats])

  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    if (!normalizedKeyword) {
      return unitRows
    }

    return unitRows.filter((unit) => unit.name.toLowerCase().includes(normalizedKeyword))
  }, [keyword, unitRows])

  const productsByUnit = useMemo(() => {
    return new Map(
      units.map((unit) => [
        unit.id,
        products.filter((product) => product.units.some((productUnit) => productUnit.unit_id === unit.id)),
      ]),
    )
  }, [products, units])

  const openCreateDialog = () => {
    setSelectedUnit(null)
    setFormState(createEmptyForm())
    setActionError('')
    setDialogMode('create')
  }

  const openEditDialog = (unit: UnitResponse) => {
    setSelectedUnit(unit)
    setFormState(buildFormFromUnit(unit))
    setActionError('')
    setDialogMode('edit')
  }

  const openViewDialog = (unit: UnitResponse) => {
    setSelectedUnit(unit)
    setActionError('')
    setDialogMode('view')
  }

  const closeDialog = () => {
    setSelectedUnit(null)
    setActionError('')
    setDialogMode(null)
    setFormState(createEmptyForm())
  }

  const validateForm = () => {
    if (!formState.name.trim()) {
      return '請輸入單位名稱'
    }

    return ''
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setActionError(validationError)
      return
    }

    try {
      setActionLoading(true)
      setActionError('')

      if (dialogMode === 'create') {
        const payload: UnitCreatePayload = {
          name: formState.name.trim(),
        }
        await unitsService.create(payload)
        setNotice('單位已新增')
      }

      if (dialogMode === 'edit' && selectedUnit) {
        const payload: UnitUpdatePayload = {
          name: formState.name.trim(),
        }
        await unitsService.update(selectedUnit.id, payload)
        setNotice('單位已更新')
      }

      closeDialog()
      await fetchData()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '儲存單位失敗')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    try {
      setActionLoading(true)
      setActionError('')
      await unitsService.delete(deleteTarget.id)
      setNotice('單位已刪除')
      setDeleteTarget(null)
      await fetchData()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '刪除單位失敗')
    } finally {
      setActionLoading(false)
    }
  }

  const columns: GridColDef<UnitRow>[] = [
    { field: 'name', headerName: '單位名稱', flex: 1, minWidth: 180 },
    { field: 'product_count', headerName: '使用商品數', minWidth: 120 },
    {
      field: 'price_range',
      headerName: '價格區間',
      minWidth: 160,
      valueGetter: (_, row) => {
        if (row.price_min === null || row.price_max === null) {
          return '--'
        }

        return row.price_min === row.price_max
          ? `$${row.price_min}`
          : `$${row.price_min} ~ $${row.price_max}`
      },
    },
    { field: 'stock_total', headerName: '總庫存', minWidth: 100 },
    {
      field: 'updated_at',
      headerName: '更新時間',
      minWidth: 170,
      valueGetter: (_, row) => formatDateTime(row.updated_at),
    },
    {
      field: 'actions',
      headerName: '操作',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      minWidth: 160,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} sx={{ height: '100%', alignItems: 'center' }}>
          <IconButton size="small" color="primary" onClick={() => openViewDialog(params.row)}>
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
    },
  ]

  return (
    <Paper sx={{ p: 2.4 }}>
      <PageToolbar
        title="單位管理"
        titleIcon={<ScaleRoundedIcon color="primary" />}
        description="維護商品單位資料與使用狀態"
        keyword={keyword}
        searchPlaceholder="搜尋單位名稱"
        onKeywordChange={setKeyword}
        addLabel="新增單位"
        onAdd={openCreateDialog}
        onRefresh={() => void fetchData()}
      />

      {pageError ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {pageError}
        </Alert>
      ) : null}

      {notice ? (
        <Alert severity="success" sx={{ mb: 1.5 }} onClose={() => setNotice('')}>
          {notice}
        </Alert>
      ) : null}

      <DataGrid
        autoHeight
        rows={filteredRows}
        columns={columns}
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
        }}
      />

      <Dialog open={dialogMode === 'create' || dialogMode === 'edit'} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'create' ? '新增單位' : '編輯單位'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {actionError ? <Alert severity="error">{actionError}</Alert> : null}
            <TextField
              label="單位名稱"
              value={formState.name}
              onChange={(event) => setFormState({ name: event.target.value })}
              fullWidth
              required
              helperText="例如：公斤、箱、包、顆"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>取消</Button>
          <Button onClick={() => void handleSubmit()} variant="contained" disabled={actionLoading}>
            {actionLoading ? '儲存中...' : '儲存'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogMode === 'view'} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>單位詳情</DialogTitle>
        <DialogContent dividers>
          {selectedUnit ? (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  單位名稱
                </Typography>
                <Typography variant="h6">{selectedUnit.name}</Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    建立時間
                  </Typography>
                  <Typography>{formatDateTime(selectedUnit.created_at)}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    更新時間
                  </Typography>
                  <Typography>{formatDateTime(selectedUnit.updated_at)}</Typography>
                </Box>
              </Stack>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  使用中的商品
                </Typography>
                <Stack spacing={1.2} sx={{ mt: 1 }}>
                  {productsByUnit.get(selectedUnit.id)?.length ? (
                    productsByUnit.get(selectedUnit.id)?.map((product) => (
                      <Paper key={product.id} variant="outlined" sx={{ p: 1.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>{product.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          分類：{product.category_name || '-'}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography color="text.secondary">目前沒有商品使用此單位</Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>關閉</Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title="刪除單位"
        targetName={deleteTarget?.name || ''}
        error={actionError}
        loading={actionLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </Paper>
  )
}

export default UnitsPage
