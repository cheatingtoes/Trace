import styles from './SidebarHeader.module.css';

const SidebarHeader = ({ left, right }) => {
    return (
        <div className={styles.header}>
            <div className={styles.left}>
                {left}
            </div>
            <div className={styles.right}>
                {right}
            </div>
        </div>
    );
};

export default SidebarHeader;