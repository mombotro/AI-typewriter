'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Icons} from '@/components/icons';
import {toast} from '@/hooks/use-toast';

interface CopyToClipboardProps {
  text: string;
}

export function CopyToClipboard({text}: CopyToClipboardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({
        title: 'Copied!',
        description: 'Text copied to clipboard.',
      });
      setTimeout(() => {
        setIsCopied(false);
      }, 2000); // Reset after 2 seconds
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: err.message,
      });
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={handleCopy} disabled={isCopied}>
      {isCopied ? <Icons.check className="h-4 w-4" /> : <Icons.copy className="h-4 w-4" />}
    </Button>
  );
}
