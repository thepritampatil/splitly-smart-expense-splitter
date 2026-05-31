const MAX_WIDTH = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  full: 'max-w-full',
};

export default function PageContainer({
  children,
  maxWidth = '4xl',
  className = '',
  noPadding = false,
}) {
  return (
    <div
      className={[
        'mx-auto w-full',
        MAX_WIDTH[maxWidth] || MAX_WIDTH['4xl'],
        noPadding ? '' : 'px-4 py-5 sm:px-6 sm:py-7',
        className,
      ].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
