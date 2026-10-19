export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `motion-action inline-flex items-center rounded-md border border-transparent bg-danger px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-950 transition duration-150 ease-in-out hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-700 active:text-white ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
