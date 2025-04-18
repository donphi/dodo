import React from 'react';
import Dashboard from '../components/dashboard/single_page';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
