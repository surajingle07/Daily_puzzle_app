import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Heatmap from '../components/Heatmap';
import { AppProvider } from '../context/AppContext';

// Mock DB
vi.mock('../db', () => ({
  getAllActivities: vi.fn().mockResolvedValue([
  {
    date: '2026-03-24',
    completedPuzzles: ['logic', 'pattern'],
    score: 1000,
    timeSpentMs: 45000
  }]
  )
}));

describe('Heatmap Component', () => {
  it('renders a 365-day history timeline', async () => {
    const { getByText } = render(
      <AppProvider>
        <Heatmap />
      </AppProvider>
    );

    expect(getByText('365-Day History')).toBeInTheDocument();

    const lessMoreLabels = getByText('Less');
    expect(lessMoreLabels).toBeInTheDocument();
  });
});