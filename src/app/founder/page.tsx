import { redirect } from "next/navigation";

export default function LegacyAboutRedirectPage() {
  redirect("/about/");
}
