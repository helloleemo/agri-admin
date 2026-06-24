import { useState } from 'react'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { authService } from '@/api'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const fromPath = (location.state as { from?: string } | null)?.from || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')
      const response = await authService.login({ email, password })
      localStorage.setItem('accessToken', response.access_token)
      localStorage.setItem('authUser', JSON.stringify(response.user))
      navigate(fromPath, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background:
          'linear-gradient(135deg, rgba(15, 52, 44, 0.96) 0%, rgba(26, 87, 74, 0.9) 45%, rgba(19, 61, 84, 0.9) 100%)',
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 460, p: 4 }}>
        <Stack spacing={2.4} component="form" onSubmit={handleSubmit}>
          <Box>
            <Typography variant="h5" sx={{ mb: 0.8 }}>
              電商管理平台
            </Typography>
            <Typography color="text.secondary">登入後可管理後台功能</Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
          />
          <TextField
            label="密碼"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            fullWidth
          />

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? '登入中...' : '登入'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default LoginPage