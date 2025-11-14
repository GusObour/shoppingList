import React from 'react';
import './Skeleton.css';

export const Skeleton = ({ width, height, borderRadius, className }) => {
  return (
    <div
      className={`skeleton ${className || ''}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius: borderRadius || '4px',
      }}
    />
  );
};

export const SkeletonListCard = () => {
  return (
    <div className="skeleton-list-card">
      <Skeleton width="120px" height="24px" />
      <Skeleton width="80px" height="16px" style={{ marginTop: '8px' }} />
      <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
        <Skeleton width="60px" height="16px" />
        <Skeleton width="80px" height="16px" />
      </div>
    </div>
  );
};

export const SkeletonItemRow = () => {
  return (
    <div className="skeleton-item-row">
      <Skeleton width="22px" height="22px" borderRadius="50%" />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height="18px" />
        <Skeleton width="40%" height="14px" style={{ marginTop: '6px' }} />
      </div>
      <Skeleton width="24px" height="24px" />
      <Skeleton width="24px" height="24px" />
    </div>
  );
};
