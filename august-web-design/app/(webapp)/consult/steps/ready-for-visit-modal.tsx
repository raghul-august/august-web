'use client';

// Brief "you're ready" confirmation shown on the consult page right after the
// intake questions complete (eligible). Auto-dismisses — no button. Uses the
// same green sparkle badge as the payment-confirmed (SuccessPopup) modal.

export function ReadyForVisitModal() {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ready-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        background: 'rgba(28, 25, 23, 0.15)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '416px',
          maxWidth: '100%',
          padding: '24px',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          borderRadius: '16px',
          background: '#FFF',
          boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        <style>{`
          @keyframes ready-popup-tick-pop {
            0%   { transform: scale(0.4) rotate(-8deg); opacity: 0; }
            60%  { transform: scale(1.1) rotate(2deg);  opacity: 1; }
            100% { transform: scale(1)   rotate(0);     opacity: 1; }
          }
        `}</style>
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
          style={{
            transformOrigin: '50% 50%',
            animation: 'ready-popup-tick-pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
          }}
        >
          <path d="M70.5813 32.1313C69.4031 30.9 68.1844 29.6313 67.725 28.5156C67.3 27.4937 67.275 25.8 67.25 24.1594C67.2031 21.1094 67.1531 17.6531 64.75 15.25C62.3469 12.8469 58.8906 12.7969 55.8406 12.75C54.2 12.725 52.5062 12.7 51.4844 12.275C50.3719 11.8156 49.1 10.5969 47.8687 9.41875C45.7125 7.34687 43.2625 5 40 5C36.7375 5 34.2906 7.34687 32.1313 9.41875C30.9 10.5969 29.6313 11.8156 28.5156 12.275C27.5 12.7 25.8 12.725 24.1594 12.75C21.1094 12.7969 17.6531 12.8469 15.25 15.25C12.8469 17.6531 12.8125 21.1094 12.75 24.1594C12.725 25.8 12.7 27.4937 12.275 28.5156C11.8156 29.6281 10.5969 30.9 9.41875 32.1313C7.34687 34.2875 5 36.7375 5 40C5 43.2625 7.34687 45.7094 9.41875 47.8687C10.5969 49.1 11.8156 50.3688 12.275 51.4844C12.7 52.5062 12.725 54.2 12.75 55.8406C12.7969 58.8906 12.8469 62.3469 15.25 64.75C17.6531 67.1531 21.1094 67.2031 24.1594 67.25C25.8 67.275 27.4937 67.3 28.5156 67.725C29.6281 68.1844 30.9 69.4031 32.1313 70.5813C34.2875 72.6531 36.7375 75 40 75C43.2625 75 45.7094 72.6531 47.8687 70.5813C49.1 69.4031 50.3688 68.1844 51.4844 67.725C52.5062 67.3 54.2 67.275 55.8406 67.25C58.8906 67.2031 62.3469 67.1531 64.75 64.75C67.1531 62.3469 67.2031 58.8906 67.25 55.8406C67.275 54.2 67.3 52.5062 67.725 51.4844C68.1844 50.3719 69.4031 49.1 70.5813 47.8687C72.6531 45.7125 75 43.2625 75 40C75 36.7375 72.6531 34.2906 70.5813 32.1313ZM54.2688 34.2688L36.7688 51.7688C36.5366 52.0012 36.2608 52.1856 35.9574 52.3114C35.6539 52.4372 35.3285 52.502 35 52.502C34.6715 52.502 34.3461 52.4372 34.0426 52.3114C33.7392 52.1856 33.4634 52.0012 33.2312 51.7688L25.7312 44.2688C25.2621 43.7996 24.9986 43.1634 24.9986 42.5C24.9986 41.8366 25.2621 41.2004 25.7312 40.7312C26.2003 40.2621 26.8366 39.9986 27.5 39.9986C28.1634 39.9986 28.7997 40.2621 29.2688 40.7312L35 46.4656L50.7312 30.7312C50.9635 30.499 51.2393 30.3147 51.5428 30.189C51.8462 30.0633 52.1715 29.9986 52.5 29.9986C52.8285 29.9986 53.1538 30.0633 53.4572 30.189C53.7607 30.3147 54.0365 30.499 54.2688 30.7312C54.501 30.9635 54.6853 31.2393 54.811 31.5428C54.9367 31.8462 55.0014 32.1715 55.0014 32.5C55.0014 32.8285 54.9367 33.1538 54.811 33.4572C54.6853 33.7607 54.501 34.0365 54.2688 34.2688Z" fill="#3D8168"/>
        </svg>

        <h2
          id="ready-modal-title"
          style={{
            margin: 0,
            color: '#141515',
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif',
            fontSize: '24px',
            fontWeight: 500,
            lineHeight: '32px',
            letterSpacing: '-0.4px',
          }}
        >
          You&apos;re ready for an online doctor visit
        </h2>
        <p
          style={{
            margin: 0,
            color: '#5A554A',
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            fontWeight: 400,
            lineHeight: '24px',
          }}
        >
          A licensed doctor will receive your intake details.
        </p>
      </div>
    </div>
  );
}
