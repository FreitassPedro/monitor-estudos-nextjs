import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSubjectsMap, useUpdateSubject } from "@/hooks/useSubjects";
import { useState } from "react";

export function EditSubjectDialog({
    subjectId,
    children,
}: {
    subjectId: string;
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const updateSubject = useUpdateSubject();

    const { data: subjectsMap } = useSubjectsMap();
    const subject = subjectsMap?.[subjectId];

    const [color, setColor] = useState(subject?.color ?? "#000000");
    const [name, setName] = useState(subject?.name ?? "");

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
    }

    const handleOpenChange = (open: boolean) => {
        if (subject && open) {
            setColor(subject.color);
        }

        setIsOpen(open);
    };

    const handleSave = async () => {
        if (!subject) return;
        try {
            await updateSubject.mutateAsync({ id: subject.id, name: name || subject.name, color: color || subject.color });
            setIsOpen(false);
        } catch {
            // Handle error (e.g., show a toast)
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange} >
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Editar Matéria</DialogTitle>
                <div className="flex flex-row items-center gap-4">

                    <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: color }}
                    >
                        <Input
                            type="color"
                            value={color}
                            defaultValue={color}
                            onChange={handleColorChange}
                            className="w-full h-full opacity-0 cursor-pointer"
                        />

                    </div>
                    <Input
                        placeholder="Nome da matéria"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <Button
                    onClick={handleSave}
                    className="mt-4"
                    size={"sm"}
                >
                    Salvar
                </Button>
            </DialogContent>
        </Dialog>
    );
};