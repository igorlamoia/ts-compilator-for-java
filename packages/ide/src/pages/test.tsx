import { ScrollStack, ScrollStackItem } from "@/components/ui/scroll-stack";

export default function Test() {
  return (
    <main className="h-screen bg-slate-950 p-6 text-white">
      <ScrollStack className="h-full ">
        <ScrollStackItem itemClassName="bg-red-400/90 text-slate-950">
          <h2>Card 1</h2>
          <p>This is the first card in the stack</p>
        </ScrollStackItem>
        <ScrollStackItem itemClassName="bg-blue-400/90 text-slate-950">
          <h2>Card 2</h2>
          <p>This is the second card in the stack</p>
        </ScrollStackItem>
        <ScrollStackItem itemClassName="bg-green-400/90 text-slate-950">
          <h2>Card 3</h2>
          <p>This is the third card in the stack</p>
        </ScrollStackItem>
      </ScrollStack>
    </main>
  );
}
