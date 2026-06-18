import { render, screen } from '@testing-library/react';
import PageLayout from '../PageLayout';

jest.mock('../NavBar', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-navbar">NavBar</div>
}));

describe('PageLayout', () => {
  const mockProps = {
    heroProps: {
      title: 'Test Title',
      description: 'Test Description',
      searchPlaceholder: 'Search...',
      browseByLetterText: 'Browse by Letter',
      baseUrl: '/test'
    },
    categoryData: {
      title: 'Category Title',
      description: 'Category Description',
      items: []
    }
  };

  it('renders all main sections', () => {
    render(<PageLayout {...mockProps} />);
    
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    expect(screen.getByText(mockProps.heroProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.categoryData.title)).toBeInTheDocument();
  });
});
