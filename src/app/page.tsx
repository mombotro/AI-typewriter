'use client';

import {useState} from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {contextualSuggestions} from '@/ai/flows/contextual-suggestions';
import {toast} from '@/hooks/use-toast';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {textContinuation} from '@/ai/flows/text-continuation';
import {targetedRevisions} from '@/ai/flows/targeted-revisions';
import {Icons} from '@/components/icons';
import {CopyToClipboard} from '@/components/copy-to-clipboard';

export default function Home() {
  const [text, setText] = useState('');
  const [contextText, setContextText] = useState('');
  const [suggestions, setSuggestions] = useState<
    {suggestion: string; reasoning: string}[]
  >([]);

  const handleTextContinuation = async () => {
    try {
      const result = await textContinuation({existingText: text});
      setText(result.continuedText);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleContextualSuggestions = async () => {
    try {
      const result = await contextualSuggestions({
        request: 'Suggest character development and plot ideas',
        context: contextText,
      });
      setSuggestions(result.suggestions);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleSaveSuggestion = (suggestion: string) => {
    setContextText(prevContext => prevContext + '\n' + suggestion);
    toast({
      title: 'Suggestion Saved',
      description: 'The suggestion has been saved to the context.',
    });
  };

  const handleTargetedRevisions = async () => {
    try {
      const result = await targetedRevisions({
        selectedText: text,
        fullDocument: text,
        revisionRequest: 'Rewrite',
      });
      setText(result.revisedText);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleGlobalEditHighlighting = () => {
    toast({
      title: 'Global Edit Highlighting',
      description: 'Feature coming soon!',
    });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="w-80 border-r">
          <SidebarHeader>
            <h2 className="text-lg font-semibold">Context Panel</h2>
          </SidebarHeader>
          <SidebarContent>
            <Tabs defaultValue="context" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="context">Context</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              </TabsList>
              <TabsContent value="context">
                <Card>
                  <CardHeader>
                    <CardTitle>Context</CardTitle>
                    <CardDescription>
                      Provide context for the AI to generate better suggestions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter context here..."
                      value={contextText}
                      onChange={e => setContextText(e.target.value)}
                    />
                    <Button onClick={handleContextualSuggestions} className="mt-2">
                      Generate Suggestions
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="suggestions">
                {suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="mb-4">
                          <p className="font-semibold">{suggestion.suggestion}</p>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.reasoning}
                          </p>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSaveSuggestion(suggestion.suggestion)}
                          >
                            Save to Context
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </SidebarContent>
          <SidebarFooter>
            <p className="text-sm text-muted-foreground">
              Powered by Firebase Studio
            </p>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">Text Editor</h1>
            <div>
              <Button onClick={handleTextContinuation} className="mr-2">
                Text Continuation
              </Button>
              <Button onClick={handleTargetedRevisions} className="mr-2">
                Targeted Revisions
              </Button>
              <Button onClick={handleGlobalEditHighlighting}>
                Global Edit Highlighting
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="Start writing here..."
            value={text}
            onChange={e => setText(e.target.value)}
            className="min-h-[calc(100vh-10rem)]"
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
