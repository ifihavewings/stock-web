'use client'

export default function Home() {
  return (
    <div style={{
      padding: '20px',
      height: '100%',
      backgroundColor: '#f9f9f9'
    }}>
      <h2>欢迎使用股票分析平台</h2>
      <p style={{ marginBottom: '20px' }}>请从左侧菜单选择功能模块</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginTop: '30px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h4>📊 数据查询</h4>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            快速查询股票实时数据、历史价格和交易量等信息
          </p>
        </div>
        
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h4>📈 趋势分析</h4>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            分析股票价格趋势，提供技术指标和市场洞察
          </p>
        </div>
        
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h4>💼 投资组合</h4>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            管理和跟踪您的投资组合表现和收益率
          </p>
        </div>
        
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h4>🔍 市场研究</h4>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            深入研究市场动态、行业分析和公司基本面
          </p>
        </div>
      </div>
    </div>
  )
}