import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

export function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  let status = 500;
  let title = 'Unexpected Error';
  let message = 'Something went wrong. Please try again.';

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (status === 404) {
      title = 'Page Not Found';
      message = `The page "${window.location.pathname}" does not exist.`;
    } else if (status === 403) {
      title = 'Access Denied';
      message = 'You do not have permission to view this page.';
    } else {
      message = error.statusText || message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center px-6">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{status}</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">{title}</h2>
        <p className="text-gray-500 mb-8">{message}</p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" /> Go Back
          </Button>
          <Button onClick={() => navigate('/')}>
            <Home size={16} className="mr-2" /> Home
          </Button>
        </div>
      </div>
    </div>
  );
}
