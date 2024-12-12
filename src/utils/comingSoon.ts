export const getComingSoonMessage = (feature: string): string => {
  const messages = [
    `Hey there! 👋 I'm currently working on the ${feature} feature. It's going to be amazing! Stay tuned!`,
    `Exciting news! The ${feature} feature is under development. I can't wait to share it with you soon! 🚀`,
    `The ${feature} feature is coming soon! I'm putting my heart into making it perfect for you. ✨`,
    `Working hard on the ${feature} feature! It's going to be worth the wait, I promise! 🌟`,
    `The ${feature} is almost ready! Just adding some final touches to make it awesome! 🎨`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};
