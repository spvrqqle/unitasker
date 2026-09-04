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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

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

  const hasActiveFilters = filters.status !== 'All' || 
                          filters.priority !== 'All' || 
                          filters.sortBy !== 'dueDate' ||
                          filters.searchTerm;

  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={2}
        alignItems={isMobile ? 'stretch' : 'center'}
        sx={{ flexWrap: 'wrap' }}
      >
        {/* Search */}
        <TextField
          placeholder="Search tasks..."
          value={filters.searchTerm || ''}
          onChange={handleSearchChange}
          size="small"
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: filters.searchTerm && (
              <InputAdornment position="end">
                <ClearIcon 
                  sx={{ cursor: 'pointer' }} 
                  onClick={handleClearSearch}
                />
              </InputAdornment>
            ),
          }}
        />

        {/* Status Filter */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
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

        {/* Priority Filter */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Priority</InputLabel>
          <Select
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
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
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
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Order</InputLabel>
          <Select
            value={filters.sortDirection || 'asc'}
            onChange={handleChange('sortDirection')}
            label="Order"
          >
            <MenuItem value="asc">↑ Asc</MenuItem>
            <MenuItem value="desc">↓ Desc</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {filters.status !== 'All' && (
              <Chip
                label={`Status: ${filters.status}`}
                size="small"
                onDelete={() => onFilterChange({ ...filters, status: 'All' })}
              />
            )}
            {filters.priority !== 'All' && (
              <Chip
                label={`Priority: ${filters.priority}`}
                size="small"
                onDelete={() => onFilterChange({ ...filters, priority: 'All' })}
              />
            )}
            {filters.searchTerm && (
              <Chip
                label={`Search: "${filters.searchTerm}"`}
                size="small"
                onDelete={handleClearSearch}
              />
            )}
            {(filters.status !== 'All' || filters.priority !== 'All' || filters.searchTerm) && (
              <Chip
                label="Clear All"
                size="small"
                color="primary"
                onClick={onClearFilters}
              />
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default TaskFilters;