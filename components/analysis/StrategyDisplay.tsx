import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface StrategyDisplayProps {
  content: string;
}

export function StrategyDisplay({ content }: StrategyDisplayProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
