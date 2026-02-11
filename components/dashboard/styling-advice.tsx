"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StylingAdviceProps {
  advice: string;
  className?: string;
}

export function StylingAdvice({ advice, className }: StylingAdviceProps) {
  if (!advice) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Your Personalized Styling Advice</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-primary">{children}</strong>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 space-y-1 mb-3">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 space-y-1 mb-3">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              h1: ({ children }) => (
                <h1 className="text-xl font-bold mb-3 mt-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold mb-2 mt-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold mb-2 mt-2">{children}</h3>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 my-3 italic text-muted-foreground">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <table className="w-full border-collapse border border-gray-300 my-3">
                  {children}
                </table>
              ),
              th: ({ children }) => (
                <th className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-gray-300 px-3 py-2">{children}</td>
              ),
            }}
          >
            {advice}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}