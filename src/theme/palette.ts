import type { PaletteOptions } from '@mui/material/styles'

const palette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#165b47',
    light: '#e8f3ef',
    dark: '#0f4032',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#bf7a1f',
    light: '#f2c57d',
    dark: '#8a5817',
    contrastText: '#ffffff',
  },
  grey: {
    50: '#f8faf9',
    100: '#eff4f2',
    200: '#dfe8e4',
    300: '#cad8d3',
    400: '#9fb4ac',
    500: '#728982',
    600: '#596c66',
    700: '#43524d',
    800: '#2d3a36',
    900: '#18211f',
  },
  background: {
    default: '#f4f7f5',
    paper: '#ffffff',
  },
  text: {
    primary: '#1c2925',
    secondary: '#4a5d57',
  },
  success: {
    main: '#2e7d32',
  },
  warning: {
    main: '#ed6c02',
  },
  error: {
    main: '#d32f2f',
  },
  info: {
    main: '#0288d1',
  },
}

export default palette
