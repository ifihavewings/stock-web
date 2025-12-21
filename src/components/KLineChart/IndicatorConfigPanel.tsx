'use client'

import React, { useState, useCallback } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Button,
  Divider,
  Chip,
  Stack,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Settings,
  ExpandMore,
  Palette,
  Timeline,
  BarChart,
  TrendingUp,
  ShowChart,
  Delete,
  Add,
  Visibility,
  VisibilityOff,
  RestartAlt
} from '@mui/icons-material';

import { 
  TechnicalIndicator, 
  KLineChartConfig, 
  ChartTheme, 
  CHART_THEMES 
} from './types';
import { INDICATOR_TEMPLATES } from './indicators';

interface IndicatorConfigPanelProps {
  config: KLineChartConfig;
  onConfigChange: (newConfig: KLineChartConfig) => void;
  open?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

// 指标分类
const INDICATOR_CATEGORIES = [
  { 
    id: 'moving-averages', 
    label: '移动平均线', 
    icon: <TrendingUp />,
    description: '趋势跟踪指标',
    indicators: ['sma5', 'sma10', 'sma20', 'ema12', 'ema26']
  },
  { 
    id: 'oscillators', 
    label: '震荡指标', 
    icon: <Timeline />,
    description: '超买超卖分析',
    indicators: ['rsi14', 'macd', 'kdj']
  },
  { 
    id: 'bands', 
    label: '通道指标', 
    icon: <BarChart />,
    description: '价格区间分析',
    indicators: ['bollinger']
  },
  { 
    id: 'custom', 
    label: '自定义', 
    icon: <ShowChart />,
    description: '用户自定义指标',
    indicators: []
  }
];

export const IndicatorConfigPanel: React.FC<IndicatorConfigPanelProps> = ({
  config,
  onConfigChange,
  open = false,
  onClose,
  onToggle
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('moving-averages');
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(new Set(['chart-settings']));

  // 切换手风琴展开状态
  const toggleAccordion = useCallback((accordionId: string) => {
    setExpandedAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accordionId)) {
        newSet.delete(accordionId);
      } else {
        newSet.add(accordionId);
      }
      return newSet;
    });
  }, []);

  // 获取当前主题
  const getCurrentTheme = (): ChartTheme => {
    if (typeof config.theme === 'string') {
      return CHART_THEMES[config.theme] || CHART_THEMES.light;
    }
    return config.theme || CHART_THEMES.light;
  };

  // 切换指标启用状态
  const toggleIndicator = useCallback((templateId: string) => {
    const indicators = config.indicators || [];
    const existingIndex = indicators.findIndex(ind => ind.id === templateId);
    
    if (existingIndex >= 0) {
      // 切换现有指标的启用状态
      const newIndicators = [...indicators];
      newIndicators[existingIndex] = {
        ...newIndicators[existingIndex],
        enabled: !newIndicators[existingIndex].enabled
      };
      onConfigChange({ ...config, indicators: newIndicators });
    } else {
      // 添加新指标
      const template = INDICATOR_TEMPLATES[templateId];
      if (template) {
        const newIndicator: TechnicalIndicator = {
          ...template,
          enabled: true,
          visible: true
        };
        onConfigChange({ 
          ...config, 
          indicators: [...indicators, newIndicator]
        });
      }
    }
  }, [config, onConfigChange]);

  // 更新指标配置
  const updateIndicatorConfig = useCallback((indicatorId: string, key: string, value: any) => {
    const indicators = config.indicators || [];
    const newIndicators = indicators.map(indicator => {
      if (indicator.id === indicatorId) {
        if (key.startsWith('params.')) {
          const paramKey = key.replace('params.', '');
          return {
            ...indicator,
            params: {
              ...indicator.params,
              [paramKey]: value
            }
          };
        } else {
          return {
            ...indicator,
            [key]: value
          };
        }
      }
      return indicator;
    });
    
    onConfigChange({ ...config, indicators: newIndicators });
  }, [config, onConfigChange]);

  // 删除指标
  const removeIndicator = useCallback((indicatorId: string) => {
    const indicators = config.indicators || [];
    const newIndicators = indicators.filter(ind => ind.id !== indicatorId);
    onConfigChange({ ...config, indicators: newIndicators });
  }, [config, onConfigChange]);

  // 重置指标到默认值
  const resetIndicator = useCallback((indicatorId: string) => {
    const template = INDICATOR_TEMPLATES[indicatorId];
    if (!template) return;

    const indicators = config.indicators || [];
    const newIndicators = indicators.map(indicator => {
      if (indicator.id === indicatorId) {
        return {
          ...template,
          enabled: indicator.enabled,
          visible: indicator.visible
        };
      }
      return indicator;
    });
    
    onConfigChange({ ...config, indicators: newIndicators });
  }, [config, onConfigChange]);

  // 检查指标是否启用
  const isIndicatorEnabled = (templateId: string): boolean => {
    return (config.indicators || []).some(ind => ind.id === templateId && ind.enabled);
  };

  // 获取指标配置
  const getIndicatorConfig = (indicatorId: string): TechnicalIndicator | undefined => {
    return (config.indicators || []).find(ind => ind.id === indicatorId);
  };

  // 渲染指标参数配置
  const renderIndicatorParams = (indicator: TechnicalIndicator) => {
    const params = indicator.params;
    
    return (
      <Box sx={{ mt: 2 }}>
        {/* 通用参数 */}
        {params.period !== undefined && (
          <TextField
            label="周期"
            type="number"
            value={params.period}
            onChange={(e) => updateIndicatorConfig(indicator.id, 'params.period', parseInt(e.target.value))}
            size="small"
            fullWidth
            sx={{ mb: 1 }}
            InputProps={{ inputProps: { min: 1, max: 200 } }}
          />
        )}

        {/* RSI 特定参数 */}
        {indicator.id.includes('rsi') && (
          <>
            <TextField
              label="超买线"
              type="number"
              value={params.overbought || 70}
              onChange={(e) => updateIndicatorConfig(indicator.id, 'params.overbought', parseInt(e.target.value))}
              size="small"
              sx={{ mr: 1, width: '48%' }}
              InputProps={{ inputProps: { min: 50, max: 100 } }}
            />
            <TextField
              label="超卖线"
              type="number"
              value={params.oversold || 30}
              onChange={(e) => updateIndicatorConfig(indicator.id, 'params.oversold', parseInt(e.target.value))}
              size="small"
              sx={{ width: '48%' }}
              InputProps={{ inputProps: { min: 0, max: 50 } }}
            />
          </>
        )}

        {/* MACD 特定参数 */}
        {indicator.id === 'macd' && (
          <>
            <TextField
              label="快线周期"
              type="number"
              value={params.fastPeriod || 12}
              onChange={(e) => updateIndicatorConfig(indicator.id, 'params.fastPeriod', parseInt(e.target.value))}
              size="small"
              sx={{ mr: 1, mb: 1, width: '32%' }}
            />
            <TextField
              label="慢线周期"
              type="number"
              value={params.slowPeriod || 26}
              onChange={(e) => updateIndicatorConfig(indicator.id, 'params.slowPeriod', parseInt(e.target.value))}
              size="small"
              sx={{ mr: 1, mb: 1, width: '32%' }}
            />
            <TextField
              label="信号线"
              type="number"
              value={params.signalPeriod || 9}
              onChange={(e) => updateIndicatorConfig(indicator.id, 'params.signalPeriod', parseInt(e.target.value))}
              size="small"
              sx={{ mb: 1, width: '32%' }}
            />
          </>
        )}

        {/* 布林带特定参数 */}
        {indicator.id === 'bollinger' && (
          <TextField
            label="标准差倍数"
            type="number"
            value={params.stdDev || 2}
            onChange={(e) => updateIndicatorConfig(indicator.id, 'params.stdDev', parseFloat(e.target.value))}
            size="small"
            fullWidth
            sx={{ mb: 1 }}
            InputProps={{ inputProps: { min: 0.5, max: 4, step: 0.1 } }}
          />
        )}

        {/* KDJ 特定参数 */}
        {indicator.id === 'kdj' && (
          <>
            <TextField
              label="K周期"
              type="number"
              value={params.kPeriod || 9}
              onChange={(e) => updateIndicatorConfig(indicator.id, 'params.kPeriod', parseInt(e.target.value))}
              size="small"
              sx={{ mr: 1, mb: 1, width: '32%' }}
            />
            <TextField
              label="D周期"
              type="number"
              value={params.dPeriod || 3}
              onChange={(e) => updateIndicatorConfig(indicator.id, 'params.dPeriod', parseInt(e.target.value))}
              size="small"
              sx={{ mr: 1, mb: 1, width: '32%' }}
            />
            <TextField
              label="J周期"
              type="number"
              value={params.jPeriod || 3}
              onChange={(e) => updateIndicatorConfig(indicator.id, 'params.jPeriod', parseInt(e.target.value))}
              size="small"
              sx={{ mb: 1, width: '32%' }}
            />
          </>
        )}

        {/* 移动平均线方法选择 */}
        {(indicator.id.includes('sma') || indicator.id.includes('ema')) && params.method && (
          <FormControl size="small" fullWidth sx={{ mb: 1 }}>
            <InputLabel>计算方法</InputLabel>
            <Select
              value={params.method || 'SMA'}
              label="计算方法"
              onChange={(e) => updateIndicatorConfig(indicator.id, 'params.method', e.target.value)}
            >
              <MenuItem value="SMA">简单移动平均</MenuItem>
              <MenuItem value="EMA">指数移动平均</MenuItem>
              <MenuItem value="WMA">加权移动平均</MenuItem>
            </Select>
          </FormControl>
        )}

        {/* 数据源选择 */}
        {params.source && (
          <FormControl size="small" fullWidth sx={{ mb: 1 }}>
            <InputLabel>数据源</InputLabel>
            <Select
              value={params.source || 'close'}
              label="数据源"
              onChange={(e) => updateIndicatorConfig(indicator.id, 'params.source', e.target.value)}
            >
              <MenuItem value="open">开盘价</MenuItem>
              <MenuItem value="high">最高价</MenuItem>
              <MenuItem value="low">最低价</MenuItem>
              <MenuItem value="close">收盘价</MenuItem>
              <MenuItem value="volume">成交量</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>
    );
  };

  // 渲染指标配置卡片
  const renderIndicatorCard = (indicator: TechnicalIndicator) => {
    return (
      <Card key={indicator.id} sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle2" sx={{ mr: 1 }}>
                {indicator.name}
              </Typography>
              <Box
                sx={{
                  width: 20,
                  height: 3,
                  backgroundColor: indicator.color,
                  borderRadius: 1,
                  mr: 1
                }}
              />
              <Chip 
                label={indicator.type === 'overlay' ? '叠加' : '震荡'} 
                size="small" 
                variant="outlined"
              />
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title={indicator.visible ? '隐藏' : '显示'}>
                <IconButton
                  size="small"
                  onClick={() => updateIndicatorConfig(indicator.id, 'visible', !indicator.visible)}
                  color={indicator.visible ? 'primary' : 'default'}
                >
                  {indicator.visible ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </Tooltip>
              <Tooltip title="重置为默认值">
                <IconButton
                  size="small"
                  onClick={() => resetIndicator(indicator.id)}
                >
                  <RestartAlt />
                </IconButton>
              </Tooltip>
              <Tooltip title="删除指标">
                <IconButton
                  size="small"
                  onClick={() => removeIndicator(indicator.id)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* 颜色和线宽配置 */}
          <Stack direction="row" spacing={2} mb={2}>
            <TextField
              label="颜色"
              type="color"
              value={indicator.color}
              onChange={(e) => updateIndicatorConfig(indicator.id, 'color', e.target.value)}
              size="small"
              sx={{ width: '50%' }}
            />
            <Box sx={{ width: '50%' }}>
              <Typography gutterBottom variant="body2">线宽: {indicator.lineWidth}</Typography>
              <Slider
                value={indicator.lineWidth}
                min={1}
                max={5}
                step={1}
                onChange={(e, value) => updateIndicatorConfig(indicator.id, 'lineWidth', value)}
                size="small"
              />
            </Box>
          </Stack>

          {/* 参数配置 */}
          {renderIndicatorParams(indicator)}
        </CardContent>
      </Card>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 420,
          maxWidth: '90vw',
        },
      }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 标题栏 */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" display="flex" alignItems="center">
            <Settings sx={{ mr: 1 }} />
            图表配置
          </Typography>
          {onToggle && (
            <IconButton onClick={onToggle}>
              <Settings />
            </IconButton>
          )}
        </Stack>

        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {/* 图表基本设置 */}
          <Accordion 
            expanded={expandedAccordions.has('chart-settings')}
            onChange={() => toggleAccordion('chart-settings')}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">
                <Palette sx={{ mr: 1, verticalAlign: 'middle' }} />
                图表设置
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>主题</InputLabel>
                  <Select
                    value={typeof config.theme === 'string' ? config.theme : 'light'}
                    label="主题"
                    onChange={(e) => onConfigChange({ ...config, theme: e.target.value as 'light' | 'dark' })}
                  >
                    {Object.entries(CHART_THEMES).map(([key, theme]) => (
                      <MenuItem key={key} value={key}>{theme.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.showVolume ?? true}
                      onChange={(e) => onConfigChange({ 
                        ...config, 
                        showVolume: e.target.checked 
                      })}
                    />
                  }
                  label="显示成交量"
                />

                {config.showVolume && (
                  <Box>
                    <Typography gutterBottom variant="body2">
                      成交量高度: {config.volumeHeight ?? 30}%
                    </Typography>
                    <Slider
                      value={config.volumeHeight ?? 30}
                      min={10}
                      max={50}
                      step={5}
                      onChange={(e, value) => onConfigChange({
                        ...config,
                        volumeHeight: value as number
                      })}
                    />
                  </Box>
                )}

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.showCrosshair ?? true}
                      onChange={(e) => onConfigChange({ 
                        ...config, 
                        showCrosshair: e.target.checked 
                      })}
                    />
                  }
                  label="显示十字光标"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.autoScale ?? true}
                      onChange={(e) => onConfigChange({ 
                        ...config, 
                        autoScale: e.target.checked 
                      })}
                    />
                  }
                  label="自动缩放"
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* 指标选择 */}
          <Accordion 
            expanded={expandedAccordions.has('indicator-selection')}
            onChange={() => toggleAccordion('indicator-selection')}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">
                <Add sx={{ mr: 1, verticalAlign: 'middle' }} />
                添加指标
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* 分类选择 */}
              <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                {INDICATOR_CATEGORIES.map((category) => (
                  <Chip
                    key={category.id}
                    icon={category.icon}
                    label={category.label}
                    onClick={() => setSelectedCategory(category.id)}
                    color={selectedCategory === category.id ? 'primary' : 'default'}
                    variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Stack>

              {/* 当前分类的描述 */}
              {INDICATOR_CATEGORIES.find(c => c.id === selectedCategory) && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {INDICATOR_CATEGORIES.find(c => c.id === selectedCategory)?.description}
                </Alert>
              )}

              {/* 指标列表 */}
              <List dense>
                {INDICATOR_CATEGORIES
                  .find(c => c.id === selectedCategory)
                  ?.indicators.map((templateId) => {
                    const template = INDICATOR_TEMPLATES[templateId];
                    if (!template) return null;

                    return (
                      <ListItem key={templateId} sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                {template.name}
                              </Typography>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 2,
                                  backgroundColor: template.color,
                                  borderRadius: 1,
                                }}
                              />
                            </Box>
                          }
                          secondary={`${template.type === 'overlay' ? '叠加指标' : '震荡指标'}`}
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={isIndicatorEnabled(templateId)}
                            onChange={() => toggleIndicator(templateId)}
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* 已启用指标配置 */}
          <Accordion 
            expanded={expandedAccordions.has('active-indicators')}
            onChange={() => toggleAccordion('active-indicators')}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">
                <ShowChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                活跃指标 ({(config.indicators || []).filter(ind => ind.enabled).length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {(config.indicators || [])
                .filter(ind => ind.enabled)
                .map(indicator => renderIndicatorCard(indicator))}
              
              {!(config.indicators || []).some(ind => ind.enabled) && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  请先添加一些技术指标
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Drawer>
  );
};

export default IndicatorConfigPanel;