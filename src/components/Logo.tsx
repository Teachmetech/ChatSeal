interface LogoProps {
    size?: number;
    className?: string;
    color?: 'emerald' | 'white' | 'current';
}

export default function Logo({ size = 24, className = '', color = 'emerald' }: LogoProps) {
    const getColorFilter = (color: string) => {
        switch (color) {
            case 'emerald':
                return 'brightness(0) saturate(100%) invert(69%) sepia(57%) saturate(458%) hue-rotate(115deg) brightness(91%) contrast(86%)';
            case 'white':
                return 'brightness(0) saturate(100%) invert(100%)';
            case 'current':
                return 'none';
            default:
                return 'brightness(0) saturate(100%) invert(69%) sepia(57%) saturate(458%) hue-rotate(115deg) brightness(91%) contrast(86%)';
        }
    };

    return (
        <img
            src="/logo.svg"
            alt="ChatSeal Logo"
            className={`inline-block ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                filter: getColorFilter(color)
            }}
        />
    );
} 