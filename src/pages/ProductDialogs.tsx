import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { CategoryResponse, ProductResponse, StatusCode } from '@/api'

export type ProductStatusOption = {
  value: StatusCode
  label: string
  color: 'success' | 'default' | 'warning'
}

export type ProductUnitFormRow = {
  unit_id: string
  price: string
  stock: string
}

export type ProductFormState = {
  name: string
  category_id: string
  origin: string
  description: string
  low_stock_threshold: string
  status_code: StatusCode
  units: ProductUnitFormRow[]
}

type ProductFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  actionError: string
  formState: ProductFormState
  categories: CategoryResponse[]
  statusOptions: ProductStatusOption[]
  unitOptions: Array<{ id: string; label: string }>
  actionLoading: boolean
  submitDisabled: boolean
  selectedProduct: ProductResponse | null
  primaryImageId: string | null
  imageActionLoading: boolean
  imageActionError: string
  resolveImageUrl: (fileUrl: string) => string
  onClose: () => void
  onSubmit: () => void
  onNameChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onOriginChange: (value: string) => void
  onLowStockThresholdChange: (value: string) => void
  onStatusChange: (value: StatusCode) => void
  onDescriptionChange: (value: string) => void
  onAddUnitRow: () => void
  onUnitFieldChange: (index: number, field: keyof ProductUnitFormRow, value: string) => void
  onRemoveUnitRow: (index: number) => void
  createImageFiles: File[]
  createPrimaryIndex: number
  onCreateImageFilesChange: (files: File[]) => void
  onCreatePrimaryIndexChange: (index: number) => void
  onRemoveCreateImage: (index: number) => void
  onUploadImages: (files: File[]) => void
  onSetPrimaryImage: (imageId: string) => void
  onDeleteImage: (imageId: string) => void
}

export const ProductFormDialog = ({
  open,
  mode,
  actionError,
  formState,
  categories,
  statusOptions,
  unitOptions,
  actionLoading,
  submitDisabled,
  selectedProduct,
  primaryImageId,
  imageActionLoading,
  imageActionError,
  resolveImageUrl,
  onClose,
  onSubmit,
  onNameChange,
  onCategoryChange,
  onOriginChange,
  onLowStockThresholdChange,
  onStatusChange,
  onDescriptionChange,
  onAddUnitRow,
  onUnitFieldChange,
  onRemoveUnitRow,
  createImageFiles,
  createPrimaryIndex,
  onCreateImageFilesChange,
  onCreatePrimaryIndexChange,
  onRemoveCreateImage,
  onUploadImages,
  onSetPrimaryImage,
  onDeleteImage,
}: ProductFormDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{mode === 'create' ? '新增商品' : '編輯商品'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {actionError ? <Alert severity="error">{actionError}</Alert> : null}
          <TextField label="商品名稱" value={formState.name} onChange={(event) => onNameChange(event.target.value)} fullWidth required />
          <TextField
            label="分類"
            select
            value={formState.category_id}
            onChange={(event) => onCategoryChange(event.target.value)}
            fullWidth
            required
            helperText={categories.length ? '請選擇商品分類' : '目前沒有分類資料'}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField label="產地" value={formState.origin} onChange={(event) => onOriginChange(event.target.value)} fullWidth />
            <TextField
              label="低庫存門檻（商品覆蓋）"
              type="number"
              value={formState.low_stock_threshold}
              onChange={(event) => onLowStockThresholdChange(event.target.value)}
              fullWidth
              helperText="留空表示使用儀表板全域門檻"
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
            <TextField
              label="狀態"
              select
              value={formState.status_code}
              onChange={(event) => onStatusChange(Number(event.target.value) as StatusCode)}
              fullWidth
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            label="商品描述"
            value={formState.description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            fullWidth
            multiline
            minRows={4}
          />

          <Divider />

          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              商品單位
            </Typography>
            <Button size="small" startIcon={<AddRoundedIcon />} onClick={onAddUnitRow}>
              新增單位
            </Button>
          </Stack>

          {!unitOptions.length ? <Alert severity="warning">目前沒有可用單位選項，請先確認後端已存在單位資料。</Alert> : null}

          <Stack spacing={1.5}>
            {formState.units.map((unit, index) => (
              <Paper key={`${unit.unit_id || 'unit'}-${index}`} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { md: 'flex-start' } }}>
                  <TextField
                    label="單位"
                    select
                    value={unit.unit_id}
                    onChange={(event) => onUnitFieldChange(index, 'unit_id', event.target.value)}
                    fullWidth
                  >
                    {unitOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="售價"
                    type="number"
                    value={unit.price}
                    onChange={(event) => onUnitFieldChange(index, 'price', event.target.value)}
                    fullWidth
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  />
                  <TextField
                    label="庫存"
                    type="number"
                    value={unit.stock}
                    onChange={(event) => onUnitFieldChange(index, 'stock', event.target.value)}
                    fullWidth
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  />
                  <IconButton
                    color="error"
                    onClick={() => onRemoveUnitRow(index)}
                    disabled={formState.units.length === 1}
                    sx={{ mt: { md: 0.5 } }}
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Stack>

          {mode === 'create' ? (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  商品圖片
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  可先挑選圖片，按儲存後會自動上傳到新商品。
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Button component="label" variant="outlined" size="small" disabled={actionLoading}>
                    選擇圖片
                    <input
                      hidden
                      multiple
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? [])
                        if (files.length) {
                          onCreateImageFilesChange(files)
                        }
                        event.currentTarget.value = ''
                      }}
                    />
                  </Button>
                </Box>

                <Stack spacing={1} sx={{ mt: 1.5 }}>
                  {createImageFiles.length ? (
                    createImageFiles.map((file, index) => {
                      const isPrimary = index === createPrimaryIndex
                      return (
                        <Paper key={`${file.name}-${index}`} variant="outlined" sx={{ p: 1.5 }}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
                            <Stack spacing={0.5} sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {isPrimary ? '主圖' : '附圖'} · {file.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {(file.size / 1024).toFixed(1)} KB
                              </Typography>
                            </Stack>
                            <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1}>
                              <Button
                                size="small"
                                variant={isPrimary ? 'contained' : 'outlined'}
                                disabled={actionLoading || isPrimary}
                                onClick={() => onCreatePrimaryIndexChange(index)}
                              >
                                設為主圖
                              </Button>
                              <Button
                                color="error"
                                size="small"
                                variant="text"
                                startIcon={<DeleteOutlineRoundedIcon />}
                                disabled={actionLoading}
                                onClick={() => onRemoveCreateImage(index)}
                              >
                                移除
                              </Button>
                            </Stack>
                          </Stack>
                        </Paper>
                      )
                    })
                  ) : (
                    <Typography color="text.secondary">目前沒有待上傳圖片</Typography>
                  )}
                </Stack>
              </Box>
            </>
          ) : null}

          {mode === 'edit' && selectedProduct ? (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  商品圖片
                </Typography>
                {imageActionError ? (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {imageActionError}
                  </Alert>
                ) : null}
                <Box sx={{ mt: 1 }}>
                  <Button component="label" variant="outlined" size="small" disabled={imageActionLoading}>
                    {imageActionLoading ? '處理中...' : '批次上傳圖片'}
                    <input
                      hidden
                      multiple
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? [])
                        if (files.length) {
                          onUploadImages(files)
                        }
                        event.currentTarget.value = ''
                      }}
                    />
                  </Button>
                </Box>

                <Stack spacing={1} sx={{ mt: 1.5 }}>
                  {selectedProduct.images?.length ? (
                    selectedProduct.images
                      .slice()
                      .sort((left, right) => left.sort_order - right.sort_order)
                      .map((image) => {
                        const isPrimary = image.id === primaryImageId

                        return (
                        <Paper key={image.id} variant="outlined" sx={{ p: 1.5 }}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
                            <Box
                              component="img"
                              src={resolveImageUrl(image.file_url)}
                              alt={selectedProduct.name}
                              sx={{
                                width: { xs: '100%', sm: 120 },
                                height: { xs: 180, sm: 90 },
                                objectFit: 'cover',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            />
                            <Stack spacing={0.5} sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {isPrimary ? '主圖' : '附圖'} · {image.sort_order}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                                {image.file_url}
                              </Typography>
                            </Stack>
                            <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1}>
                              <Button
                                size="small"
                                variant={isPrimary ? 'contained' : 'outlined'}
                                disabled={imageActionLoading || isPrimary}
                                onClick={() => onSetPrimaryImage(image.id)}
                              >
                                設為主圖
                              </Button>
                              <Button
                                color="error"
                                size="small"
                                variant="text"
                                startIcon={<DeleteOutlineRoundedIcon />}
                                disabled={imageActionLoading}
                                onClick={() => onDeleteImage(image.id)}
                              >
                                刪除
                              </Button>
                            </Stack>
                          </Stack>
                        </Paper>
                        )
                      })
                  ) : (
                    <Typography color="text.secondary">目前沒有圖片</Typography>
                  )}
                </Stack>
              </Box>
            </>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={onSubmit} variant="contained" disabled={actionLoading || submitDisabled}>
          {actionLoading ? '儲存中...' : '儲存'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

type ProductViewDialogProps = {
  open: boolean
  selectedProduct: ProductResponse | null
  statusOptions: ProductStatusOption[]
  currencyFormatter: Intl.NumberFormat
  formatDateTime: (value: string) => string
  resolveImageUrl: (fileUrl: string) => string
  onClose: () => void
}

export const ProductViewDialog = ({
  open,
  selectedProduct,
  statusOptions,
  currencyFormatter,
  formatDateTime,
  resolveImageUrl,
  onClose,
}: ProductViewDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>商品詳情</DialogTitle>
      <DialogContent dividers>
        {selectedProduct ? (
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                商品名稱
              </Typography>
              <Typography variant="h6">{selectedProduct.name}</Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  分類
                </Typography>
                <Typography>{selectedProduct.category_name || '-'}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  產地
                </Typography>
                <Typography>{selectedProduct.origin || '-'}</Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  狀態
                </Typography>
                <Typography>
                  {statusOptions.find((item) => item.value === selectedProduct.status_code)?.label ||
                    `狀態 ${selectedProduct.status_code}`}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  低庫存門檻
                </Typography>
                <Typography>{selectedProduct.low_stock_threshold ?? '使用全域設定'}</Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  建立時間
                </Typography>
                <Typography>{formatDateTime(selectedProduct.created_at)}</Typography>
              </Box>
            </Stack>

            <Box>
              <Typography variant="caption" color="text.secondary">
                商品描述
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selectedProduct.description || '-'}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                單位價格
              </Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {selectedProduct.units.length ? (
                  selectedProduct.units.map((unit) => (
                    <Paper key={String(unit.unit_id)} variant="outlined" sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{unit.unit_name || unit.unit_id}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            庫存 {unit.stock}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 700 }}>{currencyFormatter.format(unit.price)}</Typography>
                      </Box>
                    </Paper>
                  ))
                ) : (
                  <Typography>-</Typography>
                )}
              </Stack>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                圖片
              </Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {selectedProduct.images?.length ? (
                  selectedProduct.images.map((image) => (
                    <Paper key={image.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
                        <Box
                          component="img"
                          src={resolveImageUrl(image.file_url)}
                          alt={selectedProduct.name}
                          sx={{
                            width: { xs: '100%', sm: 120 },
                            height: { xs: 180, sm: 90 },
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                        <Stack spacing={0.5} sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {image.is_primary ? '主圖' : '附圖'} · {image.sort_order}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                            {image.file_url}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))
                ) : (
                  <Typography>-</Typography>
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

