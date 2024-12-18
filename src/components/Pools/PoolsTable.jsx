import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Paper, Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, LinearProgress} from '@mui/material';

const PoolsTable = () => {
  const navigate = useNavigate();
  const EPSILON = 1e-8;
  const MILLION_NUMBER = 1000000;
  const THOUSAND_NUMBER = 1000;
  const [pools, setPools] = useState([]);
  const [search, setSearch] = useState('');
  const [feeTier, setFeeTier] = useState(0.0);
  const [liquidityThreshold, setLiquidityThreshold] = useState(0.0);
  const [volumeThreshold, setVolumeThreshold] = useState(0.0);
  const [sortField, setSortField] = useState("None");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPools, setTotalPools] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPools(page, rowsPerPage);
  }, [page, rowsPerPage, search, feeTier, liquidityThreshold, volumeThreshold, sortField]);

  

  const fetchPools = async (page, rowsPerPage) => {
    setLoading(true);
    const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/current-pool-metric?page_number=${page + 1}&page_limit=${rowsPerPage}&search_query=${search}&fee_tier=${feeTier}&liquidity_threshold=${liquidityThreshold}&volume_threshold=${volumeThreshold}&sort_by=${sortField}`);
    const data = response.data;
    setLoading(false);
    console.log(data.pools);
    setPools(data.pools);
    setTotalPools(data.total_pool_count);

  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ padding: '20px', marginBottom: '40px' }}>
      <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Search by Token"
            variant="outlined"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
      </Grid>
      <TableContainer component={Paper}>
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><Typography fontWeight="bold">#</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Pool</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">TVL</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Liquidity</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">1D Vol</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">1D vol/TVL</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pools.map((pool, index) => (
              <TableRow key={index} onClick={() => navigate(`/analytics/pool/${pool.pool_address}`)}>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>
                  {pool.token0_symbol || "ETH"} / {pool.token1_symbol || "ETH"}&nbsp;&nbsp;v3&nbsp;&nbsp;{pool.fee / 10000}%
                </TableCell>
                <TableCell>${((pool.total_volume_token0 * pool.token0_price + pool.total_volume_token1 * pool.token1_price) / MILLION_NUMBER).toFixed(2)}M</TableCell>
                <TableCell>${((pool.liquidity_token0 * pool.token0_price + pool.liquidity_token1 * pool.token1_price)/ MILLION_NUMBER).toFixed(2)}M</TableCell>
                <TableCell>${((pool.volume_token0_1day * pool.token0_price + pool.volume_token1_1day * pool.token1_price) / THOUSAND_NUMBER).toFixed(2)}K</TableCell>
                <TableCell>${((pool.volume_token0_1day * pool.token0_price + pool.volume_token1_1day * pool.token1_price) / (pool.total_volume_token0 * pool.token0_price + pool.total_volume_token1 * pool.token1_price + EPSILON) * 100).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalPools}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Paper>
  );
};

export default PoolsTable;