import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from '../components/Button';

describe('Button Component', () => {
  it('affiche le label passé en children', () => {
    render(<Button>Cliquer</Button>);
    expect(screen.getByText('Cliquer')).toBeInTheDocument();
  });

  it('appelle onClick quand on clique', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Action</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Action' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
