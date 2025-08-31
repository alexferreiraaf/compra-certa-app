'use client';

import { useState } from 'react';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getAIShoppingSuggestions } from '@/ai/flows/ai-shopping-suggestions';
import { Wand2, Loader2, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

interface AISuggestionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISuggestions({ open, onOpenChange }: AISuggestionsProps) {
  const { shoppingList, budget, remainingBudget } = useApp();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const handleFetchSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const formattedItems = shoppingList.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        type: item.type
      }));

      const result = await getAIShoppingSuggestions({
        items: formattedItems,
        budget,
        remainingBudget,
      });

      setSuggestions(result.suggestions);

    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na IA',
        description: 'Não foi possível obter sugestões no momento.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline"><Wand2/> Sugestões da IA</DialogTitle>
          <DialogDescription>
            Com base na sua lista e orçamento, aqui estão algumas sugestões para você.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            ) : suggestions.length > 0 ? (
                <ul className="space-y-2 list-disc list-inside">
                    {suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 mt-1 text-accent flex-shrink-0" /> 
                          <span>{suggestion}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                 <div className="text-center text-muted-foreground py-5">
                    <p>Clique em "Gerar Sugestões" para começar.</p>
                </div>
            )}
        </div>
        <DialogFooter>
          <Button onClick={handleFetchSuggestions} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Gerar Sugestões
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
