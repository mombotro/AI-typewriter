'use client';

import {useState, useEffect} from 'react';
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
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from '@/components/ui/alert-dialog';
import {Input} from "@/components/ui/input";

export default function Home() {
  const [text, setText] = useState('');
  const [contextText, setContextText] = useState('');
  const [suggestions, setSuggestions] = useState<
    {suggestion: string; reasoning: string}[]
  >([]);
  const [targetedRevisionOpen, setTargetedRevisionOpen] = useState(false);
  const [globalEditOpen, setGlobalEditOpen] = useState(false);
  const [targetedRevisionInstructions, setTargetedRevisionInstructions] = useState('');
  const [globalEditInstructions, setGlobalEditInstructions] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showContextPanel, setShowContextPanel] = useState(true);
  const [savedContext, setSavedContext] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('apiKey', apiKey);
    } else {
      localStorage.removeItem('apiKey');
    }
  }, [apiKey]);

  const handleTextContinuation = async () => {
    if (!apiKey) {
      toast({
        variant: 'destructive',
        title: 'API Key Required',
        description: 'Please enter your API key.',
      });
      return;
    }

    try {
      const result = await textContinuation({existingText: text, savedContext: savedContext, apiKey: apiKey});
      setText(prevText =>  prevText + result.continuedText);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleContextualSuggestions = async () => {
      if (!apiKey) {
        toast({
          variant: 'destructive',
          title: 'API Key Required',
          description: 'Please enter your API key.',
        });
        return;
      }

    try {
      const result = await contextualSuggestions({
        request: 'Suggest character development and plot ideas',
        context: contextText,
        apiKey: apiKey
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
    setSavedContext(prevContext => prevContext + '\n' + suggestion);
    toast({
      title: 'Suggestion Saved',
      description: 'The suggestion has been saved to the context.',
    });
  };

  const handleOpenTargetedRevision = () => {
    if (text) {
      // Sets selected text
      const selection = window.getSelection();
      if (selection) {
        setSelectedText(selection.toString());
      }
      setTargetedRevisionOpen(true);
    } else {
      toast({
        title: 'No Text Selected',
        description: 'Please enter text in the editor.',
      });
    }
  };

  const handleTargetedRevisions = async () => {
     if (!apiKey) {
        toast({
          variant: 'destructive',
          title: 'API Key Required',
          description: 'Please enter your API key.',
        });
        return;
      }

    setTargetedRevisionOpen(false);
    try {
      const result = await targetedRevisions({
        selectedText: selectedText,
        fullDocument: text,
        revisionRequest: targetedRevisionInstructions || 'Rewrite',
        apiKey: apiKey
      });
      setText(prevText => {
         const start = text.indexOf(selectedText);
         if (start === -1) {
           return text;
         }
         return text.substring(0, start) + result.revisedText + text.substring(start + selectedText.length);
      });
      setSelectedText('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleGlobalEditHighlighting = () => {
    setGlobalEditOpen(true);
  };

  const handleGlobalEdit = async () => {
      if (!apiKey) {
        toast({
          variant: 'destructive',
          title: 'API Key Required',
          description: 'Please enter your API key.',
        });
        return;
      }

     setGlobalEditOpen(false);
    try {
      const result = await targetedRevisions({
        selectedText: text,
        fullDocument: text,
        revisionRequest: globalEditInstructions || 'Rewrite',
        apiKey: apiKey
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

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
      {showContextPanel && (
        <Sidebar className="w-80 border-r">
          <SidebarHeader>
            <h2 className="text-lg font-semibold">Context Panel</h2>
          </SidebarHeader>
          <SidebarContent>
            <Tabs defaultValue="suggestions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="saved">Saved Context</TabsTrigger>
              </TabsList>
              <TabsContent value="suggestions">
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
                  </CardContent>
                </Card>
              </TabsContent>
               <TabsContent value="saved">
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Context</CardTitle>
                    <CardDescription>
                      Saved context for the editor.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Saved context will appear here..."
                      value={savedContext}
                      onChange={e => setSavedContext(e.target.value)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </SidebarContent>
          <SidebarFooter>
            <p className="text-sm text-muted-foreground">
              Powered by Firebase Studio
            </p>
          </SidebarFooter>
        </Sidebar>
        )}
        <div className="flex-1 p-4">
         <Input
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mb-4"
            />
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">Text Editor</h1>
             <Button size="sm" onClick={() => setShowContextPanel(!showContextPanel)}>
               {showContextPanel ? 'Hide' : 'Show'} Context Panel
              </Button>
              <Button size="sm" onClick={() => setShowHelp(true)}>
                Help
              </Button>
            <div>
              <Button onClick={handleTextContinuation} className="mr-2">
                Text Continuation
              </Button>
              <Button onClick={handleOpenTargetedRevision} className="mr-2">
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
         <AlertDialog open={targetedRevisionOpen} onOpenChange={setTargetedRevisionOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Targeted Revision Instructions</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter specific instructions for revising the selected text.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Textarea
                    placeholder="Enter revision instructions here..."
                    value={targetedRevisionInstructions}
                    onChange={(e) => setTargetedRevisionInstructions(e.target.value)}
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setTargetedRevisionInstructions('')}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleTargetedRevisions}>Revise</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
           <AlertDialog open={globalEditOpen} onOpenChange={setGlobalEditOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Global Edit Instructions</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter instructions for global edits on the entire document.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Textarea
                    placeholder="Enter global edit instructions here..."
                    value={globalEditInstructions}
                    onChange={(e) => setGlobalEditInstructions(e.target.value)}
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setGlobalEditInstructions('')}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleGlobalEdit}>Apply Global Edit</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
           <AlertDialog open={showHelp} onOpenChange={setShowHelp}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Help</AlertDialogTitle>
                <AlertDialogDescription>
                  How to use Contextual Writer
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <p>
                    <b>Text Editor:</b> Start writing your story, article, or
                    other content here.
                  </p>
                  <p>
                    <b>Context Panel:</b> Use the Context Panel to generate
                    suggestions, save context, and more.
                  </p>
                  <p>
                    <b>Text Continuation:</b> Click this button to continue
                    writing in the style, tone, and direction of your existing
                    text.
                  </p>
                  <p>
                    <b>Targeted Revisions:</b> Highlight a section of text and
                    click this button to make targeted revisions.
                  </p>
                  <p>
                    <b>Global Edit Highlighting:</b> Click this button to make
                    global edits to the entire document.
                  </p>
                  <p>
                      <b>API Key:</b> Enter your API Key to use the application.
                  </p>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowHelp(false)}>
                  Close
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </div>
    </SidebarProvider>
  );
}
