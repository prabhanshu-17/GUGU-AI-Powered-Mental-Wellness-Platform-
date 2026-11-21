import React, { useState } from 'react';
import { Play, BookOpen, Star, Book as BookIcon, Video as VideoIcon } from 'lucide-react';
import { VideoResource, BookResource } from '../types';

const MOCK_VIDEOS: VideoResource[] = [
  { id: '1', title: '5-Minute Morning Meditation', category: 'Meditation', duration: '5:00', thumbnail: 'https://picsum.photos/400/225?random=10', author: 'Gugu Wellness' },
  { id: '2', title: 'Understanding Anxiety Triggers', category: 'Anxiety', duration: '12:30', thumbnail: 'https://picsum.photos/400/225?random=11', author: 'Dr. Smith' },
  { id: '3', title: 'Deep Sleep Music', category: 'Sleep', duration: '60:00', thumbnail: 'https://picsum.photos/400/225?random=12', author: 'Sleep Sound' },
  { id: '4', title: 'Building Resilience', category: 'Motivation', duration: '15:45', thumbnail: 'https://picsum.photos/400/225?random=13', author: 'Ted Talk' },
  { id: '5', title: 'Breathing Exercises for Stress', category: 'Anxiety', duration: '8:20', thumbnail: 'https://picsum.photos/400/225?random=14', author: 'Calm Mind' },
  { id: '6', title: 'Guided Imagery for Peace', category: 'Meditation', duration: '20:00', thumbnail: 'https://picsum.photos/400/225?random=15', author: 'Visual Heal' },
];

const MOCK_BOOKS: BookResource[] = [
  {
    id: '1',
    title: 'The Body Keeps the Score',
    author: 'Bessel van der Kolk',
    category: 'Trauma',
    rating: 4.9,
    cover: 'https://picsum.photos/200/300?random=20',
    description: 'Brain, Mind, and Body in the Healing of Trauma.'
  },
  {
    id: '2',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self-Help',
    rating: 4.8,
    cover: 'https://picsum.photos/200/300?random=21',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.'
  },
  {
    id: '3',
    title: 'Maybe You Should Talk to Someone',
    author: 'Lori Gottlieb',
    category: 'Psychology',
    rating: 4.7,
    cover: 'https://picsum.photos/200/300?random=22',
    description: 'A Therapist, Her Therapist, and Our Lives Revealed.'
  },
  {
    id: '4',
    title: 'Breath: The New Science of a Lost Art',
    author: 'James Nestor',
    category: 'Health',
    rating: 4.6,
    cover: 'https://picsum.photos/200/300?random=23',
    description: 'No matter what you eat, how much you exercise, if you are not breathing correctly, nothing matters.'
  }
];

const CATEGORIES = ['All', 'Meditation', 'Anxiety', 'Sleep', 'Motivation'];

const Videos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'videos' | 'books'>('videos');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredVideos = activeCategory === 'All'
    ? MOCK_VIDEOS
    : MOCK_VIDEOS.filter(v => v.category === activeCategory);

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8 gap-4 sm:gap-6 w-full">
          <div className="max-w-full">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-800 mb-1 sm:mb-2 break-words">Wellness Library</h2>
            <p className="text-sage-400 text-xs sm:text-sm lg:text-base">Curated resources to support your journey.</p>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 md:justify-start w-full flex-wrap">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-base transition-all border-2 whitespace-nowrap ${activeTab === 'videos' ? 'bg-sage-500 text-white border-sage-500 shadow-md' : 'bg-white text-sage-400 border-sage-100 hover:border-sage-300 hover:text-sage-600'}`}
          >
            <VideoIcon size={16} className="sm:w-5 sm:h-5" />
            <span>Videos</span>
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-base transition-all border-2 whitespace-nowrap ${activeTab === 'books' ? 'bg-sage-500 text-white border-sage-500 shadow-md' : 'bg-white text-sage-400 border-sage-100 hover:border-sage-300 hover:text-sage-600'}`}
          >
            <BookIcon size={16} className="sm:w-5 sm:h-5" />
            <span>Books</span>
          </button>
        </div>

        {activeTab === 'videos' && (
          <>
            <div className="w-full flex gap-2 overflow-x-auto pb-4 sm:pb-6 scrollbar-hide mb-6 sm:mb-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border shadow-sm flex-shrink-0 ${activeCategory === cat
                    ? 'bg-sage-100 text-sage-700 border-sage-200'
                    : 'bg-white text-sage-400 border-sage-100 hover:border-sage-300 hover:text-sage-600'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {filteredVideos.map((video) => (
                <div key={video.id} className="group cursor-pointer w-full">
                  <div className="relative rounded-2xl overflow-hidden mb-3 sm:mb-4 aspect-video shadow-sm border border-sage-100 w-full">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-sage-900/20 group-hover:bg-sage-900/10 transition-colors flex items-center justify-center">
                      <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-white/20">
                        <Play size={18} className="sm:w-6 sm:h-6 text-white fill-white ml-1" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[10px] sm:text-[11px] font-mono font-medium text-white shadow-sm">
                      {video.duration}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sage-800 text-base sm:text-lg group-hover:text-sage-600 transition-colors line-clamp-1 mb-1 w-full break-words">{video.title}</h3>
                  <div className="flex items-center justify-between gap-2 w-full min-w-0">
                    <span className="text-xs sm:text-sm font-medium text-sage-400 truncate">{video.author}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sage-600 bg-sage-100 border border-sage-200 px-2 py-1 rounded-md flex-shrink-0">{video.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'books' && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          {MOCK_BOOKS.map((book) => (
            <div key={book.id} className="bg-white border border-sage-100 rounded-3xl p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row gap-4 sm:gap-5 hover:shadow-md hover:border-sage-300 transition-all duration-300 group shadow-sm w-full">
              <div className="w-full sm:w-28 lg:w-32 h-40 sm:h-44 lg:h-48 flex-shrink-0 rounded-xl overflow-hidden shadow-lg border border-sage-100">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex flex-col justify-center min-w-0 w-full">
                <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-sage-500 mb-1.5 sm:mb-2 uppercase tracking-wider bg-sage-50 px-2 py-1 rounded-md w-fit border border-sage-100">{book.category}</span>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-sage-800 mb-0.5 sm:mb-1 group-hover:text-sage-600 transition-colors break-words line-clamp-2">{book.title}</h3>
                <p className="text-xs sm:text-xs lg:text-sm font-medium text-sage-400 mb-2 truncate">by {book.author}</p>
                <div className="flex items-center gap-1.5 mb-2.5 sm:mb-3">
                  <Star size={14} className="sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-warm-400 fill-warm-400 flex-shrink-0" />
                  <span className="text-xs sm:text-xs lg:text-sm text-sage-600 font-bold">{book.rating}</span>
                </div>
                <p className="text-xs sm:text-xs lg:text-sm text-sage-500 mb-3 sm:mb-4 lg:mb-5 line-clamp-2 leading-relaxed">{book.description}</p>
                <button className="flex items-center justify-center gap-2 text-xs sm:text-xs lg:text-sm font-bold text-sage-700 bg-sage-50 border border-sage-200 px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-xl hover:bg-sage-100 hover:text-sage-800 transition-colors w-fit shadow-sm whitespace-nowrap">
                  <BookOpen size={13} className="sm:w-3 sm:h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                  Read Summary
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default Videos;