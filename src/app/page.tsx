'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/app-context';
import { Wallet } from 'lucide-react';

export default function BudgetPage() {
  const [budget, setBudget] = useState('');
  const { setBudget: setGlobalBudget } = useApp();
  const router = useRouter();

  const handleStartShopping = () => {
    const budgetValue = parseFloat(budget);
    if (!isNaN(budgetValue) && budgetValue > 0) {
      setGlobalBudget(budgetValue);
      router.push('/shopping');
    }
  };

  return (
    <div className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <div className="flex w-full justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/20 text-primary">
                <Wallet className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-center text-3xl font-headline">Defina seu Orçamento</CardTitle>
          <CardDescription className="text-center">
            Qual o valor máximo que você planeja gastar nesta compra?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="budget">Orçamento (R$)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Ex: 350,00"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="text-lg"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartShopping} className="w-full text-lg" size="lg" disabled={!budget || parseFloat(budget) <= 0}>
            Iniciar Compras
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
