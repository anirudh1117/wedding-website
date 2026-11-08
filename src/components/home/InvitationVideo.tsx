"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { extractGoogleDriveFileId, pickLocalizedText, weddingContent } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";

type InvitationVideoProps = {
  language: AppLanguage;
};

function buildGoogleDrivePreviewUrl(shareUrl: string | null | undefined): string | null {
  if (!shareUrl) {
    return null;
  }

  const fileId = extractGoogleDriveFileId(shareUrl);
  if (!fileId) {
    return null;
  }

  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function InvitationVideo({ language }: InvitationVideoProps) {
  const videoConfig = weddingContent.media.invitationVideo;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoadMedia, setShouldLoadMedia] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const googleDrivePreviewUrl = useMemo(() => {
    if (videoConfig.provider !== "google-drive") {
      return null;
    }

    return buildGoogleDrivePreviewUrl(videoConfig.shareUrl);
  }, [videoConfig]);

  const hasVideoSource = useMemo(() => {
    if (videoConfig.provider === "google-drive") {
      return Boolean(googleDrivePreviewUrl);
    }

    return Boolean(videoConfig.src);
  }, [googleDrivePreviewUrl, videoConfig]);

  if (!hasVideoSource) {
    return (
      <div className="editorial-surface relative overflow-hidden rounded-[1.2rem] border p-5 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(165,138,97,0.16),transparent_48%),radial-gradient(circle_at_88%_14%,rgba(113,61,70,0.13),transparent_44%)]" aria-hidden="true" />
        <div className="relative z-10 text-center">
          <p className="eyebrow">{pickLocalizedText(weddingContent.invitation.eyebrow, language)}</p>
          <h3 className={`mt-3 text-[2rem] leading-[0.98] text-[var(--primary)] sm:text-[2.5rem] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
            {pickLocalizedText(weddingContent.couple.names, language)}
          </h3>
          <p className="mt-4 text-sm text-[var(--muted)] sm:text-base">{pickLocalizedText(weddingContent.wedding.dateDisplay, language)} · {pickLocalizedText(weddingContent.wedding.location, language)}</p>
          <p className={`mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted-strong)] sm:text-base ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
            {pickLocalizedText(weddingContent.labels.videoFallbackText, language)}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[var(--accent)]">{pickLocalizedText(weddingContent.labels.videoFallbackTitle, language)}</p>
        </div>
      </div>
    );
  }

  const shouldRenderGoogleDrivePlayer =
    shouldLoadMedia &&
    videoConfig.provider === "google-drive" &&
    googleDrivePreviewUrl;

  const shouldRenderDirectVideo =
    videoConfig.provider === "direct-mp4" &&
    Boolean(videoConfig.src);

  const handleStart = async () => {
    setShouldLoadMedia(true);

    if (videoConfig.provider !== "direct-mp4") {
      return;
    }

    const element = videoRef.current;
    if (!element) {
      return;
    }

    try {
      await element.play();
      setIsPlaying(true);
      setHasStarted(true);
      setHasEnded(false);
      setHasError(false);
    } catch {
      setHasError(true);
    }
  };

  const pauseVideo = () => {
    const element = videoRef.current;
    if (!element) {
      return;
    }

    element.pause();
    setIsPlaying(false);
  };

  const resumeVideo = async () => {
    if (!shouldLoadMedia) {
      setShouldLoadMedia(true);
      return;
    }

    const element = videoRef.current;
    if (!element) {
      return;
    }

    try {
      await element.play();
      setIsPlaying(true);
      setHasError(false);
    } catch {
      setHasError(true);
    }
  };

  const replayVideo = async () => {
    if (!shouldLoadMedia) {
      setShouldLoadMedia(true);
      return;
    }

    const element = videoRef.current;
    if (!element) {
      return;
    }

    element.currentTime = 0;
    setHasEnded(false);
    await resumeVideo();
  };

  return (
    <div className="editorial-surface overflow-hidden rounded-[1.2rem] border p-2 sm:p-3">
      <div className="relative overflow-hidden rounded-[1rem] bg-[rgba(48,39,37,0.08)]">
        {shouldRenderGoogleDrivePlayer ? (
          <iframe
            src={googleDrivePreviewUrl}
            title={pickLocalizedText(weddingContent.labels.videoFallbackTitle, language)}
            loading="lazy"
            referrerPolicy="no-referrer"
            allow="autoplay; encrypted-media; picture-in-picture"
            className="aspect-[16/10] w-full"
          />
        ) : shouldRenderDirectVideo ? (
          <video
            ref={videoRef}
            className="aspect-[16/10] w-full object-cover"
            poster={videoConfig.poster ?? undefined}
            preload={shouldLoadMedia ? "metadata" : "none"}
            controls={hasStarted}
            playsInline
            muted={false}
            onPlay={() => {
              setIsPlaying(true);
              setHasStarted(true);
              setHasEnded(false);
            }}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setHasEnded(true);
            }}
            onError={() => {
              setHasError(true);
              setIsPlaying(false);
            }}
          >
            <source src={videoConfig.src ?? ""} type="video/mp4" />
          </video>
        ) : null}

        {!shouldLoadMedia ? (
          <div className="relative aspect-[16/10] w-full">
            {videoConfig.poster ? (
              <Image
                src={videoConfig.poster}
                alt={pickLocalizedText(weddingContent.labels.videoFallbackTitle, language)}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 620px"
                priority={false}
              />
            ) : (
              <div className="h-full w-full bg-[linear-gradient(160deg,rgba(113,61,70,0.2),rgba(165,138,97,0.18),rgba(255,252,247,0.96))]" />
            )}
          </div>
        ) : null}

        {!isPlaying && !hasEnded ? (
          <button
            type="button"
            onClick={handleStart}
            className="focus-ring absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full border border-[rgba(255,252,247,0.84)] bg-[rgba(113,61,70,0.86)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--surface)]"
          >
            <Play className="h-3.5 w-3.5" />
            {pickLocalizedText(weddingContent.actions.playInvitationVideo, language)}
          </button>
        ) : null}
      </div>

      {videoConfig.provider === "direct-mp4" ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {isPlaying ? (
            <button type="button" className="btn-secondary focus-ring min-h-[40px] px-3 py-2 text-xs" onClick={pauseVideo}>
              <Pause className="h-3.5 w-3.5" />
              {pickLocalizedText(weddingContent.labels.videoPause, language)}
            </button>
          ) : (
            <button type="button" className="btn-secondary focus-ring min-h-[40px] px-3 py-2 text-xs" onClick={resumeVideo}>
              <Play className="h-3.5 w-3.5" />
              {pickLocalizedText(weddingContent.labels.videoResume, language)}
            </button>
          )}
          <button type="button" className="btn-outline focus-ring min-h-[40px] px-3 py-2 text-xs" onClick={replayVideo}>
            <RotateCcw className="h-3.5 w-3.5" />
            {pickLocalizedText(weddingContent.labels.videoReplay, language)}
          </button>
        </div>
      ) : null}

      {hasError ? <p className="error-text mt-2">{pickLocalizedText(weddingContent.labels.videoUnavailable, language)}</p> : null}
      <p className="mt-3 text-xs text-[var(--muted)]">{pickLocalizedText(weddingContent.labels.videoPrivacyNote, language)}</p>
    </div>
  );
}
