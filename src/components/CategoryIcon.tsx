import React from 'react';
import {
  Smartphone,
  Armchair,
  Shirt,
  Car,
  BookOpen,
  Gamepad2,
  Dumbbell,
  Package,
  LucideProps
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  category: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = "w-6 h-6", ...props }) => {
  const cat = category.toLowerCase();

  if (cat.includes('electr') || cat.includes('tech') || cat.includes('phone')) {
    return <Smartphone className={className} {...props} />;
  }
  if (cat.includes('furnit') || cat.includes('home') || cat.includes('decor')) {
    return <Armchair className={className} {...props} />;
  }
  if (cat.includes('cloth') || cat.includes('wear') || cat.includes('apparel') || cat.includes('fashion')) {
    return <Shirt className={className} {...props} />;
  }
  if (cat.includes('vehic') || cat.includes('car') || cat.includes('auto') || cat.includes('bike')) {
    return <Car className={className} {...props} />;
  }
  if (cat.includes('book') || cat.includes('read') || cat.includes('media')) {
    return <BookOpen className={className} {...props} />;
  }
  if (cat.includes('toy') || cat.includes('game')) {
    return <Gamepad2 className={className} {...props} />;
  }
  if (cat.includes('sport') || cat.includes('outdoor') || cat.includes('fit')) {
    return <Dumbbell className={className} {...props} />;
  }

  return <Package className={className} {...props} />;
};
