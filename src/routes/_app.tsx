import { type PageProps } from "$fresh/server.ts"

export default function App({ Component }: PageProps) {
	return (
		<html>
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Quizizz nhưng nhanh hơn</title>
				<link rel="icon" href="/favicon.png" sizes="any" type="image/png" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
				<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
					rel="stylesheet" />
				<link rel="stylesheet" href="/styles.css" />
			</head>
			<body class="font-[Inter]">
				<Component />
			</body>
		</html>
	)
}
