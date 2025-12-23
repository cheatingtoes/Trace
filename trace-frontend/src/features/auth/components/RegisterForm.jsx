import React from 'react';
import { useRegister } from '../hooks/useRegister';
import styles from './RegisterForm.module.css';

const RegisterForm = () => {
    const {
        formState,
        error,
        isSubmitting,
        handleChange,
        handleRegister,
    } = useRegister();

    return (
        <div className={styles.formContainer}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <form onSubmit={handleRegister}>
                <div className={styles.formGroup}>
                    <label>Name</label>
                    <input name="name" type="text" value={formState.name} onChange={handleChange} required disabled={isSubmitting} />
                </div>
                <div className={styles.formGroup}>
                    <label>Email</label>
                    <input name="email" type="email" value={formState.email} onChange={handleChange} required disabled={isSubmitting} />
                </div>
                <div className={styles.formGroup}>
                    <label>Password</label>
                    <input name="password" type="password" value={formState.password} onChange={handleChange} required disabled={isSubmitting} />
                </div>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;
