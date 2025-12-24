import { useParams, useNavigate } from 'react-router-dom';
import styles from './ActivityDetail.module.css';
import SidebarHeader from '../../../components/SidebarHeader';

const ActivityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

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
            <div className={styles.header}>
                <h2>ACTIVITY DETAILS</h2>
            </div>
            <div className={styles.content}>
                <p>Details for Activity ID: {id}</p>
            </div>
        </div>
    );
};

export default ActivityDetail;