import ActivityForm from './ActivityForm';
import styles from './ActivityDetail.module.css'; // Reusing detail styles for consistency

const ActivityEditView = ({ activity, updateActivity }) => {
    return (
        <>
            <ActivityForm initialValues={activity} onSubmit={updateActivity} isOpen={true} />
        </>
    );
};

export default ActivityEditView;