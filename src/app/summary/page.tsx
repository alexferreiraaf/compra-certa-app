'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Repeat, AlertTriangle } from 'lucide-react';

export default function SummaryPage() {
  const { budget, shoppingList, totalCost, remainingBudget, savePurchase, clearList } = useApp();
  const router = useRouter();
  
  const handleSave = () => {
    savePurchase();
    router.push('/history');
  };

  const handleNewPurchase = () => {
    clearList();
    router.push('/');
  };

  const isOverBudget = remainingBudget < 0;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg animate-in fade-in-50 duration-500">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-headline">Resumo da Compra</CardTitle>
          <CardDescription className="text-center">Confira os detalhes antes de salvar.</CardDescription>
        </CardHeader>
        <CardContent>
          {isOverBudget && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p><span className="font-bold">Atenção:</span> Sua compra excedeu o orçamento em R$ {Math.abs(remainingBudget).toFixed(2)}.</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground">Orçamento</p>
              <p className="font-bold text-lg">R$ {budget.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground">Total Gasto</p>
              <p className="font-bold text-lg">R$ {totalCost.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground">Saldo Final</p>
              <p className={`font-bold text-lg ${isOverBudget ? 'text-destructive' : 'text-green-600'}`}>R$ {remainingBudget.toFixed(2)}</p>
            </div>
          </div>
          
          <Separator />

          <h3 className="text-lg font-semibold mt-4 mb-2">Itens da Lista ({shoppingList.length})</h3>
          <ScrollArea className="h-64 border rounded-lg p-4">
             <ul className="space-y-2">
              {shoppingList.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
        <CardFooter className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="outline" size="lg" onClick={handleNewPurchase}>
            <Repeat className="mr-2 h-4 w-4" /> Nova Compra
          </Button>
          <Button size="lg" onClick={handleSave}>
            <CheckCircle className="mr-2 h-4 w-4" /> Salvar e Ver Relatório
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
