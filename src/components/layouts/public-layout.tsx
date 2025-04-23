import { PropsWithChildren } from "react";
import { PublicHeader } from "./header";
import { PublicFooter } from "./footer";

export function PublicLayout({ children }: PropsWithChildren) {
  return (
    <>
      <PublicHeader />
      <main className="bg-white">{children}</main>
      <PublicFooter />
    </>
  );
}
