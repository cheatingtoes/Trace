import React from 'react';
import LoginForm from '../features/auth/components/LoginForm';
import styles from './Login.module.css';

const Login = () => {
    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <h2>Welcome Back</h2>
                <p className={styles.subtitle}>Sign in to continue to Trace</p>
                <LoginForm />
            </div>
        </div>
    );
};

export default Login;