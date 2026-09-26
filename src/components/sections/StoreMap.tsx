"use client";
import { motion } from "framer-motion";
import { useLocale } from "@/i18n/LocaleContext";
import { MapPin, Navigation } from "lucide-react";

interface StoreMapProps {
  mapCoordinates?: string;
  googleMapsUrl?: string;
  addressEn?: string;
  addressAr?: string;
}

export function StoreMap({ 
  mapCoordinates = "21.484635, 39.186066", 
  googleMapsUrl: customGoogleMapsUrl, 
  addressEn, 
  addressAr 
}: StoreMapProps) {
  const { t, locale, dir } = useLocale();
  const isRtl = dir === "rtl";

  const googleMapsUrl = customGoogleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${mapCoordinates}`;

  return (
    <section className="py-12 sm:py-24 bg-white overflow-hidden">
      <div className="w-[95%] sm:w-[90%] max-w-[2000px] mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-neutral-900 leading-tight">
                {t("findUs")}
              </h2>
              <div className="flex items-start gap-3 sm:gap-4 text-neutral-600">
                <div className="p-2 sm:p-3 bg-primary/10 rounded-xl sm:rounded-2xl text-primary mt-1">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-medium text-neutral-900 mb-1">
                    {t("storeAddress")}
                  </p>
                  <p className="text-sm sm:text-base text-neutral-500 leading-relaxed">
                    {locale === "ar" 
                      ? (addressAr || "شارع المكرونة، حي الربوة، جدة، المملكة العربية السعودية") 
                      : (addressEn || "Al Makarunah St, Ar Rabwah, Jeddah, Saudi Arabia")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold transition-all hover:bg-primary/90 hover:scale-[1.02] shadow-xl shadow-primary/20"
              >
                <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
                {t("getDirections")}
              </a>
            </div>
          </motion.div>

          {/* Map Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 sm:border-8 border-neutral-100 group"
          >
            <iframe
              title="Store Location Map"
              src={`https://maps.google.com/maps?q=${mapCoordinates}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
