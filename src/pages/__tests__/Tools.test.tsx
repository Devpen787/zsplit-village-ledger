
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Tools from '../Tools';

// Mock the navigation
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the components
jest.mock('@/components/tools/DataManagement', () => {
  return function MockDataManagement() {
    return <div data-testid="data-management">Data Management Component</div>;
  };
});

jest.mock('@/components/tools/DevTools', () => {
  return function MockDevTools() {
    return <div data-testid="dev-tools">Dev Tools Component</div>;
  };
});

jest.mock('@/layouts/AppLayout', () => {
  return function MockAppLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="app-layout">{children}</div>;
  };
});

describe('Tools Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('should render the tools page correctly', () => {
    renderWithRouter(<Tools />);

    expect(screen.getByText('Developer Tools')).toBeInTheDocument();
    expect(screen.getByText('Advanced tools for data management, development, and debugging.')).toBeInTheDocument();
    expect(screen.getByText('Dev Tools')).toBeInTheDocument();
    expect(screen.getByText('Data Management')).toBeInTheDocument();
  });

  it('should navigate back to dashboard when back button is clicked', () => {
    renderWithRouter(<Tools />);

    const backButton = screen.getByRole('button', { name: /back to dashboard/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should show dev tools tab by default', () => {
    renderWithRouter(<Tools />);

    expect(screen.getByTestId('dev-tools')).toBeInTheDocument();
    expect(screen.queryByTestId('data-management')).not.toBeInTheDocument();
  });

  it('should switch to data management tab when clicked', () => {
    renderWithRouter(<Tools />);

    const dataManagementTab = screen.getByRole('tab', { name: /data management/i });
    fireEvent.click(dataManagementTab);

    expect(screen.getByTestId('data-management')).toBeInTheDocument();
    expect(screen.queryByTestId('dev-tools')).not.toBeInTheDocument();
  });

  it('should switch back to dev tools tab', () => {
    renderWithRouter(<Tools />);

    // Switch to data management
    const dataManagementTab = screen.getByRole('tab', { name: /data management/i });
    fireEvent.click(dataManagementTab);

    // Switch back to dev tools
    const devToolsTab = screen.getByRole('tab', { name: /dev tools/i });
    fireEvent.click(devToolsTab);

    expect(screen.getByTestId('dev-tools')).toBeInTheDocument();
    expect(screen.queryByTestId('data-management')).not.toBeInTheDocument();
  });
});
