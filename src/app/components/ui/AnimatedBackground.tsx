export default function AnimatedBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-50 dark:opacity-100">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div
                className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: '1s' }}
            ></div>
        </div>
    );
}