import React from 'react';
import SubmissionCard from './SubmissionCard';
import EmptyState from './EmptyState';
import LoadingPlaceholder from './LoadingPlaceholder';

export default function SubmissionList({ items = [], loading = false, onView }) {
  if (loading) {
    return <LoadingPlaceholder count={4} className="md:grid-cols-2" />;
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Chưa có bài nộp"
        message="Bạn chưa hoàn thành kỳ thi nào. Hãy bắt đầu một bài thi để thấy kết quả ở đây."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((submission) => (
        <SubmissionCard 
          key={submission.id} 
          submission={submission} 
          onView={(id) => onView?.(id, submission)} 
        />
      ))}
    </div>
  );
}

