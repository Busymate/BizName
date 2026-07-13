import '../styles/Button.css';

/**
 * variant: 'primary' | 'secondary' | 'outline' | 'ghost'
 * size: 'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  as: Component = 'button',
  className = '',
  ...rest
}) {
  return (
    <Component className={`bn-btn bn-btn-${variant} bn-btn-${size} ${className}`} {...rest}>
      {icon && <i className={`fa-solid ${icon}`} />}
      {children}
    </Component>
  );
}
