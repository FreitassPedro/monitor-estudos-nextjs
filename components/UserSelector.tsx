"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getUsersAction } from "@/server/actions/user.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";
import { UserIcon } from "lucide-react";

interface User {
    id: string;
    name: string | null;
    email: string;
}

export function UserSelector() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, setUser } = useAuthStore();

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
                    {users.map((u) => (
                        <Button
                            key={u.id}
                            onClick={() => setUser(u)}
                            variant="outline"
                            className="w-full justify-start text-lg h-14"
                        >
                            {u.name || u.email}
                        </Button>
                    ))}
                    <Separator className="my-4" />
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
                </CardContent>
            </Card>
        </div>
    );
}
