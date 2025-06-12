
import { render, screen } from '@testing-library/react';
import SyncStatusIndicator from '../SyncStatusIndicator';

describe('SyncStatusIndicator', () => {
  it('should render synced status correctly', () => {
    render(
      <SyncStatusIndicator 
        status="synced" 
        lastSync={Date.now()} 
        conflictCount={0} 
      />
    );

    expect(screen.getByText('Synced')).toBeInTheDocument();
  });

  it('should render syncing status with animation', () => {
    render(
      <SyncStatusIndicator 
        status="syncing" 
        lastSync={Date.now()} 
        conflictCount={0} 
      />
    );

    expect(screen.getByText('Syncing')).toBeInTheDocument();
    const icon = screen.getByText('Syncing').previousSibling;
    expect(icon).toHaveClass('animate-spin');
  });

  it('should render conflict status with count', () => {
    render(
      <SyncStatusIndicator 
        status="conflict" 
        lastSync={Date.now()} 
        conflictCount={3} 
      />
    );

    expect(screen.getByText('3 Conflicts')).toBeInTheDocument();
  });

  it('should render error status', () => {
    render(
      <SyncStatusIndicator 
        status="error" 
        lastSync={Date.now()} 
        conflictCount={0} 
      />
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should render offline status', () => {
    render(
      <SyncStatusIndicator 
        status="offline" 
        lastSync={Date.now()} 
        conflictCount={0} 
      />
    );

    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should handle missing last sync', () => {
    render(
      <SyncStatusIndicator 
        status="synced" 
        conflictCount={0} 
      />
    );

    expect(screen.getByText('Synced')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SyncStatusIndicator 
        status="synced" 
        className="custom-class" 
      />
    );

    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
  });
});
