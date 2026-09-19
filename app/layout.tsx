import type { Metadata } from "next";
import {
	Brawler,
	Encode_Sans,
	League_Gothic,
	Red_Hat_Mono,
} from "next/font/google";
import "./globals.css";

const leagueGothic = League_Gothic({
	subsets: ["latin"],
	variable: "--font-display",
});

const encodeSans = Encode_Sans({
	subsets: ["latin"],
	variable: "--font-sans",
});

const brawler = Brawler({
	weight: ["400", "700"],
	subsets: ["latin"],
	variable: "--font-serif",
});

const redHatMono = Red_Hat_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: "Chalk & Table",
	description: "League Management System",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={`
						${leagueGothic.variable} 
						${encodeSans.variable} 
						${brawler.variable} 
						${redHatMono.variable} 
						h-full antialiased
					`}
			data-theme="green-dark"
		>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	);
}
