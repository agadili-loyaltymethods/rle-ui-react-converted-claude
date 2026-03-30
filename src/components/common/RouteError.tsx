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
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="max-w-md w-full text-center px-6">
        <div className="flex justify-center mb-5">
          <div className="rounded-2xl bg-red-50 border border-red-100 p-4">
            <AlertTriangle className="h-9 w-9 text-red-500" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-slate-900 mb-2 tracking-tight">{status}</h1>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">{message}</p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} className="mr-1.5" /> Go Back
          </Button>
          <Button size="sm" onClick={() => navigate('/')}>
            <Home size={15} className="mr-1.5" /> Home
          </Button>
        </div>
      </div>
    </div>
  );
}
