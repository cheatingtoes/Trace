import React, { useRef, useState, useEffect } from 'react';
import styles from './TracksEditView.module.css';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';

const TrackItem = ({ track, index, onColorChange, onNameChange, onDelete }) => {
    const [localName, setLocalName] = useState(track.name || '');
    const [localColor, setLocalColor] = useState(track.color || '#FF0000');

    useEffect(() => {
        setLocalName(track.name || '');
        setLocalColor(track.color || '#FF0000');
    }, [track.name, track.color]);

    const handleNameBlur = () => {
        if (localName !== (track.name || '')) {
            onNameChange(track.id, localName);
        }
    };

    const handleColorBlur = () => {
        if (localColor !== (track.color || '#FF0000')) {
            onColorChange(track.id, localColor);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    return (
        <li className={styles.trackItem}>
            <div className={styles.leftGroup}>
                <span className={styles.index}>{index + 1}.</span>
                <Input 
                    type="color" 
                    value={localColor} 
                    onChange={(e) => setLocalColor(e.target.value)}
                    onBlur={handleColorBlur}
                    className={styles.colorInput}
                    title="Track Color"
                />
                <div className={styles.nameInput}>
                    <Textarea 
                        value={localName} 
                        onChange={(e) => setLocalName(e.target.value)}
                        onBlur={handleNameBlur}
                        onKeyDown={handleKeyDown}
                        placeholder="Track Name"
                    />
                </div>
            </div>
            <div className={styles.rightGroup}>
                <button 
                    className={styles.iconButton} 
                    onClick={() => onDelete && onDelete(track.id)}
                    title="Delete Track"
                >
                    🗑️
                </button>
            </div>
        </li>
    );
};

const TracksEditView = ({ 
    tracks = [], 
    onUpload, 
    onDelete, 
    onColorChange,
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
                <Input 
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
                    <TrackItem 
                        key={track.id || index} 
                        track={track} 
                        index={index} 
                        onColorChange={onColorChange} 
                        onNameChange={onNameChange} 
                        onDelete={onDelete} 
                    />
                ))}
            </ul>
        </div>
    );
};

export default TracksEditView;