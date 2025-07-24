import { useState } from 'react';

export const useSidebar = () => {
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const closeSidebar = () => setShowSidebar(false);
  const openSidebar = () => setShowSidebar(true);

  return {
    showSidebar,
    toggleSidebar,
    closeSidebar,
    openSidebar,
  };
};