import React, { useRef } from 'react';
import styles from './MomentsEditView.module.css';

const MomentsEditView = ({ 
    moments = [], 
    onUpload, 
    onDelete, 
    onNameChange 
}) => {
    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0 && onUpload) {
            onUpload(files);
        }
        // Reset input
        e.target.value = null;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0 && onUpload) {
            onUpload(files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>MOMENTS</h3>
            </div>
            
            <div 
                className={styles.uploadZone}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className={styles.uploadActions}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} 
                        className={styles.uploadBtn}
                    >
                        [ + Upload Files ]
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }} 
                        className={styles.uploadBtn}
                    >
                        [ + Upload Folder ]
                    </button>
                </div>
                <span className={styles.uploadText}>or Drop Files Here</span>

                {/* Standard File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    multiple={true}
                    accept="image/*,video/*,audio/*"
                    style={{ display: 'none' }} 
                />
                
                {/* Folder Input (non-standard attributes handled via spread or direct props) */}
                <input 
                    type="file" 
                    ref={folderInputRef} 
                    onChange={handleFileChange} 
                    {...{ webkitdirectory: "", directory: "" }}
                    style={{ display: 'none' }} 
                />
            </div>

            <ul className={styles.momentList}>
                {moments.map((moment, index) => (
                    <li key={moment.id || index} className={styles.momentItem}>
                        <div className={styles.leftGroup}>
                            <span className={styles.index}>{index + 1}.</span>
                            <input 
                                type="text" 
                                value={moment.name || moment.filename || ''} 
                                onChange={(e) => onNameChange && onNameChange(moment.id, e.target.value)}
                                className={styles.momentNameInput}
                                placeholder="Untitled Moment"
                            />
                        </div>
                        <div className={styles.rightGroup}>
                            <button 
                                className={styles.iconButton} 
                                onClick={() => onDelete && onDelete(moment.id)}
                                title="Delete Moment"
                            >
                                [Trash]
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MomentsEditView;