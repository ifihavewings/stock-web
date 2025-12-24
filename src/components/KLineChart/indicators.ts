// 技术指标计算工具类
import { CandlestickData, IndicatorData, TechnicalIndicator } from './types';

export class TechnicalIndicators {
  /**
   * 简单移动平均线 (SMA)
   * @param data K线数据
   * @param period 周期
   * @param source 数据源字段
   */
  static calculateSMA(data: CandlestickData[], period: number, source: keyof CandlestickData = 'close'): IndicatorData[] {
    const result: IndicatorData[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1)
        .reduce((acc, item) => acc + (item[source] as number), 0);
      
      result.push({
        time: data[i].time,
        value: sum / period
      });
    }
    
    return result;
  }

  /**
   * 指数移动平均线 (EMA)
   * @param data K线数据
   * @param period 周期
   * @param source 数据源字段
   */
  static calculateEMA(data: CandlestickData[], period: number, source: keyof CandlestickData = 'close'): IndicatorData[] {
    const result: IndicatorData[] = [];
    const multiplier = 2 / (period + 1);
    
    // 第一个值使用SMA
    if (data.length >= period) {
      const smaValue = data.slice(0, period)
        .reduce((acc, item) => acc + (item[source] as number), 0) / period;
      
      result.push({
        time: data[period - 1].time,
        value: smaValue
      });
      
      // 后续值使用EMA公式
      for (let i = period; i < data.length; i++) {
        const prevValue = result[result.length - 1].value as number;
        const emaValue = ((data[i][source] as number) - prevValue) * multiplier + prevValue;
        result.push({
          time: data[i].time,
          value: emaValue
        });
      }
    }
    
    return result;
  }

  /**
   * 相对强弱指标 (RSI)
   * @param data K线数据
   * @param period 周期，默认14
   */
  static calculateRSI(data: CandlestickData[], period: number = 14): IndicatorData[] {
    const result: IndicatorData[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    // 计算价格变化
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    // 计算RSI
    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      const rs = avgGain / (avgLoss || 1);
      const rsi = 100 - (100 / (1 + rs));
      
      result.push({
        time: data[i + 1].time,
        value: rsi
      });
    }
    
    return result;
  }

  /**
   * MACD指标
   * @param data K线数据
   * @param fastPeriod 快线周期，默认12
   * @param slowPeriod 慢线周期，默认26
   * @param signalPeriod 信号线周期，默认9
   */
  static calculateMACD(data: CandlestickData[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): {
    macd: IndicatorData[];
    signal: IndicatorData[];
    histogram: IndicatorData[];
  } {
    const fastEMA = this.calculateEMA(data, fastPeriod);
    const slowEMA = this.calculateEMA(data, slowPeriod);
    
    // 计算MACD线（DIF线）
    const macdLine: IndicatorData[] = [];
    const startIndex = Math.max(0, slowPeriod - fastPeriod);
    
    for (let i = 0; i < fastEMA.length - startIndex; i++) {
      const fastValue = (fastEMA[i + startIndex]?.value || 0) as number;
      const slowValue = (slowEMA[i]?.value || 0) as number;
      
      macdLine.push({
        time: slowEMA[i].time,
        value: fastValue - slowValue
      });
    }
    
    // 计算信号线（DEA线）- MACD的EMA
    const signalLine: IndicatorData[] = [];
    if (macdLine.length >= signalPeriod) {
      const multiplier = 2 / (signalPeriod + 1);
      
      // 第一个信号线值
      const firstSignalValue = macdLine.slice(0, signalPeriod)
        .reduce((sum, item) => sum + (item.value as number), 0) / signalPeriod;
      
      signalLine.push({
        time: macdLine[signalPeriod - 1].time,
        value: firstSignalValue
      });
      
      // 后续信号线值
      for (let i = signalPeriod; i < macdLine.length; i++) {
        const currMacd = macdLine[i].value as number;
        const prevSignal = signalLine[signalLine.length - 1].value as number;
        const signalValue = (currMacd - prevSignal) * multiplier + prevSignal;
        signalLine.push({
          time: macdLine[i].time,
          value: signalValue
        });
      }
    }
    
    // 计算柱状图（MACD - Signal）
    const histogram: IndicatorData[] = [];
    const signalStartIndex = signalPeriod - 1;
    
    for (let i = 0; i < signalLine.length; i++) {
      const macdVal = macdLine[i + signalStartIndex].value as number;
      const signalVal = signalLine[i].value as number;
      const histValue = macdVal - signalVal;
      histogram.push({
        time: signalLine[i].time,
        value: histValue,
        color: histValue >= 0 ? '#26a69a' : '#ef5350'
      });
    }
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram
    };
  }

  /**
   * 布林带指标
   * @param data K线数据
   * @param period 周期，默认20
   * @param stdDev 标准差倍数，默认2
   */
  static calculateBollingerBands(data: CandlestickData[], period: number = 20, stdDev: number = 2): {
    upper: IndicatorData[];
    middle: IndicatorData[];
    lower: IndicatorData[];
  } {
    const middle = this.calculateSMA(data, period);
    const upper: IndicatorData[] = [];
    const lower: IndicatorData[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const periodData = data.slice(i - period + 1, i + 1);
      const sma = periodData.reduce((sum, item) => sum + item.close, 0) / period;
      
      // 计算标准差
      const variance = periodData.reduce((sum, item) => sum + Math.pow(item.close - sma, 2), 0) / period;
      const standardDev = Math.sqrt(variance);
      
      const upperValue = sma + (standardDev * stdDev);
      const lowerValue = sma - (standardDev * stdDev);
      
      upper.push({
        time: data[i].time,
        value: upperValue
      });
      
      lower.push({
        time: data[i].time,
        value: lowerValue
      });
    }
    
    return { upper, middle, lower };
  }

  /**
   * KDJ指标
   * @param data K线数据
   * @param kPeriod K值周期，默认9
   * @param dPeriod D值周期，默认3
   * @param jPeriod J值周期，默认3
   */
  static calculateKDJ(data: CandlestickData[], kPeriod: number = 9, dPeriod: number = 3, jPeriod: number = 3): {
    k: IndicatorData[];
    d: IndicatorData[];
    j: IndicatorData[];
  } {
    const k: IndicatorData[] = [];
    const d: IndicatorData[] = [];
    const j: IndicatorData[] = [];
    
    let prevK = 50;
    let prevD = 50;
    
    for (let i = kPeriod - 1; i < data.length; i++) {
      const periodData = data.slice(i - kPeriod + 1, i + 1);
      const highest = Math.max(...periodData.map(item => item.high));
      const lowest = Math.min(...periodData.map(item => item.low));
      
      const rsv = ((data[i].close - lowest) / (highest - lowest)) * 100;
      const kValue = (2 * prevK + rsv) / 3;
      const dValue = (2 * prevD + kValue) / 3;
      const jValue = 3 * kValue - 2 * dValue;
      
      k.push({ time: data[i].time, value: kValue });
      d.push({ time: data[i].time, value: dValue });
      j.push({ time: data[i].time, value: jValue });
      
      prevK = kValue;
      prevD = dValue;
    }
    
    return { k, d, j };
  }

  /**
   * 根据配置计算指标
   * @param data K线数据
   * @param indicator 指标配置
   */
  static calculateIndicator(data: CandlestickData[], indicator: TechnicalIndicator): IndicatorData[] | { [key: string]: IndicatorData[] } {
    const params = indicator.params as Record<string, any>;
    switch (indicator.id.toLowerCase()) {
      case 'sma':
        return this.calculateSMA(data, params.period, params.source);
      
      case 'ema':
        return this.calculateEMA(data, params.period, params.source);
      
      case 'rsi':
        return this.calculateRSI(data, params.period);
      
      case 'macd':
        return this.calculateMACD(data, params.fastPeriod, params.slowPeriod, params.signalPeriod);
      
      case 'bollinger':
        return this.calculateBollingerBands(data, params.period, params.stdDev);
      
      case 'kdj':
        return this.calculateKDJ(data, params.kPeriod, params.dPeriod, params.jPeriod);
      
      default:
        console.warn(`Unsupported indicator: ${indicator.id}`);
        return [];
    }
  }

  /**
   * 批量计算所有指标
   * @param data K线数据
   * @param indicators 指标配置列表
   */
  static calculateAllIndicators(data: CandlestickData[], indicators: TechnicalIndicator[]): Map<string, IndicatorData[] | { [key: string]: IndicatorData[] }> {
    const results = new Map();
    
    indicators.forEach(indicator => {
      if (indicator.enabled && data.length > 0) {
        try {
          const result = this.calculateIndicator(data, indicator);
          results.set(indicator.id, result);
        } catch (error) {
          console.error(`Error calculating indicator ${indicator.id}:`, error);
        }
      }
    });
    
    return results;
  }
}

// 指标模板配置
export const INDICATOR_TEMPLATES: Record<string, Omit<TechnicalIndicator, 'enabled' | 'visible'>> = {
  sma5: {
    id: 'sma5',
    name: 'SMA(5)',
    type: 'overlay',
    color: '#FF6B35',
    lineWidth: 1,
    params: { period: 5, method: 'SMA', source: 'close' }
  },
  sma10: {
    id: 'sma10',
    name: 'SMA(10)',
    type: 'overlay',
    color: '#4ECDC4',
    lineWidth: 1,
    params: { period: 10, method: 'SMA', source: 'close' }
  },
  sma20: {
    id: 'sma20',
    name: 'SMA(20)',
    type: 'overlay',
    color: '#45B7D1',
    lineWidth: 2,
    params: { period: 20, method: 'SMA', source: 'close' }
  },
  ema12: {
    id: 'ema12',
    name: 'EMA(12)',
    type: 'overlay',
    color: '#FFA07A',
    lineWidth: 1,
    params: { period: 12, method: 'EMA', source: 'close' }
  },
  rsi14: {
    id: 'rsi14',
    name: 'RSI(14)',
    type: 'oscillator',
    color: '#FF6B35',
    lineWidth: 2,
    params: { period: 14, overbought: 70, oversold: 30 }
  },
  macd: {
    id: 'macd',
    name: 'MACD(12,26,9)',
    type: 'oscillator',
    color: '#4ECDC4',
    lineWidth: 2,
    params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }
  },
  bollinger: {
    id: 'bollinger',
    name: '布林带(20,2)',
    type: 'overlay',
    color: '#9B59B6',
    lineWidth: 1,
    params: { period: 20, stdDev: 2 }
  },
  kdj: {
    id: 'kdj',
    name: 'KDJ(9,3,3)',
    type: 'oscillator',
    color: '#45B7D1',
    lineWidth: 2,
    params: { kPeriod: 9, dPeriod: 3, jPeriod: 3 }
  }
};