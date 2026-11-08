import { REGISTRATION_MAX_GUESTS } from "@/lib/registration/constants";
import type { AppLanguage } from "@/lib/i18n/app-language";

export type { AppLanguage } from "@/lib/i18n/app-language";

type RegistrationCopy = {
  page: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    changeLanguage: string;
  };
  selector: {
    headingHi: string;
    headingEn: string;
    hindi: string;
    english: string;
  };
  party: {
    label: string;
    bride: string;
    groom: string;
    brideReview: string;
    groomReview: string;
  };
  contact: {
    label: string;
    placeholder: string;
  };
  guests: {
    heading: string;
    add: string;
    remove: string;
    maxHint: string;
    guestLabel: string;
    nameLabel: string;
    namePlaceholder: string;
    aadhaarLabel: string;
    fileHint: string;
    chooseFile: string;
    selectedFilePrefix: string;
    noneSelected: string;
  };
  familyName: {
    label: string;
    placeholder: string;
  };
  consent: {
    text: string;
  };
  review: {
    heading: string;
    party: string;
    familyName: string;
    contactNumber: string;
    guests: string;
    notSelected: string;
    notProvided: string;
    namePending: string;
    documentPrefix: string;
  };
  submit: {
    idle: string;
    pending: string;
    success: string;
    genericError: string;
    networkError: string;
    keyError: string;
    documentError: string;
    consentError: string;
  };
  validation: {
    weddingPartyRequired: string;
    guestNameRequired: string;
    guestNameTooLong: string;
    contactRequired: string;
    contactInvalid: string;
    atLeastOneGuest: string;
    guestLimit: string;
    familyNameRequired: string;
    familyNameTooLong: string;
    consentRequired: string;
    fileRequired: string;
    fileSize: string;
    fileType: string;
    fileMetadata: string;
    invalidRequest: string;
  };
};

export const registrationCopy: Record<AppLanguage, RegistrationCopy> = {
  hi: {
    page: {
      eyebrow: "स्नेह सहित",
      heading: "आपके आगमन की प्रतीक्षा रहेगी",
      subtitle:
        "कृपया अपने परिवार के सदस्यों का विवरण साझा करें, ताकि हम आपके ठहरने और समारोहों की बेहतर व्यवस्था कर सकें।",
      changeLanguage: "भाषा बदलें",
    },
    selector: {
      headingHi: "अपनी भाषा चुनें",
      headingEn: "Choose your preferred language",
      hindi: "हिन्दी",
      english: "English",
    },
    party: {
      label: "आप किस पक्ष से हैं?",
      bride: "लड़की वाले",
      groom: "लड़के वाले",
      brideReview: "लड़की वाले",
      groomReview: "लड़के वाले",
    },
    contact: {
      label: "परिवार का मुख्य संपर्क नंबर",
      placeholder: "9XXXXXXXXX",
    },
    guests: {
      heading: "अतिथियों का विवरण",
      add: "अतिथि जोड़ें",
      remove: "हटाएँ",
      maxHint: `अधिकतम ${REGISTRATION_MAX_GUESTS} अतिथि प्रति परिवार।`,
      guestLabel: "अतिथि",
      nameLabel: "अतिथि का पूरा नाम",
      namePlaceholder: "अतिथि का नाम लिखें",
      aadhaarLabel: "आधार दस्तावेज़",
      fileHint: "JPG, PNG, PDF • अधिकतम 5 MB",
      chooseFile: "फ़ाइल चुनें",
      selectedFilePrefix: "चुनी गई फ़ाइल",
      noneSelected: "कोई फाइल नहीं चुनी गई",
    },
    familyName: {
      label: "परिवार का नाम",
      placeholder: "अपना परिवार का नाम लिखें",
    },
    consent: {
      text: "मैं पुष्टि करता/करती हूँ कि मुझे इन मेहमानों की ओर से विवरण और दस्तावेज़ जमा करने की अनुमति है तथा होटल में पहचान सत्यापन के इस उद्देश्य के लिए इन्हें साझा करने की सहमति प्राप्त है।",
    },
    review: {
      heading: "पुनरावलोकन",
      party: "पक्ष",
      familyName: "परिवार का नाम",
      contactNumber: "संपर्क नंबर",
      guests: "अतिथि",
      notSelected: "अभी चुना नहीं गया",
      notProvided: "दर्ज नहीं किया गया",
      namePending: "नाम प्रतीक्षा में",
      documentPrefix: "दस्तावेज़",
    },
    submit: {
      idle: "पंजीकरण भेजें",
      pending: "पंजीकरण जमा किया जा रहा है...",
      success: "आपका पंजीकरण सफलतापूर्वक प्राप्त हो गया है।",
      genericError: "पंजीकरण भेजा नहीं जा सका। कृपया पुनः प्रयास करें।",
      networkError: "पंजीकरण सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।",
      keyError: "सार्वजनिक एन्क्रिप्शन कुंजी वर्तमान में उपलब्ध नहीं है।",
      documentError: "कृपया अतिथि दस्तावेज़ त्रुटियाँ ठीक करें और पुनः प्रयास करें।",
      consentError: "कृपया पुष्टि करें कि आप इन दस्तावेज़ों को अपलोड करने के लिए अधिकृत हैं।",
    },
    validation: {
      weddingPartyRequired: "कृपया एक पक्ष चुनें।",
      guestNameRequired: "अतिथि का नाम आवश्यक है।",
      guestNameTooLong: "अतिथि का नाम बहुत लंबा है।",
      contactRequired: "परिवार का मुख्य संपर्क नंबर आवश्यक है।",
      contactInvalid: "कृपया वैध भारतीय मोबाइल नंबर दर्ज करें।",
      atLeastOneGuest: "कम से कम एक अतिथि आवश्यक है।",
      guestLimit: `अधिकतम ${REGISTRATION_MAX_GUESTS} अतिथि ही जोड़ सकते हैं।`,
      familyNameRequired: "परिवार का नाम आवश्यक है।",
      familyNameTooLong: "परिवार का नाम बहुत लंबा है।",
      consentRequired: "सबमिट करने से पहले सहमति आवश्यक है।",
      fileRequired: "आधार दस्तावेज़ आवश्यक है।",
      fileSize: "दस्तावेज़ 5 MB सीमा से बड़ा है।",
      fileType: "असमर्थित फाइल प्रकार। JPG, PNG या PDF का उपयोग करें।",
      fileMetadata: "असमर्थित दस्तावेज़ प्रारूप। JPG, PNG या PDF का उपयोग करें।",
      invalidRequest: "अमान्य अनुरोध।",
    },
  },
  en: {
    page: {
      eyebrow: "WITH LOVE",
      heading: "We Look Forward to Celebrating With You",
      subtitle:
        "Share a few details about your family so we can make your stay and celebrations comfortable.",
      changeLanguage: "Change Language",
    },
    selector: {
      headingHi: "अपनी भाषा चुनें",
      headingEn: "Choose your preferred language",
      hindi: "हिन्दी",
      english: "English",
    },
    party: {
      label: "Which side are you from?",
      bride: "Bride's Side",
      groom: "Groom's Side",
      brideReview: "Bride's Side",
      groomReview: "Groom's Side",
    },
    contact: {
      label: "Primary contact number",
      placeholder: "9XXXXXXXXX",
    },
    guests: {
      heading: "Guest Details",
      add: "Add Guest",
      remove: "Remove",
      maxHint: `Maximum ${REGISTRATION_MAX_GUESTS} guests per family.`,
      guestLabel: "Guest",
      nameLabel: "Guest Full Name",
      namePlaceholder: "Enter guest name",
      aadhaarLabel: "Aadhaar Document",
      fileHint: "JPG, PNG, PDF up to 5 MB",
      chooseFile: "Choose file",
      selectedFilePrefix: "Selected file",
      noneSelected: "No file selected",
    },
    familyName: {
      label: "FAMILY NAME",
      placeholder: "Enter family name",
    },
    consent: {
      text: "I confirm that I am authorized to submit these guest details and documents for hotel identity verification, and I have consent to share them for this purpose.",
    },
    review: {
      heading: "Review Before Submission",
      party: "Party",
      familyName: "Family Name",
      contactNumber: "Contact Number",
      guests: "Guests",
      notSelected: "Not selected",
      notProvided: "Not provided",
      namePending: "Name pending",
      documentPrefix: "Document",
    },
    submit: {
      idle: "Submit Registration",
      pending: "Submitting registration...",
      success: "Registration received successfully.",
      genericError: "Registration could not be submitted. Please retry.",
      networkError: "Unable to reach the registration server. Please try again.",
      keyError: "Public encryption keys are currently unavailable.",
      documentError: "Please fix guest document errors before submission.",
      consentError: "Please confirm you are authorized to upload these guest documents.",
    },
    validation: {
      weddingPartyRequired: "Please select a wedding party.",
      guestNameRequired: "Guest full name is required.",
      guestNameTooLong: "Guest full name is too long.",
      contactRequired: "Primary contact number is required.",
      contactInvalid: "Enter a valid Indian mobile number.",
      atLeastOneGuest: "At least one guest is required.",
      guestLimit: `You can add up to ${REGISTRATION_MAX_GUESTS} guests.`,
      familyNameRequired: "Family name is required.",
      familyNameTooLong: "Family name is too long.",
      consentRequired: "Consent confirmation is required before submitting.",
      fileRequired: "Aadhaar document is required.",
      fileSize: "Document exceeds 5 MB limit.",
      fileType: "Unsupported file type. Use JPG, PNG, or PDF.",
      fileMetadata: "Unsupported file metadata. Use JPG, PNG, or PDF.",
      invalidRequest: "Invalid request body.",
    },
  },
};

const messageKeyMap: Record<string, keyof RegistrationCopy["validation"]> = {
  "Please select a wedding party.": "weddingPartyRequired",
  "Guest full name is required.": "guestNameRequired",
  "Guest full name is too long.": "guestNameTooLong",
  "Primary contact number is required.": "contactRequired",
  "Enter a valid Indian mobile number.": "contactInvalid",
  "At least one guest is required.": "atLeastOneGuest",
  "Family name is required.": "familyNameRequired",
  "Family name is too long.": "familyNameTooLong",
  "Please confirm that you are authorized to upload these guest documents.": "consentRequired",
  "Consent confirmation is required before submitting documents.": "consentRequired",
  "Invalid request body.": "invalidRequest",
};

export function pickLocalizedText(message: string, language: AppLanguage): string {
  const parts = message.split(" / ");
  if (parts.length === 2) {
    return language === "hi" ? parts[0].trim() : parts[1].trim();
  }

  const key = messageKeyMap[message];
  if (key) {
    return registrationCopy[language].validation[key];
  }

  return message;
}
