import { fireEvent, render, screen } from '@testing-library/react';
import { Checkout } from '../../pages/Checkout';

describe('Checkout Page', () => {
  it('retourne null si cartItem est absent', () => {
    const { container } = render(<Checkout cartItem={null} completeOrder={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('affiche le récapitulatif et déclenche completeOrder', () => {
    const completeOrder = vi.fn();
    const cartItem = {
      name: 'Office 2021',
      category: 'OFFICE',
      price: 29500,
      image: 'test.jpg',
    };

    render(<Checkout cartItem={cartItem} completeOrder={completeOrder} />);

    expect(screen.getByText('Récapitulatif')).toBeInTheDocument();
    expect(screen.getByText('Office 2021')).toBeInTheDocument();
    expect(screen.getAllByText('29 500 FCFA').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Confirmer et Payer/i }));
    expect(completeOrder).toHaveBeenCalledTimes(1);
  });
});
