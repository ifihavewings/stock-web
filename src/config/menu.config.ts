import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export const menuItems = [
    {
        title: "Stock List",
        path: "/stock-list",
        icon: FormatListNumberedOutlinedIcon,
        iconColor: "#fff",
    },
    {
        title: "Market Data",
        path: "/market",
        icon: TrendingUpIcon,
        iconColor: "#fff",
    },
    {
        title: "Watched Stocks",
        path: "/watched",
        icon: FavoriteIcon,
        iconColor: "#fff",
    }
]