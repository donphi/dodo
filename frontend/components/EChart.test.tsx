import React from 'react';
import { render, screen } from '@testing-library/react';
import EChart from './EChart';

describe('EChart', () => {
  it('renders without crashing', () => {
    render(<EChart option={{}} />);
    // The EChart component should render a div or canvas (depending on implementation)
    // This is a minimal smoke test
    expect(screen.getByTestId('echart-container')).toBeInTheDocument();
  });
});
