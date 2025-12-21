import { createChart } from 'lightweight-charts';

console.log('createChart type:', typeof createChart);
console.log('createChart:', createChart);

// 尝试在 Node.js 环境创建图表
try {
  const fakeContainer = { clientWidth: 800, clientHeight: 600 };
  const chart = createChart(fakeContainer);
  console.log('Chart created:', chart);
  console.log('addCandlestickSeries type:', typeof chart.addCandlestickSeries);
} catch (err) {
  console.error('Error:', err.message);
}
