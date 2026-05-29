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
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const [checkingItem, setCheckingItem] = useState<ShoppingItem | null>(null);
  const [itemPriceInput, setItemPriceInput] = useState('');

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
                    className={`flex flex-col p-3 rounded-lg border transition-colors ${item.checked ? 'bg-primary/10 border-primary/20' : 'bg-card'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-1">
                        <Checkbox 
                            checked={item.checked} 
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setCheckingItem(item);
                                    setItemPriceInput(item.price ? item.price.toString() : '');
                                } else {
                                    updateItem({ ...item, checked: false });
                                }
                            }} 
                            className="h-6 w-6 rounded-md" 
                        />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${item.checked ? 'line-through text-muted-foreground' : ''}`}>{item.name}</p>
                        {item.checked && (
                            <p className="text-sm text-muted-foreground">
                              R$ {item.price.toFixed(2)} /{' '}
                              {item.type === 'unidade' ? 'un' : 'kg'}
                            </p>
                        )}
                      </div>
                      {item.checked && (
                        <p className="font-bold text-lg text-primary">
                            R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                      )}
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

      <Dialog open={!!checkingItem} onOpenChange={(open) => !open && setCheckingItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Preço do Produto</DialogTitle>
            <DialogDescription>
              Qual o valor pago por {checkingItem?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="R$ 0,00"
              value={itemPriceInput}
              onChange={(e) => setItemPriceInput(e.target.value)}
              className="h-12 text-center text-lg"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setCheckingItem(null)}>Cancelar</Button>
            <Button onClick={() => {
                if (checkingItem) {
                    const price = parseFloat(itemPriceInput.replace(',', '.'));
                    if (!isNaN(price) && price >= 0) {
                        updateItem({ ...checkingItem, checked: true, price });
                        setCheckingItem(null);
                    } else {
                        toast({
                            variant: 'destructive',
                            title: 'Valor inválido',
                            description: 'Por favor, insira um valor válido.',
                        });
                    }
                }
            }}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
