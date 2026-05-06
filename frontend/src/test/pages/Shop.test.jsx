import { fireEvent, render, screen } from '@testing-library/react';
import { Shop } from '../../pages/Shop';
import { productAPI } from '../../services/API';

vi.mock('../../services/API', () => ({
  productAPI: {
    getProducts: vi.fn(),
  },
}));

vi.mock('../../components/ProductCard', () => ({
  ProductCard: ({ product, onBuy }) => (
    <button onClick={onBuy} aria-label={`buy-${product.name}`}>
      {product.name}
    </button>
  ),
}));

describe('Shop Page', () => {
  beforeEach(() => {
    productAPI.getProducts.mockResolvedValue([
      { _id: '1', name: 'Windows 11 Pro', category: 'OS', price: 100, description: 'd1', image: 'a.jpg', availableKeysCount: 1 },
      { _id: '2', name: 'Office 2021', category: 'OFFICE', price: 200, description: 'd2', image: 'b.jpg', availableKeysCount: 1 },
    ]);
  });

  it('filtre les produits par catégorie', async () => {
    render(<Shop handleBuy={vi.fn()} />);
    expect(await screen.findByText('Windows 11 Pro')).toBeInTheDocument();
    expect(await screen.findByText('Office 2021')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'OFFICE' }));

    expect(screen.queryByText('Windows 11 Pro')).not.toBeInTheDocument();
    expect(screen.getByText('Office 2021')).toBeInTheDocument();
  });

  it('appelle handleBuy pour le produit cliqué', async () => {
    const handleBuy = vi.fn();
    render(<Shop handleBuy={handleBuy} />);

    await screen.findByText('Windows 11 Pro');
    fireEvent.click(screen.getByRole('button', { name: 'buy-Windows 11 Pro' }));
    expect(handleBuy).toHaveBeenCalledWith(
      expect.objectContaining({ _id: '1', name: 'Windows 11 Pro' })
    );
  });
});
