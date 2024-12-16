import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSession = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const hasVisited = localStorage.getItem('hasVisited');
      
      if (!hasVisited && !session) {
        localStorage.setItem('hasVisited', 'true');
        setIsFirstVisit(true);
      } else {
        setIsFirstVisit(false);
      }
    };

    checkSession();
  }, []);

  return { isFirstVisit };
};
