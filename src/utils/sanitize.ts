import DOMPurify from 'dompurify';

export const sanitizeHTML = (html: string): string => {
  // Configuration de base pour DOMPurify
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

  // Création d'un élément div temporaire pour manipuler le HTML
  const div = document.createElement('div');
  div.innerHTML = clean;

  // Ajout des attributs de sécurité à tous les liens
  div.querySelectorAll('a').forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  return div.innerHTML;
};
