import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity">
      <Image
        src="/logo.png"
        alt="lakbay"
        width={48}
        height={48}
        className="h-12 w-12 object-contain"
        priority
      />
      <span className="text-2xl text-primary font-medium tracking-[.1em] lg:block hidden">
        Lakbay
      </span>
    </Link>
  );
};

export default Logo;






