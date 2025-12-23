import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../features/auth/components/RegisterForm';
import AuthWrapper from '../features/auth/components/AuthWrapper';
import styles from './Register.module.css';

const Register = () => {
    return (
        <AuthWrapper>
            <div className={styles.registerPage}>
                <h1>Create an Account</h1>
                <RegisterForm />
                <p className={styles.loginText}>
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </AuthWrapper>
    );
};

export default Register;
