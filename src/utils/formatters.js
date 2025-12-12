// Fonctions de formatage réutilisables
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || phoneNumber === 'Non spécifié') {
    return 'Non spécifié';
  }
  
  const cleaned = phoneNumber.toString().replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    const visiblePart = cleaned.substring(0, 6);
    const maskedPart = '****';
    return `${visiblePart.substring(0, 3)} ${visiblePart.substring(3)} ${maskedPart}`;
  }
  
  if (cleaned.length === 9) {
    const visiblePart = cleaned.substring(0, 5);
    const maskedPart = '****';
    return `0${visiblePart.substring(0, 2)} ${visiblePart.substring(2)} ${maskedPart}`;
  }
  
  if (cleaned.length > 4) {
    const visiblePart = cleaned.substring(0, cleaned.length - 4);
    const maskedPart = '****';
    
    let formatted = '';
    for (let i = 0; i < visiblePart.length; i++) {
      if (i > 0 && i % 3 === 0) {
        formatted += ' ';
      }
      formatted += visiblePart[i];
    }
    
    return `${formatted} ${maskedPart}`;
  }
  
  return phoneNumber;
};

export const formatName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return '';
  
  const cleanName = fullName.trim().replace(/\s+/g, ' ');
  
  const particules = ['de', 'du', 'des', 'le', 'la', 'van', 'von', 'di', 'da', 'del', 'della'];
  
  const words = cleanName.split(' ');
  
  const formattedWords = words.map((word, index) => {
    if (!word) return '';
    
    const lowerWord = word.toLowerCase();
    
    if (index > 0 && particules.includes(lowerWord)) {
      return lowerWord;
    }
    
    if (word.includes('-')) {
      const hyphenParts = word.split('-');
      const formattedHyphenParts = hyphenParts.map(part => {
        const lowerPart = part.toLowerCase();
        return lowerPart.charAt(0).toUpperCase() + lowerPart.slice(1);
      });
      return formattedHyphenParts.join('-');
    }
    
    return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
  });
  
  return formattedWords.filter(word => word !== '').join(' ');
};