import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { ordersService, productService, usersService } from '@/api'
import type { OrderResponse, ProductResponse, UserResponse } from '@/api'

const DEFAULT_LOW_STOCK_THRESHOLD = 10
const DASHBOARD_LOW_STOCK_THRESHOLD_KEY = 'agri-admin:dashboard-low-stock-threshold'

const statusLabelMap: Record<number, string> = {
  1: '啟用',
  2: '停用',
  3: '刪除',
}

const statusColorMap: Record<number, 'success' | 'warning' | 'default' | 'error'> = {
  1: 'success',
  2: 'warning',
  3: 'default',
}

interface LowStockItem {
  id: string
  name: string
  threshold: number
  currentStock: number
}

const DashboardPage = () => {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [users, setUsers] = useState<UserResponse[]>([])
  const [globalLowStockThreshold, setGlobalLowStockThreshold] = useState(DEFAULT_LOW_STOCK_THRESHOLD)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = window.localStorage.getItem(DASHBOARD_LOW_STOCK_THRESHOLD_KEY)
    if (!saved) {
      return
    }

    const parsed = Number(saved)
    if (Number.isInteger(parsed) && parsed >= 0) {
      setGlobalLowStockThreshold(parsed)
    }
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        setError('')
        const [productList, orderList, userList] = await Promise.all([
          productService.getList({ skip: 0, limit: 100 }),
          ordersService.getList({ skip: 0, limit: 100 }),
          usersService.getList({ skip: 0, limit: 100 }),
        ])
        setProducts(productList)
        setOrders(orderList)
        setUsers(userList)
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入儀表板資料失敗')
      } finally {
        setLoading(false)
      }
    }

    void fetchAll()
  }, [])

  const statCards = useMemo(
    () => [
      {
        label: '總訂單數',
        value: String(orders.length),
        trend: '即時',
        icon: <ShoppingCartCheckoutRoundedIcon />,
      },
      {
        label: '會員數',
        value: String(users.length),
        trend: '即時',
        icon: <TrendingUpRoundedIcon />,
      },
      {
        label: '上架商品數',
        value: String(products.filter((product) => product.status_code === 1).length),
        trend: '即時',
        icon: <Inventory2RoundedIcon />,
      },
    ],
    [orders.length, products, users.length],
  )

  const latestOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5),
    [orders],
  )

  const lowStock = useMemo<LowStockItem[]>(() => {
    return products
      .map((product) => {
        const threshold = product.low_stock_threshold ?? globalLowStockThreshold
        const currentStock = product.units.reduce((sum, unit) => sum + unit.stock, 0)

        return {
          id: product.id,
          name: product.name,
          threshold,
          currentStock,
          hasLowStock: currentStock <= threshold,
        }
      })
      .filter((item) => item.hasLowStock)
      .sort((a, b) => a.currentStock - b.currentStock)
      .slice(0, 5)
  }, [globalLowStockThreshold, products])

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', md: '2rem' } }}>
        後台儀表板
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <Stack sx={{ py: 6, alignItems: 'center' }}>
          <CircularProgress />
        </Stack>
      ) : null}

      <Grid container spacing={2}>
        {statCards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper sx={{ p: 2.2 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.8 }}>
                    {card.label}
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 0.9 }}>
                    {card.value}
                  </Typography>
                  <Chip label={card.trend} size="small" color="primary" variant="outlined" />
                </Box>
                <Box sx={{ color: 'primary.main' }}>{card.icon}</Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2.2 }}>
            <Typography variant="h6" sx={{ mb: 1.4 }}>
              最新訂單
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>訂單編號</TableCell>
                  <TableCell>客戶</TableCell>
                  <TableCell>金額</TableCell>
                  <TableCell>狀態</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {latestOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.order_no || order.id.slice(0, 8)}</TableCell>
                    <TableCell>{order.user_name || '未知使用者'}</TableCell>
                    <TableCell>{order.items.length} 項</TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabelMap[order.status_code] || `狀態 ${order.status_code}`}
                        size="small"
                        color={statusColorMap[order.status_code] || 'default'}
                        variant={order.status_code === 1 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1.2, alignItems: 'center' }}>
              <WarningAmberRoundedIcon color="warning" />
              <Typography variant="h6">低庫存提醒</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.2 }}>
              目前全域門檻：{globalLowStockThreshold}
            </Typography>
            <Stack spacing={1.1}>
              {lowStock.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 1.2,
                    borderRadius: 1.5,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="body2">
                      {item.name}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      目前庫存 / 庫存門檻：{item.currentStock} / {item.threshold}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {!lowStock.length ? <Typography color="text.secondary">目前沒有低庫存商品</Typography> : null}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default DashboardPage
