import React from 'react';
import { useLogin } from '../hooks/useLogin';
import styles from './LoginForm.module.css';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

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
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                />
                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formState.password}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
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