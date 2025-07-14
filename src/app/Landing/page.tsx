import React from "react";
import Navbar from "@/app/Landing/landing-page-section/navbar";
import Hero from "@/app/Landing/landing-page-section/hero";
import Showcase from "./landing-page-section/showcase";
import CarDeals from "./landing-page-section/cardeals";
import Footer from "./landing-page-section/footer";
const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Showcase />
      <CarDeals />
      <Footer />
    </>
  );
};

export default LandingPage;
