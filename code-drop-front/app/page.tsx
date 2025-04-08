import Body from "@/components/body";
import LocalStorageInitializer from "@/components/local-storage-initializar";
import { cookies } from "next/headers";

export default function Home() {
  cookies();
  return (
    <div className="max-h-screen min-h-screen w-screen overflow-hidden">
      <LocalStorageInitializer />
      <Body />
    </div>
  );
}
