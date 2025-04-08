import { isLoggedIn } from "@/lib/auth";
import { getCode } from "@/actions/code-actions";
import Header from "./header";
import LinkList from "./link-list";
import CodeInput from "./code-input";

type BodyProps = {
  params?: { id: string };
  view?: boolean;
};

export default async function Body({ view = false, params }: BodyProps) {
  const isLogged = await isLoggedIn();
  const tokenValue = isLogged ? "some-token" : undefined;
  const codeBlockCode = view ? await getCode(params!.id) : "";

  return (
    <div className="h-screen flex flex-col">
      <Header isLogged={isLogged} />
      <div className="flex-grow flex gap-3 m-2">
        <div className="flex-grow">
          <CodeInput codeBlockCode={codeBlockCode} isView={view} />
        </div>
        <div className="w-fit">
          <LinkList tokenValue={tokenValue} />
        </div>
      </div>
    </div>
  );
}
