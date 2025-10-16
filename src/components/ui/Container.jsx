import React from 'react';

export default function Container({ 
  children, 
  className = '', 
  size = 'default',
  padding = 'default',
  center = true,
  fluid = false
}) {
  // Size variants
  const sizeClasses = {
    xs: 'max-w-xs',      // 320px
    sm: 'max-w-sm',      // 384px
    md: 'max-w-md',      // 448px
    lg: 'max-w-lg',      // 512px
    xl: 'max-w-xl',      // 576px
    '2xl': 'max-w-2xl',  // 672px
    '3xl': 'max-w-3xl',  // 768px
    '4xl': 'max-w-4xl',  // 896px
    '5xl': 'max-w-5xl',  // 1024px
    '6xl': 'max-w-6xl',  // 1152px
    '7xl': 'max-w-7xl',  // 1280px
    default: 'max-w-7xl',
    full: 'max-w-full'
  };

  // Padding variants
  const paddingClasses = {
    none: '',
    sm: 'px-2 sm:px-4',
    default: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12',
    xl: 'px-8 sm:px-12 lg:px-16'
  };

  // Build classes
  const containerClasses = [
    // Width and centering
    fluid ? 'w-full' : 'w-full',
    !fluid && sizeClasses[size],
    center && 'mx-auto',
    
    // Padding
    paddingClasses[padding],
    
    // Custom className
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

// Convenience components for common use cases
export function ContainerSmall({ children, className = '' }) {
  return (
    <Container size="md" className={className}>
      {children}
    </Container>
  );
}

export function ContainerMedium({ children, className = '' }) {
  return (
    <Container size="4xl" className={className}>
      {children}
    </Container>
  );
}

export function ContainerLarge({ children, className = '' }) {
  return (
    <Container size="6xl" className={className}>
      {children}
    </Container>
  );
}

export function ContainerFluid({ children, className = '' }) {
  return (
    <Container fluid center={false} className={className}>
      {children}
    </Container>
  );
}

export function ContainerNarrow({ children, className = '' }) {
  return (
    <Container size="2xl" padding="lg" className={className}>
      {children}
    </Container>
  );
}


