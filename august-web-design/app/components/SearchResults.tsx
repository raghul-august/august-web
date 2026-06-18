'use client';
import { Autocomplete, TextField, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const CategoryText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: theme.palette.grey[600],
}));

const StyledOption = styled('li')(({ theme }) => ({
  padding: '8px 16px',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& .MuiTypography-root': {
      color: theme.palette.primary.contrastText,
    }
  },
}));

export interface SearchResult {
  id: number;
  name: string;
  slug: string;
  type: 'Medication' | 'Condition' | 'Test' | 'Symptom';
}

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  onResultSelect: (result: SearchResult) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchResults({
  results,
  loading,
  onResultSelect,
  inputValue,
  onInputChange,
  placeholder = 'Search...'
}: SearchResultsProps) {
  return (
    <Autocomplete<SearchResult>
      fullWidth
      loading={loading}
      options={results}
      getOptionLabel={(option: SearchResult) => option.name}
      inputValue={inputValue}
      onInputChange={(_, newValue) => onInputChange(newValue)}
      onChange={(_, value) => value && onResultSelect(value)}
      filterOptions={(x) => x} // Disable built-in filtering as we're using API
      noOptionsText={loading ? "Loading..." : "No results found"}
      clearOnBlur={false}
      clearOnEscape
      handleHomeEndKeys
      selectOnFocus
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          variant="outlined"
          sx={{
            backgroundColor: 'white',
            '& .MuiOutlinedInput-root': {
              borderRadius: '28px',
            }
          }}
        />
      )}
      renderOption={(props, option: SearchResult) => (
        <StyledOption {...props} key={option.id}>
          <Box>
            <Typography>{option.name}</Typography>
            <CategoryText>{option.type}</CategoryText>
          </Box>
        </StyledOption>
      )}
    />
  );
}
