'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import WorkingChart from '../../../components/KLineChart/WorkingChart';

interface StockInfo {
  stockCode: string;
  companyName: string;
  industry: string;
  exchange: string;
}

interface StockStats {
  currentPrice: number;
  changeAmount: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  tradeDate: string;
}

const StockAnalysisPage = () => {
  const params = useParams();
  const stockCode = params.stockCode as string;
  
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [stockStats, setStockStats] = useState<StockStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      if (!stockCode) return;

      try {
        setIsLoading(true);
        setError(null);

        // 获取股票信息
        const infoResponse = await fetch(`http://localhost:1688/stock-data-fetcher/${stockCode}/info`);
        if (!infoResponse.ok) {
          throw new Error(`获取股票信息失败: ${infoResponse.status}`);
        }
        const infoData = await infoResponse.json();
        setStockInfo(infoData);

        // 获取股票统计数据
        const statsResponse = await fetch(`http://localhost:1688/stock-data-fetcher/${stockCode}/stats`);
        if (!statsResponse.ok) {
          throw new Error(`获取股票统计失败: ${statsResponse.status}`);
        }
        const statsData = await statsResponse.json();
        setStockStats(statsData);

      } catch (err) {
        console.error('获取股票数据失败:', err);
        setError(err instanceof Error ? err.message : '数据获取失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [stockCode]);

  if (!stockCode) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ 
          background: '#ffebee', 
          color: '#c62828', 
          padding: '16px', 
          borderRadius: '4px',
          border: '1px solid #ffcdd2'
        }}>
          股票代码无效
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        marginBottom: '24px', 
        color: '#333',
        borderBottom: '2px solid #1976d2',
        paddingBottom: '8px'
      }}>
        股票分析 - {stockCode}
      </h1>

      {error && (
        <div style={{ 
          background: '#ffebee', 
          color: '#c62828', 
          padding: '16px', 
          borderRadius: '4px',
          marginBottom: '16px',
          border: '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* 股票信息卡片 */}
        <div style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: '#333',
            fontSize: '1.25rem',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            股票信息
          </h3>
          {isLoading ? (
            <p>加载中...</p>
          ) : stockInfo ? (
            <div>
              <p><strong>公司名称:</strong> {stockInfo.companyName}</p>
              <p><strong>股票代码:</strong> {stockInfo.stockCode}</p>
              <p><strong>所属行业:</strong> {stockInfo.industry}</p>
              <p><strong>交易所:</strong> {stockInfo.exchange}</p>
            </div>
          ) : (
            <p style={{ color: '#666' }}>暂无数据</p>
          )}
        </div>

        {/* 股票统计卡片 */}
        <div style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: '#333',
            fontSize: '1.25rem',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            最新数据
          </h3>
          {isLoading ? (
            <p>加载中...</p>
          ) : stockStats ? (
            <div>
              <p>
                <strong>当前价格:</strong> ¥{stockStats.currentPrice?.toFixed(2) || 'N/A'}
              </p>
              <p>
                <strong>涨跌额:</strong> 
                <span style={{ color: stockStats.changeAmount >= 0 ? 'green' : 'red' }}>
                  {stockStats.changeAmount >= 0 ? '+' : ''}{stockStats.changeAmount?.toFixed(2) || 'N/A'}
                </span>
              </p>
              <p>
                <strong>涨跌幅:</strong> 
                <span style={{ color: stockStats.changePercent >= 0 ? 'green' : 'red' }}>
                  {stockStats.changePercent >= 0 ? '+' : ''}{stockStats.changePercent?.toFixed(2) || 'N/A'}%
                </span>
              </p>
              <p><strong>成交量:</strong> {stockStats.volume?.toLocaleString() || 'N/A'}</p>
              {stockStats.tradeDate && (
                <p><strong>交易日期:</strong> {stockStats.tradeDate}</p>
              )}
            </div>
          ) : (
            <p style={{ color: '#666' }}>暂无数据</p>
          )}
        </div>
      </div>

      {/* K线图 */}
      <div style={{
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          color: '#333',
          fontSize: '1.25rem',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          K线图分析
        </h3>
        <WorkingChart stockCode={stockCode} height={500} />
      </div>
    </div>
  );
};

export default StockAnalysisPage;