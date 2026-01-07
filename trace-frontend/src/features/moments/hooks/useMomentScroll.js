import { useEffect, useRef } from 'react';

export const useMomentScroll = ({
    scrollToMomentId,
    onScrollComplete,
    onMomentCenter,
    containerRef,
    flashHighlightClassName
}) => {
    const scrollTimeoutRef = useRef(null);

    // Scroll to specific moment
    useEffect(() => {
        if (scrollToMomentId) {
            const element = document.getElementById(`moment-item-${scrollToMomentId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (flashHighlightClassName) {
                    element.classList.add(flashHighlightClassName);
                    setTimeout(() => {
                        element.classList.remove(flashHighlightClassName);
                        if (onScrollComplete) onScrollComplete();
                    }, 2000);
                } else if (onScrollComplete) {
                    onScrollComplete();
                }
            }
        }
    }, [scrollToMomentId, onScrollComplete, flashHighlightClassName]);

    // Scroll Sync Logic (Detect center item)
    useEffect(() => {
        const getScrollParent = (node) => {
            if (!node || node === document.body || node === document.documentElement) return null;
            
            const style = getComputedStyle(node);
            const overflowY = style.overflowY;
            const isScrollable = overflowY === 'auto' || overflowY === 'scroll';
            
            if (isScrollable && node.scrollHeight >= node.clientHeight) {
                return node;
            }
            return getScrollParent(node.parentNode);
        };

        const handleScroll = () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            scrollTimeoutRef.current = setTimeout(() => {
                if (!containerRef.current) return;
                
                const scrollParent = getScrollParent(containerRef.current);
                const parentRect = scrollParent 
                    ? scrollParent.getBoundingClientRect() 
                    : { top: 0, height: window.innerHeight };
                
                const centerY = parentRect.top + parentRect.height / 2;

                const momentElements = Array.from(containerRef.current.querySelectorAll('[id^="moment-item-"]'));
                
                const rows = [];
                const TOLERANCE = 5;
                let currentRow = null;

                momentElements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (!currentRow || Math.abs(currentRow.top - rect.top) >= TOLERANCE) {
                        currentRow = { top: rect.top, height: rect.height, items: [] };
                        rows.push(currentRow);
                    }
                    currentRow.items.push({ el, rect });
                });

                let closestElement = null;
                let closestDistance = Infinity;

                rows.forEach(row => {
                    row.items.sort((a, b) => a.rect.left - b.rect.left);
                    const count = row.items.length;
                    const sliceHeight = row.height / count;
                    
                    row.items.forEach((item, index) => {
                        const virtualCenterY = row.top + (index * sliceHeight) + (sliceHeight / 2);
                        const distance = Math.abs(centerY - virtualCenterY);

                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestElement = item.el;
                        }
                    });
                });

                if (closestElement) {
                    const momentId = closestElement.id.replace('moment-item-', '');
                    if (onMomentCenter) {
                        onMomentCenter(momentId);
                    }
                }
            }, 10);
        };

        const scrollParent = getScrollParent(containerRef.current);
        const target = scrollParent || window;
        
        target.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            target.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        };
    }, [onMomentCenter, containerRef]);
};

export default useMomentScroll;