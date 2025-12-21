'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface StockAnalysisLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const StockAnalysisLayout: React.FC<StockAnalysisLayoutProps> = ({ 
  children, 
  title = "股票分析" 
}) => {
  const router = useRouter();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="返回"
            onClick={() => router.back()}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

export default StockAnalysisLayout;