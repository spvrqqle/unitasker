import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon, FilterList as FilterIcon } from '@mui/icons-material';

const NoteFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  availableTags = [] 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSearchChange = (event) => {
    onFilterChange({ ...filters, searchTerm: event.target.value });
  };

  const handleClearSearch = () => {
    onFilterChange({ ...filters, searchTerm: '' });
  };

  const handleTagFilterChange = (event) => {
    onFilterChange({ ...filters, selectedTag: event.target.value });
  };

  const hasActiveFilters = filters.searchTerm || filters.selectedTag;

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Search */}
        <Grid item xs={12} sm={8} md={9}>
          <TextField
            placeholder="Search notes by title, content, or tags..."
            value={filters.searchTerm || ''}
            onChange={handleSearchChange}
            size="small"
            fullWidth
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
        </Grid>

        {/* Tag Filter */}
        <Grid item xs={12} sm={4} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>Filter by Tag</InputLabel>
            <Select
              value={filters.selectedTag || ''}
              onChange={handleTagFilterChange}
              label="Filter by Tag"
            >
              <MenuItem value="">All Tags</MenuItem>
              {availableTags.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  #{tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {filters.searchTerm && (
              <Chip
                label={`Search: "${filters.searchTerm}"`}
                size="small"
                onDelete={handleClearSearch}
              />
            )}
            {filters.selectedTag && (
              <Chip
                label={`Tag: ${filters.selectedTag}`}
                size="small"
                onDelete={() => onFilterChange({ ...filters, selectedTag: '' })}
              />
            )}
            {(filters.searchTerm || filters.selectedTag) && (
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

export default NoteFilters;