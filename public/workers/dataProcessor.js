// 高性能数据处理 Web Worker
// 文件: public/workers/dataProcessor.js

self.onmessage = function(e) {
  const { data, operation } = e.data;
  
  try {
    let result;
    
    switch (operation) {
      case 'transform':
        result = transformStockData(data);
        break;
      case 'calculate_ma':
        result = calculateMovingAverage(data.prices, data.period);
        break;
      case 'calculate_indicators':
        result = calculateTechnicalIndicators(data);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    
    self.postMessage({ success: true, data: result });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};

// 转换股票数据格式
function transformStockData(stockData) {
  return {
    candlesticks: stockData.map(item => ({
      time: item.trading_date,
      open: item.opening_price,
      high: item.highest_price,
      low: item.lowest_price,
      close: item.closing_price
    })),
    volumes: stockData.map(item => ({
      time: item.trading_date,
      value: item.trading_volume,
      color: item.price_change >= 0 ? '#26a69a' : '#ef5350'
    }))
  };
}

// 计算移动平均线
function calculateMovingAverage(prices, period) {
  const result = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push({
      time: prices[i].time,
      value: sum / period
    });
  }
  
  return result;
}

// 计算技术指标
function calculateTechnicalIndicators(data) {
  const { stockData, indicators } = data;
  const result = {};
  
  indicators.forEach(indicator => {
    switch (indicator.type) {
      case 'MA':
        result[`ma${indicator.period}`] = calculateMA(stockData, indicator.period);
        break;
      case 'EMA':
        result[`ema${indicator.period}`] = calculateEMA(stockData, indicator.period);
        break;
      case 'MACD':
        result.macd = calculateMACD(stockData, indicator.fast, indicator.slow, indicator.signal);
        break;
      case 'RSI':
        result.rsi = calculateRSI(stockData, indicator.period);
        break;
      case 'BOLL':
        result.boll = calculateBollingerBands(stockData, indicator.period, indicator.multiplier);
        break;
    }
  });
  
  return result;
}

// 简单移动平均线
function calculateMA(data, period) {
  const prices = data.map(d => d.closing_price);
  const result = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push({
      time: data[i].trading_date,
      value: sum / period
    });
  }
  
  return result;
}

// 指数移动平均线
function calculateEMA(data, period) {
  const prices = data.map(d => d.closing_price);
  const result = [];
  const multiplier = 2 / (period + 1);
  
  let ema = prices[0];
  result.push({ time: data[0].trading_date, value: ema });
  
  for (let i = 1; i < data.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    result.push({
      time: data[i].trading_date,
      value: ema
    });
  }
  
  return result;
}

// MACD指标
function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);
  
  const macd = [];
  const signal = [];
  const histogram = [];
  
  // 计算MACD线
  for (let i = 0; i < Math.min(emaFast.length, emaSlow.length); i++) {
    macd.push({
      time: emaFast[i].time,
      value: emaFast[i].value - emaSlow[i].value
    });
  }
  
  // 计算信号线（MACD的EMA）
  let signalEma = macd[0].value;
  signal.push({ time: macd[0].time, value: signalEma });
  
  const signalMultiplier = 2 / (signalPeriod + 1);
  for (let i = 1; i < macd.length; i++) {
    signalEma = (macd[i].value * signalMultiplier) + (signalEma * (1 - signalMultiplier));
    signal.push({
      time: macd[i].time,
      value: signalEma
    });
  }
  
  // 计算柱状图
  for (let i = 0; i < Math.min(macd.length, signal.length); i++) {
    histogram.push({
      time: macd[i].time,
      value: macd[i].value - signal[i].value
    });
  }
  
  return { macd, signal, histogram };
}

// RSI指标
function calculateRSI(data, period = 14) {
  const prices = data.map(d => d.closing_price);
  const changes = [];
  
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);
  
  const result = [];
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < data.length; i++) {
    if (i > period) {
      avgGain = (avgGain * (period - 1) + gains[i - 1]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period;
    }
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    result.push({
      time: data[i].trading_date,
      value: rsi
    });
  }
  
  return result;
}

// 布林带指标
function calculateBollingerBands(data, period = 20, multiplier = 2) {
  const ma = calculateMA(data, period);
  const prices = data.map(d => d.closing_price);
  
  const upper = [];
  const lower = [];
  const middle = ma;
  
  for (let i = 0; i < ma.length; i++) {
    const startIndex = data.length - ma.length + i - period + 1;
    const endIndex = data.length - ma.length + i + 1;
    const periodPrices = prices.slice(startIndex, endIndex);
    
    // 计算标准差
    const mean = ma[i].value;
    const variance = periodPrices.reduce((sum, price) => {
      return sum + Math.pow(price - mean, 2);
    }, 0) / period;
    const stdDev = Math.sqrt(variance);
    
    upper.push({
      time: ma[i].time,
      value: mean + (multiplier * stdDev)
    });
    
    lower.push({
      time: ma[i].time,
      value: mean - (multiplier * stdDev)
    });
  }
  
  return { upper, middle, lower };
}