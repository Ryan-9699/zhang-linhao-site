"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { getStoredImageBlob, isStoredImageRef } from "@/lib/imageStore";
import type { ImgHTMLAttributes } from "react";

interface StoredImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height" | "loading"> {
  src?: string;
  fallbackSrc?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
}

export default function StoredImage({
  src,
  fallbackSrc = "",
  alt = "",
  sizes = "720px",
  priority = false,
  quality = 75,
  ...props
}: StoredImageProps) {
  const storedRef = isStoredImageRef(src) ? src : "";
  const [resolvedImage, setResolvedImage] = useState<{ ref: string; url: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    if (!storedRef) {
      return undefined;
    }

    getStoredImageBlob(storedRef)
      .then((blob) => {
        if (cancelled) return;
        if (!blob) return;

        objectUrl = URL.createObjectURL(blob);
        setResolvedImage({ ref: storedRef, url: objectUrl });
      })
      .catch(() => {
        if (!cancelled) setResolvedImage(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [storedRef]);

  const resolvedSrc = storedRef
    ? resolvedImage?.ref === storedRef
      ? resolvedImage.url
      : fallbackSrc
    : src || fallbackSrc;
  void quality;

  if (!resolvedSrc) {
    return <img {...props} src="" alt={alt} sizes={sizes} loading="lazy" decoding="async" />;
  }

  return <img {...props} src={resolvedSrc} alt={alt} sizes={sizes} loading={priority ? "eager" : "lazy"} decoding="async" />;
}
