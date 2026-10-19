import Markdown from 'react-markdown';

const ALLOWED_ELEMENTS = [
    'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
];

function MessageHeading({ children }) {
    return <p className="font-display font-semibold text-slate-950">{children}</p>;
}

const COMPONENTS = {
    h1: MessageHeading,
    h2: MessageHeading,
    h3: MessageHeading,
    h4: MessageHeading,
    h5: MessageHeading,
    h6: MessageHeading,
    a: ({ children, href }) => href ? (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-900 underline decoration-amber-400 underline-offset-2 hover:decoration-slate-900 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
        >
            {children}
        </a>
    ) : <span>{children}</span>,
};

export default function ChatbotMessage({ text }) {
    return (
        <div
            className="min-w-0 [overflow-wrap:anywhere] [&>*+*]:mt-3 [&_p]:whitespace-pre-line [&_strong]:font-semibold [&_strong]:text-slate-950 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:pl-1 [&_li]:whitespace-pre-line [&_li+li]:mt-1.5 [&_li>p+p]:mt-2 [&_li>ul]:mt-1.5 [&_li>ol]:mt-1.5 [&_li::marker]:font-medium [&_li::marker]:text-slate-500 [&_blockquote]:border-l-2 [&_blockquote]:border-amber-300 [&_blockquote]:pl-3 [&_blockquote]:text-slate-600 [&_code]:rounded [&_code]:bg-slate-50 [&_code]:px-1 [&_code]:text-[0.9em] [&_pre]:whitespace-pre-wrap [&_pre]:rounded-lg [&_pre]:bg-slate-50 [&_pre]:p-2.5 [&_pre_code]:p-0"
        >
            <Markdown allowedElements={ALLOWED_ELEMENTS} components={COMPONENTS} skipHtml unwrapDisallowed>
                {text.replace(/\r\n?/g, '\n').trim()}
            </Markdown>
        </div>
    );
}
