'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
		<div className="absolute inset-0 opacity-5">
		  <div className="absolute top-20 left-20 w-32 h-32 border-2 border-black rotate-45"></div>
		  <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-black rotate-12"></div>
		  <div className="absolute top-1/2 left-10 w-16 h-16 border border-black rounded-full"></div>
		  <div className="absolute top-1/3 right-1/4 w-20 h-20 border border-black"></div>
		</div>
  
		<div className="max-w-lg w-full text-center space-y-8 relative z-10">
		  <div className="space-y-6">
			<div className="flex justify-center">
			  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
				<ShieldX className="w-10 h-10 text-white" />
			  </div>
			</div>
  
			<div className="space-y-3">
			  <h1 className="text-5xl font-bold text-black tracking-tight">403</h1>
			  <h2 className="text-2xl font-semibold text-black">Unauthorized Access</h2>
			  <div className="w-16 h-0.5 bg-black mx-auto"></div>
			  <p className="text-gray-600 text-lg leading-relaxed max-w-sm mx-auto">
				You don&apos;t have the necessary permissions to access this resource.
			  </p>
			</div>
		  </div>
  
		  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
			<Button
			  variant="outline"
			  size="lg"
			  onClick={() => router.back()}
			  className="gap-2"
			>
			  <ArrowLeft className="w-4 h-4" />
			  Go Back
			</Button>
			<Button
			  asChild
			  variant="default"
			  size="lg"
			  className="gap-2"
			>
			  <Link href="/">
				<Home className="w-4 h-4" />
				Return Home
			  </Link>
			</Button>
		  </div>
  
		  <div className="pt-8">
			<p className="text-xs text-gray-400 uppercase tracking-wider">Error Code: 403 Forbidden</p>
		  </div>
		</div>
	  </div>
	);
}


