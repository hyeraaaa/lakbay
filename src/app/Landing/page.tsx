import React, { Suspense } from "react";
import Hero from "@/app/Landing/landing-page-section/hero";
import Showcase from "./landing-page-section/showcase";
import CarDeals from "./landing-page-section/cardeals";
import Footer from "./landing-page-section/footer";
import Navbar from "@/components/navbar/navbar";
import ChatWidget from "@/components/chat/ChatWidget";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Showcase />
      <CarDeals />
      <Footer />
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
    </>
  );
};

export default LandingPage;
