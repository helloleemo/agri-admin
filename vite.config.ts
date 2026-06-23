import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules/@mui/icons-material')) {
            return 'mui-icons'
          }
          if (id.includes('node_modules/@mui/x-data-grid')) {
            if (id.includes('/internals/')) {
              return 'mui-data-grid-internals'
            }
            if (id.includes('/components/')) {
              return 'mui-data-grid-components'
            }
            if (id.includes('/hooks/')) {
              return 'mui-data-grid-hooks'
            }
            return 'mui-data-grid-core'
          }
          if (id.includes('node_modules/@mui/material')) {
            return 'mui-material'
          }
          if (id.includes('node_modules/@mui/system')) {
            return 'mui-system'
          }
          if (id.includes('node_modules/@mui/utils')) {
            return 'mui-utils'
          }
          if (id.includes('node_modules/@mui/base')) {
            return 'mui-base'
          }
          if (id.includes('node_modules/@mui/')) {
            return 'mui-other'
          }
          if (id.includes('node_modules/@emotion/')) {
            return 'emotion'
          }
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor'
          }
          return undefined
        },
      },
    },
  },
})
