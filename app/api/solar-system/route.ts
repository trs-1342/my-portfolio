import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PlanetKey =
  | 'Mercury'
  | 'Venus'
  | 'Earth'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune';

type PlanetApiResult = {
  key: PlanetKey;
  label: string;
  color: string;
  size: number;
  glow: string;
  description: string;
  x: number;
  y: number;
  z: number;
  distanceFromSunAU: number;
  angleRad: number;
};

const PLANETS: Array<{
  key: PlanetKey;
  label: string;
  command: string;
  color: string;
  size: number;
  glow: string;
  description: string;
}> = [
  {
    key: 'Mercury',
    label: 'Merkür',
    command: '199',
    color: '#a8b0bb',
    size: 6,
    glow: 'rgba(168,176,187,.45)',
    description: 'Güneş’e en yakın gezegen.',
  },
  {
    key: 'Venus',
    label: 'Venüs',
    command: '299',
    color: '#d9b38c',
    size: 8,
    glow: 'rgba(217,179,140,.42)',
    description: 'Yoğun atmosferiyle parlak görünür.',
  },
  {
    key: 'Earth',
    label: 'Dünya',
    command: '399',
    color: '#61b7ff',
    size: 8.5,
    glow: 'rgba(97,183,255,.45)',
    description: 'Yaşam barındırdığı bilinen tek gezegen.',
  },
  {
    key: 'Mars',
    label: 'Mars',
    command: '499',
    color: '#cf6d4f',
    size: 7,
    glow: 'rgba(207,109,79,.4)',
    description: 'Kızıl yüzeyiyle tanınır.',
  },
  {
    key: 'Jupiter',
    label: 'Jüpiter',
    command: '599',
    color: '#d7b18a',
    size: 14,
    glow: 'rgba(215,177,138,.35)',
    description: 'Güneş Sistemi’nin en büyük gezegeni.',
  },
  {
    key: 'Saturn',
    label: 'Satürn',
    command: '699',
    color: '#dbc58d',
    size: 12,
    glow: 'rgba(219,197,141,.3)',
    description: 'Halkalarıyla ayırt edilir.',
  },
  {
    key: 'Uranus',
    label: 'Uranüs',
    command: '799',
    color: '#8ed9e6',
    size: 10,
    glow: 'rgba(142,217,230,.28)',
    description: 'Yan yatmış ekseniyle dikkat çeker.',
  },
  {
    key: 'Neptune',
    label: 'Neptün',
    command: '899',
    color: '#5f87ff',
    size: 10,
    glow: 'rgba(95,135,255,.28)',
    description: 'Derin mavi tonu ve uzaklığıyla öne çıkar.',
  },
];

function extractVectorBlock(result: string) {
  const start = result.indexOf('$$SOE');
  const end = result.indexOf('$$EOE');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Horizons sonuç bloğu bulunamadı.');
  }

  return result.slice(start + 5, end).trim();
}

function parseXYZ(result: string) {
  const block = extractVectorBlock(result);

  const xMatch = block.match(/X\s*=\s*([+\-]?\d+(?:\.\d+)?(?:E[+\-]?\d+)?)/i);
  const yMatch = block.match(/Y\s*=\s*([+\-]?\d+(?:\.\d+)?(?:E[+\-]?\d+)?)/i);
  const zMatch = block.match(/Z\s*=\s*([+\-]?\d+(?:\.\d+)?(?:E[+\-]?\d+)?)/i);

  if (!xMatch || !yMatch || !zMatch) {
    throw new Error('X/Y/Z değerleri parse edilemedi.');
  }

  const x = Number(xMatch[1]);
  const y = Number(yMatch[1]);
  const z = Number(zMatch[1]);

  if ([x, y, z].some(Number.isNaN)) {
    throw new Error('X/Y/Z sayısal değil.');
  }

  return { x, y, z };
}

function buildUrl(command: string, isoUtc: string) {
  const base = 'https://ssd.jpl.nasa.gov/api/horizons.api';

  const params = new URLSearchParams({
    format: 'json',
    COMMAND: `'${command}'`,
    OBJ_DATA: `'NO'`,
    MAKE_EPHEM: `'YES'`,
    EPHEM_TYPE: `'VECTORS'`,
    CENTER: `'500@10'`,        // Sun center
    REF_PLANE: `'ECLIPTIC'`,
    START_TIME: `'${isoUtc}'`,
    STOP_TIME: `'${isoUtc}'`,
    STEP_SIZE: `'1 d'`,
    VEC_TABLE: `'1'`,
    CSV_FORMAT: `'NO'`,
    OUT_UNITS: `'AU-D'`,
    VEC_CORR: `'NONE'`,
    TIME_TYPE: `'TDB'`,
  });

  return `${base}?${params.toString()}`;
}

async function fetchPlanet(planet: (typeof PLANETS)[number], isoUtc: string): Promise<PlanetApiResult> {
  const url = buildUrl(planet.command, isoUtc);

  const res = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'User-Agent': 'portfolio-solar-system-page',
    },
  });

  if (!res.ok) {
    throw new Error(`${planet.label} için JPL isteği başarısız oldu: ${res.status}`);
  }

  const data = await res.json();

  if (!data?.result || typeof data.result !== 'string') {
    throw new Error(`${planet.label} için Horizons sonucu beklenen formatta değil.`);
  }

  const { x, y, z } = parseXYZ(data.result);
  const distanceFromSunAU = Math.sqrt(x * x + y * y + z * z);
  const angleRad = Math.atan2(y, x);

  return {
    key: planet.key,
    label: planet.label,
    color: planet.color,
    size: planet.size,
    glow: planet.glow,
    description: planet.description,
    x,
    y,
    z,
    distanceFromSunAU,
    angleRad,
  };
}

export async function GET() {
  try {
    const now = new Date();
    const isoUtc = now.toISOString().replace(/\.\d{3}Z$/, '');

    // Fair use açısından paraleli düşük tutuyoruz.
    const planets: PlanetApiResult[] = [];
    for (const planet of PLANETS) {
      const item = await fetchPlanet(planet, isoUtc);
      planets.push(item);
    }

    return NextResponse.json(
      {
        ok: true,
        generatedAt: now.toISOString(),
        source: 'NASA/JPL Horizons API',
        planets,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
}
