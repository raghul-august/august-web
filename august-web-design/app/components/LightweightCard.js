// Lightweight card component to replace MUI Card
import styles from './LightweightCard.module.css';

export default function LightweightCard({ children, className, onClick, ...props }) {
  return (
    <div 
      className={`${styles.card} ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function LightweightCardContent({ children, className, ...props }) {
  return (
    <div 
      className={`${styles.cardContent} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}
