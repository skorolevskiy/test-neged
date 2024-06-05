import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<style>{`
					a {
						color: #fff;
					}
					`}</style>
			</head>
			<body>
				{children}
				<Analytics />
			</body>
		</html>
	);
}
