import { DataGrid, GridColDef, GridActionsCellItem, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { favoriteStock } from '@/app/apis/companies';

// 定义股票数据类型
interface StockData {
    stockCode: string;
    stockSymbol: string;
    companyArea: string;
    industrySector: string;
    marketType: string;
    stockExchange: string;
    listingDate: string;
    totalMarketValue: string | null;
    circulatingMarketValue: string | null;
    totalShares: string | null;
    circulatingShares: string | null;
    lastUpdateTimestamp: string | null;
    isFavorite?: number; // 添加收藏状态字段
}

interface StockListProps {
    tableData: StockData[];
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
}

export default function StockList(props: StockListProps) {
    const { tableData, pagination, loading = false, onPageChange } = props;

    // 收藏状态管理 - 使用Map存储股票代码和收藏状态的映射
    const [favorites, setFavorites] = useState<Map<string, number>>(new Map());
    const [favoriteLoading, setFavoriteLoading] = useState<Set<string>>(new Set());

    // 初始化收藏状态
    useEffect(() => {
        const newFavorites = new Map<string, number>();
        tableData.forEach(stock => {
            if (stock.isFavorite !== undefined) {
                newFavorites.set(stock.stockCode, stock.isFavorite);
            }
        });
        setFavorites(newFavorites);
    }, [tableData]);

    // 工具函数
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('zh-CN');
    const formatShares = (shares: string | null) => {
        if (!shares || shares === 'null') return '-';
        const num = parseFloat(shares);
        return isNaN(num) ? '-' : num.toFixed(2);
    };
    const getIndustryColor = (area: string): any => {
        if (area === '-' || !area) return 'default';
        if (area.includes('银行')) return 'primary';
        if (area.includes('房地产')) return 'secondary';
        if (area.includes('软件')) return 'info';
        return 'default';
    };

    // 操作处理函数
    const handleView = (stockCode: string) => console.log('查看:', stockCode);
    const handleAnalyze = (stockCode: string) => console.log('分析:', stockCode);
    const handleEdit = (stockCode: string) => console.log('编辑:', stockCode);
    const handleDelete = (stockCode: string) => console.log('删除:', stockCode);
    
    // 收藏处理函数
    const handleFavorite = async (stockCode: string) => {
        // 防止重复点击
        if (favoriteLoading.has(stockCode)) {
            return;
        }

        // 设置加载状态
        setFavoriteLoading(prev => new Set(prev).add(stockCode));

        try {
            // 调用后端API
            const response = await favoriteStock(stockCode);
            
            if (response.data?.success) {
                // 更新本地状态
                setFavorites(prev => {
                    const newFavorites = new Map(prev);
                    newFavorites.set(stockCode, response.data.isFavorite);
                    return newFavorites;
                });

                const action = response.data.isFavorite === 1 ? '添加收藏' : '取消收藏';
                console.log(`${action}: ${stockCode}`, response.data.message);
            } else {
                console.error('收藏操作失败:', response.data?.message);
            }
        } catch (error) {
            console.error('收藏操作出错:', error);
        } finally {
            // 移除加载状态
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
            headerName: '股票代码',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'stockSymbol',
            headerName: '股票名称',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'companyArea',
            headerName: '公司领域',
            width: 130,
            renderCell: (params: GridRenderCellParams) => (
                <Chip 
                    label={params.value === '-' ? '未分类' : params.value}
                    size="small"
                    color={getIndustryColor(params.value)}
                    variant="outlined"
                />
            )
        },
        {
            field: 'industrySector',
            headerName: '行业板块',
            width: 130,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" color="text.secondary">
                    {params.value === '-' ? '未分类' : params.value}
                </Typography>
            )
        },
        {
            field: 'listingDate',
            headerName: '上市日期',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2">
                    {formatDate(params.value)}
                </Typography>
            )
        },
        {
            field: 'totalShares',
            headerName: '总股本(万股)',
            width: 130,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {formatShares(params.value)}
                </Typography>
            )
        },
        {
            field: 'circulatingShares',
            headerName: '流通股(万股)',
            width: 130,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Typography 
                    variant="body2" 
                    sx={{ 
                        fontFamily: 'monospace',
                        color: params.value && parseFloat(params.value) < 0 ? 'error.main' : 'text.primary'
                    }}
                >
                    {formatShares(params.value)}
                </Typography>
            )
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: '操作',
            width: 220, // 增加宽度以容纳新按钮
            getActions: (params: GridRowParams) => [
                <GridActionsCellItem
                    key="favorite"
                    icon={favorites.get(params.row.stockCode) === 1 ? 
                        <FavoriteIcon sx={{ color: 'error.main' }} /> : 
                        <FavoriteBorderIcon />
                    }
                    label={favorites.get(params.row.stockCode) === 1 ? "取消收藏" : "添加收藏"}
                    onClick={() => handleFavorite(params.row.stockCode)}
                    disabled={favoriteLoading.has(params.row.stockCode)}
                />,
                <GridActionsCellItem
                    key="view"
                    icon={<VisibilityIcon />}
                    label="查看详情"
                    onClick={() => handleView(params.row.stockCode)}
                />,
                <GridActionsCellItem
                    key="analyze"
                    icon={<TrendingUpIcon />}
                    label="股票分析"
                    onClick={() => handleAnalyze(params.row.stockCode)}
                />,
            ],
        },
    ];

    // 将数据转换为 DataGrid 需要的格式（添加 id 字段）
    // 确保 tableData 是数组，避免 .map is not a function 错误
    const validTableData = Array.isArray(tableData) ? tableData : []
    const rows = validTableData.map((item, index) => ({
        id: item.stockCode, // 使用 stockCode 作为唯一 ID
        ...item
    }))

    // 分页状态，使用后端分页信息
    const currentPage = pagination ? Number(pagination.currentPage) - 1 : 0 // DataGrid 使用 0 基础页码
    const currentPageSize = pagination ? Number(pagination.pageSize) : 10
    const rowCount = pagination ? pagination.total : rows.length

    // 处理分页变化
    const handlePaginationModelChange = (model: { page: number; pageSize: number }) => {
        if (onPageChange) {
            onPageChange(model.page + 1, model.pageSize) // 转换为 1 基础页码传给后端
        }
    }

    return (
        <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                paginationMode="server" // 启用服务器端分页
                rowCount={rowCount} // 总行数，用于分页计算
                loading={loading}
                paginationModel={{ 
                    page: currentPage, 
                    pageSize: currentPageSize 
                }}
                onPaginationModelChange={handlePaginationModelChange}
                pageSizeOptions={[5, 10, 25, 50]}
                checkboxSelection
                disableRowSelectionOnClick
                sx={{ 
                    border: 0,
                    '& .MuiDataGrid-cell:hover': {
                        color: 'primary.main',
                    },
                    // 修复复选框与行内文本的垂直对齐
                    '& .MuiDataGrid-checkboxInput': {
                        padding: '0',
                        '& svg': {
                            fontSize: '1.2rem',
                            verticalAlign: 'middle',
                        }
                    },
                    '& .MuiDataGrid-columnHeaderCheckbox': {
                        padding: '0',
                        '& .MuiCheckbox-root': {
                            padding: '8px',
                        }
                    },
                    // 统一所有单元格的垂直对齐方式
                    '& .MuiDataGrid-cell': {
                        display: 'flex',
                        alignItems: 'center',
                        lineHeight: 'normal',
                    },
                    '& .MuiDataGrid-columnHeader': {
                        display: 'flex',
                        alignItems: 'center',
                        lineHeight: 'normal',
                    },
                }}
            />
        </Paper>
    );
}