"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { createUserAction, getUsersAction } from "@/server/actions/user.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";
import { Icon, User, User2Icon, UserIcon } from "lucide-react";
import { Input } from "./ui/input";
import { redirect } from "next/navigation";


interface User {
    id: string;
    name: string | null;
    email: string;
}

export function UserSelector() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, setUser } = useAuthStore();

    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [newUserName, setNewUserName] = useState("");

    useEffect(() => {
        async function loadUsers() {
            try {
                const data = await getUsersAction();
                setUsers(data);
            } catch (error) {
                console.error("Error loading users:", error);
            } finally {
                setLoading(false);
            }
        }
        loadUsers();
    }, []);

    const handleCreateAccount = async () => {

        if (!isCreatingAccount) {
            setIsCreatingAccount(true);
            return;
        }

        if (!newUserName.trim()) {
            alert("Por favor, insira um nome válido.");
            return;
        }

        await createUserAction(newUserName.trim());
        setIsCreatingAccount(false);
        setNewUserName("");
        // Recarrega a lista de usuários para incluir o novo usuário criado
        setLoading(true);
        const data = await getUsersAction();
        setUsers(data);
        setLoading(false);
    }

    const handleUSerSelect = (selectedUser: User) => () => {
        setUser(selectedUser);
        redirect("/dashboard");
    }

    if (user) {
        return null; // Não mostra o seletor se já tem usuário logado
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 mx-auto flex items-center justify-center">
                <Card className="w-100">
                    <CardContent className="pt-6">
                        <UserIcon className="mx-auto mb-4 text-muted-foreground" size={48} />
                        {user ?
                            <p className="text-center">Carregando dados do usuário...</p>
                            :
                            <p className="text-center">Carregando usuários...</p>
                        }
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 mx-auto flex items-center justify-center">
            <Card >
                <CardHeader>
                    <CardTitle>Identificação</CardTitle>
                    <CardDescription>Selecione seu nome para continuar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {!isCreatingAccount ? (
                        users.map((u) => (
                            <Button
                                key={u.id}
                                onClick={handleUSerSelect(u)}
                                variant="outline"
                                className="w-full justify-start text-lg h-14"
                            >
                                {u.name || u.email}
                            </Button>
                        ))) : (
                        <div className="text-center gap-2 flex flex-col">
                            <p className="text-muted-foreground">
                                Insira o nome para criar uma nova conta.
                            </p>
                            <Input
                                placeholder="Nome"
                                className=""
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                            />

                        </div>
                    )}
                    <Separator className="my-4" />
                    {isCreatingAccount ? (
                        <>
                            <Button variant={"default"} size="sm" className="w-full " onClick={handleCreateAccount}>
                                <User2Icon name="plus" className="mr-2" size={16} />
                                Registrar conta
                            </Button>
                            <Button variant={"outline"} className="w-full justify-center" onClick={() => setIsCreatingAccount(false)}>
                                Voltar
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant={"default"} size="lg" className="w-full" onClick={handleCreateAccount}>
                                <User2Icon name="plus" className="mr-2" size={16} />
                                Criar nova conta
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setUser({
                                        id: "guest",
                                        name: "Visitante",
                                        email: "",
                                    });
                                }}
                                className="w-full"
                            >
                                Continuar como visitante
                            </Button>
                        </>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
