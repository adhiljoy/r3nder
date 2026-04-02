/**
 * Skeleton component for smooth loading states
 */
interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
}

const Skeleton = ({ className = "", width, height }: SkeletonProps) => {
    return (
        <div 
            className={`skeleton ${className}`}
            style={{ 
                width: width, 
                height: height 
            }}
        />
    );
};

export default Skeleton;
