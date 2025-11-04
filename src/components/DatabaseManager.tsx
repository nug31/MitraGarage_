import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Download, 
  Upload,
  AlertTriangle,
  Server,
  Wifi,
  WifiOff
} from 'lucide-react';
import { testConnection, initializeTables, seedDatabase } from '../utils/mysqlDatabase';

interface DatabaseManagerProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

const DatabaseManager: React.FC<DatabaseManagerProps> = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    // Prevent multiple simultaneous checks
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const connected = await testConnection();
      setIsConnected(connected);
      setLastChecked(new Date());

      // Only call onConnectionChange if status actually changed
      if (connected !== isConnected) {
        onConnectionChange?.(connected);
      }

      if (!connected) {
        setError('Unable to connect to MySQL database');
      }
    } catch (err) {
      console.error('Database connection check failed:', err);
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Connection test failed');

      // Only call onConnectionChange if status actually changed
      if (isConnected !== false) {
        onConnectionChange?.(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeTables = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await initializeTables();
      alert('Database tables initialized successfully!');
      await checkConnection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize tables');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm('This will clear existing data and add sample data. Continue?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await seedDatabase();
      alert('Database seeded with sample data successfully!');
      await checkConnection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only check connection once on mount
    checkConnection();

    // Check connection every 60 seconds (reduced frequency)
    const interval = setInterval(checkConnection, 60000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array to prevent re-runs

  const getStatusColor = () => {
    if (isConnected === null) return 'text-gray-500';
    return isConnected ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-5 w-5 animate-spin" />;
    if (isConnected === null) return <Database className="h-5 w-5" />;
    return isConnected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking connection...';
    if (isConnected === null) return 'Not tested';
    return isConnected ? 'Connected to MySQL' : 'Disconnected';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">MySQL Database</h3>
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={checkConnection}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Refresh connection"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Connection Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center space-x-2 mb-1">
            <Server className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Host</span>
          </div>
          <p className="text-sm text-gray-600 font-mono">mainline.proxy.rlwy.net:56741</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center space-x-2 mb-1">
            <Database className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Database</span>
          </div>
          <p className="text-sm text-gray-600 font-mono">railway</p>
        </div>
      </div>

      {/* Last Checked */}
      {lastChecked && (
        <div className="text-xs text-gray-500 mb-4">
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleInitializeTables}
          disabled={!isConnected || isLoading}
          className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Database className="h-4 w-4 mr-2" />
          Initialize Tables
        </button>
        
        <button
          onClick={handleSeedDatabase}
          disabled={!isConnected || isLoading}
          className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Seed Sample Data
        </button>
      </div>

      {/* Connection Status Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Railway MySQL Connection</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              isConnected === null ? 'bg-gray-400' :
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span>{isConnected ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager;
