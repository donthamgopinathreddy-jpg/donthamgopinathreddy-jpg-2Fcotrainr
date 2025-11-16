import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Section {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  icon: string;
}

interface TrainingHubCarouselProps {
  sections: Section[];
  onSectionChange?: (index: number) => void;
}

export default function TrainingHubCarousel({
  sections,
  onSectionChange,
}: TrainingHubCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? sections.length - 1 : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === sections.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const currentSection = sections[currentIndex];

  return (
    <div className="w-full space-y-6">
      {/* Section Header */}
      <div className="text-center space-y-2">
        <div className="text-5xl">{currentSection.icon}</div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {currentSection.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {currentSection.description}
        </p>
      </div>

      {/* Content Section */}
      <div className="min-h-96">
        {currentSection.component}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={goToPrevious}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg transition-all hover:scale-110 active:scale-95"
          aria-label="Previous section"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="flex gap-2 flex-1 justify-center">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-orange-500 w-8"
                  : "bg-gray-300 dark:bg-gray-700 w-2 hover:bg-orange-400"
              }`}
              aria-label={`Go to section ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg transition-all hover:scale-110 active:scale-95"
          aria-label="Next section"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Section Counter */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        {currentIndex + 1} / {sections.length}
      </div>
    </div>
  );
}
