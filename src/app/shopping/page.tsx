
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { ShoppingItem } from '@/lib/types';
import { Wand2 } from 'lucide-react';
import { AISuggestions } from '@/components/ai-suggestions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ShoppingPage() {
  const {
    budget,
    addItem,
    totalCost,
    remainingBudget,
    setBudget: setGlobalBudget,
  } = useApp();
  const router = useRouter();
  const { toast } = useToast();

  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [isAISuggestionsOpen, setAISuggestionsOpen] = useState(false);
  const [isBudgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [isConfirmingFinish, setConfirmingFinish] = useState(false);
  const [newBudget, setNewBudget] = useState('');

  useEffect(() => {
    if (budget === 0) {
      router.push('/budget');
    }
  }, [budget, router]);

  const handleAddItem = () => {
    const price = parseFloat(itemPrice.replace(',', '.'));
    const quantity = parseInt(itemQuantity, 10);

    if (
      itemName &&
      !isNaN(price) &&
      !isNaN(quantity) &&
      price > 0 &&
      quantity > 0
    ) {
      if (totalCost + price * quantity > budget) {
        toast({
          variant: 'destructive',
          title: 'Orçamento Excedido!',
          description: 'Este item ultrapassa seu orçamento.',
        });
        return;
      }

      const newItem: ShoppingItem = {
        id: new Date().toISOString(),
        name: itemName,
        price,
        quantity,
        type: 'unidade',
      };
      addItem(newItem);
      setItemName('');
      setItemPrice('');
      setItemQuantity('1');
      toast({
        title: 'Item Adicionado',
        description: `${itemName} foi adicionado à sua lista.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Dados inválidos',
        description: 'Por favor, preencha todos os campos corretamente.',
      });
    }
  };

  const handleUpdateBudget = () => {
    const budgetValue = parseFloat(newBudget.replace(',', '.'));
    if (!isNaN(budgetValue) && budgetValue > 0) {
      setGlobalBudget(budgetValue);
      toast({
        title: 'Orçamento atualizado!',
        description: `Seu novo orçamento é de R$ ${budgetValue.toFixed(2)}.`,
      });
      setBudgetDialogOpen(false);
      setNewBudget('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Valor inválido',
        description: 'Por favor, insira um valor de orçamento válido.',
      });
    }
  };

  const handleFinalize = () => {
    setConfirmingFinish(true);
  };
  
  const handleConfirmFinish = () => {
    router.push('/summary');
  };

  const handleNewItem = () => {
    // Logic to add a new item type, for now just a placeholder
    toast({
        title: "Função não implementada",
        description: "A capacidade de cadastrar novos tipos de itens será adicionada em breve.",
    });
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <header className="bg-primary text-primary-foreground py-8 text-center">
        <p className="text-lg">Saldo Restante</p>
        <h1 className="text-5xl font-bold tracking-tighter">
          R$ {remainingBudget.toFixed(2)}
        </h1>
        <Button
          variant="secondary"
          className="mt-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          onClick={() => setBudgetDialogOpen(true)}
        >
          Alterar Orçamento
        </Button>
      </header>
      <main className="flex-1 bg-background text-foreground p-6">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-lg font-semibold text-center">
            Adicionar produto:
          </h2>
          <div className="space-y-4">
            <Select onValueChange={setItemName} value={itemName}>
              <SelectTrigger className="w-full h-12 text-base">
                <SelectValue placeholder="Selecione um item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arroz">Arroz</SelectItem>
                <SelectItem value="Feijão">Feijão</SelectItem>
                <SelectItem value="Macarrão">Macarrão</SelectItem>
                <SelectItem value="Óleo de Soja">Óleo de Soja</SelectItem>
                <SelectItem value="Sal">Sal</SelectItem>
                <SelectItem value="Açúcar">Açúcar</SelectItem>
                <SelectItem value="Café">Café</SelectItem>
                <SelectItem value="Farinha de Trigo">Farinha de Trigo</SelectItem>
                <SelectItem value="Leite">Leite</SelectItem>
                <SelectItem value="Pão de Forma">Pão de Forma</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="1"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                className="h-12 text-base text-center"
              />
              <Input
                type="text"
                placeholder="Valor do item"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="h-12 text-base text-center"
              />
            </div>
            <Button
              onClick={handleAddItem}
              className="w-full h-12 text-lg bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Adicionar Item
            </Button>
            <Button onClick={handleNewItem} variant="secondary" className="w-full h-12 text-lg">
              Cadastrar Novo Item
            </Button>
          </div>
        </div>
      </main>
      <footer className="sticky bottom-0 bg-secondary p-2 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="bg-transparent border-muted-foreground text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
          onClick={() => router.push('/list')}
        >
          Ver Lista
        </Button>
        <Button
          variant="outline"
          className="bg-transparent border-muted-foreground text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
          onClick={handleFinalize}
        >
          Finalizar Compras
        </Button>
      </footer>
        <Button variant="outline" onClick={() => setAISuggestionsOpen(true)}  className="fixed bottom-16 right-4 h-14 w-14 rounded-full shadow-lg bg-secondary text-secondary-foreground">
            <Wand2 className="h-6 w-6" />
        </Button>
        <AISuggestions open={isAISuggestionsOpen} onOpenChange={setAISuggestionsOpen} />
        <Dialog open={isBudgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Alterar Orçamento</DialogTitle>
                    <DialogDescription>
                        Orçamento atual: R$ {budget.toFixed(2)}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input 
                        id="new-budget"
                        type="text"
                        placeholder="Novo orçamento"
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                        className="text-lg text-center h-12"
                    />
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setBudgetDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleUpdateBudget} className="bg-accent text-accent-foreground hover:bg-accent/90">Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <AlertDialog open={isConfirmingFinish} onOpenChange={setConfirmingFinish}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza que deseja finalizar a compra?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmFinish} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

    