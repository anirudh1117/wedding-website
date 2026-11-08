"use client";

import { PERFORMANCE_CATEGORIES } from "@/lib/sangeet/constants";

interface PerformanceInfoFieldsProps {
  language: "en" | "hi";
  performanceTitle: string;
  performanceCategory: string;
  leadPerformer: string;
  contactNumber: string;
  onFieldChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

const categoryLabels = {
  en: {
    dance: "Dance",
    singing: "Singing",
    instrumental: "Instrumental",
    couple: "Couple Performance",
    family: "Family Performance",
    comedy: "Comedy / Skit",
    other: "Other",
  },
  hi: {
    dance: "नृत्य",
    singing: "गायन",
    instrumental: "वाद्य संगीत",
    couple: "दंपति प्रदर्शन",
    family: "पारिवारिक प्रदर्शन",
    comedy: "कॉमेडी / स्किट",
    other: "अन्य",
  },
};

export function PerformanceInfoFields({
  language,
  performanceTitle,
  performanceCategory,
  leadPerformer,
  contactNumber,
  onFieldChange,
  errors,
}: PerformanceInfoFieldsProps) {
  return (
    <div className="space-y-6 rounded-lg bg-white p-4 dark:bg-gray-800">
      {/* Performance Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
          {language === "en" ? "Performance Title" : "प्रस्तुति का शीर्षक"}
          <span className="ml-1 text-red-500">*</span>
        </label>
        <input
          type="text"
          value={performanceTitle}
          onChange={(e) =>
            onFieldChange("performanceTitle", e.target.value)
          }
          placeholder={language === "en" ? "e.g. Family Dance, Singing Performance" : "उदाहरण के लिए परिवार नृत्य, गायन प्रदर्शन"}
          className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          required
        />
        {errors.performanceTitle && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.performanceTitle}
          </p>
        )}
      </div>

      {/* Performance Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
          {language === "en" ? "Performance Category" : "प्रस्तुति की श्रेणी"}
          <span className="ml-1 text-red-500">*</span>
        </label>
        <select
          value={performanceCategory}
          onChange={(e) =>
            onFieldChange("performanceCategory", e.target.value)
          }
          className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          required
        >
          <option value="">
            {language === "en" ? "Select a category" : "एक श्रेणी चुनें"}
          </option>
          {PERFORMANCE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabels[language][cat]}
            </option>
          ))}
        </select>
        {errors.performanceCategory && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.performanceCategory}
          </p>
        )}
      </div>

      {/* Lead Performer */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
          {language === "en"
            ? "Lead Performer / Coordinator"
            : "मुख्य प्रदर्शनकारी / समन्वयक"}
          <span className="ml-1 text-red-500">*</span>
        </label>
        <input
          type="text"
          value={leadPerformer}
          onChange={(e) =>
            onFieldChange("leadPerformer", e.target.value)
          }
          className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          required
        />
        {errors.leadPerformer && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.leadPerformer}
          </p>
        )}
      </div>

      {/* Contact Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
          {language === "en"
            ? "Contact Number (+91 India)"
            : "संपर्क संख्या (+91 भारत)"}
          <span className="ml-1 text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={contactNumber}
          onChange={(e) =>
            onFieldChange("contactNumber", e.target.value)
          }
          placeholder={language === "en" ? "+91 9876543210 or 9876543210" : "+91 9876543210 या 9876543210"}
          className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          required
        />
        {errors.contactNumber && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.contactNumber}
          </p>
        )}
      </div>
    </div>
  );
}
