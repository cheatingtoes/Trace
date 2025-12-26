import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import styles from './ActivityDetail.module.css';
import ActivityEditView from './ActivityEditView';
import TracksEditView from '../../tracks/components/TracksEditView';
import MomentsEditView from '../../moments/components/MomentsEditView';
import UploadProgress from '../../moments/components/UploadProgress';
import SidebarHeader from '../../../components/SidebarHeader';

import useActivity from '../hooks/useActivity';
import useTracks from '../../tracks/hooks/useTracks';
import useMoments from '../../moments/hooks/useMoments';
import useMomentPoller from '../../moments/hooks/useMomentPoller';

const ActivityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activity, loading: activityLoading, error: activityError, fetchActivity, updateActivity } = useActivity(id);
    const { tracks, loading: tracksLoading, error: tracksError, fetchTracks, uploadTrack, deleteTrack } = useTracks(id);
    const { moments, failedUploads, loading: momentsLoading, error: momentsError, fetchMoments, uploadMoments, deleteMoment, updateMoment, updateMomentsState } = useMoments(id);

    const isEditing = true;

    // Derive the list of IDs that need polling (status === 'processing')
    const processingIds = useMemo(() => 
        moments.filter(m => m.status === 'processing').map(m => m.id), 
    [moments]);

    // Poller will automatically pick up new IDs as they are added to the moments list
    useMomentPoller(processingIds, updateMomentsState);

    return (
        <div className={styles.detailContainer}>
            <SidebarHeader
                left={
                    <>
                        <button onClick={() => navigate(-1)} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem', marginRight: '0.5rem' }}>
                            ←
                        </button>
                    </>
                }
                right={<span style={{ cursor: 'pointer' }}>⚙️</span>}
            />
            {isEditing ? (
                <>
                    <div className={styles.header}>
                        <h2>EDIT ACTIVITY</h2>
                    </div>
                    <ActivityEditView activity={activity} updateActivity={updateActivity}/>
                    <TracksEditView tracks={tracks} loading={tracksLoading} error={tracksError} onUpload={uploadTrack} onDelete={deleteTrack} />
                    <UploadProgress moments={moments} />
                    <MomentsEditView 
                        moments={moments} 
                        loading={momentsLoading} 
                        error={momentsError} 
                        onUpload={uploadMoments} 
                        onDelete={deleteMoment} 
                        onNameChange={(id, name) => updateMoment(id, { name })}
                    />
                </>
            ) : (
                <>
                    <div className={styles.header}>
                        <h2>ACTIVITY DETAILS</h2>
                    </div>
                    <div className={styles.content}>
                        <p>Details for Activity ID: {id}</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default ActivityDetail;