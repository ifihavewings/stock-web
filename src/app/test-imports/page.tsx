'use client';

import React from 'react';
import { Container, Typography, Alert, Box } from '@mui/material';

// 测试所有导入是否正常工作
const TestImportsPage: React.FC = () => {
  const [importStatus, setImportStatus] = React.useState<{
    klineChart: boolean;
    stockDataApi: boolean;
    layout: boolean;
  }>({
    klineChart: false,
    stockDataApi: false,
    layout: false,
  });

  React.useEffect(() => {
    const testImports = async () => {
      try {
        // 测试 K线图组件导入
        const klineModule = await import('@/components/KLineChart');
        console.log('KLine Chart module:', klineModule);
        setImportStatus(prev => ({ ...prev, klineChart: true }));
      } catch (error) {
        console.error('Failed to import KLineChart:', error);
      }

      try {
        // 测试 API 函数导入
        const apiModule = await import('@/apis/stockData');
        console.log('Stock Data API module:', apiModule);
        setImportStatus(prev => ({ ...prev, stockDataApi: true }));
      } catch (error) {
        console.error('Failed to import stockData API:', error);
      }

      try {
        // 测试布局组件导入
        const layoutModule = await import('@/components/StockAnalysisLayout');
        console.log('Layout module:', layoutModule);
        setImportStatus(prev => ({ ...prev, layout: true }));
      } catch (error) {
        console.error('Failed to import StockAnalysisLayout:', error);
      }
    };

    testImports();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        导入测试页面
      </Typography>
      
      <Box sx={{ mt: 3 }}>
        <Alert severity={importStatus.klineChart ? 'success' : 'error'} sx={{ mb: 2 }}>
          KLineChart 组件: {importStatus.klineChart ? '✅ 导入成功' : '❌ 导入失败'}
        </Alert>
        
        <Alert severity={importStatus.stockDataApi ? 'success' : 'error'} sx={{ mb: 2 }}>
          StockData API: {importStatus.stockDataApi ? '✅ 导入成功' : '❌ 导入失败'}
        </Alert>
        
        <Alert severity={importStatus.layout ? 'success' : 'error'} sx={{ mb: 2 }}>
          StockAnalysisLayout: {importStatus.layout ? '✅ 导入成功' : '❌ 导入失败'}
        </Alert>
      </Box>

      <Typography variant="body1" sx={{ mt: 3 }}>
        打开浏览器控制台查看详细的导入信息。
      </Typography>
    </Container>
  );
};

export default TestImportsPage;