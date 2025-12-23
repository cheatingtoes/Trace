import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../features/auth/components/RegisterForm';
import styles from './Register.module.css';

const Register = () => {
    return (
        <div className={styles.container}>
            <h1>Register</h1>
            <RegisterForm />
            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default Register;
