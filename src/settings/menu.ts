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
    label: 'Email範本設定',
    link: `/${PATHS.emailTemplates}`,
  },
  {
    label: '首頁內容管理',
    link: `/${PATHS.siteContent}`,
  },
  {
    label: '優惠券管理',
    link: `/${PATHS.coupons}`,
  },
  {
    label: '使用者管理',
    link: `/${PATHS.users}`,
  },
]

export default menuList
