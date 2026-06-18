// Lightweight layout components to replace MUI Box, Container, Grid
import styles from './LightweightLayout.module.css';

export function LightweightBox({ children, className, ...props }) {
  return (
    <div className={`${styles.box} ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

export function LightweightContainer({ children, className, maxWidth = 'lg', ...props }) {
  const containerClass = maxWidth === 'lg' ? styles.containerLg : styles.container;
  return (
    <div className={`${containerClass} ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

export function LightweightGrid({ children, container, item, xs, sm, md, spacing, className, ...props }) {
  let gridClass = styles.grid;
  
  if (container) {
    gridClass += ` ${styles.gridContainer}`;
    if (spacing) {
      gridClass += ` ${styles[`spacing${spacing}`]}`;
    }
  }
  
  if (item) {
    gridClass += ` ${styles.gridItem}`;
    if (xs) gridClass += ` ${styles[`xs${xs}`]}`;
    if (sm) gridClass += ` ${styles[`sm${sm}`]}`;
    if (md) gridClass += ` ${styles[`md${md}`]}`;
  }
  
  return (
    <div className={`${gridClass} ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

export function LightweightTypography({ children, variant = 'body1', component, className, ...props }) {
  const Component = component || getDefaultComponent(variant);
  const typeClass = styles[variant] || styles.body1;
  
  return (
    <Component className={`${typeClass} ${className || ''}`} {...props}>
      {children}
    </Component>
  );
}

function getDefaultComponent(variant) {
  switch (variant) {
    case 'h1': return 'h1';
    case 'h2': return 'h2';
    case 'h3': return 'h3';
    case 'h4': return 'h4';
    case 'h5': return 'h5';
    case 'h6': return 'h6';
    case 'subtitle1': return 'h6';
    case 'subtitle2': return 'h6';
    case 'body1': return 'p';
    case 'body2': return 'p';
    case 'caption': return 'span';
    case 'overline': return 'span';
    default: return 'p';
  }
}
