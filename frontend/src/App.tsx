import { Suspense } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Soundboard } from "./components/Soundboard/Soundboard";
import { useSiteSettings } from "./hooks/useSanityButtons";
import { AudioProvider, useAudioContext } from "./contexts/AudioContext";
import { NowPlaying } from "./components/NowPlaying";
import styles from "./App.module.css";

function Header() {
  const { data: settings } = useSiteSettings();
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {settings?.characterImage?.asset?.url && (
          <div className={styles.avatarWrapper}>
            <img
              src={settings.characterImage.asset.url}
              alt="Nazario del Barrio"
              className={styles.avatar}
              width={80}
              height={80}
            />
            <div className={styles.avatarGlow} aria-hidden="true" />
          </div>
        )}
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            {settings?.title ?? "La Botonera de Nazario"}
          </h1>
          <p className={styles.subtitle}>
            {settings?.description ?? "Los berretines del Titán"}
          </p>
        </div>
        <div className={styles.scanlines} aria-hidden="true" />
      </div>
    </header>
  );
}

function NowPlayingBar() {
  const { stop, currentSlug, isPlaying } = useAudioContext();
  if (!isPlaying || !currentSlug) return null;
  const title = currentSlug.replace(/-/g, " ").toUpperCase();
  return <NowPlaying title={title} onStop={stop} />;
}

function AppContent() {
  return (
    <div className={styles.app}>
      <a href="#main-content" className={styles.skipLink}>
        Saltar al contenido
      </a>
      <Header />
      <main className={styles.main} id="main-content">
        <ErrorBoundary>
          <Suspense fallback={<div className={styles.suspenseFallback} />}>
            <Soundboard />
          </Suspense>
        </ErrorBoundary>
      </main>
      <NowPlayingBar />
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}
