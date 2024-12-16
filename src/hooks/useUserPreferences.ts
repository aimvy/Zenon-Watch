import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AnimationTheme } from '../animations';

interface UserPreferences {
  isDark: boolean;
  showAnimation: boolean;
  animationTheme: AnimationTheme;
}

const STORAGE_KEY = 'zenon-watch-preferences';

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Charger les préférences au démarrage
  useEffect(() => {
    const loadPreferences = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Si l'utilisateur est connecté, charger depuis Supabase
        const { data } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (data) {
          setPreferences(data.preferences);
          setIsFirstVisit(false);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.preferences));
        } else {
          // Première connexion de l'utilisateur
          const defaultPrefs = {
            isDark: true,
            showAnimation: true,
            animationTheme: 'halos' as AnimationTheme
          };
          setPreferences(defaultPrefs);
          setIsFirstVisit(true);
          
          // Sauvegarder les préférences par défaut
          await supabase
            .from('user_preferences')
            .insert({
              user_id: session.user.id,
              preferences: defaultPrefs
            });
        }
      } else {
        // Si non connecté, utiliser le localStorage
        const savedPrefs = localStorage.getItem(STORAGE_KEY);
        if (savedPrefs) {
          setPreferences(JSON.parse(savedPrefs));
          setIsFirstVisit(false);
        } else {
          // Première visite
          const defaultPrefs = {
            isDark: true,
            showAnimation: true,
            animationTheme: 'halos' as AnimationTheme
          };
          setPreferences(defaultPrefs);
          setIsFirstVisit(true);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPrefs));
        }
      }
    };

    loadPreferences();
  }, []);

  // Sauvegarder les préférences
  const savePreferences = async (newPrefs: Partial<UserPreferences>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const updatedPrefs = { ...preferences, ...newPrefs };
    
    setPreferences(updatedPrefs);

    if (session) {
      // Si connecté, sauvegarder dans Supabase
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          preferences: updatedPrefs
        });
    }
    
    // Toujours sauvegarder localement
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrefs));
  };

  return {
    preferences,
    isFirstVisit,
    savePreferences
  };
};
