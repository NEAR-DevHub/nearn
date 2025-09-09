'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type UserSponsor } from '@/interface/userSponsor';
import { useUser } from '@/store/user';
import { cn } from '@/utils/cn';

interface AccountFilterProps {
  userSponsors: UserSponsor[];
  selectedSponsorIds?: string[];
  showTalent: boolean;
  onSelectionChange: (sponsorIds?: string[]) => void;
  onTalentToggle: (show: boolean) => void;
}

export function AccountFilter({
  selectedSponsorIds,
  showTalent,
  onSelectionChange,
  onTalentToggle,
}: AccountFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const userSponsors = user?.UserSponsors || [];

  const allSponsorIds = userSponsors
    .map((us) => us.sponsorId)
    .filter(Boolean) as string[];
  const isAllSponsorsSelected =
    !selectedSponsorIds ||
    (selectedSponsorIds?.length === allSponsorIds.length &&
      allSponsorIds.every((id) => selectedSponsorIds.includes(id)));

  const handleTalentToggle = (checked: boolean) => {
    onTalentToggle(checked);
  };

  const handleSponsorsToggle = (checked: boolean) => {
    if (checked) {
      onSelectionChange(undefined);
    } else {
      // Deselect all sponsor IDs
      onSelectionChange([]);
    }
  };

  const handleSponsorToggle = (sponsorId: string, checked: boolean) => {
    if (checked) {
      const newSelection = [...(selectedSponsorIds || []), sponsorId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange(
        selectedSponsorIds?.filter((id) => id !== sponsorId) || [],
      );
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-1 rounded-b-none border-b px-4 py-3 text-sm font-normal text-slate-500 hover:bg-transparent hover:text-slate-500"
        >
          Accounts
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180',
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[250px] p-1.5 text-slate-600"
      >
        <div className="flex items-center space-x-3 p-1.5">
          <Checkbox
            id="talent-account"
            checked={showTalent}
            onCheckedChange={handleTalentToggle}
          />
          <label
            htmlFor="talent-account"
            className="cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Talent Account
          </label>
        </div>

        {userSponsors.length > 0 && (
          <>
            <div className="flex items-center space-x-3 p-1.5">
              <Checkbox
                id="sponsor-accounts"
                checked={isAllSponsorsSelected}
                onCheckedChange={handleSponsorsToggle}
              />
              <label
                htmlFor="sponsor-accounts"
                className="cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Sponsor Accounts
              </label>
            </div>
            <div className="ml-7 space-y-2">
              {userSponsors.map((userSponsor) => (
                <div
                  key={userSponsor.sponsorId}
                  className="flex items-center space-x-2 p-1.5"
                >
                  <Checkbox
                    id={`sponsor-${userSponsor.sponsorId}`}
                    checked={
                      !selectedSponsorIds ||
                      selectedSponsorIds?.includes(userSponsor.sponsorId || '')
                    }
                    onCheckedChange={(checked) =>
                      handleSponsorToggle(
                        userSponsor.sponsorId || '',
                        checked as boolean,
                      )
                    }
                  />
                  <label
                    htmlFor={`sponsor-${userSponsor.sponsorId}`}
                    className="cursor-pointer text-sm leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {userSponsor.sponsor?.name || 'Unknown Sponsor'}
                  </label>
                </div>
              ))}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
