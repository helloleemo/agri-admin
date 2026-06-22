import { createTheme } from '@mui/material/styles'
import palette from '@/theme/palette'
import typography from '@/theme/typography'

const appTheme = createTheme({
  palette,
  shape: {
    borderRadius: 8,
  },
  typography,
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #e4ece8',
          boxShadow: '0 10px 26px rgba(12, 62, 45, 0.07)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: 18,
        },
      },
    },
  },
})

export default appTheme
