"use client";
import LinkItem from "./link-item";
import { ScrollArea } from "./ui/scroll-area";

type LinkListProps = {
  tokenValue: string | undefined;
};

export default function LinkList({ tokenValue }: LinkListProps) {
  if (!tokenValue) {
    localStorage.setItem("links", JSON.stringify([]));
    return <div className="text-white">Please log in to view your links.</div>;
  }
  const linksString = localStorage.getItem("links");
  const parsedLinks = linksString ? JSON.parse(linksString) : [];
  return (
    <ScrollArea className="w-[20rem] h-full bg-neutral-900 p-3 rounded-xl">
      <ul className="flex flex-col gap-2">
        {parsedLinks.map((link: string) => (
          <LinkItem key={link} href={link} />
        ))}
      </ul>
    </ScrollArea>
  );
}
