import React, { useState } from 'react';
import { X, Play, BookOpen, Award, CheckCircle2, Heart } from 'lucide-react';
import { HenIcon } from './FarmIcons';

const STORIES = [
  {
    id: 's1',
    title: 'Morning Harvest at Kalutara Poultry Coop',
    category: 'Farm Story Video',
    duration: '2:15',
    unlockedAt: '3 Orders Completed',
    thumbnail: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
    description: 'See how Farmer Anura feeds our free-range pasture hens organic coconut meal every morning at dawn.',
    quote: '"Happy, free-roaming hens lay eggs with golden yolks rich in Omega-3."',
    author: 'Farmer Anura — Lead Poultry Keeper'
  },
  {
    id: 's2',
    title: 'Traditional Cinnamon Spiced Omelette Recipe',
    category: 'Master Recipe Card',
    duration: 'Read (3 mins)',
    unlockedAt: '5 Orders Completed',
    thumbnail: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    description: 'An authentic Southern Sri Lankan breakfast recipe passed down through three generations of coastal farmers.',
    quote: '"Fresh farm eggs pair best with ground Ceylon cinnamon and caramelized red onions."',
    author: 'Chef Mala — Coastal Kitchen Storyteller'
  }
];

export const FarmStoryModal = ({ isOpen, onClose, totalOrders = 4 }) => {
  const [activeStory, setActiveStory] = useState(STORIES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in-up">
      <div className="bg-[#F6EFE3] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-[#8A6A4B]/20 relative flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left / Top Media Display */}
        <div className="md:w-1/2 relative bg-black flex items-center justify-center overflow-hidden min-h-[220px]">
          <img
            src={activeStory.thumbnail}
            alt={activeStory.title}
            className="w-full h-full object-cover opacity-85 transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#A65D3D] text-white text-[10px] font-bold uppercase tracking-wider rounded-full self-start shadow">
              <Award className="w-3 h-3" /> Unlocked Bonus Content
            </span>

            <div className="text-white">
              {!isPlaying ? (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="w-14 h-14 rounded-full bg-white/25 hover:bg-[#A65D3D] text-white flex items-center justify-center backdrop-blur-sm transition-all duration-300 transform hover:scale-110 mb-3 mx-auto cursor-pointer shadow-lg border border-white/40"
                >
                  <Play className="w-6 h-6 fill-current ml-1" />
                </button>
              ) : (
                <div className="bg-black/80 p-4 rounded-xl text-center text-xs text-emerald-300 border border-emerald-500/30 animate-pop-scale">
                  🎬 Playing exclusive farm documentary clip...
                </div>
              )}
              <h4 className="font-serif text-lg font-bold text-[#F6EFE3] leading-tight">{activeStory.title}</h4>
              <p className="text-xs text-white/70 mt-1">{activeStory.duration}</p>
            </div>
          </div>
        </div>

        {/* Right Story Details & Selector */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#A65D3D] font-bold uppercase tracking-wider mb-2">
              <HenIcon className="w-4 h-4" />
              <span>{activeStory.category}</span>
            </div>

            <h3 className="font-serif text-xl font-bold text-[#2F4B3C] leading-snug mb-3">
              {activeStory.title}
            </h3>

            <p className="text-xs text-gray-700 leading-relaxed mb-4">
              {activeStory.description}
            </p>

            <blockquote className="p-3 bg-[#2F4B3C]/10 rounded-xl border-l-4 border-[#2F4B3C] italic text-xs text-[#2F4B3C] mb-4">
              {activeStory.quote}
              <cite className="block not-italic font-bold text-[10px] uppercase text-[#8A6A4B] mt-1">
                — {activeStory.author}
              </cite>
            </blockquote>
          </div>

          {/* List of Unlockable Content */}
          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
              Your Unlocked Stories
            </h5>
            <div className="space-y-2">
              {STORIES.map((story) => {
                const isSelected = activeStory.id === story.id;
                return (
                  <button
                    key={story.id}
                    onClick={() => {
                      setActiveStory(story);
                      setIsPlaying(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#2F4B3C] bg-white shadow-sm ring-1 ring-[#2F4B3C]/20'
                        : 'border-gray-200 hover:bg-white/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#2F4B3C]/10 text-[#2F4B3C] flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#2F4B3C]">{story.title}</div>
                        <div className="text-[10px] text-gray-500">{story.unlockedAt}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2F4B3C]" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  liked
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:text-rose-600'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current text-rose-600' : ''}`} />
                <span>{liked ? 'Saved to Favorites' : 'Save Story'}</span>
              </button>

              <button
                onClick={onClose}
                className="bg-[#2F4B3C] hover:bg-[#A65D3D] text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                Close Story
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
