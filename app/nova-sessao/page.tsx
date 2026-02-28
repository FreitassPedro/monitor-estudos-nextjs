import { SessionSidebar } from "./components/SessionSidebar";
import { StudySessionForm } from "./components/StudySessionForm";

export default function NovaSessaoPage() {
    return (
        <div >
            <div className="flex flex-row min-h-screen my-4">
                <main className="flex-1 max-w-5xl mx-auto ">
                    <StudySessionForm />
                </main>
                <aside className="p-4 bg-gray-100 static w-1/5 h-screen translate-y-0 bottom-0 left-0 right-0 flex flex-col">
                    <SessionSidebar />
                </aside>
            </div>
        </div>
    );
}