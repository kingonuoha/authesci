// authesci-app/components/modules/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="d-footer">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="mb-0 text-neutral-600">&copy; 2024 Authesci. All Rights Reserved.</p>
        <p className="mb-0">Made by <a href="https://themeforest.net/user/wowtheme7/portfolio" className="text-primary-600 dark:text-primary-600 hover:underline">Authesci Team</a></p>
      </div>
    </footer>
  );
};

export default Footer;
