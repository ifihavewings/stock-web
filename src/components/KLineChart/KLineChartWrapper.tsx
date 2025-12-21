'use client'

import dynamic from 'next/dynamic';
import { CircularProgress, Box } from '@mui/material';

// 动态导入 AdvancedKLineChart，禁用 SSR
const AdvancedKLineChart = dynamic(
  () => import('./AdvancedKLineChart').then(mod => ({ default: mod.AdvancedKLineChart })),
  {
    ssr: false,
    loading: () => (
      <Box display="flex" justifyContent="center" alignItems="center" height={600}>
        <CircularProgress />
      </Box>
    )
  }
);

export { AdvancedKLineChart };
