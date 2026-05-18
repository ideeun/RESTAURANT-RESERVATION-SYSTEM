import { redirect } from "next/navigation";

/** Legacy route — redirect to interactive floor map. */
export default function ReservePage() {
  redirect("/book");
}
