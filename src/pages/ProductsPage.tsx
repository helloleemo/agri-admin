import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Chip,
  IconButton,
  Paper,
  Stack,
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { DeleteConfirmDialog } from '@/components/dialogs'
import {
  categoriesService,
  imagesService,
  productService,
  type CategoryResponse,
  type ProductCreatePayload,
  type ProductResponse,
  type ProductUpdatePayload,
  unitsService,
  type UnitResponse,
} from '@/api'
import PageToolbar from '@/components/layout/PageToolbar'
import {
  ProductFormDialog,
  ProductViewDialog,
  type ProductFormState,
  type ProductStatusOption,
  type ProductUnitFormRow,
} from '@/pages/ProductDialogs'

const currencyFormatter = new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
})

const statusOptions: ProductStatusOption[] = [
  { value: 1, label: '啟用', color: 'success' },
  { value: 2, label: '停用', color: 'warning' },
  // { value: 3, label: '刪除', color: 'default' },
]

const createEmptyUnit = (): ProductUnitFormRow => ({
  unit_id: '',
  price: '',
  stock: '',
})

const createEmptyForm = (categoryId = ''): ProductFormState => ({
  name: '',
  category_id: categoryId,
  origin: '',
  description: '',
  low_stock_threshold: '',
  status_code: 1,
  units: [createEmptyUnit()],
})

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-TW')
}

const normalizeText = (value: string) => value.trim()
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

const toNullableText = (value: string) => {
  const normalized = normalizeText(value)
  return normalized ? normalized : null
}

const toIntegerOrNull = (value: string) => {
  const normalized = normalizeText(value)
  if (!normalized) {
    return null
  }

  const parsed = Number(normalized)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null
}

const buildFormState = (product: ProductResponse): ProductFormState => ({
  name: product.name,
  category_id: product.category_id,
  origin: product.origin ?? '',
  description: product.description ?? '',
  low_stock_threshold:
    product.low_stock_threshold === null || product.low_stock_threshold === undefined
      ? ''
      : String(product.low_stock_threshold),
  status_code: product.status_code,
  units: product.units.length
    ? product.units.map((unit) => ({
        unit_id: unit.unit_id,
        price: String(unit.price),
        stock: String(unit.stock),
      }))
    : [createEmptyUnit()],
})

const ProductsPage = () => {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [units, setUnits] = useState<UnitResponse[]>([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [pageError, setPageError] = useState('')
  const [actionError, setActionError] = useState('')
  const [imageActionError, setImageActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view' | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null)
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(null)
  const [formState, setFormState] = useState<ProductFormState>(createEmptyForm())
  const [imageActionLoading, setImageActionLoading] = useState(false)
  const [createImageFiles, setCreateImageFiles] = useState<File[]>([])
  const [createPrimaryIndex, setCreatePrimaryIndex] = useState(0)

  const resolveImageUrl = (fileUrl: string) => {
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl
    }
    return `${API_BASE_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setPageError('')

      const [productData, categoryData, unitData] = await Promise.all([
        productService.getList({ skip: 0, limit: 100 }),
        categoriesService.getList({ skip: 0, limit: 100 }),
        unitsService.getList({ skip: 0, limit: 100 }),
      ])

      setProducts(productData)
      setCategories(categoryData)
      setUnits(unitData)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '載入商品資料失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchProducts()
    }

    void loadInitialData()
  }, [])

  const unitOptions = useMemo(() => {
    return units
      .map((unit) => ({ id: unit.id, label: unit.name }))
      .sort((left, right) => left.label.localeCompare(right.label, 'zh-TW'))
  }, [units])

  const filteredProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    if (!normalizedKeyword) {
      return products
    }

    return products.filter((product) => {
      const searchableText = [product.name, product.category_name, product.origin]
        .filter((value): value is string => Boolean(value))
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedKeyword)
    })
  }, [keyword, products])

  const getPriceText = (product: ProductResponse) => {
    if (!product.units.length) {
      return '--'
    }

    const prices = product.units.map((unit) => unit.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    return minPrice === maxPrice
      ? currencyFormatter.format(minPrice)
      : `${currencyFormatter.format(minPrice)} ~ ${currencyFormatter.format(maxPrice)}`
  }

  const getStockCount = (product: ProductResponse) => {
    return product.units.reduce((sum, unit) => sum + unit.stock, 0)
  }

  const openCreateDialog = () => {
    setSelectedProduct(null)
    setPrimaryImageId(null)
    setCreateImageFiles([])
    setCreatePrimaryIndex(0)
    setFormState(createEmptyForm(categories[0]?.id ?? ''))
    setDialogMode('create')
    setActionError('')
    setImageActionError('')
  }

  const openEditDialog = (product: ProductResponse) => {
    setSelectedProduct(product)
    setPrimaryImageId(product.images?.find((image) => image.is_primary)?.id ?? null)
    setFormState(buildFormState(product))
    setCreateImageFiles([])
    setCreatePrimaryIndex(0)
    setDialogMode('edit')
    setActionError('')
    setImageActionError('')
  }

  const openViewDialog = (product: ProductResponse) => {
    setSelectedProduct(product)
    setPrimaryImageId(product.images?.find((image) => image.is_primary)?.id ?? null)
    setDialogMode('view')
    setCreateImageFiles([])
    setCreatePrimaryIndex(0)
    setActionError('')
    setImageActionError('')
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelectedProduct(null)
    setPrimaryImageId(null)
    setActionError('')
    setImageActionError('')
    setCreateImageFiles([])
    setCreatePrimaryIndex(0)
    setFormState(createEmptyForm(categories[0]?.id ?? ''))
  }

  const handleCreateImageFilesChange = (files: File[]) => {
    if (files.some((file) => !file.type.startsWith('image/'))) {
      setImageActionError('請選擇圖片檔案')
      return
    }

    setImageActionError('')
    setCreateImageFiles((current) => [...current, ...files])
  }

  const handleRemoveCreateImage = (index: number) => {
    setCreateImageFiles((current) => {
      const next = current.filter((_, currentIndex) => currentIndex !== index)
      setCreatePrimaryIndex((primaryIndex) => {
        if (!next.length) {
          return 0
        }
        if (index < primaryIndex) {
          return primaryIndex - 1
        }
        if (index === primaryIndex) {
          return 0
        }
        return primaryIndex
      })
      return next
    })
  }

  const refreshSelectedProduct = async (productId: string) => {
    const latestProduct = await productService.getById(productId)
    const latestPrimaryImageId = latestProduct.images?.find((image) => image.is_primary)?.id ?? null

    setProducts((current) =>
      current.map((product) => (product.id === latestProduct.id ? latestProduct : product)),
    )
    setSelectedProduct(latestProduct)
    setPrimaryImageId((current) => {
      if (current && latestProduct.images?.some((image) => image.id === current)) {
        return current
      }
      return latestPrimaryImageId
    })
  }

  const applyPrimaryImageLocally = (productId: string, imageId: string) => {
    const updateProductPrimary = (product: ProductResponse) => {
      if (product.id !== productId || !product.images?.length) {
        return product
      }

      return {
        ...product,
        images: product.images.map((image) => ({
          ...image,
          is_primary: image.id === imageId,
        })),
      }
    }

    setSelectedProduct((current) => (current ? updateProductPrimary(current) : current))
    setProducts((current) => current.map(updateProductPrimary))
    setPrimaryImageId(imageId)
  }

  const handleUploadImages = async (files: File[]) => {
    if (!selectedProduct) {
      return
    }

    if (!files.length) {
      return
    }

    if (files.some((file) => !file.type.startsWith('image/'))) {
      setImageActionError('請選擇圖片檔案')
      return
    }

    const currentImages = selectedProduct.images ?? []
    const sortOrderStart = currentImages.length
      ? Math.max(...currentImages.map((image) => image.sort_order)) + 1
      : 0
    const hasPrimary = currentImages.some((image) => image.is_primary)

    try {
      setImageActionLoading(true)
      setImageActionError('')

      await imagesService.createBatch({
        product_id: selectedProduct.id,
        files,
        primary_index: hasPrimary ? undefined : 0,
        sort_order_start: sortOrderStart,
      })

      await refreshSelectedProduct(selectedProduct.id)
      setNotice('圖片已上傳')
    } catch (err) {
      setImageActionError(err instanceof Error ? err.message : '圖片上傳失敗')
    } finally {
      setImageActionLoading(false)
    }
  }

  const handleSetPrimaryImage = async (imageId: string) => {
    if (!selectedProduct) {
      return
    }

    const productId = selectedProduct.id

    try {
      setImageActionLoading(true)
      setImageActionError('')

      await imagesService.update(imageId, { is_primary: true })
      applyPrimaryImageLocally(productId, imageId)
      await refreshSelectedProduct(productId)
      setNotice('主圖已更新')
    } catch (err) {
      setImageActionError(err instanceof Error ? err.message : '主圖更新失敗')
    } finally {
      setImageActionLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!selectedProduct) {
      return
    }

    try {
      setImageActionLoading(true)
      setImageActionError('')

      await imagesService.delete(imageId)
      await refreshSelectedProduct(selectedProduct.id)
      setNotice('圖片已刪除')
    } catch (err) {
      setImageActionError(err instanceof Error ? err.message : '圖片刪除失敗')
    } finally {
      setImageActionLoading(false)
    }
  }

  const updateFormField = <K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) => {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const updateUnitField = (index: number, field: keyof ProductUnitFormRow, value: string) => {
    setFormState((current) => ({
      ...current,
      units: current.units.map((unit, unitIndex) => (unitIndex === index ? { ...unit, [field]: value } : unit)),
    }))
  }

  const addUnitRow = () => {
    setFormState((current) => ({
      ...current,
      units: [...current.units, createEmptyUnit()],
    }))
  }

  const removeUnitRow = (index: number) => {
    setFormState((current) => ({
      ...current,
      units: current.units.length === 1 ? current.units : current.units.filter((_, unitIndex) => unitIndex !== index),
    }))
  }

  const validateForm = () => {
    if (!normalizeText(formState.name)) {
      return '請輸入商品名稱'
    }

    if (!formState.category_id) {
      return '請選擇商品分類'
    }

    if (!formState.units.length) {
      return '請至少新增一筆商品單位'
    }

    if (formState.low_stock_threshold && toIntegerOrNull(formState.low_stock_threshold) === null) {
      return '低庫存門檻必須是大於等於 0 的整數，或留空使用全域設定'
    }

    const seenUnits = new Set<string>()

    for (const [index, unit] of formState.units.entries()) {
      if (!unit.unit_id) {
        return `請選擇第 ${index + 1} 筆商品單位`
      }

      if (seenUnits.has(unit.unit_id)) {
        return '商品單位不可重複'
      }

      seenUnits.add(unit.unit_id)

      const price = toIntegerOrNull(unit.price)
      if (price === null) {
        return `第 ${index + 1} 筆單位的售價必須是大於等於 0 的整數`
      }

      const stock = toIntegerOrNull(unit.stock)
      if (stock === null) {
        return `第 ${index + 1} 筆單位的庫存必須是大於等於 0 的整數`
      }
    }

    return ''
  }

  const isSubmitDisabled = useMemo(() => {
    if (actionLoading) {
      return true
    }

    if (!unitOptions.length) {
      return true
    }

    if (!normalizeText(formState.name)) {
      return true
    }

    if (!formState.category_id) {
      return true
    }

    if (!formState.units.length) {
      return true
    }

    const seenUnits = new Set<string>()

    if (formState.low_stock_threshold && toIntegerOrNull(formState.low_stock_threshold) === null) {
      return true
    }

    for (const unit of formState.units) {
      if (!unit.unit_id || seenUnits.has(unit.unit_id)) {
        return true
      }

      seenUnits.add(unit.unit_id)

      if (toIntegerOrNull(unit.price) === null || toIntegerOrNull(unit.stock) === null) {
        return true
      }
    }

    return false
  }, [actionLoading, formState, unitOptions])

  const buildPayload = () => {
    const units = formState.units.map((unit) => ({
      unit_id: unit.unit_id,
      price: Number(unit.price),
      stock: Number(unit.stock),
    }))

    const payload = {
      name: normalizeText(formState.name),
      category_id: formState.category_id,
      origin: toNullableText(formState.origin),
      description: toNullableText(formState.description),
      low_stock_threshold: toIntegerOrNull(formState.low_stock_threshold),
      status_code: formState.status_code,
      units,
    }

    return payload satisfies ProductCreatePayload | ProductUpdatePayload
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
        const createdProduct = await productService.create(payload as ProductCreatePayload)

        if (createImageFiles.length) {
          await imagesService.createBatch({
            product_id: createdProduct.id,
            files: createImageFiles,
            primary_index: Math.min(createPrimaryIndex, createImageFiles.length - 1),
            sort_order_start: 0,
          })
        }

        setNotice('商品已新增')
      } else if (dialogMode === 'edit' && selectedProduct) {
        await productService.update(selectedProduct.id, payload as ProductUpdatePayload)
        setNotice('商品已更新')
      }

      closeDialog()
      await fetchProducts()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '儲存商品失敗')
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
      await productService.delete(deleteTarget.id)
      setNotice('商品已刪除')
      setDeleteTarget(null)
      await fetchProducts()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '刪除商品失敗')
    } finally {
      setActionLoading(false)
    }
  }

  const columns: GridColDef<ProductResponse>[] = [
    {
      field: 'name',
      headerName: '商品名稱',
      flex: 1.2,
      minWidth: 180,
    },
    {
      field: 'category_name',
      headerName: '分類',
      minWidth: 120,
      valueGetter: (_, row) => row.category_name || '-',
    },
    {
      field: 'price',
      headerName: '售價',
      minWidth: 140,
      valueGetter: (_, row) => getPriceText(row),
    },
    {
      field: 'stock',
      headerName: '庫存',
      minWidth: 100,
      valueGetter: (_, row) => getStockCount(row),
    },
    {
      field: 'status_code',
      headerName: '狀態',
      minWidth: 120,
      renderCell: (params) => {
        const status = statusOptions.find((item) => item.value === params.row.status_code)

        return (
          <Chip
            label={status?.label ?? `狀態 ${params.row.status_code}`}
            color={status?.color ?? 'default'}
            size="small"
            variant={params.row.status_code === 1 ? 'filled' : 'outlined'}
          />
        )
      },
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
      minWidth: 180,
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
        title="商品管理"
        description="維護商品資料、分類、單位價格與庫存"
        keyword={keyword}
        searchPlaceholder="搜尋商品名稱、分類或產地"
        onKeywordChange={setKeyword}
        addLabel="新增商品"
        onAdd={openCreateDialog}
        onRefresh={() => void fetchProducts()}
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
        rows={filteredProducts}
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

      <ProductFormDialog
        open={dialogMode === 'create' || dialogMode === 'edit'}
        mode={dialogMode === 'create' ? 'create' : 'edit'}
        actionError={actionError}
        formState={formState}
        categories={categories}
        statusOptions={statusOptions}
        unitOptions={unitOptions}
        actionLoading={actionLoading}
        submitDisabled={isSubmitDisabled}
        selectedProduct={selectedProduct}
        primaryImageId={primaryImageId}
        imageActionLoading={imageActionLoading}
        imageActionError={imageActionError}
        resolveImageUrl={resolveImageUrl}
        onClose={closeDialog}
        onSubmit={() => void handleSubmit()}
        onNameChange={(value) => updateFormField('name', value)}
        onCategoryChange={(value) => updateFormField('category_id', value)}
        onOriginChange={(value) => updateFormField('origin', value)}
        onLowStockThresholdChange={(value) => updateFormField('low_stock_threshold', value)}
        onStatusChange={(value) => updateFormField('status_code', value)}
        onDescriptionChange={(value) => updateFormField('description', value)}
        onAddUnitRow={addUnitRow}
        onUnitFieldChange={updateUnitField}
        onRemoveUnitRow={removeUnitRow}
        createImageFiles={createImageFiles}
        createPrimaryIndex={createPrimaryIndex}
        onCreateImageFilesChange={handleCreateImageFilesChange}
        onCreatePrimaryIndexChange={setCreatePrimaryIndex}
        onRemoveCreateImage={handleRemoveCreateImage}
        onUploadImages={(files) => void handleUploadImages(files)}
        onSetPrimaryImage={(imageId) => void handleSetPrimaryImage(imageId)}
        onDeleteImage={(imageId) => void handleDeleteImage(imageId)}
      />

      <ProductViewDialog
        open={dialogMode === 'view' && Boolean(selectedProduct)}
        selectedProduct={selectedProduct}
        statusOptions={statusOptions}
        currencyFormatter={currencyFormatter}
        formatDateTime={formatDateTime}
        resolveImageUrl={resolveImageUrl}
        onClose={closeDialog}
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title="刪除商品"
        targetName={deleteTarget?.name || ''}
        error={actionError}
        loading={actionLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </Paper>
  )
}

export default ProductsPage
