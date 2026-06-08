import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { useEffect, useState } from 'react'
import {
  Alert,
  Avatar,
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
import { usersService } from '@/api'
import type { UserResponse } from '@/api'

const roleLabelMap: Record<number, string> = {
  1: '管理員',
  2: '員工',
  3: '會員',
}

const statusLabelMap: Record<number, string> = {
  1: '啟用',
  2: '停用',
  3: '刪除',
}

const UsersPage = () => {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
        const data = await usersService.getList({ skip: 0, limit: 100 })
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入使用者資料失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchUsers()
  }, [])

  return (
    <Paper sx={{ p: 2.4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <PersonOutlineRoundedIcon color="primary" />
          <Typography variant="h5">使用者管理</Typography>
        </Stack>
        <Button variant="outlined" size="small" startIcon={<RefreshRoundedIcon />} onClick={() => void fetchUsers()}>
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
            <TableCell>姓名</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>角色</TableCell>
            <TableCell>狀態</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.email} hover>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ width: 30, height: 30, fontSize: 13 }}>{user.user_name.slice(0, 1)}</Avatar>
                  <Typography variant="body2">{user.user_name}</Typography>
                </Stack>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{roleLabelMap[user.role_code] || `角色 ${user.role_code}`}</TableCell>
              <TableCell>
                <Chip
                  label={statusLabelMap[user.status_code] || `狀態 ${user.status_code}`}
                  size="small"
                  color={user.status_code === 1 ? 'success' : 'default'}
                  variant={user.status_code === 1 ? 'filled' : 'outlined'}
                />
              </TableCell>
            </TableRow>
          ))}
          {!users.length ? (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                尚無使用者資料
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Paper>
  )
}

export default UsersPage
