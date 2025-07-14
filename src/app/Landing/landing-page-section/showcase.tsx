import { Container } from "@/components/container";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { Car, Calendar, CreditCard } from "lucide-react";

const showcaseItems = [
  {
    icon: Car,
    title: "Wide Vehicle Selection",
    description: "Choose from our extensive fleet of vehicles for every need",
    color: "blue",
  },
  {
    icon: Calendar,
    title: "Flexible Booking",
    description: "Book your rental with flexible dates and easy modifications",
    color: "orange",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Safe and secure payment options with transparent pricing",
    color: "green",
  },
];

const Showcase = () => {
  return (
    <Container className="py-10 sm:py-21">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
        {showcaseItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <CardContainer key={index} className="h-full">
              <CardBody className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-shadow duration-300 h-full">
                <CardItem translateZ="50px" className="w-full h-full">
                  <div className="flex flex-col items-center text-center h-full">
                    <div
                      className={`p-4 rounded-full bg-${item.color}-500/10 mb-4`}
                    >
                      <IconComponent
                        className={`w-8 h-8 text-${item.color}-500`}
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>
          );
        })}
      </div>
    </Container>
  );
};

export default Showcase;
