// K线周期转换工具 - 将日K线数据转换为周K线、月K线

import { CandlestickData } from './types';

export type KLinePeriod = 'day' | 'week' | 'month';

/**
 * K线周期转换器
 */
export class KLinePeriodConverter {
  /**
   * 将日K线数据转换为周K线数据
   */
  static toWeeklyData(dailyData: CandlestickData[]): CandlestickData[] {
    if (!dailyData || dailyData.length === 0) return [];

    const weeklyData: CandlestickData[] = [];
    let currentWeek: CandlestickData[] = [];
    let currentWeekStart: Date | null = null;

    dailyData.forEach((item, index) => {
      const itemDate = new Date(item.time);
      const weekStart = this.getWeekStart(itemDate);

      if (!currentWeekStart || weekStart.getTime() !== currentWeekStart.getTime()) {
        // 新的一周开始，处理上一周的数据
        if (currentWeek.length > 0) {
          weeklyData.push(this.mergeKLineData(currentWeek));
        }
        currentWeek = [item];
        currentWeekStart = weekStart;
      } else {
        // 同一周，添加到当前周
        currentWeek.push(item);
      }

      // 处理最后一周
      if (index === dailyData.length - 1 && currentWeek.length > 0) {
        weeklyData.push(this.mergeKLineData(currentWeek));
      }
    });

    return weeklyData;
  }

  /**
   * 将日K线数据转换为月K线数据
   */
  static toMonthlyData(dailyData: CandlestickData[]): CandlestickData[] {
    if (!dailyData || dailyData.length === 0) return [];

    const monthlyData: CandlestickData[] = [];
    let currentMonth: CandlestickData[] = [];
    let currentMonthKey: string | null = null;

    dailyData.forEach((item, index) => {
      const itemDate = new Date(item.time);
      const monthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;

      if (currentMonthKey !== monthKey) {
        // 新的一月开始，处理上一月的数据
        if (currentMonth.length > 0) {
          monthlyData.push(this.mergeKLineData(currentMonth));
        }
        currentMonth = [item];
        currentMonthKey = monthKey;
      } else {
        // 同一月，添加到当前月
        currentMonth.push(item);
      }

      // 处理最后一月
      if (index === dailyData.length - 1 && currentMonth.length > 0) {
        monthlyData.push(this.mergeKLineData(currentMonth));
      }
    });

    return monthlyData;
  }

  /**
   * 合并多条K线数据为一条
   * 开盘价：取第一条的开盘价
   * 收盘价：取最后一条的收盘价
   * 最高价：取所有最高价的最大值
   * 最低价：取所有最低价的最小值
   * 成交量：求和
   * 成交额：求和
   */
  private static mergeKLineData(data: CandlestickData[]): CandlestickData {
    if (data.length === 1) return data[0];

    const first = data[0];
    const last = data[data.length - 1];

    return {
      time: last.time, // 使用最后一个交易日的时间
      open: first.open,
      close: last.close,
      high: Math.max(...data.map(d => d.high)),
      low: Math.min(...data.map(d => d.low)),
      volume: data.reduce((sum, d) => sum + (d.volume || 0), 0),
      tradingAmount: data.reduce((sum, d) => sum + (d.tradingAmount || 0), 0),
      // 重新计算涨跌幅
      priceChange: last.close - first.open,
      priceChangePercentage: ((last.close - first.open) / first.open) * 100,
    };
  }

  /**
   * 获取一周的开始日期（周一）
   */
  private static getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 调整到周一
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  /**
   * 根据周期类型转换数据
   */
  static convertByPeriod(dailyData: CandlestickData[], period: KLinePeriod): CandlestickData[] {
    switch (period) {
      case 'day':
        return dailyData;
      case 'week':
        return this.toWeeklyData(dailyData);
      case 'month':
        return this.toMonthlyData(dailyData);
      default:
        return dailyData;
    }
  }

  /**
   * 获取周期显示名称
   */
  static getPeriodLabel(period: KLinePeriod): string {
    const labels: Record<KLinePeriod, string> = {
      day: '日K',
      week: '周K',
      month: '月K',
    };
    return labels[period];
  }
}
