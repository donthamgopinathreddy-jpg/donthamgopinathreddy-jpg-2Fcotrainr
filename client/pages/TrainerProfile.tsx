import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Check, MessageCircle, Calendar } from "lucide-react";

interface TrainerDetails {
  id: string;
  name: string;
  category: string;
  yearsOfExperience: number;
  rating: number;
  ratingCount: number;
  price: number;
  verified: boolean;
  bio: string;
  city: string;
  distance: number;
  avatar: string;
  gallery: string[];
  specialties: string[];
  totalSessions: number;
  certifications?: string[];
}

const MOCK_TRAINER: TrainerDetails = {
  id: "1",
  name: "Priya Singh",
  category: "Gym",
  yearsOfExperience: 5,
  rating: 4.8,
  ratingCount: 124,
  price: 500,
  verified: true,
  bio: "Certified fitness trainer specializing in strength training and muscle building. I focus on personalized workout plans tailored to each client's goals and fitness level.",
  city: "Mumbai",
  distance: 2.5,
  avatar: "PS",
  gallery: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1552672260-7bdde322fa4f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=400&h=400&fit=crop",
  ],
  specialties: ["Strength Training", "Muscle Building", "Weight Loss"],
  totalSessions: 245,
  certifications: [
    "Certified Personal Trainer (NASM)",
    "Strength and Conditioning Specialist",
    "Nutrition Certification",
  ],
};

const TIME_SLOTS = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
];

export default function TrainerProfile() {
  const navigate = useNavigate();
  const trainer = MOCK_TRAINER;
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedTime, setSelectedTime] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleTry10Min = () => {
    // Navigate to video call
    navigate(`/video/${trainer.id}`);
  };

  const handleBookSession = () => {
    if (!selectedTime) {
      alert("Please select a time slot");
      return;
    }
    alert(`Booked session for ${selectedDate} at ${selectedTime}`);
    setShowBookingModal(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto">
        {/* Header with Back Button */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold flex-1">Trainer Profile</h1>
        </div>

        {/* Profile Header Banner */}
        <div className="relative h-40 bg-gradient-primary overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="px-4 pb-6">
          {/* Avatar & Basic Info */}
          <div className="flex gap-4 items-start -mt-12 mb-6 relative z-10">
            <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center font-bold text-3xl text-gray-900 border-4 border-background">
              {trainer.avatar}
            </div>
            <div className="flex-1 pt-4">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-foreground">{trainer.name}</h2>
                {trainer.verified && (
                  <div className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span className="text-xs font-semibold">Verified</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {trainer.category} • {trainer.yearsOfExperience} years
              </p>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-bold">{trainer.rating}</span>
                  <span className="text-muted-foreground">({trainer.ratingCount})</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{trainer.distance} km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-card border border-border rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">{trainer.totalSessions}</div>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">₹{trainer.price}</div>
              <p className="text-xs text-muted-foreground">Per Session</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">{trainer.yearsOfExperience}+</div>
              <p className="text-xs text-muted-foreground">Years Exp.</p>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-foreground mb-2">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{trainer.bio}</p>
          </div>

          {/* Specialties */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-foreground mb-2">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {trainer.specialties.map((spec) => (
                <div
                  key={spec}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium"
                >
                  {spec}
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {trainer.certifications && trainer.certifications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-foreground mb-3">Certifications</h3>
              <div className="space-y-2">
                {trainer.certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm text-foreground">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-foreground mb-2">Gallery</h3>
            <div className="grid grid-cols-3 gap-2">
              {trainer.gallery.map((img, idx) => (
                <div
                  key={idx}
                  className="h-24 rounded-lg overflow-hidden border border-border"
                >
                  <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleTry10Min}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
            >
              <span>📹</span>
              Video Call
            </button>

            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all">
              <MessageCircle className="w-5 h-5" />
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
