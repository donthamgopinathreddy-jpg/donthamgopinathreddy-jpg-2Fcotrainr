import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Plus, X, Loader } from "lucide-react";
import GlassyTile from "@/components/GlassyTile";

interface TrainerFormData {
  fullName: string;
  phone: string;
  email: string;
  specialties: string[];
  bio: string;
  experience: string;
  certifications: File[];
  idProof: File | null;
  price: string;
  gallery: File[];
}

const SPECIALTY_OPTIONS = [
  "Gym",
  "Yoga",
  "CrossFit",
  "Boxing",
  "Zumba",
  "Swimming",
  "Pilates",
  "HIIT",
  "Aerobics",
  "Dance",
  "Martial Arts",
  "Cycling",
  "Running",
  "Stretching",
];

export default function TrainerSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<TrainerFormData>({
    fullName: "",
    phone: "",
    email: "",
    specialties: [],
    bio: "",
    experience: "",
    certifications: [],
    idProof: null,
    price: "",
    gallery: [],
  });

  const toggleSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const handleCertificationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, ...Array.from(e.target.files!)],
      }));
    }
  };

  const removeCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        gallery: [...prev.gallery, ...Array.from(e.target.files!)],
      }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const handleIDProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        idProof: e.target.files![0],
      }));
    }
  };

  const isStep1Complete = formData.fullName && formData.phone && formData.email;
  const isStep2Complete = formData.specialties.length > 0 && formData.bio && formData.experience;
  const isStep3Complete = formData.certifications.length > 0 && formData.idProof;

  const handleSubmit = () => {
    console.log("Trainer signup submitted:", formData);
    // TODO: Submit to backend
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Join as Trainer</h1>
        </div>

        {/* Progress Indicator */}
        <div className="px-4 py-6">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Step {step} of 3</p>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="px-4 pb-8 space-y-4">
            <h2 className="text-lg font-bold mb-4">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!isStep1Complete}
              className="w-full bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/30 transition-all mt-8"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2: Details & Specialties */}
        {step === 2 && (
          <div className="px-4 pb-8 space-y-4">
            <h2 className="text-lg font-bold mb-4">Expertise & Pricing</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Specialties</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTY_OPTIONS.map((specialty) => (
                  <button
                    key={specialty}
                    onClick={() => toggleSpecialty(specialty)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.specialties.includes(specialty)
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground hover:border-primary"
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio (Tell us about yourself)</label>
              <textarea
                placeholder="Share your experience, teaching style, and what makes you unique..."
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Years of Experience</label>
              <input
                type="number"
                placeholder="e.g., 5"
                value={formData.experience}
                onChange={(e) => setFormData((prev) => ({ ...prev, experience: e.target.value }))}
                className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gallery (Photos & Videos)</label>
              <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                <div className="text-center">
                  <Plus className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Upload Photos & Videos</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, MP4 up to 10MB each</p>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>

              {formData.gallery.length > 0 && (
                <div className="space-y-2 mt-3">
                  {formData.gallery.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <button
                        onClick={() => removeGalleryImage(idx)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-card border border-border text-foreground font-bold py-3 rounded-xl hover:bg-muted transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!isStep2Complete}
                className="flex-1 bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/30 transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Verification & Documents */}
        {step === 3 && (
          <div className="px-4 pb-8 space-y-4">
            <h2 className="text-lg font-bold mb-4">Verification & Documents</h2>

            <div>
              <label className="block text-sm font-medium mb-2">ID Proof (Required)</label>
              <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                <div className="text-center">
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Upload ID (Aadhar, PAN, Passport)</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleIDProofUpload}
                  className="hidden"
                />
              </label>
              {formData.idProof && (
                <p className="text-xs text-primary mt-2">✓ {formData.idProof.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Certifications</label>
              <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                <div className="text-center">
                  <Plus className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Upload Certifications</p>
                  <p className="text-xs text-muted-foreground">Multiple files allowed</p>
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleCertificationUpload}
                  className="hidden"
                />
              </label>

              {formData.certifications.length > 0 && (
                <div className="space-y-2 mt-3">
                  {formData.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
                      <p className="text-xs font-medium truncate">{cert.name}</p>
                      <button
                        onClick={() => removeCertification(idx)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-4 mt-6">
              <p className="text-xs text-muted-foreground">
                ✓ Your documents will be reviewed by our admin team within 24-48 hours. Once verified, you'll receive the Verified badge.
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-card border border-border text-foreground font-bold py-3 rounded-xl hover:bg-muted transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isStep3Complete}
                className="flex-1 bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/30 transition-all"
              >
                Submit Application
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
