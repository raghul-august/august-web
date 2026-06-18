import { render, screen } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('renders with placeholder text', () => {
    const placeholder = 'Search items...';
    render(<SearchBar placeholder={placeholder} />);
    
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  it('includes search icon', () => {
    render(<SearchBar placeholder="Search" />);
    
    // MUI adds a specific test-id to icons
    expect(screen.getByTestId('SearchIcon')).toBeInTheDocument();
  });
});