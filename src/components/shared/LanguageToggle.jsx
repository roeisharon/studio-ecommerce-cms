import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const translations = {
  en: {
    // Navigation
    home: 'Home',
    bowls: 'Bowls',
    vases: 'Vases',
    mugs: 'Mugs',
    plates: 'Plates',
    about: 'About',
    blog: 'Blog',
    customOrder: 'Custom Order',
    cart: 'Cart',
    
    // Hero
    heroTitle: "Deborah's Ceramics Studio",
    heroSubtitle: 'Handcrafted with love',
    heroDescription: 'Each piece tells a story. Discover handmade ceramics crafted with traditional techniques and contemporary design, made to bring warmth to your everyday moments.',
    shopCollection: 'Shop Collection',
    ourStory: 'Our Story',
    
    // Common
    addToCart: 'Add to Cart',
    viewAll: 'View All',
    readMore: 'Read More',
    learnMore: 'Learn More',
    soldOut: 'Sold Out',
    inStock: 'In Stock',
    price: 'Price',
    search: 'Search',
    quantity: 'Quantity',
    backTo: 'Back to',
    
    // Footer
    shop: 'Shop',
    company: 'Company',
    contact: 'Contact',
    followUs: 'Follow Us',
    allRightsReserved: 'All rights reserved',
    
    // Featured
    featuredProducts: 'Featured Products',
    handpickedCollection: 'A handpicked selection of our finest ceramics',
    
    // Categories
    exploreCollections: 'Explore Our Collections',
    fromFunctionalToBowls: 'From serving dishes to everyday cereal bowls, each piece is crafted to hold nourishment beautifully.',
    statementPiecesVases: 'Statement pieces that transform any space with their organic forms and earthy glazes.',
    morningRitualsMugs: 'Morning rituals made special with our comfortable, perfectly sized mugs.',
    everydayElegancePlates: 'Everyday elegance for your table, from dinner plates to small appetizer dishes.'
  },
  he: {
    // Navigation
    home: 'בית',
    bowls: 'קערות',
    vases: 'אגרטלים',
    mugs: 'ספלים',
    plates: 'צלחות',
    about: 'אודות',
    blog: 'בלוג',
    customOrder: 'הזמנה אישית',
    cart: 'עגלה',
    
    // Hero
    heroTitle: 'סטודיו קרמיקה של דבורה',
    heroSubtitle: 'יצירה באהבה',
    heroDescription: 'כל יצירה מספרת סיפור. גלו קרמיקה בעבודת יד המשלבת טכניקות מסורתיות ועיצוב עכשווי, נוצרה להביא חום לרגעי היום יום שלכם.',
    shopCollection: 'לקולקציה',
    ourStory: 'הסיפור שלנו',
    
    // Common
    addToCart: 'הוסף לעגלה',
    viewAll: 'צפה בהכל',
    readMore: 'קרא עוד',
    learnMore: 'למד עוד',
    soldOut: 'אזל מהמלאי',
    inStock: 'במלאי',
    price: 'מחיר',
    search: 'חיפוש',
    quantity: 'כמות',
    backTo: 'חזרה ל',
    
    // Footer
    shop: 'חנות',
    company: 'החברה',
    contact: 'צור קשר',
    followUs: 'עקבו אחרינו',
    allRightsReserved: 'כל הזכויות שמורות',
    
    // Featured
    featuredProducts: 'מוצרים מומלצים',
    handpickedCollection: 'מבחר מיוחד מהקרמיקה המשובחת שלנו',
    
    // Categories
    exploreCollections: 'הקולקציות שלנו',
    fromFunctionalToBowls: 'מקערות הגשה ועד קערות יומיומיות, כל יצירה נוצרה להכיל תזונה בצורה יפה.',
    statementPiecesVases: 'יצירות מרשימות שמשנות כל חלל עם הצורות האורגניות והזיגוגים העפרתיים שלהן.',
    morningRitualsMugs: 'טקסי בוקר מיוחדים עם הספלים הנוחים והמדויקים שלנו.',
    everydayElegancePlates: 'אלגנטיות יומיומית לשולחן שלכם, מצלחות ארוחה ועד צלוחיות מנה.'
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('terra-language');
    if (saved && ['en', 'he'].includes(saved)) {
      setLanguage(saved);
      document.dir = saved === 'he' ? 'rtl' : 'ltr';
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'he' : 'en';
    setLanguage(newLang);
    localStorage.setItem('terra-language', newLang);
    document.dir = newLang === 'he' ? 'rtl' : 'ltr';
  };

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <motion.button
      onClick={toggleLanguage}
      className="fixed top-24 right-6 z-40 w-12 h-12 bg-white border-2 border-[#C4785A] text-[#C4785A] rounded-full shadow-lg flex items-center justify-center hover:bg-[#C4785A] hover:text-white transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex flex-col items-center justify-center">
        <Globe className="w-4 h-4" />
        <span className="text-xs font-bold mt-0.5">
          {language === 'en' ? 'HE' : 'EN'}
        </span>
      </div>
    </motion.button>
  );
}