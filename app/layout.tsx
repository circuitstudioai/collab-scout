import type { Metadata } from 'next';
import { DM_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
const body = DM_Sans({ variable: '--font-body', subsets: ['latin'] });
const display = Instrument_Serif({ variable: '--font-display', weight: '400', subsets: ['latin'] });
export const metadata: Metadata = { title: 'Sitebrief | Compare restaurant locations', description: 'Compare candidate restaurant sites using Qloo taste evidence, rent constraints, and clear next checks.' };
export default function RootLayout({ children }: LayoutProps<'/'>) { return <html lang="en" className={`${body.variable} ${display.variable}`}><body>{children}</body></html>; }
