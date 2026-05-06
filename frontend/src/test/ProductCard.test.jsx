import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../components/ProductCard';
import { describe, it, expect, vi } from 'vitest';

describe('ProductCard Component', () => {
  const mockProduct = {
    _id: '1',
    name: 'Windows 11 Pro',
    category: 'OS',
    price: 19500,
    image: 'test-image.jpg',
    description: 'Test description',
    availableKeysCount: 10
  };

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} onBuy={() => {}} />);
    
    expect(screen.getByText('Windows 11 Pro')).toBeInTheDocument();
    expect(screen.getByText('19 500 FCFA')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('En Stock')).toBeInTheDocument();
  });

  it('shows "Rupture" when stock is zero', () => {
    const outOfStockProduct = { ...mockProduct, availableKeysCount: 0 };
    render(<ProductCard product={outOfStockProduct} onBuy={() => {}} />);
    
    expect(screen.getByText('Rupture')).toBeInTheDocument();
  });

  it('calls onBuy when shopping cart button is clicked', () => {
    const onBuyMock = vi.fn();
    render(<ProductCard product={mockProduct} onBuy={onBuyMock} />);
    
    const buyButton = screen.getByRole('button');
    fireEvent.click(buyButton);
    
    expect(onBuyMock).toHaveBeenCalledTimes(1);
  });
});
