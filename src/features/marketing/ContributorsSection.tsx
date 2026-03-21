import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef, useCallback } from 'react';
import { getAvatarById } from '../contribution/data/avatars';
import type { User } from '@/types/contribution';
import { cn } from '@/lib/utils';
import { useContribution } from "../contribution/context/ContributionContext";
import { fetchCommunity, fetchSiteData, usePublicSiteData } from "@/lib/site-data";
import communityData from "@/data/community.json";

function ContributorCard({ user }: { user: User }) {
  const avatar = getAvatarById(user.profile?.avatar || '');
  
  return (
    <div className="flex items-center gap-4 bg-card border border-border p-4 min-w-[280px] hover:border-primary/50 transition-colors group">
      <div 
        className="h-12 w-12 rounded-none flex items-center justify-center text-2xl shrink-0"
        style={avatar ? { backgroundColor: avatar.bgColor } : { backgroundColor: 'var(--muted)' }}
      >
        {avatar ? avatar.emoji : (user.profile?.displayName?.charAt(0) || '?')}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-bold text-sm truncate uppercase tracking-tight">
          {user.profile?.displayName || 'Contributor'}
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
            {user.contributionCount.recordings} Voice
          </span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {user.contributionCount.corrections} Edits
          </span>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ items, direction = 'left', duration = 30 }: { items: User[], direction?: 'left' | 'right', duration?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && contentRef.current) {
        setShouldAnimate(contentRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [items]);

  // Triple items for smooth continuous loop
  const marqueeItems = shouldAnimate ? [...items, ...items, ...items] : items;

  return (
    <div ref={containerRef} className="flex w-full overflow-hidden">
      <motion.div 
        ref={contentRef}
        className={cn("flex gap-4 whitespace-nowrap min-w-full", !shouldAnimate && "justify-center")}
        animate={shouldAnimate ? { x: direction === 'left' ? ["0%", "-33.33%"] : ["-33.33%", "0%"] } : {}}
        transition={shouldAnimate ? { duration, repeat: Infinity, ease: "linear" } : {}}
      >
        {marqueeItems.map((user, idx) => (
          <ContributorCard key={`${user.uid}-${direction}-${idx}`} user={user} />
        ))}
      </motion.div>
    </div>
  );
}

export function ContributorsSection() {
  const { t } = useTranslation();
  const { openContributionModal } = useContribution();
  const items = usePublicSiteData(
    communityData as User[],
    useCallback(() => fetchCommunity(30), [])
  );
  const siteData = usePublicSiteData(
    { site_preferences: { showCommunitySection: true } },
    useCallback(() => fetchSiteData(), [])
  );

  if (siteData.site_preferences?.showCommunitySection === false) {
    return null;
  }
  
  return (
    <section className="relative w-full overflow-hidden border-b border-border bg-background py-24 sm:py-32">
      {/* Background Decorative Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none overflow-hidden whitespace-nowrap">
        <span className="text-[20vw] font-black uppercase tracking-tighter">COMMUNITY</span>
      </div>

      <div className="relative z-10 px-6 sm:px-12">
        {/* Header */}
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">
              {t("contributors.eyebrow", { defaultValue: 'OUR COMMUNITY' })}
            </p>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-foreground uppercase leading-none">
              {t("contributors.title", { defaultValue: 'Join the mission to digitize Shikomori' })}
            </h2>
          </div>
          <button 
            onClick={openContributionModal}
            className="h-14 px-8 bg-foreground text-background font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            BECOME A CONTRIBUTOR
          </button>
        </div>

        {/* Marquee Display */}
        <div className="space-y-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          {items.length > 0 ? (
            <>
              <MarqueeRow items={items} direction="left" duration={40} />
              {items.length > 4 && (
                <MarqueeRow items={[...items].reverse()} direction="right" duration={50} />
              )}
            </>
          ) : (
            <div className="h-20 flex items-center justify-center border border-dashed border-border text-muted-foreground uppercase text-xs font-bold tracking-widest animate-pulse">
              Syncing with the community...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
