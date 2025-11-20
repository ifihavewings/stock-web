'use client'
import { Box, TextField } from "@mui/material"
export default function StockListPage() {


  return (
    <Box sx={{
      p: 2,
      height: '100%'
    }}>
        <TextField label="code or name" variant="outlined" />
    </Box>
  )
}