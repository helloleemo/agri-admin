import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
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
  Chip,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import {
  categoriesService,
  productService,
  type CategoryCreatePayload,
  type CategoryResponse,
  type CategoryUpdatePayload,
  type ProductResponse,
} from '@/api'

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-TW')
}

type CategoryFormState = {
  name: string
}

const createEmptyForm = (): CategoryFormState => ({
  name: '',
})

const CategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [pageError, setPageError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null)
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [viewTarget, setViewTarget] = useState<CategoryResponse | null>(null)
  const [formState, setFormState] = useState<CategoryFormState>(createEmptyForm())

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setPageError('')
      const [categoryData, productData] = await Promise.all([
        categoriesService.getList({ skip: 0, limit: 100 }),
        productService.getList({ skip: 0, limit: 100 }),
      ])
      setCategories(categoryData)
      setProducts(productData)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '載入分類資料失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchCategories()
    }

    void loadInitialData()
  }, [])

  const filteredCategories = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    if (!normalizedKeyword) {
      return categories
    }

    return categories.filter((category) => category.name.toLowerCase().includes(normalizedKeyword))
  }, [categories, keyword])

  const productsByCategory = useMemo(() => {
    return new Map(
      categories.map((category) => [
        category.id,
        products.filter((product) => product.category_id === category.id),
      ]),
    )
  }, [categories, products])

  const openCreateDialog = () => {
    setSelectedCategory(null)
    setFormState(createEmptyForm())
    setDialogMode('create')
    setActionError('')
  }

  const openEditDialog = (category: CategoryResponse) => {
    setSelectedCategory(category)
    setFormState({ name: category.name })
    setDialogMode('edit')
    setActionError('')
  }

  const openViewDialog = (category: CategoryResponse) => {
    setViewTarget(category)
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelectedCategory(null)
    setActionError('')
    setFormState(createEmptyForm())
  }

  const validateForm = () => {
    if (!formState.name.trim()) {
      return '請輸入分類名稱'
    }

    return ''
  }

  const buildPayload = () => {
    const payload = {
      name: formState.name.trim(),
    }

    return payload satisfies CategoryCreatePayload | CategoryUpdatePayload
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
      const payload = buildPayload()

      if (dialogMode === 'create') {
        await categoriesService.create(payload as CategoryCreatePayload)
        setNotice('分類已新增')
      } else if (dialogMode === 'edit' && selectedCategory) {
        await categoriesService.update(selectedCategory.id, payload as CategoryUpdatePayload)
        setNotice('分類已更新')
      }

      closeDialog()
      await fetchCategories()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '儲存分類失敗')
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
      await categoriesService.delete(deleteTarget.id)
      setNotice('分類已刪除')
      setDeleteTarget(null)
      await fetchCategories()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '刪除分類失敗')
    } finally {
      setActionLoading(false)
    }
  }

  const columns: GridColDef<CategoryResponse>[] = [
    { field: 'name', headerName: '分類名稱', flex: 1, minWidth: 160 },
    {
      field: 'created_at',
      headerName: '建立時間',
      minWidth: 170,
      valueGetter: (_, row) => formatDateTime(row.created_at),
    },
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
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ mb: 2.4, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}
      >
        <Box>
          <Typography variant="h5" sx={{ mb: 0.6 }}>
            分類管理
          </Typography>
          <Typography variant="body2" color="text.secondary">
            維護商品分類資料
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
          <TextField
            size="small"
            placeholder="搜尋分類名稱"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            slotProps={{
              input: {
                startAdornment: <SearchRoundedIcon fontSize="small" />,
              },
            }}
          />
          <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={openCreateDialog}>
            新增分類
          </Button>
          <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void fetchCategories()}>
            重新整理
          </Button>
        </Stack>
      </Stack>

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
        rows={filteredCategories}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
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

      <Dialog open={dialogMode !== null} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'create' ? '新增分類' : '編輯分類'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {actionError ? <Alert severity="error">{actionError}</Alert> : null}
            <TextField
              label="分類名稱"
              value={formState.name}
              onChange={(event) => setFormState({ name: event.target.value })}
              fullWidth
              required
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

      <Dialog open={Boolean(viewTarget)} onClose={() => setViewTarget(null)} fullWidth maxWidth="md">
        <DialogTitle>分類內產品</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                分類名稱
              </Typography>
              <Typography variant="h6">{viewTarget?.name || ''}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                產品列表
              </Typography>
              <Stack spacing={1.2} sx={{ mt: 1 }}>
                {viewTarget ? (
                  productsByCategory.get(viewTarget.id)?.length ? (
                    productsByCategory.get(viewTarget.id)?.map((product) => (
                      <Paper key={product.id} variant="outlined" sx={{ p: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>{product.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              產地：{product.origin || '-'} · 庫存：{product.units.reduce((sum, unit) => sum + unit.stock, 0)}
                            </Typography>
                          </Box>
                          <Chip
                            label={product.status_code === 1 ? '啟用' : '停用'}
                            color={product.status_code === 1 ? 'success' : 'default'}
                            size="small"
                            variant={product.status_code === 1 ? 'filled' : 'outlined'}
                          />
                        </Box>
                      </Paper>
                    ))
                  ) : (
                    <Typography color="text.secondary">這個分類底下目前沒有產品</Typography>
                  )
                ) : null}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewTarget(null)}>關閉</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>刪除分類</DialogTitle>
        <DialogContent dividers>
          <Typography>
            確定要刪除「{deleteTarget?.name || ''}」嗎？這個操作無法復原。
          </Typography>
          {actionError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {actionError}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>取消</Button>
          <Button color="error" variant="contained" onClick={() => void handleDelete()} disabled={actionLoading}>
            {actionLoading ? '刪除中...' : '刪除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default CategoriesPage
