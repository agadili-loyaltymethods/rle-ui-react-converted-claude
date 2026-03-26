import React from 'react';
import { useParams } from 'react-router-dom';

export function MemberTabPlaceholder() {
  const { tab } = useParams<{ tab: string }>();
  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
      <p className="text-gray-500 text-sm">
        {tab ? `${tab.charAt(0).toUpperCase() + tab.slice(1)} tab content` : 'Select a tab to view member details'}
      </p>
    </div>
  );
}
