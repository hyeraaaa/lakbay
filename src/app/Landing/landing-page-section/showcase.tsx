import { Container } from "@/components/container";
// Removed 3D card components in favor of standard elements
import { Car, Calendar, CreditCard } from "lucide-react";

const showcaseItems = [
  {
    icon: Car,
    title: "Wide Vehicle Selection",
    description: "Choose from our extensive fleet of vehicles for every need",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-500",
  },
  {
    icon: Calendar,
    title: "Reliable Booking",
    description: "Fixed schedules ensure conflict-free reservations; modifications are not allowed.",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-500",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Safe and secure payment options with transparent pricing",
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
  },
];

const Showcase = () => {
  return (
    <Container className="py-10 sm:py-21">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
        {showcaseItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="h-full">
              <div className="bg-white/5 rounded-lg p-6 border border-border h-full">
                <div className="w-full h-full">
                  <div className="flex flex-col items-center text-center h-full">
                    <div
                      className={`p-4 rounded-full ${item.bgColor} mb-4`}
                    >
                      <IconComponent
                        className={`w-8 h-8 ${item.textColor}`}
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export default Showcase;
