import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  const fontData = await fetch(
    'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLDz8Z1xlEA.woff2'
  ).then(res => res.arrayBuffer()).catch(() => undefined)

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: '#fff',
          fontFamily: 'Poppins'
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ fontSize: 64, fontWeight: 700 }}>Associação de Porcos</div>
          <div style={{ fontSize: 28, marginTop: 12 }}>Criação Sustentável e Parceria</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData ? [
        {
          name: 'Poppins',
          data: fontData,
          style: 'normal',
          weight: 700
        }
      ] : []
    }
  )
}

