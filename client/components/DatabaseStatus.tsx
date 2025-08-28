import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { isSupabaseConfigured } from '../lib/supabase';

export const DatabaseStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'not-configured' | 'error'>('checking');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConnection = () => {
      try {
        if (isSupabaseConfigured) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('not-configured');
        }
      } catch (error) {
        console.error('Connection check error:', error);
        setConnectionStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  if (isLoading) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          Checking database connection...
        </AlertDescription>
      </Alert>
    );
  }

  if (connectionStatus === 'connected') {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          ✅ Supabase connected successfully! Authentication is ready.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-700">
        <div className="space-y-3">
          <p className="font-medium">⚡ Supabase not connected</p>
          <p className="text-sm">
            To enable Supabase integration, you need to:
          </p>
          <ol className="text-sm space-y-1 ml-4 list-decimal">
            <li>Click "Connect to Supabase" button in the top right</li>
            <li>Set up your Supabase project and get credentials</li>
            <li>Configure environment variables</li>
            <li>Run database migrations</li>
          </ol>
          <div className="flex items-center space-x-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://supabase.com/docs/guides/getting-started', '_blank')}
              className="text-orange-700 border-orange-300 hover:bg-orange-100"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Supabase Setup Guide
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DatabaseStatus;