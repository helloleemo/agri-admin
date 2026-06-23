import PATHS from '@/routes/paths'

const menuList = [
  {
    label: '儀表板',
    link: `/${PATHS.dashboard}`,
  },
  {
    label: '單位管理',
    link: `/${PATHS.units}`,
  },
  {
    label: '分類管理',
    link: `/${PATHS.categories}`,
  },
  {
    label: '商品管理',
    link: `/${PATHS.products}`,
  },
  {
    label: '訂單管理',
    link: `/${PATHS.orders}`,
  },  {
    label: '庫存調整',
    link: `/${PATHS.inventories}`,
  },
  {
    label: '優惠券管理',
    link: `/${PATHS.coupons}`,
  },
  {
    label: '使用者管理',
    link: `/${PATHS.users}`,
  },  {
    label: 'Email範本設定',
    link: `/${PATHS.emailTemplates}`,
  },
  {
    label: '頁面內容管理',
    link: `/${PATHS.siteContent}`,
  },
]

export default menuList
