import React, { useState, useEffect } from 'react';
import styles from './ActivityDetailEdit.module.css';
import Textarea from '../../../components/ui/Textarea';
import Input from '../../../components/ui/Input';

const ActivityEditView = ({ activity, updateActivity }) => {
    const [localName, setLocalName] = useState(activity?.name || '');
    const [localDescription, setLocalDescription] = useState(activity?.description || '');
    const [localStartDate, setLocalStartDate] = useState(activity?.startDate ? activity?.startDate.split('T')[0] : '');
    const [localEndDate, setLocalEndDate] = useState(activity?.endDate ? activity?.endDate.split('T')[0] : '');

    useEffect(() => {
        setLocalName(activity?.name || '');
        setLocalDescription(activity?.description || '');
        setLocalStartDate(activity?.startDate ? activity?.startDate.split('T')[0] : '');
        setLocalEndDate(activity?.endDate ? activity?.endDate.split('T')[0] : '');
    }, [activity]);

    const handleBlur = (field, value) => {
        if (value !== (activity?.[field] || '')) {
            if (field === 'name' && value !== '') {
                updateActivity({ [field]: value });
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent newline in title
            e.target.blur();
        }
    };

    return (
        <div className={styles.editViewContainer}>
            <Textarea
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={() => handleBlur('name', localName)}
                onKeyDown={handleKeyDown}
                className={styles.titleInput}
                placeholder="Activity Name"
                error={!localName && 'Title is required'}
            />
            <Textarea
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                onBlur={() => handleBlur('description', localDescription)}
                className={styles.descriptionInput}
                placeholder="Add description..."
            />
            <div className={styles.dateGroup}>
                <Input
                    label="Start Date"
                    type="date"
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                    onBlur={() => handleBlur('startDate', localStartDate)}
                />
                <Input
                    label="End Date"
                    type="date"
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    onBlur={() => handleBlur('endDate', localEndDate)}
                />
            </div>
        </div>
    );
};

export default ActivityEditView;