import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useMap } from '../context/MapProvider';
import styles from './Sidebar.module.css';

const Sidebar = ({ defaultWidth, side = 'left' }) => {
  const [width, setWidth] = useState(defaultWidth);
  const sidebarRef = useRef(null);
  const isResizing = useRef(false);
  const { setMapPadding } = useMap();

  const updateMapPadding = useCallback(() => {
    const widthPx = (window.innerWidth * width) / 100;
    setMapPadding(prev => ({
        ...prev,
        [side]: widthPx
    }));
  }, [width, side, setMapPadding]);

  useEffect(() => {
    updateMapPadding();
    window.addEventListener('resize', updateMapPadding);
    return () => window.removeEventListener('resize', updateMapPadding);
  }, [updateMapPadding]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e) => {
    if (isResizing.current && sidebarRef.current) {
      let newWidth;
      if (side === 'left') {
        newWidth = (e.clientX / window.innerWidth) * 100;
      } else {
        newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
      }
      // Add constraints for min/max width if desired
      if (newWidth > 15 && newWidth < 80) {
        setWidth(newWidth);
      }
    }
  }, [side]);

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    // Cleanup event listeners when component unmounts
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove]);

  return (
    <div
      ref={sidebarRef}
      className={`${styles.sidebar} ${side === 'right' ? styles.right : ''}`}
      style={{ width: `${width}%` }}
    >
      <div
        className={`${styles.resizer} ${side === 'right' ? styles.resizerRight : ''}`}
        onMouseDown={handleMouseDown}
      />
      <div className={styles.content}>
        <Outlet />
      </div>
      <div id="sidebar-floating-root" className={styles.floatingRoot} />
    </div>
  );
};

export default Sidebar;