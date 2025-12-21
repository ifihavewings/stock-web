import { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: { stockCode: string } 
}): Promise<Metadata> {
  const stockCode = params.stockCode;
  
  return {
    title: `${stockCode} 股票分析 - 股票数据系统`,
    description: `查看 ${stockCode} 的详细K线图表、技术分析和实时行情数据`,
    keywords: [`${stockCode}`, '股票分析', 'K线图', '技术分析', '股价走势'],
    openGraph: {
      title: `${stockCode} 股票分析`,
      description: `${stockCode} 的详细技术分析和行情数据`,
      type: 'website',
    },
  };
}