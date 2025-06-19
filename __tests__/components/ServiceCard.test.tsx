import { render, screen, fireEvent } from '@testing-library/react';
import ServiceCard from '@/components/ServiceCard';

describe('ServiceCard', () => {
  const mockService = {
    name: 'Plumbing',
    description: 'Professional plumbing services',
    icon: '🔧',
    color: 'bg-blue-500',
  };

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders service information correctly', () => {
    render(<ServiceCard service={mockService} onSelect={mockOnSelect} />);
    
    expect(screen.getByText('Plumbing')).toBeInTheDocument();
    expect(screen.getByText('Professional plumbing services')).toBeInTheDocument();
    expect(screen.getByText('🔧')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    render(<ServiceCard service={mockService} onSelect={mockOnSelect} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockService.name);
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('applies correct styling', () => {
    render(<ServiceCard service={mockService} onSelect={mockOnSelect} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveClass('group', 'cursor-pointer');
  });

  it('shows hover effect', () => {
    render(<ServiceCard service={mockService} onSelect={mockOnSelect} />);
    
    const card = screen.getByRole('button');
    fireEvent.mouseEnter(card);
    
    // Check for hover state classes
    expect(card).toHaveClass('transition-all');
  });
});