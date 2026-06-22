import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

export type ConfirmActionDialogProps = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

const ConfirmActionDialog = ({
  open,
  title,
  description,
  confirmText = '確認',
  cancelText = '取消',
  confirmColor = 'primary',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmActionDialogProps) => {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      {description ? (
        <DialogContent>
          <Typography color="text.secondary">{description}</Typography>
        </DialogContent>
      ) : null}
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} disabled={loading} variant="contained" color={confirmColor}>
          {loading ? '處理中...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmActionDialog
