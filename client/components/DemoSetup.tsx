import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, Users, Loader2 } from 'lucide-react';
import authService from '../services/authService';

export default function DemoSetup() {
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleCreateDemoUsers = async () => {
    setIsCreating(true);
    setStatus({ type: null, message: '' });

    try {
      const result = await authService.createDemoUsers();
      
      if (result.success) {
        setStatus({
          type: 'success',
          message: result.message || 'Demo users created successfully!'
        });
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Failed to create demo users'
        });
      }
    } catch (error) {
      console.error('Demo setup error:', error);
      setStatus({
        type: 'error',
        message: 'An unexpected error occurred while creating demo users'
      });
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
        {status.type && (
          <Alert className={status.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {status.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={status.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {status.message}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleCreateDemoUsers}
          disabled={isCreating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
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
          <p><strong>This will create 4 demo accounts:</strong></p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>• Student: student@demo.com</div>
            <div>• Admin: admin@demo.com</div>
            <div>• Reviewer: reviewer@demo.com</div>
            <div>• Donor: donor@demo.com</div>
          </div>
          <p className="text-blue-500 mt-2">Password for all: [role]123 (e.g., student123)</p>
        </div>
      </CardContent>
    </Card>
  );
}