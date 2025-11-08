import React from 'react';
import ExamCard from './ExamCard';
import EmptyState from './EmptyState';
import LoadingPlaceholder from './LoadingPlaceholder';

export default function ExamGrid({
  exams = [],
  loading = false,
  onStart,
  onContinue,
  actionState,
  emptyTitle,
  emptyMessage
}) {
  if (loading) {
    return <LoadingPlaceholder />;
  }

  if (!exams.length) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => (
        <ExamCard
          key={exam.id}
          exam={exam}
          onStart={onStart}
          onContinue={onContinue}
          actionState={actionState}
          disabled={exam.disabled}
        />
      ))}
    </div>
  );
}

