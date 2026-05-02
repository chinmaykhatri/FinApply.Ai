'use client';
import { useEffect, useRef, useCallback } from 'react';
import anime from 'animejs';

type AnimeParams = anime.AnimeParams;

export function useAnimeTimeline(params?: anime.AnimeParams) {
  const tlRef = useRef<anime.AnimeTimelineInstance | null>(null);

  const create = useCallback(() => {
    tlRef.current = anime.timeline({
      easing: 'spring(1, 80, 10, 0)',
      duration: 800,
      ...params,
    });
    return tlRef.current;
  }, []);

  useEffect(() => {
    return () => {
      if (tlRef.current) {
        tlRef.current.pause();
      }
    };
  }, []);

  return { create, timeline: tlRef };
}

export function useCountUp(
  target: number,
  duration: number = 2000,
  trigger: boolean = false,
  suffix: string = ''
) {
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!trigger || animated.current || !ref.current) return;
    animated.current = true;

    const obj = { value: 0 };
    anime({
      targets: obj,
      value: target,
      round: 1,
      duration,
      easing: 'easeOutExpo',
      update: () => {
        if (ref.current) {
          ref.current.textContent = `${obj.value}${suffix}`;
        }
      },
    });
  }, [trigger, target, duration, suffix]);

  return ref;
}

export function useScrollReveal(options?: { threshold?: number; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !revealed.current) {
          revealed.current = true;
          el.classList.add('scroll-visible');
          el.classList.remove('scroll-hidden');
          observer.disconnect();
        }
      },
      {
        threshold: options?.threshold ?? 0.2,
        rootMargin: options?.rootMargin ?? '0px',
      }
    );

    el.classList.add('scroll-hidden');
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return ref;
}
