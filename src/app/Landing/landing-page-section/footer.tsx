import { Container } from "@/components/container";
import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

const contactInfo = [
  { icon: Phone, text: "+63 912 345 6789", href: "tel:+639123456789" },
  { icon: Mail, text: "hello@lakbay.com", href: "mailto:hello@lakbay.com" },
  { icon: MapPin, text: "Lipa City, Philippines" },
];

const Footer = () => {
  return (
    <footer className="bg-white text-black border-t border-gray-200 mt-10">
      <Container>
        {/* Main Footer Content */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            {/* Company Info */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-black mb-3">Lakbay</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Your trusted partner for car rentals across the Philippines.
              </p>

              {/* Contact Info */}
              <div className="space-y-2">
                {contactInfo.map((contact, index) => {
                  const IconComponent = contact.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center text-gray-600 text-sm"
                    >
                      <IconComponent className="w-4 h-4 mr-3" />
                      {contact.href ? (
                        <a
                          href={contact.href}
                          className="hover:text-black transition-colors duration-200"
                        >
                          {contact.text}
                        </a>
                      ) : (
                        <span>{contact.text}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h4 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">
                  Company
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-gray-600 hover:text-black transition-colors duration-200 text-sm"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-gray-600 hover:text-black transition-colors duration-200 text-sm"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">
                  Legal
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/Privacy-Policy"
                      className="text-gray-600 hover:text-black transition-colors duration-200 text-sm"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/Terms-and-Services"
                      className="text-gray-600 hover:text-black transition-colors duration-200 text-sm"
                    >
                      Terms and Services
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 py-4">
          <div className="text-center">
            <div className="text-gray-500 text-sm">
              © 2025 Lakbay. All rights reserved.
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
