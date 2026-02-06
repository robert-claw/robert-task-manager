import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Task Manager - Robert × Leon';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          position: 'relative',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          <div style={{ fontSize: 100 }}>📋</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              fontSize: 64,
              fontWeight: 'bold',
            }}
          >
            <span style={{ color: '#06b6d4' }}>ROBERT</span>
            <span style={{ color: '#64748b' }}>×</span>
            <span style={{ color: '#f97316' }}>LEON</span>
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#94a3b8',
              marginTop: 10,
            }}
          >
            Task Collaboration System
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 24,
            color: '#64748b',
            fontFamily: 'monospace',
          }}
        >
          task-manager.robert-claw.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
