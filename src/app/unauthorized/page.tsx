'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
	const router = useRouter();

	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold">Unauthorized</h1>
					<p className="text-muted-foreground">
						You don&apos;t have permission to access this page.
					</p>
				</div>
				<div className="flex gap-3 justify-center">
					<button
						className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
						onClick={() => router.back()}
					>
						Go Back
					</button>
					<Link
						href="/"
						className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
					>
						Home
					</Link>
				</div>
			</div>
		</div>
	);
}


