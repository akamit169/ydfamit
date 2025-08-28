import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Database,
  Shield
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import authService from '../services/authService';

const DemoSetup = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [setupStatus, setSetupStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleCreateDemoUsers = async () => {
    setIsCreating(true);
    setSetupStatus('creating');
    setError('');
    setResults([]);

    try {
      console.log('Starting demo user creation...');
      await authService.createDemoUsers();
      setSetupStatus('success');
      console.log('Demo users created successfully');
    } catch (error) {
      console.error('Demo setup error:', error);
      setSetupStatus('error');
      setError(error instanceof Error ? error.message : 'Failed to create demo users');
    } finally {
      setIsCreating(false);
    }
  };

  const demoCredentials = authService.getDemoCredentials();

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Database className="h-5 w-5" />
          <span>Demo Environment Setup</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {setupStatus === 'idle' && (
          <div>
            <p className="text-sm text-blue-700 mb-4">
              Set up demo user accounts in Supabase Auth for testing all user roles.
            </p>
            <Button
              onClick={handleCreateDemoUsers}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Demo Users...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Create Demo Users</span>
                </div>
              )}
            </Button>
          </div>
        )}

        {setupStatus === 'creating' && (
          <Alert className="border-blue-200 bg-blue-50">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-700">
              Creating demo users in Supabase Auth... This may take a moment.
            </AlertDescription>
          </Alert>
        )}

        {setupStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              ✅ Demo users created successfully! You can now use the demo login credentials below.
            </AlertDescription>
          </Alert>
        )}

        {setupStatus === 'error' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              ❌ {error}
              <br />
              <span className="text-xs mt-1 block">
                Please try again or check your Supabase connection.
              </span>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(demoCredentials).map(([role, creds]) => (
              <div key={role} className="bg-white p-2 rounded border">
                <div className="font-medium text-gray-900 capitalize">{role}</div>
                <div className="text-gray-600">{creds.email}</div>
                <div className="text-gray-500">{creds.password}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Click "Create Demo Users" first, then use these credentials to login.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-blue-600">
          <Shield className="h-3 w-3" />
          <span>Demo users are created with proper authentication and role permissions</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoSetup;