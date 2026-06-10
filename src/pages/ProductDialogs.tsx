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
  onClose: () => void
  onSubmit: () => void
  onNameChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onOriginChange: (value: string) => void
  onStatusChange: (value: StatusCode) => void
  onDescriptionChange: (value: string) => void
  onAddUnitRow: () => void
  onUnitFieldChange: (index: number, field: keyof ProductUnitFormRow, value: string) => void
  onRemoveUnitRow: (index: number) => void
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
  onClose,
  onSubmit,
  onNameChange,
  onCategoryChange,
  onOriginChange,
  onStatusChange,
  onDescriptionChange,
  onAddUnitRow,
  onUnitFieldChange,
  onRemoveUnitRow,
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={onSubmit} variant="contained" disabled={actionLoading || !unitOptions.length}>
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
  onClose: () => void
}

export const ProductViewDialog = ({
  open,
  selectedProduct,
  statusOptions,
  currencyFormatter,
  formatDateTime,
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
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {image.is_primary ? '主圖' : '附圖'} · {image.sort_order}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                          {image.file_url}
                        </Typography>
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

type ProductDeleteDialogProps = {
  open: boolean
  deleteTarget: ProductResponse | null
  actionError: string
  actionLoading: boolean
  onClose: () => void
  onDelete: () => void
}

export const ProductDeleteDialog = ({
  open,
  deleteTarget,
  actionError,
  actionLoading,
  onClose,
  onDelete,
}: ProductDeleteDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>刪除商品</DialogTitle>
      <DialogContent dividers>
        <Typography>確定要刪除「{deleteTarget?.name || ''}」嗎？這個操作無法復原。</Typography>
        {actionError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {actionError}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button color="error" variant="contained" onClick={onDelete} disabled={actionLoading}>
          {actionLoading ? '刪除中...' : '刪除'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
