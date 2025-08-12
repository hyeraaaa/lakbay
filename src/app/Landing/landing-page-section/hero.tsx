import { Container } from "@/components/container";
import Searchbar from "@/components/searchbar";

const Hero = () => {
  return (
    <>
      <section className="bg-[#eff3f6] h-auto md:h-[450px] rounded-lg mx-5 flex items-center">
        <Container className="flex flex-col items-center justify-center py-5">
          <div className="flex flex-col items-center justify-center">
            <h1 className="font-thin tracking-wider text-center px-4" style={{ fontSize: 'clamp(1.875rem, 4vw, 3.75rem)' }}>
              Start your Journey with Lakbay
            </h1>
            <p className="text-gray-600 mt-3 tracking-wider text-center px-4" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
              Find the perfect car for your next adventure
            </p>
            <Searchbar className="mt-5" />
          </div>
        </Container>
      </section>
    </>
  );
};

export default Hero;
