import SimpleKLineChart from '../../components/KLineChart/SimpleKLineChart';

export default function TestChartPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>K线图测试页面</h1>
      <p>这个页面用于测试K线图组件是否正常工作。</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>测试股票: 000001</h2>
        <SimpleKLineChart stockCode="000001" height={400} />
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <h2>测试股票: 600036</h2>
        <SimpleKLineChart stockCode="600036" height={400} />
      </div>
    </div>
  );
}