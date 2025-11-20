import { createTheme } from '@mui/material/styles'

// 黑白主题配置
export const blackAndWhiteTheme = createTheme({
  palette: {
    mode: 'light', // 或者 'dark'
    primary: {
      main: '#000000',      // 主色：黑色
      light: '#333333',     // 浅一点的黑色
      dark: '#000000',      // 深黑色
      contrastText: '#ffffff', // 对比文字：白色
    },
    secondary: {
      main: '#ffffff',      // 次要色：白色
      light: '#f5f5f5',     // 浅灰色
      dark: '#e0e0e0',      // 深一点的灰色
      contrastText: '#000000', // 对比文字：黑色
    },
    background: {
      default: '#ffffff',   // 默认背景：白色
      paper: '#f8f8f8',     // 纸张背景：浅灰色
    },
    text: {
      primary: '#000000',   // 主要文字：黑色
      secondary: '#666666', // 次要文字：深灰色
      disabled: '#999999',  // 禁用文字：浅灰色
    },
    divider: '#e0e0e0',     // 分割线：灰色
    action: {
      hover: '#f5f5f5',     // 悬停背景
      selected: '#e0e0e0',  // 选中背景
      disabled: '#cccccc',  // 禁用背景
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      color: '#000000',
      fontWeight: 700,
    },
    h2: {
      color: '#000000',
      fontWeight: 600,
    },
    h3: {
      color: '#000000',
      fontWeight: 600,
    },
    h4: {
      color: '#000000',
      fontWeight: 500,
    },
    body1: {
      color: '#000000',
    },
    body2: {
      color: '#666666',
    },
  },
  components: {
    // 自定义组件样式
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // 不转换文字大小写
          borderRadius: '4px',
        },
        contained: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
        outlined: {
          borderColor: '#000000',
          color: '#000000',
          '&:hover': {
            borderColor: '#333333',
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#000000',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f5f5f5',
          color: '#000000',
          fontWeight: 600,
        },
        body: {
          color: '#000000',
        },
      },
    },
  },
})

// 纯黑白主题（更极端的版本）
export const pureBlackWhiteTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffffff',
      contrastText: '#000000',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#000000',
    },
    divider: '#000000',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#000000',
            opacity: 0.8,
          },
        },
        outlined: {
          borderColor: '#000000',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#ffffff',
            borderColor: '#000000',
          },
        },
      },
    },
  },
})