import { Button } from "./ui/button";

export default function LinkItem({ href }: { href: string }) {
  return (
    <li className="bg-neutral-800 p-1 rounded-lg">
      <a href={href} target="_blank">
        <Button variant="link">{href}</Button>
      </a>
    </li>
  );
}
