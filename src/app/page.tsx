
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        const handleRedirectResult = async () => {
            setIsLoading(true);
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    toast({ title: "Login com Google realizado com sucesso!" });
                    router.push('/budget');
                }
            } catch (error: any) {
                 toast({
                    variant: 'destructive',
                    title: "Erro no login com Google",
                    description: error.message,
                });
            } finally {
                setIsLoading(false);
            }
        };
        handleRedirectResult();
    }, [router, toast]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({ title: "Login realizado com sucesso!" });
            router.push('/budget');
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                    toast({ title: "Conta criada com sucesso!" });
                    router.push('/budget');
                } catch (creationError: any) {
                     toast({
                        variant: 'destructive',
                        title: "Erro ao criar conta",
                        description: creationError.message,
                    });
                }
            } else {
                toast({
                    variant: 'destructive',
                    title: "Erro no login",
                    description: error.message,
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
    }

    const handleGuestLogin = () => {
        router.push('/budget');
    }

  return (
    <div className="container mx-auto flex h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-card/80 border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">Compra Certa</CardTitle>
          <CardDescription className="text-muted-foreground">
            Acesse sua conta para continuar
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                 <Button type="submit" className="w-full text-lg bg-accent hover:bg-accent/90 text-accent-foreground mt-4" size="lg" disabled={isLoading || isGoogleLoading}>
                    {(isLoading || isGoogleLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar / Cadastrar
                </Button>
            </CardContent>
        </form>
        <CardFooter className="flex-col space-y-3">
             <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Ou continue com
                    </span>
                </div>
            </div>
            <Button onClick={handleGoogleLogin} variant="outline" className="w-full text-lg" size="lg" disabled={isGoogleLoading || isLoading}>
                {(isGoogleLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.222,0-9.658-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>}
                Google
            </Button>
             <Button onClick={handleGuestLogin} variant="link" className="w-full text-lg text-muted-foreground" size="lg">
                Entrar sem login
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
