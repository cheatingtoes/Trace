import React, { useRef } from 'react';
import styles from './TracksEditView.module.css';

const TracksEditView = ({ 
    tracks = [], 
    onUpload, 
    onDelete, 
    onColorChange,
    onVisibilityChange,
    onNameChange
}) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && onUpload) {
            onUpload(file);
        }
        // Reset input so the same file can be selected again if needed
        e.target.value = null;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file && onUpload) {
            onUpload(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>TRACKS</h3>
            </div>
            
            <div 
                className={styles.uploadZone}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".gpx" 
                    style={{ display: 'none' }} 
                />
                <span className={styles.plusIcon}>[ + ]</span>
                <span className={styles.uploadText}>Upload New Track / Drop File Here</span>
            </div>

            <ul className={styles.trackList}>
                {tracks.map((track, index) => (
                    <li key={track.id || index} className={styles.trackItem}>
                        <div className={styles.leftGroup}>
                            <span className={styles.index}>{index + 1}.</span>
                            <input 
                                type="checkbox" 
                                checked={track.isVisible ?? true} 
                                onChange={(e) => onVisibilityChange && onVisibilityChange(track.id, e.target.checked)}
                                className={styles.checkbox}
                            />
                            <input 
                                type="text" 
                                value={track.name || ''} 
                                onChange={(e) => onNameChange && onNameChange(track.id, e.target.value)}
                                className={styles.trackNameInput}
                            />
                        </div>
                        <div className={styles.rightGroup}>
                            <button 
                                className={styles.iconButton} 
                                onClick={() => onDelete && onDelete(track.id)}
                                title="Delete Track"
                            >
                                [Trash]
                            </button>
                            <input 
                                type="color" 
                                value={track.color || '#FF0000'} 
                                onChange={(e) => onColorChange && onColorChange(track.id, e.target.value)}
                                className={styles.colorInput}
                                title="Track Color"
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TracksEditView;