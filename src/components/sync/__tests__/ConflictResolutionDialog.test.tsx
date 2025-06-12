
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConflictResolutionDialog from '../ConflictResolutionDialog';
import { ConflictData } from '@/adapters/sync/types';

const mockConflict: ConflictData = {
  id: 'conflict-1',
  localVersion: {
    id: '1',
    name: 'Local Name',
    description: 'Local Description',
    version: 1,
    timestamp: 1000000000000,
    nodeId: 'node1',
    checksum: 'local-checksum'
  },
  remoteVersion: {
    id: '1',
    name: 'Remote Name',
    description: 'Remote Description',
    version: 2,
    timestamp: 1000000001000,
    nodeId: 'node2',
    checksum: 'remote-checksum'
  },
  conflictType: 'concurrent_edit'
};

describe('ConflictResolutionDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnResolve = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open with conflict', () => {
    render(
      <ConflictResolutionDialog
        isOpen={true}
        onClose={mockOnClose}
        conflict={mockConflict}
        onResolve={mockOnResolve}
      />
    );

    expect(screen.getByText('Resolve Data Conflict')).toBeVisible();
    expect(screen.getByText('CONCURRENT EDIT')).toBeVisible();
    expect(screen.getByText('Local Version')).toBeVisible();
    expect(screen.getByText('Remote Version')).toBeVisible();
  });

  it('should not render when closed', () => {
    render(
      <ConflictResolutionDialog
        isOpen={false}
        onClose={mockOnClose}
        conflict={mockConflict}
        onResolve={mockOnResolve}
      />
    );

    expect(screen.queryByText('Resolve Data Conflict')).not.toBeInTheDocument();
  });

  it('should not render when conflict is null', () => {
    render(
      <ConflictResolutionDialog
        isOpen={true}
        onClose={mockOnClose}
        conflict={null}
        onResolve={mockOnResolve}
      />
    );

    expect(screen.queryByText('Resolve Data Conflict')).not.toBeInTheDocument();
  });

  it('should display conflict data correctly', () => {
    render(
      <ConflictResolutionDialog
        isOpen={true}
        onClose={mockOnClose}
        conflict={mockConflict}
        onResolve={mockOnResolve}
      />
    );

    expect(screen.getByText('Local Name')).toBeVisible();
    expect(screen.getByText('Remote Name')).toBeVisible();
    expect(screen.getByText('Version: 1')).toBeVisible();
    expect(screen.getByText('Version: 2')).toBeVisible();
    expect(screen.getByText('Node: node1')).toBeVisible();
    expect(screen.getByText('Node: node2')).toBeVisible();
  });

  it('should call onResolve with local strategy', async () => {
    render(
      <ConflictResolutionDialog
        isOpen={true}
        onClose={mockOnClose}
        conflict={mockConflict}
        onResolve={mockOnResolve}
      />
    );

    const keepLocalButton = screen.getByText('Keep Local');
    fireEvent.click(keepLocalButton);

    await waitFor(() => {
      expect(mockOnResolve).toHaveBeenCalledWith('conflict-1', 'local');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should call onResolve with remote strategy', async () => {
    render(
      <ConflictResolutionDialog
        isOpen={true}
        onClose={mockOnClose}
        conflict={mockConflict}
        onResolve={mockOnResolve}
      />
    );

    const useRemoteButton = screen.getByText('Use Remote');
    fireEvent.click(useRemoteButton);

    await waitFor(() => {
      expect(mockOnResolve).toHaveBeenCalledWith('conflict-1', 'remote');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should call onResolve with merge strategy', async () => {
    render(
      <ConflictResolutionDialog
        isOpen={true}
        onClose={mockOnClose}
        conflict={mockConflict}
        onResolve={mockOnResolve}
      />
    );

    const mergeButton = screen.getByText('Merge Versions');
    fireEvent.click(mergeButton);

    await waitFor(() => {
      expect(mockOnResolve).toHaveBeenCalledWith('conflict-1', 'merge');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <ConflictResolutionDialog
        isOpen={true}
        onClose={mockOnClose}
        conflict={mockConflict}
        onResolve={mockOnResolve}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnResolve).not.toHaveBeenCalled();
  });

  it('should format timestamps correctly', () => {
    render(
      <ConflictResolutionDialog
        isOpen={true}
        onClose={mockOnClose}
        conflict={mockConflict}
        onResolve={mockOnResolve}
      />
    );

    // Check that timestamps are formatted as locale strings
    const expectedLocalTime = new Date(1000000000000).toLocaleString();
    const expectedRemoteTime = new Date(1000000001000).toLocaleString();
    
    expect(screen.getByText(`Modified: ${expectedLocalTime}`)).toBeVisible();
    expect(screen.getByText(`Modified: ${expectedRemoteTime}`)).toBeVisible();
  });

  it('should display JSON data in pre blocks', () => {
    render(
      <ConflictResolutionDialog
        isOpen={true}
        onClose={mockOnClose}
        conflict={mockConflict}
        onResolve={mockOnResolve}
      />
    );

    const preElements = document.querySelectorAll('pre');
    expect(preElements.length).toBeGreaterThan(0);
  });
});
