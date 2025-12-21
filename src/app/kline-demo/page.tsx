'use client'

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Stack
} from '@mui/material';
import {
  ShowChart,
  Timeline,
  TrendingUp,
  Assessment,
  Speed,
  Palette
} from '@mui/icons-material';

import { 
  KLineChartContainer, 
  SimpleKLineChart,
  PRESET_INDICATOR_SETS 
} from '../components/KLineChart/index-new';

const DEMO_STOCKS = [
  { code: '000001', name: '平安银行', industry: '银行' },
  { code: '000002', name: '万科A', industry: '房地产开发' },
  { code: '000858', name: '五粮液', industry: '酒、饮料和精制茶制造业' },
  { code: '600000', name: '浦发银行', industry: '银行' },
  { code: '600519', name: '贵州茅台', industry: '酒、饮料和精制茶制造业' },
  { code: '600036', name: '招商银行', industry: '银行' },
];

const FEATURE_LIST = [
  {
    icon: <ShowChart color="primary" />,
    title: '专业K线图表',
    description: '基于TradingView Lightweight Charts，提供流畅的交互体验'
  },
  {
    icon: <Timeline color="secondary" />,
    title: '丰富技术指标',
    description: '支持MA、EMA、RSI、MACD、KDJ、布林带等主流技术指标'
  },
  {
    icon: <TrendingUp color="success" />,
    title: '实时数据更新',
    description: '支持WebSocket实时数据推送，第一时间获取最新行情'
  },
  {
    icon: <Assessment color="info" />,
    title: '多种图表模式',
    description: '支持日线、周线、月线等多种时间维度的K线图'
  },
  {
    icon: <Speed color="warning" />,
    title: '高性能渲染',
    description: '优化的数据处理和渲染算法，支持大量数据点'
  },
  {
    icon: <Palette color="error" />,
    title: '主题定制',
    description: '支持明暗主题切换，可自定义颜色配置'
  }
];

export default function KLineChartDemo() {
  const [selectedStock, setSelectedStock] = useState(DEMO_STOCKS[0].code);
  const [customStock, setCustomStock] = useState('');

  const handleStockChange = (stockCode: string) => {
    setSelectedStock(stockCode);
  };

  const handleCustomStockSubmit = () => {
    if (customStock.trim()) {
      setSelectedStock(customStock.trim());
    }
  };

  const selectedStockInfo = DEMO_STOCKS.find(stock => stock.code === selectedStock);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          K线图组件示例
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          基于 TradingView Lightweight Charts 的专业股票K线图组件
        </Typography>
      </Box>

      {/* 功能特性 */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          功能特性
        </Typography>
        <Grid container spacing={3}>
          {FEATURE_LIST.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    {feature.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 股票选择 */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          选择股票
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle1" gutterBottom>
              预设股票：
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {DEMO_STOCKS.map((stock) => (
                <Chip
                  key={stock.code}
                  label={`${stock.name} (${stock.code})`}
                  onClick={() => handleStockChange(stock.code)}
                  color={selectedStock === stock.code ? 'primary' : 'default'}
                  variant={selectedStock === stock.code ? 'filled' : 'outlined'}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              或输入股票代码：
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                size="small"
                placeholder="输入6位股票代码"
                value={customStock}
                onChange={(e) => setCustomStock(e.target.value)}
                inputProps={{ maxLength: 6 }}
              />
              <Button 
                variant="contained" 
                onClick={handleCustomStockSubmit}
                disabled={!customStock.trim()}
              >
                查看
              </Button>
            </Box>
          </Grid>
        </Grid>

        {selectedStockInfo && (
          <Alert severity="info" sx={{ mt: 2 }}>
            当前选择：{selectedStockInfo.name} ({selectedStockInfo.code}) - {selectedStockInfo.industry}
          </Alert>
        )}
      </Paper>

      {/* 完整功能K线图 */}
      <Paper elevation={2} sx={{ mb: 4 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h5">
            完整功能K线图
          </Typography>
          <Typography variant="body2" color="text.secondary">
            包含工具栏、指标配置、全屏模式等完整功能
          </Typography>
        </Box>
        
        <KLineChartContainer
          stockCode={selectedStock}
          height={600}
          showControls={true}
          autoLoad={true}
          defaultTimeRange="6M"
        />
      </Paper>

      {/* 简化版K线图 */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={6}>
          <Paper elevation={2}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6">
                简化版K线图
              </Typography>
              <Typography variant="body2" color="text.secondary">
                无工具栏，纯图表展示
              </Typography>
            </Box>
            <SimpleKLineChart
              stockCode={selectedStock}
              height={400}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              预设指标组合
            </Typography>
            
            <List dense>
              {Object.entries(PRESET_INDICATOR_SETS).map(([key, indicators]) => (
                <ListItem key={key}>
                  <ListItemIcon>
                    <ShowChart />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      key === 'basic' ? '基础组合' :
                      key === 'trend' ? '趋势分析' :
                      key === 'oscillator' ? '震荡分析' :
                      key === 'comprehensive' ? '全面分析' : key
                    }
                    secondary={`${indicators.length} 个技术指标`}
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              使用说明：
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="• 点击右上角设置按钮配置技术指标"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• 支持多种时间范围切换"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• 可导出CSV格式数据"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• 支持全屏模式浏览"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* 使用说明 */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          快速开始
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          1. 安装依赖
        </Typography>
        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
          <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
{`npm install lightweight-charts
# 或
yarn add lightweight-charts`}
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          2. 基础用法
        </Typography>
        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
          <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
{`import { SimpleKLineChart } from '@/components/KLineChart';

// 简单使用
<SimpleKLineChart stockCode="000001" height={400} />

// 完整功能
<KLineChartContainer 
  stockCode="000001"
  height={600}
  showControls={true}
  defaultTimeRange="6M"
/>`}
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          3. 自定义配置
        </Typography>
        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
          <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
{`import { 
  AdvancedKLineChart, 
  PRESET_INDICATOR_SETS 
} from '@/components/KLineChart';

const config = {
  theme: 'dark',
  showVolume: true,
  indicators: PRESET_INDICATOR_SETS.comprehensive
};

<AdvancedKLineChart 
  stockCode="000001"
  config={config}
  height={600}
/>`}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}