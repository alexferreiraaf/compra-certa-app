'use client';

import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import type { ShoppingItem } from '@/lib/types';

interface ShoppingListSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShoppingListSheet({
  open,
  onOpenChange,
}: ShoppingListSheetProps) {
  const {
    shoppingList,
    updateItem,
    removeItem,
    totalCost,
    remainingBudget,
  } = useApp();

  const handleQuantityChange = (item: ShoppingItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(item.id);
    } else {
      updateItem({ ...item, quantity: newQuantity });
    }
  };

  const budgetColor = remainingBudget >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-headline text-2xl">
            <ShoppingCart />
            Sua Lista de Compras
          </SheetTitle>
          <SheetDescription>
            Revise e ajuste os itens da sua lista.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-6">
            {shoppingList.length === 0 ? (
              <div className="text-center text-muted-foreground py-16 flex flex-col items-center justify-center h-full">
                <ShoppingCart className="mx-auto h-12 w-12" />
                <p className="mt-4">Sua lista está vazia.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {shoppingList.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col p-3 rounded-lg bg-card border"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {item.price.toFixed(2)} /{' '}
                          {item.type === 'unidade' ? 'un' : 'kg'}
                        </p>
                      </div>
                       <p className="font-bold text-lg text-primary">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleQuantityChange(item, item.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleQuantityChange(item, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>

        {shoppingList.length > 0 && (
          <SheetFooter className="pt-4 border-t">
            <div className="w-full space-y-2 text-right">
                <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold">R$ {totalCost.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center text-md">
                    <span className="text-muted-foreground">Saldo Restante:</span>
                    <span className={`font-semibold ${budgetColor}`}>R$ {remainingBudget.toFixed(2)}</span>
                </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
