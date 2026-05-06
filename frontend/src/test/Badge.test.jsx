import { render, screen } from '@testing-library/react';
import { Badge } from '../components/Badge';
import { describe, it, expect } from 'vitest';

describe('Badge Component', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies the correct color class', () => {
    const { container } = render(<Badge color="green">Success</Badge>);
    expect(container.firstChild).toHaveClass('bg-emerald-50');
  });

  it('applies status styles correctly', () => {
    const { container } = render(<Badge status="Échoué">Failed</Badge>);
    expect(container.firstChild).toHaveClass('bg-rose-50');
    expect(container.firstChild).toHaveClass('uppercase');
  });
});
