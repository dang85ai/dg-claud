"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styles from "./splash.module.css";

const seenKey = "caledon-cinematic-intro-v1";
const reducedMotion = "(prefers-reduced-motion: reduce)";
const splashTimeout = 30_000;
// Source frame 190 at 24 fps is where the ball covers the lens.
const impactTime = 190 / 24;

export function CinematicIntro({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const replay = useRef<HTMLButtonElement>(null);
  const attempt = useRef(0);
  const cleanup = useRef<(() => void) | null>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [linkSelected, setLinkSelected] = useState(false);

  useEffect(() => {
    if (introOpen || linkSelected) return;
    const timer = window.setTimeout(() => router.replace("/home"), splashTimeout);
    return () => window.clearTimeout(timer);
  }, [introOpen, linkSelected, router]);

  function start(manual: boolean) {
    const modal = dialog.current;
    const player = video.current;
    if (!modal || !player || modal.open || typeof modal.showModal !== "function") return;
    if (window.matchMedia(reducedMotion).matches) return;

    const currentAttempt = ++attempt.current;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    let frame = 0;
    let endTimer: number | undefined;
    let transitioning = false;

    function finish(restoreFocus = true) {
      if (attempt.current !== currentAttempt) return;
      attempt.current++;
      cleanup.current = null;
      window.clearTimeout(startTimer);
      window.clearTimeout(deadline);
      window.clearTimeout(endTimer);
      if (frame) player!.cancelVideoFrameCallback(frame);
      player!.onplaying = player!.onended = player!.ontimeupdate = player!.onerror = null;
      player!.pause();
      player!.removeAttribute("src");
      player!.load();
      modal!.close();
      setIntroOpen(false);
      delete modal!.dataset.playing;
      delete modal!.dataset.impact;
      document.body.style.overflow = previousOverflow;
      if (restoreFocus) {
        if (manual) replay.current?.focus({ preventScroll: true });
        else if (previousFocus instanceof HTMLElement && previousFocus !== document.body) previousFocus.focus({ preventScroll: true });
        else document.getElementById("splash-heading")?.focus({ preventScroll: true });
      }
    }

    function impact(time: number) {
      if (time < impactTime || transitioning || attempt.current !== currentAttempt) return;
      transitioning = true;
      modal!.dataset.impact = "true";
      setRevealing(true);
      endTimer = window.setTimeout(() => finish(), 520);
    }

    function trackFrame(_now: number, metadata: VideoFrameCallbackMetadata) {
      impact(metadata.mediaTime);
      if (!transitioning && attempt.current === currentAttempt) frame = player!.requestVideoFrameCallback(trackFrame);
    }

    const startTimer = window.setTimeout(() => finish(), 1800);
    const deadline = window.setTimeout(() => finish(), 10500);
    cleanup.current = () => finish();
    setRevealing(false);
    modal.showModal();
    setIntroOpen(true);
    document.body.style.overflow = "hidden";
    player.onplaying = () => {
      window.clearTimeout(startTimer);
      modal.dataset.playing = "true";
    };
    player.onerror = () => finish();
    player.onended = () => {
      if (!transitioning) finish();
    };
    if (typeof player.requestVideoFrameCallback === "function") {
      frame = player.requestVideoFrameCallback(trackFrame);
    } else {
      player.ontimeupdate = () => impact(player.currentTime);
    }
    player.muted = true;
    player.src = window.matchMedia("(max-aspect-ratio: 3/4)").matches
      ? "/videos/caledon-united-intro-mobile.mp4"
      : "/videos/caledon-united-intro.mp4";
    player.play().catch(() => finish());
  }

  useEffect(() => {
    const preference = window.matchMedia(reducedMotion);
    const updatePreference = () => {
      setMotionAllowed(!preference.matches);
      if (preference.matches) cleanup.current?.();
    };
    updatePreference();
    preference.addEventListener("change", updatePreference);
    const autostart = window.requestAnimationFrame(() => {
      if (preference.matches || window.location.hash || document.activeElement !== document.body) return;
      try {
        if (localStorage.getItem(seenKey)) return;
        localStorage.setItem(seenKey, "1");
      } catch {
        return;
      }
      start(false);
    });

    return () => {
      window.cancelAnimationFrame(autostart);
      preference.removeEventListener("change", updatePreference);
      cleanup.current?.();
    };
  }, []);

  return (
    <>
      <div
        className={styles.landing}
        data-reveal={revealing || undefined}
        onClickCapture={(event) => {
          if (event.target instanceof Element && event.target.closest("a[href]")) {
            setLinkSelected(true);
          }
        }}
      >
        <div className={styles.content}>
          <button
            ref={replay}
            type="button"
            className={styles.replay}
            hidden={!motionAllowed}
            onClick={() => start(true)}
          >
            Replay Intro
          </button>
          {children}
        </div>
      </div>
      <dialog
        ref={dialog}
        className={styles.intro}
        aria-label="Caledon United introduction"
        onCancel={(event) => {
          event.preventDefault();
          cleanup.current?.();
        }}
      >
        <video ref={video} muted playsInline preload="none" aria-hidden="true" />
        <button type="button" className={styles.skip} autoFocus onClick={() => cleanup.current?.()}>
          Skip Intro
        </button>
      </dialog>
    </>
  );
}
