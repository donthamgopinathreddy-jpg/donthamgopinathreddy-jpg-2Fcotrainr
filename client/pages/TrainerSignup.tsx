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
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const uploadFile = async (file: File, bucket: string, path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);

      return publicUrl;
    } catch (err) {
      console.error(`Error uploading file to ${bucket}:`, err);
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (!userProfile) {
      toast({
        title: "Error",
        description: "You must be logged in to become a trainer",
        variant: "destructive",
      });
      return;
    }

    if (!userProfile.id) {
      toast({
        title: "Error",
        description: "User ID is missing. Please refresh and try again.",
        variant: "destructive",
      });
      console.error("User profile missing ID:", userProfile);
      return;
    }

    setIsSubmitting(true);

    try {
      // Verify user is authenticated
      console.log("Verifying authentication...");
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        throw new Error("Authentication failed. Please log in again.");
      }
      console.log("Authentication verified for user:", authUser.id);

      // 1. Update user role to trainer
      console.log("Updating user role to trainer for user:", userProfile.id);
      const { error: roleError } = await supabase
        .from("users")
        .update({ role: "trainer" })
        .eq("id", userProfile.id);

      if (roleError) {
        console.error("Role update error:", roleError);
        throw new Error(`Failed to update role: ${roleError.message}`);
      }
      console.log("Role updated successfully");

      // 2. Upload ID proof if exists
      let idDocUrl = null;
      if (formData.idProof) {
        try {
          console.log("Uploading ID document...");
          const fileName = `${userProfile.id}/id_${Date.now()}.${formData.idProof.name.split(".").pop()}`;
          idDocUrl = await uploadFile(
            formData.idProof,
            "trainer-documents",
            fileName,
          );
          console.log("ID document uploaded:", idDocUrl);
        } catch (err) {
          console.warn("Warning: Error uploading ID document:", err);
          // Continue without ID document URL
        }
      }

      // 3. Upload first certification if exists
      let certUrl = null;
      if (formData.certifications.length > 0) {
        try {
          console.log("Uploading certification...");
          const cert = formData.certifications[0];
          const fileName = `${userProfile.id}/cert_${Date.now()}.${cert.name.split(".").pop()}`;
          certUrl = await uploadFile(cert, "trainer-documents", fileName);
          console.log("Certification uploaded:", certUrl);
        } catch (err) {
          console.warn("Warning: Error uploading certification:", err);
          // Continue without certification URL
        }
      }

      // 4. Create trainer verification record
      console.log("Creating trainer verification record...", {
        user_id: userProfile.id,
        id_document_url: idDocUrl,
        certificate_url: certUrl,
        verification_status: "pending",
      });

      const { data, error: verificationError } = await supabase
        .from("trainer_verifications")
        .insert({
          user_id: userProfile.id,
          id_document_url: idDocUrl,
          certificate_url: certUrl,
          verification_status: "pending",
          submitted_at: new Date().toISOString(),
        })
        .select();

      if (verificationError) {
        console.error("Verification insert error:", verificationError);
        throw new Error(`Failed to create verification record: ${verificationError.message}`);
      }

      console.log("Trainer verification record created:", data);

      toast({
        title: "Success",
        description:
          "Your trainer application has been submitted! Please wait for admin verification.",
      });

      // Navigate to profile after successful submission
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      console.error("Error submitting trainer signup:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to submit trainer application";
      console.error("Full error details:", err);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                disabled={isSubmitting}
                className="flex-1 bg-card border border-border text-foreground font-bold py-3 rounded-xl hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isStep3Complete || isSubmitting}
                className="flex-1 bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
