'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'fr';

const copy = {
  en: {
    welcome: 'Welcome', story: 'Our story', rsvp: 'RSVP', registry: 'Registry', moments: 'Moments', invitation: 'Invitation',
    language: 'Language', heroKicker: 'Two celebrations · One love story', heroText: 'Join us as we celebrate our traditional wedding in Abidjan and our white wedding in Cape Coast.',
    ourStory: 'Our story', storyTitle: '2 Kings 2:2 & A Little Persistence', watchFilm: 'Watch our film', videoSoon: 'Video coming soon',
    storyProse: 'Our journey began in August 2017 at an SU Camp at Ghana National Collage. Elisha, fresh off ministering with his rap group, struck up an argument over high schools with Olivia. Wanting to make a memorable impression, when Olivia asked for his name, Elisha smooth-talked his way through it: “Open your Bible to 2 Kings 2:2.”\n\nWhat started as a friendly rivalry quickly turned into hours-long phone chats, though life soon tested our timing. Between a broken phone, a trip across the border to Ivory Coast, and years of near-miss visits and persistent notes passed through mutual high school friends, we lost and re-found each other’s channels multiple times.\n\nIt wasn’t until university that our paths aligned for good. Elisha spotted Olivia in his hall, and what began as late-night catch-ups and deep conversations built a foundation of unwavering friendship. Through years of patience, personal growth, and grounded faith, “just friends” evolved into a partnership that pushed us both to be better.\n\nLooking back at every missed connection and every slip of paper that survived the years, we see God’s hand guiding our story. We can’t wait to start this next chapter together!',
    willYouJoin: 'Will you join us?', rsvpIntro: 'Please let {names} know which celebration(s) you can attend.', fullName: 'Full name *', email: 'Email *', attendance: 'Attendance *', guestCount: 'Number of guests (including you)', notes: 'Dietary needs or notes (optional)', sendRsvp: 'Send RSVP', sending: 'Sending…', chooseEvent: 'Please select which event(s) you will attend.', rsvpError: 'Failed to submit RSVP', thankYou: 'Thank you', thankYouNotice: 'Thank you for letting us know', declineMessage: "We’ll miss you there, but you’re always with us in spirit! 💛 If you’d still like to send some love our way, our registry would mean the world to us.", received: 'Your RSVP has been received. A confirmation email is on its way.', visitRegistry: 'Visit the registry', anotherResponse: 'Submit another response',
    traditionalOnly: 'Traditional wedding only (Abidjan)', whiteOnly: 'White wedding only (Cape Coast)', both: 'Both celebrations', unable: 'Unable to attend',
    weddingRegistry: 'Wedding registry', registryIntro: 'Your presence is the greatest gift. If you wish to honor us further, a monetary gift toward our new chapter would mean the world — use the details below for Ivory Coast or Ghana.', registryItems: 'Gift ideas', all: 'All', noItems: 'No items in this category yet.',
    mobileTransfers: 'Mobile money & transfers', bankAndMobile: 'Bank transfer & mobile money', bankTransfer: 'Bank transfer', accountName: 'Account name', bankName: 'Bank name', accountNumber: 'Account number', swiftCode: 'Swift code', bankAddress: 'Bank address', tapToCopy: 'Tap any number to copy',
    photosFilms: 'Photos & films', momentsIntro: 'A curated gallery of our favorite memories — stills and short films.', close: 'Close', previous: 'Previous', next: 'Next', of: 'of',
    days: 'Days', hrs: 'Hrs', min: 'Min', sec: 'Sec', traditionalWedding: 'Traditional Wedding', whiteWedding: 'White Wedding', timeTbc: 'Time TBC',
    raised: 'raised', funded: 'funded', contributions: 'contributions', beFirst: 'Be the first!', contributed: 'people have contributed', openContributions: 'Open for contributions', contribute: 'Contribute',
  },
  fr: {
    welcome: 'Accueil', story: 'Notre histoire', rsvp: 'RSVP', registry: 'Liste de mariage', moments: 'Moments', invitation: 'Invitation',
    language: 'Langue', heroKicker: 'Deux célébrations · Une histoire d’amour', heroText: 'Rejoignez-nous pour célébrer notre mariage traditionnel à Abidjan et notre mariage blanc à Cape Coast.',
    ourStory: 'Notre histoire', storyTitle: '2 Rois 2:2 & un peu de persévérance', watchFilm: 'Regardez notre film', videoSoon: 'Vidéo bientôt disponible',
    storyProse: 'Notre histoire a commencé en août 2017, lors d’un camp de ligue pour la lecture de la bible au Ghana National College. Elisha, qui venait tout juste de prestés avec son groupe de rap, s’est mis à débattre avec Olivia au sujet de leurs lycées. Désireux de faire une impression mémorable, lorsqu’Olivia lui a demandé son prénom, Elisha a trouvé une façon rusé de le lui révéler : « Ouvre ta Bible à 2 Rois 2:2. »\n\nCe qui n’était au départ qu’une rivalité amicale s’est rapidement transformé en longues conversations téléphoniques, mais la vie a vite mis notre timing à l’épreuve. Entre un téléphone abîmé, un voyage de l’autre côté de la frontière en Côte d’Ivoire, des visites qui se manquaient de peu et des petits mots persévérants transmis par des amis communs du lycée, nous avons perdu puis retrouvé nos moyens de nous joindre à plusieurs reprises.\n\nCe n’est qu’à l’université que nos chemins se sont enfin alignés. Elisha a aperçu Olivia dans sa résidence universitaire, et ce qui a commencé par des retrouvailles et de profondes conversations a bâti les fondations d’une amitié indéfectible. Au fil des années, entre patience, épanouissement personnel et foi solide, « juste amis » est devenu un partenariat qui nous a poussés l’un comme l’autre à devenir meilleurs.\n\nEn repensant à chaque contact manqué et à chaque petit bout de papier qui a traversé les années, nous voyons la main de Dieu guider notre histoire. Nous avons hâte de commencer ce nouveau chapitre ensemble !',
    willYouJoin: 'Serez-vous des nôtres ?', rsvpIntro: 'Merci d’indiquer à {names} à quelle(s) célébration(s) vous pourrez participer.', fullName: 'Nom complet *', email: 'E-mail *', attendance: 'Présence *', guestCount: 'Nombre d’invités (vous compris)', notes: 'Régime alimentaire ou remarques (facultatif)', sendRsvp: 'Envoyer le RSVP', sending: 'Envoi…', chooseEvent: 'Veuillez sélectionner la ou les célébrations auxquelles vous participerez.', rsvpError: 'Impossible d’envoyer le RSVP', thankYou: 'Merci', thankYouNotice: 'Merci de nous avoir prévenus', declineMessage: 'Votre présence nous manquera, mais vous serez toujours avec nous par la pensée ! 💛 Si vous souhaitez tout de même nous témoigner votre affection, notre liste de mariage nous toucherait beaucoup.', received: 'Votre RSVP a bien été reçu. Un e-mail de confirmation arrive bientôt.', visitRegistry: 'Voir la liste de mariage', anotherResponse: 'Envoyer une autre réponse',
    traditionalOnly: 'Mariage traditionnel uniquement (Abidjan)', whiteOnly: 'Mariage blanc uniquement (Cape Coast)', both: 'Les deux célébrations', unable: 'Ne pourra pas venir',
    weddingRegistry: 'Liste de mariage', registryIntro: 'Votre présence est le plus beau des cadeaux. Si vous souhaitez nous honorer davantage, un cadeau monétaire pour notre nouveau chapitre nous toucherait beaucoup — utilisez les coordonnées ci-dessous pour la Côte d’Ivoire ou le Ghana.', registryItems: 'Idées cadeaux', all: 'Tout', noItems: 'Aucun article dans cette catégorie pour le moment.',
    mobileTransfers: 'Mobile money et transferts', bankAndMobile: 'Virement bancaire et mobile money', bankTransfer: 'Virement bancaire', accountName: 'Nom du compte', bankName: 'Banque', accountNumber: 'Numéro de compte', swiftCode: 'Code Swift', bankAddress: 'Adresse de la banque', tapToCopy: 'Touchez un numéro pour le copier',
    photosFilms: 'Photos et films', momentsIntro: 'Une galerie de nos souvenirs préférés — photos et courts films.', close: 'Fermer', previous: 'Précédent', next: 'Suivant', of: 'sur',
    days: 'Jours', hrs: 'H', min: 'Min', sec: 'Sec', traditionalWedding: 'Mariage traditionnel', whiteWedding: 'Mariage blanc', timeTbc: 'Heure à confirmer',
    raised: 'collectés', funded: 'financé', contributions: 'contributions', beFirst: 'Soyez le premier !', contributed: 'personnes ont contribué', openContributions: 'Contributions ouvertes', contribute: 'Contribuer',
  },
} as const;

type CopyKey = keyof typeof copy.en;
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: CopyKey) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    return window.localStorage.getItem('wedding-language') === 'fr' ? 'fr' : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem('wedding-language', language);
  }, [language]);

  return <LanguageContext.Provider value={{ language, setLanguage, t: (key) => copy[language][key] }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
