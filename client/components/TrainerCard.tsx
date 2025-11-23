import React from "react";
import { Star, MapPin, Award } from "lucide-react";
import VibrancyCard from "./VibrancyCard";

interface TrainerCardProps {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  location?: string;
  price?: number;
  image?: string;
  verified?: boolean;
  badge?: string;
  onClick?: () => void;
}

export default function TrainerCard({
  id,
  name,
  specialty,
  rating,
  location,
  price,
  image,
  verified,
  badge,
  onClick,
}: TrainerCardProps) {
  const gradients: ("orange" | "purple" | "blue" | "green" | "pink")[] = [
    "orange",
    "purple",
    "blue",
    "green",
    "pink",
  ];
  const gradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <VibrancyCard
      gradient={gradient}
      shadow="medium"
      animate={true}
      clickable={true}
      onClick={onClick}
      className="cursor-pointer overflow-hidden"
    >
      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-2xl overflow-hidden flex-shrink-0">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{name.charAt(0)}</span>
              )}
            </div>
            {verified && (
              <div className="absolute -bottom-1 -right-1 bg-green-400 rounded-full p-1">
                <Award size={12} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg">{name}</h3>
              <p className="text-sm opacity-90">{specialty}</p>
            </div>
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-yellow-300 text-yellow-300" />
              <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          {location && (
            <div className="flex items-center gap-2 opacity-90">
              <MapPin size={14} />
              <span>{location}</span>
            </div>
          )}
          {price && (
            <p className="font-semibold">
              ₹{price}
              <span className="text-xs opacity-75 ml-1">/session</span>
            </p>
          )}
        </div>

        {badge && (
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold inline-block">
            {badge}
          </div>
        )}
      </div>
    </VibrancyCard>
  );
}
