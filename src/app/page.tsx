'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import { format } from 'path';

export default function BudgetPage() {
  const [budget, setBudget] = useState('');
  const { setBudget: setGlobalBudget } = useApp();
  const router = useRouter();

  const handleStartShopping = () => {
    const budgetValue = parseFloat(budget.replace("R$ ", "").replace(",", "."));
    if (!isNaN(budgetValue) && budgetValue > 0) {
      setGlobalBudget(budgetValue);
      router.push('/shopping');
    }
  };

  const handleViewReports = () => {
    router.push('/history');
  }

  const formatCurrency = (value: string) => {
    let numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    
    let intValue = parseInt(numericValue, 10);
    let formattedValue = (intValue / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return `R$ ${formattedValue}`;
  }

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrency(e.target.value);
    setBudget(formattedValue);
  }

  return (
    <div className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-card/80 border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">Compra Certa</CardTitle>
          <CardDescription className="text-muted-foreground">
            Qual o valor máximo para suas compras?
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Input
            id="budget"
            type="text"
            placeholder="R$ 0,00"
            value={budget}
            onChange={handleBudgetChange}
            className="text-2xl text-center h-16 bg-secondary/50 border-primary focus:border-2 focus:ring-primary"
          />
        </CardContent>
        <CardFooter className="flex-col space-y-3">
          <Button onClick={handleStartShopping} className="w-full text-lg bg-primary hover:bg-primary/90 text-primary-foreground" size="lg" disabled={!budget || parseFloat(budget.replace("R$ ", "").replace(",", ".")) <= 0}>
            Iniciar Compras
          </Button>
           <Button onClick={handleViewReports} variant="secondary" className="w-full text-lg" size="lg">
            Ver Relatórios
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
