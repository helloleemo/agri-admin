import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Chip, Paper, Stack, Typography } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { productService, type ProductResponse } from '@/api'

const UnitsPage = () => {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [pageError, setPageError] = useState('')

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setPageError('')
      const data = await productService.getList({ skip: 0, limit: 100 })
      setProducts(data)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '載入單位資料失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchProducts()
    }

    void loadInitialData()
  }, [])

  const unitRows = useMemo(() => {
    const units = new Map<
      string,
      {
        id: string
        unit_name: string
        product_count: number
        price_min: number
        price_max: number
        stock_total: number
      }
    >()

    products.forEach((product) => {
      product.units.forEach((unit) => {
        const current = units.get(unit.unit_id)
        if (current) {
          current.product_count += 1
          current.price_min = Math.min(current.price_min, unit.price)
          current.price_max = Math.max(current.price_max, unit.price)
          current.stock_total += unit.stock
          return
        }

        units.set(unit.unit_id, {
          id: unit.unit_id,
          unit_name: unit.unit_name || unit.unit_id,
          product_count: 1,
          price_min: unit.price,
          price_max: unit.price,
          stock_total: unit.stock,
        })
      })
    })

    return [...units.values()].sort((left, right) => left.unit_name.localeCompare(right.unit_name, 'zh-TW'))
  }, [products])

  const columns: GridColDef<(typeof unitRows)[number]>[] = [
    { field: 'unit_name', headerName: '單位名稱', flex: 1, minWidth: 160 },
    {
      field: 'product_count',
      headerName: '使用商品數',
      minWidth: 120,
    },
    {
      field: 'price_range',
      headerName: '價格區間',
      minWidth: 140,
      valueGetter: (_, row) =>
        row.price_min === row.price_max ? `$${row.price_min}` : `$${row.price_min} ~ $${row.price_max}`,
    },
    {
      field: 'stock_total',
      headerName: '總庫存',
      minWidth: 100,
    },
    {
      field: 'status',
      headerName: '狀態',
      minWidth: 110,
      renderCell: () => <Chip label="系統資料" size="small" color="info" variant="outlined" />,
    },
  ]

  return (
    <Paper sx={{ p: 2.4 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ mb: 2.4, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}
      >
        <Box>
          <Typography variant="h5" sx={{ mb: 0.6 }}>
            單位管理
          </Typography>
          <Typography variant="body2" color="text.secondary">
            目前單位資料由商品使用狀況匯總顯示
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
          <Chip label={`共 ${unitRows.length} 種單位`} color="primary" variant="outlined" />
          <Chip label="資料來自商品單位" color="default" variant="outlined" />
          <Chip
            icon={<RefreshRoundedIcon />}
            label="重新整理"
            color="default"
            variant="outlined"
            onClick={() => void fetchProducts()}
          />
        </Stack>
      </Stack>

      {pageError ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {pageError}
        </Alert>
      ) : null}

      <DataGrid
        autoHeight
        rows={unitRows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
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
    </Paper>
  )
}

export default UnitsPage
