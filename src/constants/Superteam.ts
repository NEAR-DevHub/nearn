import { Regions } from '@prisma/client';

interface People {
  name: string;
  pfp: string;
  role?: string;
}

export interface Superteam {
  name: string;
  icons: string;
  banner: string;
  region: Regions;
  displayValue: string;
  country: string[];
  code: string;
  hello: string;
  people?: People[];
}

export const Superteams: Superteam[] = [
  {
    name: 'Superteam India',
    icons: '/assets/superteams/logosindia.jpg',
    banner: '/assets/superteams/banners/India.png',
    region: Regions.INDIA,
    displayValue: 'India',
    country: ['India'],
    code: 'IN',
    hello: 'Namaste',
  },
  {
    name: 'Superteam Germany',
    icons: '/assets/superteams/logosgermany.jpg',
    banner: '/assets/superteams/banners/Germany.png',
    region: Regions.GERMANY,
    displayValue: 'Germany',
    country: ['Germany'],
    code: 'DE',
    hello: 'Hallo',
  },
  {
    name: 'Superteam UK',
    icons: '/assets/superteams/logosuk.png',
    banner: '/assets/superteams/banners/UK.png',
    region: Regions.UK,
    displayValue: 'UK',
    country: ['United Kingdom'],
    code: 'GB',
    hello: 'Hello',
  },
  {
    name: 'Superteam Turkey',
    icons: '/assets/superteams/logosturkey.jpg',
    banner: '/assets/superteams/banners/Turkey.png',
    region: Regions.TURKEY,
    displayValue: 'Turkey',
    country: ['Turkey'],
    code: 'TR',
    hello: 'Merhaba',
  },
  {
    name: 'Superteam Vietnam',
    icons: '/assets/superteams/logosvietnam.png',
    banner: '/assets/superteams/banners/Vietnam.png',
    region: Regions.VIETNAM,
    displayValue: 'Vietnam',
    country: ['Vietnam'],
    code: 'VN',
    hello: 'Xin chào',
  },
  {
    name: 'Superteam UAE',
    icons: '/assets/superteams/logosuae.png',
    banner: '/assets/superteams/banners/UAE.png',
    region: Regions.UAE,
    displayValue: 'UAE',
    country: ['United Arab Emirates'],
    code: 'AE',
    hello: 'Marhaba',
  },
  {
    name: 'Superteam Nigeria',
    icons: '/assets/superteams/logosnigeria.png',
    banner: '/assets/superteams/banners/Nigeria.png',
    region: Regions.NIGERIA,
    displayValue: 'Nigeria',
    country: ['Nigeria'],
    code: 'NG',
    hello: 'Hello',
  },
  {
    name: 'Superteam Brazil',
    icons: '/assets/superteams/logosbrazil.png',
    banner: '/assets/superteams/banners/Brazil.png',
    region: Regions.BRAZIL,
    displayValue: 'Brazil',
    country: ['Brazil'],
    code: 'BR',
    hello: 'Olá',
  },
  {
    name: 'Superteam Malaysia',
    icons: '/assets/superteams/logosmalaysia.jpg',
    banner: '/assets/superteams/banners/Malaysia.png',
    region: Regions.MALAYSIA,
    displayValue: 'Malaysia',
    country: ['Malaysia'],
    code: 'MY',
    hello: 'Salaam',
  },
  {
    name: 'Superteam Balkan',
    icons: '/assets/superteams/logosbalkan.png',
    banner: '/assets/superteams/banners/Balkan.png',
    region: Regions.BALKAN,
    displayValue: 'Balkan',
    country: [
      'Albania',
      'Bosnia and Herzegovina',
      'Bulgaria',
      'Croatia',
      'Kosovo',
      'Montenegro',
      'North Macedonia',
      'Romania',
      'Serbia',
      'Slovenia',
      'Greece',
    ],
    code: 'BALKAN',
    hello: 'Pozdrav',
  },
  {
    name: 'Superteam Philippines',
    icons: '/assets/superteams/logosphilippines.png',
    banner: '/assets/superteams/banners/Philippines.png',
    region: Regions.PHILIPPINES,
    displayValue: 'Philippines',
    country: ['Philippines'],
    code: 'PH',
    hello: 'Kumusta',
  },
  {
    name: 'Superteam Japan',
    icons: '/assets/superteams/logosjapan.png',
    banner: '/assets/superteams/banners/Japan.png',
    region: Regions.JAPAN,
    displayValue: 'Japan',
    country: ['Japan'],
    code: 'JP',
    hello: `Kon'nichiwa`,
  },
  {
    name: 'Superteam France',
    icons: '/assets/superteams/logosfrance.png',
    banner: '/assets/superteams/banners/France.png',
    region: Regions.FRANCE,
    displayValue: 'France',
    country: ['France'],
    code: 'FR',
    hello: `Bonjour`,
  },
  {
    name: 'Superteam Mexico',
    icons: '/assets/superteams/logosmexico.jpg',
    banner: '/assets/superteams/banners/Mexico.png',
    region: Regions.MEXICO,
    displayValue: 'Mexico',
    country: ['Mexico'],
    code: 'MX',
    hello: `Hola`,
  },
  {
    name: 'Superteam Canada',
    icons: '/assets/superteams/logoscanada.png',
    banner: '/assets/superteams/banners/Canada.png',
    region: Regions.CANADA,
    displayValue: 'Canada',
    country: ['Canada'],
    code: 'CA',
    hello: 'Hello',
  },
  {
    name: 'Superteam Singapore',
    icons: '/assets/superteams/logossingapore.png',
    banner: '/assets/superteams/banners/Singapore.png',
    region: Regions.SINGAPORE,
    displayValue: 'Singapore',
    country: ['Singapore'],
    code: 'SG',
    hello: 'Hello',
  },
];

const NonSTRegions = [
  {
    region: Regions.UKRAINE,
    displayValue: 'Ukraine',
    country: ['Ukraine'],
    code: 'UA',
  },
  {
    region: Regions.ARGENTINA,
    displayValue: 'Argentina',
    country: ['Argentina'],
    code: 'AR',
  },
  {
    region: Regions.USA,
    displayValue: 'USA',
    country: ['United States'],
    code: 'US',
  },
  {
    region: Regions.SPAIN,
    displayValue: 'Spain',
    country: ['Spain'],
    code: 'ES',
  },
];

export const CombinedRegions = [...Superteams, ...NonSTRegions];
