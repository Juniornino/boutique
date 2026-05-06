import { fireEvent, render, screen } from '@testing-library/react';
import { Home } from '../../pages/Home';
import { productAPI } from '../../services/API';

vi.mock('../../services/API', () => ({
  productAPI: {
    getProducts: vi.fn(),
  },
}));

vi.mock('../../components/ProductCard', () => ({
  ProductCard: ({ product, onBuy }) => (
    <button onClick={onBuy} aria-label={`featured-${product.name}`}>
      {product.name}
    </button>
  ),
}));

describe('Home Page', () => {
  beforeEach(() => {
    productAPI.getProducts.mockResolvedValue([
      { _id: '1', name: 'Windows 11 Pro', category: 'OS', price: 100, description: 'd1', image: 'a.jpg', availableKeysCount: 1 },
      { _id: '2', name: 'Office 2021', category: 'OFFICE', price: 200, description: 'd2', image: 'b.jpg', availableKeysCount: 1 },
      { _id: '3', name: 'Kaspersky', category: 'SECURITY', price: 300, description: 'd3', image: 'c.jpg', availableKeysCount: 1 },
    ]);
  });

  it('redirige vers shop via les actions principales', () => {
    const setView = vi.fn();
    render(<Home setView={setView} handleBuy={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Explorer le catalogue/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tout voir/i }));

    expect(setView).toHaveBeenCalledWith('shop');
  });

  it('appelle handleBuy sur un produit mis en avant', async () => {
    const handleBuy = vi.fn();
    render(<Home setView={vi.fn()} handleBuy={handleBuy} />);

    await screen.findByText('Windows 11 Pro');
    fireEvent.click(screen.getByRole('button', { name: 'featured-Windows 11 Pro' }));
    expect(handleBuy).toHaveBeenCalledWith(
      expect.objectContaining({ _id: '1', name: 'Windows 11 Pro' })
    );
  });
});
