import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../features/auth/components/LoginForm';
import AuthWrapper from '../features/auth/components/AuthWrapper';
import styles from './Login.module.css';

const Login = () => {
    return (
        <AuthWrapper>
            <div className={styles.loginPage}>
                <h2>Welcome Back</h2>
                <p className={styles.subtitle}>Sign in to continue to Trace</p>
                <LoginForm />
                <p className={styles.signupText}>
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>
            </div>
        </AuthWrapper>
    );
};

export default Login;