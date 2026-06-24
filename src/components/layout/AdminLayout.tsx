import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import DiscountRoundedIcon from '@mui/icons-material/DiscountRounded'
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded'
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded'
import { Box, Button, Divider, Stack, Typography } from '@mui/material'
import { Outlet, useLocation, useNavigate, Link as RouterLink } from 'react-router-dom'
import menuList from '@/settings/menu'

const iconMap = {
  儀表板: <DashboardRoundedIcon fontSize="small" />,
  商品管理: <Inventory2RoundedIcon fontSize="small" />,
  分類管理: <CategoryRoundedIcon fontSize="small" />,
  單位管理: <StraightenRoundedIcon fontSize="small" />,
  庫存調整: <TuneRoundedIcon fontSize="small" />,
  訂單管理: <ReceiptLongRoundedIcon fontSize="small" />,
  Email範本設定: <MarkEmailReadRoundedIcon fontSize="small" />,
  頁面內容管理: <ArticleRoundedIcon fontSize="small" />,
  優惠券管理: <DiscountRoundedIcon fontSize="small" />,
  使用者管理: <PeopleAltRoundedIcon fontSize="small" />,
}

const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('authUser')
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        sx={{
          position: 'relative',
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          background:
            'linear-gradient(120deg, rgba(19, 85, 62, 0.96) 0%, rgba(31, 109, 87, 0.9) 40%, rgba(22, 76, 95, 0.88) 100%)',
          color: 'common.white',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            py: { xs: 3, md: 4 },
            px: { xs: 2, md: 4 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.6 }}>
              MEGARANG ADMIN
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.86)' }}>
              電商後台管理中心
            </Typography>
          </Box>
          <Button
            onClick={handleLogout}
            startIcon={<LogoutRoundedIcon />}
            sx={{
              color: 'common.white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            登出
          </Button>
        </Box>
      </Box>

      <Box sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, md: 4 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ alignItems: 'stretch' }}>
          <Box
            component="aside"
            sx={{
              width: { xs: '100%', md: 260 },
              flexShrink: 0,
              borderRadius: 2,
              bgcolor: 'background.paper',
              p: 1.25,
            }}
          >
            {menuList.map((item, index) => {
              const isActive = location.pathname === item.link

              return (
                <Box key={item.label}>
                  <Box
                    component={RouterLink}
                    to={item.link}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      textDecoration: 'none',
                      borderRadius: 1.5,
                      px: 1.5,
                      py: 1.2,
                      color: isActive ? 'primary.main' : 'text.secondary',
                      bgcolor: isActive ? 'primary.light' : 'transparent',
                      transition: 'all 180ms ease',
                      '&:hover': {
                        bgcolor: isActive ? 'primary.light' : 'grey.100',
                        color: isActive ? 'primary.main' : 'text.primary',
                      },
                    }}
                  >
                    {iconMap[item.label as keyof typeof iconMap]}
                    <Typography variant="body2" sx={{ fontWeight: isActive ? 700 : 600 }}>
                      {item.label}
                    </Typography>
                  </Box>
                  {index !== menuList.length - 1 && <Divider sx={{ my: 0.6 }} />}
                </Box>
              )
            })}
          </Box>

          <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
            <Outlet />
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}

export default AdminLayout
