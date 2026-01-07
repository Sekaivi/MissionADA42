export default function AnimatedBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-50 dark:opacity-100">
            <div className="absolute -top-1/2 -left-1/2 h-full w-full animate-pulse rounded-full bg-purple-500/10 blur-3xl"></div>
            <div
                className="absolute -right-1/2 -bottom-1/2 h-full w-full animate-pulse rounded-full bg-blue-500/10 blur-3xl"
                style={{ animationDelay: '1s' }}
            ></div>
        </div>
    );
}
