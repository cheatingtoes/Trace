import React from 'react';
import { useLogin } from '../hooks/useLogin';
import styles from './LoginForm.module.css'; // Create this file

const LoginForm = () => {
    const {
        formState,
        error,
        isSubmitting,
        handleChange,
        handleLocalLogin,
        handleGoogleLogin,
    } = useLogin();

    return (
        <div className={styles.formContainer}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <form onSubmit={handleLocalLogin}>
                <div className={styles.formGroup}>
                    <label>Email</label>
                    <input name="email" type="email" value={formState.email} onChange={handleChange} required disabled={isSubmitting} />
                </div>
                <div className={styles.formGroup}>
                    <label>Password</label>
                    <input name="password" type="password" value={formState.password} onChange={handleChange} required disabled={isSubmitting} />
                </div>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
            <div className={styles.divider}><span>OR</span></div>
            <button onClick={handleGoogleLogin} className={styles.btnGoogle} disabled={isSubmitting}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" />
                Sign in with Google
            </button>
        </div>
    );
};

export default LoginForm;