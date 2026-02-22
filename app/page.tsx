import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function Home() {

  const user = await prisma.testando.create({
    data: {
      title: "Teste",
    },
  })
  
  
  
  return (
    <div>
      <h1>{user.title}</h1>
    </div>
  );
}
