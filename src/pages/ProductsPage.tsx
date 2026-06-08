import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { productService } from '@/api'
import type { ProductResponse } from '@/api'

const currencyFormatter = new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
})

const ProductsPage = () => {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
        const data = await productService.getList({ skip: 0, limit: 100 })
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入商品資料失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    if (!normalizedKeyword) {
      return products
    }
    return products.filter((product) => product.name.toLowerCase().includes(normalizedKeyword))
  }, [keyword, products])

  const getPriceText = (product: ProductResponse) => {
    if (!product.units.length) {
      return '--'
    }
    const minPrice = Math.min(...product.units.map((unit) => unit.price))
    return currencyFormatter.format(minPrice)
  }

  const getStockCount = (product: ProductResponse) => {
    return product.units.reduce((sum, unit) => sum + unit.stock, 0)
  }

  return (
    <Paper sx={{ p: 2.4 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        spacing={1.5}
        sx={{ mb: 2.4 }}
      >
        <Box>
          <Typography variant="h5" sx={{ mb: 0.6 }}>
            商品管理
          </Typography>
          <Typography variant="body2" color="text.secondary">
            維護商品資訊、價格與庫存狀態
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
          <TextField
            size="small"
            placeholder="搜尋商品名稱"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void fetchProducts()}>
            重新整理
          </Button>
        </Stack>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert> : null}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : null}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>商品名稱</TableCell>
            <TableCell>分類</TableCell>
            <TableCell>售價</TableCell>
            <TableCell>庫存</TableCell>
            <TableCell align="right">操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.name} hover>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.category_name || '-'}</TableCell>
              <TableCell>{getPriceText(product)}</TableCell>
              <TableCell>{getStockCount(product)}</TableCell>
              <TableCell align="right">
                <Chip
                  label={product.status_code === 1 ? '啟用' : '停用'}
                  color={product.status_code === 1 ? 'success' : 'default'}
                  size="small"
                  variant={product.status_code === 1 ? 'filled' : 'outlined'}
                />
              </TableCell>
            </TableRow>
          ))}
          {!filteredProducts.length ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                尚無商品資料
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Paper>
  )
}

export default ProductsPage
