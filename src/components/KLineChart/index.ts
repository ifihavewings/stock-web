// 导出所有组件和类型
export { default as KLineChart } from './KLineChart';
export * from './types';

// 便捷的配置预设
export const CHART_PRESETS = {
  // 默认配置
  default: {
    width: 800,
    height: 400,
    theme: 'light' as const
  },
  
  // 紧凑模式
  compact: {
    width: 600,
    height: 300,
    theme: 'light' as const,
    layout: {
      fontSize: 11
    },
    timeScale: {
      barSpacing: 6
    }
  },
  
  // 全屏模式
  fullscreen: {
    width: window.innerWidth,
    height: window.innerHeight - 100,
    theme: 'dark' as const,
    layout: {
      fontSize: 14
    }
  },
  
  // 移动端优化
  mobile: {
    width: 350,
    height: 250,
    theme: 'light' as const,
    layout: {
      fontSize: 10
    },
    timeScale: {
      barSpacing: 4,
      rightOffset: 2
    },
    rightPriceScale: {
      scaleMargins: { top: 0.15, bottom: 0.15 }
    }
  }
};

// 常用的颜色主题
export const COLOR_THEMES = {
  classic: {
    upColor: '#00da3c',
    downColor: '#ec0000'
  },
  modern: {
    upColor: '#26a69a',
    downColor: '#ef5350'
  },
  tradingview: {
    upColor: '#4CAF50',
    downColor: '#F44336'
  }
};