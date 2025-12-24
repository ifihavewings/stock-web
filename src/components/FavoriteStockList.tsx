import { DataGrid, GridColDef, GridActionsCellItem, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useState } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { favoriteStock } from '@/apis/companies';
import { KLineChartContainer } from '@/components/KLineChart/KLineChartContainer';

// 收藏股票数据类型（包含交易数据）
interface FavoriteStockData {
    stockCode: string;
    stockSymbol: string;
    companyArea: string;
    industrySector: string;
    marketType: string;
    stockExchange: string;
    listingDate: string;
    isFavorite?: number;
    // 交易数据
    tradingDate?: string;
    openingPrice?: number | null;
    closingPrice?: number | null;
    highestPrice?: number | null;
    lowestPrice?: number | null;
    previousClosingPrice?: number | null;
    priceChange?: number | null;
    priceChangePercentage?: number | null;
    tradingVolume?: number | null;
    tradingAmount?: number | null;
    turnoverRate?: number | null;
    peRatio?: number | null;
    pbRatio?: number | null;
    volumeRatio?: number | null;
    totalMarketValue?: number | null;
    circulatingMarketValue?: number | null;
}

interface FavoriteStockListProps {
    tableData: FavoriteStockData[];
    latestTradingDate?: string;
    pagination?: {
        currentPage: string | number;
        pageSize: string | number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    loading?: boolean;
    onPageChange?: (page: number, pageSize: number) => void;
    onFavoriteChange?: () => void; // 收藏状态变化时的回调
}

export default function FavoriteStockList(props: FavoriteStockListProps) {
    const { tableData, latestTradingDate, pagination, loading = false, onPageChange, onFavoriteChange } = props;

    const [favoriteLoading, setFavoriteLoading] = useState<Set<string>>(new Set());
    
    // K线图弹窗状态
    const [klineDialogOpen, setKlineDialogOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState<FavoriteStockData | null>(null);

    // 工具函数
    const formatPrice = (price: number | null | undefined) => {
        if (price === null || price === undefined) return '-';
        return Number(price).toFixed(2);
    };

    const formatPercent = (percent: number | null | undefined) => {
        if (percent === null || percent === undefined) return '-';
        const value = Number(percent);
        const formatted = value.toFixed(2) + '%';
        return value >= 0 ? '+' + formatted : formatted;
    };

    const formatVolume = (volume: number | null | undefined) => {
        if (volume === null || volume === undefined) return '-';
        const num = Number(volume);
        if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿';
        if (num >= 10000) return (num / 10000).toFixed(2) + '万';
        return num.toFixed(0);
    };

    const formatMarketValue = (value: number | null | undefined) => {
        if (value === null || value === undefined) return '-';
        const num = Number(value);
        if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿';
        if (num >= 10000) return (num / 10000).toFixed(2) + '万';
        return num.toFixed(2);
    };

    const getChangeColor = (change: number | null | undefined) => {
        if (change === null || change === undefined) return 'text.primary';
        return Number(change) >= 0 ? 'error.main' : 'success.main';
    };

    // 打开K线图弹窗
    const handleOpenKlineChart = (stock: FavoriteStockData) => {
        setSelectedStock(stock);
        setKlineDialogOpen(true);
    };

    // 关闭K线图弹窗
    const handleCloseKlineChart = () => {
        setKlineDialogOpen(false);
        setSelectedStock(null);
    };

    // 取消收藏处理函数
    const handleUnfavorite = async (stockCode: string) => {
        if (favoriteLoading.has(stockCode)) return;

        setFavoriteLoading(prev => new Set(prev).add(stockCode));

        try {
            const response = await favoriteStock(stockCode);
            
            if (response.data?.success) {
                console.log(`取消收藏: ${stockCode}`, response.data.message);
                // 通知父组件刷新数据
                onFavoriteChange?.();
            } else {
                console.error('取消收藏失败:', response.data?.message);
            }
        } catch (error) {
            console.error('取消收藏出错:', error);
        } finally {
            setFavoriteLoading(prev => {
                const newLoading = new Set(prev);
                newLoading.delete(stockCode);
                return newLoading;
            });
        }
    };

    // 列配置
    const columns: GridColDef[] = [
        {
            field: 'stockCode',
            headerName: '代码',
            width: 90,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'stockSymbol',
            headerName: '名称',
            width: 100,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'closingPrice',
            headerName: '最新价',
            width: 90,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Typography 
                    variant="body2" 
                    sx={{ 
                        fontFamily: 'monospace', 
                        fontWeight: 'bold',
                        color: getChangeColor(params.row.priceChange)
                    }}
                >
                    {formatPrice(params.value)}
                </Typography>
            )
        },
        {
            field: 'priceChangePercentage',
            headerName: '涨跌幅',
            width: 90,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Typography 
                    variant="body2" 
                    sx={{ 
                        fontFamily: 'monospace', 
                        fontWeight: 'bold',
                        color: getChangeColor(params.value)
                    }}
                >
                    {formatPercent(params.value)}
                </Typography>
            )
        },
        {
            field: 'priceChange',
            headerName: '涨跌额',
            width: 80,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Typography 
                    variant="body2" 
                    sx={{ 
                        fontFamily: 'monospace',
                        color: getChangeColor(params.value)
                    }}
                >
                    {formatPrice(params.value)}
                </Typography>
            )
        },
        {
            field: 'openingPrice',
            headerName: '开盘',
            width: 80,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {formatPrice(params.value)}
                </Typography>
            )
        },
        {
            field: 'highestPrice',
            headerName: '最高',
            width: 80,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'error.main' }}>
                    {formatPrice(params.value)}
                </Typography>
            )
        },
        {
            field: 'lowestPrice',
            headerName: '最低',
            width: 80,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
                    {formatPrice(params.value)}
                </Typography>
            )
        },
        {
            field: 'tradingVolume',
            headerName: '成交量',
            width: 100,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {formatVolume(params.value)}
                </Typography>
            )
        },
        {
            field: 'tradingAmount',
            headerName: '成交额',
            width: 100,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {formatMarketValue(params.value)}
                </Typography>
            )
        },
        {
            field: 'turnoverRate',
            headerName: '换手率',
            width: 80,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {params.value !== null && params.value !== undefined ? Number(params.value).toFixed(2) + '%' : '-'}
                </Typography>
            )
        },
        {
            field: 'totalMarketValue',
            headerName: '总市值',
            width: 100,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {formatMarketValue(params.value)}
                </Typography>
            )
        },
        {
            field: 'industrySector',
            headerName: '行业',
            width: 100,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" color="text.secondary" noWrap>
                    {params.value || '-'}
                </Typography>
            )
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: '操作',
            width: 100,
            getActions: (params: GridRowParams) => [
                <GridActionsCellItem
                    key="unfavorite"
                    icon={<FavoriteIcon sx={{ color: 'error.main' }} />}
                    label="取消收藏"
                    onClick={() => handleUnfavorite(params.row.stockCode)}
                    disabled={favoriteLoading.has(params.row.stockCode)}
                />,
                <GridActionsCellItem
                    key="analyze"
                    icon={<TrendingUpIcon />}
                    label="K线图"
                    onClick={() => handleOpenKlineChart(params.row as FavoriteStockData)}
                />,
            ],
        },
    ];

    // 确保 tableData 是数组
    const validTableData = Array.isArray(tableData) ? tableData : [];
    const rows = validTableData.map((item) => ({
        id: item.stockCode,
        ...item
    }));

    // 分页配置
    const paginationModel = {
        page: pagination ? Number(pagination.currentPage) - 1 : 0,
        pageSize: pagination ? Number(pagination.pageSize) : 50,
    };

    return (
        <Box>
            {latestTradingDate && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    数据日期: {new Date(latestTradingDate).toLocaleDateString('zh-CN')}
                </Typography>
            )}
            <Paper sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    paginationModel={paginationModel}
                    pageSizeOptions={[10, 20, 50, 100]}
                    paginationMode="server"
                    rowCount={pagination?.total || 0}
                    onPaginationModelChange={(model) => {
                        onPageChange?.(model.page + 1, model.pageSize);
                    }}
                    disableRowSelectionOnClick
                    density="compact"
                    sx={{
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: 'grey.100',
                        },
                    }}
                />
            </Paper>

            {/* 全屏K线图弹窗 */}
            {klineDialogOpen && selectedStock && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                        boxSizing: 'border-box',
                    }}
                    onClick={handleCloseKlineChart}
                >
                    {/* K线图卡片容器 */}
                    <Box 
                        sx={{ 
                            width: '100%',
                            height: '100%',
                            maxWidth: '1600px',
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <KLineChartContainer
                            stockCode={selectedStock.stockCode}
                            stockName={selectedStock.stockSymbol}
                            showControls={true}
                            autoLoad={true}
                            defaultTimeRange="2Y"
                            onClose={handleCloseKlineChart}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
}
