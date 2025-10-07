import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Code */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
          <div className="w-24 h-1 bg-gray-700 dark:bg-gray-300 mx-auto rounded-full"></div>
        </div>

        {/* Gorilla Image */}
        <div className="mb-8 relative">
          {/* <div className="relative w-80 h-80 mx-auto rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/gorilla-404.jpeg"
              alt="Frustrated gorilla giving the finger"
              fill
              className="object-cover grayscale"
              priority
            />
          </div> */}
          <div className="absolute -top-4 -right-4 bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold transform rotate-12">
            Oops!
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-balance">Well, this is awkward...</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 text-pretty max-w-md mx-auto">
            The page you&apos;re looking for seems to have gone bananas. Even our gorilla friend here is not impressed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="bg-black hover:bg-gray-800 text-white">
            <Link href="/">Go Back Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-black text-black dark:border-gray-200 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Link href="/contact">Report Issue</Link>
          </Button>
        </div>

        {/* Fun Fact */}
        <div className="mt-12 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Fun fact:</span> Gorillas are actually quite gentle creatures, unlike this
            404 error that&apos;s being a bit rude right now.
          </p>
        </div>
      </div>
    </div>
  )
}
