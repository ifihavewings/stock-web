import { DataGrid, GridColDef, GridActionsCellItem, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

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
}

interface StockListProps {
    tableData: StockData[];
}

export default function StockList(props: StockListProps) {
    const { tableData } = props;

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
            width: 180,
            getActions: (params: GridRowParams) => [
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
                <GridActionsCellItem
                    key="edit"
                    icon={<EditIcon />}
                    label="编辑"
                    onClick={() => handleEdit(params.row.stockCode)}
                />,
                <GridActionsCellItem
                    key="delete"
                    icon={<DeleteIcon />}
                    label="删除"
                    onClick={() => handleDelete(params.row.stockCode)}
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

    const paginationModel = { page: 0, pageSize: 10 };

    return (
        <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{ 
                    pagination: { 
                        paginationModel 
                    }
                }}
                pageSizeOptions={[5, 10, 25, 50]}
                checkboxSelection
                disableRowSelectionOnClick
                sx={{ 
                    border: 0,
                    '& .MuiDataGrid-cell:hover': {
                        color: 'primary.main',
                    },
                }}
            />
        </Paper>
    );
}