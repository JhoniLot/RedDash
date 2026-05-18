import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-lg font-semibold text-white">{title}</h1>
      {description && (
        <p className="text-xs text-[--color-text-secondary] mt-0.5">{description}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
