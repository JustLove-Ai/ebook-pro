import { EbookBuilder } from "@/components/ebook-builder";
import { getCurrentEbook } from "./actions";

export default async function Home() {
  const ebook = await getCurrentEbook();

  return <EbookBuilder initialEbook={ebook} />;
}
