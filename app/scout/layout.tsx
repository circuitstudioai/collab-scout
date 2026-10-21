import type { Metadata } from "next";
export const metadata: Metadata = { title: "Collab Scout | Legacy partner-finding demo" };
export default function ScoutLayout({ children }: { children: React.ReactNode }) { return <><a href="#main-content" className="skip-link">Skip to content</a>{children}</>; }
