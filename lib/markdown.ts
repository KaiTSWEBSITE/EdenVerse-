import { remark } from "remark";
import html from "remark-html";
import { sanitizeRichText } from "@/utils/security";

export async function renderMarkdown(markdown: string) {
  const processed = await remark().use(html).process(markdown);
  return sanitizeRichText(processed.toString());
}
