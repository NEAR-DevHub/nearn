import { Check, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { fiatCurrencies } from '@/constants/fiatCurrencies';
import { cn } from '@/utils/cn';

interface FiatCurrencySelectProps {
  placeholder?: string;
  value?: string;
  onFiatChange?: (e: any) => void;
  triggerClassName?: string;
}

export function FiatCurrencySelect({
  placeholder = 'Select currency...',
  value,
  onFiatChange,
  triggerClassName,
}: FiatCurrencySelectProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn('w-full justify-between', triggerClassName)}
        >
          {value ? (
            <FiatCurrencyLabel code={value} withoutDescription />
          ) : (
            placeholder
          )}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="h-[200px] w-48 p-0">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {fiatCurrencies.map((currency) => (
                <CommandItem
                  value={`${currency.code}-${currency.name}`}
                  key={currency.code}
                  onSelect={() => {
                    onFiatChange?.(currency.code);
                  }}
                  className="flex items-center justify-between"
                >
                  <FiatCurrencyLabel code={currency.code} />
                  <Check
                    className={cn(
                      'ml-auto',
                      currency.code === value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface FiatCurrencyLabelProps {
  code: string;
  withoutDescription?: boolean;
  className?: string;
}

export function FiatCurrencyLabel({
  code,
  withoutDescription = false,
  className,
}: FiatCurrencyLabelProps) {
  const currency = fiatCurrencies.find((c) => c.code === code);
  if (!currency) return null;

  const countryCode = getCountryCode(currency.code);

  return (
    <div className="flex items-center gap-2">
      <span
        className={`fi fi-${countryCode} fis shrink-0 rounded-full`}
        aria-hidden="true"
      />
      <div
        className={cn(
          'flex flex-col items-start text-xs text-slate-600',
          className,
        )}
      >
        <span className="font-medium">{currency.code}</span>
        {!withoutDescription && <span>{currency.name}</span>}
      </div>
    </div>
  );
}

// Map currency codes to country codes for flag-icons
function getCountryCode(currencyCode: string): string {
  const currencyToCountry: Record<string, string> = {
    ALL: 'al',
    DZD: 'dz',
    AOA: 'ao',
    ARS: 'ar',
    AUD: 'au',
    AWG: 'aw',
    AZN: 'az',
    BBD: 'bb',
    BMD: 'bm',
    BHD: 'bh',
    BDT: 'bd',
    BZD: 'bz',
    BOB: 'bo',
    BAM: 'ba',
    BRL: 'br',
    BND: 'bn',
    BGN: 'bg',
    BTN: 'bt',
    BIF: 'bi',
    MMK: 'mm',
    BWP: 'bw',
    KHR: 'kh',
    CVE: 'cv',
    KYD: 'ky',
    CLP: 'cl',
    COP: 'co',
    KMF: 'km',
    CUP: 'cu',
    CAD: 'ca',
    CHF: 'ch',
    CNY: 'cn',
    CZK: 'cz',
    DJF: 'dj',
    DOP: 'do',
    DKK: 'dk',
    ERN: 'er',
    EGP: 'eg',
    ETB: 'et',
    EUR: 'eu',
    FJD: 'fj',
    FKP: 'fk',
    GEL: 'ge',
    GIP: 'gi',
    GTQ: 'gt',
    GBP: 'gb',
    GHS: 'gh',
    GMD: 'gm',
    GNF: 'gn',
    HKD: 'hk',
    HUF: 'hu',
    HNL: 'hn',
    IDR: 'id',
    INR: 'in',
    ISK: 'is',
    ILS: 'il',
    JPY: 'jp',
    JMD: 'jm',
    JOD: 'jo',
    KZT: 'kz',
    KWD: 'kw',
    KGS: 'kg',
    KRW: 'kr',
    KES: 'ke',
    LRD: 'lr',
    MAD: 'ma',
    MGA: 'mg',
    MWK: 'mw',
    MYR: 'my',
    MKD: 'mk',
    MVR: 'mv',
    MXN: 'mx',
    MDL: 'md',
    MOP: 'mo',
    NAD: 'na',
    NPR: 'np',
    NIO: 'ni',
    NZD: 'nz',
    NGN: 'ng',
    NOK: 'no',
    PHP: 'ph',
    PLN: 'pl',
    RON: 'ro',
    RWF: 'rw',
    SEK: 'se',
    SGD: 'sg',
    SSP: 'ss',
    SAR: 'sa',
    TZS: 'tz',
    UAH: 'ua',
    USD: 'us',
    XAF: 'cf', // Central African Republic
    XOF: 'ci', // Ivory Coast (representative for West African CFA)
    ZAR: 'za',
    ZMW: 'zm',
    ZWL: 'zw',
  };

  return currencyToCountry[currencyCode] || 'xx';
}
