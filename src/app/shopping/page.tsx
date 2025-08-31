'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, PlusCircle, Wand2, Check, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ShoppingItem } from '@/lib/types';
import { AISuggestions } from '@/components/ai-suggestions';

export default function ShoppingPage() {
  const { budget, shoppingList, addItem, removeItem, totalCost, remainingBudget } = useApp();
  const router = useRouter();
  const { toast } = useToast();

  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemType, setItemType] = useState<'unidade' | 'peso'>('unidade');
  const [isAISuggestionsOpen, setAISuggestionsOpen] = useState(false);

  useEffect(() => {
    if (budget === 0) {
      router.push('/');
    }
  }, [budget, router]);

  const handleAddItem = () => {
    const price = parseFloat(itemPrice);
    const quantity = parseFloat(itemQuantity);

    if (itemName && !isNaN(price) && !isNaN(quantity) && price > 0 && quantity > 0) {
      const newItem: ShoppingItem = {
        id: new Date().toISOString(),
        name: itemName,
        price,
        quantity,
        type: itemType,
      };
      if (totalCost + (price * quantity) > budget) {
        toast({
          variant: "destructive",
          title: "Orçamento Excedido!",
          description: "Este item ultrapassa seu orçamento.",
        })
        return;
      }
      addItem(newItem);
      setItemName('');
      setItemPrice('');
      setItemQuantity('1');
    } else {
       toast({
          variant: "destructive",
          title: "Dados inválidos",
          description: "Por favor, preencha todos os campos corretamente.",
        })
    }
  };
  
  const handleFinalize = () => {
      router.push('/summary');
  }

  const budgetColor = remainingBudget >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="sticky top-20 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Adicionar Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Nome do Produto</Label>
                <Input id="item-name" placeholder="Ex: Arroz" value={itemName} onChange={(e) => setItemName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-quantity">{itemType === 'unidade' ? 'Quantidade' : 'Peso (kg)'}</Label>
                  <Input id="item-quantity" type="number" value={itemQuantity} onChange={(e) => setItemQuantity(e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={itemType} onValueChange={(v: 'unidade' | 'peso') => setItemType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unidade">Unidade</SelectItem>
                      <SelectItem value="peso">Peso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-price">Preço (R$)</Label>
                <Input id="item-price" type="number" placeholder="0.00" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
              </div>
              <Button onClick={handleAddItem} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </CardContent>
          </Card>
           <Button variant="outline" onClick={() => setAISuggestionsOpen(true)} className="w-full mt-4">
            <Wand2 className="mr-2 h-4 w-4" /> Dicas da IA
          </Button>
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex justify-between items-center font-headline text-2xl">
                <span>Lista de Compras</span>
                <span className="text-sm font-medium text-muted-foreground">{shoppingList.length} itens</span>
              </CardTitle>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-center pt-4">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <p className="text-sm text-muted-foreground">Orçamento</p>
                    <p className="font-bold text-lg">R$ {budget.toFixed(2)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-bold text-lg">R$ {totalCost.toFixed(2)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 col-span-2 lg:col-span-1">
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
                <Button onClick={handleFinalize} className="w-full" size="lg">
                    <Check className="mr-2 h-4 w-4" /> Finalizar Compra
                </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
       <AISuggestions open={isAISuggestionsOpen} onOpenChange={setAISuggestionsOpen} />
    </div>
  );
}
