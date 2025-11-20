'use client'

export default function StockListPage() {
  return (
    <div style={{
      padding: '20px',
      height: '100%'
    }}>
      <h2>股票列表</h2>
      <p>这里显示所有股票的列表</p>
      
      <div style={{ marginTop: '20px' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>股票代码</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>股票名称</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>当前价格</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>涨跌幅</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>000001</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>平安银行</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>¥12.50</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>-2.1%</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>000002</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>万科A</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>¥18.20</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>+1.5%</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>600000</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>浦发银行</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>¥8.95</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>+0.8%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}