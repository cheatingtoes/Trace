import { useState, useEffect } from 'react';
import styles from './ActivityForm.module.css';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Textarea from '../../../components/ui/Textarea';

const ActivityForm = ({ onSubmit, onSuccess, isOpen, onClose, initialValues = {}, buttonText = 'Create Activity' }) => {
    const {
        name: rawName,
        description: rawDescription,
        startDate: rawStartDate,
        endDate: rawEndDate
    } = initialValues || {};

    const initialName = rawName ?? '';
    const initialDescription = rawDescription ?? '';
    const initialStartDate = rawStartDate ?? '';
    const initialEndDate = rawEndDate ?? '';

    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);


    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setDescription(initialDescription);
            setStartDate(initialStartDate);
            setEndDate(initialEndDate);
        }
    }, [isOpen, initialName, initialDescription, initialStartDate, initialEndDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) {
            alert('Name is required');
            return;
        }
        const newActivity = {
            name,
            description,
            startDate,
            endDate,
        };
        const success = await onSubmit(newActivity);
        if (success) {
            setName('');
            setDescription('');
            setStartDate('');
            setEndDate('');
            onClose();
            if (onSuccess) onSuccess();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <Textarea
                    label="Activity Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <Textarea
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <Input
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <div className={styles.buttonGroup}>
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{buttonText}</Button>
                </div>
            </form>
        </div>
    );
};

export default ActivityForm;
