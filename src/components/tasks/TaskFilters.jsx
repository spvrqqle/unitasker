import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

const TaskFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (field) => (event) => {
    onFilterChange({ ...filters, [field]: event.target.value });
  };

  const handleSearchChange = (event) => {
    onFilterChange({ ...filters, searchTerm: event.target.value });
  };

  const handleClearSearch = () => {
    onFilterChange({ ...filters, searchTerm: '' });
  };

  const hasActiveFilters =
    filters.status !== 'All' ||
    filters.priority !== 'All' ||
    filters.sortBy !== 'dueDate' ||
    filters.searchTerm;

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: '2fr 1fr 1fr 1.2fr 1fr',
          },
          gap: 1.5,
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 1' } }}>
          <TextField
            placeholder="Search tasks..."
            value={filters.searchTerm || ''}
            onChange={handleSearchChange}
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: filters.searchTerm ? (
                  <InputAdornment position="end">
                    <Tooltip title="Clear search" arrow>
                      <ClearIcon
                        fontSize="small"
                        sx={{ cursor: 'pointer' }}
                        onClick={handleClearSearch}
                        aria-label="Clear search"
                      />
                    </Tooltip>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
        </Box>

        {/* Status */}
        <FormControl size="small" fullWidth>
          <InputLabel id="task-status-label">Status</InputLabel>
          <Select
            labelId="task-status-label"
            value={filters.status || 'All'}
            onChange={handleChange('status')}
            label="Status"
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="To Do">To Do</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>

        {/* Priority */}
        <FormControl size="small" fullWidth>
          <InputLabel id="task-priority-label">Priority</InputLabel>
          <Select
            labelId="task-priority-label"
            value={filters.priority || 'All'}
            onChange={handleChange('priority')}
            label="Priority"
          >
            <MenuItem value="All">All Priority</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </Select>
        </FormControl>

        {/* Sort By */}
        <FormControl size="small" fullWidth>
          <InputLabel id="task-sortby-label">Sort By</InputLabel>
          <Select
            labelId="task-sortby-label"
            value={filters.sortBy || 'dueDate'}
            onChange={handleChange('sortBy')}
            label="Sort By"
          >
            <MenuItem value="dueDate">Due Date</MenuItem>
            <MenuItem value="priority">Priority</MenuItem>
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="createdAt">Created Date</MenuItem>
          </Select>
        </FormControl>

        {/* Sort Direction */}
        <FormControl size="small" fullWidth>
          <InputLabel id="task-order-label">Order</InputLabel>
          <Select
            labelId="task-order-label"
            value={filters.sortDirection || 'asc'}
            onChange={handleChange('sortDirection')}
            label="Order"
          >
            <MenuItem value="asc">↑ Asc</MenuItem>
            <MenuItem value="desc">↓ Desc</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {hasActiveFilters && (
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            <FilterIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            {filters.status !== 'All' && (
              <Chip
                label={`Status: ${filters.status}`}
                size="small"
                onDelete={() => onFilterChange({ ...filters, status: 'All' })}
                sx={{ height: 24, '& .MuiChip-label': { fontSize: '0.7rem' } }}
              />
            )}
            {filters.priority !== 'All' && (
              <Chip
                label={`Priority: ${filters.priority}`}
                size="small"
                onDelete={() => onFilterChange({ ...filters, priority: 'All' })}
                sx={{ height: 24, '& .MuiChip-label': { fontSize: '0.7rem' } }}
              />
            )}
            {filters.searchTerm && (
              <Chip
                label={`Search: "${filters.searchTerm}"`}
                size="small"
                onDelete={handleClearSearch}
                sx={{ height: 24, '& .MuiChip-label': { fontSize: '0.7rem' } }}
              />
            )}
            {(filters.status !== 'All' || filters.priority !== 'All' || filters.searchTerm) && (
              <Chip
                label="Clear all"
                size="small"
                color="primary"
                onClick={onClearFilters}
                sx={{ height: 24, '& .MuiChip-label': { fontSize: '0.7rem' }, cursor: 'pointer' }}
              />
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default TaskFilters;