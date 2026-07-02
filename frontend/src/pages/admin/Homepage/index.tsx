// src/pages/admin/Homepage/index.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HeroSlides from './HeroSlides';
import HeroSlideForm from './HeroSlideForm';

const HomepageManagement: React.FC = () => {
  return (
    <Routes>
      <Route index element={<HeroSlides />} />
      <Route path="hero-slides/create" element={<HeroSlideForm />} />
      <Route path="hero-slides/edit/:id" element={<HeroSlideForm />} />
    </Routes>
  );
};

export default HomepageManagement;