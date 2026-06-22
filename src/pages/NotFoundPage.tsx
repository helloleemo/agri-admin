import { Box, Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <Stack
      sx={{
        minHeight: '60vh',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        px: 3,
      }}
      spacing={1.5}
    >
      <Typography variant="h3">404</Typography>
      <Typography variant="h6">找不到這個管理頁面</Typography>
      <Box>
        <Button component={RouterLink} to="/dashboard" variant="contained">
          回到儀表板
        </Button>
      </Box>
    </Stack>
  )
}

export default NotFoundPage
