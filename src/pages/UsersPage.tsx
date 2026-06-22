import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { authService, ordersService, usersService } from '@/api'
import type { OrderResponse, UserCreatePayload, UserResponse, UserUpdatePayload } from '@/api'
import { DeleteConfirmDialog } from '@/components/dialogs'
import PageToolbar from '@/components/layout/PageToolbar'
import {
  UserFormDialog,
  UserOrderDetailDialog,
  UserViewDialog,
  type UserFormState,
} from '@/pages/UsersDialogs'

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

const createEmptyForm = (): UserFormState => ({
  email: '',
  user_name: '',
  password: '',
  role_code: 3,
})

const buildFormFromUser = (user: UserResponse): UserFormState => ({
  email: user.email,
  user_name: user.user_name,
  password: '',
  role_code: user.role_code,
})

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-TW')
}

const currencyFormatter = new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
})

const UsersPage = () => {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [pageError, setPageError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [sendVerificationOnCreate, setSendVerificationOnCreate] = useState(true)
  const [markVerifiedOnCreate, setMarkVerifiedOnCreate] = useState(false)
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view' | null>(null)
  const [orderDetailOpen, setOrderDetailOpen] = useState(false)
  const [orderDetailLoading, setOrderDetailLoading] = useState(false)
  const [orderDetailError, setOrderDetailError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null)
  const [formState, setFormState] = useState<UserFormState>(createEmptyForm())

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setPageError('')
      const data = await usersService.getList({ skip: 0, limit: 100 })
      setUsers(data)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '載入使用者資料失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadUsers = async () => {
      await fetchUsers()
    }

    void loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    if (!normalizedKeyword) {
      return users
    }

    return users.filter((user) => {
      const searchableText = [
        user.user_name,
        user.email,
        roleLabelMap[user.role_code],
        statusLabelMap[user.status_code],
      ]
        .filter((value): value is string => Boolean(value))
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedKeyword)
    })
  }, [keyword, users])

  const openCreateDialog = () => {
    setSelectedUser(null)
    setFormState(createEmptyForm())
    setSendVerificationOnCreate(true)
    setMarkVerifiedOnCreate(false)
    setActionError('')
    setDialogMode('create')
  }

  const openEditDialog = (user: UserResponse) => {
    setSelectedUser(user)
    setFormState(buildFormFromUser(user))
    setActionError('')
    setDialogMode('edit')
  }

  const openViewDialog = (user: UserResponse) => {
    setSelectedUser(user)
    setActionError('')
    setDialogMode('view')
  }

  const closeDialog = () => {
    setSelectedUser(null)
    setActionError('')
    setSendVerificationOnCreate(true)
    setMarkVerifiedOnCreate(false)
    setDialogMode(null)
    setFormState(createEmptyForm())
  }

  const openOrderDetailDialog = async (orderId: string) => {
    setOrderDetailOpen(true)
    setOrderDetailLoading(true)
    setOrderDetailError('')

    try {
      const data = await ordersService.getById(orderId)
      setSelectedOrder(data)
    } catch (err) {
      setSelectedOrder(null)
      setOrderDetailError(err instanceof Error ? err.message : '載入訂單詳細資訊失敗')
    } finally {
      setOrderDetailLoading(false)
    }
  }

  const closeOrderDetailDialog = () => {
    setOrderDetailOpen(false)
    setOrderDetailError('')
    setSelectedOrder(null)
  }

  const validateCreateForm = () => {
    if (!formState.user_name.trim()) {
      return '請輸入姓名'
    }

    if (!formState.email.trim()) {
      return '請輸入 Email'
    }

    if (!formState.password.trim()) {
      return '請輸入密碼'
    }

    if (formState.password.trim().length < 6) {
      return '密碼至少需要 6 個字元'
    }

    return ''
  }

  const validateEditForm = () => {
    if (!formState.user_name.trim()) {
      return '請輸入姓名'
    }

    if (!formState.email.trim()) {
      return '請輸入 Email'
    }

    if (formState.password.trim() && formState.password.trim().length < 6) {
      return '新密碼至少需要 6 個字元'
    }

    return ''
  }

  const handleSubmit = async () => {
    const validationError = dialogMode === 'create' ? validateCreateForm() : validateEditForm()
    if (validationError) {
      setActionError(validationError)
      return
    }

    try {
      setActionLoading(true)
      setActionError('')

      if (dialogMode === 'create') {
        const payload: UserCreatePayload = {
          email: formState.email.trim(),
          user_name: formState.user_name.trim(),
          password: formState.password,
          role_code: formState.role_code,
        }
        const createdUser = await usersService.create(payload)

        if (markVerifiedOnCreate) {
          await usersService.verifyEmail(createdUser.id)
          setNotice('使用者已新增，並由管理員直接驗證')
        } else if (sendVerificationOnCreate) {
          await authService.resendVerificationEmail({ email: payload.email })
          setNotice('使用者已新增，並已寄出驗證信')
        } else {
          setNotice('使用者已新增')
        }
      }

      if (dialogMode === 'edit' && selectedUser) {
        const payload: UserUpdatePayload = {
          email: formState.email.trim(),
          user_name: formState.user_name.trim(),
          role_code: formState.role_code,
          password: formState.password.trim() ? formState.password : undefined,
        }
        await usersService.update(selectedUser.id, payload)
        setNotice('使用者已更新')
      }

      closeDialog()
      await fetchUsers()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '儲存使用者失敗')
    } finally {
      setActionLoading(false)
    }
  }

  const handleResendVerification = async () => {
    const email = dialogMode === 'edit' ? formState.email.trim() : selectedUser?.email ?? ''
    if (!email) {
      setActionError('找不到可用的 Email')
      return
    }

    try {
      setVerificationLoading(true)
      setActionError('')
      await authService.resendVerificationEmail({ email })
      setNotice(`已重新寄送驗證信至 ${email}`)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '寄送驗證信失敗')
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleAdminVerify = async () => {
    if (!selectedUser) {
      setActionError('找不到可驗證的使用者')
      return
    }

    try {
      setVerificationLoading(true)
      setActionError('')
      await usersService.verifyEmail(selectedUser.id)
      setNotice(`已由管理員直接驗證 ${selectedUser.email}`)
      closeDialog()
      await fetchUsers()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '管理員驗證失敗')
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    try {
      setActionLoading(true)
      setActionError('')
      await usersService.delete(deleteTarget.id)
      setNotice('使用者已刪除')
      setDeleteTarget(null)
      await fetchUsers()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '刪除使用者失敗')
    } finally {
      setActionLoading(false)
    }
  }

  const columns: GridColDef<UserResponse>[] = [
    {
      field: 'user_name',
      headerName: '姓名',
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <Avatar sx={{ width: 30, height: 30, fontSize: 13 }}>{params.row.user_name.slice(0, 1)}</Avatar>
          <Typography variant="body2">{params.row.user_name}</Typography>
        </Stack>
      ),
    },
    { field: 'email', headerName: 'Email', minWidth: 220, flex: 1 },
    {
      field: 'role_code',
      headerName: '角色',
      minWidth: 120,
      valueGetter: (_, row) => roleLabelMap[row.role_code] || `角色 ${row.role_code}`,
    },
    {
      field: 'status_code',
      headerName: '狀態',
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <Chip
          label={statusLabelMap[params.row.status_code] || `狀態 ${params.row.status_code}`}
          size="small"
          color={params.row.status_code === 1 ? 'success' : 'default'}
          variant={params.row.status_code === 1 ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'email_verified_at',
      headerName: '認證',
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <Chip
          label={params.row.email_verified_at ? '已驗證' : '未驗證'}
          size="small"
          color={params.row.email_verified_at ? 'success' : 'warning'}
          variant={params.row.email_verified_at ? 'filled' : 'outlined'}
        />
      ),
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
        title="使用者管理"
        titleIcon={<PersonOutlineRoundedIcon color="primary" />}
        description="維護後台使用者帳號"
        keyword={keyword}
        searchPlaceholder="搜尋姓名或 Email"
        onKeywordChange={setKeyword}
        addLabel="新增使用者"
        onAdd={openCreateDialog}
        onRefresh={() => void fetchUsers()}
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
        rows={filteredUsers}
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

      <UserFormDialog
        open={dialogMode === 'create' || dialogMode === 'edit'}
        mode={dialogMode === 'create' ? 'create' : 'edit'}
        actionError={actionError}
        actionLoading={actionLoading}
        verificationLoading={verificationLoading}
        formState={formState}
        selectedUserVerified={Boolean(selectedUser?.email_verified_at)}
        sendVerificationOnCreate={sendVerificationOnCreate}
        markVerifiedOnCreate={markVerifiedOnCreate}
        onClose={closeDialog}
        onSubmit={() => void handleSubmit()}
        onUserNameChange={(value) => setFormState((current) => ({ ...current, user_name: value }))}
        onEmailChange={(value) => setFormState((current) => ({ ...current, email: value }))}
        onPasswordChange={(value) => setFormState((current) => ({ ...current, password: value }))}
        onRoleChange={(value) => setFormState((current) => ({ ...current, role_code: value }))}
        onToggleMarkVerifiedOnCreate={(checked) => {
          setMarkVerifiedOnCreate(checked)
          if (checked) {
            setSendVerificationOnCreate(false)
          }
        }}
        onToggleSendVerificationOnCreate={(checked) => {
          setSendVerificationOnCreate(checked)
          if (checked) {
            setMarkVerifiedOnCreate(false)
          }
        }}
        onAdminVerify={() => void handleAdminVerify()}
        onResendVerification={() => void handleResendVerification()}
      />

      <UserViewDialog
        open={dialogMode === 'view'}
        user={selectedUser}
        roleLabelMap={roleLabelMap}
        statusLabelMap={statusLabelMap}
        formatDateTime={formatDateTime}
        onOpenOrderDetail={(orderId) => void openOrderDetailDialog(orderId)}
        onClose={closeDialog}
      />

      <UserOrderDetailDialog
        open={orderDetailOpen}
        loading={orderDetailLoading}
        error={orderDetailError}
        order={selectedOrder}
        formatDateTime={formatDateTime}
        currencyFormatter={currencyFormatter}
        onClose={closeOrderDetailDialog}
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title="刪除使用者"
        targetName={deleteTarget?.user_name || ''}
        error={actionError}
        loading={actionLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </Paper>
  )
}

export default UsersPage
