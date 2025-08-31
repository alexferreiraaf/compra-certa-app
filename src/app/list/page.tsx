
'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';

export default function ListPage() {
  const { shoppingList, removeItem, totalCost, budget, remainingBudget } = useApp();
  const router = useRouter();

  const handleFinalize = () => {
    router.push('/summary');
  }

  const budgetColor = remainingBudget >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="container mx-auto p-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex justify-between items-center font-headline text-2xl">
            <span>Lista de Compras</span>
            <span className="text-sm font-medium text-muted-foreground">{shoppingList.length} itens</span>
          </CardTitle>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-center pt-4">
              <div className="p-2 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground">Orçamento</p>
                <p className="font-bold text-lg">R$ {budget.toFixed(2)}</p>
              </div>
              <div className="p-2 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-bold text-lg">R$ {totalCost.toFixed(2)}</p>
              </div>
              <div className="p-2 rounded-lg bg-secondary col-span-2 lg:col-span-1">
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p className={`font-bold text-lg ${budgetColor}`}>R$ {remainingBudget.toFixed(2)}</p>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[40vh] pr-4">
            {shoppingList.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                <ShoppingCart className="mx-auto h-12 w-12" />
                <p className="mt-4">Sua lista de compras está vazia.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {shoppingList.map((item) => (
                  <li key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-card border transition-all duration-300 hover:bg-secondary">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.type === 'unidade' ? 'un.' : 'kg'} x R$ {item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="font-bold text-primary">
                            R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
          {shoppingList.length > 0 && (
            <>
            <Separator className="my-4" />
            <Button onClick={handleFinalize} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                Finalizar Compra
            </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
