import { useState, useEffect } from "react";

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
  currentIndex?: number;
}

export default function TrainingHubCarousel({
  sections,
  onSectionChange,
  currentIndex: externalIndex,
}: TrainingHubCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(externalIndex || 0);

  useEffect(() => {
    if (externalIndex !== undefined) {
      setCurrentIndex(externalIndex);
    }
  }, [externalIndex]);

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
      <div className="min-h-96">{currentSection.component}</div>

      {/* Navigation Controls - Dots Only */}
      <div className="flex gap-2 justify-center">
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

      {/* Section Counter */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        {currentIndex + 1} / {sections.length}
      </div>
    </div>
  );
}
