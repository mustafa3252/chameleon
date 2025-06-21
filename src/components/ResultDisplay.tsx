import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Code, FileCode, FileText, ListChecks, Milestone, StickyNote } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ResultDisplayProps {
  result: any;
}

const Section = ({ title, content, icon }: { title: string, content: string | string[], icon: React.ReactNode }) => {
  const formatText = (text: string) => {
    // Basic markdown for bolding like **this**
    const bolded = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-700">$1</strong>');
    return { __html: bolded };
  };

  return (
    <div className="mb-6 p-5 bg-white border border-gray-200 rounded-xl">
      <h3 className="flex items-center text-xl font-semibold text-gray-800 mb-3">
        {icon}
        <span className="ml-3">{title}</span>
      </h3>
      {Array.isArray(content) ? (
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          {content.map((item, i) => <li key={i} dangerouslySetInnerHTML={formatText(item)} />)}
        </ul>
      ) : (
        <p className="text-gray-600 whitespace-pre-wrap" dangerouslySetInnerHTML={formatText(content)} />
      )}
    </div>
  );
};

export const ResultDisplay = ({ result }: ResultDisplayProps) => {
  // Extract the text message from the result object
  const rawText = result?.outputs?.[0]?.outputs?.[0]?.results?.message?.data?.text || "No content found.";

  // Split the text into sections based on the '###' headers
  const sections = rawText.split('### ').slice(1);

  const parsedContent: { [key: string]: string | string[] } = {};
  const fileBlocks: { path: string, code: string }[] = [];

  sections.forEach(section => {
    const lines = section.split('\n');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();

    if (title.startsWith('FILE:')) {
      const path = title.replace('FILE:', '').trim();
      const code = content.replace(/```python\n|```/g, '').trim();
      fileBlocks.push({ path, code });
    } else if (title.startsWith('Folder Structure:')) {
      const structure = content.replace(/```\n|```/g, '').trim();
      parsedContent['Folder Structure'] = structure;
    } else {
      // For lists, split content into an array of strings
      const listItems = content.split('\n').map(item => item.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
      if (listItems.length > 1 && /^\d+\./.test(content.trim())) {
        parsedContent[title] = listItems;
      } else {
        parsedContent[title] = content;
      }
    }
  });

  return (
    <div className="bg-gray-50 p-6 rounded-2xl w-full">
      {Object.entries(parsedContent).map(([title, content]) => {
        let icon;
        if (title.includes("Features")) icon = <ListChecks className="w-6 h-6 text-blue-500" />;
        else if (title.includes("Assumptions")) icon = <Milestone className="w-6 h-6 text-yellow-500" />;
        else if (title.includes("Structure")) icon = <FileCode className="w-6 h-6 text-indigo-500" />;
        else icon = <StickyNote className="w-6 h-6 text-gray-500" />;
        
        return <Section key={title} title={title} content={content} icon={icon} />;
      })}
      
      {fileBlocks.length > 0 && (
         <div className="mb-4">
          <h3 className="flex items-center text-xl font-semibold text-gray-800 mb-4 p-5">
            <Code className="w-6 h-6 text-green-500" />
            <span className="ml-3">Generated Code Files</span>
          </h3>
          <Accordion type="single" collapsible className="w-full" defaultValue={fileBlocks[0]?.path}>
            {fileBlocks.map(({ path, code }) => (
              <AccordionItem value={path} key={path} className="border bg-white rounded-lg mb-2 transition-all hover:border-blue-300">
                <AccordionTrigger className="px-4 py-3 text-md font-medium text-gray-700 hover:no-underline">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-3 text-gray-500" />
                    {path}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                   <SyntaxHighlighter language="python" style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: "0.5rem" }}>
                    {code}
                  </SyntaxHighlighter>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}; 