import { render, screen } from '@testing-library/react';
import HeroSection from '../HeroSection';

describe('HeroSection', () => {
  const mockProps = {
    title: 'Test Title',
    description: 'Test Description',
    searchPlaceholder: 'Search...',
    browseByLetterText: 'Browse by Letter',
    baseUrl: '/test'
  };

  it('renders all required elements', () => {
    render(<HeroSection {...mockProps} />);
    
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.description)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(mockProps.searchPlaceholder)).toBeInTheDocument();
    expect(screen.getByText(mockProps.browseByLetterText)).toBeInTheDocument();
  });
});