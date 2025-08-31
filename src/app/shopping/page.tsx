
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import type { ShoppingItem, Product } from '@/lib/types';
import { Wand2, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { ShoppingListSheet } from '@/components/shopping-list-sheet';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShoppingPage() {
  const {
    budget,
    addItem,
    totalCost,
    remainingBudget,
    shoppingList,
    setBudget: setGlobalBudget,
    isLoading: isAppLoading, // Use isLoading from context to know when auth check is done
  } = useApp();
  const router = useRouter();
  const { toast } = useToast();

  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [isAISuggestionsOpen, setAISuggestionsOpen] = useState(false);
  const [isBudgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [isConfirmingFinish, setConfirmingFinish] = useState(false);
  const [isShoppingListOpen, setShoppingListOpen] = useState(false);
  const [isNewItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [newBudgetString, setNewBudgetString] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductType, setNewProductType] = useState<'unidade' | 'peso'>('unidade');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [openCombobox, setOpenCombobox] = useState(false)


  useEffect(() => {
    if (budget === 0) {
      router.push('/budget');
    }
  }, [budget, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setProducts(productList.sort((a,b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Error fetching products: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao buscar produtos",
            description: "Não foi possível carregar a lista de produtos do banco de dados.",
        });
      } finally {
        setIsLoadingProducts(false);
      }
    };
    // Fetch products only after auth state is confirmed
    if (!isAppLoading) {
      fetchProducts();
    }
  }, [isAppLoading, toast]);

  const handleAddItem = () => {
    const price = parseFloat(itemPrice.replace(',', '.'));
    const quantity = parseInt(itemQuantity, 10);
    const selectedProduct = products.find(p => p.name.toLowerCase() === itemName.toLowerCase());

    if (
      selectedProduct &&
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
        name: selectedProduct.name,
        price,
        quantity,
        type: selectedProduct.type,
      };
      addItem(newItem);
      setItemName('');
      setItemPrice('');
      setItemQuantity('1');
      toast({
        title: 'Item Adicionado',
        description: `${selectedProduct.name} foi adicionado à sua lista.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Dados inválidos',
        description: 'Por favor, selecione um produto e preencha todos os campos corretamente.',
      });
    }
  };

  const handleUpdateBudget = () => {
    const budgetValue = parseFloat(newBudgetString.replace(',', '.'));
    if (!isNaN(budgetValue) && budgetValue > 0) {
      setGlobalBudget(budgetValue);
      toast({
        title: 'Orçamento atualizado!',
        description: `Seu novo orçamento é de R$ ${budgetValue.toFixed(2)}.`,
      });
      setBudgetDialogOpen(false);
      setNewBudgetString('');
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

  const handleSaveNewProduct = async () => {
    if (!newProductName.trim()) {
        toast({
            variant: "destructive",
            title: "Nome inválido",
            description: "O nome do produto não pode ser vazio.",
        });
        return;
    }

    const productExists = products.some(
        (product) => product.name.toLowerCase() === newProductName.trim().toLowerCase()
    );

    if (productExists) {
        toast({
            variant: "destructive",
            title: "Produto já cadastrado",
            description: `O produto "${newProductName}" já existe na sua lista.`,
        });
        return;
    }

    setIsSavingProduct(true);
    try {
        const productsCollection = collection(db, 'products');
        const newProductData = { name: newProductName, type: newProductType };
        const docRef = await addDoc(productsCollection, newProductData);
        const newProduct = { id: docRef.id, ...newProductData };
        setProducts(prevProducts => [...prevProducts, newProduct].sort((a,b) => a.name.localeCompare(b.name)));
        toast({
            title: "Produto cadastrado!",
            description: `"${newProductName}" foi adicionado à lista de produtos.`,
        });
        setNewProductName('');
        setNewProductType('unidade');
        setNewItemDialogOpen(false);
    } catch (error) {
        console.error("Error adding document: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao salvar",
            description: "Não foi possível cadastrar o novo produto.",
        });
    } finally {
        setIsSavingProduct(false);
    }
  };

  if (isAppLoading) {
    return (
      <div className="container mx-auto p-6 max-w-md space-y-6">
        <header className="py-8 text-center">
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <Skeleton className="h-12 w-3/4 mx-auto mt-2" />
            <Skeleton className="h-10 w-40 mx-auto mt-4" />
        </header>
        <main className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </main>
      </div>
    )
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
             <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                    <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full h-12 text-base justify-between"
                    disabled={isLoadingProducts}
                    >
                    {isLoadingProducts ? "Carregando produtos..." : itemName
                        ? products.find((product) => product.name.toLowerCase() === itemName.toLowerCase())?.name
                        : "Selecione um item"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                    <CommandInput placeholder="Pesquisar item..." />
                    <CommandList>
                      <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                      <CommandGroup>
                        {products.map((product) => (
                            <CommandItem
                            key={product.id}
                            value={product.name}
                            onSelect={(currentValue) => {
                                setItemName(products.find(p => p.name.toLowerCase() === currentValue.toLowerCase())?.name || '')
                                setOpenCombobox(false)
                            }}
                            >
                            <Check
                                className={cn(
                                "mr-2 h-4 w-4",
                                itemName.toLowerCase() === product.name.toLowerCase() ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {product.name}
                            </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

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
            <Button onClick={() => setNewItemDialogOpen(true)} variant="secondary" className="w-full h-12 text-lg">
              Cadastrar Novo Item
            </Button>
          </div>
        </div>
      </main>
      <footer className="sticky bottom-0 bg-secondary p-2 grid grid-cols-2 gap-2">
        <Button
            variant="outline"
            className="bg-transparent border-muted-foreground text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground relative"
            onClick={() => setShoppingListOpen(true)}
        >
            Ver Lista
            {shoppingList.length > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                {shoppingList.length}
            </span>
            )}
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
        <ShoppingListSheet open={isShoppingListOpen} onOpenChange={setShoppingListOpen} />
        
        {/* Budget Dialog */}
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
                        value={newBudgetString}
                        onChange={(e) => setNewBudgetString(e.target.value)}
                        className="text-lg text-center h-12"
                    />
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setBudgetDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleUpdateBudget} className="bg-accent text-accent-foreground hover:bg-accent/90">Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* New Item Dialog */}
        <Dialog open={isNewItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cadastrar Novo Produto</DialogTitle>
                    <DialogDescription>
                        Digite o nome do novo produto e selecione o tipo de medida.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Input 
                        id="new-product-name"
                        type="text"
                        placeholder="Ex: Arroz Integral"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        className="text-lg h-12"
                    />
                    <RadioGroup defaultValue="unidade" value={newProductType} onValueChange={(value: 'unidade' | 'peso') => setNewProductType(value)}>
                        <Label>Tipo de Medida</Label>
                        <div className='flex gap-4 items-center'>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="unidade" id="r1" />
                                <Label htmlFor="r1">Unidade (un)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="peso" id="r2" />
                                <Label htmlFor="r2">Peso (kg)</Label>
                            </div>
                        </div>
                    </RadioGroup>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setNewItemDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveNewProduct} disabled={isSavingProduct} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        {isSavingProduct && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Produto
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Confirm Finish Dialog */}
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

    