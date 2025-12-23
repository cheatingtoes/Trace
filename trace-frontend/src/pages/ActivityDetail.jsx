import React from 'react';
import { useParams } from 'react-router-dom';

const ActivityDetail = () => {
    const { id } = useParams();

    return (
        <div>
            <h1>Activity Detail</h1>
            <p>Activity ID: {id}</p>
        </div>
    );
};

export default ActivityDetail;
