import React from 'react';
import { useRegister } from '../hooks/useRegister';
import styles from './RegisterForm.module.css';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

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
                <Input
                    label="Name"
                    name="name"
                    type="text"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                />
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
                    {isSubmitting ? 'Registering...' : 'Register'}
                </Button>
            </form>
        </div>
    );
};

export default RegisterForm;
