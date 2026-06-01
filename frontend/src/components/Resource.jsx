export default function Resource({ title, link, type }) {
    return (
        <div className="flex items-center justify-between border-b border-gray-600 pb-3 last:border-0 last:pb-0">
            <div>
                <p className="text-white text-sm font-medium">{title}</p>
                <p className="text-gray-400 text-xs">{type && `Type: ${type}`}</p>
            </div>
            <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium shrink-0 ml-4"
            >
                Open ↗
            </a>
        </div>
    );
}
