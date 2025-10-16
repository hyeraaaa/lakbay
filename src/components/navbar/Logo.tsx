import Image from "next/image";

const Logo = () => {
  return (
    <div className="flex items-center space-x-1">
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
    </div>
  );
};

export default Logo;






