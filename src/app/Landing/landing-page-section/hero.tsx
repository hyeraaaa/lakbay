import { Container } from "@/components/container";
import Searchbar from "@/components/searchbar";

const Hero = () => {
  return (
    <>
      <section className="bg-[#eff3f6] h-auto md:h-[450px] rounded-lg mx-5 flex items-center">
        <Container className="flex flex-col items-center justify-center py-5">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-6xl font-thin tracking-wider">
              Start your Journey with Lakbay
            </h1>
            <p className="text-gray-600 mt-3 text-xl tracking-wider">
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
