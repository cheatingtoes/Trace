import React from 'react';
import styles from './Input.module.css';

const Textarea = ({ label, error, ...props }) => {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea 
        className={`${styles.input} ${error ? styles.error : ''}`} 
        style={{ minHeight: '100px', resize: 'vertical' }} 
        {...props} 
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default Textarea;
