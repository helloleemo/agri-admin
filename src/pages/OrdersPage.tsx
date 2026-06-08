import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { ordersService } from '@/api'
import type { OrderResponse } from '@/api'

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

const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    void fetchOrders()
  }, [])

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [orders],
  )

  return (
    <Paper sx={{ p: 2.4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LocalShippingRoundedIcon color="primary" />
          <Typography variant="h5">訂單管理</Typography>
        </Stack>
        <Button variant="outlined" size="small" startIcon={<RefreshRoundedIcon />} onClick={() => void fetchOrders()}>
          重新整理
        </Button>
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
            <TableCell>訂單編號</TableCell>
            <TableCell>客戶</TableCell>
            <TableCell>建立日期</TableCell>
            <TableCell>商品數</TableCell>
            <TableCell>狀態</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedOrders.map((order) => (
            <TableRow key={order.id} hover>
              <TableCell>{order.order_no || order.id.slice(0, 8)}</TableCell>
              <TableCell>{order.user_name || '-'}</TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString('zh-TW')}</TableCell>
              <TableCell>{order.items.length}</TableCell>
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
          {!sortedOrders.length ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                尚無訂單資料
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Paper>
  )
}

export default OrdersPage
