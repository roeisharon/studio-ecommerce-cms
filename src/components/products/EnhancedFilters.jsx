import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function EnhancedFilters({ search, setSearch, priceRange, setPriceRange, sortBy, setSortBy, inStock, setInStock }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const clearFilters = () => { setSearch(''); setPriceRange([0, 500]); setSortBy('newest'); setInStock(false); };
  return (
    <div className="mb-8 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-full border-gray-300" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="rounded-full"><SlidersHorizontal className="w-4 h-4 mr-2" />Filters</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader><SheetTitle>Filter Products</SheetTitle><SheetDescription>Refine your search</SheetDescription></SheetHeader>
            <div className="mt-8 space-y-8">
              <div>
                <Label className="mb-4 block">Price Range: ${priceRange[0]} – ${priceRange[1]}</Label>
                <Slider value={priceRange} onValueChange={setPriceRange} max={500} step={10} className="mt-2" />
              </div>
              <div>
                <Label className="mb-3 block">Sort By</Label>
                <div className="space-y-2">
                  {[['newest','Newest First'],['price_low','Price: Low to High'],['price_high','Price: High to Low'],['name','Name: A to Z']].map(([v,l]) => (
                    <button key={v} onClick={() => setSortBy(v)} className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${sortBy === v ? 'bg-[#C4785A] text-white' : 'bg-gray-100 text-[#2D2D2D] hover:bg-gray-200'}`}>{l}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => setInStock(!inStock)} className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${inStock ? 'border-[#C4785A] bg-[#C4785A]/10 text-[#C4785A]' : 'border-gray-200 text-[#5A5A5A] hover:border-gray-300'}`}>✓ In Stock Only</button>
              <Button onClick={() => { clearFilters(); setIsOpen(false); }} variant="outline" className="w-full rounded-full"><X className="w-4 h-4 mr-2" />Clear All Filters</Button>
            </div>
          </SheetContent>
        </Sheet>
        {(search || priceRange[0] > 0 || priceRange[1] < 500 || sortBy !== 'newest' || inStock) && (
          <div className="flex flex-wrap gap-2">
            {search && <span className="px-3 py-1 bg-[#C4785A] text-white text-sm rounded-full flex items-center gap-2">Search: {search}<button onClick={() => setSearch('')}><X className="w-3 h-3" /></button></span>}
            {(priceRange[0] > 0 || priceRange[1] < 500) && <span className="px-3 py-1 bg-[#C4785A] text-white text-sm rounded-full flex items-center gap-2">${priceRange[0]}–${priceRange[1]}<button onClick={() => setPriceRange([0, 500])}><X className="w-3 h-3" /></button></span>}
            {inStock && <span className="px-3 py-1 bg-[#C4785A] text-white text-sm rounded-full flex items-center gap-2">In Stock<button onClick={() => setInStock(false)}><X className="w-3 h-3" /></button></span>}
          </div>
        )}
      </div>
    </div>
  );
}
