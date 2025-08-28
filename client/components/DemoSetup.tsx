import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, Users, Loader2 } from 'lucide-react';
import authService from '../services/authService';

export default function DemoSetup() {
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleCreateDemoUsers = async () => {
    setIsCreating(true);
    setStatus('idle');
    setMessage('');

    try {
      const result = await authService.createDemoUsers();
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Demo users created successfully!');
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to create demo users');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Demo Environment Setup
        </CardTitle>
        <CardDescription className="text-xs text-blue-600">
          Create demo user accounts to test the application with different roles
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {status === 'success' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 text-xs">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 text-xs">
              {message}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleCreateDemoUsers}
          disabled={isCreating}
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Demo Users...
            </>
          ) : (
            <>
              <Users className="h-4 w-4 mr-2" />
              Create Demo Users
            </>
          )}
        </Button>

        <div className="text-xs text-blue-600 space-y-1">
          <p><strong>This will create:</strong></p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>student@demo.com (password: student123)</li>
            <li>admin@demo.com (password: admin123)</li>
            <li>reviewer@demo.com (password: reviewer123)</li>
            <li>donor@demo.com (password: donor123)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}