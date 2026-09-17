import React from 'react';
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
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const NoteFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  availableTags = [],
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
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search notes by title, content, or tags..."
          value={filters.searchTerm || ''}
          onChange={handleSearchChange}
          size="small"
          sx={{ flex: 3 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: filters.searchTerm ? (
                <InputAdornment position="end">
                  <ClearIcon
                    fontSize="small"
                    sx={{ cursor: 'pointer' }}
                    onClick={handleClearSearch}
                  />
                </InputAdornment>
              ) : null,
            },
          }}
        />

        {/* Tag Filter */}
        <FormControl size="small" sx={{ flex: 1, minWidth: 150 }}>
          <InputLabel id="note-tag-filter-label">Filter by Tag</InputLabel>
          <Select
            labelId="note-tag-filter-label"
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
      </Box>

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