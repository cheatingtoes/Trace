import React from 'react';
import styles from './TracksEditView.module.css';

const TrackItemRead = ({ track, index }) => {
    return (
        <li className={styles.trackItem} style={{ cursor: 'default' }}>
            <div className={styles.leftGroup}>
                <span className={styles.index}>{index + 1}.</span>
                <div 
                    className={styles.colorInput} 
                    style={{ backgroundColor: track.color || '#FF0000', cursor: 'default', border: 'none' }}
                />
                <div className={styles.nameInput}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                        {track.name || 'Untitled Track'}
                    </span>
                </div>
            </div>
        </li>
    );
};

const TracksReadView = ({ tracks = [] }) => {
    if (!tracks || tracks.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>TRACKS</h3>
            </div>
            
            <ul className={styles.trackList}>
                {tracks.map((track, index) => (
                    <TrackItemRead 
                        key={track.id || index} 
                        track={track} 
                        index={index} 
                    />
                ))}
            </ul>
        </div>
    );
};

export default TracksReadView;