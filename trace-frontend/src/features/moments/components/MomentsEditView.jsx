import React, { useRef, useState } from 'react';
import styles from './MomentsEditView.module.css';

const MomentsEditView = ({ 
    moments = [], 
    onUpload, 
    onDelete,
    onNameChange,
    onMomentHover
}) => {
    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);

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
        setIsDragOver(false);
        if (files.length > 0 && onUpload) {
            onUpload(files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
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
                onDragLeave={handleDragLeave}
                style={isDragOver ? { backgroundColor: 'rgba(0, 123, 255, 0.1)', borderColor: '#007bff' } : {}}
                onClick={(e) => {
                    // If the click target or any of its ancestors is a button, do nothing.
                    // This prevents the zone's click handler from firing when a button is clicked.
                    if (e.target.closest('button') || e.target.tagName === 'INPUT') {
                        return;
                    }
                    fileInputRef.current?.click();
                }}
            >
                <div className={styles.uploadActions}>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={styles.uploadBtn}
                    >
                        [ + Upload Files ]
                    </button>
                    <button 
                        onClick={() => folderInputRef.current?.click()}
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
                    <li 
                        key={moment.id || index} 
                        className={styles.momentItem}
                        onMouseEnter={() => onMomentHover && onMomentHover(moment.id)}
                        onMouseLeave={() => onMomentHover && onMomentHover(null)}
                    >
                        <div className={styles.leftGroup}>
                            <span className={styles.index}>{index + 1}.</span>
                            <img src={`${import.meta.env.VITE_S3_PUBLIC_ENDPOINT}/${import.meta.env.VITE_S3_BUCKET_NAME}/${moment.storageWebKey}`} />
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