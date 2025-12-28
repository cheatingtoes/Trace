import React, { useRef, useLayoutEffect } from 'react';
import styles from './Input.module.css';

const Textarea = ({ label, error, ...props }) => {
    const textareaRef = useRef(null)
    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    useLayoutEffect(() => {
        adjustHeight();

        if (!textareaRef.current) return;
        const observer = new ResizeObserver(() => {
            adjustHeight();
        });
        observer.observe(textareaRef.current);
        return () => observer.disconnect();
    }, [props.value]);

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea 
        ref={textareaRef}
        className={`${styles.input} ${error ? styles.error : ''}`} 
        rows={1}
        style={{ resize: 'none' }} 
        {...props}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default Textarea;
