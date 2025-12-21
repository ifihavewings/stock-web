'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';

// 简化的股票分析页面，用于测试基本功能
const SimpleStockAnalysisPage: React.FC = () => {
  const params = useParams();
  const stockCode = params?.stockCode as string;
  
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState<{
    KLineChart?: any;
    CHART_PRESETS?: any;
    fetchStockChartData?: any;
  }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponents = async () => {
      setLoading(true);
      setError(null);

      try {
        // 动态导入K线图组件
        console.log('Loading KLineChart component...');
        const klineModule = await import('@/components/KLineChart');
        console.log('KLineChart loaded:', klineModule);

        // 动态导入API函数
        console.log('Loading stockData API...');
        const apiModule = await import('@/apis/stockData');
        console.log('stockData API loaded:', apiModule);

        setComponents({
          KLineChart: klineModule.KLineChart,
          CHART_PRESETS: klineModule.CHART_PRESETS,
          fetchStockChartData: apiModule.fetchStockChartData,
        });

      } catch (err: any) {
        console.error('Failed to load components:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (stockCode) {
      loadComponents();
    }
  }, [stockCode]);

  if (!stockCode) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          股票代码参数缺失
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            加载组件中...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          组件加载失败: {error}
        </Alert>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              调试信息
            </Typography>
            <Typography variant="body2">
              股票代码: {stockCode}
            </Typography>
            <Typography variant="body2">
              请检查浏览器控制台获取更多错误信息。
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const { KLineChart, CHART_PRESETS } = components;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        {stockCode} 股票分析 (简化版)
      </Typography>

      {KLineChart && CHART_PRESETS ? (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              K线图表
            </Typography>
            
            <Box sx={{ height: 400, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <KLineChart
                stockCode={stockCode}
                symbol={`${stockCode} 测试`}
                config={{
                  ...CHART_PRESETS.default,
                  width: '100%',
                  height: 400,
                }}
                showVolume={true}
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="warning">
          K线图组件加载失败
        </Alert>
      )}

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            组件状态
          </Typography>
          <Typography variant="body2">
            KLineChart: {components.KLineChart ? '✅ 已加载' : '❌ 未加载'}
          </Typography>
          <Typography variant="body2">
            CHART_PRESETS: {components.CHART_PRESETS ? '✅ 已加载' : '❌ 未加载'}
          </Typography>
          <Typography variant="body2">
            fetchStockChartData: {components.fetchStockChartData ? '✅ 已加载' : '❌ 未加载'}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SimpleStockAnalysisPage;