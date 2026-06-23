import AddRoundedIcon from '@mui/icons-material/AddRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Box, Button, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type PageToolbarProps = {
  title: string
  description?: string | ReactNode
  titleIcon?: ReactNode
  keyword?: string
  searchPlaceholder?: string
  onKeywordChange?: (value: string) => void
  addLabel?: string
  onAdd?: () => void
  refreshLabel?: string
  onRefresh: () => void
  extraActions?: ReactNode
}

const PageToolbar = ({
  title,
  description,
  titleIcon,
  keyword,
  searchPlaceholder,
  onKeywordChange,
  addLabel,
  onAdd,
  refreshLabel = '重新整理',
  onRefresh,
  extraActions,
}: PageToolbarProps) => {
  const showSearch = typeof keyword === 'string' && Boolean(onKeywordChange)
  const showAdd = Boolean(addLabel && onAdd)

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      sx={{ mb: 2.4, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}
    >
      <Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {titleIcon}
          <Typography variant="h5">{title}</Typography>
        </Stack>
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
            {description}
          </Typography>
        ) : null}
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
        {showSearch ? (
          <TextField
            size="small"
            placeholder={searchPlaceholder || '搜尋'}
            value={keyword}
            onChange={(event) => onKeywordChange?.(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        ) : null}

        {showAdd ? (
          <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={onAdd}>
            {addLabel}
          </Button>
        ) : null}

        <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={onRefresh}>
          {refreshLabel}
        </Button>

        {extraActions}
      </Stack>
    </Stack>
  )
}

export default PageToolbar
