import Link from "next/link";
import { TopNav } from "@/components/top-nav";
export const metadata = { title: "FORM — Fitness tracker", description: "Local-first fitness and physique tracker" };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body><header><Link href="/"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10" /></svg></span><span>Lift Log</span></Link><TopNav /></header><main>{children}</main></body></html> }
