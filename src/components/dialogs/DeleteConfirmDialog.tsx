import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

export type DeleteConfirmDialogProps = {
  open: boolean
  title?: string
  targetName?: string
  description?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  error?: string
  onConfirm: () => void
  onClose: () => void
}

const DeleteConfirmDialog = ({
  open,
  title = '確認刪除',
  targetName,
  description,
  confirmText = '刪除',
  cancelText = '取消',
  loading = false,
  error = '',
  onConfirm,
  onClose,
}: DeleteConfirmDialogProps) => {
  const defaultDescription = targetName
    ? `確定要刪除「${targetName}」嗎？這個操作無法復原。`
    : '確定要刪除這筆資料嗎？這個操作無法復原。'

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Typography>{description ?? defaultDescription}</Typography>
        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
          {loading ? '刪除中...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteConfirmDialog
