'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Repeat, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SummaryPage() {
  const { budget, shoppingList, totalCost, remainingBudget, savePurchase, clearList, user } = useApp();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    await savePurchase();
    toast({
      title: "Compra salva com sucesso!",
      description: "Seu histórico foi atualizado.",
    });
    setIsSaving(false);
    router.push('/history');
  };

  const handleNewPurchase = () => {
    clearList();
    router.push('/budget');
  };

  const isOverBudget = remainingBudget < 0;
  const isGuest = !user;

  if (shoppingList.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <CardTitle>Nenhum item na lista</CardTitle>
            <CardDescription>Sua lista de compras está vazia.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/shopping')}>Voltar para Compras</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-2xl animate-in fade-in-50 duration-500">
        <CardHeader>
          <CardTitle className="font-headline text-center text-3xl">Resumo da Compra</CardTitle>
          <CardDescription className="text-center">Confira os detalhes antes de salvar.</CardDescription>
        </CardHeader>
        <CardContent>
          {isGuest && (
             <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-200">
                <AlertTriangle className="h-5 w-5" />
                <p><span className="font-bold">Atenção:</span> Você está como convidado. Seu histórico será salvo apenas neste navegador.</p>
            </div>
          )}
          {isOverBudget && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p><span className="font-bold">Atenção:</span> Sua compra excedeu o orçamento em R$ {Math.abs(remainingBudget).toFixed(2)}.</p>
            </div>
          )}
          <div className="mb-6 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-sm text-muted-foreground">Orçamento</p>
              <p className="text-lg font-bold">R$ {budget.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-sm text-muted-foreground">Total Gasto</p>
              <p className="text-lg font-bold">R$ {totalCost.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-sm text-muted-foreground">Saldo Final</p>
              <p className={`text-lg font-bold ${isOverBudget ? 'text-destructive' : 'text-green-500'}`}>R$ {remainingBudget.toFixed(2)}</p>
            </div>
          </div>
          
          <Separator />

          <h3 className="mb-2 mt-4 text-lg font-semibold">Itens da Lista ({shoppingList.length})</h3>
          <ScrollArea className="h-64 rounded-lg border p-4">
             <ul className="space-y-2">
              {shoppingList.map((item) => (
                <li key={item.id} className="flex items-center justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
        <CardFooter className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Button variant="outline" size="lg" onClick={handleNewPurchase}>
            <Repeat className="mr-2 h-4 w-4" /> Nova Compra
          </Button>
          <Button size="lg" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Salvar Compra
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
