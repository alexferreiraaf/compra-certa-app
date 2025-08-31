'use client';

import { useState } from 'react';
import { useApp } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, FileText, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { Purchase, ShoppingItem } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from '@/components/ui/separator';

function PriceComparison({ currentItem, previousPurchase }: { currentItem: ShoppingItem, previousPurchase: Purchase | undefined }) {
  const previousItem = previousPurchase?.items.find(item => item.name === currentItem.name);
  if (!previousItem || previousItem.price === currentItem.price) {
    return <span className="text-muted-foreground flex items-center gap-1 text-xs"><Minus className="h-3 w-3" />Sem alteração</span>;
  }

  const diff = currentItem.price - previousItem.price;
  const percentageDiff = (diff / previousItem.price) * 100;
  
  if (diff > 0) {
    return <span className="text-red-500 flex items-center gap-1 text-xs"><ArrowUp className="h-3 w-3" /> R$ {diff.toFixed(2)} ({percentageDiff.toFixed(0)}%)</span>;
  } else {
    return <span className="text-green-500 flex items-center gap-1 text-xs"><ArrowDown className="h-3 w-3" /> R$ {Math.abs(diff).toFixed(2)} ({percentageDiff.toFixed(0)}%)</span>;
  }
}

export default function HistoryPage() {
  const { purchaseHistory } = useApp();
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const sortedHistory = [...purchaseHistory].sort((a, b) => b.date - a.date);
  
  const getPreviousPurchase = (currentIndex: number): Purchase | undefined => {
    return sortedHistory[currentIndex + 1];
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-3xl">
            <History className="h-8 w-8" /> Histórico de Compras
          </CardTitle>
          <CardDescription>Veja suas compras passadas e compare os preços.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[65vh]">
            {sortedHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                <p>Nenhuma compra foi salva ainda.</p>
              </div>
            ) : (
              <div className="space-y-4 pr-4">
                {sortedHistory.map((purchase, index) => (
                  <Card key={purchase.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">{new Date(purchase.date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">Total: R$ {purchase.totalSpent.toFixed(2)}</p>
                      </div>
                      <Button variant="outline" onClick={() => setSelectedPurchase(purchase)}>
                        <FileText className="mr-2 h-4 w-4" /> Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      
      {selectedPurchase && (
         <Dialog open={!!selectedPurchase} onOpenChange={(isOpen) => !isOpen && setSelectedPurchase(null)}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Detalhes da Compra</DialogTitle>
                    <DialogDescription>
                        Compra de {new Date(selectedPurchase.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </DialogDescription>
                </DialogHeader>
                <div className="my-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-2 rounded-lg bg-secondary">
                            <p className="text-sm text-muted-foreground">Orçamento</p>
                            <p className="font-bold">R$ {selectedPurchase.budget.toFixed(2)}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-secondary">
                            <p className="text-sm text-muted-foreground">Total Gasto</p>
                            <p className="font-bold">R$ {selectedPurchase.totalSpent.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <Separator />
                <ScrollArea className="h-64 mt-4">
                    <ul className="space-y-3 pr-4">
                        {selectedPurchase.items.map(item => (
                            <li key={item.id} className="text-sm">
                                <div className="flex justify-between items-center">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="font-medium">R$ {item.price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-end">
                                    <PriceComparison 
                                        currentItem={item} 
                                        previousPurchase={getPreviousPurchase(sortedHistory.findIndex(p => p.id === selectedPurchase.id))} 
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
