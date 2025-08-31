'use client';

import { useState } from 'react';
import { useApp } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, FileText, ArrowUp, ArrowDown, Minus, Trash2, Loader2, ShoppingCart } from 'lucide-react';
import type { Purchase, ShoppingItem } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function PriceComparison({ currentItem, previousPurchase }: { currentItem: ShoppingItem, previousPurchase: Purchase | undefined }) {
  if (!previousPurchase) {
    return <span className="flex items-center gap-1 text-xs text-muted-foreground"><Minus className="h-3 w-3" />Primeira compra</span>;
  }
  
  const previousItem = previousPurchase.items.find(item => item.name === currentItem.name);
  if (!previousItem || previousItem.price === currentItem.price) {
    return <span className="flex items-center gap-1 text-xs text-muted-foreground"><Minus className="h-3 w-3" />Sem alteração</span>;
  }

  const diff = currentItem.price - previousItem.price;
  const percentageDiff = (diff / previousItem.price) * 100;
  
  if (diff > 0) {
    return <span className="flex items-center gap-1 text-xs text-red-500"><ArrowUp className="h-3 w-3" /> R$ {diff.toFixed(2)} ({percentageDiff.toFixed(0)}%)</span>;
  } else {
    return <span className="flex items-center gap-1 text-xs text-green-500"><ArrowDown className="h-3 w-3" /> R$ {Math.abs(diff).toFixed(2)} ({Math.abs(percentageDiff).toFixed(0)}%)</span>;
  }
}

export default function HistoryPage() {
  const { purchaseHistory, removePurchase, isLoading, user } = useApp();
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const getPreviousPurchase = (currentIndex: number): Purchase | undefined => {
    // purchaseHistory is already sorted by date descending from context
    return purchaseHistory[currentIndex + 1];
  }

  const handleDeletePurchase = async () => {
    if (purchaseToDelete) {
      setIsDeleting(true);
      await removePurchase(purchaseToDelete.id);
      toast({
        title: "Compra excluída",
        description: "O registro da compra foi removido com sucesso.",
      });
      setPurchaseToDelete(null);
      setIsDeleting(false);
    }
  }
  
  const renderHistory = () => {
    if (isLoading) {
        return (
            <div className="space-y-4 pr-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        )
    }

    if (!user) {
       return (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <History className="h-16 w-16" />
                <h3 className="mt-4 text-xl font-semibold">Histórico de Compras</h3>
                <p className="mt-2">Faça login para ver e salvar seu histórico de compras.</p>
            </div>
        )
    }

    if (purchaseHistory.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <ShoppingCart className="h-16 w-16" />
                <h3 className="mt-4 text-xl font-semibold">Nenhuma compra encontrada</h3>
                <p className="mt-2">Você ainda não salvou nenhuma compra.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 pr-4">
            {purchaseHistory.map((purchase, index) => (
                <Card key={purchase.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-lg font-semibold">{new Date(purchase.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                            <p className="text-sm text-muted-foreground">Total: R$ {purchase.totalSpent.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setSelectedPurchase(purchase)}>
                                <FileText className="mr-2 h-4 w-4" /> Detalhes
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => setPurchaseToDelete(purchase)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
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
            {renderHistory()}
          </ScrollArea>
        </CardContent>
      </Card>
      
      {selectedPurchase && (
         <Dialog open={!!selectedPurchase} onOpenChange={(isOpen) => !isOpen && setSelectedPurchase(null)}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Detalhes da Compra</DialogTitle>
                    <DialogDescription>
                        Compra de {new Date(selectedPurchase.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                    </DialogDescription>
                </DialogHeader>
                <div className="my-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="rounded-lg bg-secondary p-2">
                            <p className="text-sm text-muted-foreground">Orçamento</p>
                            <p className="font-bold">R$ {selectedPurchase.budget.toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg bg-secondary p-2">
                            <p className="text-sm text-muted-foreground">Total Gasto</p>
                            <p className="font-bold">R$ {selectedPurchase.totalSpent.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <Separator />
                <ScrollArea className="mt-4 h-64">
                    <ul className="space-y-3 pr-4">
                        {selectedPurchase.items.map(item => (
                            <li key={item.id} className="text-sm">
                                <div className="flex items-center justify-between">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="font-medium">R$ {item.price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-end">
                                    <PriceComparison 
                                        currentItem={item} 
                                        previousPurchase={getPreviousPurchase(purchaseHistory.findIndex(p => p.id === selectedPurchase.id))} 
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!purchaseToDelete} onOpenChange={(isOpen) => !isOpen && setPurchaseToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro da sua compra.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePurchase} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Excluir
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}
