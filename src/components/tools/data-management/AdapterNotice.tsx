
import React from 'react';

interface AdapterNoticeProps {
  isLocalStorageAdapter: boolean;
}

const AdapterNotice = ({ isLocalStorageAdapter }: AdapterNoticeProps) => {
  if (isLocalStorageAdapter) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
      <p className="text-sm text-blue-800">
        To use data management features, switch to the LocalStorage adapter in your application configuration.
      </p>
    </div>
  );
};

export default AdapterNotice;
