'use client'
import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Mock data for categories
const categories = [
  {
    id: 'beef-burgers',
    name: 'Beef Burgers',
    image: 'https://rsezoslpeirbbgwklnqa.supabase.co/storage/v1/object/public/menu-items/categories/Beef%20Burger.png',
  },
  {
    id: 'chicken-burgers',
    name: 'Chicken Burgers',
    image: 'https://rsezoslpeirbbgwklnqa.supabase.co/storage/v1/object/public/menu-items/categories/Chicken%20Burger.png',
  },
  {
    id: 'loaded-fries',
    name: 'Loaded Fries',
    image: 'https://rsezoslpeirbbgwklnqa.supabase.co/storage/v1/object/public/menu-items/categories/loaded%20fries.png',
  },
  {
    id: 'Drinks',
    name: 'Drinks',
    image: 'https://rsezoslpeirbbgwklnqa.supabase.co/storage/v1/object/public/menu-items/categories/drinks.png',
  },
  {
    id: 'Wings',
    name: 'wings',
    image: 'https://rsezoslpeirbbgwklnqa.supabase.co/storage/v1/object/public/menu-items/categories/strips%20and%20wings.png',
  },
  {
    id: 'veggies',
    name: 'Veggies',
    image: 'https://rsezoslpeirbbgwklnqa.supabase.co/storage/v1/object/public/menu-items/categories/veggies.png',
  },

  {
    id: 'Wraps',
    name: 'Wraps',
    image: 'https://rsezoslpeirbbgwklnqa.supabase.co/storage/v1/object/public/menu-items/categories/wrap.png',
  },
];

export function CategoryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
      if (dir === 'right') { 
        // If at (or near) end, go back to start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollTo({ left: scrollLeft + clientWidth, behavior: 'smooth' });
        }
      } else {
        scrollRef.current.scrollTo({ left: scrollLeft - clientWidth, behavior: 'smooth' });
      }
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      scroll('right');
    }, 1500);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);
  

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Explore Menu</h2>
        <Link href="/menu" className="text-red-600 font-semibold hover:underline text-sm">VIEW ALL</Link>
      </div>
      <div className="relative">
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-red-100 transition hidden sm:block"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-red-600" />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide py-2 px-1 mx-auto"
          style={{
            scrollSnapType: 'x mandatory',
            maxWidth: '1040px', // 4 cards * 250px + gap
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu#${cat.id}`}
              className="w-[240px] h-[300px] flex-shrink-0 rounded-2xl overflow-hidden relative group shadow-lg border-2 border-transparent hover:border-red-200 transition-all duration-200"
              style={{ scrollSnapAlign: 'start' }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 right-0 z-20 p-4 flex flex-col items-center">
                <div className="font-bold text-lg text-white mb-1 drop-shadow-lg">{cat.name}</div>
              </div>
            </Link>
          ))}
        </div>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-red-100 transition hidden sm:block"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-red-600" />
        </button>
      </div>
    </section>
  );
} 